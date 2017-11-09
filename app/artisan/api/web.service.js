/* global angular */

(function() {
    "use strict";

    var app = angular.module('artisan');

    app.service('WebApi', ['$http', '$promise', '$timeout', 'environment',
        function($http, $promise, $timeout, environment) {

            function $httpPromise(method, url, data) {
                return $promise(function(promise) {

                    $http[method](environment.api + url, data).then(function(response) {
                        promise.resolve(response.data);

                    }, function(e, status) {
                        var error = (e && e.data) ? e.data : {};
                        error.status = e.status;
                        promise.reject(error);

                    });
                });
            }

            function $get(url) {
                return $httpPromise('get', url);
            }

            function $post(url, data) {
                return $httpPromise('post', url, data);
            }

            function $put(url, data) {
                return $httpPromise('put', url, data);
            }

            function $patch(url, data) {
                return $httpPromise('patch', url, data);
            }

            function $delete(url) {
                return $httpPromise('delete', url);
            }

            function $fake(data) {
                var deferred = $q.defer();
                $timeout(function() {
                    deferred.resolve({ data: data });
                }, 1000);
                return deferred.promise;
            }

            this.get = $get;
            this.post = $post;
            this.put = $put;
            this.patch = $patch;
            this.delete = $delete;
            this.fake = $fake;

        }
    ]);

}());