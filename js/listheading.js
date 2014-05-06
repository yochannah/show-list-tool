define(['react', './tag-adder'], function (React, TagAdder) {

  'use strict';

  var d = React.DOM;

  var ListHeading = React.createClass({

    displayName: 'ListHeading',

    getInitialState: function () {
      return {};
    },

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
      var tags = d.div(
        {className: 'well well-sm'},
        this.props.tags.map(this._renderTag),
        this._renderAddTagControl(),
        d.div({className: 'clearfix'}));
      return React.DOM.div({
        ref: 'listHeading',
        className: 'page-header'
      }, title, description, tags);
    },

    _renderAddTagControl: function () {
      return TagAdder(this.props);
    },

    _renderTag: function (tag, i) {
      return d.span(
        {key: i, className: 'label label-info'},
        tag,
        ' ',
        d.i({className: 'fa fa-times-circle'})
      );
    }
  });

  return ListHeading;
});
