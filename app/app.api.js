/* global angular */

(function() {
    "use strict";

    var app = angular.module('app');

    app.service('Api', ['WebApi', '$promise',
        function(WebApi, $promise) {

            var service = {
                navs: {
                    main: function() {
                        return WebApi.get('/navs/main.js'); // promise
                    },
                },
                docs: {
                    id: function(id) {
                        return WebApi.get('/docs/' + id + '.js'); // promise
                    },
                    url: function(url) {
                        url = url.split('/').join('-');
                        return WebApi.get('/docs/' + url + '.js'); // promise
                    },
                },
            };

            angular.extend(this, service);

            // var args = Array.prototype.slice.call(arguments);
        }
    ]);

    /*
    app.provider('$api', [function $apiProvider() {

        var routes = {};

        this.routes = routes;
        this.when = when;

        function when(path, callback) {
            var api = this;
            routes[path] = callback;
            return api;
        }

        this.$get = ['$q', '$timeout', function $apiFactory($q, $timeout) {

            var api = {};

            angular.extend(api, routes);

            return api;

        }];

    }]);
    */

}());