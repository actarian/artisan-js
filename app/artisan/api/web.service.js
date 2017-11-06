/* global angular */

(function() {
    "use strict";

    var app = angular.module('artisan');

    app.service('WebApi', ['$http', '$promise', '$timeout', function($http, $promise, $timeout) {

        var lang = 'en'; // get from config
        var prefix = '/api';

        function $httpPromise(url, data, method) {
            return $promise(function(promise) {
                url = prefix + url;
                url += (url.split('?')[1] ? '&' : '?') + 'lang=' + lang;
                data = data || null;
                method = method || 'get';
                $http[method](url, data).then(function(response) {
                    promise.resolve(response);
                }, function(e, status) {
                    var error = e && e.data ? {
                        message: e.data.message,
                        messageDetail: e.data.messageDetail,
                        status: e.status,
                    } : e;
                    promise.reject(error);
                });
            });
        }

        function $get(url) {
            return $httpPromise(url, null, 'get');
        }

        function $post(url, data) {
            return $httpPromise(url, data, 'post');
        }

        function $put(url, model) {
            return $httpPromise(url, data, 'put');
        }

        function $patch(url, model) {
            return $httpPromise(url, data, 'patch');
        }

        function $delete(url) {
            return $httpPromise(url, null, 'delete');
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

    }]);

}());