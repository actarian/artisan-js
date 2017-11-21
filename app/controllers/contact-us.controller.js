/* global angular */

(function () {
	"use strict";

	var app = angular.module('app');

	app.controller('ContactUsCtrl', ['$scope', 'State', 'View', 'Api', function ($scope, State, View, Api) {

		var state = new State();
		var state2 = new State();
		var googlemaps = {};
		var mapbox = {};

		var publics = {
			state: state,
			state2: state2,
			googlemaps: googlemaps,
			mapbox: mapbox,
		};

		angular.extend($scope, publics); // todo

		View.current().then(function (view) {
			$scope.view = view;
			state.ready();

		}, function (error) {
			state.error(error);

		});

		Api.maps.markers().then(function (items) {
			googlemaps.setMarkers(items);
			mapbox.setMarkers(items);
		});

    }]);

}());