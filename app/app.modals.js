/* global angular */

(function() {
	"use strict";

	var app = angular.module('app');

	app.config(['$modalProvider', function($modalProvider) {

		$modalProvider.when('authModal', {
			title: 'Authenticate',
			templateUrl: 'views/modals/auth-modal.html',
			controller: 'RootCtrl',
			customClass: 'modal-sm',
		});

    }]);

}());
