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

        });

        $routeProvider.otherwise('/');

    }]);

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