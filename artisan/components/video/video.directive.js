/* global angular */

(function() {
	"use strict";

	var app = angular.module('artisan');

	app.directive('videoSource', ['$timeout', '$promise', function($timeout, $promise) {

		var directive = {
			restrict: 'A',
			scope: {
				source: '=videoSource',
				image: '=videoImage',
			},
			templateUrl: function(element, attributes) {
				return attributes.template || 'artisan/components/video/partial/video-player';
			},
			link: VideoSourceLink
		};

		return directive;

		function VideoSourceLink(scope, element, attributes) {

			var native = element[0];
			var video = native.querySelector('video');
			var img = native.querySelector('img');
			var infos = {};
			scope.canplay = false;
			scope.playing = false;
			scope.busy = false;
			scope.toggle = toggle;
			scope.play = play;
			scope.pause = pause;
			scope.infos = infos;

			// loop><source src="{{source}}" type="video/mp4"

			function canplay() {
				return $promise(function(promise) {

					function _onCanPlay(e) {
						scope.canplay = true;
						angular.element(video).off('canplay', _onCanPlay);
						// console.log('videoSource._onCanPlay', e);
						promise.resolve();
					}

					if (scope.canplay) {
						promise.resolve();
					} else {
						angular.element(video).on('canplay', _onCanPlay);
						video.preload = true;
						video.src = scope.source;
					}
				});
			}

			function toggle() {
				if (!scope.busy) {
					scope.busy = true;
					if (scope.playing) {
						video.pause();
					} else {
						canplay().then(function() {
							video.play();
						});
					}
				}
			}

			function play() {
				if (!scope.busy) {
					scope.busy = true;
					canplay().then(function() {
						video.play();
					});
				}
			}

			function pause() {
				if (!scope.busy) {
					scope.busy = true;
					video.pause();
				}
			}

			function onCanPlay(e) {
				$timeout(function() {
					scope.canplay = true;
				});
			}

			function onPlaying(e) {
				$timeout(function() {
					scope.playing = true;
					scope.busy = false;
				});
			}

			function onPause(e) {
				$timeout(function() {
					scope.playing = false;
					scope.busy = false;
				});
			}

			function onEnded(e) {
				$timeout(function() {
					scope.playing = false;
					scope.busy = false;
				});
			}

			function onProgress(e) {
				$timeout(function() {
					infos.buffered = video.buffered; // todo: TimeRanges
					// console.log('onProgress', infos);
				});
			}

			function onTimeUpdate(e) {
				$timeout(function() {
					infos.duration = video.duration;
					infos.currentTime = video.currentTime;
					infos.progressTime = infos.currentTime / infos.duration;
					// console.log('onTimeUpdate', infos);
				});
			}

			var videoElement = angular.element(video);

			function addListeners() {
				// videoElement.on('canplay', onCanPlay);
				videoElement.on('playing', onPlaying);
				videoElement.on('pause', onPause);
				videoElement.on('ended', onEnded);
				videoElement.on('progress', onProgress);
				videoElement.on('timeupdate', onTimeUpdate);
			}

			function removeListeners() {
				// videoElement.off('canplay', onCanPlay);
				videoElement.off('playing', onPlaying);
				videoElement.off('pause', onPause);
				videoElement.off('ended', onEnded);
				videoElement.off('progress', onProgress);
				videoElement.off('timeupdate', onTimeUpdate);
			}

			addListeners();
			scope.$on('destroy', function() {
				removeListeners();
			});

		}

    }]);

	/*
	Object.defineProperty(HTMLMediaElement.prototype, 'playing', {
	    get: function () {
	        return !!(this.currentTime > 0 && !this.paused && !this.ended && this.readyState > 2);
	    }
	});
	*/

}());
