/* global angular */

(function() {
    "use strict";

    var app = angular.module('app');

    app.controller('SlugCtrl', ['$scope', 'Api', function($scope, Api) {

        Api.doc().then(function(doc) {
            $scope.doc = doc;

        }, function(error) {

        });

    }]);

}());