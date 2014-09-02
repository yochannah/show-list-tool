define(function (require, exports, module) {
  
  'use strict';

  var React = require('react')
    , d = React.DOM
    , Q = require('q')
    , _ = require('underscore')
    , Caches = require('./query-cache')
    , mixins = require('./mixins');

  var cache = Caches.getCache('records')
    , runQuery = cache.submit.bind(cache);

  var DetailsView;

  /**
   * Props:
   *   service :: intermine.Service { get :: (path) -> Promise, fetchModel :: -> Promise<Model> }
   *   list :: intermine.List {type :: string, contents :: -> Promise<Array>}
   *   path :: string
   *   classkeys :: Object<string, Array<string>>
   *   selected :: Object<ObjectId, bool>
   *   onItemSelected :: function (ObjectId, bool) -> void
   *   filterTerm :: string
   */
  module.exports = DetailsView = React.createClass({

    displayName: 'DetailsView',

    mixins: [mixins.SetStateProperty, mixins.ComputableState],

    getInitialState: function () {
      return {table: {attributes: {}, references: {}, collections: {}}, items: [], pks: []};
    },

    render: function () {
      return d.ul({className: 'item-detail-listing'}, this.state.items.map(this.renderItem));
    },

    renderItem: function (item) {
      var heading = d.h2(
        {className: 'item-heading'},
        getHeading(item, this.state.pks));

      var attrs = _.keys(this.state.table.attributes)
                   .filter(function (name) { return item[name] != null; })
                   .map(function (name) {
        return d.span({className: 'field attr', key: name},
          d.span({className: 'field-value'}, item[name]),
          d.strong({className: 'field-name'}, name));
      });
      var refs = _.map(this.state.table.references, function (field, name) {
        return d.span({key: name}, name);
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
    },

    computeState: function (props) {
      var that = this;
      props.service.fetchModel().then(function (model) {
        that.setState({table: model.classes[props.list.type]});
      });
      props.service.get('classkeys').then(function (resp) {
        that.setState({pks: resp.classes[props.list.type]});
      });
      props.list.query(['**'])
                .then(runQuery)
                .then(function (items) {
                  return items.filter(mixins.BuildsQuery.itemMatchesFilter(props.filterTerm));
                })
                .then(this.setStateProperty.bind(this, 'items'));
    }
  });

  function getHeading (item, pks) {
    var f = _.compose(_.uniq, _.compact);
    return f(pks.map(function (pk) { return resolve(item, pk); })).join(' ');
  }

  function resolve (item, pk) {
    var parts = pk.split('.').slice(1);
    return parts.reduce(getProp, item);
  }

  function getProp (o, prop) {
    return o[prop];
  }

});
