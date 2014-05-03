define(['react', './mixins'], function (React, mixins) {
  'use strict';

  var d = React.DOM;

  var EnrichmentWidgetLine = React.createClass({

    displayName: 'EnrichmentWidgetLine',

    getInitialState: function () {
      return {};
    },

    mixins: [mixins.SetStateProperty, mixins.ComputableState],

    render: function () {
      var category = (this.state.results && this.state.results.length) ? ' list-group-item-success' : '';
      return d.li(
        {className: 'widget-line list-group-item' + category},
        d.span(
          {className: 'pull-right badge'},
          (this.state.results ? this.state.results.length : 'enriching')),
        d.a(
          {onClick: this._handleClick},
          this.props.widget.title),
        d.p(
          {className: 'description'},
          d.small(null, this.props.widget.description)));

    },

    _handleClick: function () {
      //TODO
    },

    computeState: function (props) {
      var that = this;
      props.enriching.then(function (results) {
        that.setStateProperty('results', results);
      });
    }

  });

  return EnrichmentWidgetLine;
});
