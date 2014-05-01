define(['react', './listitem'], function (React, ListItem) {
  'use strict';

  var ItemList = React.createClass({
    displayName: 'ItemList',
    getInitialState: function () {
      return {offset: 0, size: 12};
    },
    render: function () {
      var items = this.props.items.slice(this.state.offset, this.state.size).map(function (item) {
        return ListItem({
          className: 'col-xs-4 col-sm-3 col-md-2',
          key: item.objectId,
          item: item
        });
      });
      return React.DOM.div({className: 'container-fluid'}, React.DOM.div({className: 'row'}, items));
    }
  });

  return ItemList;
});
