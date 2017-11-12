/* global angular */

(function () {
	"use strict";

	var app = angular.module('artisan');

	app.factory('Scrollable', ['Point', 'Rect', function (Point, Rect) {
		function Scrollable() {

			var padding = 150;
			var enabled, busy, dragging, wheeling, down, move, prev;
			var currentIndex = 0;

			var start = new Point(),
				end = new Point(),
				current = new Point(),
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
				getIndicator: getIndicator,
				renderX: renderX,
				scrollToX: scrollToX,
				scrollToIndex: scrollToIndex,
				scrollPrev: scrollPrev,
				scrollNext: scrollNext,
				doLeft: doLeft,
				doRight: doRight,
				dragStart: dragStart,
				dragMove: dragMove,
				dragEnd: dragEnd,
				wheelXCheck: wheelXCheck,
				wheelX: wheelX,
				doReset: doReset,
				off: off,
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

			function getIndicator() {
				return indicator;
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
						if (Math.abs(speed.x) < 0.05) {
							speed.x = 0;
							scrollable.wheeling = wheeling = false;
						}
					} else if (offset.x) {
						end.x = -offset.x;
						offset.x = 0;
					}
					end.x = Math.round(end.x * 10000) / 10000;
					end.x = Math.min(overflow.x, end.x);
					end.x = Math.max(overflow.width, end.x);
					current.x += (end.x - current.x) / 4;
					if (speed.x === 0 && Math.abs(end.x - current.x) < 0.05) {
						current.x = end.x;
						animating = false;
					}
					// console.log(parseFloat(current.x.toFixed(6)), end.x, overflow.x);
				} else {
					current.x = end.x = 0;
					animating = false;
				}
				return animating;
			}

			function doLeft(scope) {
				if (busy) {
					return;
				}
				if (!scrollable.onLeft) {
					return;
				}
				busy = true;
				scrollable.onLeft(scope).then().finally(function () {
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
				scrollable.onRight(scope).then().finally(function () {
					var right = container.width - content.width;
					if (right > overflow.width) {
						start.x = end.x = overflow.width;
					} else {
						start.x = end.x = overflow.width + padding;
					}
					scrollToX(0);
				});
			}

			function dragStart(point) {
				if (!busy) {
					start.x = end.x = current.x;
					start.y = end.y = current.y;
					speed.x = 0;
					speed.y = 0;
					down = point;
					wheeling = false;
					return true;
				} else {
					return false;
				}
			}

			function dragMove(point) {
				prev = move;
				move = point;
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

			function incrementX() {
				var increment = (content.width - container.width) / 20;
				increment = Math.min(10, Math.max(100, increment));
				return increment;
			}

			function wheelXCheck(dir) {
				if (!busy && enabled) {
					// var endx = end.x + dir * content.height;
					// var speedx = speed.x + dir * 5;
					if (dir < 0) {
						return (end.x > overflow.width);
					} else {
						return (end.x < overflow.x);
					}
				} else {
					return false;
				}
			}

			function wheelX(dir) {
				end.x += dir * content.height;
				speed.x += dir * 5;
				wheeling = true;
			}

			function scrollToX(x) {
				start.x = end.x = x;
				setTimeout(function () {
					off();
					busy = false;
				}, 500);
			}

			function getItemAtIndex(index) {
				var item = null;
				var items = scrollable.getItems();
				if (index >= 0 && index < items.length) {
					item = items[index];
				}
				// console.log('getItemAtIndex', index, items.length, item);
				return item;
			}

			function scrollToIndex(index) {
				if (index !== currentIndex) {
					currentIndex = index;
					var item = getItemAtIndex(index);
					// console.log('scrollToIndex', item, index, currentIndex);
					if (item) {
						offset.x = item.offsetLeft;
						offset.y = item.offsetTop;
						console.log('offset', offset);
					}
				}
			}

			function scrollPrev() {
				var index = Math.max(0, currentIndex - 1);
				// console.log('scrollPrev', index);
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

		}

		function link(methods) {
			angular.extend(this, methods);
		}

		Scrollable.prototype = {
			link: link,
			getItems: function () {
				return [content];
			},
		};
		return Scrollable;
		}]);

}());
