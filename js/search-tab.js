define([
    'react',
    'underscore',
    'imjs',
    './predicates',
    './mixins',
    './template-line',
    './sorry',
    './loading'],
    function (React, _, imjs, predicates, mixins, TemplateLine, sorry, loading) {
  'use strict';

  var isEditable = predicates.isEditable;
  var d = React.DOM;

  var SearchTab = React.createClass({
    displayName: 'SearchTab',

    mixins: [mixins.ComputableState, mixins.Filtered],

    getInitialState: function () {
      return { templates: null};
    },

    render: function () {
      var templates = (this.state.templates || [])
                                .filter(this.matchesFilter)
                                .map(this._renderTemplate);
      if (templates.length) {
        return d.ul({className: 'list-group'}, templates);
      } else if (this.state.templates) {
        if (this.state.templates.length) {
          return sorry("no templates matched your filter terms");
        } else {
          return sorry("we couldn't find any suitable templates for this list.");
        }
      } else {
        return loading();
      }
    },

    _renderTemplate: function (template, i) {

      return TemplateLine({
        template: template,
        key: template.name,
        filterTerm: this.props.filterTerm,
        service: this.props.service,
        list: this.props.list,
        execute: this.props.execute
      });

    },

    // required by ComputableState
    computeState: function computeState (props) {
      var that = this
        , service = props.service;

      service.fetchModel().then(function (model) {

        var isAssignableTo = predicates.isAssignableTo.bind(null, model);

        props.templatePromise.then(function (templates) {
          var suitable = _.values(templates).filter(isSuitable);
          var state = that.state;
          state.templates = suitable;
          that.setState(state);
        });

        function isSuitable (template) {

          var query, pathInfo
            , constraints = template.where.filter(isEditable)
            , con = constraints[0];

          // Only consider templates that have a single editable constraint.
          if (constraints.length !== 1) return false;

          query = new imjs.Query(template, service);
          query.model = model;
          pathInfo = query.getPathInfo(con.path);
          if (pathInfo.isAttribute()) pathInfo = pathInfo.getParent();

          return isAssignableTo(pathInfo.getType(), props.list.type);
        }
      });

    }
  });

  return SearchTab;

  function onPropChange () {
    this._computeState();
  }

});
