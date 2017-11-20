/* global angular */

(function () {
	"use strict";

	var app = angular.module('app');

	app.config(['environmentProvider', function (environmentProvider) {

		environmentProvider.add('production', {
			addons: {
				facebook: {
					app_id: 156171878319496,
				}
			},
			paths: {
				api: 'https://actarian.github.io/artisan/api',
				app: 'https://actarian.github.io/artisan',
			},
		});

    }]);

}());