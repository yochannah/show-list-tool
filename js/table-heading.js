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
        var namings = that.props.view.map(function (column) {
          return model.makePath(column).getDisplayName();
        });
        Q.all(namings).then(that.setStateProperty.bind(that, 'headers'));
      });

    },

    render: function () {
      return d.thead(
        null,
        d.tr(
          null,
          this.state.headers.map(this._renderHeader)));
    },

    _renderHeader: function (columnName, i) {
      return d.th({key: i}, columnName);
    }

  });

  return TableHeading;
});
