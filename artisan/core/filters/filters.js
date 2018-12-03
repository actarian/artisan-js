/* global angular, app, Autolinker */
(function() {

	"use strict";

	var app = angular.module('artisan');

	app.filter('notIn', ['$filter', function($filter) {
		return function(array, filters, element) {
			if (filters) {
				return $filter("filter")(array, function(item) {
					for (var i = 0; i < filters.length; i++) {
						if (filters[i][element] === item[element]) return false;
					}
					return true;
				});
			}
		};
    }]);

	app.filter('autolink', [function() {
		return function(value) {
			return Autolinker.link(value, {
				className: "a-link"
			});
		};
    }]);

	app.filter('shortName', ['$filter', function($filter) {
		function toTitleCase(str) {
			return str.replace(/\w\S*/g, function(txt) {
				return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
			});
		}
		return function(value) {
			if (!value) {
				return '';
			}
			if (value.indexOf(' .') === value.length - 2) {
				value = value.split(' .').join('');
			}
			/*
			var splitted;
			if (value.indexOf('.') !== -1) {
			    splitted = value.split('.');
			} else {
			    splitted = value.split(' ');
			}
			*/
			var splitted = value.split(' ');
			var firstName = splitted.shift();
			if (splitted.length) {
				var lastName = splitted.join(' ');
				return firstName.substr(0, 1).toUpperCase() + '.' + toTitleCase(lastName);
			} else {
				return firstName;
			}
		};
    }]);

	app.filter('customCurrency', ['$filter', function($filter) {
		var legacyFilter = $filter('currency');
		return function(cost, currency) {
			return legacyFilter(cost * currency.ratio, currency.formatting);
		};
    }]);

	app.filter('customSize', ['APP', function(APP) {
		return function(inches) {
			if (APP.unit === APP.units.IMPERIAL) {
				var feet = Math.floor(inches / 12);
				inches = inches % 12;
				inches = Math.round(inches * 10) / 10;
				return (feet ? feet + '\' ' : '') + (inches + '\'\'');
			} else {
				var meters = Math.floor(inches * APP.size.ratio);
				var cm = (inches * APP.size.ratio * 100) % 100;
				cm = Math.round(cm * 10) / 10;
				return (meters ? meters + 'm ' : '') + (cm + 'cm');
			}
		};
    }]);

	app.filter('customWeight', ['APP', function(APP) {
		return function(pounds) {
			if (APP.unit === APP.units.IMPERIAL) {
				if (pounds < 1) {
					var oz = pounds * 16;
					oz = Math.round(oz * 10) / 10;
					return (oz ? oz + 'oz ' : '');
				} else {
					pounds = Math.round(pounds * 100) / 100;
					return (pounds ? pounds + 'lb ' : '');
				}
			} else {
				var kg = Math.floor(pounds * APP.weight.ratio / 1000);
				var grams = (pounds * APP.weight.ratio) % 1000;
				grams = Math.round(grams * 10) / 10;
				return (kg ? kg + 'kg ' : '') + (grams + 'g');
			}
		};
    }]);

	app.filter('customNumber', ['$filter', function($filter) {
		return function(value, precision, unit) {
			unit = unit || '';
			// return ((value || value === 0) ? $filter('number')(value, precision) + unit : '-');
			if (value !== undefined) {
				if (Math.floor(value) === value) {
					precision = 0;
				}
				value = $filter('number')(value, precision) + unit;
			} else {
				value = '-';
			}
			return value;
		};
    }]);

	app.filter('reportNumber', ['$filter', function($filter) {
		return function(value, precision, unit) {
			unit = unit || '';
			if (value !== undefined) {
				value = $filter('number')(value, precision) + unit;
			} else {
				value = '-';
			}
			return value;
		};
    }]);

	app.filter('customHours', [function() {
		return function(value) {
			if (value !== undefined) {
				var hours = Math.floor(value);
				var minutes = Math.floor((value - hours) * 60);
				var label = hours ? hours + ' H' : '';
				label += minutes ? ' ' + minutes + ' m' : '';
				return label;
			} else {
				return '-';
			}
		};
    }]);

	app.filter('customTimer', [function() {
		var second = 1000;
		var minute = second * 60;
		var hour = minute * 60;
		return function(value) {
			if (value !== undefined) {
				var hours = Math.floor(value / hour);
				var minutes = Math.floor((value - hours * hour) / minute);
				var seconds = Math.floor((value - hours * hour - minutes * minute) / second);
				var label = hours ? hours + ' H' : '';
				label += minutes ? ' ' + minutes + ' m' : '';
				label += seconds ? ' ' + seconds + ' s' : '';
				return label;
			} else {
				return '-';
			}
		};
    }]);

	app.filter('customDigitalTimer', [function() {
		var second = 1000;
		var minute = second * 60;
		var hour = minute * 60;
		return function(value) {
			if (value !== undefined) {
				var hours = Math.floor(value / hour);
				var minutes = Math.floor((value - hours * hour) / minute);
				var seconds = Math.floor((value - hours * hour - minutes * minute) / second);
				// hours = hours % 24;
				return (hours < 10 ? '0' : '') + hours + ':' + (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
			} else {
				return '-';
			}
		};
    }]);

	app.filter('customDigitalTime', [function() {
		var second = 1000;
		var minute = second * 60;
		var hour = minute * 60;
		return function(value) {
			if (value !== undefined) {
				var hours = Math.floor(value / hour);
				var minutes = Math.floor((value - hours * hour) / minute);
				// hours = hours % 24;
				return (hours < 10 ? '0' : '') + hours + ':' + (minutes < 10 ? '0' : '') + minutes;
			} else {
				return '-';
			}
		};
    }]);

	app.filter('customDate', ['$filter', function($filter) {
		var filter = $filter('date');
		return function(value, format, timezone) {
			return value ? filter(value, format, timezone) : '-';
		};
    }]);

	app.filter('customTime', ['$filter', function($filter) {
		return function(value, placeholder) {
			if (value) {
				return Utils.parseTime(value);
			} else {
				return (placeholder ? placeholder : '-');
			}
		};
    }]);

	app.filter('customDigital', ['$filter', function($filter) {
		return function(value, placeholder) {
			if (value) {
				return Utils.parseHour(value);
			} else {
				return (placeholder ? placeholder : '-');
			}
		};
    }]);

	app.filter('customString', ['$filter', function($filter) {
		return function(value, placeholder) {
			return value ? value : (placeholder ? placeholder : '-');
		};
    }]);

	app.filter('customEnum', function() {
		return function(val) {
			val = val + 1;
			return val < 10 ? '0' + val : val;
		};
	});

	app.filter('groupBy', ['$parse', 'filterWatcher', function($parse, filterWatcher) {
		function _groupBy(collection, getter) {
			var dict = {};
			var key;
			angular.forEach(collection, function(item) {
				key = getter(item);
				if (!dict[key]) {
					dict[key] = [];
				}
				dict[key].push(item);
			});
			return dict;
		}
		return function(collection, property) {
			if (!angular.isObject(collection) || angular.isUndefined(property)) {
				return collection;
			}
			return filterWatcher.isMemoized('groupBy', arguments) || filterWatcher.memoize('groupBy', arguments, this, _groupBy(collection, $parse(property)));
		};
    }]);

	app.filter('htmlToPlaintext', function() {
		function getStyle(n, p) {
			return n.currentStyle ? n.currentStyle[p] : window.getComputedStyle(n, null).getPropertyValue(p);
		}

		function toText(node) {
			var result = '';
			if (node.nodeType == document.TEXT_NODE) {
				var nodeValue = node.nodeValue;
				result = nodeValue;
				result = result ? String(result).replace(/</gm, '&lt;') : '';
				result = result ? String(result).replace(/>/gm, '&gt;') : '';
			} else if (node.nodeType == document.ELEMENT_NODE) {
				for (var i = 0, j = node.childNodes.length; i < j; i++) {
					result += toText(node.childNodes[i]);
				}
				var display = getStyle(node, 'display');
				if (display.match(/^block/) || display.match(/list/) || display.match(/row/) || node.tagName == 'BR' || node.tagName == 'HR') {
					result += '\n<br>';
				}
			}
			return result;
		}
		return function(html) {
			console.log(html);
			var div = document.createElement('div');
			div.innerHTML = html;
			return toText(div);
			// return html ? String(html).replace(/<[^>]+>/gm, '') : '';
		};
	});

}());
