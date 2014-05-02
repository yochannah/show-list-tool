define(['react', './listheading', './listcontents', './breadcrumbs', './analysis-tools'],
    function (React, Heading, Contents, BreadCrumbs, AnalysisTools) {
  'use strict';

  var ListView = React.createClass({
    displayName: 'ListView',
    getInitialState: function () {
      return {
        path: this.props.list.type,
        filterTerm: null,
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
          updateFilter: this._setFilterTerm,
          revertTo: this._revertTo
        }),
        Contents({
          service: this.props.service,
          list: this.props.list,
          classkeys: this.state.classkeys,
          path: this.state.path,
          filterTerm: this.state.filterTerm
        }),
        AnalysisTools({
          service: this.props.service,
          list: this.props.list
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
    },
    _setFilterTerm: function setFilterTerm (value) {
      var state = this.state;
      state.filterTerm = value;
      this.setState(state);
    }
  });


  return ListView;
});
