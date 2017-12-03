(function() {
    "use strict";

    var app = angular.module('app');

    app.directive('todoItem', ['$templateCache', '$parse', '$timeout', '$filter', 'DateTime', 'Animate', 'LocalStorage', function($templateCache, $parse, $timeout, $filter, DateTime, Animate, storage) {
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

                var SPEED = 100;

                var item = $parse(attributes.todoItem)(scope);

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
                    if (player.playing) {
                        $timeout(function() {
                            StoragePause();
                        });
                    }
                }

                function PlayerToggle() {
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

                /*
                function __Update() {
                    if (player) {
                        player.elapsedTime = 0;
                        player.startTime = 0;
                        player.totalTime = item.hours * DateTime.HOUR;
                        player.recordedTime = item.recordedHours * DateTime.HOUR;
                        player.pow = Math.max(0, Math.min(1, player.recordedTime / player.totalTime));
                        console.log('Update', item.key);
                    }
                }
                */

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
                    item = $parse(attributes.todoItem)(scope);
                    if (item) {
                        player = item.player;
                        var players = storage.get('players') || {};
                        var p = players[item.key];
                        console.log('StorageGet', p);
                        if (p) {
                            player.accumulatedTime = parseInt(p.accumulatedTime);
                            if (p.startTime) {
                                player.startTime = new Date(p.startTime);
                                player.playing = true;
                                animate.play();
                                scope.$root.$broadcast('onTodoPlayer', item);
                            }
                        }
                    }
                }

                function StoragePlay() {
                    item = $parse(attributes.todoItem)(scope);
                    if (item) {
                        player = item.player;
                        player.startTime = new Date();
                        player.playing = true;
                        var players = storage.get('players') || {};
                        players[item.key] = {
                            startTime: player.startTime.getTime(),
                            accumulatedTime: player.accumulatedTime,
                        };
                        storage.set('players', players);
                        animate.play();
                        scope.$root.$broadcast('onTodoPlayer', item);
                    }
                }

                function StoragePause() {
                    item = $parse(attributes.todoItem)(scope);
                    if (item) {
                        player = item.player;
                        player.accumulatedTime = player.elapsedTime - player.recordedTime;
                        player.elapsedTime = 0;
                        delete player.startTime;
                        player.playing = false;
                        var players = storage.get('players') || {};
                        players[item.key] = {
                            accumulatedTime: player.accumulatedTime,
                        };
                        storage.set('players', players);
                        animate.pause();
                        scope.$root.$broadcast('onTodoPause', item);
                    }
                }

                function StorageUpdate() {
                    item = $parse(attributes.todoItem)(scope);
                    if (item) {
                        player = item.player;

                        var accumulatedHours = DateTime.timeToQuarterHour(player.accumulatedTime);
                        player.accumulatedTime -= DateTime.hourToTime(accumulatedHours);
                        player.recordedTime = item.recordedHours * DateTime.HOUR;
                        player.pow = Math.max(0, Math.min(1, player.recordedTime / player.totalTime));
                        var players = storage.get('players') || {};
                        players[item.key] = {
                            accumulatedTime: player.accumulatedTime,
                        };
                        storage.set('players', players);
                        console.log('StorageUpdate', item.key, accumulatedHours, player.accumulatedTime);
                    }
                }

                function addHours(hours) {
                    var msecs = hours * 60 * 60 * 1000;
                    player.recordedTime += msecs;
                    player.pow = Math.max(0, Math.min(1, player.recordedTime / player.totalTime));
                    player.elapsedTime -= msecs;
                }

                function PlayerInit() {
                    item = $parse(attributes.todoItem)(scope);
                    if (item) {
                        player = item.player;
                        player.accumulatedTime = 0;
                        player.elapsedTime = 0;
                        player.totalTime = item.hours * DateTime.HOUR;
                        player.recordedTime = item.recordedHours * DateTime.HOUR;
                        player.pow = Math.max(0, Math.min(1, player.recordedTime / player.totalTime));
                        //
                        player.toggle = PlayerToggle;
                        player.update = StorageUpdate;
                        player.addHours = addHours;
                        //
                        console.log('PlayerInit', item.key);
                    }
                }

                function Init() {
                    PlayerInit();
                    StorageGet();
                    PlayerProgress();
                    // item.player = player;
                    console.log('item', item);
                }

                Init();

            }
        };
    }]);

}());