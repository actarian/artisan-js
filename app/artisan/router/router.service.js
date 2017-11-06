/* global angular */

(function() {
    "use strict";

    var app = angular.module('artisan');

    app.service('Router', ['$location', '$timeout', function($location, $timeout) {

        var service = this;
        service.redirect = redirect;
        service.path = path;
        service.apply = apply;

        function redirect(path, msecs) {
            function doRedirect() {
                $location.$$lastRequestedPath = $location.path();
                $location.path(path);
            }
            if (msecs) {
                $timeout(function() {
                    doRedirect();
                }, msecs);
            } else {
                doRedirect();
            }
        }

        function path(path, msecs) {
            function doRetry() {
                path = $location.$$lastRequestedPath || path;
                $location.$$lastRequestedPath = null;
                $location.path(path);
            }
            if (msecs) {
                $timeout(function() {
                    doRetry();
                }, msecs);
            } else {
                doRetry();
            }
        }

        function apply(path, msecs) {
            function doRetry() {
                $location.path(path);
            }
            if (msecs) {
                $timeout(function() {
                    doRetry();
                }, msecs);
            } else {
                $timeout(function() {
                    doRetry();
                });
            }
        }

    }]);

}());