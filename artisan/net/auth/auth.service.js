/* global angular */

(function() {
	"use strict";

	var app = angular.module('artisan');

	// todo

	app.service('AuthService', ['$q', '$rootScope', '$location', 'LocalStorage', 'environment', function($q, $rootScope, $location, LocalStorage, environment) {

		var service = this;

		var statics = {
			isAuthorizedOrGoTo: isAuthorizedOrGoTo,
			isAuthorized: isAuthorized,
			request: request,
			response: response,
			responseError: responseError,
			signOut: signOut,
		};

		angular.extend(service, statics);

		/* * * * * * * * * * * * * * * * *
		 *  detect current auth storage  *
		 * * * * * * * * * * * * * * * * */

		console.log(environment.plugins);

		// statics methods

		function isAuthorizedOrGoTo(redirect) {
			var deferred = $q.defer();
			var auth = LocalStorage.get('authorization');
			if (auth && auth.created_at + auth.expires_in < new Date().getTime()) {
				deferred.resolve(auth);
			} else {
				deferred.reject({
					status: 'unauthorized'
				});
				$location.path(redirect);
			}
			return deferred.promise;
		}

		function isAuthorized() {
			var auth = LocalStorage.get('authorization');
			return (auth && auth.created_at + auth.expires_in < new Date().getTime());
		}

		function request(config) {
			var auth = LocalStorage.get('authorization');
			if (auth && auth.created_at + auth.expires_in < new Date().getTime()) {
				config.headers = config.headers || {};
				config.headers.Authorization = 'Bearer ' + auth.access_token; // add your token from your service or whatever
			}
			return config;
		}

		function response(response) {
			return response || $q.when(response);
		}

		function responseError(error) {
			console.log('AuthService.responseError', error);
			// your error handler
			switch (error.status) {
				case 400:
					var errors = [];
					if (error.data) {
						errors.push(error.data.Message);
						for (var key in error.data.ModelState) {
							for (var i = 0; i < error.data.ModelState[key].length; i++) {
								errors.push(error.data.ModelState[key][i]);
							}
						}
					} else {
						errors.push('Server error');
					}
					error.Message = errors.join(' ');
					// warning !!
					$rootScope.httpError = error;
					$rootScope.$broadcast('onHttpInterceptorError', error);
					break;
				case 404:
					error.Message = "Not found";
					$rootScope.httpError = error;
					$rootScope.$broadcast('onHttpInterceptorError', error);
					break;
				case 500:
					// console.log('500',error);
					$rootScope.httpError = error;
					$rootScope.$broadcast('onHttpInterceptorError', error);
					break;
				case 401:
					LocalStorage.delete('authorization');
					LocalStorage.delete('user');
					$location.path('/signin');
					break;
				case -1:
					window.open(error.config.path, '_blank');
					// status == 0 you lost connection
			}
			return $q.reject(error);
		}

		function signOut() {
			LocalStorage.delete('authorization');
			LocalStorage.delete('user');
			LocalStorage.delete('CampagnoloToken');
			LocalStorage.delete('GoogleToken');
			LocalStorage.delete('StravaToken');
			LocalStorage.delete('FacebookToken');
			LocalStorage.delete('GarminToken');
		}

    }]);

}());
