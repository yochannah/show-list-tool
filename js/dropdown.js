define(['react'], function (React) {

  var d = React.DOM;

  var Dropdown = React.createClass({

    displayName: Dropdown,

    render: function () {
      return d.div(
        {className: 'btn-group'},
        d.button(
          {className: 'btn btn-default', 'data-toggle': 'dropdown'},
          this.props.mainTitle + ' ',
          d.span({className: 'caret'})),
        d.ul(
          {className: 'dropdown-menu', role: 'menu'},
          this.props.links.map(function (link, i) { return d.li({key: i}, link); })));
    }
  });

  return Dropdown;
});
