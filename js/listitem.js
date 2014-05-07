define(['react', 'underscore', './grid-formatters'], function (React, _, formatters) {
  'use strict';

  var d      = React.DOM
    , div    = React.DOM.div
    , strong = React.DOM.strong
    , em     = React.DOM.em
    , h5     = React.DOM.h5
    , p      = React.DOM.p;

  var ListItem = React.createClass({

    displayName: 'ListItem',

    render: function () {
      try {
      var item = this.props.item;
      var view = this.props.view;
      var content, formatter;
      if (formatter = formatters[this.props.type]) {
        content = formatter(this.props);
      } else {
        content = [
          h5({key: 'header'}, strong({}, idents(item, view).join(' '))),
          p({key: 'text'}, line2(item, view)),
          p({key: 'note'}, em({}, subtext(item, view)))
        ];
      }

      var iconClass = this.props.selected ? 'fa-star' : 'fa-star-o';
      return div(
        {className: this.props.className},
        div(
          {onClick: this._select, className: 'thumbnail'},
          d.i({className: 'pointer pull-right fa ' + iconClass}),
          content));
      } catch (e) {
        console.error(e);
        return d.div({className: 'alert alert-danger'}, String(e));
      }
    },

    _select: function () {
      this.props.onChangeSelected(this.props.item[0], !this.props.selected);
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
