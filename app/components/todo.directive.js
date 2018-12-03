(function() {
	"use strict";

	var app = angular.module('app');

	app.directive('todoItem', ['$templateCache', '$parse', '$timeout', '$filter', 'Animate', 'DateTime', 'LocalStorage', function($templateCache, $parse, $timeout, $filter, Animate, DateTime, storage) {
		return {
			priority: 1001,
			restrict: 'A',
			templateUrl: function(element, attributes) {
				var url = attributes.template;
				if (!url) {
					url = 'partials/todolist';
					if (!$templateCache.get(url)) {
						$templateCache.put(url, '<div><json-formatter json="item"></json-formatter></div>');
					}
				}
				return url;
			},
			link: function(scope, element, attributes, model, transclude) {
				// console.log('todoItem.link');

				var SPEED = 1;

				var item = scope.item; // $parse(attributes.todoItem)(scope);

				if (!item) {
					console.log('todoItem.error', 'item undefined');
					return;
				}

				var target = element[0].querySelector(attributes.target);
				var circle = element[0].querySelector('circle.progress');
				var elapsed = element[0].querySelector('.elapsed');

				var animate = new Animate(PlayerProgress);

				var player;

				function play() {
					$timeout(function() {
						StoragePlay();
					});
				}

				function pause() {
					if (!player) {
						return;
					}
					if (player.playing) {
						$timeout(function() {
							StoragePause();
						});
					}
				}

				function PlayerToggle() {
					if (!player) {
						return;
					}

					if (player.playing) {
						pause();

					} else {
						play();

					}
				}

				function onClick(e) {
					PlayerToggle();
				}

				function onTodoPlayer($scope, $item) {
					// console.log('onTodoPlayer', $scope, $item);
					if (item !== $item) {
						pause();
					}
				}

				function addListeners() {
					angular.element(target).on('click', onClick);
				}

				function removeListeners() {
					angular.element(target).off('click', onClick);
				}
				scope.$on('onTodoPlayer', onTodoPlayer);
				scope.$on('$destroy', function() {
					removeListeners();
				});
				addListeners();

				function SetSvg(value) {
					value = Math.max(0, Math.min(1, value));
					var radius = parseInt(circle.getAttribute('r'));
					var dashArray = 2 * Math.PI * radius;
					var dashOffset = dashArray * (1 - value);
					circle.style.strokeDasharray = dashArray + '%';
					circle.style.strokeDashoffset = dashOffset + '%';
					// console.log('value', value, 'radius', radius, 'dashArray', dashArray, 'dashOffset', dashOffset);
				}

				function PlayerProgress() {
					if (player) {
						if (player.playing) {
							player.elapsedTime = player.recordedTime + player.accumulatedTime + (new Date() - player.startTime) * SPEED;
						} else {
							player.elapsedTime = player.recordedTime + player.accumulatedTime;
						}
						var timer = $filter('customDigitalTimer')(player.elapsedTime);
						if (elapsed.innerHTML !== timer) {
							elapsed.innerHTML = timer;
							var total = player.totalTime;
							var current = player.elapsedTime;
							SetSvg(current / total);
						}
					}
				}

				function StorageGet() {
					item = scope.item; // $parse(attributes.todoItem)(scope);
					if (item) {
						player = item.player;
						var players = storage.get('players') || {};
						var stored = players[item.key];
						if (stored) {
							player.accumulatedTime = parseInt(stored.accumulatedTime);
							if (stored.startTime) {
								player.startTime = new Date(stored.startTime);
								player.playing = true;
								animate.play();
								scope.$root.$broadcast('onTodoPlayer', item);
							}
						}
						// console.log('StorageGet', item.key, player.playing, player.startTime);
					}
				}

				function StoragePlay() {
					item = scope.item; // $parse(attributes.todoItem)(scope);
					if (item) {
						player = item.player;
						player.startTime = new Date();
						player.playing = true;
						var players = storage.get('players') || {};
						var stored = {
							startTime: player.startTime.getTime(),
							accumulatedTime: player.accumulatedTime,
						};
						players[item.key] = stored;
						storage.set('players', players);
						animate.play();
						// console.log('StoragePlay', item.key, player.playing, player.startTime);
						scope.$root.$broadcast('onTodoPlayer', item);
					}
				}

				function StoragePause() {
					item = scope.item; // $parse(attributes.todoItem)(scope);
					if (item) {
						// console.log('StoragePause', item.key);
						player = item.player;
						player.accumulatedTime = player.elapsedTime - player.recordedTime;
						player.elapsedTime = 0;
						player.startTime = null;
						player.playing = false;
						var players = storage.get('players') || {};
						var stored = {
							accumulatedTime: player.accumulatedTime,
						};
						players[item.key] = stored;
						storage.set('players', players);
						animate.pause();
						// console.log('StoragePause', item.key, player.playing, player.startTime);
						scope.$root.$broadcast('onTodoPause', item);
					}
				}

				function StorageUpdate() {
					item = scope.item; // $parse(attributes.todoItem)(scope);
					if (item) {
						player = item.player;
						var accumulatedHours = DateTime.timeToQuarterHour(player.accumulatedTime);
						player.accumulatedTime -= DateTime.hourToTime(accumulatedHours);
						player.recordedTime = item.recordedHours * DateTime.HOUR;
						var players = storage.get('players') || {};
						var stored = players[item.key];
						if (stored) {
							stored.accumulatedTime = player.accumulatedTime;
						} else {
							stored = {
								accumulatedTime: player.accumulatedTime,
							};
						}
						if (stored.startTime) {
							player.startTime = new Date(stored.startTime);
							player.playing = true;
							animate.play();
						} else {
							player.playing = false;
							animate.pause();
						}
						players[item.key] = stored;
						storage.set('players', players);
						// console.log('StorageUpdate', item.key, player.playing, player.startTime);
					}
				}

				function PlayerInit() {
					item = scope.item; // $parse(attributes.todoItem)(scope);
					if (item) {
						player = item.player;
						player.accumulatedTime = 0;
						player.elapsedTime = 0;
						player.totalTime = item.hours * DateTime.HOUR;
						player.recordedTime = item.recordedHours * DateTime.HOUR;
						//
						player.toggle = PlayerToggle;
						player.update = StorageUpdate;
						//
						// console.log('PlayerInit', item.key);
					}
				}

				function Init() {
					PlayerInit();
					StorageGet();
					PlayerProgress();
				}

				scope.$watch('item', Init);

			}
		};
    }]);

}());
