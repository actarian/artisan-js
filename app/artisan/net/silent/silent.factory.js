/* global angular */

(function () {
	"use strict";

	var app = angular.module('artisan');

	app.factory('Silent', ['$rootScope', '$location', function ($rootScope, $location) {

		function Silent() {}

		var statics = {
			silent: SilentSilent,
			path: SilentPath,
		};

		var methods = {};

		angular.extend(Silent, statics);
		angular.extend(Silent.prototype, methods);

		$rootScope.$$listeners.$locationChangeSuccess.unshift(SilentListener);
		// console.log('$rootScope.$$listeners.$locationChangeSuccess', $rootScope.$$listeners.$locationChangeSuccess);

		// private vars

		var $path;

		return Silent;

		// static methods

		function SilentUnlink() {
			var listeners = $rootScope.$$listeners.$locationChangeSuccess;
			angular.forEach(listeners, function (value, name) {
				if (value === listener) {
					return;
				}

				function relink() {
					listeners[name] = value;
				}
				listeners[name] = relink; // temporary unlinking
			});
		}

		function SilentListener(e) {
			// console.log('onLocationChangeSuccess', e);
			if ($path === $location.path()) {
				SilentUnlink();
			}
			$path = null;
		}

		function SilentSilent(path, replace) {
			// this.prev = $location.path(); ???
			var location = $location.url(path);
			if (replace) {
				location.replace();
			}
			$path = $location.path();
		}

		function SilentPath(path) {
			return $location.path(path);
		}

    }]);

}());