define(['react', './mixins', './enrichment-widget-line'], function (React, mixins, EnrichmentWidgetLine) {
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

    _renderWidget: function (widget, i) {
      return EnrichmentWidgetLine({
        widget: widget,
        key: widget.name,
        service: this.props.service,
        list: this.props.list,
        correction: this.props.correction,
        maxp: this.props.maxp,
        backgroundPopulation: this.props.backgroundPopulation
      });
    }
  });

  return EnrichmentWidgets;
});
