define(['react', './listitem'], function (React, ListItem) {
  'use strict';

  var ItemList = React.createClass({
    displayName: 'ItemList',
    render: function () {
      var items = this.props.items.slice(this.props.offset, this.props.offset + this.props.size).map(function (item) {
        return ListItem({
          className: 'list-item col-xs-4 col-sm-3 col-md-2',
          key: item[0],
          view: this.props.query.select,
          item: item
        });
      }.bind(this));
      return React.DOM.div(
        {className: 'container-fluid item-list'},
        React.DOM.div({className: 'row'}, items)
      );
    },
    componentDidUpdate: function () {
      // Make sure all items have the same height. For appearances, mostly.
      var i, l, itemNode, node = this.getDOMNode();
      var itemNodes = node.querySelectorAll('.thumbnail');
      var maxHeight = 0;
      for (i = 0, l = itemNodes.length; i < l; i++) {
        itemNode = itemNodes[i];
        maxHeight = Math.max(maxHeight, itemNode.getBoundingClientRect().height);
      }
      console.log(maxHeight);
      for (i = 0, l = itemNodes.length; i < l; i++) {
        itemNode = itemNodes[i];
        itemNode.style.height = maxHeight + "px";
      }

    }
  });

  return ItemList;
});
