define(['react', './tag-adder'], function (React, TagAdder) {

  'use strict';

  var d = React.DOM;

  var ListHeading = React.createClass({

    displayName: 'ListHeading',

    getInitialState: function () {
      return {tags:this.props.list.tags};
    },

    render: function () {
      var children = [];
      var title = React.DOM.h1({
          key: 'header',
          ref: 'title',
          className: 'list-title',
        },
        this.props.list.name
      );
      var description = d.p({className: 'description'}, this.props.list.description);
      var tags = d.div(
        {className: 'well well-sm'},
        this.state.tags.map(this._renderTag),
        this._renderAddTagControl(),
        d.div({className: 'clearfix'}));
      return React.DOM.div({
        ref: 'listHeading',
        className: 'page-header'
      }, title, description, tags);
    },

    _renderAddTagControl: function () {
      return React.createElement(TagAdder, {list : this.props.list, _addTag : this._addTag});
    },

    _addTag : function(tag){
      this.setState({tags:this.props.list.tags.concat([tag])});
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
