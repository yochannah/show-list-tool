// main.js
require.config({
    baseUrl: 'js',
    paths: {
        jquery: '../bower_components/jquery/dist/jquery',
        q: '../bower_components/q/q',
        underscore: '../bower_components/underscore/underscore',
        bootstrap: '../bower_components/bootstrap/dist/js/bootstrap.min',
        react: '../bower_components/react/react-with-addons', 
        jschannel: '../bower_components/jschannel/src/jschannel',
        imjs: '../bower_components/imjs/js/im'
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

require(['react', 'imjs', './object/report', 'bootstrap'], function (React, imjs, View) {
    'use strict';

    var listName = "PL FlyAtlas_tubules_top";
    var url = "http://www.flymine.org/query";
    var rootNode = document.body;
    var service = imjs.Service.connect({root: url});

    service.fetchList(listName)
          .then(getFirstObject)
          .then(function showObj (obj) {

      var view = View.create({
        service: service,
        object: {id: obj['objectId'], type: obj['class']}
      });
      React.renderComponent(view, rootNode);
    });

    function getFirstObject (list) {
      return list.contents().then(function (xs) { return xs[0]; });
    }

});
