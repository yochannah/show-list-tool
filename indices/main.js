// main.js
require.config({
    baseUrl: 'js',
    paths: {
        jquery: '../bower_components/jquery/dist/jquery',
        q: '../bower_components/q/q',
        underscore: '../bower_components/underscore/underscore',
        bootstrap: '../bower_components/bootstrap/dist/js/bootstrap.min',
        react: '../bower_components/react/react-with-addons',
        reactdom: '../bower_components/react/react-dom',
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
            exports: 'React'
        },
        reactdom: {
            exports: 'ReactDOM'
        }
    }
});

require(['react', 'reactdom', 'imjs', './analysis-tools', 'bootstrap'], function (React, ReactDOM, imjs, View) {
    'use strict';

//    var listName = "PL FlyAtlas_tubules_top";
    var listName = "My awesome list";
//    var url = "http://www.flymine.org/query";

    var url = "http://mynock:8080/flymine/service";
    var rootNode = document.getElementById('showlist');
    var service = imjs.Service.connect({root: url, token:'v1I54009a4N65c75K6Cf'});
    service.fetchList(listName).then(function showList (list) {
      try {
      ReactDOM.render(React.createElement(View, {
        service: service,
        list: list,
        onSelectedItems: reportItems,
        executeQuery: executeQuery,
        wants: wants
      }), rootNode);
    } catch(e){console.error(e);}
    });
    function reportItems (path, type, ids) {
      console.log("The user selected " + ids.length + " " + type + "s from " + path);
    }

    function executeQuery (title, query) {
      console.log("Runnning " + title, query);
    }

    function wants (message) {
      console.log("WANT", message);
    }

    function nextStep (data) {
      console.log("And now for something a little different:", data);
    }

});
