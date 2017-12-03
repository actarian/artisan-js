/* global angular */

(function() {
    "use strict";

    var app = angular.module('app', ['ngSanitize', 'artisan', 'jsonFormatter']);

}());
/* global angular */

(function() {
    "use strict";

    var app = angular.module('app');

    app.service('Api', ['Http', function(Http) {

        var api = {
            navs: {
                main: function() {
                    return Http.get('/navs/main.json');
                },
            },
            docs: {
                id: function(id) {
                    return Http.get('/docs/' + id + '.json');
                },
                path: function(path) {
                    path = path.split('/').join('-');
                    return Http.get('/docs/' + path + '.json');
                },
            },
            maps: {
                markers: function() {
                    return Http.get('/maps/markers.json');
                },
            },
        };

        angular.extend(this, api);

    }]);

}());
/* global angular */

(function() {
    "use strict";

    var app = angular.module('app');

    app.config(['$routeProvider', function($routeProvider) {

        $routeProvider.when('/', {
            templateUrl: function() {
                return 'views/slug.html';
            },
            controller: 'HomeCtrl',

        }).when('/test', {
            templateUrl: function() {
                return 'views/test.html';
            },
            controller: 'TestCtrl',
            // resolve: {
            //    user: ['Users', function(Users) {
            //        return Users.isAuthorizedOrGoTo('/home');
            //    }]
            // },

        }).when('/contact-us', {
            templateUrl: function() {
                return 'views/contact-us.html';
            },
            controller: 'ContactUsCtrl',
            // resolve: {
            //    user: ['Users', function(Users) {
            //        return Users.isAuthorizedOrGoTo('/home');
            //    }]
            // },

        }).when('/works/:slug', {
            templateUrl: function() {
                return 'views/slug.html';
            },
            controller: 'SlugCtrl',

        }).when('/works/visuals/:slug', {
            templateUrl: function() {
                return 'views/slug.html';
            },
            controller: 'SlugCtrl',

        }).when('/works/production/:slug', {
            templateUrl: function() {
                return 'views/slug.html';
            },
            controller: 'SlugCtrl',

        }).when('/experiences/:slug', {
            templateUrl: function() {
                return 'views/slug.html';
            },
            controller: 'SlugCtrl',

        }).when('/:slug', {
            templateUrl: function() {
                return 'views/slug.html';
            },
            controller: 'SlugCtrl',

        });

        $routeProvider.otherwise('/');

    }]);

}());
/* global angular */

(function() {
    "use strict";

    var app = angular.module('app');

    app.run(['$rootScope', 'Router', 'Trust', function($rootScope, Router, Trust) {

        $rootScope.router = Router;
        $rootScope.trust = Trust;

    }]);

}());
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
/* global angular */

(function () {
	"use strict";

	var app = angular.module('app');

	app.controller('ContactUsCtrl', ['$scope', 'State', 'View', 'Api', function ($scope, State, View, Api) {

		var state = new State();
		var state2 = new State();
		var googlemaps = {};
		var mapbox = {};

		var publics = {
			state: state,
			state2: state2,
			googlemaps: googlemaps,
			mapbox: mapbox,
		};

		angular.extend($scope, publics); // todo

		View.current().then(function (view) {
			$scope.view = view;
			state.ready();

		}, function (error) {
			state.error(error);

		});

		Api.maps.markers().then(function (items) {
			googlemaps.setMarkers(items);
			mapbox.setMarkers(items);
		});

    }]);

}());
/* global angular */

(function () {
	"use strict";

	var app = angular.module('app');

	app.controller('HomeCtrl', ['$scope', 'State', 'View', function ($scope, State, View) {
		var state = new State();

		View.current().then(function (view) {
			$scope.view = view;
			state.ready();

		}, function (error) {
			state.error(error);

		});

		$scope.state = state;
    }]);

}());

/* global angular */

(function() {
    "use strict";

    var app = angular.module('app');

    app.controller('RootCtrl', ['$scope', '$timeout', '$promise', 'Nav', 'Api', 'Range', 'Scrollable', 'AuthService', 'FacebookService', 'GoogleService', function($scope, $timeout, $promise, Nav, Api, Range, Scrollable, AuthService, FacebookService, GoogleService) {

        var nav = new Nav({
            onPath: onPath,
            onNav: onNav,
        });

        Api.navs.main().then(function(items) {
            nav.setItems(items);

        }, function(error) {
            console.log('RootCtrl.error', error);

        });

        function onPath(item) {
            var path = item.path;
            // console.log('RootCtrl.onPath', item.$nav.level, path);
            return path;
        }

        function onNav(item) {
            // console.log('RootCtrl.onNav', item.$nav.level, item.$nav.path);
            Nav.path(item.$nav.path);
            return false; // returning false disable default link behaviour;
        }

        function onNavPromise(item) {
            $scope.selected = item;
            return $promise(function(promise) {
                // console.log('RootCtrl.onNavPromise', item.$nav.level, item.$nav.path);
                $timeout(function() {
                    if (item.items) {
                        item.$nav.addItems({
                            name: "Item",
                        });
                    }
                    promise.resolve();
                });
            }); // a promise always disable default link behaviour;
        }

        $scope.nav = nav;

        ////////////

        var items = new Array(20).fill(null).map(function(value, index) {
            return {
                id: index + 1,
                name: 'Item',
                items: new Array(3).fill(null).map(function(value, index) {
                    return {
                        id: index + 1,
                        name: 'Item',
                        items: new Array(2).fill(null).map(function(value, index) {
                            return {
                                id: index + 1,
                                name: 'Item',
                            };
                        }),
                    };
                }),
            };
        });

        $scope.items = items;

        var scrollable = new Scrollable();

        $scope.scrollable = scrollable;

        //////////////

        function getFacebookMe() {
            FacebookService.getMe().then(function(user) {
                console.log('FacebookService.getMe', user);
            }, function(error) {
                console.log('FacebookService.getMe.error', error);
            });
        }

        function getGoogleMe() {
            GoogleService.getMe().then(function(user) {
                console.log('GoogleService.getMe', user);
            }, function(error) {
                console.log('GoogleService.getMe.error', error);
            });
        }

        $scope.getFacebookMe = getFacebookMe;
        $scope.getGoogleMe = getGoogleMe;

        var year = new Range({ type: Range.types.YEAR });
        var semester = new Range({ type: Range.types.SEMESTER });
        var trimester = new Range({ type: Range.types.TRIMESTER });
        var quarter = new Range({ type: Range.types.QUARTER });
        var month = new Range({ type: Range.types.MONTH });
        var week = new Range({ type: Range.types.WEEK });
        var day = new Range({ type: Range.types.DAY });

        var ranges = {
            year: year,
            semester: semester,
            trimester: trimester,
            quarter: quarter,
            month: month,
            week: week,
            day: day,
        };

        angular.forEach(ranges, function(range) {
            console.log(range.toString());
        });

        $scope.ranges = ranges;

    }]);

}());
/* global angular */

(function () {
	"use strict";

	var app = angular.module('app');

	app.controller('SlugCtrl', ['$scope', 'State', 'View', function ($scope, State, View) {
		var state = new State();

		View.current().then(function (view) {
			$scope.view = view;
			state.ready();

		}, function (error) {
			state.error(error);

		});

		$scope.state = state;
    }]);

}());

/* global angular */

(function() {
    "use strict";

    var app = angular.module('app');

    app.controller('TestCtrl', ['$scope', '$filter', '$http', 'State', 'Hash', 'DateTime', 'Range', 'LocalStorage', function($scope, $filter, $http, State, Hash, DateTime, Range, storage) {

        var state = new State();

        var sources = {};

        var publics = {
            state: state,
            sources: sources,
        };

        angular.extend($scope, publics); // todo

        $http.get('api/test.json').then(function(response) {
            var slots = response.data;
            sources.slots = slots;
            setTodos();
            state.ready();
        });

        function setTodos() {
            var slots = sources.slots;
            var todos = new Hash('key');
            angular.forEach(slots, function(item) {
                var day = item.day;
                var week = $filter('isoWeek')(day.date, 1);
                var keys = [week, day.activityId, day.taskId || 0, day.locked ? day.key : 0];
                var key = keys.join('-');
                var todo = todos.once({
                    key: key,
                    customer: item.customer,
                    project: item.project,
                    activity: item.activity,
                    task: item.task,
                    hours: 0,
                    recordedHours: 0,
                    slots: new Hash('id'),
                    player: {},
                });
                if (day.locked) {
                    todo.day = day;
                }
                todo.slots.add(day);
                todo.hours += day.hours;
                // console.log(key, day);
            });
            todos.each(function(todo) {
                console.log(todo.key, todo);
            });
            todos.forward();
            sources.todos = todos;
        }

        $scope.$on('onTodoPause', function(scope, item) {
            var accumulatedHours = DateTime.timeToQuarterHour(item.player.accumulatedTime);
            console.log('onTodoPause', accumulatedHours);
            item.recordedHours += accumulatedHours;
            item.player.update();
        });

        var day = new Range({ type: Range.types.DAY });
        var date = new Date();

        if (day.isInside(date)) {
            console.log('inside', day.toString(), date);
        }

    }]);

}());
/* global angular */

(function() {
    "use strict";

    var app = angular.module('app');

    app.config(['environmentProvider', function(environmentProvider) {

        environmentProvider.add('environment', {
            http: {
                interceptors: [], // ['AuthService'],
                withCredentials: false,
            },
            language: {
                code: 'en',
                culture: 'en_US',
                iso: 'ENU',
                name: 'English',
            },
            location: {
                hash: '!',
                html5: false,
            },
            plugins: {
                facebook: {
                    appId: 340008479796111,
                    fields: 'id,name,first_name,last_name,email,gender,picture,cover,link',
                    scope: 'public_profile, email', // publish_stream
                    version: 'v2.10',
                },
                google: {
                    apiKey: 'AIzaSyCn6O-j_8pipy-ErGxg4bM1juGesiyM28U',
                    clientId: '1063539520533-7308vqmt92em6dv1v5q52fq2or36jk95.apps.googleusercontent.com',
                },
                googlemaps: {
                    apiKey: 'AIzaSyCn6O-j_8pipy-ErGxg4bM1juGesiyM28U',
                    styles: '/googlemaps/applemapesque.json',
                    options: {
                        center: {
                            lat: 43.9023386, // latitude
                            lng: 12.8505094, // longitude
                        },
                        zoom: 4.0,
                    }
                },
                mapbox: {
                    accessToken: 'pk.eyJ1IjoiYWN0YXJpYW4iLCJhIjoiY2lqNWU3MnBzMDAyZndnbTM1cjMyd2N2MiJ9.CbuEGSvOAfIYggQv854pRQ',
                    options: {
                        center: [
                            12.8505094, // longitude
                            43.9023386, // latitude
                        ],
                        zoom: 4.0,
                    },
                    style: 'mapbox://styles/actarian/cja82nadj07sn2rmty6n1n5pk',
                    version: 'v0.42.0',
                },
            },
        });

    }]);

}());
/* global angular */

(function() {
    "use strict";

    var app = angular.module('app');

    app.config(['environmentProvider', function(environmentProvider) {

        environmentProvider.add('local', {
            paths: {
                api: 'http://localhost:6001/api',
                app: 'http://localhost:6001',
            },
            plugins: {
                facebook: {
                    appId: 340008479796111,
                }
            },
        });

    }]);

}());
/* global angular */

(function() {
    "use strict";

    var app = angular.module('app');

    app.config(['environmentProvider', function(environmentProvider) {

        environmentProvider.add('production', {
            paths: {
                api: 'https://actarian.github.io/artisan/api',
                app: 'https://actarian.github.io/artisan',
            },
            plugins: {
                facebook: {
                    appId: 156171878319496,
                }
            },
        });

    }]);

}());
/* global angular */

(function() {
    "use strict";

    var app = angular.module('app');

    app.config(['environmentProvider', function(environmentProvider) {

        environmentProvider.add('stage', {
            //
        });

    }]);

}());