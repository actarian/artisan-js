/* global angular */

(function () {
	"use strict";

	var app = angular.module('artisan');

	app.directive('popuppable', ['$parse', 'State', 'Dom', function ($parse, State, Dom) {

		var directive = {
			restrict: 'A',
			// template: '<div ng-transclude></div>',
			// transclude: true,
			// replace: true,
			/*
			templateUrl: function (element, attributes) {
				return attributes.template || 'artisan/components/nav/partial/nav';
            },
            */
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

			/*
			var placeholder = document.createElement('div'),
				placeholderElement = angular.element(placeholder);
			placeholderElement.addClass('popuppable-placeholder');
			*/

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
				angular.forEach(style, function (value, key) {
					text += key + ': ' + value + '; ';
				});
				return text;
			}

			function setStyle(node, style) {
				node.style.cssText = getTextStyle(style);
			}

			function add() {
				/*
				styleObj = getStyle(target);
				setStyle(placeholder, styleObj);
				target.parentNode.insertBefore(placeholder, target);
				originalCssText = target.style.cssText;
				*/
				targetElement.addClass('popuppable-opening');
				Dom.getParents(target).each(function (element, node) {
					element.addClass('popuppable-parent');
				});
			}

			function remove() {
				/*
				target.style.cssText = originalCssText;
				placeholder.parentNode.removeChild(placeholder);
				*/
				targetElement.removeClass('popuppable-opening');
				Dom.getParents(target).each(function (element, node) {
					element.removeClass('popuppable-parent');
				});
			}

			/*
			function setRects() {
				if (targetElement && targetElement.hasClass('popuppable-opening')) {
					boundingClientRect = placeholder.getBoundingClientRect();
				} else {
					boundingClientRect = target.getBoundingClientRect();
				}
				from = {
					top: 0,
					left: 0,
					width: boundingClientRect.width, // parseInt(styleObj.width), // boundingClientRect.width,
					height: boundingClientRect.height, // parseInt(styleObj.height), // boundingClientRect.height,
				};
				to = {
					top: 0 + (relative.top || 0),
					left: 0 + (relative.left || 0),
					width: from.width + (relative.right || 0),
					height: from.height + (relative.bottom || 0),
				};
				if (absolute.top) {
					to.top = absolute.top - boundingClientRect.top;
				}
				if (absolute.left) {
					to.left = absolute.left - boundingClientRect.left;
				}
				if (absolute.right) {
					var absoluteRight = (window.innerWidth - absolute.right);
					var absoluteLeft = boundingClientRect.left + to.left;
					to.width = absoluteRight - absoluteLeft;
				}
				if (absolute.bottom) {
					var absoluteBottom = (window.innerHeight - absolute.bottom);
					var absoluteTop = boundingClientRect.top + to.top;
					to.height = absoluteBottom - absoluteTop;
				}
			}
			*/

			function open() {
				if (!opened) {
					// setRects();
					add();
					current = angular.copy(from);
					// setStyle(target, from);
					openAnimation();
					/*
					dynamics.animate(state, {
						pow: 1
					}, {
						type: dynamics.easeInOut,
						duration: 350,
						complete: function () {
							opened = true;
							state.idle();
						},
						change: function () {
							update();
						}
					});
					*/
				} else {
					state.idle();
				}
			}

			function close() {
				if (opened) {
					closeAnimation();
					/*
					dynamics.animate(state, {
						pow: 0
					}, {
						type: dynamics.easeInOut,
						duration: 350,
						complete: function () {
							opened = false;
							remove();
							state.idle();
						},
						change: function () {
							update();
						}
					});
					*/
				} else {
					state.idle();
				}
			}

			function update() {
				/*
				current.left = (from.left + (to.left - from.left) * state.pow) + 'px';
				current.top = (from.top + (to.top - from.top) * state.pow) + 'px';
				current.width = (from.width + (to.width - from.width) * state.pow) + 'px';
				current.height = (from.height + (to.height - from.height) * state.pow) + 'px';
				setStyle(target, current);
				*/
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
				/*
				relative = attributes.popuppableRelative ? $parse(attributes.popuppableRelative)(scope) : {};
				absolute = attributes.popuppableAbsolute ? $parse(attributes.popuppableAbsolute)(scope) : {};
				*/
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
					// setRects();
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

			scope.$on('$destroy', function () {
				removeListeners();
			});

			addListeners();

			set();

			function openAnimation() {
				// Animate the popover
				dynamics.animate(target, {
					opacity: 1,
					scale: 1
				}, {
					type: dynamics.spring,
					frequency: 200,
					friction: 270,
					duration: 800,
					complete: function () {
						opened = true;
						state.idle();
					},
				});

				/*
			  // Animate each line individually
			  for(var i=0; i<items.length; i++) {
				var item = items[i]
				// Define initial properties
				dynamics.css(item, {
				  opacity: 0,
				  translateY: 20
				});
			
				// Animate to final properties
				dynamics.animate(item, {
				  opacity: 1,
				  translateY: 0
				}, {
				  type: dynamics.spring,
				  frequency: 300,
				  friction: 435,
				  duration: 1000,
				  delay: 100 + i * 40
				});
			  }
			*/
			}

			function closeAnimation() {
				// Animate the popover
				dynamics.animate(target, {
					opacity: 0,
					scale: 0.1
				}, {
					type: dynamics.easeInOut,
					duration: 300,
					friction: 100,
					complete: function () {
						opened = false;
						remove();
						state.idle();
					},
				});
			}

		}

    }]);

}());