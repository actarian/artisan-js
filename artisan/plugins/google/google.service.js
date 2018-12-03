/* global angular */

(function() {
	"use strict";

	var app = angular.module('artisan');

	// todo !!!

	app.service('GoogleService', ['$timeout', '$promise', '$once', 'LocalStorage', 'environment', function($timeout, $promise, $once, storage, environment) {

		var service = this;

		var statics = {
			require: GoogleRequire,
			login: GoogleLogin,
			logout: GoogleLogout,
			getMe: GoogleGetMe,
			// status: GoogleStatus,
			// getMyPicture: GoogleGetMyPicture,
		};

		angular.extend(service, statics);

		// private vars

		if (!environment.plugins.google) {
			trhow('GoogleService.error missing config object in environment.plugins.google');
		}

		var config = environment.plugins.google;

		var auth2 = null;

		var instance = null;

		// statics methods

		/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
		 *  calling google initializer on page load to avoid popup blockers via asyncronous loading  *
		 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

		var authResponse = storage.get('google');
		/*
		authResponse = {
		    access_token: "accessTokenXXXXX",
		    expires_at: 1511992065944,
		    expires_in: 3600,
		    first_issued_at: 1511988465944,
		    id_token: "idTokenXXXXX",
		    idpId: "google",
		    login_hint: "loginHintXXXXXX",
		    scope: "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/plus.me openid email profile"
		    session_state: {
		        extraQueryParams: { … }
		    },
		    token_type: "Bearer"
		}
		*/
		console.log('google.storage', authResponse);

		function GoogleRequire() {
			return Auth2Init();
		}

		function Google() {
			return $promise(function(promise) {
				if (window.gapi !== undefined) {
					promise.resolve(window.gapi);
				} else {
					GoogleOnce().then(function(response) {
						promise.resolve(window.gapi);
					}, function(error) {
						promise.reject(error);
					});
				}
			});
		}

		function GoogleOnce() {
			return $promise(function(promise) {
				$once.script('https://apis.google.com/js/api:client.js?onload={{callback}}', true).then(function(data) {
					promise.resolve(data);
				}, function(error) {
					promise.reject(error);
				});
			});
		}

		function Auth2Init() {
			return $promise(function(promise) {

				if (auth2) {
					promise.resolve(auth2);
				} else {
					Google().then(function() {
						function onLoaded() {
							var result = window.gapi.auth2.init({
								client_id: environment.plugins.google.clientId,
								cookiepolicy: 'single_host_origin',
								scope: 'profile email',
								fetch_basic_profile: true,
								ux_mode: 'popup',

							}).then(function() {
								auth2 = window.gapi.auth2;
								console.log('Auth2Init.success', auth2);
								promise.resolve(auth2);

							}, function(error) {
								console.log('Auth2Init.error', error);
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
						console.log('Auth2Init.error', error);
						promise.reject(error);

					});
				}
			});
		}

		function Auth2Instance() {
			return $promise(function(promise) {
				if (instance) {
					promise.resolve();
				} else {
					Auth2Init().then(function(auth2) {
						instance = auth2.getAuthInstance();
						console.log('GoogleService.Auth2Instance.success', instance);
						promise.resolve();

					}, function(error) {
						console.log('GoogleService.Auth2Instance.error', error);
						promise.reject(error);
					});
				}
			});
		}

		function GoogleGetMe() {
			return $promise(function(promise) {
				GoogleLogin().then(function(response) {
					var profile = instance.currentUser.get().getBasicProfile();
					var user = {
						id: profile.getId(),
						name: profile.getName(),
						firstName: profile.getGivenName(),
						lastName: profile.getFamilyName(),
						picture: profile.getImageUrl(),
						email: profile.getEmail(),
					};
					console.log('GoogleGetMe.success', user);
					promise.resolve(user);

				}, function(error) {
					console.log('GoogleGetMe.error', error);
					promise.reject(error);

				});
			});
		}

		function GoogleLogin() {
			return $promise(function(promise) {
				Auth2Instance().then(function() {
					if (instance.isSignedIn && instance.isSignedIn.get()) {
						// Auth2Instance.isSignedIn.listen(onStatus);
						readAccessToken();

					} else {
						console.log('GoogleLogin.signIn');
						instance.signIn({
							scope: 'profile email',

						}).then(function(signed) {
							readAccessToken();

						}, function(error) {
							console.log('GoogleLogin.error', error);
							storage.delete('google');
							promise.reject(error);

						});
					}

					function readAccessToken() {
						console.log('GoogleLogin.readAccessToken');
						try {
							var response = instance.currentUser.get().getAuthResponse(true);
							console.log('GoogleLogin.readAccessToken.success', response);
							storage.set('google', response);
							promise.resolve({
								code: response.access_token,
							});
						} catch (error) {
							console.log('GoogleLogin.readAccessToken.error', error);
							storage.delete('google');
							promise.reject(error);
						}
					}

					function onStatus(signed) {
						console.log('GoogleLogin.onStatus', signed);
						if (signed) {
							readAccessToken();
						}
					}
				}, function(error) {
					console.log('GoogleLogin.error', error);
					// promise.reject(error);

				});
			});
		}

		function GoogleLogout() {
			return $promise(function(promise) {

				Auth2Instance().then(function() {
					if (instance.isSignedIn && instance.isSignedIn.get()) {
						instance.signOut().then(function(signed) {
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

}());
