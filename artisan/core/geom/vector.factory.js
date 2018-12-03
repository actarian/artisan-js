/* global angular, firebase */

(function() {
	"use strict";

	var app = angular.module('artisan');

	app.factory('Vector', function() {
		function Vector(x, y) {
			this.x = x || 0;
			this.y = y || 0;
		}

		var statics = {
			cross: VectorCross,
			difference: VectorDifference,
			distance: VectorDistance,
			incidence: VectorIncidence,
			make: VectorMake,
			normalize: VectorNormalize,
			power: VectorPower,
			size: VectorSize,
		};

		var publics = {
			add: add,
			copy: copy,
			cross: cross,
			difference: difference,
			distance: distance,
			friction: friction,
			incidence: incidence,
			normalize: normalize,
			power: power,
			size: size,
			towards: towards,
			toString: toString,
		};

		angular.extend(Vector, statics);
		angular.extend(Vector.prototype, publics);

		return Vector;

		// statics methods

		function VectorCross(a, b) {
			return (a.x * b.y) - (a.y * b.x);
		}

		function VectorDifference(a, b) {
			return new Vector(a.x - b.x, a.y - b.y);
		}

		function VectorDistance(a, b) {
			return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
		}

		function VectorIncidence(a, b) {
			var angle = Math.atan2(b.y, b.x) - Math.atan2(a.y, a.x);
			return angle;
		}

		function VectorMake(a, b) {
			return new Vector(b.x - a.x, b.y - a.y);
		}

		function VectorNormalize(a) {
			var l = Vector.size(a);
			a.x /= l;
			a.y /= l;
			return a;
		}

		function VectorPower(a, b) {
			var x = Math.abs(b.x - a.x);
			var y = Math.abs(b.y - a.y);
			return (x + y) / 2;
		}

		function VectorSize(a) {
			return Math.sqrt(a.x * a.x + a.y * a.y);
		}

		// prototype methods

		function add(b) {
			this.x += b.x;
			this.y += b.y;
			return this;
		}

		function copy(b) {
			return new Vector(this.x, this.y);
		}

		function cross(b) {
			return VectorCross(this, b);
		}

		function difference(b) {
			return VectorDifference(this, b);
		}

		function distance(b) {
			return VectorDistance(this, b);
		}

		function friction(b) {
			this.x *= b;
			this.y *= b;
			return this;
		}

		function incidence(b) {
			return VectorIncidence(this, b);
		}

		function normalize() {
			return VectorNormalize(this);
		}

		function power() {
			return (Math.abs(this.x) + Math.abs(this.y)) / 2;
		}

		function size() {
			return VectorSize(this);
		}

		function towards(b, friction) {
			friction = friction || 0.125;
			this.x += (b.x - this.x) * friction;
			this.y += (b.y - this.y) * friction;
			return this;
		}

		function toString() {
			return '{' + this.x + ',' + this.y + '}';
		}

	});

}());
