/* global angular */

(function() {
	"use strict";

	var app = angular.module('artisan');

	app.factory('Preload', ['$promise', function($promise) {

		function Preload(path) {
			var preload = this;
			preload.path = path;
			preload.loaded = 0;
			preload.total = 0;
			preload.progress = 0;
		}

		var statics = {
			all: PreloadAll,
		};

		var publics = {
			start: PreloadStart,
			image: PreloadImage,
		};

		angular.extend(Preload, statics);
		angular.extend(Preload.prototype, publics);

		return Preload;

		// statics methods

		function PreloadAll(paths, callback) {
			return $promise(function(promise) {
				var preloads = paths.map(function(path) {
					return new Preload(path);
				});
				var progress = {
					loaded: 0,
					total: 0,
					progress: 0,
					preloads: preloads
				};
				var i = setInterval(update, 1000 / 10);
				$promise.all(
					preloads.map(function(preload) {
						return preload.start();
					})
				).then(function() {
					clearInterval(i);
					update();
					promise.resolve(preloads.slice());
					// destroy();
				}, function(error) {
					promise.reject(error);
					// destroy();
				});

				function update() {
					progress.loaded = 0;
					progress.total = 0;
					angular.forEach(preloads, function(preload) {
						progress.loaded += preload.loaded;
						progress.total += preload.total;
					});
					var percent = progress.total ? progress.loaded / progress.total : 0;
					if (percent > progress.progress) {
						progress.progress = percent;
						if (callback) {
							callback(progress);
						}
					}
				}

				function destroy() {
					angular.forEach(preloads, function(preload) {
						preload.buffer = null;
						preload.xhr = null;
					});
				}
			});
		}

		// instance methods

		function PreloadStart() {
			var preload = this;
			return $promise(function(promise) {
				var xhr = new XMLHttpRequest();
				xhr.open("GET", preload.path, true);
				xhr.responseType = "arraybuffer"; // should be after open for ie11
				xhr.onloadstart = function(e) {
					/*
					preload.loaded = 0;
					preload.total = 1;
					preload.progress = 0;
					*/
				};
				xhr.onprogress = function(e) {
					preload.loaded = e.loaded;
					preload.total = e.total;
					preload.progress = e.total ? e.loaded / e.total : 0;
				};
				xhr.onloadend = function(e) {
					preload.loaded = preload.total;
					preload.progress = 1;
				};
				xhr.onload = function() {
					preload.buffer = xhr.response;
					promise.resolve(preload);
				};
				xhr.onerror = function(error) {
					console.log('Preload.xhr.onerror', error);
					preload.loaded = preload.total;
					preload.progress = 1;
					promise.reject(error);
				};
				xhr.send();
				preload.xhr = xhr;
			});
		}

		function PreloadImage() {
			var preload = this;
			var blob = new Blob([preload.buffer]);
			var image = new Image();
			image.src = window.URL.createObjectURL(blob);
			return image;
		}

    }]);

}());
