/* global angular */

(function () {
	"use strict";

	var app = angular.module('app');

	app.run(['$rootScope', '$sce', 'Scrollable', function ($rootScope, $sce, Scrollable) {

		$rootScope.items = new Array(20).fill({
			name: 'Item',
		});

		var scrollable = new Scrollable();

		$rootScope.scrollPreviews = scrollable;

		$rootScope.trustResource = function (src) {
			return $sce.trustAsResourceUrl(src);
		};

		$rootScope.cssUrl = function (src) {
			return 'url(\'' + src + '\')';
		};

    }]);

}());
