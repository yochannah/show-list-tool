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
        rows: []
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
      try {
      var rows = (this.props.rows || this.state.rows)
        , end = Math.min(rows.length, this.props.offset + this.props.size);

      return d.tbody(
        null,
        rows.slice(this.props.offset, end).map(this._renderRow));
      } catch (e) {
        console.error(e);
        return d.div({className: 'alert alert-danger'}, String(e));
      }
      
    },

    _renderRow: function (row, i) {
      // cell 0 is the id - don't show that.
      var id = row[0];
      var selectRow = this.props.onItemSelected.bind(null, id, !this.props.selected[id]);
      var isSelected = this.props.selected.all || this.props.selected[id];
      return d.tr({key: i, onClick: selectRow},
          d.td(
            {className: 'row-selector'},
            d.form(
              {className: 'form-inline'},
              d.input({
                className: 'form-control',
                type: 'checkbox',
                readOnly: true,
                checked: isSelected
              }))),
          row.slice(1).map(this._renderCell));
    },

    _renderCell: function (cell, i) {
      var view, fieldName, value;
      if (this.props.view) {
        view = this.props.view[i + 1];
        fieldName = view.split('.').pop().toLowerCase();
      }
      if (fieldName === 'url') {
        value = d.a({href: cell}, cell);
      } else {
        value = cell;
      }
      return d.td({key: i}, value);
    }

  });

  return TableBody;

});
