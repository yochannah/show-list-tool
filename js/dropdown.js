define(['react'], function (React) {

  'use strict';

  var d = React.DOM;

  var Dropdown = React.createClass({

    displayName: Dropdown,

    render: function () {

      var groups = groupsOf(20, this.props.links);

      return d.div(
        {className: 'btn-group'},
        d.button(
          {className: 'btn btn-default', 'data-toggle': 'dropdown'},
          this.props.mainTitle + ' ',
          d.span({className: 'caret'})),
        d.ul(
          {ref: 'dropdownMenu', className: 'dropdown-menu', role: 'menu'},
          groups.map(function (group, i) {
            return d.li(
              {key: i, className: 'dropdown-menu-group'},
              group.map(function (link, i) { return d.div({key: i}, link); }))})));
    },

    componentDidUpdate: expandMenu,

    componentDidMount: expandMenu
  });

  return Dropdown;

  function expandMenu () {
    var node = this.refs.dropdownMenu;
    var w = 220; // hidden intially. Should be enough... :(
    var kids = node.children.length;
    node.style.width = (w * kids) + 'px';
  }

  function groupsOf (n, xs) {
    var breakAt = 0, groups = [], currentGroup;

    xs.forEach(function (x, i) {
      if (i === breakAt) {
        currentGroup = [];
        groups.push(currentGroup);
        breakAt = breakAt + n;
      }
      currentGroup.push(x);
    });

    return groups;
  }
});
