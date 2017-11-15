/* global angular, app, Autolinker */
(function () {

	"use strict";

	var app = angular.module('artisan');

	app.filter('notIn', ['$filter', function ($filter) {

		return function (array, filters, element) {
			if (filters) {
				return $filter("filter")(array, function (item) {
					for (var i = 0; i < filters.length; i++) {
						if (filters[i][element] === item[element]) return false;
					}
					return true;
				});
			}
		};

    }]);

}());