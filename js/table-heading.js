define(['react', 'q', './strings', './mixins'],
    function (React, Q, strings, mixins) {
  'use strict';

  var d = React.DOM;

  var TableHeading = React.createClass({

    displayName: 'TableHeading',

    mixins: [mixins.SetStateProperty, mixins.ComputableState],

    getInitialState: function () {
      return {
        headers: []
      }
    },

    getDefaultProps: function () {
      return {
        onSort: function () {}
      };
    },

    computeState: function (props) {
      var setHeaders = this.setStateProperty.bind(this, 'headers')
        // the first view is the id. Don't show that.
        , columns = props.view.slice(1);

      props.service.fetchModel().then(function (model) {
        var namings = columns.map(bename.bind(null, model));
        Q.all(namings).then(trimStart).then(setHeaders);
      });

    },

    render: function () {
      var col0;
      if ('allSelected' in this.props) {
        col0 = d.input({
          type: 'checkbox',
          className: 'form-control',
          onChange: this._toggleAll,
          checked: this.props.allSelected
        });
      }
      return d.thead(
        null,
        d.tr(
          null,
          d.th(null, col0),
          this.state.headers.map(this._renderHeader)));
    },

    _toggleAll: function () {
      var state = this.state;
      state.allSelected = !state.allSelected;
      this.setState(state);
      this.props.onChangeAll(state.allSelected);
    },

    _renderHeader: function (columnName, i) {
      var props = this.props
        , nextIsAsc = props.sortColumn !== i || !props.sortASC;
      return d.th(
          {
            key: i,
            className: 'sortable',
            onClick: props.onSort.bind(null, i, nextIsAsc)
          },
          d.i(
            {className: 'fa fa-sort' + this._sortClass(i)}),
          ' ',
          columnName);
    },

    _sortClass: function (columnIndex) {
      if (columnIndex !== this.props.sortColumn) return '';
      return this.props.sortASC ? '-asc' : '-desc';
    }

  });

  return TableHeading;

  function bename (model, path) {
    return model.makePath(path).getDisplayName();
  }

  function trimStart (names) {
    var lcp = strings.longestCommonPrefix(names);
    return names.map(function (name) {
      return name.slice(lcp.length);
    });
  }

});
