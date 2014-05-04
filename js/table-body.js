define(['react', 'q', 'imjs', './predicates', './query-cache', './mixins'],
    function (React, Q, imjs, predicates, Caches, mixins) {
  'use strict';

  var d = React.DOM;
  var tableCache = Caches.getCache('rows');

  var TableBody = React.createClass({

    displayName: 'TableBody',

    mixins: [mixins.BuildsQuery, mixins.ComputableState, mixins.SetStateProperty],

    getInitialState: function () {
      return {
        rows: [],
        selected: {}
      };
    },

    computeState: function (props) {
      var that = this;

      if (props.query && props.query.select.length) {
        props.service.fetchModel().then(function (model) {
          var query = new imjs.Query(props.query, props.service);
          query.model = model;

          tableCache.submit(query).then(setRows);
        });
      }

      function setRows (rows) {
        var filtered = rows.filter(that.rowMatchesFilter(props.filterTerm));
        var state = that.state;
        state.allRows = rows;
        state.rows = filtered;
        that.setState(state);
        that.props.onCount(filtered.length);
      }

    },

    render: function () {
      var rows = (this.props.rows || this.state.rows)
        , end = Math.min(rows.length, this.props.offset + this.props.size);

      return d.tbody(
        null,
        rows.slice(this.props.offset, end).map(this._renderRow));
    },

    _renderRow: function (row, i) {
      // cell 0 is the id - don't show that.
      var selectRow = this._handleRowSelection.bind(this, row);
      return d.tr({key: i, onClick: selectRow},
          d.td(
            {className: 'row-selector'},
            d.input({
              className: 'form-control',
              type: 'checkbox',
              checked: !!(this.props.allSelected || this.state.selected[row[0]])
            })),
          row.slice(1).map(this._renderCell));
    },

    _handleRowSelection: function (row) {
      var state = this.state;
      var id = row[0];
      state.selected[id] = !state.selected[id];
      this.setState(state);
    },

    _renderCell: function (cell, i) {
      return d.td({key: i}, cell);
    }

  });

  return TableBody;

});
