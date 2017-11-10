/* global angular */

(function() {
    "use strict";

    var app = angular.module('app');

    app.run(['$rootScope', '$sce', function($rootScope, $sce) {

        $rootScope.trustResource = function(src) {
            return $sce.trustAsResourceUrl(src);
        };

        $rootScope.cssUrl = function(src) {
            return 'url(\'' + src + '\')';
        };

    }]);

}());