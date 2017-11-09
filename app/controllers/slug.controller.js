/* global angular */

(function() {
    "use strict";

    var app = angular.module('app');

    app.controller('SlugCtrl', ['$scope', 'State', 'Api', 'Doc',
        function($scope, State, Api, Doc) {
            var state = new State();
            var view = {};

            Doc.current().then(function(doc) {
                view.doc = doc;
                state.ready();

            }, function(error) {
                state.error(error);

            });

            $scope.state = state;
            $scope.view = view;
        }
    ]);

}());