/* global angular */

(function() {
	"use strict";

	var app = angular.module('artisan');

	app.service('Bearer', ['$http', '$promise', 'SessionStorage', 'LocalStorage', 'environment', function($http, $promise, SessionStorage, LocalStorage, environment) {

		var service = this;

		var statics = {
			'delete': BearerDelete,
			exist: BearerExists,
			get: BearerGet,
			set: BearerSet,
		};

		angular.extend(service, statics);

		// statics methods

		function BearerDelete(accessToken, remember) {
			SessionStorage.delete('accessToken');
			LocalStorage.delete('accessToken');
			delete $http.defaults.headers.common['Authorization'];
		}

		function BearerExists(accessToken, remember) {
			return SessionStorage.exist('accessToken') || LocalStorage.exist('accessToken');
		}

		function BearerGet(accessToken, remember) {
			var accessToken = null;
			if (SessionStorage.exist('accessToken')) {
				accessToken = SessionStorage.get('accessToken');
				BearerSet(accessToken);
			} else if (LocalStorage.exist('accessToken')) {
				accessToken = LocalStorage.get('accessToken');
				BearerSet(accessToken);
			}
			return accessToken;
		}

		function BearerSet(accessToken, remember) {
			var header = 'Bearer ' + accessToken;
			delete $http.defaults.headers.common['Authorization'];
			$http.defaults.headers.common['Authorization'] = header;
			SessionStorage.set('accessToken', accessToken);
			if (remember) {
				LocalStorage.set('accessToken', accessToken);
			}
			return header;
		}

    }]);

}());
