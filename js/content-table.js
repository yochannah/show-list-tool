define(['react', 'q', './mixins', './table-heading', './table-body', './pager'],
    function (React, Q, mixins, TableHeading, TableBody, Pager) {

  'use strict';

  var ContentTable = React.createClass({

    displayName: 'ContentTable',

    getInitialState: function () {
      return {
        offset: 0,
        size: 25,
        items: [],
        allItems: [],
        query: {select: []}
      };
    },

    mixins: [mixins.BuildsQuery, mixins.SetStateProperty, mixins.ComputableState],

    computeState: function (props) {

      var that = this
        , state = this.state
        , type = props.list.type;

      var modelP = props.service.fetchModel();
      var summaryFieldsP = props.service.fetchSummaryFields();

      state.offset = 0;
      state.items = state.allItems.filter(this.rowMatchesFilter(props.filterTerm));
      this.setState(state);

      Q.spread([modelP, summaryFieldsP], this.buildQuery.bind(this, props));

    },
    
    render: function () {
      return React.DOM.div(
          null,
          Pager({
            offset: this.state.offset,
            size: this.state.size,
            length: this.state.items.length,
            selected: this.props.selected,
            onAllSelected: this.props.onItemSelected.bind(null, 'all'),
            back: this._goBack,
            next: this._goNext
          }),
          React.DOM.table(
            {className: 'table table-striped'},
            TableHeading({
              path: this.props.path,
              service: this.props.service,
              view: this.state.query.select,
            }),
            TableBody({
              offset: this.state.offset,
              size: this.state.size,
              rows:       this.state.items,
              view: this.state.query.select,
              filterTerm: this.props.filterTerm,
              selected: this.props.selected,
              onItemSelected: this.props.onItemSelected,
              onCount:    this.setStateProperty.bind(this, 'total')
            })));
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

