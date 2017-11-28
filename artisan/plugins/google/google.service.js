/* global angular */

(function() {
    "use strict";

    var app = angular.module('artisan');

    // todo !!!

    app.service('GoogleService', ['$timeout', '$promise', '$once', 'environment', function($timeout, $promise, $once, environment) {

        var service = this;

        var statics = {
            login: GoogleLogin,
            logout: GoogleLogout,
            // status: GoogleStatus,
            // getMe: GoogleGetMe,
            // getMyPicture: GoogleGetMyPicture,
        };

        angular.extend(service, statics);

        // private vars

        if (!environment.plugins.google) {
            trhow('GoogleService.error missing config object in environment.plugins.google');
        }

        var config = environment.plugins.google;

        // statics methods

        /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
         *  calling google initializer on page load to avoid popup blockers via asyncronous loading  *
         * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

        Google();

        function Google() {
            return $promise(function(promise) {
                if (window.gapi !== undefined) {
                    promise.resolve(window.gapi);
                } else {
                    GoogleInit().then(function(response) {
                        promise.resolve(window.gapi);
                    }, function(error) {
                        promise.reject(error);
                    });
                }
            });
        }

        function GoogleInit() {
            return $promise(function(promise) {
                $once.script('https://apis.google.com/js/api:client.js?onload={{callback}}', true).then(function(data) {
                    promise.resolve(data);
                }, function(error) {
                    promise.reject(error);
                });
            });
        }

        /*

        function start() {
        // 2. Initialize the JavaScript client library.
        gapi.client.init({
            'apiKey': 'YOUR_API_KEY',
            // clientId and scope are optional if auth is not required.
            'clientId': 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
            'scope': 'profile',
        }).then(function() {
            // 3. Initialize and make the API request.
            return gapi.client.request({
            'path': 'https://people.googleapis.com/v1/people/me?requestMask.includeField=person.names',
            })
        }).then(function(response) {
            console.log(response.result);
        }, function(reason) {
            console.log('Error: ' + reason.result.error.message);
        });
        };
        // 1. Load the JavaScript client library.
        gapi.load('client', start);

        */

        var _auth2 = null,
            _googleAuth = null;

        function Auth2() {
            return $promise(function(promise) {

                if (_auth2) {
                    promise.resolve(_auth2);
                } else {
                    Google().then(function() {
                        function onLoaded() {
                            var GoogleAuth = window.gapi.auth2.init({
                                client_id: environment.plugins.google.clientId,
                                cookiepolicy: 'single_host_origin',
                                scope: 'profile email',
                                fetch_basic_profile: true,
                                ux_mode: 'popup',

                            }).then(function() {
                                _auth2 = window.gapi.auth2;
                                console.log('Auth2.success', _auth2);
                                promise.resolve(_auth2);

                            }, function(error) {
                                console.log('Auth2.error', error);
                                promise.reject(error);

                            });
                        }
                        if (window.gapi.auth2) {
                            onLoaded();
                        } else {
                            window.gapi.load('auth2', function() {
                                $timeout(function() {
                                    onLoaded();
                                }, 200);
                            });
                        }
                    }, function(error) {
                        console.log('Auth2.error', error);
                        promise.reject(error);

                    });
                }
            });
        };

        function GoogleAuth() {
            return $promise(function(promise) {
                if (_googleAuth) {
                    promise.resolve();
                } else {
                    Auth2().then(function(auth2) {
                        _googleAuth = auth2.getAuthInstance();
                        console.log('GoogleService.GoogleAuth.success', _googleAuth);
                        promise.resolve();

                    }, function(error) {
                        console.log('GoogleService.GoogleAuth.error', error);
                        promise.reject(error);
                    });
                }
            });
        }

        function GoogleLogin() {
            return $promise(function(promise) {
                GoogleAuth().then(function() {
                    if (_googleAuth.isSignedIn && _googleAuth.isSignedIn.get()) {
                        // GoogleAuth.isSignedIn.listen(onStatus);
                        readAccessToken();

                    } else {
                        console.log('GoogleService.login.signIn');
                        _googleAuth.signIn({
                            scope: 'profile email',

                        }).then(function(signed) {
                            readAccessToken();

                        }, function(error) {
                            console.log('GoogleService.login.error', error);
                            promise.reject(error);

                        });
                    }

                    function readAccessToken() {
                        console.log('GoogleService.login.readAccessToken');
                        try {
                            var response = _googleAuth.currentUser.get().getAuthResponse(true);
                            console.log('GoogleService.login.readAccessToken.success', response);
                            promise.resolve({
                                code: response.access_token,
                            });
                        } catch (error) {
                            console.log('GoogleService.login.readAccessToken.error', error);
                            promise.reject(error);
                        }
                    }

                    function onStatus(signed) {
                        console.log('GoogleService.login.onStatus', signed);
                        if (signed) {
                            readAccessToken();
                        }
                    }
                }, function(error) {
                    console.log('GoogleService.login.error', error);

                });
            });
        }

        function GoogleLogout() {
            return $promise(function(promise) {

                GoogleAuth().then(function() {
                    if (_googleAuth.isSignedIn && _googleAuth.isSignedIn.get()) {
                        _googleAuth.signOut().then(function(signed) {
                            promise.resolve();

                        }, function(error) {
                            console.log('GoogleService.signOut.error', error);
                            promise.reject(error);

                        });
                    } else {
                        promise.resolve();
                    }

                }, function(error) {
                    console.log('GoogleService.signOut.error', error);
                    promise.reject(error);

                });
            });
        }

    }]);

    /*
    app.factory('StravaService', ['$q', '$http', 'APP', 'LocalStorage', function ($q, $http, APP, LocalStorage) {

        function StravaService() {
        }

        StravaService.auth = LocalStorage.get('StravaToken');

        StravaService.login = function () {
            var deferred = $q.defer();

            StravaService.auth = null;
            LocalStorage.set('WaitingToken', true);
            LocalStorage.delete('StravaToken');

            LocalStorage.on('StravaToken').then(function (token) {
                // console.log('StravaToken', arguments);
                StravaService.auth = token;

                $http.post('/api/strava/token', { validatorToken: token.code }).then(function (response) {
                    var token = response.data;
                    // console.log('StravaService.token', token);                
                    deferred.resolve(token);

                }, function (error) {
                    deferred.reject(error);
                });

                // deferred.resolve(token);

            }, function (error) {
                deferred.reject({ status: error });

            });

            var path = 'https://www.strava.com/oauth/authorize?client_id=##client_id##&response_type=code&redirect_uri=##redirect_uri##&approval_prompt=force'; // &scope=view_private
            path = path.split('##client_id##').join(APP.STRAVA_APP_ID);
            path = path.split('##redirect_uri##').join(APP.STRAVA_REDIRECT_URI);
            var w = 400, h = 600;
            window.open(path, 'StravaAuth', 'toolbar=no, scrollbars=no, resizable=yes, left=' + Math.round((window.innerWidth - w) / 2) + ', top=' + Math.round((window.innerHeight - h) / 2) + ', width=' + w + ', height=' + h, true);

            return deferred.promise;
        }
        return StravaService;

    }]);

    app.factory('GarminService', ['$q', '$http', '$window', 'APP', 'LocalStorage', function ($q, $http, $window, APP, LocalStorage) {
        function GarminService() {
        }
        GarminService.auth = LocalStorage.get('GarminAccessToken');
        GarminService.login = function () {
            var deferred = $q.defer();
            function GarminOAuth() {
                var w = 970, h = 730;
                var win = window.open('about:blank', 'GarminAuth', 'toolbar=no, scrollbars=no, resizable=yes, left=' + Math.round((window.innerWidth - w) / 2) + ', top=' + Math.round((window.innerHeight - h) / 2) + ', width=' + w + ', height=' + h, true);
                window.focus();
                if (win) {
                    $http.get('/api/garmin/authBegin').then(function (response) {
                        var authUrl = response.data.authUrl;
                        // console.log('GarminService.authBegin', authUrl);
                        LocalStorage.set('WaitingToken', true);
                        LocalStorage.on('GarminToken').then(function (token) {
                            // console.log('GarminService.LocalStorage.on.GarminToken', token);
                            $http.post('/api/garmin/authComplete', { validatorToken: token.oauth_verifier }).then(function (response) {
                                var token = response.data;
                                // console.log('GarminService.authComplete', token);
                                $http.post(APP.API + '/users/' + APP.USER.id + '/garmin_accounts', { garmin_account: { accessToken: token.accessToken } }).then(function success(response) {
                                    token.id = response.data.id;
                                    LocalStorage.set('GarminAccessToken', token);
                                    GarminService.auth = token;
                                    deferred.resolve(token);
                                }, function error(response) {
                                    deferred.reject(response);
                                });
                                deferred.resolve(token);
                            }, function (error) {
                                deferred.reject(error);
                            });
                            // deferred.resolve(token);
                        }, function (error) {
                            deferred.reject({ status: error });
                        });
                        win.focus();
                        win.location.href = authUrl;
                        // console.log('GarminService.open GarminAuth', authUrl);
                    }, function (error) {
                        deferred.reject(error);
                    });
                } else {
                    deferred.reject('unable to open popup window');
                }
            }
            if (GarminService.auth) {
                var token = GarminService.auth;
                $http.delete(APP.API + '/users/' + APP.USER.id + '/garmin_accounts/' + token.id).then(function success(response) {
                    GarminService.auth = null;
                    LocalStorage.delete('GarminToken');
                    LocalStorage.delete('GarminAccessToken');
                    GarminOAuth();
                }, function error(response) {
                    deferred.reject(response);
                });
            } else {
                GarminOAuth();
            }
            return deferred.promise;
        }
        return GarminService;
    }]);
    */

}());