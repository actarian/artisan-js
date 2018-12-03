/* global angular, firebase */

(function() {
	"use strict";

	var app = angular.module('artisan');

	app.factory('Point', [function() {

		function Point(x, y) {
			this.x = x || 0;
			this.y = y || 0;
		}

		var statics = {
			difference: PointDifference,
			multiply: PointMultiply,
		};

		var publics = {
			clone: clone,
			copy: copy,
			difference: difference,
			mult: mult,
			offset: offset,
			setPos: setPos,
			setX: setX,
			setY: setY,
			toString: toString,
		};

		angular.extend(Point, statics);
		angular.extend(Point.prototype, publics);

		return Point;

		// static methods

		function PointDifference(a, b) {
			return new Point(a.x - b.x, a.y - b.y);
		}

		function PointMultiply(point, value) {
			point.x *= value;
			point.y *= value;
			return point;
		}

		// prototype methods

		function clone() {
			return new Point(this.x, this.y);
		}

		function copy(point) {
			this.x = point.x;
			this.y = point.y;
			return this;
		}

		function difference(b) {
			return PointDifference(this, b);
		}

		function mult(value) {
			return PointMultiply(this, value);
		}

		function offset(x, y) {
			this.x += x;
			this.y += y;
			return this;
		}

		function setPos(x, y) {
			this.x = x;
			this.y = y;
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

		function toString() {
			return '{' + this.x + ',' + this.y + '}';
		}

    }]);

}());
