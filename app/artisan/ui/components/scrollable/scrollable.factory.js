/* global angular */

(function () {
	"use strict";

	var app = angular.module('artisan');

	app.factory('Scrollable', ['Point', 'Rect', function (Point, Rect) {
		function Scrollable() {

			var padding = 150;
			var enabled, busy, dragging, wheeling, down, move, prev;

			var start = new Point(),
				end = new Point(),
				current = new Point(),
				indicator = new Point(),
				speed = new Point(),
				rect = new Rect(),
				container = new Rect(),
				content = new Rect();

			rect.top = rect.right = rect.bottom = rect.left = 0;

			var scrollable = {
				// properties
				start: start,
				end: end,
				current: current,
				indicator: indicator,
				speed: speed,
				rect: rect,
				container: container,
				content: content,
				// methods
				setContainer: setContainer,
				setContent: setContent,
				setEnabled: setEnabled,
				getCurrent: getCurrent,
				getIndicator: getIndicator,
				bounceX: bounceX,
				renderX: renderX,
				scrollToX: scrollToX,
				doLeft: doLeft,
				doRight: doRight,
				dragStart: dragStart,
				dragMove: dragMove,
				dragEnd: dragEnd,
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

			function bounceX() {
				var padding = 100;
				rect.left += padding;
				rect.right -= padding;
				if (end.x > rect.left) {
					doLeft();
				} else if (end.x < rect.right) {
					doRight();
				}
			}

			function renderX() {
				if (enabled) {
					rect.left = 0;
					rect.right = container.width - content.width;
					if (dragging) {
						end.x = start.x + move.x - down.x;
						bounceX();
					} else if (speed.x) {
						end.x += speed.x;
						speed.x *= 0.75;
						if (wheeling) {
							bounceX();
						}
						if (Math.abs(speed.x) < 0.05) {
							speed.x = 0;
							end.x = start.x = current.x;
							scrollable.wheeling = false;
							// animate.pause();
						}
					}
					end.x = Math.min(rect.left, end.x);
					end.x = Math.max(rect.right, end.x);
					current.x += (end.x - current.x) / 4;
				} else {
					current.x = end.x = 0;
				}
			}

			function scrollToX(x) {
				start.x = end.x = 0;
				setTimeout(function () {
					off();
					busy = false;
				}, 500);
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
					if (right > rect.right) {
						start.x = end.x = rect.right;
					} else {
						start.x = end.x = rect.right + padding;
					}
					scrollToX(0);
				});
			}

			function off() {
				dragging = false;
				wheeling = false;
				move = null;
				down = null;
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

			function wheelX(dir) {
				if (!busy && enabled) {
					end.x += dir * content.height;
					speed.x += dir * 5;
					// speed.x += dir * incrementX();
					wheeling = true;
					return (end.x + speed.x < rect.left && end.x + speed.x > rect.right);
				}
			}

			function doReset() {
				end.x = current.x = 0;
			}

		}

		function link(methods) {
			angular.extend(this, methods);
		}

		Scrollable.prototype = {
			link: link,
		};
		return Scrollable;
    }]);

}());
