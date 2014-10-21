define(function (require, exports, module) {

  var React     = require('react')
    , _         = require('underscore')
    , Q         = require('q')
    , intermine = require('imjs')
    , mixins    = require('../mixins')
    , Caches    = require('../query-cache')
    , d = React.DOM
    , MAX_SUMM_FIELD_LEN = 100
    , cache = Caches.getCache('rows')
    , ObjectTitle;

  module.exports = ObjectTitle = React.createClass({

    displayName: 'ObjectTitle',

    getDefaultProps: function () {
      return {open: false, toggleDetails: function () {}};
    },

    getInitialState: function () {
      return {fields: [], summaryValues: [], displayName: ''};
    },

    mixins: [mixins.ComputableState],

    render: function () {
      var summaryValues = [];
      var cx = React.addons.classSet;
      if (!this.props.openable || !this.props.open) {
        summaryValues = this.state.summaryValues.map(function (sv, i) {
          var pathSegments = sv.path.split(/\./).length; // > 2) ? 'reference' : 'attribute';
          return d.span({
            key: i,
            title: sv.path, // TODO: should be displayName
            className: cx({
              'summary-value': true,
              reference: (pathSegments > 2),
              attribute: (pathSegments < 2)
            })
          }, noLongerThanMax(sv));
        });
      }
      var typeElem = this.renderButton();

      return d.h2({className: 'object-title'}, typeElem, summaryValues);
    },

    renderButton: function () {
      var typeCls = 'label label-primary object-type';
      var type;
      if (this.props.name) {
        type = this.props.name;
        typeCls += ' name';
      } else {
        type = this.state.displayName;
      }
      var typeText = (this.props.name || this.state.extendedType) ? type : type[0];
      var buttonCls = this.props.open ? 'fa fa-caret-down' : 'fa fa-caret-right';
      if (!this.props.recursive) {
        buttonCls = '';
      }
      if (this.props.openable && this.props.open) {
        typeText = type;
      }

      return d.span({
        className: typeCls,
        onClick: (this.props.openable ? this.props.toggleDetails : NO_OP),
        onMouseEnter: this.onMouseOver,
        onMouseLeave: this.onMouseOut
      }, (this.props.openable && d.i({className: buttonCls})), typeText);
    },

    computeState: function (props) {
      var that = this;
      var runQuery = cache.submit.bind(cache);
      var queryPromise = props.service.fetchSummaryFields().then(buildQuery);
      var firstRowP = queryPromise.then(props.service.query).then(runQuery).then(first);

      Q.all([queryPromise, firstRowP]).spread(function (query, row) {
        var toPair = createPair.bind(null, query);
        that.setState({
          summaryValues: _.unique(row.map(toPair), getValue)
        });
      }).then(null, console.error.bind(console));

      props.service.fetchModel().then(function (model) {
        return model.makePath(props.object.type);
      }).then(function (path) {
        return path.getDisplayName();
      }).then(function (name) {
        that.setState({displayName: name});
      });

      function buildQuery (sfs) {
        var fields = sfs[props.object.type];
        if (props.attrsOnly) {
          fields = fields.filter(function (f) {
            return f.split(/\./).length === 2;
          });
        }

        var query = {select: fields, where: {id: props.object.id}};
        return query;
      }
    },

    onMouseOver: function (event) {
      this.setState({extendedType: true});
    },

    onMouseOut: function (event) {
      this.setState({extendedType: false});
    }
  });

  function createPair (query, value, index) {
    return {path: query.select[index], value: value};
  }

  function getValue (o) {
    return o.value;
  }

  /** Very long summary field names, such as descriptions, are dumb. **/
  function noLongerThanMax (o) {
    if (getValue(o) == null) {
      return null;
    }
    var val = String(getValue(o));
    if (val.length <= MAX_SUMM_FIELD_LEN) {
      return val;
    } else {
      return val.slice(MAX_SUMM_FIELD_LEN - 3) + '...';
    }
  }

  function logErr (msg) {
    console.error(msg);
  }

  function first (seq) {
    return seq[0];
  }

  function NO_OP () {};
});
