/* global angular */

(function() {
	"use strict";

	var app = angular.module('artisan');

	app.factory('Route', ['$promise', '$location', '$route', '$routeParams', 'Router', function($promise, $location, $route, $routeParams, Router) {

		function Route(current) {

			var route = {
				controller: current.$$route.controller,
				params: current.params,
				path: $location.path(),
				pathParams: current.pathParams,
				originalPath: current.$$route.originalPath,
				templateUrl: current.loadedTemplateUrl,
			};
			angular.extend(this, route);
		}

		var statics = {
			current: RouteCurrent,
		};

		var publics = {};

		angular.extend(Route, statics);
		angular.extend(Route.prototype, publics);

		return Route;

		// static methods

		function RouteCurrent() {
			return new Route($route.current);
		}

		// prototype methods

    }]);

}());
