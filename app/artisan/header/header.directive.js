/* global angular */

(function() {
    "use strict";

    var app = angular.module('artisan');

    app.directive('header', [function() {
        return {
            restrict: 'E',
            templateUrl: 'artisan/header/header',
            transclude: {
                'header': '?headerItems',
            },
            link: function(scope, element, attributes, model) {}
        };
    }]);

}());