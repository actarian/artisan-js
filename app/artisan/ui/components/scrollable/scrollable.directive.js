/* global angular */

(function () {
	"use strict";

	var app = angular.module('artisan');

	app.directive('scrollableX', ['$parse', '$compile', '$window', '$timeout', 'Scrollable', 'Animate', 'Style', 'Events', 'Utils', function ($parse, $compile, $window, $timeout, Scrollable, Animate, Style, Events, Utils) {
		return {
			restrict: 'A',
			template: '<div class="content" ng-transclude></div>',
			transclude: true,
			link: function (scope, element, attributes, model) {

				$window.ondragstart = function () {
					return false;
				};

				// CONSTS;
				var padding = 150;

				// FLAGS;            
				var dragging, wheeling, busy;

				// MOUSE;
				var down, move, prev, up;

				// COORDS;
				var s = {
						x: 0,
						y: 0
					},
					e = {
						x: 0,
						y: 0
					},
					c = {
						x: 0,
						y: 0
					},
					i = {
						x: 45,
						y: 0
					},
					l = {
						top: 0,
						right: 0,
						bottom: 0,
						left: 0
					},
					speed = 0;

				var scrollable, onLeft, onRight, showIndicatorFor, scrollableWhen;
				if (attributes.scrollableX) {
					scrollable = $parse(attributes.scrollableX)(scope);
				} else {
					scrollable = new Scrollable();
				}
				scrollable.link({
					reset: function () {
						e.x = c.x = 0;
						redraw();
					},
					doLeft: doLeft,
					doRight: doRight,
				});
				if (attributes.onLeft !== undefined) {
					onLeft = $parse(attributes.onLeft, /* interceptorFn */ null, /* expensiveChecks */ true);
				}
				if (attributes.onRight !== undefined) {
					onRight = $parse(attributes.onRight, /* interceptorFn */ null, /* expensiveChecks */ true);
				}
				if (attributes.showIndicatorFor !== undefined) {
					showIndicatorFor = $parse(attributes.showIndicatorFor, /* interceptorFn */ null, /* expensiveChecks */ true);
				}
				if (attributes.scrollableWhen !== undefined) {
					scrollableWhen = $parse(attributes.scrollableWhen, /* interceptorFn */ null, /* expensiveChecks */ true);
				}

				// console.log('showIndicatorFor', showIndicatorFor);

				// ELEMENTS & STYLESHEETS;
				element.attr('unselectable', 'on').addClass('unselectable');
				var elementNode = element[0];
				var contentNode = elementNode.querySelector('.content');
				var content = angular.element(content);
				var contentStyle = new Style();
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
					indicatorStyle.transform('translate3d(' + i.x.toFixed(2) + 'px,' + i.y.toFixed(2) + 'px,0)');
					indicatorStyle.set(indicatorNode);
				}

				var animate = new Animate(redraw);

				function render(time) {
					scrollable.renderX(isEnabled(), dragging, wheeling, move, down);
					contentStyle.transform('translate3d(' + c.x.toFixed(2) + 'px,0,0)');
					contentStyle.set(contentNode);
					/*
					if (showIndicatorFor) {
					    if (dragging || wheeling || speed) {
					        var percent = c.x / (elementNode.offsetWidth - contentNode.offsetWidth);
					        percent = Math.max(0, Math.min(1, percent));
					        i.x = (elementNode.offsetWidth - indicatorNode.offsetWidth) * (percent);
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

				function redraw(time) {
					if (isEnabled()) {
						// if (!busy) {
						l.left = 0;
						l.right = elementNode.offsetWidth - contentNode.offsetWidth;
						if (dragging) {
							e.x = s.x + move.x - down.x;
							bounce();
							// console.log('dragging', Math.abs(speed));

						} else if (speed) {
							e.x += speed;
							speed *= 0.75;
							if (wheeling) {
								bounce();
							}
							// console.log('wheeling', Math.abs(speed));
							if (Math.abs(speed) < 0.05) {
								speed = 0;
								e.x = s.x = c.x;
								wheeling = false;
								// animate.pause();
							}
						}
						// }
						e.x = Math.min(l.left, e.x);
						e.x = Math.max(l.right, e.x);
						c.x += (e.x - c.x) / 4;
						contentStyle.transform('translate3d(' + c.x.toFixed(2) + 'px,0,0)');
						contentStyle.set(contentNode);
						if (showIndicatorFor) {
							if (dragging || wheeling || speed) {
								var percent = c.x / (elementNode.offsetWidth - contentNode.offsetWidth);
								percent = Math.max(0, Math.min(1, percent));
								i.x = (elementNode.offsetWidth - indicatorNode.offsetWidth) * (percent);
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
						// console.log('dragging', dragging, 'wheeling', wheeling, 'speed', speed);
						// console.log('elementNode.offsetWidth', elementNode.offsetWidth, 'contentNode.offsetWidth', contentNode.offsetWidth, 'diff', l.right, 'e.x', e.x);                        
					} else {
						contentStyle.transform('translate3d(0,0,0)');
						contentStyle.set(contentNode);
					}
				}

				function bounce() {
					l.left += padding;
					l.right -= padding;
					if (e.x > l.left) {
						doLeft();
					} else if (e.x < l.right) {
						doRight();
					}
				}

				function doLeft() {
					if (busy) {
						return;
					}
					if (!onLeft) {
						return;
					}
					busy = true;
					onLeft(scope).then().finally(function () {
						s.x = e.x = 0;
						setTimeout(function () {
							undrag();
							busy = false;
						}, 500);
					});
				}

				function doRight() {
					if (busy) {
						return;
					}
					if (!onRight) {
						return;
					}
					busy = true;
					onRight(scope).then().finally(function () {
						var right = elementNode.offsetWidth - contentNode.offsetWidth;
						if (right > l.right) {
							s.x = e.x = l.right;
						} else {
							s.x = e.x = l.right + padding;
						}
						setTimeout(function () {
							undrag();
							busy = false;
						}, 500);
					});
				}

				function undrag() {
					// console.log('undrag');
					dragging = false;
					wheeling = false;
					move = null;
					down = null;
					removeDragListeners();
				}

				function onDown(event) {
					if (event.type == 'touchstart') {
						element.off('mousedown', onDown);
					}
					if (!busy) {
						s.x = e.x = c.x;
						speed = 0;
						down = Utils.getTouch(event);
						wheeling = false;
						// console.log(down);
						addDragListeners();
						animate.play();
					}
				}

				function onMove(event) {
					if (event.type == 'touchmove') {
						angular.element($window).off('mousemove', onMove);
					}
					prev = move;
					move = Utils.getTouch(event);
					dragging = true;
					// console.log(move);
				}

				function onUp(event) {
					if (event.type == 'touchend') {
						angular.element($window).off('mouseup', onUp);
					}
					if (move && prev) {
						speed += (move.x - prev.x) * 4;
					}
					s.x = e.x = c.x;
					dragging = false;
					move = null;
					down = null;
					prev = null;
					up = Utils.getTouch(event);
					// console.log(up);
					removeDragListeners();
				}

				function getWheelIncrement() {
					var increment = (contentNode.offsetWidth - elementNode.offsetWidth) / 20;
					increment = Math.min(10, Math.max(100, increment));
					return increment;
				}

				function _onWheel(e) {
					if (!busy && isEnabled()) {
						if (!e) e = $window.event;
						e = e.originalEvent ? e.originalEvent : e;
						var dir = (((e.deltaY < 0 || e.wheelDelta > 0) || e.deltaY < 0) ? 1 : -1);
						speed += dir * getWheelIncrement();
						wheeling = true;
						// console.log('_onWheel.speed', speed);
						animate.play();
					}
				}

				var onWheel = Utils.throttle(_onWheel, 25);

				function off() {
					removeDragListeners();
					animate.pause();
					undrag();
				}

				function isEnabled() {
					var enabled = true;
					if (scrollableWhen) {
						enabled = enabled && scrollableWhen(scope);
					}
					enabled = enabled && $window.innerWidth >= 1024;
					enabled = enabled && (elementNode.offsetWidth < contentNode.offsetWidth);
					return enabled;
				}

				function onResize() {
					if (!isEnabled()) {
						off();
					}
					redraw();
				}

				scope.$watch(function () {
					return contentNode.offsetWidth;
				}, function (newValue, oldValue) {
					onResize();
				});

				function addListeners() {
					angular.element($window).on('resize', onResize);
					element.on('touchstart mousedown', onDown);
					element.on('wheel', onWheel);
					// element.addEventListener('DOMMouseScroll',handleScroll,false); // for Firefox
					// element.addEventListener('mousewheel',    handleScroll,false); // for everyone else
				}

				function removeListeners() {
					angular.element($window).off('resize', onResize);
					element.off('touchstart mousedown', onDown);
					element.off('wheel', onWheel);
				}

				function addDragListeners() {
					angular.element($window).on('touchmove mousemove', onMove);
					angular.element($window).on('touchend mouseup', onUp);
				}

				function removeDragListeners() {
					angular.element($window).off('touchmove mousemove', onMove);
					angular.element($window).off('touchend mouseup', onUp);
				}
				scope.$on('$destroy', function () {
					removeListeners();
					animate.pause();
				});

				addListeners();

			},
		};
    }]);

	app.directive('scrollableY', ['$parse', '$compile', '$window', '$timeout', 'Scrollable', 'Animate', 'Style', 'Events', 'Utils', function ($parse, $compile, $window, $timeout, Scrollable, Animate, Style, Events, Utils) {

		return {
			restrict: 'A',
			template: '<div class="content" ng-transclude></div>',
			transclude: true,
			link: function (scope, element, attributes, model) {
				$window.ondragstart = function () {
					return false;
				};

				// CONSTS;
				var padding = 150;

				// FLAGS;            
				var dragging, wheeling, busy;

				// MOUSE;
				var down, move, prev, up;

				// COORDS;
				var s = {
						x: 0,
						y: 0
					},
					e = {
						x: 0,
						y: 0
					},
					c = {
						x: 0,
						y: 0
					},
					i = {
						x: 45,
						y: 0
					},
					l = {
						top: 0,
						right: 0,
						bottom: 0,
						left: 0
					},
					speed = 0;

				var scrollable, onTop, onBottom, showIndicatorFor, scrollableWhen;
				if (attributes.scrollableY) {
					scrollable = $parse(attributes.scrollableY)(scope);
				} else {
					scrollable = new Scrollable();
				}
				scrollable.link({
					reset: function () {
						e.y = c.y = 0;
						redraw();
					},
				});
				if (attributes.onTop !== undefined) {
					onTop = $parse(attributes.onTop, /* interceptorFn */ null, /* expensiveChecks */ true);
				}
				if (attributes.onBottom !== undefined) {
					onBottom = $parse(attributes.onBottom, /* interceptorFn */ null, /* expensiveChecks */ true);
				}
				if (attributes.showIndicatorFor !== undefined) {
					showIndicatorFor = $parse(attributes.showIndicatorFor, /* interceptorFn */ null, /* expensiveChecks */ true);
				}
				if (attributes.scrollableWhen !== undefined) {
					scrollableWhen = $parse(attributes.scrollableWhen, /* interceptorFn */ null, /* expensiveChecks */ true);
				}
				// console.log('showIndicatorFor', showIndicatorFor);

				// ELEMENTS & STYLESHEETS;
				element.attr('unselectable', 'on').addClass('unselectable');

				var elementNode = element[0];
				var contentNode = elementNode.querySelector('.content');
				var content = angular.element(content);
				var contentStyle = new Style();
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
					indicatorStyle.transform('translate3d(' + i.x.toFixed(2) + 'px,' + i.y.toFixed(2) + 'px,0)');
					indicatorStyle.set(indicatorNode);
				}

				var animate = new Animate(redraw);

				function redraw(time) {
					if (isEnabled()) {
						// if (!busy) {
						l.top = 0;
						l.bottom = elementNode.offsetHeight - contentNode.offsetHeight;
						if (dragging) {
							e.y = s.y + move.y - down.y;
							bounce();
						} else if (speed) {
							e.y += speed;
							speed *= 0.75;
							if (wheeling) {
								bounce();
							}
							if (Math.abs(speed) < 0.05) {
								speed = 0;
								e.y = s.y = c.y;
								wheeling = false;
								animate.pause();
							}
						}
						// }
						e.y = Math.min(l.top, e.y);
						e.y = Math.max(l.bottom, e.y);
						c.y += (e.y - c.y) / 4;
						contentStyle.transform('translate3d(0,' + c.y.toFixed(2) + 'px,0)');
						contentStyle.set(contentNode);
						if (showIndicatorFor) {
							if (dragging || wheeling || speed) {
								var percent = c.y / (elementNode.offsetHeight - contentNode.offsetHeight);
								percent = Math.max(0, Math.min(1, percent));
								i.y = (elementNode.offsetHeight - indicatorNode.offsetHeight) * (percent);
								i.x += (0 - i.x) / 4;
								// var count = Math.round(contentNode.offsetHeight / 315);
								var index = Math.max(1, Math.round(percent * showIndicatorFor.rows.length));
								indicator.html(index + '/' + showIndicatorFor.count);
								// indicator.html((percent * 100).toFixed(2).toString());
							} else {
								i.x += (45 - i.x) / 4;
							}
							indicatorStyle.transform('translate3d(' + i.x.toFixed(2) + 'px,' + i.y.toFixed(2) + 'px,0)');
							indicatorStyle.set(indicatorNode);
						}
					}
				}

				function doTop() {
					if (busy) {
						return;
					}
					if (!onTop) {
						return;
					}
					busy = true;
					onTop(scope).then().finally(function () {
						s.y = e.y = 0;
						setTimeout(function () {
							undrag();
							busy = false;
						}, 500);
					});
				}

				function doBottom() {
					if (busy) {
						return;
					}
					if (!onBottom) {
						return;
					}
					busy = true;
					onBottom(scope).then().finally(function () {
						var bottom = elementNode.offsetHeight - contentNode.offsetHeight;
						if (bottom > l.bottom) {
							s.y = e.y = l.bottom;
						} else {
							s.y = e.y = l.bottom + padding;
						}
						setTimeout(function () {
							undrag();
							busy = false;
						}, 500);
					});
				}

				function undrag() {
					// console.log('undrag');
					dragging = false;
					wheeling = false;
					move = null;
					down = null;
					removeDragListeners();
				}

				function bounce() {
					l.top += padding;
					l.bottom -= padding;
					if (e.y > l.top) {
						doTop();
					} else if (e.y < l.bottom) {
						doBottom();
					}
				}

				function onDown(event) {
					if (event.type == 'touchstart') {
						element.off('mousedown', onDown);
					}
					if (!busy) {
						s.y = e.y = c.y;
						speed = 0;
						down = Utils.getTouch(event);
						wheeling = false;
						// console.log(down);
						addDragListeners();
						animate.play();
					}
				}

				function onMove(event) {
					if (event.type == 'touchmove') {
						angular.element($window).off('mousemove', onMove);
					}
					prev = move;
					move = Utils.getTouch(event);
					dragging = true;
					// console.log(move);
				}

				function onUp(event) {
					if (event.type == 'touchend') {
						angular.element($window).off('mouseup', onUp);
					}
					if (move && prev) {
						speed += (move.y - prev.y) * 4;
					}
					s.y = e.y = c.y;
					dragging = false;
					move = null;
					down = null;
					prev = null;
					up = Utils.getTouch(event);
					// console.log(up);
					removeDragListeners();
				}

				function _onWheel(e) {
					if (!busy && isEnabled()) {
						if (!e) e = $window.event;
						e = e.originalEvent ? e.originalEvent : e;
						var dir = (((e.deltaY < 0 || e.wheelDelta > 0) || e.deltaY < 0) ? 1 : -1);
						speed += dir * 5;
						wheeling = true;
						animate.play();
					}
				}

				var onWheel = Utils.throttle(_onWheel, 25);

				function off() {
					removeDragListeners();
					animate.pause();
					undrag();
				}

				function isEnabled() {
					var enabled = true;
					if (scrollableWhen) {
						enabled = enabled && scrollableWhen(scope);
					}
					enabled = enabled && $window.innerWidth >= 1024;
					enabled = enabled && (elementNode.offsetHeight < contentNode.offsetHeight);
					return enabled;
				}

				function onResize() {
					if (!isEnabled()) {
						off();
					}
					redraw();
				}

				scope.$watch(function () {
					return contentNode.offsetWidth;
				}, function (newValue, oldValue) {
					onResize();
				});

				function addListeners() {
					angular.element($window).on('resize', onResize);
					element.on('touchstart mousedown', onDown);
					element.on('wheel', onWheel);
					// element.addEventListener('DOMMouseScroll',handleScroll,false); // for Firefox
					// element.addEventListener('mousewheel',    handleScroll,false); // for everyone else
				}

				function removeListeners() {
					angular.element($window).off('resize', onResize);
					element.off('touchstart mousedown', onDown);
					element.off('wheel', onWheel);
				}

				function addDragListeners() {
					angular.element($window).on('touchmove mousemove', onMove);
					angular.element($window).on('touchend mouseup', onUp);
				}

				function removeDragListeners() {
					angular.element($window).off('touchmove mousemove', onMove);
					angular.element($window).off('touchend mouseup', onUp);
				}
				scope.$on('$destroy', function () {
					removeListeners();
					animate.pause();
				});

				addListeners();

			},
		};
    }]);

}());
