/* global angular */

(function() {
    "use strict";

    var app = angular.module('app');

    app.config(['environmentProvider', function(environmentProvider) {

        environmentProvider.add('environment', {
            location: {
                html5: false,
                hash: '!',
            },
            http: {
                withCredentials: false,
                interceptors: [], // ['AuthInterceptorService'],
            },
            addons: {
                facebook: {
                    // app_id: xxxxxxxxxx,
                    scope: 'public_profile, email', // publish_stream
                    fields: 'id,name,first_name,last_name,email,gender,picture,cover,link',
                    version: 'v2.10',
                }
            },
            language: {
                code: 'en',
                culture: 'en_US',
                name: 'English',
                iso: 'ENU',
            },
        });

    }]);

}());