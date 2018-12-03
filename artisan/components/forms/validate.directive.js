/* global angular */

(function() {
	"use strict";

	var app = angular.module('artisan');

	app.directive('validate', ['$filter', function($filter) {
		return {
			require: 'ngModel',
			link: function(scope, element, attributes, model) {
				var type = attributes.validate;
				var format = attributes.format || '';
				var precision = attributes.precision || 2;
				var focus = false;
				// console.log('validate', type);
				switch (type) {
					case 'date':
					case 'datetime':
					case 'datetime-local':
						model.$formatters.push(function(value) {
							if (value) {
								return $filter('date')(value, format);
							} else {
								return null;
							}
						});
						break;
					case 'number':
						model.$parsers.unshift(function(value) {
							var valid = false;
							if (value !== undefined && value !== "") {
								valid = String(value).indexOf(Number(value).toString()) !== -1; // isFinite(value); //
								value = Number(value);
								model.$setValidity('number', valid);
								if (valid) {
									model.$setValidity('positive', value >= 0.01);
									if (attributes.min !== undefined) {
										model.$setValidity('range', value >= Number(attributes.min));
									}
									if (attributes.max !== undefined) {
										model.$setValidity('range', value <= Number(attributes.max));
									}
								}
							} else {
								valid = true;
								value = Number(value);
								model.$setValidity('number', true);
								model.$setValidity('positive', true);
								if (attributes.min !== undefined) {
									model.$setValidity('range', true);
								}
								if (attributes.max !== undefined) {
									model.$setValidity('range', true);
								}
							}
							return value;
						});
						model.$formatters.push(function(value) {
							if (value) {
								return $filter('number')(value, precision) + ' ' + format;
							} else {
								return null;
							}
						});
						break;
					case 'anynumber':
						model.$parsers.unshift(function(value) {
							var valid = false;
							if (value !== undefined && value !== "") {
								valid = String(value).indexOf(Number(value).toString()) !== -1; // isFinite(value); //
								value = Number(value);
								model.$setValidity('number', valid);
								if (valid) {
									if (attributes.min !== undefined) {
										model.$setValidity('range', value >= Number(attributes.min));
									}
									if (attributes.max !== undefined) {
										model.$setValidity('range', value <= Number(attributes.max));
									}
								}
							} else {
								valid = true;
								value = Number(value);
								model.$setValidity('number', true);
								if (attributes.min !== undefined) {
									model.$setValidity('range', true);
								}
								if (attributes.max !== undefined) {
									model.$setValidity('range', true);
								}
							}
							return value;
						});
						model.$formatters.push(function(value) {
							if (value || value === 0) {
								return $filter('number')(value, precision) + ' ' + format;
							} else {
								return null;
							}
						});
						break;
				}

				function onFocus() {
					focus = true;
					if (format) {
						element[0].value = model.$modelValue || null;
						if (!model.$modelValue) {
							model.$setViewValue(null);
						}
					}
				}

				function doBlur() {
					if (format && !model.$invalid) {
						switch (type) {
							case 'date':
							case 'datetime':
							case 'datetime-local':
								element[0].value = model.$modelValue ? $filter('date')(model.$modelValue, format) : ' ';
								break;
							default:
								element[0].value = model.$modelValue ? $filter('number')(model.$modelValue, precision) + ' ' + format : ' ';
								break;
						}
					}
				}

				function onBlur() {
					focus = false;
					doBlur();
				}

				function addListeners() {
					element.on('focus', onFocus);
					element.on('blur', onBlur);
				}

				function removeListeners() {
					element.off('focus', onFocus);
					element.off('blur', onBlur);
				}
				scope.$on('$destroy', function() {
					removeListeners();
				});
				addListeners();
			}
		};
    }]);

}());
