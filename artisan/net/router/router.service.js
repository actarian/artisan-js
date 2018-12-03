/* global angular */

(function() {
	"use strict";

	var app = angular.module('artisan');

	app.service('Router', ['$rootScope', '$location', '$route', '$timeout', function($rootScope, $location, $route, $timeout) {

		var service = this;

		var statics = {
			isController: RouterIsController,
			redirect: RouterRedirect,
			path: RouterPath,
			apply: RouterApply,
		};

		angular.extend(service, statics);

		$rootScope.$on('$routeChangeStart', RouterOnChangeStart);
		$rootScope.$on('$routeChangeSuccess', RouterOnChangeSuccess);
		$rootScope.$on('$routeChangeError', RouterOnChangeError);
		$rootScope.$on('$routeUpdate', RouterOnUpdate);
		$rootScope.$on('$stateReady', RouterOnStateReady);

		var $previous, $current, $next;
		var $previousController, $currentController, $nextController;

		function RouterSetControllers() {
			$previousController = $previous ? $previous.controller : null;
			$currentController = $current ? $current.controller : null;
			$nextController = $next ? $next.controller : null;
		}

		/*
		$routeChangeStart
		Broadcasted before a route change. At this point the route services starts resolving all of the dependencies needed for the route change to occur. Typically this involves fetching the view template as well as any dependencies defined in resolve route property. Once all of the dependencies are resolved $routeChangeSuccess is fired.
		The route change (and the $location change that triggered it) can be prevented by calling preventDefault method of the event. See $rootScope.Scope for more details about event object.
		*/
		function RouterOnChangeStart(event, next, current) {
			$previous = null;
			$current = current ? current.$$route : null;
			$next = next ? next.$$route : null;
			RouterSetControllers();
			// console.log('Router.RouterOnChangeStart', '$previous', $previous, '$current', $current, '$next', $next);
			service.loading = true;
		}

		/*
		$routeChangeSuccess
		Broadcasted after a route change has happened successfully. The resolve dependencies are now available in the current.locals property.
		*/
		function RouterOnChangeSuccess(event, current, previous) {
			$previous = previous ? previous.$$route : null;
			$current = current ? current.$$route : null;
			$next = null;
			RouterSetControllers();
			// console.log('Router.RouterOnChangeSuccess', '$previous', $previous, '$current', $current, '$next', $next);
		}

		/*
		$routeChangeError
		Broadcasted if a redirection function fails or any redirection or resolve promises are rejected.
		*/
		function RouterOnChangeError(event, current, previous, rejection) {
			$previous = null;
			$current = previous.$$route || null;
			$next = null;
			RouterSetControllers();
			// console.log('Router.RouterOnChangeError', '$previous', $previous, '$current', $current, '$next', $next);
		}

		/*
		$routeUpdate
		The reloadOnSearch property has been set to false, and we are reusing the same instance of the Controller.
		*/
		function RouterOnUpdate(event, current) {
			$previous = current ? current.$$route : null;
			$current = current ? current.$$route : null;
			$next = null;
			RouterSetControllers();
			// console.log('Router.RouterOnUpdate', '$previous', $previous, '$current', $current, '$next', $next);
		}

		function RouterOnStateReady(scope, state) {
			$timeout(function() {
				service.loading = false;
			}, 1000);
		}

		function RouterIsController(controller) {
			return $currentController === controller;
		}

		// navigation

		function RouterRedirectTo(path) {
			$location.$$lastRequestedPath = $location.path();
			$location.path(path);
		}

		function RouterRetryLastRequestedPath(path) {
			path = $location.$$lastRequestedPath || path;
			$location.$$lastRequestedPath = null;
			$location.path(path);
		}

		function RouterRedirect(path, msecs) {
			if (msecs) {
				$timeout(function() {
					RouterRedirectTo(path);
				}, msecs);
			} else {
				RouterRedirectTo(path);
			}
		}

		function RouterPath(path, msecs) {
			if (msecs) {
				$timeout(function() {
					RouterRetryLastRequestedPath(path);
				}, msecs);
			} else {
				RouterRetryLastRequestedPath(path);
			}
		}

		function RouterApply(path, msecs) {
			if (msecs) {
				$timeout(function() {
					$location.path(path);
				}, msecs);
			} else {
				$timeout(function() {
					$location.path(path);
				});
			}
		}

    }]);

}());
