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

		function HttpUrl(url) {
			return environment.paths.api + url;
		}

		function HttpPromise(method, url, data) {
			return $promise(function (promise) {
				$http[method](HttpUrl(url), data).then(function (response) {
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

		function HttpFake(data, msec) {
			msec = msec || 1000;
			return $promise(function (promise) {
				$timeout(function () {
					promise.resolve({
						data: data
					});
				}, msec);
			});
		}

    }]);

}());