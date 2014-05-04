define(['react',
    'q',
    'underscore',
    './mixins',
    './predicates',
    './enrichment-widgets'],
    function (React, Q, _, mixins, predicates, EnrichmentWidgets) {
  'use strict';

  var d = React.DOM;
  var isGraphWidget = predicates.eq('widgetType', 'chart');

  var VisualisationTab = React.createClass({

    displayName: 'VisualisationTab',

    mixins: [
      mixins.Filtered,
      mixins.SetStateProperty,
      mixins.ComputableState
    ],

    getInitialState: function init () {
      return {
        widgets: []
      };
    },

    render: function render () {
      return d.ul(
        {className: 'list-group'},
        this.state.widgets
                  .filter(this.matchesFilter)
                  .map(this._renderWidget));
    },

    _renderWidget: function (widget, i) {
      return d.li(
          {className: 'list-group-item', key: i},
          d.a(
            {onClick: this._handleChoice.bind(this, widget)},
            widget.title),
          d.p(
            {className: 'description'},
            d.small(null, widget.description)));
    },

    _handleChoice: function (widget) {
      this.props.onChoice(widget);
    },

    computeState: function (props) {
      var that = this;

      props.widgetPromise.then(function (widgets) {
        var graphWidgets = widgets.filter(isGraphWidget);
        that.setStateProperty('widgets', graphWidgets);
      });

    }
  });

  return VisualisationTab;
});
