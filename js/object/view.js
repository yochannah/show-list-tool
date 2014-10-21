define(function (require, exports, module) {

  'use strict';

  var React  = require('react')
    , _      = require('underscore')
    , intermine = require('imjs')
    , mixins = require('../mixins')
    , Caches = require('../query-cache')
    , ObjectTitle = require('./title')
    , Attribute = require('./attribute')
    , Reference = require('./reference')
    , Collection = require('./collection')
    , d = React.DOM;

  var ObjectView;

  exports.create = ObjectView = React.createClass({

    displayName: 'ObjectView',

    getDefaultProps: function () {
      return {onObjectSelected: function () {}};
    },

    getInitialState: function () {
      return {
        object: this.props.object,
        isOpen: true,
        refs: [],
        attrs: [],
        colls: []
      };
    },

    mixins: [mixins.ComputableState],

    render: function () {
      var cssClass = 'object-view';
      var title = ObjectTitle({
          name: this.props.name,
          attrsOnly: ('attrs' === this.props.summary),
          openable: this.props.openable,
          open: this.state.isOpen,
          toggleDetails: this.toggleDetails,
          object: this.state.object,
          service: this.props.service});
      if (!this.state.isOpen) {
        return d.div({className: cssClass}, this.props.children, title);
      }

      var attributes = this.state.attrs.map(this.renderAttribute);
      var references = this.state.refs.map(this.renderReference);
      var collections = this.state.colls.map(this.renderCollection);

      return d.div({className: cssClass},
        title,
        d.table({className: 'table table-striped'},
          d.tbody({}, attributes)),
        d.div({className: 'row fields refs'}, references),
        d.div({className: 'row fields colls'}, collections));

    },

    toggleDetails: function (event) {
      this.setState({isOpen: !this.state.isOpen});
    },

    renderAttribute: function (attr, index) {
      return Attribute({
        key: index,
        service: this.props.service,
        attr: attr,
        object: this.state.object
      });
    },

    renderReference: function (ref, index) {
      return Reference.create({
        key: (this.state.object.id + ref.name),
        service: this.props.service,
        ref: ref,
        object: this.state.object,
        onSelect: this.props.onObjectSelected
      });
    },

    renderCollection: function (coll, index) {
      return Collection.create({
        key: (this.state.object.id + coll.name),
        service: this.props.service,
        coll: coll,
        object: this.state.object,
        onSelect: this.props.onObjectSelected
      });
    },

    computeState: function (props) {
      var that = this;
      that.setState({attrs: [], refs: [], colls: [], object: props.object});
      if ('isOpen' in props) {
        that.setState({isOpen: props.isOpen});
      }
      props.service.fetchModel().then(function (model) {
        var cld = model.classes[props.object.type];
        that.setState({
          attrs: _.values(cld.attributes).filter(function (attr) {
            return attr.name !== 'id';
          }),
          refs: _.sortBy(_.values(cld.references), byName),
          colls: _.sortBy(_.values(cld.collections), byName)
        });
      });
    }
  });

  function byName (x) { return x.name; };

});
