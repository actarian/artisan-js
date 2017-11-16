/* global angular */

(function () {
	"use strict";

	var app = angular.module('app');

	app.run(['$rootScope', '$sce', function ($rootScope, $sce) {

		function trustResource(src) {
			return $sce.trustAsResourceUrl(src);
		}

		function cssUrl(src) {
			return 'url(\'' + src + '\')';
		}

		$rootScope.trustResource = trustResource;
		$rootScope.cssUrl = cssUrl;

		$rootScope.$on('$routeChangeStart', function ($event, next, current) {
			var nextPath = next.$$route.originalPath;
			var currentPath = current ? current.$$route.originalPath : null;
			if (nextPath !== currentPath) {
				$rootScope.pageLoading = true;
				console.log('$routeChangeStart', nextPath, currentPath);
			}
		});

    }]);

}());