define(['react', 'imjs', 'q', './query-cache', './predicates', './mixins'], function (React, imjs, Q, Caches, predicates, mixins) {
  'use strict';

  var TIMEOUT = 10000; // ten seconds ought to be enough for anybody.
  var d = React.DOM;
  var isEditable = predicates.isEditable;
  var countCache = Caches.getCache('count');

  var TemplateLine = React.createClass({

    displayName: 'TemplateLine',

    mixins: [mixins.ComputableState],

    getInitialState: function () {
      return {
        query: {},
        count: "Counting...",
        title: this.props.template.title
      };
    },

    render: function () {
      var category = this._getCategory();
      return d.li(
        {className: 'list-group-item' + category},
        d.span(
          {className: 'pull-right badge'},
          this.state.count),
        d.a(
          {className: (this.state.count === 0 ? 'disabled' : ''), onClick: this._handleClick},
          this.state.title),
        d.p(null, d.small(null, this.props.template.description)));
    },

    componentWillUnmount: function () {
      if (this._pendingRequest) {
        this._pendingRequest.reject('unmount');
      }
    },

    _getCategory: function () {
      if (this.state.error) {
        return ' list-group-item-danger';
      } else if (this.state.count === 'timeout') {
        return ' list-group-item-warning';
      } else {
        return '';
      }
    },

    _handleClick: function () {
      this.props.onChoose(this.props.template);
    },

    // Required by ComputableState
    computeState: function computeState (props) {
      var that = this
        , service = props.service
        , state = this.state;

      state.title = props.template.title.replace(/-->/g, '\u21E8').replace(/<--/g, '\u21E6');
      that.setState(state);

      service.fetchModel().then(function (model) {
        var state = that.state;
        var constraint = props.template.where.filter(isEditable)[0];
        var newConstraint = {op: 'IN', value: props.list.name};

        var query = new imjs.Query(props.template, service);
        query.model = model;
        var path = query.makePath(constraint.path);
        if (path.isAttribute()) path = path.getParent();

        newConstraint.path = path.toString();

        query.removeConstraint(constraint);
        query.addConstraint(newConstraint);

        if (JSON.stringify(query.toJSON()) !== JSON.stringify(state.query)) {
          var req, timeout;
          state.query = query.toJSON();
          that.setState(state);

          req = that._pendingRequest = Q.defer();

          timeout = setTimeout(function () {
            req.reject('timeout');
            state.count = 'timeout';
            that.setState(state);
          }, TIMEOUT);

          req.promise.then(onSuccess.bind(null, timeout), onError.bind(null, timeout));

          countCache.submit(query).then(req.resolve, req.reject);
        }

        function onSuccess (to, n) {
          clearTimeout(to);
          var state = that.state;
          state.count = n;
          that.setState(state);
        }

        function onError (to, e) {
          clearTimeout(to);
          var state = that.state;
          state.count = 'error';
          state.error = e;
          that.setState(state);
        }

      });
    }
  });

  return TemplateLine;

});
