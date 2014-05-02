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
          {className: 'form-control', type: 'text', ref: 'filterInput', onChange: this._handleFilterChange}))
    },

    _handleFilterChange: function () {
      var value = this.refs.filterInput.getDOMNode().value;
      this.props.onChange(value);
    }
  });

  return FilterBox;
});
