define(['react',
    'q',
    'underscore',
    './mixins',
    './predicates',
    './sorry'],
    function (React, Q, _, mixins, predicates, sorry) {
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
      var widgets = this.state
                        .widgets.filter(this.matchesFilter)
                        .map(this._renderWidget);


      if (widgets.length) {
        return d.ul({className: 'list-group'}, widgets);
      } else if (this.state.widgets.length) {
        return sorry("no visualization tools matched your filter terms.");
      } else {
        return sorry("no visualization tools calculations found");
      }
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
