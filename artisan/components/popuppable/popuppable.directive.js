/* global angular */

(function() {
	"use strict";

	var app = angular.module('artisan');

	app.directive('popuppable', ['$parse', 'State', 'Dom', function($parse, State, Dom) {

		var directive = {
			restrict: 'A',
			link: link,
		};

		return directive;

		function link(scope, element, attributes, model) {

			var state = new State();
			state.pow = 0;

			var relative, absolute;

			var target, targetElement;

			var from, to, current,
				boundingClientRect, styleObj, originalCssText;

			var opened = false;

			function getStyle(node) {
				var style = window.getComputedStyle(node, null);
				var styleObj = {
					'display': style.getPropertyValue('display'),
					'position': style.getPropertyValue('position'),
					'width': style.getPropertyValue('width'),
					'height': style.getPropertyValue('height'),
					'top': style.getPropertyValue('top'),
					'right': style.getPropertyValue('right'),
					'bottom': style.getPropertyValue('bottom'),
					'left': style.getPropertyValue('left'),
					'margin-top': style.getPropertyValue('margin-top'),
					'margin-right': style.getPropertyValue('margin-right'),
					'margin-bottom': style.getPropertyValue('margin-bottom'),
					'margin-left': style.getPropertyValue('margin-left'),
					'padding-top': style.getPropertyValue('padding-top'),
					'padding-right': style.getPropertyValue('padding-right'),
					'padding-bottom': style.getPropertyValue('padding-bottom'),
					'padding-left': style.getPropertyValue('padding-left'),
					'background-color': style.getPropertyValue('background-color'),
				};
				return styleObj;
			}

			function getTextStyle(style) {
				var text = '';
				angular.forEach(style, function(value, key) {
					text += key + ': ' + value + '; ';
				});
				return text;
			}

			function setStyle(node, style) {
				node.style.cssText = getTextStyle(style);
			}

			function add() {
				targetElement.addClass('popuppable-opening');
				Dom.getParents(target).each(function(element, node) {
					element.addClass('popuppable-parent');
				});
			}

			function remove() {
				targetElement.removeClass('popuppable-opening');
				Dom.getParents(target).each(function(element, node) {
					element.removeClass('popuppable-parent');
				});
			}

			function open() {
				if (!opened) {
					add();
					current = angular.copy(from);
					openAnimation();
				} else {
					state.idle();
				}
			}

			function close() {
				if (opened) {
					closeAnimation();
				} else {
					state.idle();
				}
			}

			function update() {
				current.left = (from.left + (to.left - from.left) * state.pow) + 'px';
				current.top = (from.top + (to.top - from.top) * state.pow) + 'px';
				current.width = (from.width + (to.width - from.width) * state.pow) + 'px';
				current.height = (from.height + (to.height - from.height) * state.pow) + 'px';
				setStyle(target, current);
			}

			function toggle() {
				if (state.busy()) {
					if (opened) {
						close();
					} else {
						open();
					}
				}
			}

			function set() {
				target = element[0].querySelector(attributes.popuppable);
				if (target) {
					targetElement = angular.element(target);
					targetElement.addClass('popuppable-target');
				}
			}

			function onDown(e) {
				set();
				if (target) {
					open();
				}
			}

			function onUp(e) {
				if (Dom.getClosestNode(e.target, element[0])) {
					// nope
				} else {
					set();
					if (target) {
						close();
					}
				}
			}

			function onResize(e) {
				if (opened || state.isBusy) {
					update();
				}
			}

			function onKeyDown(e) {
				var key = e.key.toLowerCase();
				switch (key) {
					case 'escape':
						set();
						if (target) {
							close();
						}
						break;
					case 'enter':
						set();
						if (target && target.tagName && target.tagName.toLowerCase() === 'input') {
							close();
						}
						break;
				}
			}

			function addListeners() {
				var trigger = element[0].querySelector('.popuppable-trigger');
				var triggerElement = trigger ? angular.element(trigger) : element;
				triggerElement
					.on('mousedown touchstart', onDown)
					.on('keydown', onKeyDown);
				angular.element(window)
					.on('click', onUp)
					.on('resize', onResize);
			}

			function removeListeners() {
				var trigger = element[0].querySelector('.popuppable-trigger');
				var triggerElement = trigger ? angular.element(trigger) : element;
				triggerElement
					.off('mousedown touchstart', onDown)
					.off('keydown', onKeyDown);
				angular.element(window)
					.off('click', onUp)
					.off('resize', onResize);
			}

			scope.$on('$destroy', function() {
				removeListeners();
			});

			addListeners();

			set();

			function openAnimation() {
				dynamics.animate(target, {
					opacity: 1,
					scale: 1
				}, {
					type: dynamics.spring,
					frequency: 200,
					friction: 270,
					duration: 800,
					complete: function() {
						opened = true;
						state.idle();
					},
				});
			}

			function closeAnimation() {
				dynamics.animate(target, {
					opacity: 0,
					scale: 0.1
				}, {
					type: dynamics.easeInOut,
					duration: 300,
					friction: 100,
					complete: function() {
						opened = false;
						remove();
						state.idle();
					},
				});
			}

		}

    }]);

}());
