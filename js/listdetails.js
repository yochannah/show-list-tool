define(['react', './listheading'], function(React, Heading) {
  'use strict';

  var ListDetails = React.createClass({

    displayName: 'ListDetails',

    render: function() {
      return React.createElement(Heading, {
        list: this.props.list,
        _updateTagList: this._updateTagList,
        _removeTag : this._removeTag
      });
    },
    //pass through to parent element to handle this
    _updateTagList: function(tagDetails) {
      this.props._updateTagList(tagDetails);
    },
    _removeTag: function(tagToKill) {
      this.props._updateTagList(tagToKill);
    }

  });

  return ListDetails;
});
