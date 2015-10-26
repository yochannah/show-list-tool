define(function (require, exports, module) {

  'use strict';

  var React  = require('react')
    , _      = require('underscore')
    , mixins = require('../mixins')
    , Caches = require('../query-cache')
    , ObjectView = require('./view')
    , Breadcrumbs = require('./breadcrumbs')
    , d = React.DOM;

  var Report;

  module.exports = Report = React.createClass({

    displayName: 'Report'

    , mixins: [mixins.ComputableState]

    , getInitialState: function () {
      return {objects: []};
    }

    , computeState: function (props) {
      this.setState({objects: [props.object]});
    }

    , render: function () {
      var objs = this.state.objects;
      return d.div(
        {},
        React.createElement(Breadcrumbs,{
          objects: objs,
          onRevert: this.setObjects
        }),
        React.createElement(ObjectView, {
          service: this.props.service,
          object: objs[objs.length - 1],
          onObjectSelected: this.goToObject
        }));
    }

    , goToObject: function (object) {
      this.setObjects(this.state.objects.concat([object]));
    }

    , setObjects: function (objects) {
      this.setState({objects: objects});
    }

  });
});
