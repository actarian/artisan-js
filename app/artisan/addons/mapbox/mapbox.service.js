/* global angular */

(function() {
    "use strict";

    var app = angular.module('artisan');

    app.service('MapBox', ['$q', '$http', '$promise', 'Once', 'environment', function($q, $http, $promise, Once, environment) {

        var service = this;

        var statics = {
            get: MapBoxGet,
        };

        angular.extend(service, statics);

        if (!environment.addons.mapbox) {
            trhow('MapBox.error missing config object in environment.addons.mapbox');
        }

        var config = environment.addons.mapbox;

        function MapBoxGet() {
            return $promise(function(promise) {
                if (window.mapboxgl) {
                    promise.resolve(window.mapboxgl);
                } else {
                    $promise.all([
                        Once.script('//api.tiles.mapbox.com/mapbox-gl-js/' + config.version + '/mapbox-gl.js'),
                        Once.link('//api.tiles.mapbox.com/mapbox-gl-js/' + config.version + '/mapbox-gl.css'),
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