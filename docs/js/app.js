/* global angular */

(function() {
    "use strict";

    var app = angular.module('app', ['ngSanitize', 'artisan', 'jsonFormatter']);

}());
/* global angular */

(function () {
	"use strict";

	var app = angular.module('app');

	app.service('Api', ['Http', function (Http) {

		var api = {
			navs: {
				main: function () {
					return Http.get('/navs/main.js');
				},
			},
			docs: {
				id: function (id) {
					return Http.get('/docs/' + id + '.js');
				},
				url: function (url) {
					url = url.split('/').join('-');
					return Http.get('/docs/' + url + '.js');
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
/* global angular */

(function() {
    "use strict";

    var app = angular.module('app');

    app.config(['environmentProvider', function(environmentProvider) {

        environmentProvider.add('environment', {
            location: {
                html5: false,
                hash: '!',
            },
            http: {
                withCredentials: false,
                interceptors: [], // ['AuthInterceptorService'],
            },
            addons: {
                facebook: {
                    // app_id: xxxxxxxxxx,
                    scope: 'public_profile, email', // publish_stream
                    fields: 'id,name,first_name,last_name,email,gender,picture,cover,link',
                    version: 'v2.10',
                }
            },
            language: {
                code: 'en',
                culture: 'en_US',
                name: 'English',
                iso: 'ENU',
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
                app: 'http://localhost:6001',
                api: 'http://localhost:6001/api',
            },
            addons: {
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
                app: 'https://actarian.github.io/artisan',
                api: 'https://actarian.github.io/artisan/api',
            },
            addons: {
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
/* global angular */

(function() {
    "use strict";

    var app = angular.module('app');

    app.controller('ContactUsCtrl', ['$scope', 'State', 'View', function($scope, State, View) {
        var state = new State();
        var state2 = new State();

        View.current().then(function(view) {
            $scope.view = view;
            state.ready();

        }, function(error) {
            state.error(error);

        });

        $scope.state = state;
        $scope.state2 = state2;
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

    app.controller('RootCtrl', ['$scope', '$timeout', '$promise', 'Nav', 'Api', 'Scrollable', 'FacebookService', function($scope, $timeout, $promise, Nav, Api, Scrollable, FacebookService) {

        var nav = new Nav({
            onLink: onLink,
            onNav: onNav,
        });

        Api.navs.main().then(function(items) {
            nav.setItems(items);

        }, function(error) {
            console.log('RootCtrl.error', error);

        });

        function onLink(item) {
            var link = item.url;
            console.log('RootCtrl.onLink', item.$nav.level, link);
            return link;
        }

        function onNav(item) {
            console.log('RootCtrl.onNav', item.$nav.level, item.$nav.link);
            Nav.path(item.$nav.link);
            return false; // returning false disable default link behaviour;
        }

        function onNavPromise(item) {
            $scope.selected = item;
            return $promise(function(promise) {
                console.log('RootCtrl.onNavPromise', item.$nav.level, item.$nav.link);
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

        function getMe() {
            FacebookService.getMe().then(function(user) {
                console.log('FacebookService.getMe', user);
            }, function(error) {
                console.log('FacebookService.getMe.error', error);
            });
        }

        $scope.getMe = getMe;

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
