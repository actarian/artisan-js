/* global angular */

(function() {
    "use strict";

    var app = angular.module('app', ['artisan', 'jsonFormatter']);

}());
/* global angular */

(function() {
    "use strict";

    var app = angular.module('app');

    app.service('Api', ['WebApi', '$promise', '$location', '$routeParams', 'environment', function(WebApi, $promise, $location, $routeParams, environment) {

        var webapi = WebApi;

        var service = {
            menu: function() {
                return webapi.get('/menu.js'); // promise
            },
            doc: function() {
                return $promise(function(promise) {
                    service.menu().then(function(response) {
                        var doc = null;
                        var currentUrl = $location.path();
                        angular.forEach(response.data, function(item) {
                            console.log(item.url, $routeParams.slug);
                            if (item.url === currentUrl) {
                                doc = angular.extend({
                                    language: environment.language,
                                    url: currentUrl,
                                    params: $routeParams,
                                }, item);
                            }
                        });
                        promise.resolve(doc);
                    }, function(error) {
                        promise.reject(error);
                    });
                });
            }
        };

        angular.extend(this, service);

        // var args = Array.prototype.slice.call(arguments);

    }]);

    /*
    app.provider('$api', [function $apiProvider() {

        var routes = {};

        this.routes = routes;
        this.when = when;

        function when(path, callback) {
            var api = this;
            routes[path] = callback;
            return api;
        }

        this.$get = ['$q', '$timeout', function $apiFactory($q, $timeout) {

            var api = {};

            angular.extend(api, routes);

            return api;

        }];

    }]);
    */

}());
/* global angular */

(function() {
    "use strict";

    var app = angular.module('app');

    app.constant('environment', getEnvironment());

    app.config(['$locationProvider', function($locationProvider) {
        // HTML5 MODE url writing method (false: #/anchor/use, true: /html5/url/use)
        $locationProvider.html5Mode(false);
        // $locationProvider.hashPrefix(''); // default '!' hashbang    
    }]);

    app.config(['$httpProvider', 'environment', function($httpProvider, environment) {
        $httpProvider.defaults.headers.common["Accept-Language"] = environment.lang;
        // $httpProvider.defaults.withCredentials = true;
        // $httpProvider.interceptors.push('AuthInterceptorService');
    }]);

    function getEnvironment() {
        var environment = {
            language: 'en',
        };
        if (window.environment) {
            angular.extend(environment, window.environment);
        }
        return environment;
    }

}());
/* global angular */

(function() {
    "use strict";

    var app = angular.module('app');

    app.config(['$routeProvider', function($routeProvider) {

        $routeProvider.when('/', {
            templateUrl: function() {
                return 'views/home.html';
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

    app.run(['$rootScope', function($rootScope) {

    }]);

}());
/* global angular */

(function() {
    "use strict";

    var app = angular.module('app');

    app.controller('ContactUsCtrl', ['$scope', 'State', function($scope, State) {

        var state = new State();
        var state2 = new State();

        $scope.state = state;
        $scope.state2 = state2;

    }]);

}());
/* global angular */

(function() {
    "use strict";

    var app = angular.module('app');

    app.controller('HomeCtrl', ['$scope', function($scope) {



    }]);

}());
/* global angular */

(function() {
    "use strict";

    var app = angular.module('app');

    app.controller('RootCtrl', ['$scope', '$timeout', '$promise', 'Nav', 'Api',
        function($scope, $timeout, $promise, Nav, Api) {

            var nav = new Nav({
                onLink: onLink,
                onNav: onNav,
            });

            Api.menu().then(function(response) {
                // $scope.items = response.data;
                nav.setItems(response.data);

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

        }
    ]);

}());
/* global angular */

(function() {
    "use strict";

    var app = angular.module('app');

    app.controller('SlugCtrl', ['$scope', 'Api', function($scope, Api) {

        Api.doc().then(function(doc) {
            $scope.doc = doc;

        }, function(error) {

        });

    }]);

}());