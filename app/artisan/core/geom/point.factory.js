/* global angular, firebase */

(function () {
	"use strict";

	var app = angular.module('artisan');

	app.factory('Point', [function () {
		function Point(x, y) {
			this.x = x || 0;
			this.y = y || 0;
		}
		Point.mult = function (point, value) {
			point.x *= value;
			point.y *= value;
			return point;
		};
		Point.prototype = {
			mult: function (value) {
				return Point.mult(this, value);
			},
			offset: function (x, y) {
				this.x += x;
				this.y += y;
				return this;
			},
			setX: function (x) {
				this.x = x;
				return this;
			},
			setY: function (y) {
				this.y = y;
				return this;
			},
			setPos: function (x, y) {
				this.x = x;
				this.y = y;
				return this;
			},
			copy: function (point) {
				this.x = point.x;
				this.y = point.y;
				return this;
			},
			clone: function () {
				return new Point(this.x, this.y);
			},
			toString: function () {
				return '{' + this.x + ',' + this.y + '}';
			},
		};
		return Point;
    }]);

}());
