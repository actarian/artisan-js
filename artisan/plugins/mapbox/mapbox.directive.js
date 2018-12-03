/* global angular */

(function() {
	"use strict";

	var app = angular.module('artisan');

	app.directive('mapbox', ['$http', '$timeout', '$compile', '$promise', 'MapBox', 'environment', function($http, $timeout, $compile, $promise, MapBox, environment) {

		var directive = {
			restrict: 'A',
			scope: {
				connector: '=mapbox',
			},
			link: MapboxLink,
		};

		if (!environment.plugins.mapbox) {
			trhow('mapbox.error missing config object in environment.plugins.mapbox');
		}

		var config = environment.plugins.mapbox;

		return directive;

		function MapboxLink(scope, element, attributes, model) {
			var map, markers, marker, geocoder, bounds, canvas, dragging, overing;

			var publics = {
				// methods available for controllers
				fly: MapboxFly,
				flyPosition: MapboxFlyPosition,
				jump: MapboxJump,
				jumpPosition: MapboxJumpPosition,
				setMarkers: MapboxMarkersSet,
				fitBounds: MapboxBoundsFit,
			};

			if (scope.connector) {
				angular.extend(scope.connector, publics);
			}

			function MapboxMap() {
				return $promise(function(promise) {

					MapBox.get().then(function(mapboxgl) {
						map = new mapboxgl.Map({
							container: element[0],
							style: config.style,
							interactive: true,
							logoPosition: 'bottom-right',
							// center: config.options.center,
							// zoom: config.options.zoom,
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
						if (config.options) {
							map.jumpTo(config.options);
						}
						promise.resolve(map);
					});
				});
			}

			function MapboxFly(options) {
				map.flyTo(options);
			}

			function MapboxFlyPosition(position) {
				var options = getOptions({
					center: [position.lng, position.lat],
					zoom: 20,
				});
				MapboxFly(options);
			}

			function MapboxJump(options) {
				map.jumpTo(options);
			}

			function MapboxJumpPosition(position) {
				var options = getOptions({
					center: [position.lng, position.lat],
					zoom: 20,
				});
				map.MapboxJump(options);
			}

			/*
			googleMaps.geocoder().then(function (response) {
			    geocoder = response;
			    init();
			});
			*/

			function getOptions(options) {
				return angular.extend(angular.copy(config.options), options);
			}

			function MapboxMarkersRemove() {
				if (markers) {
					angular.forEach(markers, function(item) {
						item.remove();
					});
				}
			}

			function MapboxMarkersSet(items) {
				MapboxMap().then(function() {
					MapboxMarkersRemove();
					markers = [];
					if (config.clusterer) {
						MapboxClusterer(items);

					} else {
						if (items) {
							angular.forEach(items, function(item) {
								var marker = MapboxMarkerAdd(item);
								markers.push(marker);
							});
						}
					}
				});
			}

			function MapboxMarkerAdd(item) {
				var $scope = scope.$new(true);
				$scope.item = item;
				var node = document.createElement('div');
				node.id = 'point';
				node.className = 'marker ' + item.area.code;
				node.className += item.type;
				node.setAttribute('marker', 'item');
				var marker = new mapboxgl.Marker(node, {
						offset: [-10, -10]
					})
					.setLngLat([item.position.lng, item.position.lat])
					.addTo(map);
				var markerElement = angular.element(node);
				markerElement.on('click', function(e) {
					// console.log('marker.click', item);
					scope.$emit('onMarkerClicked', item);
				});
				$compile(markerElement)($scope); // Compiling marker
				return marker;
			}

			function MapboxCoordinatesGet(item) {
				var coordinates = null;
				if (item.position) {
					coordinates = [
                        item.position.longitude,
                        item.position.latitude,
                        item.position.altitude || 0.0,
                    ];
				}
				// [0, 1, 2]; longitude, latitude, altitude
				return coordinates;
			}

			function MapboxFeaturesGet(items) {
				var collection = null;
				if (items) {
					var features = items.map(function(item) {
						return {
							type: 'Feature',
							properties: angular.extend({}, item),
							geometry: {
								type: 'Point',
								coordinates: MapboxCoordinatesGet(item),
							}
						};
					});
					collection = {
						type: 'FeatureCollection',
						crs: {
							type: 'name',
							properties: {
								name: 'urn:ogc:def:crs:OGC:1.3:CRS84'
							}
						},
						features: features,
					};
				}
				return collection;
			}

			function MapboxClusterer(items) {

				var collection = MapboxFeaturesGet(items);

				map.on('load', function() {
					// Add a new source from our GeoJSON data and set the
					// 'cluster' option to true. GL-JS will add the point_count property to your source data.
					map.addSource('earthquakes', {
						type: 'geojson',
						// Point to GeoJSON data. This example visualizes all M1.0+ earthquakes
						// from 12/22/15 to 1/21/16 as logged by USGS' Earthquake hazards program.
						// data: '/api/mapbox/earthquakes.geo.json',
						data: collection,
						cluster: true,
						clusterMaxZoom: 14, // Max zoom to cluster points on
						clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
					});

					map.addLayer({
						id: 'clusters',
						type: 'circle',
						source: 'earthquakes',
						filter: ['has', 'point_count'],
						paint: {
							'circle-color': {
								property: 'point_count',
								type: 'interval',
								stops: [
                                    [0, '#51bbd6'],
                                    [100, '#f1f075'],
                                    [750, '#f28cb1'],
                                ]
							},
							'circle-radius': {
								property: 'point_count',
								type: 'interval',
								stops: [
                                    [0, 20],
                                    [100, 30],
                                    [750, 40]
                                ]
							}
						}
					});

					map.addLayer({
						id: 'cluster-count',
						type: 'symbol',
						source: 'earthquakes',
						filter: ['has', 'point_count'],
						layout: {
							'text-field': '{point_count_abbreviated}',
							'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
							'text-size': 12
						}
					});

					map.addLayer({
						id: 'unclustered-point',
						type: 'circle',
						source: 'earthquakes',
						filter: ['!has', 'point_count'],
						paint: {
							'circle-color': '#11b4da',
							'circle-radius': 4,
							'circle-stroke-width': 1,
							'circle-stroke-color': '#fff'
						}
					});
				});
			}

			function MapboxBoundsFit() {
				if (bounds) {
					map.fitBounds(bounds, {
						speed: 1.5,
						curve: 1,
						padding: 30,
						linear: false,
						maxZoom: 8,
					});
				}
			}

			function geocodeAddress(address) {
				geocoder.geocode({
					'address': address
				}, function(results, status) {
					$timeout(function() {
						if (status === 'OK') {
							connector.results = googleMaps.parse(results);
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
				}, function(results, status) {
					$timeout(function() {
						if (status === 'OK') {
							connector.results = googleMaps.parse(results);
						} else {
							console.log('Geocoder failed due to: ' + status);
						}
					});
				});
			}

			function geolocalize() {
				if (navigator.geolocation) {
					navigator.geolocation.getCurrentPosition(function(p) {
						$timeout(function() {
							var position = {
								lat: p.coords.latitude,
								lng: p.coords.longitude
							};
							flyTo(position);
							reverseGeocode(position);
						});
					}, function(e) {
						console.log('error', e);
					});
				} else {
					console.log('error', 'Browser doesn\'t support Geolocation');
				}
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

		}
    }]);

	app.directive('marker', ['$http', '$timeout', function($http, $timeout) {
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
