/* global angular */

(function() {
	"use strict";

	var app = angular.module('artisan');

	app.directive('expandable', ['$parse', 'State', 'Dom', function($parse, State, Dom) {

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
			link: ExpandableLink,
		};

		return directive;

		function ExpandableLink(scope, element, attributes, model) {

			var state = new State();
			state.pow = 0;

			var relative, absolute;

			var target, targetElement;

			var from, to, current,
				boundingClientRect, styleObj, originalCssText;

			var expanded = false;

			var placeholder = document.createElement('div'),
				placeholderElement = angular.element(placeholder);
			placeholderElement.addClass('expandable-placeholder');

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
				styleObj = getStyle(target);
				setStyle(placeholder, styleObj);
				target.parentNode.insertBefore(placeholder, target);
				originalCssText = target.style.cssText;
				targetElement.addClass('expandable-expanding');
				Dom.getParents(target).each(function(element, node) {
					element.addClass('expandable-parent');
				});
			}

			function remove() {
				target.style.cssText = originalCssText;
				targetElement.removeClass('expandable-expanding');
				placeholder.parentNode.removeChild(placeholder);
				Dom.getParents(target).each(function(element, node) {
					element.removeClass('expandable-parent');
				});
			}

			function setRects() {
				if (targetElement && targetElement.hasClass('expandable-expanding')) {
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

			function expand() {
				if (!expanded) {
					setRects();
					add();
					current = angular.copy(from);
					setStyle(target, from);
					dynamics.animate(state, {
						pow: 1
					}, {
						type: dynamics.easeInOut,
						duration: 350,
						complete: function() {
							expanded = true;
							state.idle();
						},
						change: function() {
							update();
						}
					});
				} else {
					state.idle();
				}
			}

			function contract() {
				if (expanded) {
					dynamics.animate(state, {
						pow: 0
					}, {
						type: dynamics.easeInOut,
						duration: 350,
						complete: function() {
							expanded = false;
							remove();
							state.idle();
						},
						change: function() {
							update();
						}
					});
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
					if (expanded) {
						contract();
					} else {
						expand();
					}
				}
			}

			function set() {
				relative = attributes.expandableRelative ? $parse(attributes.expandableRelative)(scope) : {};
				absolute = attributes.expandableAbsolute ? $parse(attributes.expandableAbsolute)(scope) : {};
				target = element[0].querySelector(attributes.expandable);
				if (target) {
					targetElement = angular.element(target);
				}
			}

			function onDown(e) {
				set();
				if (target) {
					expand();
				}
			}

			function onUp(e) {
				if (Dom.getClosestNode(e.target, element[0])) {
					// nope
				} else {
					set();
					if (target) {
						contract();
					}
				}
			}

			function onResize(e) {
				if (expanded || state.isBusy) {
					setRects();
					update();
				}
			}

			function onKeyDown(e) {
				var key = e.key.toLowerCase();
				switch (key) {
					case 'escape':
						set();
						if (target) {
							contract();
						}
						break;
					case 'enter':
						set();
						if (target && target.tagName && target.tagName.toLowerCase() === 'input') {
							contract();
						}
						break;
				}
			}

			var trigger = attributes.expandableTrigger ? element[0].querySelector(attributes.expandableTrigger) : null;
			trigger = trigger ? angular.element(trigger) : element;

			function addListeners() {
				trigger.on('mousedown touchstart', onDown);
				element.on('keydown', onKeyDown);
				angular.element(window)
					.on('click', onUp)
					.on('resize', onResize);
			}

			function removeListeners() {
				trigger.off('mousedown touchstart', onDown);
				element.off('keydown', onKeyDown);
				angular.element(window)
					.off('click', onUp)
					.off('resize', onResize);
			}

			scope.$on('$destroy', function() {
				removeListeners();
			});

			addListeners();

		}

    }]);

}());
