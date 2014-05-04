define(['react', 'underscore', './filter-box'], function (React, _, FilterBox) {
  'use strict';

  var li = React.DOM.li
    , ol = React.DOM.ol
    , a  = React.DOM.a;

  var BreadCrumbs = React.createClass({

    displayName: 'BreadCrumbs',

    getInitialState: function () {
      return {
        references: [],
        segments: []
      };
    },

    render: function () {

      var segments = this.state.segments.map(function (seg, i, a) {
        var isLast = i + 1 == a.length;
        if (isLast) {
          return li({key: seg, className: 'active'}, seg.segment);
        } else {
          return li(
            {key: seg.path},
            React.DOM.a(
              {onClick: this.props.revertTo.bind(null, seg.path)},
              seg.segment));
        }
      }.bind(this));
      
      return ol(
          {className: 'breadcrumb'},
          segments,
          li({},
            React.DOM.div(
              {className: 'btn-group'},
              React.DOM.button(
                {className: 'btn btn-default', 'data-toggle': 'dropdown'},
                "Proceed to ",
                React.DOM.span({className: 'caret'})),
              React.DOM.ul(
                {className: 'dropdown-menu', role: 'menu'},
                this.state.references.map(function (ref, i) {
                  return li(
                    {key: i},
                    a({onClick: this.props.proceedTo.bind(null, ref)}, ref.name));
                }.bind(this))))));
    },

    componentWillMount: function () {
      this._determineSegments(this.props);
      this._determineReferences(this.props);
    },
    componentWillReceiveProps: function (nextProps) {
      this._determineSegments(nextProps);
      this._determineReferences(nextProps);
    },
    _determineReferences: function(props) {
      var that = this;

      props.service.fetchModel().then(function (model) {
        var state = that.state;
        var path = model.makePath(props.path);
        var fields = path.getType().fields;
        state.references = _.values(fields).filter(isReference);
        state.references.sort(function (a, b) {
          if (a.name > b.name) {
            return 1;
          } else if (a.name < b.name) {
            return -1;
          }
          return 0;
        });
        that.setState(state);
      });
    },
    _determineSegments: function (props) {
      var i, l, part, path
        , that = this
        , service = props.service
        , parts = props.path.split('.')
        , segments = Array(parts.length)
        , base = parts[0]
        , paths = [base];

      for (i = 1, l = parts.length; i < l; i++) {
        part = parts[i];
        path = base + '.' + part;
        paths.push(path);
        base = path;
      }

      paths.forEach(function (path, i) {
        service.fetchModel().then(function(model) {
          var pathInfo = model.makePath(path);
          pathInfo.getDisplayName().then(function (name) {
            var state = that.state;
            var end = name.split(' > ').pop();
            segments[i] = {segment: end, path: path};
            state.segments = segments.slice().filter(bool);
            that.setState(state);
          });
        });
      });
    }
  });

  return BreadCrumbs;

  function bool (x) {
    return !!x;
  }

  function isReference (fld) {
    return !!fld.referencedType;
  }

});
