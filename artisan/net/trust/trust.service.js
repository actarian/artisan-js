/* global angular */

(function() {
	"use strict";

	var app = angular.module('artisan');

	app.service('Trust', ['$sce', function($sce) {

		var service = this;

		var statics = {
			html: TrustHtml,
			resource: TrustResource,
			url: TrustUrl,
		};

		angular.extend(service, statics);

		// private vars

		var values = [],
			trustedValues = [];

		function TrustGetValue(value) {
			var index = values.indexOf(value);
			if (index !== -1) {
				return trustedValues[index];
			} else {
				return null;
			}
		}

		function TrustSetValue(value, trustedValue) {
			values.push(value);
			values.push(trustedValue);
		}

		function TrustGetOrSet(value, callback) {
			var trustedValue = TrustGetValue(value);
			if (!trustedValue) {
				trustedValue = callback();
				TrustSetValue(value, trustedValue);
			}
			return trustedValue;
		}

		function TrustHtml(value) {
			return TrustGetOrSet(value, function() {
				return $sce.trustAsHtml(value);
			});
		}

		function TrustResource(value) {
			return TrustGetOrSet(value, function() {
				return $sce.trustAsResourceUrl(value);
			});
		}

		function TrustUrl(value) {
			return TrustGetOrSet(value, function() {
				return 'url(\'' + value + '\')';
			});
		}

    }]);

}());
