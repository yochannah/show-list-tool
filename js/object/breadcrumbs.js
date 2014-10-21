define(function (require, exports, module) {

  'use strict';

  var React  = require('react')
    , _      = require('underscore')
    , mixins = require('../mixins')
    , Caches = require('../query-cache')
    , d = React.DOM;

  var Breadcrumbs;

  exports.create = Breadcrumbs = React.createClass({

    displayName: 'Breadcrumbs'

    , render: function () {
      return d.ol({className: 'breadcrumb'},
        this.props.objects.map(this.renderCrumb));
    }

    , renderCrumb: function (object, index, all) {
      var content;
      var isLast = index === (all.length - 1);
      var classes = React.addons.classSet({
        'active': isLast
      });
      if (isLast) {
        content = this.renderObject(object);
      } else {
        content = d.a({
          href: '#',
          onClick: this.revertTo.bind(this, index)
        }, this.renderObject(object));
      }

      // Ideally the best key would be a path.
      return d.li({key: index, className: classes}, content);
    }

    , revertTo: function (at) {
      this.props.onRevert(this.props.objects.slice(0, at + 1));
    }

    , renderObject: function (object) {
      return d.span(
        {},
        object.type
      );
    }

  });

});
