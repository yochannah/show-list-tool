define(['react', './search-tab', './filter-box'], function (React, SearchTab, FilterBox) {
  'use strict';

  var d  = React.DOM
    , div = React.DOM.div
    , ul = React.DOM.ul
    , li = React.DOM.li
    , a  = React.DOM.a;

  var AnalysisTools = React.createClass({

    displayName: 'AnalysisTools',

    getInitialState: function () {
      return {
        tabs: [
          {id: 'search', text: 'Search'},
          {id: 'enrich', text: 'Enrich'},
          {id: 'graphs', text: 'Visualise'}
        ],
        templatePromise: this.props.service.fetchTemplates(),
        filterTerm: null,
        currentTab: 'search'
      };
    },

    render: function () {
      var tabs = this.state.tabs.map(function (tab) {
        return li(
          {key: tab.id, className: this.state.currentTab === tab.id ? 'active' : ''},
          a(
            {onClick: this._chooseTab.bind(this, tab.id)},
            tab.text));
      }.bind(this));
      var tabContent = [];
      switch (this.state.currentTab) {
        case 'search':
          tabContent = this._renderSearchTab();
          break;
        case 'enrich':
          tabContent = this._renderEnrichmentTab();
          break;
        case 'graphs':
          tabContent = this._renderVisualisationTab();
          break;
      }

      var filterBox = FilterBox({className: 'pull-right', onChange: this._handleFilterChange});

      return div(null,
        ul({className: 'nav nav-tabs'}, tabs, filterBox), 
        div({className: 'tab-content'}, tabContent)
      );
    },

    _handleFilterChange: function (value) {
      var state = this.state;
      if (value && !/^\s*$/.test(value)) {
        state.filterTerm = String(value).toLowerCase();
      } else {
        state.filterTerm = null;
      }
      this.setState(state);
    },

    _renderSearchTab: function () {
      return SearchTab({
        service: this.props.service,
        list: this.props.list,
        templatePromise: this.state.templatePromise,
        filterTerm: this.state.filterTerm
      });
    },
    _renderEnrichmentTab: function () {
      return "ENRICHMENT";
    },
    _renderVisualisationTab: function () {
      return "VISUALISATION";
    },
    _chooseTab: function (ident) {
      var state = this.state;
      state.currentTab = ident;
      this.setState(state);
    }
  });

  return AnalysisTools;
});
