define(['react', './sorry'], function(React, sorry) {

  'use strict';

  var IM_PREFIX = /^im:/i;

  var d = React.DOM;

  var TagAdder = React.createClass({

    displayName: 'TagAdder',

    getInitialState: function() {
      return {
        tagText: this.props.tagText,
        isValid: true,
        isDuplicate: false
      };
    },

    render: function() {
      //reset tagText, but only if the previous value was saved and the tagtext
      //property was emptied.

      return d.form({
          className: 'form-inline pull-right list-tagger',
          onSubmit: this._saveTag
        },
        d.div({
            className: 'form-group' + (this.state.isValid ? '' : ' has-error')
          },
          d.input({
            ref: 'tagText',
            className: 'form-control input-sm',
            value: this.state.tagText,
            onChange: this._updatePotentialTag,
            placeholder: 'my new tag'
          })),
        d.button({
          disabled: !this.state.hasTag,
          className: 'btn btn-sm btn-default'
        }, 'Add tag')
      );
    },

    componentWillReceiveProps : function(){
      console.log('%cThis.props: ', 'color:yellowgreen;font-weight:bold', this.props);
      console.log('%cThis.state: ', 'color:orange;font-weight:bold', this.state);
      console.log('THIS PROPS TAGTEXT === ""',(this.props.tagText === ""))
      if(this.props.tagText === "") {
        this.setState({
          tagText : ""
        });
      }
    },

    _updatePotentialTag: function() {
      var val = this.refs.tagText.value || this.state.tagText;
      var state = this.state;
      state.tagText = val;
      state.isDuplicate = isDuplicateTagName(val, this.props.list.tags);
      state.isValid = isValidTagName(val) && !state.isDuplicate;
      state.hasTag = (state.isValid && val && val.length);
      this.setState(state);
    },

    _saveTag: function handleSubmit(e) {
      e.preventDefault();
      console.log('%cThis.props: ', 'color:yellowgreen;font-weight:bold', this.props);
      console.log('%cThis.state: ', 'color:orange;font-weight:bold', this.state);
      this.props._updateTagList(this.state);
    },
    _removeTag : function(e) {
      //TODO :) including the hook
    }

  });

  return TagAdder;

  function isValidTagName(tagName) {
    if (IM_PREFIX.test(tagName)) {
      return false;
    }
    return true;
  }

  //check to make sure we don't have this tag in the array already.
  function isDuplicateTagName(tagName, tags) {
    return (tags.indexOf(tagName) >= 0);
  }

});
