define(['react', './listcontents', './breadcrumbs'],
    function (React, Contents, BreadCrumbs, AnalysisTools) {
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
          path: this.state.path,
          filterTerm: this.props.filterTerm
        }));
    },
    _revertTo: function revertTo (path) {
      var state = this.state;
      state.path = path;
      this.setState(state);
    },
    _proceedTo: function proceedTo (ref) {
      var state = this.state;
      state.path += "." + ref.name;
      this.setState(state);
    }
  });


  return ListView;
});
