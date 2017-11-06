/* global angular */

(function() {
    "use strict";

    var app = angular.module('app');

    app.service('Api', ['WebApi', '$filter', function(WebApi, $filter) {

        var service = WebApi;

        this.menu = function() {
            // var args = Array.prototype.slice.call(arguments);
            return service.get('/menu.js'); // promise
        };

    }]);

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