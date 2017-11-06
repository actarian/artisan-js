/* global angular */

(function() {
    "use strict";

    var app = angular.module('app', ['artisan', 'jsonFormatter']);

}());
/* global angular */

(function() {
    "use strict";

    var app = angular.module('app');

    app.service('Api', ['WebApi', '$filter', function(WebApi, $filter) {

        var service = WebApi;

        this.menu = function() {
            // var args = Array.prototype.slice.call(arguments);
            return service.get('/menu.js'); // promise
        };

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

    /*
    // --- app ---
    var ENV = {
        lang: 'en',
    };
    if (window.ENV) {
        angular.extend(ENV, window.ENV);
    }
    app.config('ENV', ENV);
    */

    /*
    // --- http ---
    app.config(['$httpProvider', 'ENV', function($httpProvider, ENV) {
        // $httpProvider.defaults.headers.common["Accept-Language"] = ENV.lang;
        // $httpProvider.defaults.withCredentials = true;
        // $httpProvider.interceptors.push('AuthInterceptorService');
    }]);
    */

    /*
    // --- location ---
    app.config(['$locationProvider', function($locationProvider) {
        // HTML5 MODE url writing method (false: #/anchor/use, true: /html5/url/use)
        $locationProvider.html5Mode(false);
        // $locationProvider.hashPrefix(''); // default '!' hashbang    
    }]);
    */

    // --- route ---
    /*
    app.config(['$routeProvider', function($routeProvider) {

        $routeProvider.when('/', {
            templateUrl: function() {
                return 'views/nav.html';
            },
            controller: 'NavCtrl',

        }).when('/forms', {
            templateUrl: function() {
                return 'views/form';
            },
            controller: 'FormCtrl',
            // resolve: {
            //    user: ['Users', function(Users) {
            //        return Users.isAuthorizedOrGoTo('/home');
            //    }]
            // },

        });

        $routeProvider.otherwise('/');

    }]);
    */

    /*
    // --- api ---
    app.config(['$apiProvider', function($apiProvider) {

        $apiProvider.routes({
            menu: {
                url: '/menu.js',
                method: 'get',
            },
        });

    }]);
    */

    /*
    // --- modals ---
    app.config(['$modalProvider', function($modalProvider) {
        $modalProvider.when('authModal', {
            title: 'Authenticate',
            templateUrl: 'views/auth-modal.html',
            controller: 'RootCtrl',
            customClass: 'modal-sm',

        });
    }]);
    */

}());
/* global angular */

(function() {
    "use strict";

    var app = angular.module('app');

    /*
    app.config(['$locationProvider', function($locationProvider) {

        // HTML5 MODE url writing method (false: #/anchor/use, true: /html5/url/use)
        $locationProvider.html5Mode(false);
        // $locationProvider.hashPrefix(''); // default '!' hashbang

    }]);

    app.config(['$modalProvider', function($modalProvider) {

        $modalProvider.when('authModal', {
            title: 'Authenticate',
            templateUrl: 'views/auth-modal.html',
            controller: 'RootCtrl',
            customClass: 'modal-sm',

        });

    }]);
    */

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

    app.controller('RootCtrl', ['$scope', '$timeout', '$promise', 'Nav', 'Api', function($scope, $timeout, $promise, Nav, Api) {

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
            Nav.silent(item.$nav.link);
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

    }]);

}());