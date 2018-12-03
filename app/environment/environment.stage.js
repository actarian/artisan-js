/* global angular */

(function() {
	"use strict";

	var app = angular.module('app');

	app.config(['environmentProvider', function(environmentProvider) {

		environmentProvider.add('stage', {
			//
		});

    }]);

}());
