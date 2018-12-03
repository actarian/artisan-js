/* global angular */

(function() {
	"use strict";

	var app = angular.module('artisan');

	app.service('Utils', ['$compile', '$controller', 'Vector', function($compile, $controller, Vector) {

		var service = this;

		var statics = {
			compileController: compileController,
			extract: extract,
			format: format,
			indexOf: indexOf,
			reducer: reducer,
			reducerAdder: reducerAdder,
			reducerSetter: reducerSetter,
			removeValue: removeValue,
			reverseSortOn: reverseSortOn,
			throttle: throttle,
			toMd5: toMd5,
			where: where,
		};

		angular.extend(service, statics);

		var getNow = Date.now || function() {
			return new Date().getTime();
		};

		function compileController(scope, element, html, data) {
			// console.log('Utils.compileController', element);
			element.html(html);
			var link = $compile(element.contents());
			if (data.controller) {
				var $scope = scope.$new();
				angular.extend($scope, data);
				var controller = $controller(data.controller, {
					$scope: $scope
				});
				if (data.controllerAs) {
					scope[data.controllerAs] = controller;
				}
				element.data('$ngControllerController', controller);
				element.children().data('$ngControllerController', controller);
				scope = $scope;
			}
			link(scope);
		}

		function extract(obj, value) {
			return Object.keys(obj)[Object.values(obj).indexOf(value)];
		}

		function format(string, prepend, expression) {
			string = string || '';
			prepend = prepend || '';
			var splitted = string.split(',');
			if (splitted.length > 1) {
				var formatted = splitted.shift();
				angular.forEach(splitted, function(value, index) {
					if (expression) {
						formatted = formatted.split('{' + index + '}').join('\' + ' + prepend + value + ' + \'');
					} else {
						formatted = formatted.split('{' + index + '}').join(prepend + value);
					}
				});
				if (expression) {
					return '\'' + formatted + '\'';
				} else {
					return formatted;
				}
			} else {
				return prepend + string;
			}
		}

		function indexOf(array, object, key) {
			key = key || 'id';
			var index = -1;
			if (array) {
				var i = 0,
					t = array.length;
				while (i < t) {
					if (array[i] && array[i][key] === object[key]) {
						index = i;
						break;
					}
					i++;
				}
			}
			return index;
		}

		function reducer(o, key) {
			return o[key];
		}

		function reducerAdder(o, key, value) {
			if (typeof key == 'string') {
				return reducerAdder(o, key.split('.'), value);
			} else if (key.length == 1 && value !== undefined) {
				return (o[key[0]] += value);
			} else if (key.length === 0) {
				return o;
			} else {
				return reducerAdder(o[key[0]], key.slice(1), value);
			}
		}

		function reducerSetter(o, key, value) {
			if (typeof key == 'string') {
				return reducerSetter(o, key.split('.'), value);
			} else if (key.length == 1 && value !== undefined) {
				return (o[key[0]] = value);
			} else if (key.length === 0) {
				return o;
			} else {
				return reducerSetter(o[key[0]], key.slice(1), value);
			}
		}

		function removeValue(array, value) {
			var index = -1;
			if (array) {
				var i = 0,
					t = array.length;
				while (i < t) {
					if (array[i] === value) {
						index = i;
						break;
					}
					i++;
				}
			}
			if (index !== -1) {
				array.splice(index, 1);
				return value;
			} else {
				return null;
			}
		}

		function reverseSortOn(key) {
			return function(a, b) {
				if (a[key] < b[key]) {
					return 1;
				}
				if (a[key] > b[key]) {
					return -1;
				}
				// a must be equal to b
				return 0;
			};
		}

		function throttle(func, wait, options) {
			// Returns a function, that, when invoked, will only be triggered at most once
			// during a given window of time. Normally, the throttled function will run
			// as much as it can, without ever going more than once per `wait` duration;
			// but if you'd like to disable the execution on the leading edge, pass
			// `{leading: false}`. To disable execution on the trailing edge, ditto.
			var context, args, result;
			var timeout = null;
			var previous = 0;
			if (!options) options = {};
			var later = function() {
				previous = options.leading === false ? 0 : getNow();
				timeout = null;
				result = func.apply(context, args);
				if (!timeout) context = args = null;
			};
			return function() {
				var now = getNow();
				if (!previous && options.leading === false) previous = now;
				var remaining = wait - (now - previous);
				context = this;
				args = arguments;
				if (remaining <= 0 || remaining > wait) {
					if (timeout) {
						clearTimeout(timeout);
						timeout = null;
					}
					previous = now;
					result = func.apply(context, args);
					if (!timeout) context = args = null;
				} else if (!timeout && options.trailing !== false) {
					timeout = setTimeout(later, remaining);
				}
				return result;
			};
		}

		function toMd5(string) {
			// return Md5.encode(string);
		}

		function where(array, query) {
			var found = null;
			if (array) {
				angular.forEach(array, function(item) {
					var has = true;
					angular.forEach(query, function(value, key) {
						has = has && item[key] === value;
					});
					if (has) {
						found = item;
					}
				});
			}
			return found;
		}

    }]);

	(function() {
		// POLYFILL Array.prototype.reduce
		// Production steps of ECMA-262, Edition 5, 15.4.4.21
		// Reference: http://es5.github.io/#x15.4.4.21
		// https://tc39.github.io/ecma262/#sec-array.prototype.reduce
		if (typeof Array.prototype.reduce !== 'function') {
			Object.defineProperty(Array.prototype, 'reduce', {
				value: function(callback) { // , initialvalue
					if (this === null) {
						throw new TypeError('Array.prototype.reduce called on null or undefined');
					}
					if (typeof callback !== 'function') {
						throw new TypeError(callback + ' is not a function');
					}
					var o = Object(this);
					var len = o.length >>> 0;
					var k = 0;
					var value;
					if (arguments.length == 2) {
						value = arguments[1];
					} else {
						while (k < len && !(k in o)) {
							k++;
						}
						if (k >= len) {
							throw new TypeError('Reduce of empty array with no initial value');
						}
						value = o[k++];
					}
					while (k < len) {
						if (k in o) {
							value = callback(value, o[k], k, o);
						}
						k++;
					}
					return value;
				}
			});
		}
	}());

	(function() {
		// POLYFILL Object.values
		if (typeof Object.values !== 'function') {
			Object.defineProperty(Object, 'values', {
				value: function(obj) {
					var vals = [];
					for (var key in obj) {
						if (has(obj, key) && isEnumerable(obj, key)) {
							vals.push(obj[key]);
						}
					}
					return vals;
				}
			});
		}
	}());

}());
