define(['react'], function (React) {

  'use strict';

  var IM_PREFIX = /^im:/i;

  var d = React.DOM;

  var TagAdder = React.createClass({

    displayName: 'TagAdder',

    getInitialState: function () {
      return {
        tagText: null,
        isValid: true
      };
    },

    render: function () {
      return d.form(
        {className: 'form-inline pull-right list-tagger',
          onSubmit:this._saveTag},
        d.div(
          {className: 'form-group' + (this.state.isValid ? '' : ' has-error')},
          d.input({ref: 'tagText', className: 'form-control input-sm', value: this.state.newTag, onChange: this._updateTag, placeholder: 'my new tag'})),
        d.button({disabled: !this.state.hasTag, className: 'btn btn-sm btn-default'}, 'Add tag')
      );
    },

    _updateTag: function () {
      var val = this.refs.tagText.value;
      var state = this.state;
      state.tagText = val;
      state.isValid = isValidTagName(val);
      state.hasTag = state.isValid && val && val.length;
      this.setState(state);
      this.props._addTag(state.tagText);
    },

    _saveTag : function handleSubmit(e) {
      e.preventDefault();
      console.log('%cThis.props: ', 'color:yellowgreen;font-weight:bold',this.props);
      console.log('%cThis.state: ', 'color:orange;font-weight:bold',this.state);
      this.props.list.addTags([this.state.tagText]);
    }

  });

  return TagAdder;

  function isValidTagName (tagName) {
    if (IM_PREFIX.test(tagName)) {
      return false;
    }
    return true;
  }

});
