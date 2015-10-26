define(['react', './listheading'], function (React, Heading) {
  'use strict';

  var ListDetails = React.createClass({

    displayName: 'ListDetails',

    render: function () {
      return React.createElement(Heading, {list: this.props, _addTag:this._addTag});
    },
    _addTag : function(tag){
      this.props._addTag(tag);
    }

  });

  return ListDetails;
});
