define(['react', './listheading'], function (React, Heading) {
  'use strict';

  var ListDetails = React.createClass({

    displayName: 'ListDetails',

    render: function () {
      return Heading(this.props.list);
    }

  });

  return ListDetails;
});
