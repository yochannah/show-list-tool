define([
    'react',
    'q',
    './mixins',
    './query-cache',
    './table-heading',
    './table-body',
    './pager',
    './sorry',
    './loading'],
    function (React, Q, mixins, Caches, TableHeading, TableBody, Pager, sorry, loading) {

  'use strict';

  var ContentTable = React.createClass({

    displayName: 'ContentTable',

    getInitialState: function () {
      return {
        offset: 0,
        size: 25,
        sortColumn: 0,
        sortASC: true,
        query: {select: []}
      };
    },

    mixins: [mixins.BuildsQuery, mixins.SetStateProperty, mixins.ComputableState],

    computeState: function (props) {

      var that = this
        , state = this.state
        , rowCache = Caches.getCache('rows')
        , type = props.list.type;

      var modelP = props.service.fetchModel();
      var summaryFieldsP = props.service.fetchSummaryFields();

      state.offset = 0;
      if (state.allItems) {
        state.items = state.allItems.filter(this.rowMatchesFilter(props.filterTerm));
      }
      this.setState(state);

      Q.spread([modelP, summaryFieldsP], this.buildQuery.bind(this, rowCache, props));

    },

    render: function () {
      var content;
      if (this.state.items && this.state.items.length) {
        content = React.DOM.table(
            {className: 'table table-striped'},
            React.createElement(TableHeading,{
              path: this.props.path,
              service: this.props.service,
              view: this.state.query.select,
              sortColumn: this.state.sortColumn,
              sortASC: this.state.sortASC,
              onSort: this._setSort
            }),
            React.createElement(TableBody,{
              offset: this.state.offset,
              size: this.state.size,
              rows:       this.state.items,
              sortColumn: this.state.sortColumn,
              sortASC: this.state.sortASC,
              view: this.state.query.select,
              filterTerm: this.props.filterTerm,
              selected: this.props.selected,
              onItemSelected: this.props.onItemSelected,
              onCount:    this.setStateProperty.bind(this, 'total')
            }));
      } else if (this.state.items) {
        content = sorry("no items matched your filter terms");
      } else {
        content = loading();
      }

      return React.DOM.div(
          null,
          React.createElement(Pager,{
            offset: this.state.offset,
            size: this.state.size,
            length: (this.state.items && this.state.items.length),
            selected: this.props.selected,
            onAllSelected: this.props.onItemSelected.bind(null, 'all'),
            back: this._goBack,
            next: this._goNext
          }),
          content);
    },

    /**
     * Handle events from the column headers changing the sort order.
     */
    _setSort: function (column, direction) {
      var state = this.state;
      state.sortColumn = column;
      state.sortASC = direction;
      this.setState(state);
    },

    _goBack: function () {
      this.setStateProperty('offset', Math.max(0, this.state.offset - this.state.size));
    },

    _goNext: function () {
      var next = this.state.offset + this.state.size;
      var total = this.state.items.length;
      if (next < total) {
        this.setStateProperty('offset', next);
      }
    }

  });

  return ContentTable;
});
