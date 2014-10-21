define(function (require, exports, module) {

  'use strict';

  var React  = require('react')
    , _      = require('underscore')
    , Q      = require('q')
    , intermine = require('imjs')
    , mixins = require('../mixins')
    , Caches = require('../query-cache')
    , ObjectView = require('./view')
    , ObjectTitle = require('./title')
    , d = React.DOM;

  var Collection, CollectionRows;
  var ON_ERR = console.error.bind(console);
  var COLLECTION_DISPLAY_THRESHOLD = 10;
  var CHUNK_SIZE = 500;
  var CODES = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  exports.create = Collection = React.createClass({

    displayName: 'Collection',

    getInitialState: function () {
      return {name: '', count: 0, values: [], objs: [], isOpen: false};
    },

    mixins: [mixins.ComputableState],

    computeState: function (props) {
      this.fetchName(props);
      this.fetchCount(props);
    },

    fetchName: function (props) {
      var that = this;

      props.service.fetchModel()
           .then(toPathStr.bind(null, this.path()))
           .then(lastPart)
           .then(setState.bind(this, 'name'), ON_ERR);
    },

    fetchCount: function (props) {
      var that = this
        , query = {select: [this.path() + '.id'], where: {id: props.object.id}}
        , counter = Caches.getCache('count');
            
      props.service.query(query)
           .then(counter.submit.bind(counter))
           .then(setState.bind(this, 'count'), ON_ERR);
    },

    toggle: function () {
      this.setState({isOpen: !this.state.isOpen});
    },

    path: function () {
      return this.props.object.type + '.' + this.props.coll.name;
    },

    render: function () {
      var refs = null, n = this.state.count;
      var buttonCls = this.state.isOpen ? 'fa fa-caret-down' : 'fa fa-caret-right';
      var cssCls = 'reference collection';
      if (this.state.isOpen) cssCls += ' col-sm-12';
      if (n > 0) {
        return d.div(
            {className: cssCls},
            d.h2({className: 'object-title'},
              d.span(
                {
                  className: 'label label-primary object-type',
                  onClick: this.toggle
                },
                d.i({className: buttonCls}),
                n + ' ' + this.state.name)),
            CollectionItems({
              service: this.props.service,
              object: this.props.object,
              coll: this.props.coll,
              path: this.path(),
              isOpen: this.state.isOpen,
              onSelect: this.props.onSelect,
              count: n
            }));
      } else {
        return d.div(null);
      }
    },

  });

  var CollectionItems = React.createClass({

    displayName: 'CollectionItems',

    mixins: [mixins.ComputableState],

    getInitialState: function () {
      return {summaryFields: [], references: [], objs: [], page: 0};
    },

    computeState: function (props) {
      this.fetchType(props);
      this.fetchSummaryFields(props);
    },

    fetchType: function (props) {
      var that = this;
      props.service.fetchModel()
           .then(toReferenceType.bind(null, props.path))
           .then(setState.bind(this, 'type'), ON_ERR);
    },

    fetchSummaryFields: function (props) {
      var getType = props.service.fetchModel().then(toReferenceType.bind(null, props.path));
      var getSFS = props.service.fetchSummaryFields();

      Q.spread([getType, getSFS], function (type, sfs) {
        return sfs[type].map(dehead);
      }).then(setState.bind(this, 'summaryFields'), ON_ERR);
    },

    /**
     * get the objects in this collection
     * We currently fetch all ids and types, and fetch objects on request.
     * This could be made to be lazier if required.
     **/
    fetchObjs: function () {
      var that = this;
      var props = this.props;
      var query = {
        select: [props.path + '.id'],
        where: {id: props.object.id},
        limit: CHUNK_SIZE,
        offset: this.start()
      };

      props.service
           .query(query)
           .then(runQuery)
           .then(setObjs)
           .then(null, ON_ERR);

      function setObjs (records) {
        that.setState({
          objs: records[0][props.coll.name].map(toObj)
        });
      }

    },

    start: function () {
      return (this.state.page * COLLECTION_DISPLAY_THRESHOLD);
    },

    references: function (page) {
      var start = this.start();
      if (start >= this.state.objs.length) {
        // TODO Need more objects. need a better way to do this...
        this.fetchObjs();
      }
      if (page != null) {
        var end = start + COLLECTION_DISPLAY_THRESHOLD;
        return this.state.objs.slice(start, end);
      } else {
        return this.state.objs.slice();
      }
    },

    onChangeSearchTerm: function (event) {
      this.setSearchTermDebounced(event.target.value);
    },

    setSearchTermDebounced: _.debounce(function (searchTerm) {
      this.setState({searchTerm: searchTerm});
    }, 800),

    searchBox: function () {
      return d.form(
          {className: 'pull-right form form-inline'},
          d.div(
            {className: 'form-group'},
            d.input({
              onChange: this.onChangeSearchTerm,
              value: this.state.searchTerm,
              type: 'search',
              refs: 'searchBox',
              className: 'form-control' }))
        );
    },

    renderRows: function (start, size) {
      var props = this.props;
      var query = { // A query for IDs
        select: [props.path + '.id'],
        where: [{path: 'id', op: '=', value: props.object.id}]
      };

      return CollectionRows({
        service: props.service,
        onSelect: props.onSelect,
        filterTerm: this.state.searchTerm,
        object: props.object,
        page: {
          start: start,
          size: size
        },
        type: props.coll.referencedType,
        query: query
      });
    },

    render: function () {
      try {
        if (!this.props.isOpen) {
          return d.div();
        }
        var start = this.state.page;
        return d.div(
            {},
            this.searchBox(),
            this.renderRows(start, COLLECTION_DISPLAY_THRESHOLD),
            this.renderPagination(start));
      } catch (e) {
        console.log(e);
        return d.div({className: 'alert alert-warning'}, e.message);
      }
    },

    goToPage: function (page) {
      this.setState({page: page});
    },

    renderPagination: function (start) {
      var lastPage = this.props.count / COLLECTION_DISPLAY_THRESHOLD;
      var range = _.range(
          Math.max(0, start - 5),
          Math.min(start + 5, lastPage));
      return d.ul({className: 'pagination'},
              d.li(null, d.a(null, '\u00ab')),
              range.map(this.renderPager),
              (lastPage > start + 5 ? d.li(null, d.a(null, '...')) : null),
              d.li(null, d.a(null, '\u00bb')));
    },

    renderPager: function (page, index) {
      var cssClass = (page === this.state.page) ? 'active' : '';
      return d.li({key: page, className: cssClass}, d.a(
            {onClick: this.goToPage.bind(this, page)},
            String(page + 1)));
    }

  });

  CollectionRows = React.createClass({
    displayName: 'CollectionRows',

    mixins: [mixins.ComputableState],

    getInitialState: function () {
      return {show: true, objects: []};
    },

    render: function () {
      if (this.state.show) {
        return d.ul(
          {className: 'collection-items'},
          this.state.objects.map(this.renderReference)
          );
      } else {
        return d.div();
      }
    },

    renderReference: function (obj, index) {
      var link = d.a(
          {className: 'pull-left reference-link'},
          d.i({className: 'fa fa-external-link'})
      );
      return d.li({key: obj.id},
          ObjectTitle({
            service: this.props.service,
            object: obj,
            openable: true,
            toggleDetails: this.props.onSelect.bind(null, obj)
          }));
    },

    // Get the required page of ids.
    computeState: function (props) {
      var that = this;
      var service = props.service;
      var cache = Caches.getCache('rows');
      var runQuery = cache.submit.bind(cache);
      var page = props.page;

      // This belongs in the individual rows.
      var getShowable = Q.when(true);
      if (props.filterTerm != null && props.filterTerm !== '') {
        var matchThis = props.filterTerm.toLowerCase();
        var q = {select: ['*'], from: props.object.type, where: {id: props.object.id}};
        getShowable = service.query(q)
                            .then(runQuery)
                            .then(first)
                            .then(function (row) {
                              var show = false;
                              _.each(row, function (value) {
                                show = (show || (String(value).toLowerCase().indexOf(matchThis) >= 0));
                              });
                              return show;
                            });
        getShowable.then(function (show) {
          that.setState({show: show});
        });
      }

      var requestPage = {offset: 0, limit: CHUNK_SIZE};
      // Find the highest offset before the page start.
      var requestOffset = requestPage.offset;
      while (requestOffset < page.start) {
        requestOffset += CHUNK_SIZE;
        if (requestOffset <= page.start) {
          requestPage.offset = requestOffset;
        }
      }
      // Find the smallest request size which contains the whole page.
      var requestSize = requestPage.limit;
      if (requestSize < page.size) {
        requestSize += CHUNK_SIZE;
        if (requestSize >= page.size) {
          requestPage.limit = requestSize;
        }
      }
      var query = _.extend({}, props.query, requestPage);
      service.query(query)
             .then(runQuery)
             .then(parseResult)
             .then(setObjects)
             .then(null, ON_ERR.bind(null, 'could not fetch objects'));

      function parseResult (rows) {
        var sliceStart = (page.start * COLLECTION_DISPLAY_THRESHOLD) - requestPage.offset;
        var sliceEnd = sliceStart + page.size;
        var requestedIds = rows.slice(sliceStart, sliceEnd).map(first);
        if (requestedIds.length) {
          return fetchObjects(service, props.type, requestedIds);
        } else {
          return [];
        }
      }

      function setObjects (objects) {
        that.setState({objects: objects});
      }

    }

  });

  function getRefs(key) {
    return function (results) {
      return results[0][key];
    };
  }

  function first (things) {
    return things[0];
  }

  function toObj (value) {
    return {type: value['class'], id: value['objectId']};
  }

  function toPathStr (str, model) {
    return model.makePath(str).getDisplayName();
  }

  function toReferenceType (str, model) {
    return model.makePath(str).getType().name;
  }

  function lastPart (str) {
    return str.split(/ > /).pop();
  }

  function setState (key, value) {
    var state = {};
    state[key] = value;
    this.setState(state);
  }

  // Return a promise for the objects for the ids.
  // The primary need for this query is to establish the run-time type
  // of each object. It means a DB round-trip, but heh, reflection is expensive.
  function fetchObjects (service, type, ids) {
    var cache = Caches.getCache('records');
    var runQuery = cache.submit.bind(cache);
    var makeQuery = service.query({
      select: ['id'],
      from: type,
      where: [
        {path: type, op: 'IN', ids: ids}
      ]
    });
    var getIndexedRecords = makeQuery.then(runQuery).then(indexRecords);

    return getIndexedRecords.then(function (mapping) {
      return ids.map(function (id) { return toObj(mapping[id]); });
    });

  }

  function indexRecords (records) {
    return _.indexBy(records, 'objectId');
  }

  function dehead (path) {
    return path.replace(/^[^.]*\./, '');
  }

});
