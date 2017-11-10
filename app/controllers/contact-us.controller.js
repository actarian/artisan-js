/* global angular */

(function() {
    "use strict";

    var app = angular.module('app');

    app.controller('ContactUsCtrl', ['$scope', 'State', 'View', function($scope, State, View) {
        var state = new State();
        var state2 = new State();

        View.current().then(function(view) {
            $scope.view = view;
            state.ready();

        }, function(error) {
            state.error(error);

        });

        $scope.state = state;
        $scope.state2 = state2;
    }]);

}());