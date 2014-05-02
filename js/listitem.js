define(['react', 'underscore'], function (React, _) {
  'use strict';

  var div    = React.DOM.div
    , strong = React.DOM.strong
    , em     = React.DOM.em
    , h5     = React.DOM.h5
    , p      = React.DOM.p;

  var ListItem = React.createClass({
    displayName: 'ListItem',
    render: function () {
      var item = this.props.item;
      var view = this.props.view;
      return div(
        {className: this.props.className},
        div(
          {className: 'thumbnail'},
          h5(null, strong({}, idents(item, view).join(' '))),
          p(null, line2(item, view)),
          p(null, em({}, subtext(item, view)))));
    }
  });

  return ListItem;

  function idents (values, paths) {
    var i, l, v, p, idents = [];
    for (i = 1, l = values.length; i < l; i++) {
      v = values[i];
      p = paths[i];
      if (v) {
        if (!/primaryIdentifier$/.test(p)
            && !/\.(journal|volume|pages|pubMedId)$/.test(p)
            && !/organism\.[^\.]+$/.test(p)) {
          idents.push(v);
        }
      }
    }
    return _.unique(idents);
  }

  function line2 (values, paths) {
    var i, l, v, p, idents = [];
    for (i = 1, l = values.length; i < l; i++) {
      v = values[i];
      p = paths[i];
      if (v) {
        if (/primaryIdentifier$/.test(p)
            || /\.(journal|volume|pages|pubMedId)$/.test(p)) {
          idents.push(v);
        }
      }
    }
    return idents.join(' ');
  }


  function subtext (values, paths) {
    var i, l, v, p, idents = [];
    for (i = 1, l = values.length; i < l; i++) {
      v = values[i];
      p = paths[i];
      if (v && (/organism\.[^\.]+$/.test(p))) {
        idents.push(v);
      }
    }
    return idents.join(' ');
  }

  function bool (x) {
    return !!x;
  }
});
