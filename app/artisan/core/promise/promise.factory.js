/* global angular */

(function() {
    "use strict";

    var app = angular.module('artisan');

    app.factory('$promise', ['$q', function($q) {
        function $promise(callback) {
            if (typeof callback !== 'function') {
                throw ('promise resolve callback missing');
            }
            var deferred = $q.defer();
            callback(deferred);
            return deferred.promise;
        }
        var statics = {
            all: function(promises) {
                return $q.all(promises);
            },
        };
        angular.extend($promise, statics);
        return $promise;
    }]);

}());