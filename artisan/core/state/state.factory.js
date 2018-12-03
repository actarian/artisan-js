/* global angular */

(function() {
	"use strict";

	var app = angular.module('artisan');

	app.factory('State', ['$timeout', '$rootScope', function($timeout, $rootScope) {

		function State() {
			this.idle();
		}

		var DELAY = 2000;

		var statics = {};

		var publics = {
			busy: busy,
			classes: classes,
			enabled: enabled,
			error: error,
			errorMessage: errorMessage,
			errors: [],
			idle: idle,
			labels: labels,
			ready: ready,
			submitClass: submitClass,
			success: success,
		};

		angular.extend(State, statics);
		angular.extend(State.prototype, publics);

		return State;

		// static methods

		// publics methods

		function busy() {
			var state = this;
			if (!state.isBusy) {
				state.isBusy = true;
				state.isError = false;
				state.isErroring = false;
				state.isSuccess = false;
				state.isSuccessing = false;
				state.errors = [];
				return true;
			} else {
				return false;
			}
		}

		function classes(addons) {
			var state = this,
				classes = null;
			classes = {
				ready: state.isReady,
				busy: state.isBusy,
				successing: state.isSuccessing,
				success: state.isSuccess,
				errorring: state.isErroring,
				error: state.isError,
			};
			if (addons) {
				angular.forEach(addons, function(value, key) {
					classes[value] = classes[key];
				});
			}
			return classes;
		}

		function enabled() {
			var state = this;
			return !state.isBusy && !state.isErroring && !state.isSuccessing;
		}

		function error(error) {
			console.log('State.error', error);
			var state = this;
			state.isBusy = false;
			state.isError = true;
			state.isErroring = true;
			state.isSuccess = false;
			state.isSuccessing = false;
			state.errors.push(error);
			$timeout(function() {
				state.isErroring = false;
			}, DELAY);
		}

		function errorMessage() {
			var state = this;
			return state.isError ? state.errors[state.errors.length - 1] : null;
		}

		function idle() {
			var state = this;
			state.isBusy = false;
			state.isError = false;
			state.isErroring = false;
			state.isSuccess = false;
			state.isSuccessing = false;
			state.button = null;
			state.errors = [];
		}

		function labels(addons) {
			var state = this;
			var defaults = {
				ready: 'submit',
				busy: 'sending',
				error: 'error',
				success: 'success',
			};
			if (addons) {
				angular.extend(defaults, addons);
			}
			var label = defaults.ready;
			if (state.isBusy) {
				label = defaults.busy;
			} else if (state.isSuccess) {
				label = defaults.success;
			} else if (state.isError) {
				label = defaults.error;
			}
			return label;
		}

		function ready() {
			var state = this;
			state.idle();
			state.isReady = true;
			$rootScope.$broadcast('$stateReady', state);
		}

		function submitClass() {
			var state = this;
			return {
				busy: state.isBusy,
				ready: state.isReady,
				successing: state.isSuccessing,
				success: state.isSuccess,
				errorring: state.isErroring,
				error: state.isError,
			};
		}

		function success() {
			var state = this;
			state.isBusy = false;
			state.isError = false;
			state.isErroring = false;
			state.isSuccess = true;
			state.isSuccessing = true;
			state.errors = [];
			$timeout(function() {
				state.isSuccessing = false;
			}, DELAY);
		}

    }]);

}());
