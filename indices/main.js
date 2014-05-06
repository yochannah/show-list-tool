// main.js
var loc = '../';
require.config({
    baseUrl: loc + 'js',
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

require(['react', 'imjs', './analysis-tools', 'bootstrap'], function (React, imjs, View) {
    'use strict';

    var listName = "PL FlyAtlas_tubules_top";
    var url = "http://www.flymine.org/query";
    var rootNode = document.body;
    var service = imjs.Service.connect({root: url});

    service.fetchList(listName).then(function showList (list) {
      var listView = new View({
        service: service,
        list: list
      });
      React.renderComponent(listView, rootNode);
    });

});
