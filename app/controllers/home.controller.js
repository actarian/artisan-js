/* global angular */

(function() {
	"use strict";

	var app = angular.module('app');

	app.controller('HomeCtrl', ['$scope', 'State', 'View', 'Range', function($scope, State, View, Range) {
		var state = new State();

		View.current().then(function(view) {
			$scope.view = view;
			state.ready();

		}, function(error) {
			state.error(error);

		});

		/*
		function getIndexLeft(diff, size, step) {
			diff = diff || 0;
			size = size || 1;
			step = step || 1;
			var index = diff * step + (size - 1) * step;
			return index;
		}

		function getIndexRight(diff, size, step) {
			step = step || 1;
			var index = getIndexLeft(diff, size, step) + (step - 1);
			return index;
		}

		console.log('index', getIndexLeft(0, 1, 6), getIndexRight(0, 1, 6));
		console.log('index', getIndexLeft(0, 1, 4), getIndexRight(0, 1, 4));
		console.log('index', getIndexLeft(0, 1, 3), getIndexRight(0, 1, 3));

		console.log('index', getIndexLeft(1, 1, 6), getIndexRight(1, 1, 6));
		console.log('index', getIndexLeft(1, 1, 4), getIndexRight(1, 1, 4));
		console.log('index', getIndexLeft(1, 1, 3), getIndexRight(1, 1, 3));
		*/

		$scope.state = state;
    }]);

}());
