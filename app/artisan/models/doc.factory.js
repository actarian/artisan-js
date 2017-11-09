/* global angular */

(function() {
    "use strict";

    var app = angular.module('artisan');

    app.factory('Doc', ['Api', '$promise', function(Api, $promise) {
        function Doc(item) {
            if (item) {
                angular.extend(this, item);
            }
        }

        Doc.prototype = {

        };

        var statics = {};

        angular.extend(Doc, statics);

        return Doc;
    }]);

}());