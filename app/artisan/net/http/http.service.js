/* global angular */

(function() {
    "use strict";

    var app = angular.module('artisan');

    app.service('Http', ['$http', '$promise', '$timeout', 'environment', function($http, $promise, $timeout, environment) {

        var service = this;

        var statics = {
            get: HttpGet,
            post: HttpPost,
            put: HttpPut,
            patch: HttpPatch,
            'delete': HttpDelete,
            fake: HttpFake,
        };

        angular.extend(service, statics);

        // statics methods

        function HttpPath(path) {
            return environment.paths.api + path;
        }

        function HttpPromise(method, path, data) {
            return $promise(function(promise) {
                $http[method](HttpPath(path), data).then(function(response) {
                    promise.resolve(response.data);

                }, function(e, status) {
                    var error = (e && e.data) ? e.data : {};
                    error.status = e.status;
                    promise.reject(error);

                });
            });
        }

        function HttpGet(path) {
            return HttpPromise('get', path);
        }

        function HttpPost(path, data) {
            return HttpPromise('post', path, data);
        }

        function HttpPut(path, data) {
            return HttpPromise('put', path, data);
        }

        function HttpPatch(path, data) {
            return HttpPromise('patch', path, data);
        }

        function HttpDelete(path) {
            return HttpPromise('delete', path);
        }

        function HttpFake(data, msec) {
            msec = msec || 1000;
            return $promise(function(promise) {
                $timeout(function() {
                    promise.resolve({
                        data: data
                    });
                }, msec);
            });
        }

    }]);

}());