define(function (require, exports, module) {

  var React  = require('react')
    , _      = require('underscore')
    , intermine = require('imjs')
    , mixins = require('../mixins')
    , Caches = require('../query-cache')
    , ObjectTitle = require('./title')
    , d = React.DOM;

  var Attribute;

  module.exports = Attribute = React.createClass({

    displayName: 'Attribute',

    getInitialState: function () {
      return {name: '', value: '', type: ''};
    },

    mixins: [mixins.ComputableState],

    computeState: function (props) {
      var that = this;
      var path = props.object.type + '.' + props.attr.name;
      var cache = Caches.getCache('findById', props.service);
      var pathing = props.service.fetchModel().then(toPath.bind(path));
      pathing.then(call('getDisplayName'))
             .then(function (str) { that.setState({name: str.split(/ > /).pop()}); })
             .then(null, console.error.bind(console));
      pathing.then(function (p) {
        that.setState({type: p.getType()});
        // TODO! - handle long clobs.
      });

      cache.submit(props.object).then(function (o) {
        that.setState({value: o[props.attr.name]});
      });

    },

    render: function () {
      if (this.state.value == null) {
        return d.div();
      }
      var typeClass = this.state.type.toLowerCase().replace(/\./g, '-');
      return d.tr(
        {className: 'field attribute'},
        d.td(null, d.div({className: 'name'}, this.state.name)),
        d.td(null, d.div({className: 'value ' + typeClass}, String(this.state.value))));
    }
  });

  function call (method) {
    return function (receiver) {
      return receiver[method]();
    }
  }

  function toPath (model) {
    return model.makePath(this);
  }
});
