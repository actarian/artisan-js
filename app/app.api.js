/* global angular */

(function () {
	"use strict";

	var app = angular.module('app');

	app.service('Api', ['Http', function (Http) {

		var api = {
			navs: {
				main: function () {
					return Http.get('/navs/main.js');
				},
			},
			docs: {
				id: function (id) {
					return Http.get('/docs/' + id + '.js');
				},
				url: function (url) {
					url = url.split('/').join('-');
					return Http.get('/docs/' + url + '.js');
				},
			},
		};

		angular.extend(this, api);

	}]);

}());