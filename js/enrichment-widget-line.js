define(['react', './mixins', './formatting'], function (React, mixins, formatting) {
  'use strict';

  var d = React.DOM;
  var formatNumber = formatting.formatNumber;

  var EnrichmentWidgetLine = React.createClass({

    displayName: 'EnrichmentWidgetLine',

    getInitialState: function () {
      return {};
    },

    mixins: [mixins.SetStateProperty, mixins.ComputableState],

    render: function () {
      var category = this._getCategory();
      return d.li(
        {className: 'widget-line list-group-item' + category},
        d.span(
          {className: 'pull-right badge'},
          (this.state.results ? formatNumber(this.state.results.length) : 'enriching')),
        d.a(
          {onClick: this._handleClick},
          this.props.widget.title),
        d.p(
          {className: 'description'},
          d.small(null, this.props.widget.description)));

    },

    _getCategory: function () {
      if (this.state.results) {
        if (this.state.results.length) {
          return ' list-group-item-success';
        } else {
          return ' no-results';
        }
      }
      return '';
    },

    _handleClick: function () {
      this.props.wantsEnrichment(this.props.widget.name);
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
