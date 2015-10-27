define(['react', './tag-adder'], function(React, TagAdder) {

  'use strict';

  var d = React.DOM;

  var ListHeading = React.createClass({

    displayName: 'ListHeading',

    getInitialState: function() {
      return {
        tags: this.props.list.tags
      };
    },

    render: function() {
      var children = [];
      var title = React.DOM.h1({
          key: 'header',
          ref: 'title',
          className: 'list-title',
        },
        this.props.list.name
      );
      var description = d.p({
        className: 'description'
      }, this.props.list.description);
      var tags = d.div({
          className: 'well well-sm'
        },
        this.state.tags.map(this._renderTag),
        this._renderAddTagControl(),
        d.div({
          className: 'clearfix'
        }));
      return React.DOM.div({
        ref: 'listHeading',
        className: 'page-header tagManager'
      }, title, description, tags);
    },

    _renderAddTagControl: function() {
      return React.createElement(TagAdder, {
        list: this.props.list,
        _updateTagList: this._updateTagList,
        _removeTag: this._removeTag
      });
    },

    //here we get the details from the tag adder, which is a bit dumb, and either add the tag
    //or display a useful error message.
    _updateTagList: function(tagAdderState) {
      console.log('ok, so.', tagAdderState);
      var self = this;
      //if the tag is valid, add it.
      if (tagAdderState.isValid) {
        this.props.list.addTags([tagAdderState.tagText]).then(function(){
          self.setState({
            tags: self.props.list.tags
          });
          self.render();
        });
      } else if (tagAdderState.isDuplicate) {
        //sorry, dupe.
        console.log('dupe');
      } else {
        //misc error, or prefixed with 'im:'
        console.log('derp');
      }
    },
    _removeTag: function(tag) {
      //TODO
    },

    _renderTag: function(tag, i) {
      return d.span({
          key: i,
          className: 'label label-info'
        },
        tag,
        ' ',
        d.i({
          className: 'fa fa-times-circle'
        })
      );
    }
  });

  return ListHeading;
});
