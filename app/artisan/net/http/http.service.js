/* global angular */

(function () {
	"use strict";

	var app = angular.module('artisan');

	app.service('Http', ['$http', '$promise', '$timeout', 'environment', function ($http, $promise, $timeout, environment) {

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

			function HttpPromise(method, url, data) {
				return $promise(function (promise) {
					$http[method](environment.urls.api + url, data).then(function (response) {
						promise.resolve(response.data);

					}, function (e, status) {
						var error = (e && e.data) ? e.data : {};
						error.status = e.status;
						promise.reject(error);

					});
				});
			}

			function HttpGet(url) {
				return HttpPromise('get', url);
			}

			function HttpPost(url, data) {
				return HttpPromise('post', url, data);
			}

			function HttpPut(url, data) {
				return HttpPromise('put', url, data);
			}

			function HttpPatch(url, data) {
				return HttpPromise('patch', url, data);
			}

			function HttpDelete(url) {
				return HttpPromise('delete', url);
			}

			function HttpFake(data) {
				var deferred = $q.defer();
				$timeout(function () {
					deferred.resolve({
						data: data
					});
				}, 1000);
				return deferred.promise;
			}

        }
    ]);

}());