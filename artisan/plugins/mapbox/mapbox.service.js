/* global angular */

(function() {
	"use strict";

	var app = angular.module('artisan');

	app.service('MapBox', ['$q', '$http', '$promise', '$once', 'environment', function($q, $http, $promise, $once, environment) {

		var service = this;

		var statics = {
			get: MapBoxGet,
		};

		angular.extend(service, statics);

		if (!environment.plugins.mapbox) {
			trhow('MapBox.error missing config object in environment.plugins.mapbox');
		}

		var config = environment.plugins.mapbox;

		function MapBoxGet() {
			return $promise(function(promise) {
				if (window.mapboxgl) {
					promise.resolve(window.mapboxgl);
				} else {
					$promise.all([
                        $once.script('//api.tiles.mapbox.com/mapbox-gl-js/' + config.version + '/mapbox-gl.js'),
                        $once.link('//api.tiles.mapbox.com/mapbox-gl-js/' + config.version + '/mapbox-gl.css'),
                    ]).then(function() {
						window.mapboxgl.accessToken = config.accessToken;
						promise.resolve(window.mapboxgl);
					}, function(error) {
						promise.reject(error);
					});
				}
			});
		}

    }]);

}());
