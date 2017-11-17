/* global angular */

(function () {
	"use strict";

	var app = angular.module('artisan');

	// todo !!!

	app.directive('googleMaps', ['$timeout', '$compile', 'GoogleMaps', function ($timeout, $compile, GoogleMaps) {
		return {
			restrict: 'A',
			link: function (scope, element, attributes) {

				var filters = {};

				GoogleMaps.maps().then(function (maps) {
					Init(maps);
				});

				function Init(maps) {
					var center = new google.maps.LatLng(22.106445, 14.630445);

					var map = new google.maps.Map(element[0], {
						zoom: 3,
						center: center,
						mapTypeId: google.maps.MapTypeId.ROADMAP,
						scrollwheel: true,
						disableDefaultUI: true,
						styles: [
							{
								"elementType": "geometry",
								"stylers": [
									{
										"color": "#f5f5f5"
                                    }
                                ]
                            },
							{
								"elementType": "labels.icon",
								"stylers": [
									{
										"visibility": "off"
                                    }
                                ]
                            },
							{
								"elementType": "labels.text.fill",
								"stylers": [
									{
										"color": "#616161"
                                    }
                                ]
                            },
							{
								"elementType": "labels.text.stroke",
								"stylers": [
									{
										"color": "#f5f5f5"
                                    }
                                ]
                            },
							{
								"featureType": "administrative.land_parcel",
								"elementType": "labels.text.fill",
								"stylers": [
									{
										"color": "#bdbdbd"
                                    }
                                ]
                            },
							{
								"featureType": "poi",
								"elementType": "geometry",
								"stylers": [
									{
										"color": "#eeeeee"
                                    }
                                ]
                            },
							{
								"featureType": "poi",
								"elementType": "labels.text.fill",
								"stylers": [
									{
										"color": "#757575"
                                    }
                                ]
                            },
							{
								"featureType": "poi.park",
								"elementType": "geometry",
								"stylers": [
									{
										"color": "#e5e5e5"
                                    }
                                ]
                            },
							{
								"featureType": "poi.park",
								"elementType": "labels.text.fill",
								"stylers": [
									{
										"color": "#9e9e9e"
                                    }
                                ]
                            },
							{
								"featureType": "road",
								"elementType": "geometry",
								"stylers": [
									{
										"color": "#ffffff"
                                    }
                                ]
                            },
							{
								"featureType": "road.arterial",
								"elementType": "labels.text.fill",
								"stylers": [
									{
										"color": "#757575"
                                    }
                                ]
                            },
							{
								"featureType": "road.highway",
								"elementType": "geometry",
								"stylers": [
									{
										"color": "#dadada"
                                    }
                                ]
                            },
							{
								"featureType": "road.highway",
								"elementType": "labels.text.fill",
								"stylers": [
									{
										"color": "#616161"
                                    }
                                ]
                            },
							{
								"featureType": "road.local",
								"elementType": "labels.text.fill",
								"stylers": [
									{
										"color": "#9e9e9e"
                                    }
                                ]
                            },
							{
								"featureType": "transit.line",
								"elementType": "geometry",
								"stylers": [
									{
										"color": "#e5e5e5"
                                    }
                                ]
                            },
							{
								"featureType": "transit.station",
								"elementType": "geometry",
								"stylers": [
									{
										"color": "#eeeeee"
                                    }
                                ]
                            },
							{
								"featureType": "water",
								"elementType": "geometry",
								"stylers": [
									{
										"color": "#b8b8b8"
                                    }
                                ]
                            },
							{
								"featureType": "water",
								"elementType": "labels.text.fill",
								"stylers": [
									{
										"color": "#9e9e9e"
                                    }
                                ]
                            }
                        ]
					});

					var infowindow = getInfoWindow();
					var items = [];
					var markers = [];

					function updateMarkers() {
						if (!items) {
							return;
						}

						angular.forEach(markers, function (marker) {
							marker.setMap(null);
						});

						var imgPath = '/contrib/themes/GioacchinoRossiniTheme/img/gmap/';
						var bounds = new google.maps.LatLngBounds();

						markers = items.filter(function (item) {
							var has = true;
							if (filters.month) {
								has = has && filters.month.items.has(item.id);
							}
							if (filters.category) {
								has = has && item.categories.indexOf(filters.category.key) !== -1;
							}
							return has;
						}).map(function (item) {
							return addMarker(item);
						});

						function addMarker(item) {
							var latLng = new google.maps.LatLng(
								item.place.position.latitude,
								item.place.position.longitude
							);

							var markerImg;
							var categoryKey = filters.category ? filters.category.key : 'all';
							if (categoryKey === 'all') {
								markerImg = imgPath + item.categories[0] + '.png';
							} else {
								markerImg = imgPath + categoryKey + '.png';
							}

							var marker = new google.maps.Marker({
								position: latLng,
								item: item,
								icon: {
									url: markerImg,
									scaledSize: new google.maps.Size(25, 25),
									origin: new google.maps.Point(0, 0),
									anchor: new google.maps.Point(0, 0)
								},
								map: map,
								contentString: '<div id="iw-container">' +
									'<div class="iw-image" ng-style="{ \'background-image\': cssUrl(selectedBlog.image.url) }"></div>' +
									'<div class="iw-title" ng-bind="selectedBlog.title"></div>' +
									'<div class="iw-cta"><button type="button" class="iw-link" ng-click="openBlog(selectedBlog)">Details</button></div>' +
									'</div>'
							});

							marker.onClick = function () {
								var marker = this;
								$timeout(function () {
									scope.selectedBlog = marker.item;
									var html = $compile(marker.contentString)(scope);
									infowindow.setContent(html[0]);
									infowindow.open(map, marker);
								});
							};

							marker.addListener('click', marker.onClick);

							bounds.extend(latLng);

							return marker;
						}

						if (!bounds.isEmpty()) {
							map.fitBounds(bounds);
						}

						var options = {
							cssClass: 'cluster',
							imagePath: '/contrib/themes/GioacchinoRossiniTheme/img/gmap/m'
						};

						var markerCluster = new MarkerClusterer(map, markers, options);
					}

					scope.$on('onSetBlog', function ($scope, blog) {
						angular.forEach(markers, function (marker) {
							if (marker.item === blog) {
								map.setZoom(12);
								map.setCenter(marker.position);
								marker.onClick();
							}
						});
					});

					function getInfoWindow() {
						var infowindow = new google.maps.InfoWindow({
							maxWidth: 350,
							pixelOffset: new google.maps.Size(0, 15),
						});

						google.maps.event.addListener(infowindow, 'domready', function () {
							var outer = $('.gm-style-iw');
							var background = outer.prev();
							background.children(':nth-child(2)').css({
								'display': 'none'
							});
							background.children(':nth-child(4)').css({
								'display': 'none'
							});
							outer.parent().parent().css({
								left: '115px'
							});
							background.children(':nth-child(1)').attr('style', function (i, s) {
								return s + 'display: none!important';
							});
							background.children(':nth-child(3)').attr('style', function (i, s) {
								return s + 'display: none!important';
							});
							background.children(':nth-child(3)').find('div').children().attr('style', function (i, s) {
								return s + 'opacity: 0!important;';
							});
							var close = outer.next();
							close.css({
								'width': '13px',
								'height': '13px',
								'overflow': 'hidden',
								'position': 'absolute',
								'right': '56px',
								'top': '17px',
								'z-index': '10000',
								'cursor': 'pointer',
								'opacity': 1,
								'transform': 'scale(0.8)'
							});
							close.mouseout(function () {
								$(this).css({
									opacity: '1'
								});
							});
						});

						return infowindow;
					}

					scope.$watchCollection(attributes.map, function (newValue) {
						items = newValue;
						console.log('map.items', items);
						updateMarkers();
					});

					scope.$on('onSetFilters', function ($scope, $filters) {
						filters = $filters;
						updateMarkers();
					});
				}
			}
		};
    }]);

}());