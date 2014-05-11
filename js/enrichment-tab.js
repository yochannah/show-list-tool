define(['react', 'q', 'underscore', './local-storage', './mixins', './predicates', './enrichment-controls', './enrichment-widgets'],
    function (React, Q, _, localStorage, mixins, predicates, EnrichmentControls, EnrichmentWidgets) {
  'use strict';

  var d = React.DOM;
  var isEnrichmentWidget = predicates.eq('widgetType', 'enrichment');
  var isForList = predicates.isForList;
  var PVAL_REGEX = /^[01](\.[0-9]+)?$/;
  var correctionKey = "org.intermine.list-tool.enrichment.correction";

  var EnrichmentTab = React.createClass({

    displayName: 'EnrichmentTab',

    mixins: [mixins.SetStateProperty, mixins.ComputableState],

    getInitialState: function init () {
      return {
        widgets: [],
        invalid: {},
        listPromise: Q([]),
        correction: (localStorage[correctionKey] || 'Benjamini Hochberg'),
        maxp: 0.05,
        backgroundPopulation: null
      };
    },

    render: function render () {
      var controls = EnrichmentControls(_.extend(
        {onChange: this._handleChange},
        this.props,
        this.state
      ));
      var widgets = EnrichmentWidgets(_.extend(
        {filterTerm: this.props.filterTerm, wantsEnrichment: this._wantsEnrichment},
        this.props,
        this.state
      ));

      return d.div(null, controls, widgets);
    },

    _wantsEnrichment: function (name) {
      this.props.wants({
        what: 'enrichment',
        data: {
          request: {
            widget: name,
            list: this.props.list.name,
            maxp: this.state.maxp,
            correction: this.state.correction,
            backgroundPopulation: this.state.backgroundPopulation
          }
        }
      });
    },

    _validators: {
      maxp: PVAL_REGEX.test.bind(PVAL_REGEX)
    },
    _converters: {
      maxp: parseFloat
    },

    _handleChange: function (prop, changedTo) {
      var valid
        , value = changedTo
        , state = this.state
        , converter = this._converters[prop]
        , validator = this._validators[prop];

      valid = validator ? validator(value) : true;
      if (valid && converter) value = converter(value);

      state.invalid[prop] = !valid;
      if (valid) state[prop] = value;

      if (prop === 'correction') {
        localStorage[correctionKey] = value;
      }

      this.setState(state);
    },

    computeState: function (props) {
      var that = this;

      props.widgetPromise.then(function (widgets) {
        var enrichmentWidgets = widgets.filter(isEnrichmentWidget)
                                       .filter(isForList.bind(null, props.list));
        that.setStateProperty('widgets', enrichmentWidgets);
      });

      that.setStateProperty('listPromise', props.service.fetchLists().then(function (lists) {
        return lists.filter(predicates.eq('status', 'CURRENT'));
      }));

    }
  });

  return EnrichmentTab;

});
