/* global angular */

(function() {
	"use strict";

	var app = angular.module('artisan');

	app.directive('controlMessages', [function() {
		return {
			restrict: 'E',
			templateUrl: 'artisan/components/forms/partial/messages',
			transclude: {
				'message': '?messageItems',
			},
			link: function(scope, element, attributes, model) {}
		};
    }]);

	app.directive('control', ['$parse', function($parse) {
		function formatLabel(string, prepend, expression) {
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
		var uniqueId = 0;
		return {
			restrict: 'A',
			templateUrl: function(element, attributes) {
				var template = 'artisan/components/forms/partial/text';
				switch (attributes.control) {
					case 'select':
						template = 'artisan/components/forms/partial/select';
						break;
				}
				return template;
			},
			scope: {
				ngModel: '=',
				required: '=',
				form: '@',
				title: '@',
				placeholder: '@',
				source: '=?',
				key: '@?',
				label: '@?',
			},
			require: 'ngModel',
			transclude: true,
			link: {
				pre: function preLink(scope, element, attributes, controller, transclude) {
					var label = scope.label = (scope.label ? scope.label : 'name');
					var key = scope.key = (scope.key ? scope.key : 'id');
					if (attributes.control === 'select') {
						var filter = (attributes.filter ? '| ' + attributes.filter : '');
						var optionLabel = formatLabel(label, 'item.', true);
						scope.getOptions = function() {
							return attributes.number ?
								'item.' + key + ' as ' + optionLabel + ' disable when item.disabled for item in source ' + filter :
								optionLabel + ' disable when item.disabled for item in source ' + filter + ' track by item.' + key;
						};
					}
					var type = scope.type = attributes.control;
					var form = scope.form = scope.form || 'form';
					var title = scope.title = scope.title || 'untitled';
					var placeholder = scope.placeholder = scope.placeholder || title;
					var field = scope.field = title.replace(/[^0-9a-zA-Z]/g, "").split(' ').join('') + (++uniqueId);
					scope.format = attributes.format || null;
					scope.precision = attributes.precision || null;
					scope.validate = attributes.validate || attributes.control;
					scope.minLength = attributes.minLength || 0;
					scope.maxLength = attributes.maxLength || Number.POSITIVE_INFINITY;
					scope.min = attributes.min || null;
					scope.max = attributes.max || null;
					scope.options = $parse(attributes.options)(scope) || {};
					scope.focus = false;
					scope.visible = false;
					scope.onChange = function(model) {
						$parse(attributes.onChange)(scope.$parent);
					};
					scope.onFilter = function(model) {
						$parse(attributes.onFilter)(scope.$parent);
					};
					scope.getType = function() {
						var type = 'text';
						switch (attributes.control) {
							case 'password':
								type = scope.visible ? 'text' : 'password';
								break;
							default:
								type = attributes.control;
						}
						return type;
					};
					scope.getClasses = function() {
						var form = $parse(scope.form)(scope.$parent);
						var field = $parse(scope.form + '.' + scope.field)(scope.$parent);
						return {
							'control-focus': scope.focus,
							'control-success': field.$valid,
							'control-error': field.$invalid && (form.$submitted || field.$touched),
							'control-empty': !field.$viewValue
						};
					};
					scope.getMessages = function() {
						var form = $parse(scope.form)(scope.$parent);
						var field = $parse(scope.form + '.' + scope.field)(scope.$parent);
						return (form.$submitted || field.$touched) && field.$error;
					};
					scope.toggleVisibility = function() {
						scope.visible = !scope.visible;
					};
				},
			},
		};
    }]);

	app.directive('_control', ['$http', '$templateCache', '$compile', '$parse', function($http, $templateCache, $compile, $parse) {
		function formatLabel(string, prepend, expression) {
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
		var uniqueId = 0;
		return {
			restrict: 'A',
			templateUrl: function(element, attributes) {
				var template = 'artisan/components/forms/partial/text';
				switch (attributes.control) {
					case 'select':
						template = 'artisan/components/forms/partial/select';
						break;
				}
				return template;
			},
			scope: {
				ngModel: '=',
				required: '=',
				form: '@',
				title: '@',
				placeholder: '@',
			},
			require: 'ngModel',
			/*
			link: function(scope, element, attributes, model) {
			},
			*/
			compile: function(element, attributes) {
				return {
					pre: function(scope, element, attributes) {
						if (attributes.control === 'select') {
							var label = (attributes.label ? attributes.label : 'name');
							var key = (attributes.key ? attributes.key : 'id');
							var filter = (attributes.min ? ' | filter:gte(\'' + key + '\', ' + attributes.min + ')' : '');
							var optionLabel = formatLabel(label, 'item.', true);
							scope.options = attributes.number ?
								'item.' + key + ' as ' + optionLabel + ' disable when item.disabled for item in ' + attributes.source + filter :
								optionLabel + ' disable when item.disabled for item in ' + attributes.source + filter + ' track by item.' + key;
							console.log('control.compile.pre', scope.options);
						}
						var type = scope.type = attributes.control;
						var form = scope.form = scope.form || 'form';
						var title = scope.title = scope.title || 'untitled';
						var placeholder = scope.placeholder = scope.placeholder || title;
						var field = scope.field = title.replace(/[^0-9a-zA-Z]/g, "").split(' ').join('') + (++uniqueId);
						scope.validate = attributes.validate || attributes.control;
						scope.format = attributes.format || null;
						scope.precision = attributes.precision || null;
						scope.validate = attributes.validate || attributes.control;
						scope.minLength = attributes.min || 0;
						scope.maxLength = attributes.max || Number.POSITIVE_INFINITY;
						scope.options = $parse(attributes.options)(scope) || {};
						scope.focus = false;
						scope.visible = false;
						scope.getType = function() {
							var type = 'text';
							switch (attributes.control) {
								case 'password':
									// var form = $parse(scope.form)(scope.$parent);
									// var field = $parse(scope.form + '.' + scope.field)(scope.$parent);
									type = scope.visible ? 'text' : 'password';
									break;
								default:
									type = attributes.control;
							}
							// console.log('control.getType', type);
							return type;
						};
						scope.getClasses = function() {
							var form = $parse(scope.form)(scope.$parent);
							var field = $parse(scope.form + '.' + scope.field)(scope.$parent);
							return {
								'control-focus': scope.focus,
								'control-success': field.$valid,
								'control-error': field.$invalid && (form.$submitted || field.$touched),
								'control-empty': !field.$viewValue
							};
						};
						scope.getMessages = function() {
							var form = $parse(scope.form)(scope.$parent);
							var field = $parse(scope.form + '.' + scope.field)(scope.$parent);
							return (form.$submitted || field.$touched) && field.$error;
						};
					},
					// post: function (scope, element, attributes) { }
				};
			}
			/*
			compile: function(element, attributes) {
			    element.removeAttr('my-dir');
			    element.attr('ng-hide', 'true');
			    return function(scope) {
			        $compile(element)(scope);
			    };
			},
			*/
		};
    }]);

	app.directive('numberPicker', ['$parse', '$timeout', function($parse, $timeout) {
		return {
			restrict: 'A',
			template: '<div class="input-group">' +
				'   <span class="input-group-btn"><button class="btn btn-outline-primary" type="button">-</button></span>' +
				'   <div ng-transclude></div>' +
				'   <span class="input-group-btn"><button class="btn btn-outline-primary" type="button">+</button></span>' +
				'</div>',
			replace: true,
			transclude: true,
			link: function(scope, element, attributes, model) {
				var node = element[0];
				var nodeRemove = node.querySelectorAll('.input-group-btn > .btn')[0];
				var nodeAdd = node.querySelectorAll('.input-group-btn > .btn')[1];

				function onRemove(e) {
					var min = $parse(attributes.min)(scope);
					var getter = $parse(attributes.numberPicker);
					var setter = getter.assign;
					$timeout(function() {
						setter(scope, Math.max(min, getter(scope) - 1));
					});
					// console.log('numberPicker.onRemove', min);
				}

				function onAdd(e) {
					var max = $parse(attributes.max)(scope);
					var getter = $parse(attributes.numberPicker);
					var setter = getter.assign;
					$timeout(function() {
						setter(scope, Math.min(max, getter(scope) + 1));
					});
					// console.log('numberPicker.onAdd', max);
				}

				function addListeners() {
					angular.element(nodeRemove).on('touchstart mousedown', onRemove);
					angular.element(nodeAdd).on('touchstart mousedown', onAdd);
				}

				function removeListeners() {
					angular.element(nodeRemove).off('touchstart mousedown', onRemove);
					angular.element(nodeAdd).off('touchstart mousedown', onAdd);
				}
				scope.$on('$destroy', function() {
					removeListeners();
				});
				addListeners();
			}
		};
    }]);

}());
