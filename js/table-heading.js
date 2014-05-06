define(['react', 'q', './mixins'], function (React, Q, mixins) {
  'use strict';

  var d = React.DOM;

  var TableHeading = React.createClass({

    displayName: 'TableHeading',

    mixins: [mixins.SetStateProperty, mixins.ComputableState],

    getInitialState: function () {
      return {
        headers: []
      }
    },

    computeState: function (props) {
      var that = this;

      props.service.fetchModel().then(function (model) {
        // the first view is the id. Don't show that.
        var namings = that.props.view.slice(1).map(function (column) {
          return model.makePath(column).getDisplayName();
        });
        Q.all(namings)
         .then(function (names) {
           var lcp = longestCommonPrefix(names);
           return names.map(function (name) {
             return name.slice(lcp.length);
           });
         }).then(that.setStateProperty.bind(that, 'headers'));
      });

    },

    render: function () {
      var col0;
      if ('allSelected' in this.props) {
        col0 = d.input({
          type: 'checkbox',
          className: 'form-control',
          onChange: this._toggleAll,
          checked: this.props.allSelected
        });
      }
      return d.thead(
        null,
        d.tr(
          null,
          d.th(null, col0),
          this.state.headers.map(this._renderHeader)));
    },

    _toggleAll: function () {
      var state = this.state;
      state.allSelected = !state.allSelected;
      this.setState(state);
      this.props.onChangeAll(state.allSelected);
    },

    _renderHeader: function (columnName, i) {
      return d.th({key: i}, columnName);
    }

  });

  return TableHeading;

  function longestCommonPrefix (strings) {
    var strings = strings.slice(0).sort()
      , word1 = strings[0]
      , word2 = strings[strings.length - 1]
      , l = word1.length
      , i = 0;

    while(i < l && word1.charAt(i)=== word2.charAt(i)) i++;

    return word1.substring(0, i);
  }
});
