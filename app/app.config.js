/* global angular */

(function () {
	"use strict";

	var app = angular.module('app');

	app.constant('environment', getEnvironment());

	app.config(['$locationProvider', function ($locationProvider) {
		// HTML5 MODE url writing method (false: #/anchor/use, true: /html5/url/use)
		$locationProvider.html5Mode(false);
		// $locationProvider.hashPrefix(''); // default '!' hashbang    
    }]);

	app.config(['$httpProvider', 'environment', function ($httpProvider, environment) {
		$httpProvider.defaults.headers.common["Accept-Language"] = environment.language.code;
		// $httpProvider.defaults.withCredentials = true;
		// $httpProvider.interceptors.push('AuthInterceptorService');
    }]);

	function getEnvironment() {
		var production = window.location.href.indexOf('actarian.github.io') !== -1;
		var environment = {
			addons: {
				facebook: {
					app_id: production ? 156171878319496 : 340008479796111,
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
			urls: {
				api: 'api',
			},
		};
		if (window.environment) {
			angular.extend(environment, window.environment);
		}
		return environment;
	}

}());