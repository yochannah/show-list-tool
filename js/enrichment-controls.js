define(['react', 'q', 'underscore', './mixins', './predicates', './select-input'],
    function (React, Q, _, mixins, predicates, SelectInput) {

  'use strict';

  var d = React.DOM;

  var EnrichmentControls = React.createClass({

    displayName: 'EnrichmentControls',

    mixins: [mixins.SetStateProperty, mixins.ComputableState],

    getInitialState: function () {
      return {
        maxp: this.props.maxp,
        correctionAlgorithms: ['Holm-Bonferroni', 'Bonferroni', 'Benjamini Hochberg'],
        backgrounds: []
      };
    },

    _renderCorrectionInput: function () {
      return d.div(
          {className: 'form-group'},
          d.label(
            null,
            "Correction"
          ),
          SelectInput({
            onChange: this._setCorrection,
            options: this.state.correctionAlgorithms,
            selected: this.props.correction
          }));
    },
  
    _setCorrection: function (algorithm) {
      this.props.onChange('correction', (algorithm || 'none'));
    },

    _renderPValueInput: function () {
      return d.div(
          {className: 'form-group' + (this.props.invalid.maxp ? ' has-error' : '')},
          d.label(
            null,
            "Maximum P-Value"
          ),
          d.input(
            {
              className: 'form-control pval',
              ref: 'maxp',
              onChange: this._setMaxP,
              value: this.state.maxp,
              type: 'text'
            }));
            
    },

    _setMaxP: function (event) {
      var value = this.refs.maxp.getDOMNode().value;
      this.setStateProperty('maxp', value); // Reflect it the control.
      this.reportChange('maxp', value);
    },

    reportChange: _.throttle(function (key, value) {
      this.props.onChange('maxp', value);   // report it to parent.
    }, 250),

    _renderBackgroundInput: function () {
      return d.div(
          {className: 'form-group'},
          d.label(
            null,
            "Background Population"
          ),
          SelectInput({
            onChange: this._setBackground,
            options: this.state.backgrounds,
            selected: this.props.backgroundPopulation,
            formatTitle: getTitle
          }));
    },

    _setBackground: function (list) {
      this.props.onChange('backgroundPopulation', list.name);
    },

    render: function () {
      return d.form(
        {className: 'enrichment-controls form-inline'},
        this._renderCorrectionInput(),
        this._renderPValueInput(),
        this._renderBackgroundInput(),
        this._renderRevertButton());
    },

    _renderRevertButton: function () {
      return d.button(
          {onClick: this._revert, className: 'btn btn-default'},
          d.i({className: 'fa fa-refresh'}));
    },

    _revert: function (event) {
      event.preventDefault();
      var k;
      for (k in this.state.original) {
        this.props.onChange(k, this.state.original[k]);
        this.setStateProperty(k, this.state.original[k]);
      }
    },

    computeState: function (props) {
      var that = this
        , state = this.state;

      if (!state.original) {
        state.original = _.pick(this.props, 'maxp', 'correction', 'backgroundPopulation');
        this.setState(state);
      }

      Q.spread([props.service.fetchModel(), props.listPromise], function (model, lists) {
        var listType = props.list.type;
        var backgrounds = lists.filter(function (maybeSuitable) {
          return predicates.isAssignableTo(model, maybeSuitable.type, listType);
        });
        that.setStateProperty('backgrounds', backgrounds);
      });
    }
  });

  return EnrichmentControls;

  function getTitle (thing) {
    return thing.title;
  }
});
