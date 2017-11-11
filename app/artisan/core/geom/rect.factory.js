/* global angular, firebase */

(function () {
	"use strict";

	var app = angular.module('artisan');

	app.factory('Rect', [function () {
		function Rect(x, y, w, h) {
			this.x = x || 0;
			this.y = y || 0;
			this.w = w || 0;
			this.h = h || 0;
		}
		Rect.mult = function (rect, value) {
			rect.x *= value;
			rect.y *= value;
			rect.w *= value;
			rect.h *= value;
			return rect;
		};
		Rect.prototype = {
			mult: function (value) {
				return Rect.mult(this, value);
			},
			offset: function (x, y) {
				this.x += x;
				this.y += y;
				return this;
			},
			reduce: function (size) {
				return this.offset(-size);
			},
			reduceRect: function (rect) {
				return this.offsetRect(Rect.mult(rect, -1));
			},
			expandRect: function (rect) {
				this.x -= rect.x || 0;
				this.y -= rect.y || 0;
				this.w += rect.w || 0;
				this.h += rect.h || 0;
				return this;
			},
			expand: function (size) {
				return this.expandRect({
					x: size,
					y: size,
					w: size * 2,
					h: size * 2
				});
			},
			intersect: function (rect) {
				var x = this.x,
					y = this.y,
					w = this.w,
					h = this.h;
				return !(rect.x > x + w || rect.x + rect.w < x || rect.y > y + h || rect.y + rect.h < y);
			},
			top: function () {
				var x = this.x,
					y = this.y,
					w = this.w,
					h = this.h;
				return {
					x: x + w / 2,
					y: y
				};
			},
			right: function () {
				var x = this.x,
					y = this.y,
					w = this.w,
					h = this.h;
				return {
					x: x + w,
					y: y + h / 2
				};
			},
			bottom: function () {
				var x = this.x,
					y = this.y,
					w = this.w,
					h = this.h;
				return {
					x: x + w / 2,
					y: y + h
				};
			},
			left: function () {
				var x = this.x,
					y = this.y,
					w = this.w,
					h = this.h;
				return {
					x: x,
					y: y + h / 2
				};
			},
			center: function () {
				var x = this.x,
					y = this.y,
					w = this.w,
					h = this.h;
				return {
					x: x + w / 2,
					y: y + h / 2
				};
			},
			topLeft: function () {
				var x = this.x,
					y = this.y,
					w = this.w,
					h = this.h;
				return {
					x: x,
					y: y
				};
			},
			topRight: function () {
				var x = this.x,
					y = this.y,
					w = this.w,
					h = this.h;
				return {
					x: x + w,
					y: y
				};
			},
			bottomRight: function () {
				var x = this.x,
					y = this.y,
					w = this.w,
					h = this.h;
				return {
					x: x + w,
					y: y + h
				};
			},
			bottomLeft: function () {
				var x = this.x,
					y = this.y,
					w = this.w,
					h = this.h;
				return {
					x: x,
					y: y + h
				};
			},
			setX: function (x) {
				this.x = x;
				return this;
			},
			setY: function (y) {
				this.y = y;
				return this;
			},
			setW: function (w) {
				this.w = w;
				return this;
			},
			setH: function (h) {
				this.h = h;
				return this;
			},
			setPos: function (x, y) {
				this.x = x;
				this.y = y;
				return this;
			},
			setSize: function (w, h) {
				this.w = w;
				this.h = h;
				return this;
			},
			copy: function (rect) {
				this.x = rect.x;
				this.y = rect.y;
				this.w = rect.w;
				this.h = rect.h;
				return this;
			},
			clone: function () {
				return new Rect(this.x, this.y, this.w, this.h);
			},
			toString: function () {
				return '{' + this.x + ',' + this.y + ',' + this.w + ',' + this.h + '}';
			},
		};
		return Rect;
    }]);

}());
