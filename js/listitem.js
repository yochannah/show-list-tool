define(['react'], function (React) {
  'use strict';

  var ListItem = React.createClass({
    displayName: 'ListItem',
    render: function () {
      var item = this.props.item;
      return React.DOM.div({className: this.props.className}, React.DOM.div({className: 'thumbnail'},
          React.DOM.h5(null, item['class'] + ': ' + (item.symbol || item.primaryIdentifier || item.secondaryIdentifier)),
          React.DOM.p(null, React.DOM.em(null, item.organism.name))));
    }
  });

  return ListItem;
});
