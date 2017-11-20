/* global angular */

(function() {
    "use strict";

    var app = angular.module('app');

    app.config(['environmentProvider', function(environmentProvider) {

        environmentProvider.add('local', {
            paths: {
                app: 'http://localhost:6001',
                api: 'http://localhost:6001/api',
            },
            addons: {
                facebook: {
                    app_id: 340008479796111,
                }
            },
        });

    }]);

}());