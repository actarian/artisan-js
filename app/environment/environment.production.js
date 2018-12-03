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
