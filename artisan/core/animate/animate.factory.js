/* global angular */

(function() {
	"use strict";

	var app = angular.module('artisan');

	app.factory('Animate', [function() {

		function Animate(callback) {
			this.callback = callback;
			this.key = null;
			this.ticks = 0;
		}

		var statics = {};

		var publics = {
			pause: pause,
			play: play,
			toggle: toggle,
		};

		angular.extend(Animate, statics);
		angular.extend(Animate.prototype, publics);

		return Animate;

		// static methods

		// prototype methods

		function pause() {
			var animate = this;
			if (animate.key) {
				window.cancelAnimationFrame(animate.key);
				animate.key = null;
			}
		}

		function play() {
			var animate = this;

			function loop(time) {
				animate.ticks++;
				animate.callback(time, animate.ticks);
				animate.key = window.requestAnimationFrame(loop);
			}
			if (!animate.key) {
				loop();
			}
		}

		function toggle() {
			var animate = this;
			if (animate.key) {
				animate.pause();
			} else {
				animate.play();
			}
		}

    }]);

	(function() {
		var lastTime = 0;
		var vendors = ['ms', 'moz', 'webkit', 'o'];
		for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
			window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
			window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||
				window[vendors[x] + 'CancelRequestAnimationFrame'];
		}
		if (!window.requestAnimationFrame) {
			window.requestAnimationFrame = function(callback, element) {
				var currTime = new Date().getTime();
				var timeToCall = Math.max(0, 16 - (currTime - lastTime));
				var id = window.setTimeout(function() {
					callback(currTime + timeToCall);
				}, timeToCall);
				lastTime = currTime + timeToCall;
				return id;
			};
		}
		if (!window.cancelAnimationFrame) {
			window.cancelAnimationFrame = function(id) {
				clearTimeout(id);
			};
		}
	}());

}());
