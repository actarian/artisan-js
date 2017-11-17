/* global angular */

(function () {
	"use strict";

	var app = angular.module('artisan');

	// todo !!!

	app.service('GoogleMaps', ['$q', '$http', '$promise', function ($q, $http, $promise) {

		var _key = 'AIzaSyBlgTatREkeIDKEKYL_dtaaDx1yYxmx_iM';
		var _init = false;

		this.maps = maps;
		this.geocoder = geocoder;
		this.parse = parse;

		function maps() {
			return $promise(function (promise) {
				if (_init) {
					promise.resolve(window.google.maps);
				} else {
					window.__googleMapsInit = function () {
						promise.resolve(window.google.maps);
						window.__googleMapsInit = null;
						_init = true;
					};
					var script = document.createElement('script');
					script.setAttribute('async', null);
					script.setAttribute('defer', null);
					script.setAttribute('src', 'https://maps.googleapis.com/maps/api/js?key=' + _key + '&callback=__googleMapsInit');
					document.body.appendChild(script);
				}
			});
		}

		function geocoder() {
			var service = this;
			var deferred = $q.defer();
			maps().then(function (maps) {
				var _geocoder = new maps.Geocoder();
				deferred.resolve(_geocoder);
			}, function (error) {
				deferred.reject(error);
			});
			return deferred.promise;
		}

		function getType(type, item) {
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
			angular.forEach(item.address_components, function (c) {
				angular.forEach(c.types, function (t) {
					if (t === types[type]) {
						label = c.long_name;
					}
				});
			});
			// console.log('googleMaps.getType', type, item, label);
			return label;
		}

		function parse(results) {
			var items = null;
			if (results.length) {
				items = results.filter(function (item) {
					return true; // item.geometry.location_type === 'ROOFTOP' ||
					// item.geometry.location_type === 'RANGE_INTERPOLATED' ||
					// item.geometry.location_type === 'GEOMETRIC_CENTER';
				}).map(function (item) {
					return {
						name: item.formatted_address,
						street: getType('street', item),
						number: getType('number', item),
						locality: getType('locality', item),
						postalCode: getType('postalCode', item),
						city: getType('city', item),
						province: getType('province', item),
						region: getType('region', item),
						country: getType('country', item),
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
			console.log('googleMaps.parse', results, items);
			return items;
		}

    }]);

}());