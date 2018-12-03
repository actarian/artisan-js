/* global angular */

(function() {
	"use strict";

	var app = angular.module('artisan');

	app.directive('nav', ['$parse', 'Nav', function($parse, Nav) {

		var directive = {
			restrict: 'A',
			templateUrl: function(element, attributes) {
				return attributes.template || 'artisan/components/nav/partial/nav';
			},
			scope: {
				items: '=nav',
			},
			link: NavLink,
		};

		return directive;

		function NavLink(scope, element, attributes, model) {
			scope.$watch('items', function(value) {
				// console.log(value instanceof Nav, value);
				if (value) {
					if (angular.isArray(value)) {
						var onPath = $parse(attributes.onPath)(scope.$parent);
						var onNav = $parse(attributes.onNav)(scope.$parent);
						var nav = new Nav({
							onPath: onPath,
							onNav: onNav
						});
						nav.setItems(value);
						scope.item = nav;

					} else if (value instanceof Nav) {
						scope.item = value;
					}
				}
			});
		}

    }]);

	app.directive('navItem', ['$timeout', 'Events', function($timeout, Events) {

		var directive = {
			restrict: 'A',
			templateUrl: function(element, attributes) {
				return attributes.template || 'artisan/components/nav/partial/nav-item';
			},
			scope: {
				item: '=navItem',
			},
			link: NavItemLink,
		};

		return directive;

		function NavItemLink(scope, element, attributes, model) {
			var navItem = angular.element(element[0].querySelector('.nav-link'));

			var output;

			function itemOpen(item, immediate) {
				var state = item.$nav.state;
				state.active = true;
				$timeout(function() {
					state.immediate = immediate;
					state.closed = state.closing = false;
					state.opening = true;
					$timeout(function() {
						state.opening = false;
						state.opened = true;
					});
				});
			}

			function itemClose(item, immediate) {
				var state = item.$nav.state;
				state.active = false;
				$timeout(function() {
					state.immediate = immediate;
					state.opened = state.opening = false;
					state.closing = true;
					$timeout(function() {
						state.closing = false;
						state.closed = true;
					});
				});
				if (item.items) {
					angular.forEach(item.items, function(o) {
						itemClose(o, true);
					});
				}
			}

			function itemToggle(item) {
				// console.log('itemToggle', item);
				var state = item.$nav.state;
				state.active = item.items ? !state.active : true;
				if (state.active) {
					if (item.$nav.parent) {
						angular.forEach(item.$nav.parent.items, function(o) {
							if (o !== item) {
								itemClose(o, true);
							}
						});
					}
					itemOpen(item);
				} else {
					itemClose(item);
				}
				// console.log(state);
			}

			function onDown(e) {
				var item = scope.item;
				// console.log('Item.onDown', item);
				var state = item.$nav.state;
				if (state.active) {
					output = false;
					trigger();
				} else if (item.$nav.onNav) {
					var promise = item.$nav.onNav(item, item.$nav);
					if (promise && typeof promise.then === 'function') {
						promise.then(function(resolved) {
							// go on
							trigger();
						}, function(rejected) {
							// do nothing
						});
						output = false;
					} else {
						output = promise;
						trigger();
					}
				}

				function trigger() {
					$timeout(function() {
						itemToggle(item);
					});
				}
				// preventDefault(e);
			}

			function onClick(e) {
				// console.log('Item.onClick', e);
				return preventDefault(e);
			}

			function preventDefault(e) {
				if (output === false) {
					// console.log('Item.preventDefault', e);
					e.stop();
					// e.preventDefault();
					// e.stopPropagation();
					return false;
				}
			}
			var events = new Events(navItem).add({
				down: onDown,
				click: onClick,
			}, scope);
		}

    }]);

	app.directive('navTo', ['$parse', '$timeout', 'Events', function($parse, $timeout, Events) {

		var directive = {
			restrict: 'A',
			link: NavToLink
		};

		return directive;

		function NavToLink(scope, element, attributes) {
			function onDown(e) {
				console.log('navTo.onDown', attributes.navTo);
				$timeout(function() {
					var callback = $parse(attributes.navTo);
					callback(scope);
				});
				e.preventDefault();
				return false;
			}
			var events = new Events(element).add({
				down: onDown,
			}, scope);
		}

    }]);

}());
