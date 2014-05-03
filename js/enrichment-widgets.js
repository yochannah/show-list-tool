define(['react', 'underscore', './mixins', './enrichment-widget-line'], function (React, _, mixins, EnrichmentWidgetLine) {
  'use strict';

  var d = React.DOM;

  var EnrichmentWidgets = React.createClass({

    displayName: 'EnrichmentWidgets',

    mixins: [mixins.Filtered],

    render: function () {
      return d.ul(
        {className: 'list-group'},
        this.props.widgets
                  .filter(this.matchesFilter)
                  .map(this._renderWidget));
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

      return EnrichmentWidgetLine({
        widget: widget,
        key: widget.name,
        enriching: enriching
      });
    }
  });

  return EnrichmentWidgets;
});
