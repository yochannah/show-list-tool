define(
    ['react', 'q', 'underscore', 'imjs', './mixins', './itemlist', './pager', './query-cache'],
    function (React, Q, _, imjs, mixins, ItemList, Pager, Caches) {

  'use strict';

  var rowCache = Caches.getCache('rows');

  var ListContents = React.createClass({

    displayName: 'ListContents',

    mixins: [mixins.ComputableState, mixins.BuildsQuery],

    getInitialState: function () {
      return {
        items: [],
        allItems: [],
        query: {select: []},
        offset: 0,
        size: 24
      };
    },

    render: function () {
      return React.DOM.div(
        {className: 'list-contents'},
        Pager({
          offset: this.state.offset,
          size: this.state.size,
          length: this.state.items.length,
          selected: this.props.selected,
          onAllSelected: this._onAllSelected,
          back: goBack.bind(this),
          next: goNext.bind(this)
        }),
        ItemList({
          items: this.state.items,
          query: this.state.query,
          type: this.state.type,
          offset: this.state.offset,
          size: this.state.size,
          selected: this.props.selected,
          onItemSelected: this.props.onItemSelected,
          classkeys: this.props.classkeys
        })
      );
    },

    _onAllSelected: function (isSelected) {
      return this.props.onItemSelected('all', isSelected);
    },

    computeState: function (props) {
      var that = this;
      var state = this.state;
      state.offset = 0;
      state.items = state.allItems.filter(this.rowMatchesFilter(props.filterTerm));
      this.setState(state);

      var modelP = props.service.fetchModel();
      var summaryFieldsP = props.service.fetchSummaryFields();

      modelP.then(function (model) {
        var path = model.makePath(props.path);
        var state = that.state;
        state.type = path.getType().name;
        that.setState(state);
      });

      Q.spread([modelP, summaryFieldsP], this.buildQuery.bind(this, props));
    }

  });

  return ListContents;



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
