// main.js
require.config({
    baseUrl: '/js',
    paths: {
        jquery: '/bower_components/jquery/jquery',
        underscore: '/bower_components/underscore/underscore',
        backbone: '/bower_components/backbone/backbone',
        react: '/bower_components/react/react',
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

require(['react', 'imjs', './listview'], function (React, imjs, ListView) {
    'use strict';

    var rootNode = document.body;
    var service = imjs.Service.connect({root: "http://www.flymine.org/query"});

    service.fetchList('PL FlyAtlas_brain_top').then(function showList (list) {
      var listView = new ListView({
        service: service,
        list: list
      });
      React.renderComponent(listView, rootNode);
    });

});
