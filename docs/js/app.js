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

(function () {
	"use strict";

	var app = angular.module('app');

	app.config(['$routeProvider', function ($routeProvider) {

		$routeProvider.when('/', {
			templateUrl: function () {
				return 'views/slug.html';
			},
			controller: 'HomeCtrl',

		}).when('/contact-us', {
			templateUrl: function () {
				return 'views/contact-us.html';
			},
			controller: 'ContactUsCtrl',
			// resolve: {
			//    user: ['Users', function(Users) {
			//        return Users.isAuthorizedOrGoTo('/home');
			//    }]
			// },

		}).when('/works/:slug', {
			templateUrl: function () {
				return 'views/slug.html';
			},
			controller: 'SlugCtrl',

		}).when('/works/visuals/:slug', {
			templateUrl: function () {
				return 'views/slug.html';
			},
			controller: 'SlugCtrl',

		}).when('/works/production/:slug', {
			templateUrl: function () {
				return 'views/slug.html';
			},
			controller: 'SlugCtrl',

		}).when('/experiences/:slug', {
			templateUrl: function () {
				return 'views/slug.html';
			},
			controller: 'SlugCtrl',

		}).when('/:slug', {
			templateUrl: function () {
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

    app.controller('RootCtrl', ['$scope', '$timeout', '$promise', 'Nav', 'Api', 'Scrollable', 'FacebookService', 'GoogleService', function($scope, $timeout, $promise, Nav, Api, Scrollable, FacebookService, GoogleService) {

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

    app.config(['environmentProvider', function(environmentProvider) {

        environmentProvider.add('environment', {
            http: {
                interceptors: [], // ['AuthInterceptorService'],
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
                    app_id: 340008479796111,
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
                    app_id: 340008479796111,
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
                    app_id: 156171878319496,
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