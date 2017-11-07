/* global angular */
(function () {
	"use strict";
	var app = angular.module('artisan');
	// micro interactions
	function miTap(Events) {
		return {
			restrict: 'A',
			priority: 0,
			link: link
		};

		function link(scope, element, attributes, model) {
			if (attributes.href === '#' && !attributes.ngClick) {
				return;
			}
			element.addClass('miTap');
			var material = document.createElement('mi-tap');
			element[0].appendChild(material);

			function onClick(e) {
				element.removeClass('animate');
				void element.offsetWidth;
				// material.style.animationPlayState = "paused";
				material.style.left = e.relative.x + 'px';
				material.style.top = e.relative.y + 'px';
				setTimeout(function () {
					element.addClass('animate');
					setTimeout(function () {
						element.removeClass('animate');
					}, 1000);
				}, 10);
			}
			var listeners = {
				click: onClick,
			};
			var events = new Events(element).add(listeners);
			scope.$on('$destroy', function () {
				events.remove(listeners);
			});
		}
	}
	app.directive('href', ['Events', miTap]);
	app.directive('ngClick', ['Events', miTap]);
}());
