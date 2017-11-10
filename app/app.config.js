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
            urls: {
                api: 'api',
            },
            apis: {
                facebook: {
                    app_id: 156171878319496,
                }
            }
        };
        if (window.environment) {
            angular.extend(environment, window.environment);
        }
        return environment;
    }

}());