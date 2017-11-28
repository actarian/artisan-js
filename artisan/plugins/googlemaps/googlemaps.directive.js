/* global angular */

(function() {
    "use strict";

    var app = angular.module('artisan');

    // todo !!!

    app.directive('googlemaps', ['$timeout', '$compile', '$promise', 'Http', 'GoogleMaps', 'environment', function($timeout, $compile, $promise, Http, GoogleMaps, environment) {

        var directive = {
            restrict: 'A',
            scope: {
                connector: '=googlemaps',
            },
            link: GooglemapsLink,
        };

        if (!environment.plugins.googlemaps) {
            trhow('googlemaps.error missing config object in environment.plugins.googlemaps');
        }

        var config = environment.plugins.googlemaps;

        return directive;

        function GooglemapsLink(scope, element, attributes) {
            console.log('GooglemapsLink', arguments);

            var map, options, info, bounds, clusterer;
            var filters = {};
            var markers = [];

            var publics = {
                // methods available for controllers
                /*
                fly: MapboxFly,
                flyPosition: MapboxFlyPosition,
                jump: MapboxJump,
                jumpPosition: MapboxJumpPosition,
                */
                setMarkers: GooglemapsMarkersSet,
                setType: GooglemapsSetType,
            };

            if (scope.connector) {
                angular.extend(scope.connector, publics);
            }

            Googlemaps();

            function Googlemaps() {
                return $promise(function(promise) {
                    GoogleMaps.maps().then(function() {
                        GooglemapsOptions().then(function(options) {
                            map = new google.maps.Map(element[0], options);
                            info = GooglemapsInfo();
                            promise.resolve(map);
                        });
                    });
                });
            }

            function GooglemapsOptions() {
                return $promise(function(promise) {
                    var options = angular.copy(config.options);
                    if (config.styles) {
                        Http.get(config.styles).then(function(styles) {
                            options.styles = styles;
                            promise.resolve(options);

                        }, function(error) {
                            console.log('GooglemapsOptions.error', 'unable to load styles', config.styles);
                            promise.resolve(options);

                        });

                    } else {
                        promise.resolve(options);
                    }
                });
            }

            function GooglemapsMarkersRemove() {
                angular.forEach(markers, function(marker) {
                    marker.setMap(null);
                });
            }

            function GooglemapsMarkersSet(items) {
                Googlemaps().then(function(map) {
                    GooglemapsMarkersRemove();
                    bounds = new google.maps.LatLngBounds();

                    markers = items.filter(function(item) {
                        var has = true;
                        if (filters.month) {
                            has = has && filters.month.items.has(item.id);
                        }
                        if (filters.category) {
                            has = has && item.categories.indexOf(filters.category.key) !== -1;
                        }
                        return has;

                    }).map(function(item) {
                        return GooglemapsMarker(item);

                    });

                    if (config.clusterer) {
                        clusterer = GooglemapsClusterer(markers);
                    }

                });
            }

            function GooglemapsBoundsFit() {
                if (!bounds.isEmpty()) {
                    map.fitBounds(bounds);
                }
            }

            function GooglemapsSetType(typeId) {
                var types = ['hybrid', 'roadmap', 'satellite', 'terrain'];
                if (types.indexOf(typeId) !== -1) {
                    map.setMapTypeId(typeId);
                }
            }

            function GooglemapsInfo() {

                var info = new google.maps.InfoWindow({
                    maxWidth: 350,
                    pixelOffset: new google.maps.Size(0, 15),
                });

                google.maps.event.addListener(info, 'domready', function() {
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
                    background.children(':nth-child(1)').attr('style', function(i, s) {
                        return s + 'display: none!important';
                    });
                    background.children(':nth-child(3)').attr('style', function(i, s) {
                        return s + 'display: none!important';
                    });
                    background.children(':nth-child(3)').find('div').children().attr('style', function(i, s) {
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
                    close.mouseout(function() {
                        $(this).css({
                            opacity: '1'
                        });
                    });
                });

                return info;
            }

            function GooglemapsMarker(item) {

                var latLng = new google.maps.LatLng(
                    item.position.latitude,
                    item.position.longitude
                );

                var marker = new google.maps.Marker({
                    position: latLng,
                    item: item,
                    icon: {
                        url: 'img/maps/marker.png',
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

                marker.onClick = function() {
                    var marker = this;
                    $timeout(function() {
                        scope.selectedBlog = marker.item;
                        var html = $compile(marker.contentString)(scope);
                        info.setContent(html[0]);
                        info.open(map, marker);
                    });
                };

                marker.addListener('click', marker.onClick);

                bounds.extend(latLng);

                return marker;
            }

            function GooglemapsClusterer(markers) {

                var clusterer = new MarkerClusterer(map, markers, {
                    cssClass: 'cluster',
                    imagePath: '/img/gmap/m'
                });

                return clusterer;

            }

        }

    }]);

}());