define([
    'react',
    'underscore',
    './mixins',
    './enrichment-widget-line',
    './sorry',
    './loading'],
    function (React, _, mixins, EnrichmentWidgetLine, sorry, loading) {

  'use strict';

  var d = React.DOM;

  var EnrichmentWidgets = React.createClass({

    displayName: 'EnrichmentWidgets',

    mixins: [mixins.Filtered],

    render: function () {
      var widgets = (this.props.widgets || [])
                        .filter(this.matchesFilter)
                        .map(this._renderWidget);

      if (widgets.length) {
        return d.ul({className: 'list-group'}, widgets);
      } else if (this.props.widgets) {
        if (this.props.widgets.length) {
          return sorry("no enrichment calculations matched your filter terms.");
        } else {
          return sorry("no suitable enrichment calculations found");
        }
      } else {
        return loading();
      }
    },

    _calculateEnrichment: _.memoize(function (list, args) {
      return list.enrichment(args);
    }, function (list, args) {
      return list.name + ':' + JSON.stringify(args);
    }),

    _renderWidget: function (widget, i) {
      var props = this.props;
      var enriching = this._calculateEnrichment(
        props.list,
        {
          widget: widget.name,
          maxp: props.maxp,
          correction: props.correction,
          population: props.backgroundPopulation
        }
      );

      return React.createElement(EnrichmentWidgetLine,{
        widget: widget,
        key: widget.name,
        enriching: enriching,
        wantsEnrichment: this.props.wantsEnrichment
      });
    }

  });

  return EnrichmentWidgets;
});
