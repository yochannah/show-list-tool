define(['react'], function (React) {
  'use strict';

  var d = React.DOM;

  return React.createClass({

    displayName: 'SelectInput',

    getDefaultProps: function () {
      return {
        // Simple identity
        formatTitle: function (x) { return x; }
      }
    },
  
    render: function () {
      return d.select(
        {
          className: 'form-control',
          ref: 'formControl',
          value: this.props.options.indexOf(this.props.selected),
          onChange: this._handleChange
        },
        d.option({key: '__dummy__', value: null}, 'None'),
        this.props.options.map(this._renderOption));
    },

    _renderOption: function (option, i) {
      var props = {key: i, value: i};
      return d.option(props, this.props.formatTitle(option));
    },

    _handleChange: function () {
      var item = null;
      var selectedIdx = this.refs.formControl.getDOMNode().selectedIndex;
      if (selectedIdx > 0) { // 0 is dummy.
        item = this.props.options[selectedIdx - 1];
      }
      this.props.onChange(item);
    }

  });

});
