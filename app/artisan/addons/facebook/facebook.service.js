/* global angular */

(function () {
	"use strict";

	var app = angular.module('artisan');

	app.service('FacebookService', ['$promise', 'environment', function ($promise, environment) {

		var service = this;

		var statics = {
			login: FacebookLogin,
			logout: FacebookLogout,
			status: FacebookStatus,
			getMe: FacebookGetMe,
			getMyPicture: FacebookGetMyPicture,
		};

		angular.extend(service, statics);

		// private vars

		if (!environment.addons || !environment.addons.facebook) {
			trhow('FacebookService.error missing config object in environment.addons.facebook');
		}

		var config = environment.addons.facebook;

		// statics methods

		/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
		 *  calling facebook initializer on page load to avoid popup blockers via asyncronous loading  *
		 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

		Facebook();

		function Facebook() {
			return $promise(function (promise) {
				if (window.FB !== undefined) {
					promise.resolve(window.FB);
				} else {
					FacebookInit().then(function (success) {
						promise.resolve(window.FB);
					}, function (error) {
						promise.reject(error);
					});
				}
			});
		}

		function FacebookStatus(response, promise, init) {
			service.authResponse = null;
			if (response.status === 'connected') {
				service.authResponse = response.authResponse;
				promise.resolve(response);
			} else if (response.status === 'not_authorized') {
				if (init) {
					promise.resolve(response);
				} else {
					promise.reject(response);
				}
			} else {
				promise.reject(response);
			}
		}

		function FacebookGetMe(fields) {
			fields = fields || config.fields;
			return $promise(function (promise) {
				FacebookLogin().then(function (facebook) {
					console.log('FacebookGetMe', facebook);
					facebook.api('/me', {
						fields: fields
					}, function (response) {
						if (!response || response.error) {
							promise.reject('Error occured');
						} else {
							promise.resolve(response);
						}
					});
				});
			});
		}

		function FacebookGetMyPicture(size) {
			size = size || 300;
			return $promise(function (promise) {
				FacebookLogin().then(function (facebook) {
					facebook.api('/me/picture', {
						width: size,
						height: size,
						type: 'square'
					}, function (response) {
						if (!response || response.error) {
							promise.reject('Error occured');
						} else {
							promise.resolve(response);
						}
					});
				});
			});
		}

		function FacebookLogin() {
			return $promise(function (promise) {
				Facebook().then(function (facebook) {
					console.log('FacebookLogin', facebook);
					facebook.login(function (response) {
						FacebookStatus(response, promise);
					}, {
						scope: config.scope
					});
				});
			});
		}

		function FacebookLogout() {
			return $promise(function (promise) {
				Facebook().then(function (facebook) {
					facebook.logout(function (response) {
						promise.resolve(response);
					});
				});
			});
		}

		function FacebookInit() {
			return $promise(function (promise) {
				window.fbAsyncInit = function () {
					console.log('FacebookInit.fbAsyncInit', window.FB);
					window.FB.init({
						appId: config.app_id,
						status: true,
						cookie: true,
						xfbml: true,
						version: config.version,
					});
					promise.resolve(window.FB);
					// window.fbAsyncInit = null;
				};
				try {
					(function (d, s, id) {
						var js, fjs = d.getElementsByTagName(s)[0];
						if (d.getElementById(id)) {
							return;
						}
						js = d.createElement(s);
						js.id = id;
						js.src = '//connect.facebook.net/' + environment.language.culture + '/sdk.js';
						fjs.parentNode.insertBefore(js, fjs);
					}(document, 'script', 'facebook-jssdk'));
				} catch (error) {
					promise.reject(error);
				}
			});
		}

    }]);

}());