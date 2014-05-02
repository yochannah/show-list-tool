define(['react', './listheading', './listcontents', './breadcrumbs'], function (React, Heading, Contents, BreadCrumbs) {
  'use strict';

  var ListView = React.createClass({
    displayName: 'ListView',
    getInitialState: function () {
      return {
        path: this.props.list.type,
        classkeys: {}
      }
    },
    componentDidMount: function () {
      var that = this;
      this.props.service.fetchClassKeys().then(function (classkeys) {
        var state = that.state;
        state.classkeys = classkeys;
        that.setState(state);
      });
    },
    render: function () {
      return React.DOM.div({},
        Heading(this.props.list),
        BreadCrumbs({
          path: this.state.path,
          service: this.props.service,
          proceedTo: this._proceedTo,
          revertTo: this._revertTo
        }),
        Contents({
          service: this.props.service,
          list: this.props.list,
          classkeys: this.state.classkeys,
          path: this.state.path
        }));
    },
    _revertTo: function revertTo (path) {
      var state = this.state;
      state.path = path;
      this.setState(state);
    },
    _proceedTo: function proceedTo (ref) {
      var path = this.state.path;
      var classkeys = this.state.classkeys;
      path += "." + ref.name;
      this.setState({path: path, classkeys: classkeys});
    }
  });


  return ListView;
});
