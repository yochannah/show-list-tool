define(function (require, exports, module) {

  var React  = require('react')
    , _      = require('underscore')
    , intermine = require('imjs')
    , mixins = require('./mixins')
    , Caches = require('./query-cache')
    , d = React.DOM;

  var ObjectView;

  var EMPTY_TABLE = {attributes: {}, references: {}, collections: {}};
  
  module.exports = ObjectView = React.createClass({

    displayName: 'ObjectView',

    mixins: [mixins.SetStateProperty, mixins.ComputableState],

    getInitialState: function () {
      return {
        detailLevel: 'summary',
        typeLabel: this.props.object['class'][0],
        object: this.props.object,
        tables: {},
        pks: [],
        isOpen: {},
        objects: {}
      };
    },

    renderDetailLevelButton: function (level, label) {
      var that = this, currentLevel = this.state.detailLevel;
      return d.button(
          {
            type: 'button',
            className: ('btn btn-default btn-sm' + ((currentLevel === level) ? ' active' : '')),
            onClick: this.setDetailLevel.bind(this, level)
          },
          label);
    },

    setDetailLevel: function (level) {
      this.setState({detailLevel: level});
      if (level === 'full') {
        this.fetchFullObject();
      } else {
        this.setState({object: this.props.object});
      }
    },

    render: function () {
      var that = this;
      var path = this.props.path;
      var item = this.state.object;
      var table = this.getTable(item);
      var detailLevels = d.div(
        {className: 'pull-right btn-group'},
        this.renderDetailLevelButton('summary', 'Summary'),
        this.renderDetailLevelButton('full', 'Full'));
      var heading = d.h2(
        {className: 'item-heading'},
        d.span({
          className: 'label label-primary object-type',
          onMouseEnter: this.setStateProperty.bind(this, 'typeLabel', item['class']),
          onMouseOut: this.setStateProperty.bind(this, 'typeLabel', item['class'][0])
        }, this.state.typeLabel),
        this.getHeading(item));
      
      return d.li({key: item.objectId}, detailLevels, heading, this.renderDetails(path, table, item));
    },

    getTable: function (object) {
      return (this.state.tables[object['class']] || EMPTY_TABLE);
    },

    renderDetails: function (path, table, item) {
      var that = this;
      var btnClass = 'btn btn-default btn-xs';
      var hasValue = function (name) { return item[name] != null; };

      var attrs = _.keys(table.attributes)
                  .filter(hasValue)
                  .map(function (name) {
        return d.span({className: 'field attr', key: name},
          d.strong({className: 'field-name'}, name),
          that.renderAttribute(item[name]));
      });

      var refs = _.keys(table.references)
                  .filter(hasValue)
                  .map(function (name) {
        var refPath = path + '.' + name;
        var isOpen = that.state.isOpen[refPath];
        var icon = isOpen ? 'fa-caret-down' : 'fa-caret-right';
        return d.span({className: 'field ref', key: name},
          d.button(
            {
              onClick: that.togglePathState.bind(that, refPath, false),
              className: btnClass + ' field-name' + (isOpen ? ' active' : '')
            },
            d.i({className: 'fa ' + icon}),
            ' ', name),
          that.renderReference(refPath, item[name]));
      });

      var colls = _.keys(table.collections)
                   .filter(hasValue)
                   .map(function (name) {
        var colPath = path + '.' + name;
        var isOpen = that.state.isOpen[colPath];
        var icon = isOpen ? 'fa-caret-down' : 'fa-caret-right';
        return d.span({className: 'field coll', key: name},
          d.button(
            {
              onClick: that.togglePathState.bind(that, colPath, true),
              className: btnClass + ' field-name' + (isOpen ? ' active' : '')
            },
            d.i({className: 'fa ' + icon}),
            ' ', item[name].length, ' ', name),
          that.renderCollection(colPath, item[name]));
      });

      var details = d.div(
        {key: item.objectId, className: 'item-details'},
        [].concat(attrs)
          .concat(refs)
          .concat(colls), d.div({style: {clear: 'both'}}));
      return details;
    },

    renderAttribute: function (value) {
      return d.span({className: 'field-value'}, value);
    },

    renderReference: function (path, obj) {
      var isOpen = this.state.isOpen[path];
      if (isOpen) {
        var ref = this.state.objects[obj.objectId];
        if (ref == null) {
          return null;
        }
        var table = this.getTable(ref);
        return this.renderDetails(path, table, ref);
      } else {
        return d.span({className: 'field-value'}, this.getHeading(obj));
      }
    },

    renderCollection: function (path, objs) {
      var that = this;
      var isOpen = this.state.isOpen[path];
      if (isOpen) {
        objs = _.compact(objs.map(function (o) { return that.state.objects[o.objectId]; }));
        return d.div(
            {className: 'collection'},
            objs.map(function (ref) {
              var table = that.getTable(ref);
              return that.renderDetails(path, table, ref);
            }));
      } else {
        return null;
      }
    },

    togglePathState: function (path, isCollection) {
      var pathStates = this.state.isOpen;
      var isOpen = !pathStates[path];
      pathStates[path] = isOpen;
      this.setState({isOpen: pathStates});
      if (isOpen) {
        if (isCollection) {
          this.fetchCollection(path);
        } else {
          this.fetchReference(path);
        }
      }
    },

    fetchCollection: function (path) {
      var that = this;
      var service = this.props.service;
      var executor = Caches.getCache('records');
      var object = this.state.object;

      service.query({from: object['class'], select: [path + '.**'], where: {id: object.objectId}})
             .then(intermine.utils.dejoin)
             .then(executor.submit.bind(executor))
             .then(storeCollection)
             .then(null, console.error.bind(console, 'Error fetching collection'));

      function storeCollection (root) {
        var coll = resolve(root[0], path);
        var objs = that.state.objects;
        coll.forEach(function (r) {
          objs[r.objectId] = r;
        });
        that.setState({objects: objs});
      }
    },

    fetchReference: function (path) {
      var that = this;
      var service = this.props.service;
      var executor = Caches.getCache('records');
      var object = this.state.object;

      service.fetchModel()
              .then(getType.bind(null, path))
              .then(getReference)
              .then(storeReference, console.error.bind(console, 'Error fetching reference'));

      function getReference (table) {
        return service.query({from: table.name, select: ['**'], where: {id: resolve(object, path).objectId}})
               .then(addAllReferences)
               .then(intermine.utils.dejoin)
               .then(executor.submit.bind(executor))
               .then(function (results) { return results[0]; });
      }
      function storeReference (r) {
        var objs = that.state.objects;
        objs[r.objectId] = r;
        update(object, path, r);
        that.setState({objects: objs});
      }
    },

    getHeading: function (item) {
      var pks = (this.state.pks[item['class']] || []);
      var f = _.compose(_.uniq, _.compact);
      return f(pks.map(function (pk) { return resolve(item, pk); })).join(' ');
    },

    computeState: function (props) {
      var that = this;

      props.service.fetchModel().then(function (model) {
        that.setState({tables: model.classes});
      });
      props.service.fetchClassKeys().then(function (classes) {
        that.setState({pks: classes});
      });
    },

    fetchFullObject: function () {
      var props = this.props;
      var that = this;
      var cache = Caches.getCache('records');
      props.service.query({from: props.object['class'], select: ['**'], where: {id: props.object.objectId}})
        .then(addAllReferencesAndCollections)
        .then(intermine.utils.dejoin)
        .then(cache.submit.bind(cache))
        .then(function (found) {that.setState({object: found[0]}); })
        .then(null, console.error.bind(console, 'Error fetching object ' + props.object.objectId));
    }
  });

  function getType (path, model) {
    return model.makePath(path).getEndClass();
  }

  function resolve (item, path) {
    var parts = path.split('.').slice(1);
    return parts.reduce(getProp, item);
  }

  function update (item, path, o) {
    var parts = path.split('.').slice(1);
    var last = parts.pop();
    parts.reduce(getProp, item)[last] = o;
  }

  function getProp (o, prop) {
    return o[prop];
  }

  function addAllReferences (query) {
    var table = query.makePath(query.root).getEndClass();
    _.each(table.references, function (field, name) {
      try {
        query.addToSelect(name + '.id');
      } catch (e) {
        // ignore.
      }
    });
    return query;
  }

  function addAllReferencesAndCollections (query) {
    var table = query.makePath(query.root).getEndClass();
    _.each([table.references, table.collections], function (fields) {
      _.each(fields, function (field, name) {
        try {
          query.addToSelect(name + '.id');
        } catch (e) {
          // ignore.
        }
      });
    });
    return query;
  }
});
