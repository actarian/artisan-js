/* global angular */

(function () {
	"use strict";

	var app = angular.module('artisan');

	app.factory('$promise', ['$q', function ($q) {

		function $promise(callback) {
			if (typeof callback !== 'function') {
				throw ('promise resolve callback missing');
			}
			var deferred = $q.defer();
			callback(deferred);
			return deferred.promise;
		}

		var statics = {
			all: $promiseAll,
		};

		var methods = {};

		angular.extend($promise, statics);
		angular.extend($promise.prototype, methods);

		return $promise;

		function $promiseAll(promises) {
			return $q.all(promises);
		}

    }]);

}());