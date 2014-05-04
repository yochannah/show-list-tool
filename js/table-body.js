define(['react', 'q', 'imjs', './predicates', './query-cache', './mixins'],
    function (React, Q, imjs, predicates, Caches, mixins) {
  'use strict';

  var d = React.DOM;
  var IS_BLANK
  var tableCache = Caches.getCache('rows');

  var TableBody = React.createClass({

    displayName: 'TableBody',

    mixins: [mixins.ComputableState, mixins.SetStateProperty],

    getInitialState: function () {
      return {rows: []};
    },

    computeState: function (props) {
      var that = this;

      if (props.query.select.length) {
        props.service.fetchModel().then(function (model) {
          var query = new imjs.Query(props.query, props.service);
          query.model = model;

          tableCache.submit(query).then(setRows);
        });
      }

      function setRows (rows) {
        var filtered = rows.filter(matchesFilterTerm(props.filterTerm));
        var state = that.state;
        state.allRows = rows;
        state.rows = filtered;
        that.setState(state);
        that.props.onCount(filtered.length);
      }

    },

    render: function () {
      var rows = this.state.rows
        , end = Math.min(rows.length, this.props.offset + this.props.size);

      return d.tbody(
        null,
        this.state.rows.slice(this.props.offset, end).map(this._renderRow));
    },

    _renderRow: function (row, i) {
      return d.tr({key: i}, row.map(this._renderCell));
    },

    _renderCell: function (cell, i) {
      return d.td({key: i}, cell);
    }

  });

  return TableBody;

  function matchesFilterTerm (filterTerm) {
    if (filterTerm == null || predicates.isBlank(filterTerm)) {
      return function () { return true; };
    } else {
      filterTerm = filterTerm.toLowerCase();
      return function (row) {
        var i, l, value;
        for (i = 0, l = row.length; i < l; i++) {
          if (row[i]) {
            value = String(row[i]).toLowerCase();
            if (value.indexOf(filterTerm) >= 0) {
              return true;
            }
          }
        }
        return false;
      };
    }
  }
});
