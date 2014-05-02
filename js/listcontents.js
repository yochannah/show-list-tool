define(
    ['react', 'underscore', './itemlist', './pager'],
    function (React, _, ItemList, Pager) {

  'use strict';

  var IS_BLANK = /^\s+$/;

  var ListContents = React.createClass({
    displayName: 'ListContents',
    getInitialState: function () {
      return {
        items: [],
        allItems: [],
        query: {select: []},
        offset: 0,
        size: 12
      };
    },
    render: function () {
      return React.DOM.div(
        {},
        Pager({
          offset: this.state.offset,
          size: this.state.size,
          length: this.state.items.length,
          back: goBack.bind(this),
          next: goNext.bind(this)
        }),
        ItemList({
          items: this.state.items,
          query: this.state.query,
          offset: this.state.offset,
          size: this.state.size,
          classkeys: this.props.classkeys
        })
      );
    },
    componentWillMount: function () {
      console.log("fetching data");
      this._fetchItems(this.props);
    },
    componentWillReceiveProps: function (nextProps) {
      console.log("Received props", nextProps);
      this._fetchItems(nextProps);
    },
    _fetchItems: function (props) {
      var that = this;
      var state = this.state;
      state.offset = 0;
      state.items = state.allItems.filter(matchesFilterTerm(props.filterTerm));
      this.setState(state);
      props.service.fetchModel().then(function (model) {
        props.service.fetchSummaryFields().then(function (sfs) {
          var fields = sfs[model.makePath(props.path).getType().name];
          console.log('fields', fields);
          var query = {
            select: [props.path + '.id'].concat(fields.map(function (f) { return props.path + f.replace(/^[^.]+/, ''); })),
            where: [{path: props.list.type, op: 'IN', value: props.list.name}],
            joins: {}
          };
          fields.forEach(function (fld) {
            var i, l, fldParts = fld.split('.');
            for (i = 1, l = fldParts.length; i + 1 < l; i++) {
              var joinPath = props.path + '.' + fldParts.slice(1, i + 1).join('.');
              query.joins[joinPath] = 'OUTER';
            }
          });

          if (JSON.stringify(query) !== JSON.stringify(state.query)) {
            props.service.rows(query).then(function setItems (items) {
              var state = that.state;
              state.allItems = items;
              state.items = items.filter(matchesFilterTerm(props.filterTerm));
              state.query = query;
              that.setState(state);
            });
          }
        });
      });
    }

  });

  return ListContents;


  function matchesFilterTerm (filterTerm) {
    if (filterTerm == null || IS_BLANK.test(filterTerm)) {
      return function () { return true; };
    } else {
      filterTerm = filterTerm.toLowerCase();
      return function (item) {
        var i, l, value;
        for (i = 1, l = item.length; i < l; i++) {
          if (item[i]) {
            value = String(item[i]).toLowerCase();
            if (value.indexOf(filterTerm) >= 0) {
              return true;
            }
          }
        }
        return false;
      };
    }
  }

  function goBack () {
    var state = this.state;
    state.offset = Math.max(0, state.offset - state.size);
    this.setState(state);
  }

  function goNext () {
    var state = this.state;
    var nextOffset = state.offset + state.size;
    if (nextOffset < state.items.length) {
      state.offset = nextOffset;
      this.setState(state);
    }
  }

  function fillItems (items) {
    var state = this.state;
    state.items = items;
    this.setState(state);
  }
});
