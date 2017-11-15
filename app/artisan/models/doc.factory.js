/* global angular */

(function () {
	"use strict";

	var app = angular.module('artisan');

	app.factory('Doc', ['Api', '$promise', function (Api, $promise) {

		function Doc(item) {
			if (item) {
				angular.extend(this, item);
			}
		}

		var statics = {};

		var methods = {};

		angular.extend(Doc, statics);
		angular.extend(Doc.prototype, methods);

		return Doc;

		// static methods

		// prototype methods

    }]);

}());