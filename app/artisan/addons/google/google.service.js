/* global angular */

(function () {
	"use strict";

	var app = angular.module('artisan');

	// todo !!!

	app.factory('GoogleService', ['$q', '$timeout', 'APP', function ($q, $timeout, APP) {
		function GoogleService() {}

		GoogleService.Init = function () {
			var deferred = $q.defer();
			window.gapiAsyncInit = function () {
				deferred.resolve();
				console.log('GoogleService.Init.success');
			};
			try {
				(function (d, s, id) {
					var js, fjs = d.getElementsByTagName(s)[0];
					if (d.getElementById(id)) {
						return;
					}
					js = d.createElement(s);
					js.id = id;
					js.src = "https://apis.google.com/js/api:client.js?onload=gapiAsyncInit";
					fjs.parentNode.insertBefore(js, fjs);
				}(document, 'script', 'google-jssdk'));
			} catch (error) {
				console.log('GoogleService.Init.error');
				deferred.reject(error);

			}
			return deferred.promise;
		}

		GoogleService.GAPI = function () {
			var deferred = $q.defer();
			if (window['gapi'] !== undefined) {
				deferred.resolve(window['gapi']);

			} else {
				GoogleService.Init().then(function (success) {
					console.log('GoogleService.GAPI.success', window.gapi);
					deferred.resolve(window.gapi);

				}, function (error) {
					console.log('GoogleService.GAPI.error', error);
					deferred.reject(error);
				})
			}
			return deferred.promise;
		};

		var _auth2 = null,
			_googleAuth = null;
		GoogleService.Auth2 = function () {
			var deferred = $q.defer();
			if (_auth2) {
				deferred.resolve(_auth2);
			} else {
				GoogleService.GAPI().then(function () {
					function onLoaded() {
						var GoogleAuth = window.gapi.auth2.init({
							client_id: APP.GOOGLE_APP_ID,
							cookiepolicy: 'single_host_origin',
							scope: 'profile email',
							fetch_basic_profile: true,
							ux_mode: 'popup',

						}).then(function () {
							_auth2 = window.gapi.auth2;
							console.log('GoogleService.Auth2.success', _auth2);
							deferred.resolve(_auth2);

						}, function (error) {
							console.log('GoogleService.Auth2.error', error);
							deferred.reject(error);

						});
					}
					if (window.gapi.auth2) {
						onLoaded();
					} else {
						window.gapi.load('auth2', function () {
							$timeout(function () {
								onLoaded();
							}, 200);
						});
					}
				}, function (error) {
					console.log('GoogleService.Auth2.error', error);
					deferred.reject(error);

				});
			}
			return deferred.promise;
		};

		GoogleService.GoogleAuth = function () {
			var deferred = $q.defer();
			if (_googleAuth) {
				deferred.resolve();
			} else {
				GoogleService.Auth2().then(function (auth2) {
					_googleAuth = auth2.getAuthInstance();
					console.log('GoogleService.GoogleAuth.success', _googleAuth);
					deferred.resolve();

				}, function (error) {
					console.log('GoogleService.GoogleAuth.error', error);
					deferred.reject(error);
				});
			}
			return deferred.promise;
		};

		GoogleService.login = function () {
			var deferred = $q.defer();
			GoogleService.GoogleAuth().then(function () {
				if (_googleAuth.isSignedIn && _googleAuth.isSignedIn.get()) {
					// GoogleAuth.isSignedIn.listen(onStatus);
					readAccessToken();

				} else {
					console.log('GoogleService.login.signIn');
					_googleAuth.signIn({
						scope: 'profile email',

					}).then(function (signed) {
						readAccessToken();

					}, function (error) {
						console.log('GoogleService.login.error', error);
						deferred.reject(error);

					});
				}

				function readAccessToken() {
					console.log('GoogleService.login.readAccessToken');
					try {
						var response = _googleAuth.currentUser.get().getAuthResponse(true);
						console.log('GoogleService.login.readAccessToken.success', response);
						deferred.resolve({
							code: response.access_token,
						});
					} catch (error) {
						console.log('GoogleService.login.readAccessToken.error', error);
						deferred.reject(error);
					}
				}

				function onStatus(signed) {
					console.log('GoogleService.login.onStatus', signed);
					if (signed) {
						readAccessToken();
					}
				}
			}, function (error) {
				console.log('GoogleService.login.error', error);

			});
			return deferred.promise;
		}

		GoogleService.signOut = function () {
			var deferred = $q.defer();
			GoogleService.GoogleAuth().then(function () {
				if (_googleAuth.isSignedIn && _googleAuth.isSignedIn.get()) {
					_googleAuth.signOut().then(function (signed) {
						deferred.resolve();

					}, function (error) {
						console.log('GoogleService.signOut.error', error);
						deferred.reject(error);

					});
				} else {
					deferred.resolve();
				}

			}, function (error) {
				console.log('GoogleService.signOut.error', error);
				deferred.reject(error);

			});
			return deferred.promise;
		}

		return GoogleService;

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

	        var url = 'https://www.strava.com/oauth/authorize?client_id=##client_id##&response_type=code&redirect_uri=##redirect_uri##&approval_prompt=force'; // &scope=view_private
	        url = url.split('##client_id##').join(APP.STRAVA_APP_ID);
	        url = url.split('##redirect_uri##').join(APP.STRAVA_REDIRECT_URI);
	        var w = 400, h = 600;
	        window.open(url, 'StravaAuth', 'toolbar=no, scrollbars=no, resizable=yes, left=' + Math.round((window.innerWidth - w) / 2) + ', top=' + Math.round((window.innerHeight - h) / 2) + ', width=' + w + ', height=' + h, true);

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