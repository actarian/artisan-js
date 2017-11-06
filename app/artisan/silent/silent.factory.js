/* global angular */

(function() {
    "use strict";

    var app = angular.module('artisan');

    app.factory('$silent', ['$rootScope', '$location', function($rootScope, $location) {
        function $silent() {}

        var $path;

        function unlink() {
            var listeners = $rootScope.$$listeners.$locationChangeSuccess;
            angular.forEach(listeners, function(value, name) {
                if (value === listener) {
                    return;
                }

                function relink() {
                    listeners[name] = value;
                }
                listeners[name] = relink; // temporary unlinking
            });
        }

        function listener(e) {
            // console.log('onLocationChangeSuccess', e);
            if ($path === $location.path()) {
                unlink();
            }
            $path = null;
        }

        var statics = {
            silent: function(path, replace) {
                // this.prev = $location.path(); ???
                var location = $location.url(path);
                if (replace) {
                    location.replace();
                }
                $path = $location.path();
            },
            path: function(path) {
                return $location.path(path);
            },
        };

        angular.extend($silent, statics);
        $rootScope.$$listeners.$locationChangeSuccess.unshift(listener);
        // console.log('$rootScope.$$listeners.$locationChangeSuccess', $rootScope.$$listeners.$locationChangeSuccess);
        return $silent;
    }]);

}());