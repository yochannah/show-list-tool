define(['react', './listheading', './listcontents'], function (React, Heading, Contents) {
  'use strict';

  var ListView = React.createClass({
    displayName: 'ListView',
    getInitialState: function () {
      return {};
    },
    render: function () {
      return React.DOM.div({},
        Heading(this.props.list),
        Contents(this.props));
    }
  });

  return ListView;
});
