define(function (require, exports, module) {

  var React = require('react')
    , mixins = require('./mixins')
    , d = React.DOM;

  var ObjectView;
  
  module.exports = ObjectView = React.createClass({

    displayName: 'ObjectView',

    mixins: [mixins.SetStateProperty, mixins.ComputableState],

    getInitialState: function () {
      return {
        table: {attributes: {}, references: {}, collections: {}},
        pks: [],
        isOpen: {}
      };
    },

    render: function () {
      try {
        var that = this;
        var path = this.props.path;
        var item = this.props.object;
        var heading = d.h2(
          {className: 'item-heading'},
          this.getHeading(item));
        
        var hasValue = function (name) { return item[name] != null; };

        var attrs = _.keys(this.state.table.attributes)
                    .filter(hasValue)
                    .map(function (name) {
          return d.span({className: 'field attr', key: name},
            that.renderAttribute(item[name]), 
            d.strong({className: 'field-name'}, name));
        });

        var refs = _.keys(this.state.table.references)
                    .filter(hasValue)
                    .map(function (name) {
          var refPath = path + '.' + name;
          var icon = that.state.isOpen[refPath] ? 'fa-caret-down' : 'fa-caret-right';
          return d.span({className: 'field ref', key: name},
            that.renderReference(refPath, item[name]),
            d.strong(
              {
                onClick: that.togglePathState.bind(that, refPath),
                className: 'field-name'
              },
              d.i({className: 'fa ' + icon}),
              ' ', name));
        });

        var colls = _.map(this.state.table.collections, function (field, name) {
          return d.span({key: name}, name);
        });

        var details = d.div(
          {className: 'item-details'},
          [].concat(attrs)
            .concat(refs)
            .concat(colls));
        var li = d.li({key: item.objectId}, heading, details);
        return li;
      } catch (e) {
        console.log('Error rendering', e.stack);
      }
    },

    renderAttribute: function (value) {
      return d.span({className: 'field-value'}, value);
    },

    renderReference: function (path, obj) {
      var isOpen = this.state.isOpen[path];
      return d.span({className: 'field-value'}, this.getHeading(obj));
    },

    togglePathState: function (path) {
      var pathStates = this.state.isOpen;
      pathStates[path] = !pathStates[path];
      this.setState({isOpen: pathStates});
    },

    getHeading: function (item) {
      var pks = (this.state.pks[item['class']] || []);
      var f = _.compose(_.uniq, _.compact);
      return f(pks.map(function (pk) { return resolve(item, pk); })).join(' ');
    },

    computeState: function (props) {
      var that = this;
      try {
        props.service.fetchModel().then(function (model) {
          that.setState({table: model.classes[props.object['class']]});
        });
        props.service.get('classkeys').then(function (resp) {
          that.setState({pks: resp.classes});
        });
      } catch (e) {
        console.error(e);
      }
    }
  });


  function resolve (item, pk) {
    var parts = pk.split('.').slice(1);
    return parts.reduce(getProp, item);
  }

  function getProp (o, prop) {
    return o[prop];
  }
});
