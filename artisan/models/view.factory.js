/* global angular */

(function() {
	"use strict";

	var app = angular.module('artisan');

	app.factory('View', ['Api', '$promise', 'environment', 'Doc', 'Route', function(Api, $promise, environment, Doc, Route) {

		function View(doc, route) {
			var view = {
				doc: doc,
				environment: environment,
				route: route,
			};
			angular.extend(this, view);
		}

		var statics = {
			current: ViewCurrent, // ViewCurrentSimple
		};

		var publics = {};

		angular.extend(View, statics);
		angular.extend(View.prototype, publics);

		return View;

		// static methods

		function ViewCurrent() {
			return $promise(function(promise) {
				var route = Route.current();
				var path = route.path;
				console.log('ViewCurrent', path);
				Api.docs.path(path).then(function(response) {
					var doc = new Doc(response);
					var view = new View(doc, route);
					promise.resolve(view);

				}, function(error) {
					promise.reject(error);

				});
			});
		}

		function ViewCurrentSimple() {
			return $promise(function(promise) {
				console.log('ViewCurrentSimple');
				var route = Route.current();
				var path = route.path;
				Api.navs.main().then(function(items) {
					var doc = null,
						view = null,
						path = path,
						pool = ViewPool(items);
					var item = pool[path];
					if (item) {
						doc = new Doc(item);
						view = new View(doc, route);
					}
					promise.resolve(view);

				}, function(error) {
					promise.reject(error);

				});
			});
		}

		function ViewPool(items) {
			var pool = {};

			function _getPool(items) {
				if (items) {
					angular.forEach(items, function(item) {
						pool[item.path] = item;
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
