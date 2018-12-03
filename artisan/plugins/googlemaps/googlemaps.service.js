/* global angular */

(function() {
	"use strict";

	var app = angular.module('artisan');

	app.service('GoogleMaps', ['$promise', '$once', 'environment', function($promise, $once, environment) {

		var service = this;

		var statics = {
			maps: GoogleMaps,
			geocoder: GoogleMapsGeocoder,
			parse: GoogleMapsParse,
		};

		angular.extend(service, statics);

		if (!environment.plugins.googlemaps) {
			trhow('GoogleMaps.error missing config object in environment.plugins.googlemaps');
		}

		function GoogleMaps() {
			return $promise(function(promise) {
				var apiKey = environment.plugins.googlemaps.apiKey;
				$once.script('https://maps.googleapis.com/maps/api/js?key=' + apiKey + '&callback={{callback}}', true).then(function(data) {
					promise.resolve(window.google.maps);
				}, function(error) {
					promise.reject(error);
				});
			});
		}

		function GoogleMapsGeocoder() {
			var service = this;
			return $promise(function(promise) {
				GoogleMaps().then(function(maps) {
					var geocoder = new maps.Geocoder();
					promise.resolve(geocoder);

				}, function(error) {
					promise.reject(error);

				});
			});
		}

		function GoogleMapsType(type, item) {
			var types = {
				street: 'route',
				number: 'street_number',
				locality: 'locality',
				postalCode: 'postal_code',
				city: 'administrative_area_level_3',
				province: 'administrative_area_level_2',
				region: 'administrative_area_level_1',
				country: 'country',
			};
			var label = null;
			angular.forEach(item.address_components, function(c) {
				angular.forEach(c.types, function(t) {
					if (t === types[type]) {
						label = c.long_name;
					}
				});
			});
			// console.log('GoogleMapsType', type, item, label);
			return label;
		}

		function GoogleMapsParse(results) {
			var items = null;
			if (results.length) {
				items = results.filter(function(item) {
					return true; // item.geometry.location_type === 'ROOFTOP' ||
					// item.geometry.location_type === 'RANGE_INTERPOLATED' ||
					// item.geometry.location_type === 'GEOMETRIC_CENTER';
				}).map(function(item) {
					return {
						name: item.formatted_address,
						street: GoogleMapsType('street', item),
						number: GoogleMapsType('number', item),
						locality: GoogleMapsType('locality', item),
						postalCode: GoogleMapsType('postalCode', item),
						city: GoogleMapsType('city', item),
						province: GoogleMapsType('province', item),
						region: GoogleMapsType('region', item),
						country: GoogleMapsType('country', item),
						position: {
							lng: item.geometry.location.lng(),
							lat: item.geometry.location.lat(),
						}
					};
				});
				/*
				var first = response.data.results[0];
				scope.model.position = first.geometry.location;
				console.log(scope.model);
				setLocation();
				*/
			}
			console.log('GoogleMapsParse', results, items);
			return items;
		}

    }]);

}());
