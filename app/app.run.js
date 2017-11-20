/* global angular */

(function() {
    "use strict";

    var app = angular.module('app');

    app.run(['$rootScope', 'Router', 'Trust', function($rootScope, Router, Trust) {

        $rootScope.router = Router;
        $rootScope.trust = Trust;

    }]);

}());