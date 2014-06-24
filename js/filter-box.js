define(['react'], function (React) {
  'use strict';

  var FilterBox = React.createClass({

    displayName: 'FilterBox',

    render: function () {
      return React.DOM.div(
        {className: 'input-group ' + this.props.className},
        React.DOM.span(
          {className: 'input-group-addon'},
          'Filter'),
        React.DOM.input(
          {className: 'form-control', type: 'text', ref: 'filterInput', onChange: this._handleFilterChange}),
        React.DOM.span(
          {className: 'input-group-btn'},
          React.DOM.button(
            {className: 'btn btn-default', onClick: this._clearFilter},
            React.DOM.i({className: 'fa fa-times'}))));
    },

    _clearFilter: function () {
      this.refs.filterInput.getDOMNode().value = null;
      this.props.onChange(null);
    },

    _handleFilterChange: function () {
      var value = this.refs.filterInput.getDOMNode().value;
      this.props.onChange(value);
    }
  });

  return FilterBox;
});
