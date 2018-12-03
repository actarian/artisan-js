/* global angular */

(function() {
	"use strict";

	var app = angular.module('artisan');

	app.factory('Scrollable', ['Utils', 'Point', 'Rect', function(Utils, Point, Rect) {

		function Scrollable() {

			var padding = 150;
			var enabled, snappable, busy, dragging, wheeling, down, move, prev;
			var currentIndex = 0;

			snappable = true;

			var start = new Point(),
				end = new Point(),
				current = new Point(),
				drag = new Point(),
				indicator = new Point(),
				offset = new Point(),
				speed = new Point(),
				container = new Rect(),
				content = new Rect(),
				overflow = new Rect();

			var scrollable = {
				// properties
				start: start,
				end: end,
				current: current,
				indicator: indicator,
				speed: speed,
				overflow: overflow,
				container: container,
				content: content,
				// methods
				setContainer: setContainer,
				setContent: setContent,
				setEnabled: setEnabled,
				getCurrent: getCurrent,
				getDrag: getDrag,
				getIndicator: getIndicator,
				getIndex: getIndex,
				scrollToIndex: scrollToIndex,
				scrollPrev: scrollPrev,
				scrollNext: scrollNext,
				dragStart: dragStart,
				dragMove: dragMove,
				dragEnd: dragEnd,
				doReset: doReset,
				off: off,
				// x direction
				doLeft: doLeft,
				doRight: doRight,
				renderX: renderX,
				scrollToX: scrollToX,
				wheelX: wheelX,
				wheelXCheck: wheelXCheck,
				// y direction
				doTop: doTop,
				doBottom: doBottom,
				renderY: renderY,
				scrollToY: scrollToY,
				wheelY: wheelY,
				wheelYCheck: wheelYCheck,
			};

			angular.extend(this, scrollable);

			scrollable = this;

			function setContainer(node) {
				container.width = node.offsetWidth;
				container.height = node.offsetHeight;
			}

			function setContent(node) {
				content.width = node.offsetWidth;
				content.height = node.offsetHeight;
			}

			function setEnabled(flag) {
				enabled = flag;
			}

			function getCurrent() {
				return current;
			}

			function getDrag() {
				return drag;
			}

			function getIndicator() {
				return indicator;
			}

			function getIndex() {
				return currentIndex;
			}

			function scrollToIndex(index) {
				if (index !== currentIndex) {
					currentIndex = index;
					var item = getItemAtIndex(index);
					if (item) {
						offset = new Point(
							item.offsetLeft,
							item.offsetTop
						);
						// console.log('scrollToIndex', index, offset);
					}
					return true;
				}
			}

			function dragStart(point) {
				if (!busy) {
					start.x = end.x = current.x;
					start.y = end.y = current.y;
					speed.x = 0;
					speed.y = 0;
					down = point;
					currentIndex = -1;
					wheeling = false;
					return true;
				} else {
					return false;
				}
			}

			function dragMove(point) {
				prev = move;
				move = point;
				drag.x = move.x - down.x;
				drag.y = move.y - down.y;
				dragging = true;
			}

			function dragEnd() {
				if (move && prev) {
					speed.x += (move.x - prev.x) * 4;
					speed.y += (move.y - prev.y) * 4;
				}
				start.x = end.x = current.x;
				start.y = end.y = current.y;
				dragging = false;
				move = null;
				down = null;
				prev = null;
			}

			function getItemAtIndex(index) {
				var item = null;
				var items = scrollable.getItems();
				if (items) {
					if (index >= 0 && index < items.length) {
						item = items[index];
					}
				}
				// console.log('getItemAtIndex', index, items.length, item);
				return item;
			}

			function scrollPrev() {
				var index = Math.max(0, currentIndex - 1);
				console.log('scrollPrev', index);
				scrollToIndex(index);
			}

			function scrollNext() {
				var items = scrollable.getItems();
				var index = Math.min(items.length - 1, currentIndex + 1);
				console.log('scrollNext', index);
				scrollToIndex(index);
			}

			function doReset() {
				end.x = current.x = 0;
			}

			function off() {
				dragging = false;
				wheeling = false;
				move = null;
				down = null;
			}

			// x - direction

			function doLeft(scope) {
				if (busy) {
					return;
				}
				if (!scrollable.onLeft) {
					return;
				}
				busy = true;
				scrollable.onLeft(scope).then().finally(function() {
					scrollToX(0);
				});
			}

			function doRight(scope) {
				if (busy) {
					return;
				}
				if (!scrollable.onRight) {
					return;
				}
				busy = true;
				scrollable.onRight(scope).then().finally(function() {
					var right = container.width - content.width;
					if (right > overflow.width) {
						start.x = end.x = overflow.width;
					} else {
						start.x = end.x = overflow.width + padding;
					}
					scrollToX(0);
				});
			}

			function renderX() {
				var animating = true;
				if (enabled) {
					overflow.x = 0;
					overflow.width = container.width - content.width;
					if (dragging) {
						end.x = start.x + move.x - down.x;
						if (extendX()) {
							start.x = end.x;
							down.x = move.x;
						}
					} else if (speed.x) {
						end.x += speed.x;
						speed.x *= 0.75;
						if (wheeling) {
							extendX();
						}
						if (Math.abs(speed.x) < 2.05) {
							speed.x = 0;
							scrollable.wheeling = wheeling = false;
							snapToNearestX();
						}
					} else if (offset) {
						end.x = -offset.x;
						offset = null;
					}
					end.x = Math.round(end.x * 10000) / 10000;
					end.x = Math.min(overflow.x, end.x);
					end.x = Math.max(overflow.width, end.x);
					current.x += (end.x - current.x) / 4;
					if (speed.x === 0 && Math.abs(end.x - current.x) < 0.05) {
						current.x = end.x;
						if (!snapToNearestX()) {
							animating = false;
						}
					}
					// console.log('renderX', current.x, end.x, overflow.x);
				} else {
					current.x = end.x = 0;
					animating = false;
				}
				return animating;
			}

			function extendX() {
				var extending = false;
				overflow.x += padding;
				overflow.width -= padding;
				if (end.x > overflow.x) {
					extending = true;
					doLeft();
				} else if (end.x < overflow.width) {
					extending = true;
					doRight();
				}
				return extending;
			}

			function snapToNearestX() {
				var items = scrollable.getItems();
				if (items) {
					var index = -1;
					var min = Number.POSITIVE_INFINITY;
					angular.forEach(items, function(item, i) {
						var distance = Math.abs((end.x + speed.x) - (item.offsetLeft * -1));
						if (distance < min) {
							min = distance;
							index = i;
						}
					});
					if (index !== -1) {
						if (snappable) {
							return scrollToIndex(index);
						} else {
							currentIndex = index;
						}
					}
				}
			}

			function wheelXCheck(dir) {
				// console.log('wheelYCheck', dir < 0 ? (end.x - overflow.width) : (end.x - overflow.x));
				if (!busy && enabled) {
					if (dir < 0) {
						return end.x - overflow.width;
					} else {
						return end.x - overflow.x;
					}
				} else {
					return false;
				}
			}

			function wheelX(dir, interval) {
				end.x += dir * 100 / 1000 * interval;
				speed.x += dir * 100 / 1000 * interval;
				wheeling = true;
			}

			function scrollToX(value) {
				start.x = end.x = value;
				setTimeout(function() {
					off();
					busy = false;
				}, 500);
			}

			// y - direction

			function doTop(scope) {
				if (busy) {
					return;
				}
				if (!scrollable.onTop) {
					return;
				}
				busy = true;
				scrollable.onTop(scope).then().finally(function() {
					scrollToY(0);
				});
			}

			function doBottom(scope) {
				if (busy) {
					return;
				}
				if (!scrollable.onBottom) {
					return;
				}
				busy = true;
				scrollable.onBottom(scope).then().finally(function() {
					var bottom = container.height - content.height;
					if (bottom > overflow.height) {
						start.y = end.y = overflow.height;
					} else {
						start.y = end.y = overflow.height + padding;
					}
					scrollToY(0);
				});
			}

			function renderY() {
				var animating = true;
				if (enabled) {
					overflow.y = 0;
					overflow.height = container.height - content.height;
					if (dragging) {
						end.y = start.y + move.y - down.y;
						if (extendY()) {
							start.y = end.y;
							down.y = move.y;
						}
					} else if (speed.y) {
						end.y += speed.y;
						speed.y *= 0.75;
						if (wheeling) {
							extendY();
						}
						if (Math.abs(speed.y) < 2.05) {
							speed.y = 0;
							scrollable.wheeling = wheeling = false;
							snapToNearestY();
						}
					} else if (offset) {
						end.y = -offset.y;
						offset = null;
					}
					end.y = Math.round(end.y * 10000) / 10000;
					end.y = Math.min(overflow.y, end.y);
					end.y = Math.max(overflow.height, end.y);
					current.y += (end.y - current.y) / 4;
					if (speed.y === 0 && Math.abs(end.y - current.y) < 0.05) {
						current.y = end.y;
						if (!snapToNearestY()) {
							animating = false;
						}
					}
					// console.log(parseFloat(current.y.toFixed(6)), end.y, overflow.y);
					// console.log(dragging, wheeling, end.y, speed.y, Math.abs(end.y - current.y));
				} else {
					current.y = end.y = 0;
					animating = false;
				}
				return animating;
			}

			function extendY() {
				var extending = false;
				overflow.y += padding;
				overflow.height -= padding;
				if (end.y > overflow.y) {
					extending = true;
					doTop();
				} else if (end.y < overflow.height) {
					extending = true;
					doBottom();
				}
				return extending;
			}

			function snapToNearestY() {
				var items = scrollable.getItems();
				if (items) {
					var index = -1;
					var min = Number.POSITIVE_INFINITY;
					angular.forEach(items, function(item, i) {
						var distance = Math.abs((end.y + speed.y) - (item.offsetTop * -1));
						if (distance < min) {
							min = distance;
							index = i;
						}
					});
					// console.log('snapToNearestY', index, min);
					if (index !== -1) {
						if (snappable) {
							return scrollToIndex(index);
						} else {
							currentIndex = index;
						}
					}
				}
			}

			function wheelYCheck(dir) {
				// console.log('wheelYCheck', dir < 0 ? (end.y - overflow.height) : (end.y - overflow.y));
				if (!busy && enabled) {
					if (dir < 0) {
						return end.y - overflow.height;
					} else {
						return end.y - overflow.y;
					}
				} else {
					return false;
				}
			}

			function wheelY(dir, interval) {
				end.y += dir * 100 / 1000 * interval;
				speed.y += dir * 100 / 1000 * interval;
				wheeling = true;
			}

			function scrollToY(value) {
				start.y = end.y = value;
				setTimeout(function() {
					off();
					busy = false;
				}, 500);
			}

		}

		function link(methods) {
			angular.extend(this, methods);
		}

		Scrollable.prototype = {
			link: link,
			getItems: function() {
				return [content];
			},
		};
		return Scrollable;
    }]);

}());
