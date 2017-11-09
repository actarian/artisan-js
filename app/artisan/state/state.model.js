/* global angular */

(function() {
    "use strict";

    var app = angular.module('artisan');

    app.factory('State', ['$timeout', function($timeout) {
        var DELAY = 2000;

        function State() {
            this.errors = [];
            this.isReady = false;
            this.idle();
        }

        State.prototype = {
            idle: function() {
                var state = this;
                state.isBusy = false;
                state.isError = false;
                state.isErroring = false;
                state.isSuccess = false;
                state.isSuccessing = false;
                state.button = null;
                state.errors = [];
            },
            busy: function() {
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
            },
            error: function error(error) {
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
            },
            ready: function ready() {
                var state = this;
                state.idle();
                state.isReady = true;
            },
            success: function success() {
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
            },
            enabled: function enabled() {
                var state = this;
                return !state.isBusy && !state.isErroring && !state.isSuccessing;
            },
            errorMessage: function errorMessage() {
                var state = this;
                return state.isError ? state.errors[state.errors.length - 1] : null;
            },
            submitClass: function submitClass() {
                var state = this;
                return {
                    busy: state.isBusy,
                    ready: state.isReady,
                    successing: state.isSuccessing,
                    success: state.isSuccess,
                    errorring: state.isErroring,
                    error: state.isError,
                };
            },
            labels: function labels(addons) {
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
            },
            classes: function classes(addons) {
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
        };

        return State;
    }]);

}());