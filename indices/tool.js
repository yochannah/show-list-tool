// main.js
require.config({
    baseUrl: '/js',
    paths: {
        jquery: '/bower_components/jquery/dist/jquery',
        q: '/bower_components/q/q',
        underscore: '/bower_components/underscore/underscore',
        bootstrap: '/bower_components/bootstrap/dist/js/bootstrap.min',
        react: '/bower_components/react/react-with-addons', 
        jschannel: '/bower_components/jschannel/src/jschannel',
        imjs:  '/bower_components/imjs/js/im'
    },
    shim: {
        backbone: {
            deps: [
                'underscore',
                'jquery'
            ],
            exports: 'Backbone'
        },
        bootstrap: {
          deps: ['jquery'],
          exports: '$'
        },
        jschannel: {
          exports: 'Channel'
        },
        underscore: {
            deps: [
            ],
            exports: '_'
        },
        react: {
            exports: 'React',
        }
    }
});

require(['react', 'imjs', './analysis-tools', 'jschannel', 'bootstrap'], function (React, imjs, View, Channel) {
    'use strict';

    var chan = Channel.build({
      window: window.parent,
      origin: '*',
      scope: 'CurrentStep'
    });

    chan.bind('init', function (trans, params) {

      var listName = params.listName;
      var serviceArgs = params.service;
      var rootNode = document.body;
      var service = imjs.Service.connect(serviceArgs);

      service.fetchList(listName).then(function showList (list) {
        var listView = new View({
          service: service,
          list: list
        });
        React.renderComponent(listView, rootNode);
      });
    });

    // Inherit parent styles by importing stylesheets.
    var oHead = document.getElementsByTagName("head")[0];
    var arrStyleSheets = window.parent.document.getElementsByTagName("link");
    for (var i = 0; i < arrStyleSheets.length; i++)
        oHead.appendChild(arrStyleSheets[i].cloneNode(true));
});
