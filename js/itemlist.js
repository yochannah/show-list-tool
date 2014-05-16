define([
    'react',
    './listitem',
    './sorry',
    './loading'
    ], function (React, ListItem, sorry, loading) {
  'use strict';

  var d = React.DOM;

  var ItemList = React.createClass({

    getInitialState: function () {
      return {};
    },

    displayName: 'ItemList',

    render: function () {
      try {
      var state = this.state
        , props = this.props
        , selectionHandler = props.onItemSelected
        , onRender = this._equaliseHeights;

      var items = (props.items || []).slice(props.offset, props.offset + props.size).map(function (item) {
        return ListItem({
          className: 'list-item col-xs-4 col-sm-3 col-md-2',
          selected: (props.selected.all || props.selected[item[0]]),
          onChangeSelected: selectionHandler,
          type: props.type,
          onRender: onRender,
          key: item[0],
          view: props.query.select,
          item: item
        });
      });
      
      if (items.length) {
        return d.div(
          {className: 'container-fluid item-list'},
          d.div({className: 'row'}, items));
      } else if (props.hasRun && props.items) {
        return sorry("no items matched your filter terms");
      } else {
        return loading();
      }

      } catch (e) {
        console.error(e);
        return React.DOM.div({className: 'alert alert-danger'}, String(e));
      }
    },

    componentDidMount: function () {
      this._equaliseHeights();
    },

    componentDidUpdate: function () {
      this._equaliseHeights();
    },

    _equaliseHeights: function () {
      // Make sure all items have the same height. For appearances, mostly.
      var i, l, h, lastHeight, itemNode, node = this.getDOMNode();
      var itemNodes = node.querySelectorAll('.thumbnail');
      var maxHeight = 0;
      var different = false;
      for (i = 0, l = itemNodes.length; i < l; i++) {
        itemNode = itemNodes[i];
        delete itemNode.style.height;
        h = itemNode.getBoundingClientRect().height;
        maxHeight = Math.max(maxHeight, h);
        if (lastHeight) {
          different = (different || (h !== lastHeight));
        }
        lastHeight = h;
      }
      if (different) { // only normalise if different.
        console.log('normalising heights to ' + maxHeight + 'px');
        for (i = 0, l = itemNodes.length; i < l; i++) {
          itemNode = itemNodes[i];
          itemNode.style.height = maxHeight + "px";
        }
      }

    }
  });

  return ItemList;
});
