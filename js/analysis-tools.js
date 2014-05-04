define(['react',
    './listview',
    './listheading',
    './table-tab',
    './search-tab',
    './enrichment-tab',
    './filter-box',
    './visualisation-tab'],
    function (React, ListView, Heading, TableTab, SearchTab, EnrichmentTab, FilterBox, VisualisationTab) {
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
          {id: 'content', text: 'Explore'},
          {id: 'table', text: 'Edit'},
          {id: 'search', text: 'Search'},
          {id: 'enrich', text: 'Enrich'},
          {id: 'graphs', text: 'Visualise'}
        ],
        templatePromise: this.props.service.fetchTemplates(),
        widgetPromise: this.props.service.fetchWidgets(),
        filterTerm: null,
        currentTab: 'content'
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
        case 'content':
          tabContent = this._renderContentTab();
          break;
        case 'table':
          tabContent = this._renderTableTab();
          break;
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
        Heading(this.props.list),
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

    _renderContentTab: function () {
      return ListView({
        service: this.props.service,
        list: this.props.list,
        filterTerm: this.state.filterTerm
      });
    },

    _renderTableTab: function () {
      return TableTab({
        service: this.props.service,
        list: this.props.list,
        filterTerm: this.state.filterTerm
      });
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
      return EnrichmentTab({
        service: this.props.service,
        list: this.props.list,
        widgetPromise: this.state.widgetPromise,
        filterTerm: this.state.filterTerm
      });
    },
    _renderVisualisationTab: function () {
      return VisualisationTab({
        service: this.props.service,
        list: this.props.list,
        widgetPromise: this.state.widgetPromise,
        filterTerm: this.state.filterTerm
      });
    },
    _chooseTab: function (ident) {
      var state = this.state;
      state.currentTab = ident;
      this.setState(state);
    }
  });

  return AnalysisTools;
});
