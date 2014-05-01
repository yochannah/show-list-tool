define(['react', './itemlist'], function (React, ItemList) {
  'use strict';

  var ListContents = React.createClass({
    displayName: 'ListContents',
    getInitialState: function () {
      return {items: []};
    },
    render: function () {
      return React.DOM.div({}, ItemList({items: this.state.items}));
    },
    componentWillMount: function () {
      this.props.list.contents().then(fillItems.bind(this));
    }
  });

  return ListContents;

  function fillItems (items) {
    this.setState({items: items});
  }
});
