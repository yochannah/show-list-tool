define(['react', 'imjs', 'q', './query-cache', './predicates', './mixins', './formatting'],
    function (React, imjs, Q, Caches, predicates, mixins, formatting) {
  'use strict';

  var TIMEOUT = 60000; // sixty seconds ought to be enough for anybody.
  var d = React.DOM;
  var isEditable = predicates.isEditable;
  var formatNumber = formatting.formatNumber;
  var countCache = Caches.getCache('count');

  var TemplateLine = React.createClass({

    displayName: 'TemplateLine',

    mixins: [mixins.ComputableState],

    getInitialState: function () {
      return {
        query: {},
        count: null,
        title: this.props.template.title
      };
    },

    render: function () {
      var category = this._getCategory();
      return d.li(
        {className: 'template-line list-group-item' + category},
        d.span(
          {className: 'pull-right badge'},
          (this.state.count != null) ? formatNumber(this.state.count) : (this.state.error || "counting...")),
        d.a(
          {className: (this.state.count === 0 ? 'disabled' : ''), onClick: this._handleClick},
          this.state.title),
        d.p({className: 'description'}, d.small(null, this._renderDescription())));
    },

    _renderDescription: function () {
      var unmatch, match;
      var filterTerm = this.props.filterTerm;
      var desc = this.props.template.description;
      if (!filterTerm || !desc) {
        return desc;
      }

      var spans = [];

      var key = 0;
      while (desc.length) {
        var idx = desc.toLowerCase().indexOf(this.props.filterTerm);
        if (idx === 0) {
          match = desc.slice(0, filterTerm.length);
          spans.push(d.span({className: 'match', key: key++}, match));

          console.log(match);

          desc = desc.slice(filterTerm.length);
        } else if (idx > 0) {
          unmatch = desc.slice(0, idx);
          spans.push(d.span({key: key++}, unmatch));
          match = desc.slice(idx, idx + filterTerm.length);
          spans.push(d.span({className: 'match', key: key++}, match));
          console.log(unmatch);
          console.log(match);

          desc = desc.slice(idx + filterTerm.length);
        } else {
          console.log(desc);
          spans.push(d.span({key: key++}, desc));
          desc = '';
        }
      }

      return spans;

    },

    componentWillUnmount: function () {
      if (this._pendingRequest) {
        this._pendingRequest.reject('unmount');
      }
    },

    _getCategory: function () {
      if (this.state.error === 'error') {
        return ' list-group-item-danger';
      } else if (this.state.error === 'timeout') {
        return ' list-group-item-warning';
      } else if (this.state.count === 0) {
        return ' no-results';
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
            state.error = 'timeout';
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
          state.error = 'error';
          that.setState(state);
        }

      });
    }
  });

  return TemplateLine;

});
