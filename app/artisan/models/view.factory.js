/* global angular */

(function () {
	"use strict";

	var app = angular.module('artisan');

	app.factory('View', ['Api', '$promise', '$location', '$routeParams', 'environment', 'Doc', function (Api, $promise, $location, $routeParams, environment, Doc) {

		function View(doc) {
			var url = $location.path(),
				params = $routeParams;
			var view = {
				environment: environment,
				route: {
					url: url,
					params: params,
				},
				doc: doc,
			};
			angular.extend(this, view);
		}

		var statics = {
			current: ViewCurrent,
		};

		var methods = {};

		angular.extend(View, statics);
		angular.extend(View.prototype, methods);

		return View;

		// static methods

		function ViewCurrent() {
			return $promise(function (promise) {
				var url = $location.path();
				console.log('View.current', url);
				Api.docs.url(url).then(function (response) {
					var doc = new Doc(response);
					var view = new View(doc);
					promise.resolve(view);

				}, function (error) {
					promise.reject(error);

				});
				/*
				Api.navs.main().then(function(items) {
				    var doc = null,
				        url = $location.path(),
				        pool = getPool(items);
				    var item = pool[url];
				    if (item) {
				        doc = new Doc(item);
				    }
				    promise.resolve(doc);

				}, function(error) {
				    promise.reject(error);

				});
				*/
			});
		}

		function ViewPool(items) {
			var pool = {};

			function _getPool(items) {
				if (items) {
					angular.forEach(items, function (item) {
						pool[item.url] = item;
						_getPool(item.items);
					});
				}
			}
			_getPool(items);
			return pool;
		}

		// prototype methods

    }]);

}());