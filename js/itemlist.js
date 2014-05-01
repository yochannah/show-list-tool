define(['react', './listitem'], function (React, ListItem) {
  'use strict';

  var ItemList = React.createClass({
    displayName: 'ItemList',
    getInitialState: function () {
      return {offset: 0, size: 8};
    },
    render: function () {
      var items = this.props.items.slice(this.state.offset, this.state.size).map(function (item) {
        return ListItem({
          className: 'col-sm-3',
          key: item.objectId,
          item: item
        });
      });
      return React.DOM.div({className: 'container-fluid'}, React.DOM.div({className: 'row'}, items));
    }
  });

  return ItemList;
});
