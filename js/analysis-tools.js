define(['react',
    './listview',
    './table-tab',
    './listdetails', 
    './search-tab',
    './enrichment-tab',
    './filter-box',
    './visualisation-tab'],
    function (React, ListView, TableTab, ListDetails, SearchTab, EnrichmentTab, FilterBox, VisualisationTab) {

  'use strict';

  var d  = React.DOM
    , div = React.DOM.div
    , ul = React.DOM.ul
    , li = React.DOM.li
    , a  = React.DOM.a;

  var AnalysisTools = React.createClass({

    displayName: 'AnalysisTools',

    getInitialState: function () {
      var activeTabs = this.props.activeTabs;
      var tabs = [
        {id: 'content', text: 'Explore'},
        {id: 'details', text: 'Details'},
        {id: 'search', text: 'Search'},
        {id: 'enrich', text: 'Enrich'},
        {id: 'graphs', text: 'Visualise'}
      ];
      if (activeTabs) {
        tabs = tabs.filter(function (tab, i) {
          if (!activeTabs || i < 2) return true;
          return activeTabs.indexOf(tab.id) >= 0;
        });
      }
      return {
        tabs: tabs,
        templatePromise: this.props.service.fetchTemplates(),
        widgetPromise: this.props.service.fetchWidgets(),
        filterTerm: null,
        currentTab: 'content'
      };
    },

    render: function () {
      var tabConf = this.state.tabs.slice();
      if (this.props.list.authorized) {
        tabConf.push({id: 'table', text: 'Edit'});
      }
      var tabs = tabConf.map(function (tab) {
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
        case 'details':
          tabContent = this._renderDetailTab();
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

      return div({className: 'show-list-tool'},
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
        filterTerm: this.state.filterTerm,
        onSelectedItems: this.props.onSelectedItems,
        onSelectedList: this._reportListSelection
      });
    },

    _reportListSelection: function (list) {
      var onSelected = this.props.onSelectedItems;
      list.contents().then(function (objs) {
        var ids = objs.map(function (o) { return o.objectId; });
        onSelected(list.type, list.type, ids);
      });
    },

    _renderDetailTab: function () {
      return ListDetails({
        service: this.props.service,
        list: this.props.list
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
        filterTerm: this.state.filterTerm,
        execute: this.props.executeQuery
      });
    },
    _renderEnrichmentTab: function () {
      return EnrichmentTab({
        service: this.props.service,
        list: this.props.list,
        widgetPromise: this.state.widgetPromise,
        filterTerm: this.state.filterTerm,
        wants: this._wants
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
    },

    _wants: function (message) {
      // add information about the service.
      message.data.service = {root: this.props.service.root};
      this.props.wants(message);
    }
  });

  return AnalysisTools;
});
