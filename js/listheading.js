define(['react'], function (React) {
  'use strict';

  var ListHeading = React.createClass({
    render: function () {
      var children = [];
      var title = React.DOM.h1({
          key: 'header',
          ref: 'title',
          className: 'list-title',
        }, 
        this.props.name
      );
      var description = React.DOM.p(null, this.props.description);
      return React.DOM.div({
        ref: 'listHeading',
        className: 'page-header'
      }, title, description);
    }
  });

  return ListHeading;
});
