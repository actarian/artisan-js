/* global angular */

(function () {
	"use strict";

	var app = angular.module('artisan');

	app.directive('videoSource', ['$timeout', function ($timeout) {
		return {
			restrict: 'A',
			scope: {
				source: '=videoSource',
				image: '=videoImage',
			},
			templateUrl: function (element, attributes) {
				return attributes.template || 'artisan/video/video-player';
			},
			link: function (scope, element, attributes) {
				var native = element[0];
				var video = native.querySelector('video');
				var img = native.querySelector('img');
				var infos = {};
				scope.playing = false;
				scope.busy = false;
				scope.toggle = toggle;
				scope.play = play;
				scope.pause = pause;
				scope.infos = infos;

				function toggle() {
					if (!scope.busy) {
						scope.busy = true;
						if (scope.playing) {
							video.pause();
						} else {
							video.play();
						}
					}
				}

				function play() {
					if (!scope.busy) {
						scope.busy = true;
						video.play();
					}
				}

				function pause() {
					if (!scope.busy) {
						scope.busy = true;
						video.pause();
					}
				}

				function onPlaying(e) {
					$timeout(function () {
						scope.playing = true;
						scope.busy = false;
					});
				}

				function onPause(e) {
					$timeout(function () {
						scope.playing = false;
						scope.busy = false;
					});
				}

				function onEnded(e) {
					$timeout(function () {
						scope.playing = false;
						scope.busy = false;
					});
				}

				function onProgress(e) {
					$timeout(function () {
						infos.buffered = video.buffered; // todo: TimeRanges
						console.log('onProgress', infos);
					});
				}

				function onTimeUpdate(e) {
					$timeout(function () {
						infos.duration = video.duration;
						infos.currentTime = video.currentTime;
						infos.progressTime = infos.currentTime / infos.duration;
						console.log('onTimeUpdate', infos);
					});
				}

				var videoElement = angular.element(video);

				function addListeners() {
					videoElement.on('playing', onPlaying);
					videoElement.on('pause', onPause);
					videoElement.on('ended', onEnded);
					videoElement.on('progress', onProgress);
					videoElement.on('timeupdate', onTimeUpdate);
				}

				function removeListeners() {
					videoElement.off('playing', onPlaying);
					videoElement.off('pause', onPause);
					videoElement.off('ended', onEnded);
					videoElement.off('progress', onProgress);
					videoElement.off('timeupdate', onTimeUpdate);
				}

				addListeners();
				scope.$on('destroy', function () {
					removeListeners();
				});

			}
		};
    }]);

	/*
	Object.defineProperty(HTMLMediaElement.prototype, 'playing', {
	    get: function () {
	        return !!(this.currentTime > 0 && !this.paused && !this.ended && this.readyState > 2);
	    }
	});
	*/

}());