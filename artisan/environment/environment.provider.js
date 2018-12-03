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
			plugins: {
				facebook: {
					fields: 'id,name,first_name,last_name,email,gender,picture,cover,link',
					scope: 'public_profile, email', // publish_stream
					version: 'v2.10',
				},
				google: {},
				googlemaps: {
					clusterer: true,
					styles: '/googlemaps/applemapesque.json',
					options: {
						center: {
							lat: 43.9023386,
							lng: 12.8505094
						},
						disableDefaultUI: true,
						mapTypeId: 'roadmap', // "hybrid", "roadmap", "satellite", "terrain"
						scrollwheel: true,
						// tilt: 0, // 45
						zoom: 4.0,
					},
				},
				mapbox: {
					clusterer: true,
					options: {
						bearing: 0.0,
						center: [
                            12.8505094,
                            43.9023386
                        ],
						curve: 1,
						pitch: 0.0,
						speed: 1.5,
						zoom: 4.0,
					},
					version: 'v0.42.0',
				}
			},
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
			paths: {},
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
			if (config.environment) {
				angular.merge(environment, config.environment);
			}
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
