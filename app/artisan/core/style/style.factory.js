/* global angular */

(function () {
	"use strict";

	var transformProperty = detectTransformProperty();

	var app = angular.module('artisan');

	app.factory('Style', [function () {
		function Style() {
			this.props = {
				scale: 1,
				hoverScale: 1,
				currentScale: 1,
			};
		}

		Style.prototype = {
			set: function (element) {
				var styles = [];
				for (var key in this) {
					if (key !== 'props') {
						styles.push(key + ':' + this[key]);
					}
				}
				element.style.cssText = styles.join(';') + ';';
			},
			transform: function (transform) {
				this[transformProperty] = transform;
			},
			transformOrigin: function (x, y) {
				this[transformProperty + '-origin-x'] = (Math.round(x * 1000) / 1000) + '%';
				this[transformProperty + '-origin-y'] = (Math.round(y * 1000) / 1000) + '%';
			},
		};

		return Style;
    }]);

	function detectTransformProperty() {
		var transformProperty = 'transform',
			safariPropertyHack = 'webkitTransform';
		var div = document.createElement("DIV");
		if (typeof div.style[transformProperty] !== 'undefined') {
            ['webkit', 'moz', 'o', 'ms'].every(function (prefix) {
				var e = '-' + prefix + '-transform';
				if (typeof div.style[e] !== 'undefined') {
					transformProperty = e;
					return false;
				}
				return true;
			});
		} else if (typeof div.style[safariPropertyHack] !== 'undefined') {
			transformProperty = '-webkit-transform';
		} else {
			transformProperty = undefined;
		}
		return transformProperty;
	}

}());
