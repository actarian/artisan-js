/* global angular */
(function() {
	"use strict";

	var app = angular.module('artisan');

	// micro interactions

	function tap(Events) {
		return {
			restrict: 'A',
			priority: 0,
			link: link
		};

		function link(scope, element, attributes, model) {
			if (attributes.ngBind) {
				return;
			}
			/*
			if (attributes.href === '#' && !attributes.ngHref && !attributes.ngClick) {
				return;
            }
            */

			element.addClass('interaction-tap');
			var node = document.createElement('interaction');
			element[0].appendChild(node);

			function onDown(e) {
				element.removeClass('interaction-animate');
				void element.offsetWidth;
				// node.style.animationPlayState = "paused";
				node.style.left = e.relative.x + 'px';
				node.style.top = e.relative.y + 'px';
				setTimeout(function() {
					element.addClass('interaction-animate');
					setTimeout(function() {
						element.removeClass('interaction-animate');
					}, 1000);
				}, 10);

				// console.log('tap.onDown', node, node.parentElement);
			}
			var listeners = { // down, move, up, click
				down: onDown,
			};
			var events = new Events(element).add(listeners, scope); // passing scope to add remove listeners automatically on $destroy
		}
	}
	app.directive('ngHref', ['Events', tap]);
	app.directive('ngClick', ['Events', tap]);

}());
