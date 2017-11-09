/* global angular */

(function() {
    "use strict";

    var app = angular.module('artisan');

    app.factory('Doc', ['Api', '$promise', '$location', '$routeParams', 'environment',
        function(Api, $promise, $location, $routeParams, environment) {

            function Doc(item) {
                angular.extend(this, {
                    url: $location.path(),
                    params: $routeParams,
                });
                angular.extend(this, environment);
                if (item) {
                    angular.extend(this, item);
                }
            }

            Doc.prototype = {

            };

            var statics = {
                current: function() {
                    return $promise(function(promise) {
                        Api.menu().then(function(items) {
                            var doc = null,
                                url = $location.path();
                            angular.forEach(items, function(item) {
                                if (item.url === url) {
                                    doc = new Doc(item);
                                }
                                console.log(item, item.url, url);
                            });
                            promise.resolve(doc);
                        }, function(error) {
                            promise.reject(error);
                        });
                    });
                }
            };

            angular.extend(Doc, statics);

            return Doc;
        }
    ]);

}());