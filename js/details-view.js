define(function (require, exports, module) {
  
  'use strict';

  var React      = require('react')
    , _          = require('underscore')
    , intermine  = require('imjs')
    , Caches     = require('./query-cache')
    , mixins     = require('./mixins')
    , ObjectView = require('./object-view');

  var DetailsView
    , cache = Caches.getCache('records')
    , d = React.DOM
    , runQuery = cache.submit.bind(cache);

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
      return { items: [] };
    },

    render: function () {
      return d.ul({className: 'item-detail-listing'}, this.state.items.map(this.renderItem));
    },

    renderItem: function (item) {
      return ObjectView({
        object: item,
        key: item.objectId,
        path: this.props.list.type,
        service: this.props.service
      });
    },

    computeState: function (props) {
      var that = this;
      try {
        props.list.query(['**'])
                  .then(_.compose(runQuery, intermine.utils.dejoin))
                  .then(function (items) {
                    return items.filter(mixins.BuildsQuery.itemMatchesFilter(props.filterTerm));
                  })
                  .then(this.setStateProperty.bind(this, 'items'));
      } catch (e) {
        console.error(e);
      }
    }
  });

});
