/* global angular */

(function() {
	"use strict";

	window.ondragstart = function() {
		return false;
	};

	var app = angular.module('artisan');

	app.directive('scrollableX', ['$parse', '$compile', '$timeout', 'Scrollable', 'Animate', 'Style', 'Events', 'Utils', function($parse, $compile, $timeout, Scrollable, Animate, Style, Events, Utils) {
		return {
			restrict: 'A',
			template: '<div class="scrollable-content" ng-transclude></div>',
			transclude: true,
			link: function(scope, element, attributes, model) {

				var onLeft, onRight, showIndicatorFor, scrollableWhen;
				if (attributes.onLeft) {
					onLeft = $parse(attributes.onLeft);
				}
				if (attributes.onRight) {
					onRight = $parse(attributes.onRight);
				}
				if (attributes.showIndicatorFor) {
					showIndicatorFor = $parse(attributes.showIndicatorFor);
				}
				if (attributes.scrollableWhen) {
					scrollableWhen = $parse(attributes.scrollableWhen);
				}

				// ELEMENTS & STYLESHEETS;
				element.attr('unselectable', 'on').addClass('unselectable');
				var containerNode = element[0];
				var contentNode = containerNode.querySelector('.scrollable-content');
				var content = angular.element(content);
				var contentStyle = new Style();

				var animate = new Animate(render);

				var scrollable = attributes.scrollableX ? $parse(attributes.scrollableX)(scope) : new Scrollable();

				link(scrollable);

				function link(scrollable) {
					scrollable.link({
						getItems: function() {
							if (attributes.scrollableItem) {
								var items = containerNode.querySelectorAll(attributes.scrollableItem);
								return items;
							}
						},
						prev: function() {
							scrollable.scrollPrev();
							animate.play();
						},
						next: function() {
							scrollable.scrollNext();
							animate.play();
						},
						reset: function() {
							scrollable.doReset();
							animate.play();
						},
						onLeft: onLeft,
						onRight: onRight,
					});
				}

				/*
				scope.$watch(attributes.scrollableX, function (newValue) {
					console.log(newValue);
				});
				*/

				/*
				var indicator = null,
					indicatorNode = null,
					indicatorStyle;
				showIndicatorFor = false;
				if (showIndicatorFor) {
					indicator = angular.element('<div class="indicator"></div>');
					indicatorNode = indicator[0];
					indicatorStyle = new Style();
					element.append(indicator);
					$compile(indicator.contents())(scope);
					var i = scrollbar.getIndicator();
					indicatorStyle.transform('translate3d(' + i.x.toFixed(2) + 'px,' + i.y.toFixed(2) + 'px,0)');
					indicatorStyle.set(indicatorNode);
				}
				*/

				function render(time) {
					scrollable.setContainer(containerNode);
					scrollable.setContent(contentNode);
					scrollable.setEnabled(isEnabled());
					var animating = scrollable.renderX();
					if (!animating) {
						// animate.pause();
					}
					var current = scrollable.getCurrent();
					contentStyle.transform('translate3d(' + current.x.toFixed(2) + 'px,0,0)');
					contentStyle.set(contentNode);
					/*
					if (showIndicatorFor) {
						if (dragging || wheeling || speed) {
							var percent = c.x / (containerNode.offsetWidth - contentNode.offsetWidth);
							percent = Math.max(0, Math.min(1, percent));
							i.x = (containerNode.offsetWidth - indicatorNode.offsetWidth) * (percent);
							i.y += (0 - i.y) / 4;
							// var count = Math.round(contentNode.offsetWidth / 315);
							var index = Math.max(1, Math.round(percent * showIndicatorFor.rows.length));
							indicator.html(index + '/' + showIndicatorFor.count);
							// indicator.html((percent * 100).toFixed(2).toString());
						} else {
							i.y += (45 - i.y) / 4;
						}
						indicatorStyle.transform('translate3d(' + i.x.toFixed(2) + 'px,' + i.y.toFixed(2) + 'px,0)');
						indicatorStyle.set(indicatorNode);
					}
					*/
				}

				function undrag() {
					scrollable.off();
					dragOff();
				}

				function onDown(event) {
					if (scrollable.dragStart(event.absolute)) {
						dragOn();
						animate.play();
						event.stop();
					}
				}

				function onMove(event) {
					scrollable.dragMove(event.absolute);
					var drag = scrollable.getDrag();
					if (Math.abs(drag.y) > Math.abs(drag.x)) {
						onUp(event);
					} else {
						event.stop();
					}
				}

				function onUp(event) {
					scrollable.dragEnd(event.absolute);
					event.stop();
					dragOff();
				}

				function _onScrollX(dir, interval) {
					return scrollable.wheelX(dir, interval);
				}

				var onScrollX = _onScrollX;
				// var onScrollX = Utils.throttle(_onScrollX, 25);

				function onWheel(event) {
					// console.log('onWheelX', event.dir, scrollable.wheelXCheck(event.dir));
					if (scrollable.wheelXCheck(event.dir)) {
						onScrollX(event.dir, event.interval);
						animate.play();
						event.stop();
					}
				}

				function off() {
					dragOff();
					// animate.pause();
					scrollable.off();
				}

				function isEnabled() {
					var enabled = true;
					if (scrollableWhen) {
						enabled = enabled && scrollableWhen(scope);
					}
					enabled = enabled && window.innerWidth >= 1024;
					enabled = enabled && (containerNode.offsetWidth < contentNode.offsetWidth);
					return enabled;
				}

				function onResize() {
					var enabled = isEnabled();
					if (!enabled) {
						off();
					}
					render();
				}

				scope.$watch(function() {
					return contentNode.offsetWidth;
				}, function(newValue, oldValue) {
					onResize();
				});

				var events = new Events(element).add({
					down: onDown,
					wheel: onWheel,
				}, scope);

				var windowEvents = new Events(window).add({
					resize: onResize,
				}, scope);

				function dragOn() {
					windowEvents.add({
						move: onMove,
						up: onUp,
					}, scope);
				}

				function dragOff() {
					windowEvents.remove({
						move: onMove,
						up: onUp,
					});
				}

				scope.$on('$destroy', function() {
					animate.pause();
				});

			},
		};
    }]);

	app.directive('scrollableY', ['$parse', '$compile', '$timeout', 'Scrollable', 'Animate', 'Style', 'Events', 'Utils', function($parse, $compile, $timeout, Scrollable, Animate, Style, Events, Utils) {
		return {
			restrict: 'A',
			template: '<div class="scrollable-content" ng-transclude></div>',
			transclude: true,
			link: function(scope, element, attributes, model) {

				var onTop, onBottom, showIndicatorFor, scrollableWhen;
				if (attributes.onTop) {
					onTop = $parse(attributes.onTop);
				}
				if (attributes.onBottom) {
					onBottom = $parse(attributes.onBottom);
				}
				if (attributes.showIndicatorFor) {
					showIndicatorFor = $parse(attributes.showIndicatorFor);
				}
				if (attributes.scrollableWhen) {
					scrollableWhen = $parse(attributes.scrollableWhen);
				}

				// ELEMENTS & STYLESHEETS;
				element.attr('unselectable', 'on').addClass('unselectable');
				var containerNode = element[0];
				var contentNode = containerNode.querySelector('.scrollable-content');
				var content = angular.element(content);
				var contentStyle = new Style();

				var animate = new Animate(render);

				var scrollable = attributes.scrollableY ? $parse(attributes.scrollableY)(scope) : new Scrollable();
				link(scrollable);

				function link(scrollable) {
					scrollable.link({
						getItems: function() {
							if (attributes.scrollableItem) {
								var items = containerNode.querySelectorAll(attributes.scrollableItem);
								return items;
							}
						},
						prev: function() {
							scrollable.scrollPrev();
							animate.play();
						},
						next: function() {
							scrollable.scrollNext();
							animate.play();
						},
						reset: function() {
							scrollable.doReset();
							animate.play();
						},
						onTop: onTop,
						onBottom: onBottom,
					});
				}

				function render(time) {
					scrollable.setContainer(containerNode);
					scrollable.setContent(contentNode);
					scrollable.setEnabled(isEnabled());
					var animating = scrollable.renderY();
					if (!animating) {
						// animate.pause();
					}
					var current = scrollable.getCurrent();
					contentStyle.transform('translate3d(0,' + current.y.toFixed(2) + 'px,0)');
					contentStyle.set(contentNode);
				}

				function undrag() {
					scrollable.off();
					dragOff();
				}

				function onDown(event) {
					if (scrollable.dragStart(event.absolute)) {
						dragOn();
						animate.play();
						event.stop();
					}
				}

				function onMove(event) {
					scrollable.dragMove(event.absolute);
					var drag = scrollable.getDrag();
					if (Math.abs(drag.x) > Math.abs(drag.y)) {
						onUp(event);
					} else {
						event.stop();
					}
				}

				function onUp(event) {
					scrollable.dragEnd(event.absolute);
					event.stop();
					dragOff();
				}

				function _onScrollY(dir, interval) {
					return scrollable.wheelY(dir, interval);
				}

				var onScrollY = _onScrollY;
				// var onScrollY = Utils.throttle(_onScrollY, 25);

				function onWheel(event) {
					// console.log('onWheelY', event.dir, scrollable.wheelYCheck(event.dir));
					if (scrollable.wheelYCheck(event.dir)) {
						onScrollY(event.dir, event.interval);
						animate.play();
						event.stop();
					}
				}

				function off() {
					dragOff();
					// animate.pause();
					scrollable.off();
				}

				function isEnabled() {
					var enabled = true;
					if (scrollableWhen) {
						enabled = enabled && scrollableWhen(scope);
					}
					enabled = enabled && window.innerWidth >= 1024;
					enabled = enabled && (containerNode.offsetHeight < contentNode.offsetHeight);
					return enabled;
				}

				function onResize() {
					var enabled = isEnabled();
					if (!enabled) {
						off();
					}
					render();
				}

				scope.$watch(function() {
					return contentNode.offsetHeight;
				}, function(newValue, oldValue) {
					onResize();
				});

				var events = new Events(element).add({
					down: onDown,
					wheel: onWheel,
				}, scope);

				var windowEvents = new Events(window).add({
					resize: onResize,
				}, scope);

				function dragOn() {
					windowEvents.add({
						move: onMove,
						up: onUp,
					}, scope);
				}

				function dragOff() {
					windowEvents.remove({
						move: onMove,
						up: onUp,
					});
				}

				scope.$on('$destroy', function() {
					animate.pause();
				});

			},
		};
    }]);

}());
