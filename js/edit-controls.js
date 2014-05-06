define(['react', 'underscore'], function (React, _) {
  'use strict';

  var d = React.DOM;

  var EditControls = React.createClass({
    displayName: 'EditControls',

    render: function () {
      return d.div(
        {className: 'btn-group'},
        d.button(
          {className: 'btn btn-default'},
          "Remove " + (this.props.selected.all ? 'all' : _.values(this.props.selected).filter(_.identity).length)));
    }
  });

  return EditControls;
});

