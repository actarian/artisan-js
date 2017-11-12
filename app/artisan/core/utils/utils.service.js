/* global angular */

(function () {
	"use strict";

	var app = angular.module('artisan');

	app.factory('Vector', function () {
		function Vector(x, y) {
			this.x = x || 0;
			this.y = y || 0;
		}
		Vector.make = function (a, b) {
			return new Vector(b.x - a.x, b.y - a.y);
		};
		Vector.size = function (a) {
			return Math.sqrt(a.x * a.x + a.y * a.y);
		};
		Vector.normalize = function (a) {
			var l = Vector.size(a);
			a.x /= l;
			a.y /= l;
			return a;
		};
		Vector.incidence = function (a, b) {
			var angle = Math.atan2(b.y, b.x) - Math.atan2(a.y, a.x);
			// if (angle < 0) angle += 2 * Math.PI;
			// angle = Math.min(angle, (Math.PI * 2 - angle));
			return angle;
		};
		Vector.distance = function (a, b) {
			return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
		};
		Vector.cross = function (a, b) {
			return (a.x * b.y) - (a.y * b.x);
		};
		Vector.difference = function (a, b) {
			return new Vector(a.x - b.x, a.y - b.y);
		};
		Vector.power = function (a, b) {
			var x = Math.abs(b.x - a.x);
			var y = Math.abs(b.y - a.y);
			return (x + y) / 2;
		};
		Vector.prototype = {
			size: function () {
				return Vector.size(this);
			},
			normalize: function () {
				return Vector.normalize(this);
			},
			incidence: function (b) {
				return Vector.incidence(this, b);
			},
			cross: function (b) {
				return Vector.cross(this, b);
			},
			distance: function (b) {
				return Vector.distance(this, b);
			},
			difference: function (b) {
				return Vector.difference(this, b);
			},
			power: function () {
				return (Math.abs(this.x) + Math.abs(this.y)) / 2;
			},
			towards: function (b, friction) {
				friction = friction || 0.125;
				this.x += (b.x - this.x) * friction;
				this.y += (b.y - this.y) * friction;
				return this;
			},
			add: function (b) {
				this.x += b.x;
				this.y += b.y;
				return this;
			},
			friction: function (b) {
				this.x *= b;
				this.y *= b;
				return this;
			},
			copy: function (b) {
				return new Vector(this.x, this.y);
			},
			toString: function () {
				return '{' + this.x + ',' + this.y + '}';
			},
		};
		return Vector;
	});

	app.factory('Utils', ['$compile', '$controller', 'Vector', function ($compile, $controller, Vector) {

		(function () {
			// POLYFILL Array.prototype.reduce
			// Production steps of ECMA-262, Edition 5, 15.4.4.21
			// Reference: http://es5.github.io/#x15.4.4.21
			// https://tc39.github.io/ecma262/#sec-array.prototype.reduce
			if (!Array.prototype.reduce) {
				Object.defineProperty(Array.prototype, 'reduce', {
					value: function (callback) { // , initialvalue
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
		var _isTouch;
		var getNow = Date.now || function () {
			return new Date().getTime();
		};
		var ua = window.navigator.userAgent.toLowerCase();
		var safari = ua.indexOf('safari') !== -1 && ua.indexOf('chrome') === -1;
		var msie = ua.indexOf('trident') !== -1 || ua.indexOf('edge') !== -1 || ua.indexOf('msie') !== -1;
		var chrome = !safari && !msie && ua.indexOf('chrome') !== -1;
		var mobile = ua.indexOf('mobile') !== -1;
		var isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
		var isSafari = navigator.userAgent.toLowerCase().indexOf('safari') > -1;

		function Utils() {}
		Utils.reverseSortOn = reverseSortOn;
		Utils.getTouch = getTouch;
		Utils.getRelativeTouch = getRelativeTouch;
		Utils.getClosest = getClosest;
		Utils.getClosestElement = getClosestElement;
		Utils.getParents = getParents;
		Utils.throttle = throttle;
		Utils.where = where;
		Utils.format = format;
		Utils.compileController = compileController;
		Utils.reducer = reducer;
		Utils.reducerSetter = reducerSetter;
		Utils.reducerAdder = reducerAdder;
		Utils.downloadFile = downloadFile;
		Utils.serverDownload = serverDownload;
		Utils.toMd5 = function (string) {
			return Md5.encode(string);
		};
		Utils.ua = {
			safari: safari,
			msie: msie,
			chrome: chrome,
			mobile: mobile,
		};
		angular.forEach(Utils.ua, function (value, key) {
			if (value) {
				angular.element(document.getElementsByTagName('body')).addClass(key);
			}
		});
		return Utils;

		function isTouch() {
			if (!_isTouch) {
				_isTouch = {
					value: ('ontouchstart' in window || 'onmsgesturechange' in window)
				};
			}
			// console.log(_isTouch);
			return _isTouch.value;
		}

		function getTouch(e, previous) {
			var t = new Vector();
			if (e.type === 'touchstart' || e.type === 'touchmove' || e.type === 'touchend' || e.type === 'touchcancel') {
				var touch = null;
				var event = e.originalEvent ? e.originalEvent : e;
				var touches = event.touches.length ? event.touches : event.changedTouches;
				if (touches && touches.length) {
					touch = touches[0];
				}
				if (touch) {
					t.x = touch.pageX;
					t.y = touch.pageY;
				}
			} else if (e.type === 'click' || e.type === 'mousedown' || e.type === 'mouseup' || e.type === 'mousemove' || e.type === 'mouseover' || e.type === 'mouseout' || e.type === 'mouseenter' || e.type === 'mouseleave' || e.type === 'contextmenu') {
				t.x = e.pageX;
				t.y = e.pageY;
			}
			if (previous) {
				t.s = Vector.difference(t, previous);
			}
			t.type = e.type;
			return t;
		}

		function getRelativeTouch(node, point) {
			var element = angular.element(node); // passing through jqlite for accepting both
			node = element[0];
			var rect = node.getBoundingClientRect();
			// var e = new Vector(rect.left + node.scrollLeft, rect.top + node.scrollTop);
			var e = new Vector(rect.left, rect.top);
			return Vector.difference(point, e);
		}

		function getClosest(el, selector) {
			var matchesFn, parent;
            ['matches', 'webkitMatchesSelector', 'mozMatchesSelector', 'msMatchesSelector', 'oMatchesSelector'].some(function (fn) {
				if (typeof document.body[fn] == 'function') {
					matchesFn = fn;
					return true;
				}
				return false;
			});
			if (el[matchesFn](selector)) {
				return el;
			}
			while (el !== null) {
				parent = el.parentElement;
				if (parent !== null && parent[matchesFn](selector)) {
					return parent;
				}
				el = parent;
			}
			return null;
		}

		function getClosestElement(el, target) {
			var matchesFn, parent;
			if (el === target) {
				return el;
			}
			while (el !== null) {
				parent = el.parentElement;
				if (parent !== null && parent === target) {
					return parent;
				}
				el = parent;
			}
			return null;
		}

		function getParents(node, topParentNode) {
			// if no topParentNode defined will bubble up all the way to *document*
			topParentNode = topParentNode || document;
			var parents = [];
			var parentNode = node.parentNode;
			while (parentNode !== topParentNode) {
				parents.push(parentNode);
				parentNode = parentNode.parentNode;
			}
			parents.push(topParentNode); // push that topParentNode you wanted to stop at
			return parents;
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
			var later = function () {
				previous = options.leading === false ? 0 : getNow();
				timeout = null;
				result = func.apply(context, args);
				if (!timeout) context = args = null;
			};
			return function () {
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

		function where(array, query) {
			var found = null;
			if (array) {
				angular.forEach(array, function (item) {
					var has = true;
					angular.forEach(query, function (value, key) {
						has = has && item[key] === value;
					});
					if (has) {
						found = item;
					}
				});
			}
			return found;
		}

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

		function reverseSortOn(key) {
			return function (a, b) {
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

		function format(string, prepend, expression) {
			string = string || '';
			prepend = prepend || '';
			var splitted = string.split(',');
			if (splitted.length > 1) {
				var formatted = splitted.shift();
				angular.forEach(splitted, function (value, index) {
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

		function reducer(o, key) {
			return o[key];
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

		function downloadFile(content, name, type) {
			type = type || 'application/octet-stream';
			var base64 = null;
			var blob = new Blob([content], {
				type: type
			});
			var reader = new window.FileReader();
			reader.readAsDataURL(blob);
			reader.onloadend = function () {
				base64 = reader.result;
				download();
			};

			function download() {
				// If in Chrome or Safari - download via virtual link click
				// if (isChrome || isSafari) {
				//Creating new link node.
				if (document.createEvent) {
					var anchor = document.createElement('a');
					anchor.href = base64;
					if (anchor.download !== undefined) {
						//Set HTML5 download attribute. This will prevent file from opening if supported.
						var downloadName = name || base64.substring(base64.lastIndexOf('/') + 1, base64.length);
						anchor.download = downloadName;
					}
					//Dispatching click event.
					var event = document.createEvent('MouseEvents');
					event.initEvent('click', true, true);
					anchor.dispatchEvent(event);
					return true;
				}
				// }
				// Force file download (whether supported by server).
				var query = '?download';
				window.open(base64.indexOf('?') > -1 ? base64 : base64 + query, '_self');
			}

			function __download() {
				var supportsDownloadAttribute = 'download' in document.createElement('a');
				if (supportsDownloadAttribute) {
					var anchor = document.createElement('a');
					anchor.href = 'data:attachment/text;base64,' + encodeURI(window.btoa(content));
					anchor.target = '_blank';
					anchor.download = name;
					//Dispatching click event.
					if (document.createEvent) {
						var event = document.createEvent('MouseEvents');
						event.initEvent('click', true, true);
						anchor.dispatchEvent(event);
						return true;
					}
				} else if (window.Blob !== undefined && window.saveAs !== undefined) {
					var blob = new Blob([content], {
						type: type
					});
					saveAs(blob, filename);
				} else {
					window.open('data:attachment/text;charset=utf-8,' + encodeURI(content));
				}
			}
			/*
			var headers = response.headers();
			// console.log(response);
			var blob = new Blob([response.data], { type: "application/octet-stream" }); // { type: headers['content-type'] });
			var windowUrl = (window.URL || window.webkitURL);
			var downloadUrl = windowUrl.createObjectURL(blob);
			var anchor = document.createElement("a");
			anchor.href = downloadUrl;
			var fileNamePattern = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
			anchor.download = fileNamePattern.exec(headers['content-disposition'])[1];
			document.body.appendChild(anchor);
			anchor.click();
			windowUrl.revokeObjectURL(blob);
			anchor.remove();
			*/
			/*
			//Dispatching click event.
			if (document.createEvent) {
			    var e = document.createEvent('MouseEvents');
			    e.initEvent('click', true, true);
			    link.dispatchEvent(e);
			    return true;
			}
			*/
		}

		function serverDownload(options) {
			var defaults = {
				uri: '/api/reports/download',
				name: 'Filename',
				extension: 'txt',
				type: 'text/plain',
				content: 'Hello!',
			};
			options = angular.extend(defaults, options);
			var content = JSON.stringify(options); // unescape(encodeURIComponent(JSON.stringify(download)));
			var form = document.createElement('form');
			var input = document.createElement('input');
			input.name = 'download';
			input.value = content;
			form.appendChild(input);
			form.action = options.uri;
			form.method = 'POST';
			form.target = 'ProjectDownloads';
			form.enctype = 'application/x-www-form-urlencoded';
			// form.enctype = 'multipart/form-data';
			// form.enctype = 'text/plain';
			document.body.appendChild(form);
			form.submit();
			setTimeout(function () {
				document.body.removeChild(form);
			}, 100);
			// angular.element(form).find('button')[0].click();
			return Utils;
		}
    }]);

}());
