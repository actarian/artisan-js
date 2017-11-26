/* global angular */

(function() {
    "use strict";

    var app = angular.module('app');

    app.service('Api', ['Http', function(Http) {

        var api = {
            navs: {
                main: function() {
                    return Http.get('/navs/main.json');
                },
            },
            docs: {
                id: function(id) {
                    return Http.get('/docs/' + id + '.json');
                },
                path: function(path) {
                    path = path.split('/').join('-');
                    return Http.get('/docs/' + path + '.json');
                },
            },
            maps: {
                markers: function() {
                    return Http.get('/maps/markers.json');
                },
            },
        };

        angular.extend(this, api);

    }]);

}());