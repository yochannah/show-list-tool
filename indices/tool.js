// main.js
var loc = '../';
require.config({
    baseUrl: 'js',
    paths: {
        jquery: loc + 'bower_components/jquery/dist/jquery',
        q: loc + 'bower_components/q/q',
        underscore: loc + 'bower_components/underscore/underscore',
        bootstrap: loc + 'bower_components/bootstrap/dist/js/bootstrap.min',
        react: loc + 'bower_components/react/react-with-addons', 
        jschannel: loc + 'bower_components/jschannel/src/jschannel',
        imjs:  loc + 'bower_components/imjs/js/im'
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
          list: list,
          onSelectedItems: reportItems
        });
        React.renderComponent(listView, rootNode);

        chan.notify({
          method: 'has-list',
          params: {
            root: service.root,
            name: list.name,
            type: list.type
          }
        });

      });

      return 'ok';
    });

    chan.bind('style', function (trans, params) {

      var head = document.getElementsByTagName("head")[0];
      var link = document.createElement('link');

      link.rel = "stylesheet";
      link.href = params.stylesheet;

      head.appendChild(link);

    });

    function reportItems (path, type, ids) {
      chan.notify({
        method: 'has-items',
        params: {
          key: path,   // String - any identifier.
          noun: type, // String - eg: "Protein"
          categories: ['selected'],
          ids: ids  // Array[Int] - eg: [123, 456, 789]
        }
      });
    }

});
