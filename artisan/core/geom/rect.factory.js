/* global angular, firebase */

(function() {
	"use strict";

	var app = angular.module('artisan');

	app.factory('Rect', [function() {

		function Rect(x, y, w, h) {
			this.x = x || 0;
			this.y = y || 0;
			this.w = w || 0;
			this.h = h || 0;
		}

		var statics = {
			mult: RectMultiply,
		};

		var publics = {
			bottom: bottom,
			bottomLeft: bottomLeft,
			bottomRight: bottomRight,
			center: center,
			clone: clone,
			copy: copy,
			expand: expand,
			expandRect: expandRect,
			intersect: intersect,
			left: left,
			mult: mult,
			offset: offset,
			reduce: reduce,
			reduceRect: reduceRect,
			right: right,
			setH: setH,
			setPos: setPos,
			setSize: setSize,
			setX: setX,
			setY: setY,
			setW: setW,
			top: top,
			topLeft: topLeft,
			topRight: topRight,
			toString: toString,
		};

		angular.extend(Rect, statics);
		angular.extend(Rect.prototype, publics);

		return Rect;

		// static methods

		function RectMultiply(rect, value) {
			rect.x *= value;
			rect.y *= value;
			rect.w *= value;
			rect.h *= value;
			return rect;
		}

		// prototype methods

		function bottom() {
			var x = this.x,
				y = this.y,
				w = this.w,
				h = this.h;
			return {
				x: x + w / 2,
				y: y + h
			};
		}

		function bottomLeft() {
			var x = this.x,
				y = this.y,
				w = this.w,
				h = this.h;
			return {
				x: x,
				y: y + h
			};
		}

		function bottomRight() {
			var x = this.x,
				y = this.y,
				w = this.w,
				h = this.h;
			return {
				x: x + w,
				y: y + h
			};
		}

		function center() {
			var x = this.x,
				y = this.y,
				w = this.w,
				h = this.h;
			return {
				x: x + w / 2,
				y: y + h / 2
			};
		}

		function clone() {
			return new Rect(this.x, this.y, this.w, this.h);
		}

		function copy(rect) {
			this.x = rect.x;
			this.y = rect.y;
			this.w = rect.w;
			this.h = rect.h;
			return this;
		}

		function expand(size) {
			return this.expandRect({
				x: size,
				y: size,
				w: size * 2,
				h: size * 2
			});
		}

		function expandRect(rect) {
			this.x -= rect.x || 0;
			this.y -= rect.y || 0;
			this.w += rect.w || 0;
			this.h += rect.h || 0;
			return this;
		}

		function intersect(rect) {
			var x = this.x,
				y = this.y,
				w = this.w,
				h = this.h;
			return !(rect.x > x + w || rect.x + rect.w < x || rect.y > y + h || rect.y + rect.h < y);
		}

		function left() {
			var x = this.x,
				y = this.y,
				w = this.w,
				h = this.h;
			return {
				x: x,
				y: y + h / 2
			};
		}

		function mult(value) {
			return RectMultiply(this, value);
		}

		function offset(x, y) {
			this.x += x;
			this.y += y;
			return this;
		}

		function reduce(size) {
			return this.offset(-size);
		}

		function reduceRect(rect) {
			return this.offsetRect(RectMultiply(rect, -1));
		}

		function right() {
			var x = this.x,
				y = this.y,
				w = this.w,
				h = this.h;
			return {
				x: x + w,
				y: y + h / 2
			};
		}

		function setH(h) {
			this.h = h;
			return this;
		}

		function setPos(x, y) {
			this.x = x;
			this.y = y;
			return this;
		}

		function setSize(w, h) {
			this.w = w;
			this.h = h;
			return this;
		}

		function setX(x) {
			this.x = x;
			return this;
		}

		function setY(y) {
			this.y = y;
			return this;
		}

		function setW(w) {
			this.w = w;
			return this;
		}

		function top() {
			var x = this.x,
				y = this.y,
				w = this.w,
				h = this.h;
			return {
				x: x + w / 2,
				y: y
			};
		}

		function topLeft() {
			var x = this.x,
				y = this.y,
				w = this.w,
				h = this.h;
			return {
				x: x,
				y: y
			};
		}

		function topRight() {
			var x = this.x,
				y = this.y,
				w = this.w,
				h = this.h;
			return {
				x: x + w,
				y: y
			};
		}

		function toString() {
			return '{' + this.x + ',' + this.y + ',' + this.w + ',' + this.h + '}';
		}

    }]);

}());
