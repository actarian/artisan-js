/* global angular */

(function () {
	"use strict";

	var app = angular.module('app');

	app.config(['environmentProvider', function (environmentProvider) {

		environmentProvider.add('local', {
			addons: {
				facebook: {
					app_id: 340008479796111,
				}
			},
			paths: {
				api: 'http://localhost:6001/api',
				app: 'http://localhost:6001',
			},
		});

    }]);

}());