/* global angular */

(function() {
    "use strict";

    var app = angular.module('app');

    app.service('Api', ['WebApi', '$promise', '$location', '$routeParams', 'environment', function(WebApi, $promise, $location, $routeParams, environment) {

        var webapi = WebApi;

        var service = {
            menu: function() {
                return webapi.get('/menu.js'); // promise
            },
            doc: function() {
                return $promise(function(promise) {
                    service.menu().then(function(response) {
                        var doc = null;
                        var currentUrl = $location.path();
                        angular.forEach(response.data, function(item) {
                            console.log(item.url, $routeParams.slug);
                            if (item.url === currentUrl) {
                                doc = angular.extend({
                                    language: environment.language,
                                    url: currentUrl,
                                    params: $routeParams,
                                }, item);
                            }
                        });
                        promise.resolve(doc);
                    }, function(error) {
                        promise.reject(error);
                    });
                });
            }
        };

        angular.extend(this, service);

        // var args = Array.prototype.slice.call(arguments);

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