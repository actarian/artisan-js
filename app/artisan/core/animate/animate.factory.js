/* global angular */

(function () {
	"use strict";

	var app = angular.module('artisan');

	app.factory('Animate', [function () {

		function Animate(callback) {
			this.callback = callback;
			this.key = null;
			this.ticks = 0;
		}
		Animate.prototype = {
			play: function () {
				var _this = this;

				function loop(time) {
					_this.ticks++;
					_this.callback(time, _this.ticks);
					_this.key = window.requestAnimationFrame(loop);
				}
				if (!this.key) {
					loop();
				}
			},
			pause: function () {
				if (this.key) {
					window.cancelAnimationFrame(this.key);
					this.key = null;
				}
			},
			playpause: function () {
				if (this.key) {
					this.pause();
				} else {
					this.play();
				}
			},
			doNOTPlay: function () {
				this.pause();
			},
		}
		return Animate;
    }]);

	(function () {
		var lastTime = 0;
		var vendors = ['ms', 'moz', 'webkit', 'o'];
		for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
			window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
			window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||
				window[vendors[x] + 'CancelRequestAnimationFrame'];
		}
		if (!window.requestAnimationFrame) {
			window.requestAnimationFrame = function (callback, element) {
				var currTime = new Date().getTime();
				var timeToCall = Math.max(0, 16 - (currTime - lastTime));
				var id = window.setTimeout(function () {
					callback(currTime + timeToCall);
				}, timeToCall);
				lastTime = currTime + timeToCall;
				return id;
			};
		}
		if (!window.cancelAnimationFrame) {
			window.cancelAnimationFrame = function (id) {
				clearTimeout(id);
			};
		}
	}());

}());
