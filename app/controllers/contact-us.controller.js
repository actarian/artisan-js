/* global angular */

(function() {
    "use strict";

    var app = angular.module('app');

    app.controller('ContactUsCtrl', ['$scope', 'State', function($scope, State) {

        var state = new State();
        var state2 = new State();
        var view = {};

        $scope.state = state;
        $scope.state2 = state2;
        $scope.view = view;
    }]);

}());