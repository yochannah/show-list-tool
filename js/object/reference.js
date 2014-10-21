define(function (require, exports, module) {

  var React  = require('react')
    , _      = require('underscore')
    , intermine = require('imjs')
    , mixins = require('../mixins')
    , Caches = require('../query-cache')
    , ObjectTitle = require('./title')
    , ObjectView = require('./view')
    , d = React.DOM;

  var Reference;

  exports.create = Reference = React.createClass({

    displayName: 'Reference',

    getInitialState: function () {
      return {name: '', value: null};
    },

    mixins: [mixins.ComputableState],

    computeState: function (props) {
      var that = this;
      var path = props.object.type + '.' + props.ref.name;
      var cache = Caches.getCache('records');
      props.service.fetchModel()
           .then(function (model) { return model.makePath(path); })
           .then(function (path) { return path.getDisplayName(); })
           .then(function (str) { that.setState({name: str.split(/ > /).pop()}); })
           .then(null, console.error.bind(console));
            
      props.service.query({select: [path + '.*'], where: {id: props.object.id}})
           .then(cache.submit.bind(cache))
           .then(getRef(props.ref.name))
           .then(function (value) { that.setState({value: {type: value['class'], id: value['objectId']}}); });
    },


    render: function () {
      if (this.state.value == null) {
        return d.div();
      }
      var link = d.a(
          {className: 'btn-default btn-sm btn pull-right'},
          d.i({className: 'fa fa-external-link'})
      );
      if (this.props.recursive) {
        return d.div(
          {className: 'col-sm-12 field reference'},
          ObjectView.create({
            name: this.state.name,
            service: this.props.service,
            object: this.state.value,
            openable: true,
            isOpen: false
          }, link));
      } else {
        return d.div(
          {className: 'col-sm-12 field reference'},
          ObjectTitle({
            name: this.state.name,
            service: this.props.service,
            object: this.state.value,
            openable: true,
            toggleDetails: this.props.onSelect.bind(null, this.state.value)
          }));
      }

    }

  });

  function getRef (ref) {
    return function (results) {
      return results[0][ref];
    };
  }

});
