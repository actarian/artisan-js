/* global angular */

(function() {
    "use strict";

    var app = angular.module('artisan');

    app.provider('environment', ['$locationProvider', '$httpProvider', function($locationProvider, $httpProvider) {

        var provider = this;

        var statics = {
            add: EnvironmentAdd,
            use: EnvironmentUse,
        };

        angular.extend(provider, statics);

        var defaults = {
            paths: {

            },
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
                    app_id: 340008479796111,
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
        };

        var global = {};

        if (window.environment) {
            angular.merge(global, window.environment);
        }

        var config = {};

        var environment = angular.copy(defaults);
        angular.merge(environment, global);

        function EnvironmentSetHttp() {
            $httpProvider.defaults.headers.common["Accept-Language"] = environment.language.code;
            $httpProvider.defaults.withCredentials = environment.http.withCredentials;
            $httpProvider.interceptors.push.apply($httpProvider.interceptors, environment.http.interceptors);
        }

        function EnvironmentSetLocation() {
            $locationProvider.html5Mode(environment.location.html5);
            $locationProvider.hashPrefix(environment.location.hash);
        }

        function EnvironmentAdd(key, data) {
            config[key] = config[key] ? angular.merge(config[key], data) : data;
            EnvironmentSet();
        }

        function EnvironmentSet() {
            environment = angular.copy(defaults);
            var value = EnvironmentGet();
            if (value) {
                angular.merge(environment, value);
            }
            angular.merge(environment, global);
            EnvironmentSetHttp();
            EnvironmentSetLocation();
        }

        function EnvironmentUse(key) {
            if (config[key]) {
                environment = angular.copy(defaults);
                angular.merge(environment, config[key]);
                angular.merge(environment, global);
                EnvironmentSetHttp();
                EnvironmentSetLocation();
            }
        }

        function EnvironmentGet() {
            for (var key in config) {
                var value = config[key];
                if (value.paths && window.location.href.indexOf(value.paths.app) !== -1) {
                    return value;
                }
            }
        }

        provider.$get = function() {
            return environment;
        };

    }]);

}());