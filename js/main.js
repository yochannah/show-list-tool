// main.js
require.config({
    baseUrl: '/js',
    paths: {
        jquery: '/bower_components/jquery/jquery',
        underscore: '/bower_components/underscore/underscore',
        backbone: '/bower_components/backbone/backbone',
        react: '/bower_components/react/react',
        jschannel: '/bower_components/jschannel/src/jschannel',
        imjs:  '/bower_components/imjs/js/im.js'
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

require(['react', 'jschannel', './listview'], function (React, Channel, ListView) {
    'use strict';

    var currentView = null;
    var rootNode = document.body;
    
    if (window.parent === window) {
      var listView = new ListView({
        url: "http://www.flymine.org/query",
        listName: "PL FlyAtlas_brain_top"
      });
      React.renderComponent(listView, rootNode);
      currentView = listView;
    } else {
      var chan = Channel.build({
        window: window.parent,
        origin: '*',
        scope: 'CurrentStep'
      });

      chan.bind('init', function (trans, params) {
        var listView = new ListView(params);
        React.renderComponent(listView, rootNode);
        currentView = listView;
        return 'ok';
      });
    } 
});
