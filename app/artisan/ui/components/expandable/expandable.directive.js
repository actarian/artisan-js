/* global angular */

(function () {
	"use strict";

	var app = angular.module('artisan');

	app.directive('expandable', ['Events', function (Events) {

		var directive = {
			restrict: 'A',
			// template: '<div ng-transclude></div>',
			// transclude: true,
			// replace: true,
			/*
			templateUrl: function (element, attributes) {
				return attributes.template || 'artisan/nav/nav';
            },
            */
			link: ExpandableLink,
		};

		return directive;

		function ExpandableLink(scope, element, attributes, model) {

			function onDown(e) {
				console.log('ExpandableLink', e);
			}

			var events = new Events(element).add({
				down: onDown,
			}, scope);
		}

    }]);

}());