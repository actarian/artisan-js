/* global angular */

(function () {
	"use strict";

	var app = angular.module('artisan');

	// todo !!!

	app.directive('mapbox', ['$http', '$timeout', '$compile', 'GoogleMaps', function ($http, $timeout, $compile, googleMaps) {
		if (!mapboxgl) {
			return;
		}
		mapboxgl.accessToken = 'pk.eyJ1IjoiZmljb3dzZGV2IiwiYSI6ImNqNXJzajVobTB5cW8yd25tejhqcjN2c3kifQ.CsUfBV2eN2ftVELq0xwlGA'; // 'pk.eyJ1IjoiYWN0YXJpYW4iLCJhIjoiY2lqNWU3MnBzMDAyZndnbTM1cjMyd2N2MiJ9.CbuEGSvOAfIYggQv854pRQ';

		var position = {
			lng: 11.411248,
			lat: 44.515702,
		};

		var defaults = {
			center: [position.lng, position.lat],
			zoom: 17.63,
			pitch: 53,
			bearing: -11.68,
			speed: 1.5,
			curve: 1,
		};

		return {
			restrict: 'A',
			scope: {
				sources: '=mapbox',
			},
			link: link,
		};

		function link(scope, element, attributes, model) {
			var map, markers, marker, geocoder, bounds, canvas, dragging, overing;

			init();

			var types = {
				DOCUMENT: 1,
				EVENT: 2,
				INFO: 3,
			};

			/*
			googleMaps.geocoder().then(function (response) {
			    geocoder = response;
			    init();
			});
			*/

			function getOptions(options) {
				return angular.extend(angular.copy(defaults), options);
			}

			function getMarker(item) {
				var $scope = scope.$new(true);
				$scope.item = item;
				var node = document.createElement('div');
				node.id = 'point';
				node.className = 'marker ' + item.area.code;
				node.className += item.type === types.INFO ? ' info' : '';
				node.setAttribute('marker', 'item');
				var marker = new mapboxgl.Marker(node, {
						offset: [-10, -10]
					})
					.setLngLat([item.position.lng, item.position.lat])
					.addTo(map);
				var markerElement = angular.element(node);
				markerElement.on('click', function (e) {
					// console.log('marker.click', item);
					scope.$emit('onMarkerClicked', item);
				});
				$compile(markerElement)($scope); // Compiling marker
				return marker;
			}

			function addMarkers(items) {
				if (markers) {
					angular.forEach(markers, function (item) {
						item.remove();
					});
				}
				markers = [];
				if (items) {
					angular.forEach(items, function (item) {
						marker = getMarker(item);
						markers.push(marker);
					});
				}
			}

			function flyTo(position) {
				var options = getOptions({
					center: [position.lng, position.lat],
					zoom: 20,
				});
				map.flyTo(options);
			}

			function jumpTo(position) {
				var options = getOptions({
					center: [position.lng, position.lat],
					zoom: 20,
				});
				map.jumpTo(options);
			}

			function flyToMarker(item) {
				// console.log(item);
				flyTo(item.position);
			}

			function jumpToMarker(item) {
				jumpTo(item.position);
			}

			function init() {
				map = getMap();
				navToCenter();
				scope.$watch('sources', function (sources) {
					if (sources) {
						// connect methods;
						sources.addMarkers = addMarkers;
						sources.jumpToMarker = jumpToMarker;
						sources.flyToMarker = flyToMarker;
					}
				});
			}

			function getMap() {
				var map = new mapboxgl.Map({
					container: element[0],
					style: 'mapbox://styles/ficowsdev/cj8cztc3r8nv32sl5npfr1yip', // 'mapbox://styles/ficowsdev/cj5rsloo232ad2sq9capz9atk', // 'mapbox://styles/mapbox/light-v9', // 'mapbox://styles/actarian/cj5nwbngd1p2z2sqh74l5qwlq',
					interactive: true,
					logoPosition: 'bottom-right',
					center: [position.lng, position.lat],
					zoom: 6,
				});

				canvas = map.getCanvasContainer();

				/*
				scope.map.setAddress = function (item) {
				    // console.log('setAddress', item);
				    scope.map.results = null;
				    flyTo(item.position);
				};
				scope.map.search = function () {
				    // console.log('address', scope.map.address);
				    scope.map.results = null;
				    geocodeAddress(scope.map.address);
				    return true;
				};
				scope.map.styles = {
				    FICO: 1,
				    SATELLITE: 2,
				};
				scope.map.style = scope.map.styles.FICO;
				scope.map.styleToggle = function () {
				    if (scope.map.style === scope.map.styles.FICO) {
				        scope.map.style = scope.map.styles.SATELLITE;
				        map.setStyle('mapbox://styles/mapbox/satellite-v9');
				    } else {
				        scope.map.style = scope.map.styles.FICO;
				        map.setStyle('mapbox://styles/mapbox/streets-v9');
				    }
				};
				scope.map.setStyle = function (style) {
				    scope.map.style = style;
				    if (scope.map.style === scope.map.styles.FICO) {
				        map.setStyle('mapbox://styles/mapbox/streets-v9');
				    } else {
				        map.setStyle('mapbox://styles/mapbox/satellite-v9');
				    }
				};                
				*/
				return map;
			}

			function geocodeAddress(address) {
				geocoder.geocode({
					'address': address
				}, function (results, status) {
					$timeout(function () {
						if (status === 'OK') {
							sources.results = googleMaps.parse(results);
						} else {
							alert('Geocode was not successful for the following reason: ' + status);
						}
					});
				});
			}

			function reverseGeocode(position) {
				// console.log('reverseGeocode', position);
				geocoder.geocode({
					'location': position
				}, function (results, status) {
					$timeout(function () {
						if (status === 'OK') {
							sources.results = googleMaps.parse(results);
						} else {
							console.log('Geocoder failed due to: ' + status);
						}
					});
				});
			}

			function geolocalize() {
				if (navigator.geolocation) {
					navigator.geolocation.getCurrentPosition(function (p) {
						$timeout(function () {
							position = {
								lat: p.coords.latitude,
								lng: p.coords.longitude
							};
							flyTo(position);
							reverseGeocode(position);
						});
					}, function (e) {
						console.log('error', e);
					});
				} else {
					console.log('error', 'Browser doesn\'t support Geolocation');
				}
			}

			function flyToFico() {
				var position = {
					lng: 11.411248,
					lat: 44.515702,
				};
				map.flyTo({
					center: [
                        parseFloat(position.lng),
                        parseFloat(position.lat)
                    ],
					zoom: 17.63,
					pitch: 53,
					bearing: -11.68,
					speed: 1.5,
					curve: 1,

				});
			}

			function navToCenter() {
				var position = {
					lng: 11.411248,
					lat: 44.515702,
				};
				map.jumpTo({
					center: [
                            parseFloat(position.lng),
                            parseFloat(position.lat)
                    ],
					zoom: 17.63,
					pitch: 53,
					bearing: -11.68,
				});
			}

			/*
			function flyTo(position) {
			    map.flyTo({
			        center: [
			            parseFloat(position.lng),
			            parseFloat(position.lat)
			        ],
			        zoom: 15,
			        speed: 1.5,
			        curve: 1,
			    });
			}
			*/

			function fitBounds(bounds) {
				map.fitBounds(bounds, {
					speed: 1.5,
					curve: 1,
					padding: 30,
					linear: false,
					maxZoom: 8,
				});
			}
		}
    }]);

	app.directive('marker', ['$http', '$timeout', function ($http, $timeout) {
		return {
			restrict: 'A',
			scope: {
				item: '=marker',
			},
			template: '<div class="inner">' +
				'   <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24">' +
				'       <path d="M12 0c-5.522 0-10 4.395-10 9.815 0 5.505 4.375 9.268 10 14.185 5.625-4.917 10-8.68 10-14.185 0-5.42-4.478-9.815-10-9.815zm0 18c-4.419 0-8-3.582-8-8s3.581-8 8-8 8 3.582 8 8-3.581 8-8 8z"/>' +
				'   </svg>' +
				'   <span ng-bind="item.code"></span>' +
				'</div>',
			link: link,
		};

		function link(scope, element, attributes, model) {
			// console.log('marker', scope.item);
		}

    }]);

	/*
	app.service('GoogleMaps', ['$q', '$http', function ($q, $http) {
		var _key = 'AIzaSyAYuhIEO-41YT_GdYU6c1N7DyylT_OcMSY';
		var _init = false;

		this.maps = maps;
		this.geocoder = geocoder;
		this.parse = parse;

		function maps() {
			var deferred = $q.defer();
			if (_init) {
				deferred.resolve(window.google.maps);
			} else {
				window.googleMapsInit = function () {
					deferred.resolve(window.google.maps);
					window.googleMapsInit = null;
					_init = true;
				};
				var script = document.createElement('script');
				script.setAttribute('async', null);
				script.setAttribute('defer', null);
				script.setAttribute('src', 'https://maps.googleapis.com/maps/api/js?key=' + _key + '&callback=googleMapsInit');
				document.body.appendChild(script);
			}
			return deferred.promise;
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
			}
			console.log('googleMaps.parse', results, items);
			return items;
		}

    }]);
    */

}());