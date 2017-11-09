/* global angular */

(function() {
    "use strict";

    var app = angular.module('app');

    app.service('Api', ['WebApi', '$promise',
        function(WebApi, $promise) {

            var service = {
                menu: function() {
                    return WebApi.get('/menu.js'); // promise
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