define(['react', 'underscore'], function (React, _) {
  'use strict';

  var ul = React.DOM.ul
    , li = React.DOM.li
    , span = React.DOM.span
    , a  = React.DOM.a;

  var Pager = React.createClass({

    displayName: 'Pager',

    render: function () {
      try {
      var props = this.props;
      var nSelected = props.selected.all ? props.length : _.values(props.selected).filter(_.identity).length;
      var selectedTitle = (props.selected.all ? 'All' : nSelected) + ' selected';
      var selectedIcon;
      if (props.selected.all) {
        selectedIcon = 'fa-star';
      } else if (nSelected) {
        selectedIcon = 'fa-star-half-o';
      } else {
        selectedIcon = 'fa-star-o';
      }
      var summary = "Items " + (props.offset + 1) + " to " + (props.offset + props.size) + " of " + props.length;

      return ul({className: 'pager'},
        li({className: 'previous' + (props.offset ? '' : ' disabled')}, a({onClick: props.back}, "Back")),
        li(null,
          span(
            {
              className: 'clickable',
              onClick: this._toggleSelectAll
            },
            React.DOM.i({
              title: selectedTitle,
              className: 'pointer pull-right fa ' + selectedIcon
            }),
            span({className: 'summary'}, summary))),
        li({className: 'next' + (props.offset + props.size >= props.length ? ' disabled' : '')}, a({onClick: props.next}, "Next")));

      } catch (e) {
        console.error(e);
        return span({className: 'error'}, String(e));
      }
    },

    _toggleSelectAll: function () {
      this.props.onAllSelected(!this.props.selected.all);
    }
  });

  return Pager;
});
