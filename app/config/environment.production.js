/* global angular */

(function() {
    "use strict";

    var app = angular.module('app');

    app.config(['environmentProvider', function(environmentProvider) {

        environmentProvider.add('production', {
            paths: {
                app: 'https://actarian.github.io/artisan',
                api: 'https://actarian.github.io/artisan/api',
            },
            addons: {
                facebook: {
                    app_id: 156171878319496,
                }
            },
        });

    }]);

}());