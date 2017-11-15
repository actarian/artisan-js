/* global angular */

(function() {
    "use strict";

    var app = angular.module('artisan', ['ng', 'ngRoute', 'ngMessages']);

}());
/* global angular */

(function () {
	"use strict";

	var app = angular.module('artisan');

	app.service('FacebookService', ['$promise', '$window', '$document', 'environment', function ($promise, $window, $document, environment) {

		var service = this;

		var statics = {
			login: FacebookLogin,
			logout: FacebookLogout,
			status: FacebookStatus,
			getMe: FacebookGetMe,
			getMyPicture: FacebookGetMyPicture,
		};

		angular.extend(service, statics);

		// private vars

		if (!environment.addons || !environment.addons.facebook) {
			trhow('FacebookService.error missing environment.addons.facebook');
		}

		var config = environment.addons.facebook;

		// statics methods

		function Facebook() {
			return $promise(function (promise) {
				if ($window.FB !== undefined) {
					promise.resolve($window.FB);
				} else {
					FacebookInit().then(function (success) {
						promise.resolve($window.FB);
					}, function (error) {
						promise.reject(error);
					});
				}
			});
		}

		function FacebookStatus(response, promise, init) {
			service.authResponse = null;
			if (response.status === 'connected') {
				service.authResponse = response.authResponse;
				promise.resolve(response);
			} else if (response.status === 'not_authorized') {
				if (init) {
					promise.resolve(response);
				} else {
					promise.reject(response);
				}
			} else {
				promise.reject(response);
			}
		}

		function FacebookGetMe() {
			return $promise(function (promise) {
				Facebook().then(function (facebook) {
					facebook.api('/me', {
						fields: 'id,name,first_name,last_name,email,gender,picture,cover,link'
					}, function (response) {
						if (!response || response.error) {
							promise.reject('Error occured');
						} else {
							promise.resolve(response);
						}
					});
				});
			});
		}

		function FacebookGetMyPicture() {
			return $promise(function (promise) {
				Facebook().then(function (facebook) {
					facebook.api('/me/picture', {
						width: 300,
						height: 300,
						type: 'square'
					}, function (response) {
						if (!response || response.error) {
							promise.reject('Error occured');
						} else {
							promise.resolve(response);
						}
					});
				});
			});
		}

		function FacebookLogin() {
			return $promise(function (promise) {
				Facebook().then(function (facebook) {
					facebook.login(function (response) {
						FacebookStatus(response, promise);
					}, {
						scope: 'public_profile, email' // publish_stream,
					});
				});
			});
		}

		function FacebookLogout() {
			return $promise(function (promise) {
				Facebook().then(function (facebook) {
					facebook.logout(function (response) {
						promise.resolve(response);
					});
				});
			});
		}

		function FacebookInit() {
			return $promise(function (promise) {
				$window.fbAsyncInit = function () {
					$window.FB.init({
						appId: config.app_id,
						status: true,
						cookie: true,
						xfbml: true,
						version: 'v2.10'
					});
					promise.resolve($window.FB);
					// $window.fbAsyncInit = null;
				};
				try {
					(function (d, s, id) {
						var js, fjs = d.getElementsByTagName(s)[0];
						if (d.getElementById(id)) {
							return;
						}
						js = d.createElement(s);
						js.id = id;
						js.src = "//connect.facebook.net/en_US/sdk.js";
						fjs.parentNode.insertBefore(js, fjs);
					}(document, 'script', 'facebook-jssdk'));
				} catch (error) {
					promise.reject(error);
				}
			});
		}

    }]);

}());
/* global angular */

(function () {
	"use strict";

	var app = angular.module('artisan');

	app.factory('Animate', [function () {

		function Animate(callback) {
			this.callback = callback;
			this.key = null;
			this.ticks = 0;
		}

		var statics = {};

		var methods = {
			pause: pause,
			play: play,
			toggle: toggle,
		};

		angular.extend(Animate, statics);
		angular.extend(Animate.prototype, methods);

		return Animate;

		// static methods

		// prototype methods

		function pause() {
			var animate = this;
			if (animate.key) {
				window.cancelAnimationFrame(animate.key);
				animate.key = null;
			}
		}

		function play() {
			var animate = this;

			function loop(time) {
				animate.ticks++;
				animate.callback(time, animate.ticks);
				animate.key = window.requestAnimationFrame(loop);
			}
			if (!animate.key) {
				loop();
			}
		}

		function toggle() {
			var animate = this;
			if (animate.key) {
				animate.pause();
			} else {
				animate.play();
			}
		}

    }]);

	(function () {
		var lastTime = 0;
		var vendors = ['ms', 'moz', 'webkit', 'o'];
		for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
			window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
			window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||
				window[vendors[x] + 'CancelRequestAnimationFrame'];
		}
		if (!window.requestAnimationFrame) {
			window.requestAnimationFrame = function (callback, element) {
				var currTime = new Date().getTime();
				var timeToCall = Math.max(0, 16 - (currTime - lastTime));
				var id = window.setTimeout(function () {
					callback(currTime + timeToCall);
				}, timeToCall);
				lastTime = currTime + timeToCall;
				return id;
			};
		}
		if (!window.cancelAnimationFrame) {
			window.cancelAnimationFrame = function (id) {
				clearTimeout(id);
			};
		}
	}());

}());
/*
// handle transition on resizing
var resizingTimeout;
$(window).on('resize', function () {
    clearTimeout(resizingTimeout);
    $('body').addClass('resizing');
    resizingTimeout = setTimeout(function () {
        $('body').removeClass('resizing');
    }, 100);
})
*/

/* global angular */

(function () {
	"use strict";

	var app = angular.module('artisan');

	app.service('Dom', ['$window', '$document', function ($window, $document) {

		var service = this;

		var statics = {
			ua: getUA(),
			getNode: getNode,
			getElement: getElement,
			getClosest: getClosest,
			getClosestElement: getClosestElement,
			getParents: getParents,
			getDocumentNode: getDocumentNode,
			compileController: compileController,
			downloadFile: downloadFile,
		};

		angular.extend(service, statics);

		function getUA() {
			var agent = window.navigator.userAgent.toLowerCase();
			var safari = agent.indexOf('safari') !== -1 && agent.indexOf('chrome') === -1;
			var msie = agent.indexOf('trident') !== -1 || agent.indexOf('edge') !== -1 || agent.indexOf('msie') !== -1;
			var chrome = !safari && !msie && agent.indexOf('chrome') !== -1;
			var mobile = agent.indexOf('mobile') !== -1;
			var mac = agent.indexOf('macintosh') !== -1;
			var ua = {
				agent: agent,
				safari: safari,
				msie: msie,
				chrome: chrome,
				mobile: mobile,
				mac: mac,
			};
			angular.forEach(ua, function (value, key) {
				if (value) {
					angular.element(document.getElementsByTagName('body')).addClass(key);
				}
			});
			return ua;
		}

		function getNode(element) {
			return element.length ? element[0] : element;
		}

		function getElement(element) {
			return element.length ? element : angular.element(element);
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

		function getDocumentNode() {
			var documentNode = (document.documentElement || document.body.parentNode || document.body);
			return documentNode;
		}

		function getParents(node, topParentNode) {
			// if no topParentNode defined will bubble up all the way to *document*
			topParentNode = topParentNode || getDocumentNode();
			var parents = [];
			if (node) {
				parents.push(node);
				var parentNode = node.parentNode;
				while (parentNode !== topParentNode) {
					parents.push(parentNode);
					parentNode = parentNode.parentNode;
				}
				parents.push(topParentNode); // push that topParentNode you wanted to stop at
			}
			return parents;
		}

		function compileController(scope, element, html, data) {
			// console.log('Dom.compileController', element);
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
				if (document.createEvent) {
					var anchor = document.createElement('a');
					anchor.href = base64;
					if (anchor.download !== undefined) {
						var downloadName = name || base64.substring(base64.lastIndexOf('/') + 1, base64.length);
						anchor.download = downloadName;
					}
					var event = document.createEvent('MouseEvents');
					event.initEvent('click', true, true);
					anchor.dispatchEvent(event);
					return true;
				}
				var query = '?download';
				window.open(base64.indexOf('?') > -1 ? base64 : base64 + query, '_self');
			}
		}

    }]);

}());
/* global angular */

(function () {
	"use strict";

	var app = angular.module('artisan');

	app.factory('Event', ['$window', '$document', 'EventsService', 'Dom', 'Point', 'Rect', function ($window, $document, EventsService, Dom, Point, Rect) {

		function Event(e, element) {
			var event = this;
			e = e || $window.event;
			var documentNode = Dom.getDocumentNode();
			var scroll = new Point(
				$window.pageXOffset || documentNode.scrollLeft,
				$window.pageYOffset || documentNode.scrollTop
			);
			var node = Dom.getNode(element);
			var offset = new Point(
				node.offsetLeft,
				node.offsetTop
			);
			var boundNode = node === $window ? documentNode : node;
			var rect = boundNode.getBoundingClientRect();
			var page = event.getPage(e);
			if (page) {
				var relative = new Point(
					page.x - scroll.x - rect.left,
					page.y - scroll.y - rect.top
				);
				var absolute = new Point(
					page.x - scroll.x,
					page.y - scroll.y
				);
				event.relative = relative;
				event.absolute = absolute;
			}
			if (e.type === 'resize') {
				var view = {
					w: event.getWidth(),
					h: event.getHeight(),
				};
				event.view = view;
			}
			if (e.type === 'mousewheel' || e.type === 'DOMMouseScroll') {
				e = e.originalEvent ? e.originalEvent : e;
				var deltaX = e.deltaX || e.wheelDeltaX;
				var deltaY = e.deltaY || e.wheelDeltaY;
				if (Math.abs(deltaX) > Math.abs(deltaY)) {
					event.dir = deltaX < 0 ? 1 : -1;
				} else {
					event.dir = deltaY < 0 ? 1 : -1;
				}
			}
			event.originalEvent = e;
			event.element = element;
			event.node = node;
			event.offset = offset;
			event.rect = rect;
			event.timestamp = new Date().getTime();
		}

		var methods = {
			getPage: getPage,
			getWidth: getWidth,
			getHeight: getHeight,
			stop: stop,
		};

		var statics = {};

		angular.extend(Event.prototype, methods);
		angular.extend(Event, statics);
		return Event;

		// prototype methods

		function getWidth() {
			if (self.innerWidth) {
				return self.innerWidth;
			}
			var documentNode = Dom.getDocumentNode();
			return documentNode.clientWidth;
		}

		function getHeight() {
			if (self.innerHeight) {
				return self.innerHeight;
			}
			var documentNode = Dom.getDocumentNode();
			return documentNode.clientHeight;
		}

		function getPage(e) {
			var page = null;
			var standardEvents = ['click', 'mousedown', 'mouseup', 'mousemove', 'mouseover', 'mouseout', 'mouseenter', 'mouseleave', 'contextmenu'];
			var touchEvents = ['touchstart', 'touchmove', 'touchend', 'touchcancel'];
			if (touchEvents.indexOf(e.type) !== -1) {
				var t = null;
				var event = e.originalEvent ? e.originalEvent : e;
				var touches = event.touches.length ? event.touches : event.changedTouches;
				if (touches && touches.length) {
					t = touches[0];
				}
				if (t) {
					page = new Point(
						t.pageX,
						t.pageY
					);
				}
			} else if (standardEvents.indexOf(e.type) !== -1) {
				page = new Point(
					e.pageX,
					e.pageY
				);
			}
			this.type = e.type;
			return page;
		}

		function stop() {
			this.originalEvent.stopPropagation();
			this.originalEvent.preventDefault();
		}

	}]);

	app.factory('Events', ['$window', '$document', 'EventsService', 'Event', 'Dom', function ($window, $document, EventsService, Event, Dom) {

		function Events(element) {
			var events = this;

			this.element = element;
			this.listeners = {};
			this.standardEvents = {
				click: {
					key: 'click',
					callback: onClick
				},
				down: {
					key: 'mousedown',
					callback: onMouseDown
				},
				move: {
					key: 'mousemove',
					callback: onMouseMove
				},
				up: {
					key: 'mouseup',
					callback: onMouseUp
				},
				resize: {
					key: 'resize',
					callback: onResize
				},
			};
			this.touchEvents = {
				down: {
					key: 'touchstart',
					callback: onTouchStart
				},
				move: {
					key: 'touchmove',
					callback: onTouchMove
				},
				up: {
					key: 'touchend',
					callback: onTouchEnd
				},
			};
			this.wheelEvents = {
				wheel: {
					key: 'mousewheel',
					callback: onMouseWheel
				},
			};
			this.scrollEvents = {
				wheel: {
					key: 'DOMMouseScroll',
					callback: onMouseScroll
				},
			};
			this.timestamp = new Date().getTime();
			this.setTimestamp = setTimestamp;

			function setTimestamp(event) {
				if (event) {
					event.interval = Math.min(250, event.timestamp - events.timestamp);
					// console.log(event.interval, event.timestamp, events.timestamp);
				}
				events.timestamp = new Date().getTime();
			}

			function onClick(e) {
				// console.log('onClick', e, events);
				var event = new Event(e, events.element);
				events.setTimestamp(event);
				events.listeners.click.apply(this, [event]);
			}

			function onMouseDown(e) {
				// console.log('onMouseDown', e);
				var event = new Event(e, events.element);
				events.setTimestamp(event);
				events.listeners.down.apply(this, [event]);
				events.removeTouchEvents();
			}

			function onMouseMove(e) {
				// console.log('onMouseMove', e);
				var event = new Event(e, events.element);
				events.setTimestamp(event);
				events.listeners.move.apply(this, [event]);
			}

			function onMouseUp(e) {
				// console.log('onMouseUp', e);
				var event = new Event(e, events.element);
				events.setTimestamp(event);
				events.listeners.up.apply(this, [event]);
			}

			function onMouseWheel(e) {
				// console.log('onMouseWheel', e);
				var event = new Event(e, events.element);
				events.setTimestamp(event);
				events.listeners.wheel.apply(this, [event]);
				events.removeScrollEvents();
			}

			function onMouseScroll(e) {
				// console.log('onMouseScroll', e);
				var event = new Event(e, events.element);
				events.setTimestamp(event);
				events.listeners.wheel.apply(this, [event]);
				events.removeWheelEvents();
			}

			function onResize(e) {
				// console.log('onResize', e);
				var event = new Event(e, events.element);
				events.setTimestamp(event);
				events.listeners.resize.apply(this, [event]);
			}

			function onTouchStart(e) {
				// console.log('onTouchStart', e);
				var event = new Event(e, events.element);
				events.setTimestamp(event);
				events.listeners.down.apply(this, [event]);
				events.removeStandardEvents();
			}

			function onTouchMove(e) {
				// console.log('onTouchMove', e);
				var event = new Event(e, events.element);
				events.setTimestamp(event);
				events.listeners.move.apply(this, [event]);
			}

			function onTouchEnd(e) {
				// console.log('onTouchEnd', e);
				var event = new Event(e, events.element);
				events.setTimestamp(event);
				events.listeners.up.apply(this, [event]);
			}
		}

		var methods = {
			add: add,
			remove: remove,
			removeStandardEvents: removeStandardEvents,
			removeTouchEvents: removeTouchEvents,
			removeWheelEvents: removeWheelEvents,
			removeScrollEvents: removeScrollEvents,
		};

		var statics = {
			getTouch: getTouch,
			getRelativeTouch: getRelativeTouch,
		};

		angular.extend(Events.prototype, methods);
		angular.extend(Events, statics);
		return Events;

		// prototype methods

		function add(listeners, scope) {
			var events = this,
				standard = this.standardEvents,
				touch = this.touchEvents,
				wheel = this.wheelEvents,
				scroll = this.scrollEvents;
			var element = Dom.getElement(this.element),
				windowElement = angular.element($window);

			angular.forEach(listeners, function (callback, key) {
				if (events.listeners[key]) {
					var listener = {};
					listener[key] = events.listeners[key];
					remove(listener);
				}
				events.listeners[key] = callback;
				if (standard[key]) {
					if (key === 'resize') {
						windowElement.on(standard[key].key, standard[key].callback);
					} else {
						element.on(standard[key].key, standard[key].callback);
					}
				}
				if (touch[key]) {
					element.on(touch[key].key, touch[key].callback);
				}
				if (wheel[key]) {
					element.on(wheel[key].key, wheel[key].callback);
				}
				if (scroll[key]) {
					element.on(scroll[key].key, scroll[key].callback);
				}
			});

			if (scope) {
				scope.$on('$destroy', function () {
					events.remove(listeners);
				});
			}

			return events;
		}

		function remove(listeners) {
			var events = this,
				standard = this.standardEvents,
				touch = this.touchEvents,
				wheel = this.wheelEvents,
				scroll = this.scrollEvents;
			var element = Dom.getElement(this.element),
				windowElement = angular.element($window);
			angular.forEach(listeners, function (callback, key) {
				if (standard[key]) {
					if (key === 'resize') {
						windowElement.off(standard[key].key, standard[key].callback);
					} else {
						element.off(standard[key].key, standard[key].callback);
					}
				}
				if (touch[key]) {
					element.off(touch[key].key, touch[key].callback);
				}
				if (wheel[key]) {
					element.off(wheel[key].key, wheel[key].callback);
				}
				if (scroll[key]) {
					element.off(scroll[key].key, scroll[key].callback);
				}
				events.listeners[key] = null;
			});
			return events;
		}

		function removeStandardEvents() {
			var events = this,
				standard = events.standardEvents,
				touch = events.touchEvents;
			var element = Dom.getElement(events.element);
			element.off('mousedown', standard.down.callback);
			element.off('mousemove', standard.move.callback);
			element.off('mouseup', standard.up.callback);
		}

		function removeTouchEvents() {
			var events = this,
				standard = events.standardEvents,
				touch = events.touchEvents;
			var element = Dom.getElement(events.element);
			element.off('touchstart', touch.down.callback);
			element.off('touchmove', touch.move.callback);
			element.off('touchend', touch.up.callback);
		}

		function removeWheelEvents() {
			var events = this;
			var element = Dom.getElement(events.element);
			element.off('mousewheel', events.mouseEvents.wheel.callback);
		}

		function removeScrollEvents() {
			var events = this;
			var element = Dom.getElement(events.element);
			element.off('DOMMouseScroll', events.scrollEvents.wheel.callback);
		}

		// statics methods

		function getTouch(e, previous) {
			var point = new Point();
			if (e.type === 'touchstart' || e.type === 'touchmove' || e.type === 'touchend' || e.type === 'touchcancel') {
				var touch = null;
				var event = e.originalEvent ? e.originalEvent : e;
				var touches = event.touches.length ? event.touches : event.changedTouches;
				if (touches && touches.length) {
					touch = touches[0];
				}
				if (touch) {
					point.x = touch.pageX;
					point.y = touch.pageY;
				}
			} else if (e.type === 'click' || e.type === 'mousedown' || e.type === 'mouseup' || e.type === 'mousemove' || e.type === 'mouseover' || e.type === 'mouseout' || e.type === 'mouseenter' || e.type === 'mouseleave' || e.type === 'contextmenu') {
				point.x = e.pageX;
				point.y = e.pageY;
			}
			if (previous) {
				point.s = Point.difference(t, previous);
			}
			point.type = e.type;
			return point;
		}

		function getRelativeTouch(node, point) {
			node = angular.isArray(node) ? node[0] : node;
			return Point.difference(point, {
				x: node.offsetLeft,
				y: node.offsetTop
			});
		}

    }]);

	app.service('EventsService', ['$window', 'Dom', function ($window, Dom) {

		var service = this;

		var statics = {
			hasPassiveEvents: hasPassiveEvents,
			addEventListener: getAddEventListener(),
		};

		angular.extend(service, statics);

		// prevent history back on mac os

		preventHistoryNavigation();

		// static methods

		function hasPassiveEvents() {
			var supported = false;
			if ($window.addEventListener) {
				try {
					var options = Object.defineProperty({}, 'passive', {
						get: function () {
							supported = true;
						},
					});
					$window.addEventListener('test', null, options);
				} catch (e) {
					console.log('getAddEventListener.isSupprted', e);
				}
			}
			return supported;
		}

		function getAddEventListener() {
			var supported = hasPassiveEvents();
			if (!supported) {
				return;
			}

			var defaults = {
				passive: false,
				capture: false,
			};

			function getModifiedAddEventListener(original) {
				function addEventListener(type, listener, options) {
					if (typeof options !== 'object') {
						var capture = options === true;
						options = angular.copy(defaults);
						options.capture = capture;
					} else {
						options = angular.extend(angular.copy(defaults), options);
					}
					original.call(this, type, listener, options);
				}
				return addEventListener;
			}

			var original = EventTarget.prototype.addEventListener;
			var modified = getModifiedAddEventListener(original);
			EventTarget.prototype.addEventListener = modified;
			return modified;
		}

		function preventHistoryNavigation() {
			if (!Dom.ua.mac) {
				return;
			}
			if (Dom.ua.chrome || Dom.ua.safari || Dom.ua.firefox) {
				$window.addEventListener('mousewheel', onScroll, {
					passive: false
				});
			}

			function onScroll(e) {
				if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
					return;
				}
				if (
					(e.deltaX < 0 && (Dom.getParents(e.target).filter(function (node) {
						return node.scrollLeft > 0;
					}).length === 0)) ||
					(e.deltaX > 0 && (Dom.getParents(e.target).filter(function (node) {
						return node.scrollWidth - node.scrollLeft > node.clientWidth;
					}).length === 0))
				) {
					e.preventDefault();
				}
			}
		}

    }]);

}());
/* global angular, app, Autolinker */
(function () {

	"use strict";

	var app = angular.module('artisan');

	app.filter('notIn', ['$filter', function ($filter) {

		return function (array, filters, element) {
			if (filters) {
				return $filter("filter")(array, function (item) {
					for (var i = 0; i < filters.length; i++) {
						if (filters[i][element] === item[element]) return false;
					}
					return true;
				});
			}
		};

    }]);

}());
/* global angular, firebase */

(function () {
	"use strict";

	var app = angular.module('artisan');

	app.factory('Point', [function () {

		function Point(x, y) {
			this.x = x || 0;
			this.y = y || 0;
		}

		var statics = {
			difference: PointDifference,
			multiply: PointMultiply,
		};

		var methods = {
			clone: clone,
			copy: copy,
			difference: difference,
			mult: mult,
			offset: offset,
			setPos: setPos,
			setX: setX,
			setY: setY,
			toString: toString,
		};

		angular.extend(Point, statics);
		angular.extend(Point.prototype, methods);

		return Point;

		// static methods

		function PointDifference(a, b) {
			return new Point(a.x - b.x, a.y - b.y);
		}

		function PointMultiply(point, value) {
			point.x *= value;
			point.y *= value;
			return point;
		}

		// prototype methods

		function clone() {
			return new Point(this.x, this.y);
		}

		function copy(point) {
			this.x = point.x;
			this.y = point.y;
			return this;
		}

		function difference(b) {
			return PointDifference(this, b);
		}

		function mult(value) {
			return PointMultiply(this, value);
		}

		function offset(x, y) {
			this.x += x;
			this.y += y;
			return this;
		}

		function setPos(x, y) {
			this.x = x;
			this.y = y;
			return this;
		}

		function setX(x) {
			this.x = x;
			return this;
		}

		function setY(y) {
			this.y = y;
			return this;
		}

		function toString() {
			return '{' + this.x + ',' + this.y + '}';
		}

    }]);

}());
/* global angular, firebase */

(function () {
	"use strict";

	var app = angular.module('artisan');

	app.factory('Rect', [function () {

		function Rect(x, y, w, h) {
			this.x = x || 0;
			this.y = y || 0;
			this.w = w || 0;
			this.h = h || 0;
		}

		var statics = {
			mult: RectMultiply,
		};

		var methods = {
			bottom: bottom,
			bottomLeft: bottomLeft,
			bottomRight: bottomRight,
			center: center,
			clone: clone,
			copy: copy,
			expand: expand,
			expandRect: expandRect,
			intersect: intersect,
			left: left,
			mult: mult,
			offset: offset,
			reduce: reduce,
			reduceRect: reduceRect,
			right: right,
			setH: setH,
			setPos: setPos,
			setSize: setSize,
			setX: setX,
			setY: setY,
			setW: setW,
			top: top,
			topLeft: topLeft,
			topRight: topRight,
			toString: toString,
		};

		angular.extend(Rect, statics);
		angular.extend(Rect.prototype, methods);

		return Rect;

		// static methods

		function RectMultiply(rect, value) {
			rect.x *= value;
			rect.y *= value;
			rect.w *= value;
			rect.h *= value;
			return rect;
		}

		// prototype methods

		function bottom() {
			var x = this.x,
				y = this.y,
				w = this.w,
				h = this.h;
			return {
				x: x + w / 2,
				y: y + h
			};
		}

		function bottomLeft() {
			var x = this.x,
				y = this.y,
				w = this.w,
				h = this.h;
			return {
				x: x,
				y: y + h
			};
		}

		function bottomRight() {
			var x = this.x,
				y = this.y,
				w = this.w,
				h = this.h;
			return {
				x: x + w,
				y: y + h
			};
		}

		function center() {
			var x = this.x,
				y = this.y,
				w = this.w,
				h = this.h;
			return {
				x: x + w / 2,
				y: y + h / 2
			};
		}

		function clone() {
			return new Rect(this.x, this.y, this.w, this.h);
		}

		function copy(rect) {
			this.x = rect.x;
			this.y = rect.y;
			this.w = rect.w;
			this.h = rect.h;
			return this;
		}

		function expand(size) {
			return this.expandRect({
				x: size,
				y: size,
				w: size * 2,
				h: size * 2
			});
		}

		function expandRect(rect) {
			this.x -= rect.x || 0;
			this.y -= rect.y || 0;
			this.w += rect.w || 0;
			this.h += rect.h || 0;
			return this;
		}

		function intersect(rect) {
			var x = this.x,
				y = this.y,
				w = this.w,
				h = this.h;
			return !(rect.x > x + w || rect.x + rect.w < x || rect.y > y + h || rect.y + rect.h < y);
		}

		function left() {
			var x = this.x,
				y = this.y,
				w = this.w,
				h = this.h;
			return {
				x: x,
				y: y + h / 2
			};
		}

		function mult(value) {
			return RectMultiply(this, value);
		}

		function offset(x, y) {
			this.x += x;
			this.y += y;
			return this;
		}

		function reduce(size) {
			return this.offset(-size);
		}

		function reduceRect(rect) {
			return this.offsetRect(RectMultiply(rect, -1));
		}

		function right() {
			var x = this.x,
				y = this.y,
				w = this.w,
				h = this.h;
			return {
				x: x + w,
				y: y + h / 2
			};
		}

		function setH(h) {
			this.h = h;
			return this;
		}

		function setPos(x, y) {
			this.x = x;
			this.y = y;
			return this;
		}

		function setSize(w, h) {
			this.w = w;
			this.h = h;
			return this;
		}

		function setX(x) {
			this.x = x;
			return this;
		}

		function setY(y) {
			this.y = y;
			return this;
		}

		function setW(w) {
			this.w = w;
			return this;
		}

		function top() {
			var x = this.x,
				y = this.y,
				w = this.w,
				h = this.h;
			return {
				x: x + w / 2,
				y: y
			};
		}

		function topLeft() {
			var x = this.x,
				y = this.y,
				w = this.w,
				h = this.h;
			return {
				x: x,
				y: y
			};
		}

		function topRight() {
			var x = this.x,
				y = this.y,
				w = this.w,
				h = this.h;
			return {
				x: x + w,
				y: y
			};
		}

		function toString() {
			return '{' + this.x + ',' + this.y + ',' + this.w + ',' + this.h + '}';
		}

    }]);

}());
/* global angular, firebase */

(function () {
	"use strict";

	var app = angular.module('artisan');

	app.factory('Vector', function () {
		function Vector(x, y) {
			this.x = x || 0;
			this.y = y || 0;
		}

		var statics = {
			cross: VectorCross,
			difference: VectorDifference,
			distance: VectorDistance,
			incidence: VectorIncidence,
			make: VectorMake,
			normalize: VectorNormalize,
			power: VectorPower,
			size: VectorSize,
		};

		var methods = {
			add: add,
			copy: copy,
			cross: cross,
			difference: difference,
			distance: distance,
			friction: friction,
			incidence: incidence,
			normalize: normalize,
			power: power,
			size: size,
			towards: towards,
			toString: toString,
		};

		angular.extend(Vector, statics);
		angular.extend(Vector.prototype, methods);

		return Vector;

		// statics methods

		function VectorCross(a, b) {
			return (a.x * b.y) - (a.y * b.x);
		}

		function VectorDifference(a, b) {
			return new Vector(a.x - b.x, a.y - b.y);
		}

		function VectorDistance(a, b) {
			return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
		}

		function VectorIncidence(a, b) {
			var angle = Math.atan2(b.y, b.x) - Math.atan2(a.y, a.x);
			return angle;
		}

		function VectorMake(a, b) {
			return new Vector(b.x - a.x, b.y - a.y);
		}

		function VectorNormalize(a) {
			var l = Vector.size(a);
			a.x /= l;
			a.y /= l;
			return a;
		}

		function VectorPower(a, b) {
			var x = Math.abs(b.x - a.x);
			var y = Math.abs(b.y - a.y);
			return (x + y) / 2;
		}

		function VectorSize(a) {
			return Math.sqrt(a.x * a.x + a.y * a.y);
		}

		// prototype methods

		function add(b) {
			this.x += b.x;
			this.y += b.y;
			return this;
		}

		function copy(b) {
			return new Vector(this.x, this.y);
		}

		function cross(b) {
			return VectorCross(this, b);
		}

		function difference(b) {
			return VectorDifference(this, b);
		}

		function distance(b) {
			return VectorDistance(this, b);
		}

		function friction(b) {
			this.x *= b;
			this.y *= b;
			return this;
		}

		function incidence(b) {
			return VectorIncidence(this, b);
		}

		function normalize() {
			return VectorNormalize(this);
		}

		function power() {
			return (Math.abs(this.x) + Math.abs(this.y)) / 2;
		}

		function size() {
			return VectorSize(this);
		}

		function towards(b, friction) {
			friction = friction || 0.125;
			this.x += (b.x - this.x) * friction;
			this.y += (b.y - this.y) * friction;
			return this;
		}

		function toString() {
			return '{' + this.x + ',' + this.y + '}';
		}

	});

}());
/* global angular */

(function () {
	"use strict";

	var app = angular.module('artisan');

	app.factory('Hash', [function () {

		function Hash(key, pool) {
			key = key || 'id';
			pool = pool ? HashGet(pool) : {};
			Object.defineProperties(this, {
				key: {
					value: key,
					enumerable: false,
					writable: false
				},
				pool: {
					value: pool,
					enumerable: false,
					writable: false
				},
				length: {
					value: 0,
					enumerable: false,
					writable: true
				}
			});
		}

		var pools = {};

		var statics = {
			get: HashGet,
		};

		var methods = {
			has: has,
			getId: getId,
			get: get,
			set: set,
			add: add,
			remove: remove,
			each: each,
			addMany: addMany,
			removeMany: removeMany,
			removeAll: removeAll,
			forward: forward,
			backward: backward,
			differs: differs,
			updatePool: updatePool,
		};

		Hash.prototype = new Array;

		angular.extend(Hash, statics);
		angular.extend(Hash.prototype, methods);

		return Hash;

		// static methods

		function HashGet(pool) {
			return (pools[pool] = pools[pool] || {});
		}

		function has(id) {
			return this.pool[id] !== undefined;
		}

		function getId(id) {
			return this.pool[id];
		}

		function get(item) {
			var hash = this,
				key = this.key;
			return item ? hash.getId(item[key]) : null;
		}

		function set(item) {
			var hash = this,
				pool = this.pool,
				key = this.key;
			pool[item[key]] = item;
			hash.push(item);
			return item;
		}

		function add(newItem) {
			var hash = this;
			var item = hash.get(newItem);
			if (item) {
				for (var i = 0, keys = Object.keys(newItem), p; i < keys.length; i++) {
					p = keys[i];
					item[p] = newItem[p];
				}
			} else {
				item = hash.set(newItem);
			}
			return item;
		}

		function remove(oldItem) {
			var hash = this,
				pool = this.pool,
				key = this.key;
			var item = hash.get(oldItem);
			if (item) {
				var index = hash.indexOf(item);
				if (index !== -1) {
					hash.splice(index, 1);
				}
				delete pool[item[key]];
			}
			return hash;
		}

		function addMany(items) {
			var hash = this;
			if (!items) {
				return hash;
			}
			var i = 0;
			while (i < items.length) {
				hash.add(items[i]);
				i++;
			}
			return hash;
		}

		function removeMany(items) {
			var hash = this;
			if (!items) {
				return hash;
			}
			var i = 0;
			while (i < items.length) {
				hash.remove(items[i]);
				i++;
			}
			return hash;
		}

		function removeAll() {
			var hash = this,
				key = hash.key,
				pool = hash.pool;
			var i = 0,
				t = hash.length,
				item;
			while (hash.length) {
				item = hash.shift();
				delete pool[item[key]];
				i++;
			}
			return hash;
		}

		function each(callback) {
			var hash = this;
			if (callback) {
				var i = 0;
				while (i < hash.length) {
					callback(hash[i], i);
					i++;
				}
			}
			return hash;
		}

		function forward(key, reverse) {
			var hash = this;
			key = (key || this.key);
			hash.sort(function (c, d) {
				var a = reverse ? d : c;
				var b = reverse ? c : d;
				return a[key] - b[key];
			});
			return hash;
		}

		function backward(key) {
			return this.forward(key, true);
		}

		function differs(hash) {
			if (hash.key !== this.key || hash.length !== this.length) {
				return true;
			} else {
				var differs = false,
					i = 0,
					t = this.length,
					key = this.key;
				while (differs && i < t) {
					differs = this[i][key] !== hash[i][key];
					i++;
				}
			}
		}

		function updatePool() {
			var hash = this,
				pool = this.pool,
				key = this.key;
			Object.keys(pool).forEach(function (key) {
				delete pool[key];
			});
			angular.forEach(hash, function (item) {
				pool[item[key]] = item;
			});
		}

    }]);

}());
/* global angular */

(function () {
	"use strict";

	var app = angular.module('artisan');

	app.factory('$promise', ['$q', function ($q) {

		function $promise(callback) {
			if (typeof callback !== 'function') {
				throw ('promise resolve callback missing');
			}
			var deferred = $q.defer();
			callback(deferred);
			return deferred.promise;
		}

		var statics = {
			all: $promiseAll,
		};

		var methods = {};

		angular.extend($promise, statics);
		angular.extend($promise.prototype, methods);

		return $promise;

		function $promiseAll(promises) {
			return $q.all(promises);
		}

    }]);

}());
/* global angular */

(function () {
	"use strict";

	var app = angular.module('artisan');

	app.factory('State', ['$timeout', function ($timeout) {

		function State() {
			this.errors = [];
			this.isReady = false;
			this.idle();
		}

		var DELAY = 2000;

		var statics = {};

		var methods = {
			busy: busy,
			classes: classes,
			enabled: enabled,
			error: error,
			errorMessage: errorMessage,
			idle: idle,
			labels: labels,
			ready: ready,
			submitClass: submitClass,
			success: success,
		};

		angular.extend(State, statics);
		angular.extend(State.prototype, methods);

		return State;

		// static methods

		// prototype methods

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
				angular.forEach(addons, function (value, key) {
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
			$timeout(function () {
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
			$timeout(function () {
				state.isSuccessing = false;
			}, DELAY);
		}

    }]);

}());
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

		var statics = {};

		var methods = {
			set: set,
			transform: transform,
			transformOrigin: transformOrigin,
		};

		angular.extend(Style, statics);
		angular.extend(Style.prototype, methods);

		return Style;

		// static methods

		// prototype methods

		function set(element) {
			var styles = [];
			for (var key in this) {
				if (key !== 'props') {
					styles.push(key + ':' + this[key]);
				}
			}
			element.style.cssText = styles.join(';') + ';';
		}

		function transform(transform) {
			this[transformProperty] = transform;
		}

		function transformOrigin(x, y) {
			this[transformProperty + '-origin-x'] = (Math.round(x * 1000) / 1000) + '%';
			this[transformProperty + '-origin-y'] = (Math.round(y * 1000) / 1000) + '%';
		}

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
/* global angular */

(function () {
	"use strict";

	var app = angular.module('artisan');

	app.service('Utils', ['$compile', '$controller', 'Vector', function ($compile, $controller, Vector) {

		var service = this;

		var statics = {
			compileController: compileController,
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

		var getNow = Date.now || function () {
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

		function toMd5(string) {
			// return Md5.encode(string);
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

    }]);

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

}());
/* global angular */

(function () {
	"use strict";

	var app = angular.module('artisan');

	app.factory('Doc', ['Api', '$promise', function (Api, $promise) {

		function Doc(item) {
			if (item) {
				angular.extend(this, item);
			}
		}

		var statics = {};

		var methods = {};

		angular.extend(Doc, statics);
		angular.extend(Doc.prototype, methods);

		return Doc;

		// static methods

		// prototype methods

    }]);

}());
/* global angular */

(function () {
	"use strict";

	var app = angular.module('artisan');

	app.factory('View', ['Api', '$promise', '$location', '$routeParams', 'environment', 'Doc', function (Api, $promise, $location, $routeParams, environment, Doc) {

		function View(doc) {
			var url = $location.path(),
				params = $routeParams;
			var view = {
				environment: environment,
				route: {
					url: url,
					params: params,
				},
				doc: doc,
			};
			angular.extend(this, view);
		}

		var statics = {
			current: ViewCurrent,
		};

		var methods = {};

		angular.extend(View, statics);
		angular.extend(View.prototype, methods);

		return View;

		// static methods

		function ViewCurrent() {
			return $promise(function (promise) {
				var url = $location.path();
				console.log('View.current', url);
				Api.docs.url(url).then(function (response) {
					var doc = new Doc(response);
					var view = new View(doc);
					promise.resolve(view);

				}, function (error) {
					promise.reject(error);

				});
				/*
				Api.navs.main().then(function(items) {
				    var doc = null,
				        url = $location.path(),
				        pool = getPool(items);
				    var item = pool[url];
				    if (item) {
				        doc = new Doc(item);
				    }
				    promise.resolve(doc);

				}, function(error) {
				    promise.reject(error);

				});
				*/
			});
		}

		function ViewPool(items) {
			var pool = {};

			function _getPool(items) {
				if (items) {
					angular.forEach(items, function (item) {
						pool[item.url] = item;
						_getPool(item.items);
					});
				}
			}
			_getPool(items);
			return pool;
		}

		// prototype methods

    }]);

}());
/* global angular */

(function () {
	"use strict";

	var app = angular.module('artisan');

	app.service('Http', ['$http', '$promise', '$timeout', 'environment', function ($http, $promise, $timeout, environment) {

			var service = this;

			var statics = {
				get: HttpGet,
				post: HttpPost,
				put: HttpPut,
				patch: HttpPatch,
				'delete': HttpDelete,
				fake: HttpFake,
			};

			angular.extend(service, statics);

			// statics methods

			function HttpPromise(method, url, data) {
				return $promise(function (promise) {
					$http[method](environment.urls.api + url, data).then(function (response) {
						promise.resolve(response.data);

					}, function (e, status) {
						var error = (e && e.data) ? e.data : {};
						error.status = e.status;
						promise.reject(error);

					});
				});
			}

			function HttpGet(url) {
				return HttpPromise('get', url);
			}

			function HttpPost(url, data) {
				return HttpPromise('post', url, data);
			}

			function HttpPut(url, data) {
				return HttpPromise('put', url, data);
			}

			function HttpPatch(url, data) {
				return HttpPromise('patch', url, data);
			}

			function HttpDelete(url) {
				return HttpPromise('delete', url);
			}

			function HttpFake(data) {
				var deferred = $q.defer();
				$timeout(function () {
					deferred.resolve({
						data: data
					});
				}, 1000);
				return deferred.promise;
			}

        }
    ]);

}());
/* global angular */

(function() {
    "use strict";

    var app = angular.module('artisan');

    app.service('Router', ['$location', '$timeout', function($location, $timeout) {

        var service = this;
        service.redirect = redirect;
        service.path = path;
        service.apply = apply;

        function redirect(path, msecs) {
            function doRedirect() {
                $location.$$lastRequestedPath = $location.path();
                $location.path(path);
            }
            if (msecs) {
                $timeout(function() {
                    doRedirect();
                }, msecs);
            } else {
                doRedirect();
            }
        }

        function path(path, msecs) {
            function doRetry() {
                path = $location.$$lastRequestedPath || path;
                $location.$$lastRequestedPath = null;
                $location.path(path);
            }
            if (msecs) {
                $timeout(function() {
                    doRetry();
                }, msecs);
            } else {
                doRetry();
            }
        }

        function apply(path, msecs) {
            function doRetry() {
                $location.path(path);
            }
            if (msecs) {
                $timeout(function() {
                    doRetry();
                }, msecs);
            } else {
                $timeout(function() {
                    doRetry();
                });
            }
        }

    }]);

}());
/* global angular */

(function () {
	"use strict";

	var app = angular.module('artisan');

	app.factory('Silent', ['$rootScope', '$location', function ($rootScope, $location) {

		function Silent() {}

		var statics = {
			silent: SilentSilent,
			path: SilentPath,
		};

		var methods = {};

		angular.extend(Silent, statics);
		angular.extend(Silent.prototype, methods);

		$rootScope.$$listeners.$locationChangeSuccess.unshift(SilentListener);
		// console.log('$rootScope.$$listeners.$locationChangeSuccess', $rootScope.$$listeners.$locationChangeSuccess);

		// private vars

		var $path;

		return Silent;

		// static methods

		function SilentUnlink() {
			var listeners = $rootScope.$$listeners.$locationChangeSuccess;
			angular.forEach(listeners, function (value, name) {
				if (value === listener) {
					return;
				}

				function relink() {
					listeners[name] = value;
				}
				listeners[name] = relink; // temporary unlinking
			});
		}

		function SilentListener(e) {
			// console.log('onLocationChangeSuccess', e);
			if ($path === $location.path()) {
				SilentUnlink();
			}
			$path = null;
		}

		function SilentSilent(path, replace) {
			// this.prev = $location.path(); ???
			var location = $location.url(path);
			if (replace) {
				location.replace();
			}
			$path = $location.path();
		}

		function SilentPath(path) {
			return $location.path(path);
		}

    }]);

}());
/* global angular */

(function () {
	"use strict";

	var app = angular.module('artisan');

	var TIMEOUT = 5 * 60 * 1000; // five minutes

	app.service('Cookie', ['$promise', '$window', function ($promise, $window) {

		var service = {
			TIMEOUT: TIMEOUT,
			delete: CookieDelete,
			exist: CookieExists,
			get: CookieGet,
			on: CookieOn,
			set: CookieSet,
		};

		angular.extend(this, service);

		function CookieDelete(name) {
			CookieSetter(name, "", -1);
		}

		function CookieExists(name) {
			return $window.document.cookie.indexOf(';' + name + '=') !== -1 || $window.document.cookie.indexOf(name + '=') === 0;
		}

		function CookieGet(name) {
			var cookieName = name + "=";
			var ca = $window.document.cookie.split(';');
			for (var i = 0; i < ca.length; i++) {
				var c = ca[i];
				while (c.charAt(0) == ' ') {
					c = c.substring(1, c.length);
				}
				if (c.indexOf(cookieName) === 0) {
					var value = c.substring(cookieName.length, c.length);
					var model = null;
					try {
						model = JSON.parse(decodeURIComponent(atob(value)));
					} catch (e) {
						console.log('Cookie.get.error parsing', key, e);
					}
					return model;
				}
			}
			return null;
		}

		function CookieOn(name) {
			return $promise(function (promise) {
				var i, interval = 1000,
					elapsed = 0,
					timeout = Cookie.TIMEOUT;

				function checkCookie() {
					if (elapsed > timeout) {
						promise.reject('timeout');
					} else {
						var c = CookieGet(name);
						if (c) {
							promise.resolve(c);
						} else {
							elapsed += interval;
							i = setTimeout(checkCookie, interval);
						}
					}
				}
				checkCookie();
			});
		}

		function CookieSet(name, value, days) {
			try {
				var cache = [];
				var json = JSON.stringify(value, function (key, value) {
					if (key === 'pool') {
						return;
					}
					if (typeof value === 'object' && value !== null) {
						if (cache.indexOf(value) !== -1) {
							// Circular reference found, discard key
							return;
						}
						cache.push(value);
					}
					return value;
				});
				cache = null;
				CookieSetter(name, btoa(encodeURIComponent(json)), days);
			} catch (e) {
				console.log('CookieSet.error serializing', name, value, e);
			}
		}

		function CookieSetter(name, value, days) {
			var expires;
			if (days) {
				var date = new Date();
				date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
				expires = '; expires=' + date.toGMTString();
			} else {
				expires = '';
			}
			$window.document.cookie = name + '=' + value + expires + '; path=/';
		}

    }]);

	app.service('LocalStorage', ['$promise', '$window', 'Cookie', function ($promise, $window, Cookie) {

		var service = {
			TIMEOUT: TIMEOUT,
			delete: LocalDelete,
			exist: LocalExists,
			get: LocalGet,
			on: LocalOn,
			set: LocalSet,
		};

		var supported = LocalSupported();

		if (supported) {
			angular.extend(this, service);
		} else {
			angular.extend(this, Cookie);
		}

		this.supported = supported;

		function LocalSupported() {
			var supported = false;
			try {
				supported = 'localStorage' in $window && $window.localStorage !== null;
				if (supported) {
					$window.localStorage.setItem('test', '1');
					$window.localStorage.removeItem('test');
				} else {
					supported = false;
				}
			} catch (e) {
				supported = false;
			}
			return supported;
		}

		function LocalExists(name) {
			return $window.localStorage[name] !== undefined;
		}

		function LocalGet(name) {
			var value = null;
			if ($window.localStorage[name] !== undefined) {
				try {
					value = JSON.parse($window.localStorage[name]);
				} catch (e) {
					console.log('LocalStorage.get.error parsing', name, e);
				}
			}
			return value;
		}

		function LocalSet(name, value) {
			try {
				var cache = [];
				var json = JSON.stringify(value, function (key, value) {
					if (key === 'pool') {
						return;
					}
					if (typeof value === 'object' && value !== null) {
						if (cache.indexOf(value) !== -1) {
							// Circular reference found, discard key
							return;
						}
						cache.push(value);
					}
					return value;
				});
				cache = null;
				$window.localStorage.setItem(name, json);
			} catch (e) {
				console.log('LocalStorage.set.error serializing', name, value, e);
			}
		}

		function LocalDelete(name) {
			$window.localStorage.removeItem(name);
		}

		function LocalOn(name) {
			return $promise(function (promise) {
				var i, timeout = Cookie.TIMEOUT;

				function storageEvent(e) {
					// console.log('LocalStorage.on', name, e);
					if (i) {
						clearTimeout(i);
					}
					if (e.originalEvent.key == name) {
						try {
							var value = JSON.parse(e.originalEvent.newValue); // , e.originalEvent.oldValue
							promise.resolve(value);
						} catch (error) {
							console.log('LocalStorage.on.error parsing', name, error);
							promise.reject('error parsing ' + name);
						}
					}
				}
				angular.element($window).on('storage', storageEvent);
				i = setTimeout(function () {
					promise.reject('timeout');
				}, timeout);
			});
		}

    }]);

	app.factory('SessionStorage', ['$promise', '$window', 'Cookie', function ($promise, $window, Cookie) {

		var service = {
			TIMEOUT: TIMEOUT,
			delete: LocalDelete,
			exist: LocalExists,
			get: LocalGet,
			on: LocalOn,
			set: LocalSet,
		};

		var supported = SessionSupported();

		if (supported) {
			angular.extend(this, service);
		} else {
			angular.extend(this, Cookie);
		}

		this.supported = supported;

		function SessionSupported() {
			var supported = false;
			try {
				supported = 'sessionStorage' in $window && $window.sessionStorage !== undefined;
				if (supported) {
					$window.sessionStorage.setItem('test', '1');
					$window.sessionStorage.removeItem('test');
				} else {
					supported = false;
				}
			} catch (e) {
				supported = false;
			}
			return supported;
		}

		function SessionExists(name) {
			return $window.sessionStorage[name] !== undefined;
		}

		function SessionGet(name) {
			var value = null;
			if ($window.sessionStorage[name] !== undefined) {
				try {
					value = JSON.parse($window.sessionStorage[name]);
				} catch (e) {
					console.log('SessionStorage.get.error parsing', name, e);
				}
			}
			return value;
		}

		function SessionSet(name, value) {
			try {
				var cache = [];
				var json = JSON.stringify(value, function (key, value) {
					if (key === 'pool') {
						return;
					}
					if (typeof value === 'object' && value !== null) {
						if (cache.indexOf(value) !== -1) {
							// Circular reference found, discard key
							return;
						}
						cache.push(value);
					}
					return value;
				});
				cache = null;
				$window.sessionStorage.setItem(name, json);
			} catch (e) {
				console.log('SessionStorage.set.error serializing', name, value, e);
			}
		}

		function SessionDelete(name) {
			$window.sessionStorage.removeItem(name);
		}

		function SessionOn(name) {
			return $promise(function (promise) {
				var i, timeout = Cookie.TIMEOUT;

				function storageEvent(e) {
					// console.log('SessionStorage.on', name, e);
					if (i) {
						clearTimeout(i);
					}
					if (e.originalEvent.key === name) {
						try {
							var value = JSON.parse(e.originalEvent.newValue); // , e.originalEvent.oldValue
							promise.resolve(value);
						} catch (error) {
							console.log('SessionStorage.on.error parsing', name, error);
							promise.reject('error parsing ' + name);
						}
					}
				}
				angular.element($window).on('storage', storageEvent);
				i = setTimeout(function () {
					promise.reject('timeout');
				}, timeout);
			});
		}

    }]);

}());
/* global angular, firebase */

(function () {
	"use strict";

	var app = angular.module('artisan');

	app.factory('Color', [function () {
		function Color(r, g, b, a) {
			if (arguments.length > 1) {
				this.r = (r || r === 0) ? r : 0;
				this.g = (g || g === 0) ? g : 0;
				this.b = (b || b === 0) ? b : 0;
				this.a = (a || a === 0) ? a : 255;
			} else {
				var uint = r || '0xffffff';
				uint = parseInt(uint);
				if (r.length > 8) {
					this.r = uint >> 24 & 0xff;
					this.g = uint >> 16 & 0xff;
					this.b = uint >> 8 & 0xff;
					this.a = uint >> 0 & 0xff;
				} else {
					this.r = uint >> 16 & 0xff;
					this.g = uint >> 8 & 0xff;
					this.b = uint >> 0 & 0xff;
					this.a = 255;
				}
			}
		}
		Color.componentToHex = function (c) {
			var hex = c.toString(16);
			return hex.length == 1 ? '0' + hex : hex;
		};
		Color.luma = function (color) {
			// var luma = color.dot({ r: 54.213, g: 182.376, b: 18.411 });
			var luma = color.dot({
				r: 95,
				g: 100,
				b: 60
			});
			return luma;
		};
		Color.contrast = function (color) {
			var luma = Color.luma(color);
			if (luma > 0.6) {
				return new Color('0x000000');
			} else {
				return new Color('0xffffff');
			}
		};
		Color.darker = function (color, pow, min) {
			min = min || 0;
			var r = Math.max(Math.floor(color.r * min), Math.floor(color.r - 255 * pow));
			var g = Math.max(Math.floor(color.g * min), Math.floor(color.g - 255 * pow));
			var b = Math.max(Math.floor(color.b * min), Math.floor(color.b - 255 * pow));
			return new Color(r, g, b, color.a);
		};
		Color.lighter = function (color, pow, max) {
			max = max || 1;
			var r = Math.min(color.r + Math.floor((255 - color.r) * max), Math.floor(color.r + 255 * pow));
			var g = Math.min(color.g + Math.floor((255 - color.g) * max), Math.floor(color.g + 255 * pow));
			var b = Math.min(color.b + Math.floor((255 - color.b) * max), Math.floor(color.b + 255 * pow));
			return new Color(r, g, b, color.a);
		};
		/*
		Color.rgbaToHex = function (rgba) {
		    rgba = rgba.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
		    return (rgba && rgba.length === 4) ? "#" +
		        ("0" + parseInt(rgba[1], 10).toString(16)).slice(-2) +
		        ("0" + parseInt(rgba[2], 10).toString(16)).slice(-2) +
		        ("0" + parseInt(rgba[3], 10).toString(16)).slice(-2) : '';
		}
		*/
		Color.prototype = {
			toUint: function () {
				return (this.r << 24) + (this.g << 16) + (this.b << 8) + (this.a);
			},
			toHex: function () {
				return '#' + Color.componentToHex(this.r) + Color.componentToHex(this.g) + Color.componentToHex(this.b) + Color.componentToHex(this.a);
			},
			toRgba: function () {
				return 'rgba(' + this.r + ',' + this.g + ',' + this.b + ',' + (this.a / 255).toFixed(3) + ')';
			},
			dot: function (color) {
				return ((this.r / 255) * (color.r / 255) + (this.g / 255) * (color.g / 255) + (this.b / 255) * (color.b / 255));
			},
			alpha: function (pow, min, max) {
				min = min || 0;
				max = max || 1;
				this.a = Math.floor((min + (pow * (max - min))) * 255);
				return this;
			},
			makeSet: function () {
				this.foreground = Color.contrast(this);
				this.border = Color.darker(this, 0.3);
				this.light = Color.lighter(this, 0.3);
				return this;
			},
		};
		return Color;
    }]);

	app.factory('Shape', [function () {
		function Shape() {}
		Shape.shapeCircle = function (p, cx, cy, r, sa, ea) {
			sa = sa || 0;
			ea = ea || 2 * Math.PI;
			p.ctx.arc(cx, cy, r, sa, ea, false);
		};
		Shape.shapeStar = function (p, cx, cy, or, ir, steps) {
			var x, y;
			var angle = Math.PI / 2 * 3;
			var step = Math.PI / steps;
			var ctx = p.ctx;
			ctx.moveTo(cx, cy - or);
			for (i = 0; i < steps; i++) {
				x = cx + Math.cos(angle) * or;
				y = cy + Math.sin(angle) * or;
				ctx.lineTo(x, y);
				angle += step;
				x = cx + Math.cos(angle) * ir;
				y = cy + Math.sin(angle) * ir;
				ctx.lineTo(x, y);
				angle += step;
			}
			ctx.lineTo(cx, cy - or);
		};
		Shape.shapeRoundRect = function (p, rect, r) {
			var ctx = p.ctx,
				x = rect.x,
				y = rect.y,
				w = rect.w,
				h = rect.h;
			if (typeof r === undefined) {
				r = 4;
			}
			if (typeof r === 'number') {
				r = {
					tl: r,
					tr: r,
					br: r,
					bl: r
				};
			} else {
				var defaultRadius = {
					tl: 0,
					tr: 0,
					br: 0,
					bl: 0
				};
				for (var key in defaultRadius) {
					r[key] = r[key] || defaultRadius[key];
				}
			}
			ctx.moveTo(x + r.tl, y);
			ctx.lineTo(x + w - r.tr, y);
			ctx.quadraticCurveTo(x + w, y, x + w, y + r.tr);
			ctx.lineTo(x + w, y + h - r.br);
			ctx.quadraticCurveTo(x + w, y + h, x + w - r.br, y + h);
			ctx.lineTo(x + r.bl, y + h);
			ctx.quadraticCurveTo(x, y + h, x, y + h - r.bl);
			ctx.lineTo(x, y + r.tl);
			ctx.quadraticCurveTo(x, y, x + r.tl, y);
		};
		Shape.circle = function () {
			var params = Array.prototype.slice.call(arguments);
			var ctx = params[0].ctx;
			ctx.beginPath();
			Shape.shapeCircle.apply(this, params);
			ctx.closePath();
		};
		Shape.star = function () {
			var params = Array.prototype.slice.call(arguments);
			var ctx = params[0].ctx;
			ctx.beginPath();
			Shape.shapeStar.apply(this, params);
			ctx.closePath();
		};
		Shape.roundRect = function () {
			var params = Array.prototype.slice.call(arguments);
			var ctx = params[0].ctx;
			ctx.beginPath();
			Shape.shapeRoundRect.apply(this, params);
			ctx.closePath();
		};
		return Shape;
    }]);

	app.constant('PainterColors', {
		/*
		black: new Color('0x111111'),
		white: new Color('0xffffff'),
		red: new Color('0xff0000'),
		green: new Color('0x00ff00'),
		blue: new Color('0x0000ff'),
		yellow: new Color('0xffff00'),
		cyan: new Color('0x00ffff'),
		purple: new Color('0xff00ff'),
		*/
		black: '0x14191e',
		white: '0xffffff',
		blue: '0x0023FF',
		red: '0xF21500',
		lightBlue: '0x79ccf2',
		lightYellow: '0xfff79a',
		greyLighter: '0xf8f8f8',
		greyLight: '0xeeeeee',
		greyMedium: '0xcccccc',
		grey: '0x90939b',
		map: '0x24292e',
	});

	app.factory('Palette', ['$q', 'Painter', 'Rect', function ($q, Painter, Rect) {
		function Palette() {
			this.painter = new Painter().setSize(0, 0);
			this.buffer = new Painter().setSize(0, 0);
			this.size = {
				w: 0,
				h: 0
			};
			this.pool = {};
			this.rows = {};
		}
		Palette.prototype = {
			getRect: function (w, h) {
				var p = this.painter,
					size = this.size,
					rows = this.rows,
					r = new Rect(0, 0, w, h),
					row = rows[h] || {
						x: 0,
						y: size.h
					};
				size.w = Math.max(size.w, row.x + w);
				size.h = Math.max(size.h, row.y + h);
				if (!p.canvas.width && !p.canvas.height) {
					p.setSize(size.w, size.h);
				} else if (size.w > p.canvas.width || size.h > p.canvas.height) {
					// var img = new Image();
					// img.src = p.toDataURL();
					// document.body.appendChild(canvas);
					// console.log(p.canvas.width, p.canvas.height);
					// var data = p.ctx.getImageData(0, 0, p.canvas.width, p.canvas.height);
					var canvas = p.canvas;
					p.setCanvas(document.createElement('canvas'));
					p.setSize(size.w, size.h);
					p.ctx.drawImage(canvas, 0, 0);
					// p.ctx.putImageData(data, 0, 0);
					// p.ctx.drawImage(img, 0, 0);
					// document.body.removeChild(canvas);
				}
				r.x = row.x;
				r.y = row.y;
				row.x += w;
				rows[h] = row;
				return r;
			},
			add: function (key, path) {
				var palette = this;
				if (angular.isString(path)) {
					var deferred = $q.defer();
					var img = new Image();
					img.onload = function () {
						palette.addShape(key, img.width, img.height, function (p, rect) {
							p.ctx.drawImage(img, 0, 0);
						});
						deferred.resolve(img);
					};
					img.onerror = function () {
						deferred.reject('connot load ' + path);
					};
					img.src = path;
					return deferred.promise;
				} else {
					var params = Array.prototype.slice.call(arguments);
					return palette.addShape.apply(palette, params);
				}
			},
			addShape: function (key, w, h, callback) {
				var p = this.painter,
					r = this.getRect(w, h);
				p.ctx.save();
				p.ctx.rect(r.x, r.y, r.w, r.h);
				// p.ctx.stroke();
				p.ctx.clip();
				p.ctx.translate(r.x, r.y);
				callback.call(p, p, r.clone().setPos(0, 0));
				p.ctx.restore();
				this.pool[key] = r;
				// console.log('Painter.add', r);
			},
			draw: function (target, key, x, y, pre) {
				var r = this.pool[key];
				if (r) {
					// var ctx = target.ctx;
					// ctx.save();
					target.drawRect(this.painter.canvas, r, {
						x: x,
						y: y,
						w: r.w,
						h: r.h
					}, pre);
					// target.ctx.drawImage(this.painter.canvas, r.x, r.y, r.w, r.h, x - r.w / 2, y - r.h / 2, r.w, r.h);
					// ctx.restore();
				}
			},
			tint: function (target, key, x, y, color, pre) {
				var r = this.pool[key];
				if (r) {
					var p = this.painter,
						b = this.buffer.setSize(r.w, r.h);
					b.save();
					b.setFill(color);
					b.fillRect();
					b.ctx.globalCompositeOperation = "destination-atop";
					b.ctx.drawImage(p.canvas, r.x, r.y, r.w, r.h, 0, 0, r.w, r.h);
					b.restore();
					console.log(x, y, b.canvas, target.canvas);
					target.draw(b.canvas, {
						x: x,
						y: y
					}, pre);
				}
			},
			pattern: function (target, key, x, y, w, h, color) {
				function drawPattern(pattern) {
					var ctx = target.ctx;
					ctx.save();
					ctx.translate(x, y);
					// draw
					// ctx.beginPath();
					// ctx.rect(-x, -y, w, h);
					ctx.fillStyle = pattern;
					ctx.fillRect(-x, -y, w, h);
					ctx.translate(-x, -y);
					// ctx.fill();
					ctx.restore();
				}
				var r = this.pool[key];
				if (r) {
					var img = r.img,
						pattern;
					if (!img || r.color != color) {
						var b = this.buffer.setSize(r.w, r.h);
						if (color) {
							r.color = color;
							b.save();
							b.setFill(color);
							b.fillRect();
							b.ctx.globalCompositeOperation = "destination-atop";
							b.ctx.drawImage(this.painter.canvas, r.x, r.y, r.w, r.h, 0, 0, r.w, r.h);
							b.restore();
						} else {
							b.ctx.drawImage(this.painter.canvas, r.x, r.y, r.w, r.h, 0, 0, r.w, r.h);
						}
						img = new Image();
						img.onload = function () {
							r.img = img;
							pattern = target.ctx.createPattern(img, "repeat");
							drawPattern(pattern);
						};
						img.src = b.toDataURL();
					} else {
						pattern = target.ctx.createPattern(img, "repeat");
						drawPattern(pattern);
					}
				}
			},
		};
		return Palette;
    }]);

	app.factory('Painter', ['Shape', 'Rect', 'Color', 'PainterColors', function (Shape, Rect, Color, PainterColors) {
		function Painter(canvas) {
			canvas = canvas || document.createElement('canvas');
			this.rect = new Rect();
			this.drawingRect = new Rect();
			this.setColors();
			this.setCanvas(canvas);
		}
		Painter.colors = {};
		angular.forEach(PainterColors, function (value, key) {
			Painter.colors[key] = new Color(value).makeSet();
		});
		var colors = Painter.colors;
		Painter.prototype = {
			colors: Painter.colors,
			setColors: function () {
				var colors = this.colors;
				angular.forEach(PainterColors, function (value, key) {
					colors[key] = new Color(value).makeSet();
				});
			},
			setCanvas: function (canvas) {
				this.canvas = canvas;
				this.setSize(canvas.offsetWidth, canvas.offsetHeight);
				var ctx = canvas.getContext('2d');
				ctx.lineCap = 'square';
				this.ctx = ctx;
				return this;
			},
			setSize: function (w, h) {
				this.canvas.width = w;
				this.canvas.height = h;
				this.rect.w = w;
				this.rect.h = h;
				return this;
			},
			copy: function (canvas) {
				this.ctx.drawImage(canvas, 0, 0);
				return this;
			},
			clear: function () {
				this.resize();
				// this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
				return this;
			},
			resize: function () {
				this.setSize(this.canvas.offsetWidth, this.canvas.offsetHeight);
				return this;
			},
			setText: function (font, align, verticalAlign, color) {
				font = font || '11px monospace';
				align = align || 'center';
				verticalAlign = verticalAlign || 'middle';
				color = color || this.colors.black;
				var ctx = this.ctx;
				ctx.font = font;
				ctx.textAlign = align;
				ctx.textBaseline = verticalAlign;
				ctx.fillStyle = color.toRgba();
				return this;
			},
			setFill: function (color) {
				color = color || this.colors.black;
				var ctx = this.ctx;
				/*
				var my_gradient = ctx.createLinearGradient(0, 0, 0, 170);
				my_gradient.addColorStop(0, "black");
				my_gradient.addColorStop(1, "white");
				ctx.fillStyle = my_gradient;
				*/
				ctx.fillStyle = color.toRgba();
				return this;
			},
			setStroke: function (color, size) {
				color = color || this.colors.black;
				var ctx = this.ctx;
				size = size || 1;
				/*
				var gradient=ctx.createLinearGradient(0,0,170,0);
				gradient.addColorStop("0","magenta");
				gradient.addColorStop("0.5","blue");
				gradient.addColorStop("1.0","red");
				ctx.strokeStyle = gradient;
				*/
				// Fill with gradient
				ctx.strokeStyle = color.toRgba();
				ctx.lineWidth = size;
				return this;
			},
			/*
			drawRoundRect: function (rect, r) {
			    rect = rect || this.rect;
			    Shape.roundRect(this, rect, r);
			    return this;
			},
			*/
			fillText: function (text, point, width, post, maxLength) {
				if (width) {
					post = post || '';
					maxLength = maxLength || Math.floor(width / 8);
					if (text.length > maxLength) {
						text = text.substr(0, Math.min(text.length, maxLength)).trim() + post;
					}
				}
				this.ctx.fillText(text, point.x, point.y);
				return this;
			},
			fillRect: function (rect) {
				rect = rect || this.rect;
				var ctx = this.ctx,
					x = rect.x,
					y = rect.y,
					w = rect.w,
					h = rect.h;
				ctx.fillRect(x, y, w, h);
				return this;
			},
			strokeRect: function (rect) {
				rect = rect || this.rect;
				var ctx = this.ctx,
					x = rect.x,
					y = rect.y,
					w = rect.w,
					h = rect.h;
				ctx.strokeRect(x, y, w, h);
				return this;
			},
			fill: function () {
				this.ctx.fill();
				return this;
			},
			stroke: function () {
				this.ctx.stroke();
				return this;
			},
			begin: function () {
				this.ctx.beginPath();
				return this;
			},
			close: function () {
				this.ctx.closePath();
				return this;
			},
			save: function () {
				this.ctx.save();
				return this;
			},
			restore: function () {
				this.ctx.restore();
				return this;
			},
			rotate: function (angle) {
				this.ctx.rotate(angle * Math.PI / 180);
			},
			translate: function (xy) {
				this.ctx.translate(xy.x, xy.y);
			},
			toDataURL: function () {
				return this.canvas.toDataURL();
			},
			draw: function (image, t, pre) {
				if (image) {
					t.w = t.w || image.width;
					t.h = t.h || image.height;
					var ctx = this.ctx,
						rect = this.drawingRect,
						x = rect.x = t.x - t.w / 2,
						y = rect.y = t.y - t.h / 2,
						w = rect.w = t.w,
						h = rect.h = t.h;
					ctx.save();
					ctx.translate(x, y);
					if (pre) {
						pre.call(this);
					}
					ctx.drawImage(image, 0, 0);
					ctx.restore();
					// console.log('painter.draw', x, y, w, h);
				}
				return this;
			},
			drawRect: function (image, s, t, pre) {
				if (image) {
					s.w = s.w || image.width;
					s.h = s.h || image.height;
					t.w = t.w || image.width;
					t.h = t.h || image.height;
					var ctx = this.ctx,
						rect = this.drawingRect,
						x = rect.x = t.x - s.w / 2,
						y = rect.y = t.y - s.h / 2,
						w = rect.w = t.w,
						h = rect.h = t.h;
					ctx.save();
					ctx.translate(x, y);
					if (pre) {
						pre.call(this);
					}
					ctx.drawImage(image, s.x, s.y, s.w, s.h, 0, 0, t.w, t.h);
					ctx.restore();
					// console.log('painter.drawRect', x, y, w, h);
				}
				return this;
			},
			flip: function (scale) {
				scale = scale || {
					x: 1,
					y: -1
				};
				var ctx = this.ctx,
					rect = this.drawingRect;
				ctx.translate(scale.x === -1 ? rect.w : 0, scale.y === -1 ? rect.h : 0);
				ctx.scale(scale.x, scale.y);
			},
		};
		return Painter;
    }]);

}());

/* global angular */

(function() {
    "use strict";

    var app = angular.module('artisan');

    app.directive('controlMessages', [function() {
        return {
            restrict: 'E',
            templateUrl: 'artisan/forms/messages',
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
                var template = 'artisan/forms/text';
                switch (attributes.control) {
                    case 'select':
                        template = 'artisan/forms/select';
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
                var template = 'artisan/forms/text';
                switch (attributes.control) {
                    case 'select':
                        template = 'artisan/forms/select';
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
/* global angular */

(function () {
	"use strict";

	var app = angular.module('artisan');

	app.directive('modalView', ['$parse', '$templateRequest', '$compile', '$controller', 'Dom', function ($parse, $templateRequest, $compile, $controller, Dom) {

		function compileController(scope, element, html, data) {
			// console.log('modalView.compileController', element);
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

		return {
			restrict: 'A',
			priority: -400,
			link: function (scope, element, attributes, model) {
				var modal = $parse(attributes.modalView);
				modal = modal(scope);
				modal.templateUrl = modal.templateUrl || 'artisan/modals/modal';
				$templateRequest(modal.templateUrl).then(function (html) {
					compileController(scope, element, html, modal);
				});
				/*
				// window.scrollTo(0, element[0].offsetTop - 100);
				function onClick(e) {
				    var closest = Dom.getClosestElement(e.target, element[0]);
				    if (closest === null) {
				        modal.reject(null);
				    }
				    // console.log('onClick', closest);
				}
				function addListeners() {
				    angular.element(window).on('click', onClick);
				}
				function removeListeners() {
				    angular.element(window).off('click', onClick);
				}
				scope.$on('destroy', function () {
				    removeListeners();
				});
				setTimeout(function () {
				    addListeners();
				}, 500);
				*/
			}
		};
    }]);

}());
/* global angular */

(function() {
    "use strict";

    var app = angular.module('artisan');

    app.provider('$modal', [function $modalProvider() {

        var modals = [];
        var routes = {};

        this.modals = modals;
        this.routes = routes;
        this.when = when;

        function when(path, modal) {
            routes[path] = modal;
            return this;
        }

        this.$get = ['$q', '$timeout', function modalFactory($q, $timeout) {

            function popModal(modal) {
                // console.log('modalProvider.popModal', modal);                
                var index = -1;
                angular.forEach(modals, function(m, i) {
                    if (m === modal) {
                        index = i;
                    }
                });
                if (index !== -1) {
                    $timeout(function() {
                        modal.active = false;
                        modals.splice(index, 1);
                        if (modals.length) {
                            modals[modals.length - 1].active = true;
                        }
                    });
                }
            }

            function closeModal(modal) {
                // console.log('modalProvider.closeModal', modal);                
                var index = -1;
                angular.forEach(modals, function(m, i) {
                    if (m === modal) {
                        index = i;
                    }
                });
                if (index !== -1) {
                    modal.active = false;
                    $timeout(function() {
                        while (modals.length) {
                            modals.splice(modals.length - 1, 1);
                        }
                    }, 500);
                }
            }

            function addModal(path, params) {
                // console.log('modalProvider.addModal', path, params);
                var deferred = $q.defer();
                params = params || null;
                var modal = {
                    title: 'Untitled',
                    controller: null,
                    templateUrl: null,
                    params: params,
                };
                var current = routes[path];
                if (current) {
                    angular.extend(modal, current);
                }
                modal.deferred = deferred;
                modal.back = function(data) {
                    popModal(this);
                    modal.deferred.resolve(data, modal);
                }
                modal.resolve = function(data) {
                    closeModal(this);
                    modal.deferred.resolve(data, modal);
                }
                modal.reject = function() {
                    closeModal(this);
                    modal.deferred.reject(modal);
                }
                modals.push(modal);
                angular.forEach(modals, function(m, i) {
                    m.active = false;
                });
                if (modals.length) {
                    modal.active = true;
                } else {
                    $timeout(function() {
                        modal.active = true;
                        // window.scrollTo(0, 0);
                    }, 500);
                }
                return deferred.promise;
            }

            return {
                modals: modals,
                addModal: addModal,
            };
        }];

    }]);

}());
/* global angular */

(function () {
	"use strict";

	var app = angular.module('artisan');

	app.directive('nav', ['$parse', 'Nav', function ($parse, Nav) {
		return {
			restrict: 'A',
			templateUrl: function (element, attributes) {
				return attributes.template || 'artisan/nav/nav';
			},
			scope: {
				items: '=nav',
			},
			link: function (scope, element, attributes, model) {
				scope.$watch('items', function (value) {
					// console.log(value instanceof Nav, value);
					if (value) {
						if (angular.isArray(value)) {
							var onLink = $parse(attributes.onLink)(scope.$parent);
							var onNav = $parse(attributes.onNav)(scope.$parent);
							var nav = new Nav({
								onLink: onLink,
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
		};
    }]);

	app.directive('navItem', ['$timeout', function ($timeout) {
		return {
			restrict: 'A',
			templateUrl: function (element, attributes) {
				return attributes.template || 'artisan/nav/nav-item';
			},
			scope: {
				item: '=navItem',
			},
			link: function (scope, element, attributes, model) {
				var navItem = angular.element(element[0].querySelector('.nav-link'));

				var output;

				function itemOpen(item, immediate) {
					var state = item.$nav.state;
					state.active = true;

					$timeout(function () {
						state.immediate = immediate;
						state.closed = state.closing = false;
						state.opening = true;
						$timeout(function () {
							state.opening = false;
							state.opened = true;
						});
					});
				}

				function itemClose(item, immediate) {
					var state = item.$nav.state;
					state.active = false;
					$timeout(function () {
						state.immediate = immediate;
						state.opened = state.opening = false;
						state.closing = true;
						$timeout(function () {
							state.closing = false;
							state.closed = true;
						});
					});
					if (item.items) {
						angular.forEach(item.items, function (o) {
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
							angular.forEach(item.$nav.parent.items, function (o) {
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

				function onTap(e) {
					var item = scope.item;
					// console.log('Item.onTap', item);
					var state = item.$nav.state;
					if (state.active) {
						output = false;
						trigger();
					} else if (item.$nav.onNav) {
						var promise = item.$nav.onNav(item, item.$nav);
						if (promise && typeof promise.then === 'function') {
							promise.then(function (resolved) {
								// go on
								trigger();
							}, function (rejected) {
								// do nothing
							});
							output = false;
						} else {
							output = promise;
							trigger();
						}
					}

					function trigger() {
						$timeout(function () {
							itemToggle(item);
						});
					}
				}

				function onTouchStart(e) {
					// console.log('Item.onTouchStart', e);
					onTap(e);
					navItem
						.off('mousedown', onMouseDown);
					// return r || prevent(e);
				}

				function onMouseDown(e) {
					// console.log('Item.onMouseDown', e);
					onTap(e);
					navItem
						.off('touchstart', onTouchStart);
					// return r || prevent(e);
				}

				function onClick(e) {
					// console.log('Item.onClick', e);
					return prevent(e);
				}

				function prevent(e) {
					if (output === false) {
						// console.log('Item.prevent', e);
						e.preventDefault();
						// e.stopPropagation();
						return false;
					}
				}

				function addListeners() {
					navItem
						.on('touchstart', onTouchStart)
						.on('mousedown', onMouseDown)
						.on('click', onClick);
				}

				function removeListeners() {
					navItem
						.off('touchstart', onTouchStart)
						.off('mousedown', onMouseDown)
						.off('click', onClick);
				}

				addListeners();

				scope.$on('$destroy', function () {
					removeListeners();
				});
			}
		};
    }]);

}());

/* global angular */

(function () {
	"use strict";

	var app = angular.module('artisan');

	app.factory('Nav', ['Silent', function (Silent) {

		function Nav(options) {
			var nav = this;
			var defaults = {
				items: [],
			}
			angular.extend(nav, defaults);
			if (options) {
				angular.extend(nav, options);
			}
			nav.setNav(nav, null);
		}

		var statics = {
			silent: NavSilent,
			path: NavPath,
		};

		var methods = {
			addItem: addItem,
			addItems: addItems,
			getLink: getLink,
			setItems: setItems,
			setNav: setNav,
			setNavs: setNavs,
		};

		angular.extend(Nav, statics);
		angular.extend(Nav.prototype, methods);

		return Nav;

		// static methods

		function NavSilent(path) {
			Silent.silent(path);
		}

		function NavPath(path) {
			Silent.path(path);
		}

		// prototype methods

		function setItems(items) {
			var nav = this;
			nav.path = Silent.path();
			nav.items = items;
			nav.setNavs(items, nav);
		}

		function setNavs(items, parent) {
			var nav = this;
			if (items) {
				angular.forEach(items, function (item) {
					nav.setNav(item, parent);
					nav.setNavs(item.items, item);
				});
			}
		}

		function setNav(item, parent) {
			var nav = this;
			var $nav = {
				parent: parent || null,
				level: parent ? parent.$nav.level + 1 : 0,
				state: {},
				addItems: function (x) {
					nav.addItems(x, item);
				},
				onNav: nav.onNav,
			};
			item.$nav = $nav;
			$nav.link = nav.getLink(item);
			if ($nav.link === nav.path) {
				$nav.state.active = true;
				$nav.state.opened = true;
				while ($nav.parent) {
					$nav = $nav.parent.$nav;
					$nav.state.active = true;
					$nav.state.opened = true;
				}
			}
		}

		function addItems(itemOrItems, parent) {
			var nav = this;
			if (angular.isArray(itemOrItems)) {
				angular.forEach(itemOrItems, function (item) {
					nav.addItem(item, parent);
				});
			} else {
				nav.addItem(itemOrItems, parent);
			}
		}

		function addItem(item, parent) {
			var nav = this,
				onLink = nav.onLink,
				onNav = nav.onNav;
			nav.setNav(item, parent);
			if (parent) {
				parent.items = parent.items || [];
				parent.items.push(item);
			}
		}

		function getLink(item) {
			var link = null;
			if (this.onLink) {
				link = this.onLink(item, item.$nav);
			} else {
				link = item.link;
			}
			return link;
		}

    }]);

}());
/* global angular */

(function() {
    "use strict";

    window.ondragstart = function() {
        return false;
    };

    var app = angular.module('artisan');

    app.directive('scrollableX', ['$parse', '$compile', '$window', '$timeout', 'Scrollable', 'Animate', 'Style', 'Events', 'Utils', function($parse, $compile, $window, $timeout, Scrollable, Animate, Style, Events, Utils) {
        return {
            restrict: 'A',
            template: '<div class="content" ng-transclude></div>',
            transclude: true,
            link: function(scope, element, attributes, model) {

                var onLeft, onRight, showIndicatorFor, scrollableWhen;
                if (attributes.onLeft) {
                    onLeft = $parse(attributes.onLeft);
                }
                if (attributes.onRight) {
                    onRight = $parse(attributes.onRight);
                }
                if (attributes.showIndicatorFor) {
                    showIndicatorFor = $parse(attributes.showIndicatorFor);
                }
                if (attributes.scrollableWhen) {
                    scrollableWhen = $parse(attributes.scrollableWhen);
                }

                // ELEMENTS & STYLESHEETS;
                element.attr('unselectable', 'on').addClass('unselectable');
                var containerNode = element[0];
                var contentNode = containerNode.querySelector('.content');
                var content = angular.element(content);
                var contentStyle = new Style();

                var animate = new Animate(render);

                var scrollable = attributes.scrollableX ? $parse(attributes.scrollableX)(scope) : new Scrollable();
                link(scrollable);

                function link(scrollable) {
                    scrollable.link({
                        getItems: function() {
                            if (attributes.scrollableItem) {
                                var items = containerNode.querySelectorAll(attributes.scrollableItem);
                                return items;
                            }
                        },
                        prev: function() {
                            scrollable.scrollPrev();
                            animate.play();
                        },
                        next: function() {
                            scrollable.scrollNext();
                            animate.play();
                        },
                        reset: function() {
                            scrollable.doReset();
                            animate.play();
                        },
                        onLeft: onLeft,
                        onRight: onRight,
                    });
                }

                /*
                scope.$watch(attributes.scrollableX, function (newValue) {
                	console.log(newValue);
                });
                */

                /*
                var indicator = null,
                	indicatorNode = null,
                	indicatorStyle;
                showIndicatorFor = false;
                if (showIndicatorFor) {
                	indicator = angular.element('<div class="indicator"></div>');
                	indicatorNode = indicator[0];
                	indicatorStyle = new Style();
                	element.append(indicator);
                	$compile(indicator.contents())(scope);
                	var i = scrollbar.getIndicator();
                	indicatorStyle.transform('translate3d(' + i.x.toFixed(2) + 'px,' + i.y.toFixed(2) + 'px,0)');
                	indicatorStyle.set(indicatorNode);
                }
                */

                function render(time) {
                    scrollable.setContainer(containerNode);
                    scrollable.setContent(contentNode);
                    scrollable.setEnabled(isEnabled());
                    var animating = scrollable.renderX();
                    if (!animating) {
                        // animate.pause();
                    }
                    var current = scrollable.getCurrent();
                    contentStyle.transform('translate3d(' + current.x.toFixed(2) + 'px,0,0)');
                    contentStyle.set(contentNode);
                    /*
                    if (showIndicatorFor) {
                    	if (dragging || wheeling || speed) {
                    		var percent = c.x / (containerNode.offsetWidth - contentNode.offsetWidth);
                    		percent = Math.max(0, Math.min(1, percent));
                    		i.x = (containerNode.offsetWidth - indicatorNode.offsetWidth) * (percent);
                    		i.y += (0 - i.y) / 4;
                    		// var count = Math.round(contentNode.offsetWidth / 315);
                    		var index = Math.max(1, Math.round(percent * showIndicatorFor.rows.length));
                    		indicator.html(index + '/' + showIndicatorFor.count);
                    		// indicator.html((percent * 100).toFixed(2).toString());
                    	} else {
                    		i.y += (45 - i.y) / 4;
                    	}
                    	indicatorStyle.transform('translate3d(' + i.x.toFixed(2) + 'px,' + i.y.toFixed(2) + 'px,0)');
                    	indicatorStyle.set(indicatorNode);
                    }
                    */
                }

                function undrag() {
                    scrollable.off();
                    dragOff();
                }

                function onDown(event) {
                    if (scrollable.dragStart(event.absolute)) {
                        dragOn();
                        animate.play();
                    }
                }

                function onMove(event) {
                    scrollable.dragMove(event.absolute);
                    var drag = scrollable.getDrag();
                    if (Math.abs(drag.y) > Math.abs(drag.x)) {
                        onUp(event);
                    } else {
                        event.stop();
                    }
                }

                function onUp(event) {
                    scrollable.dragEnd(event.absolute);
                    event.stop();
                    dragOff();
                }

                function _onScrollX(dir, interval) {
                    return scrollable.wheelX(dir, interval);
                }

                var onScrollX = _onScrollX;
                // var onScrollX = Utils.throttle(_onScrollX, 25);

                function onWheel(event) {
                    // console.log('onWheelX', event.dir, scrollable.wheelXCheck(event.dir));
                    if (scrollable.wheelXCheck(event.dir)) {
                        onScrollX(event.dir, event.interval);
                        animate.play();
                        event.stop();
                    }
                }

                function off() {
                    dragOff();
                    // animate.pause();
                    scrollable.off();
                }

                function isEnabled() {
                    var enabled = true;
                    if (scrollableWhen) {
                        enabled = enabled && scrollableWhen(scope);
                    }
                    enabled = enabled && $window.innerWidth >= 1024;
                    enabled = enabled && (containerNode.offsetWidth < contentNode.offsetWidth);
                    return enabled;
                }

                function onResize() {
                    var enabled = isEnabled();
                    if (!enabled) {
                        off();
                    }
                    render();
                }

                scope.$watch(function() {
                    return contentNode.offsetWidth;
                }, function(newValue, oldValue) {
                    onResize();
                });

                var events = new Events(element).add({
                    down: onDown,
                    wheel: onWheel,
                }, scope);

                var windowEvents = new Events($window).add({
                    resize: onResize,
                }, scope);

                function dragOn() {
                    windowEvents.add({
                        move: onMove,
                        up: onUp,
                    }, scope);
                }

                function dragOff() {
                    windowEvents.remove({
                        move: onMove,
                        up: onUp,
                    });
                }

                scope.$on('$destroy', function() {
                    animate.pause();
                });

            },
        };
    }]);

    app.directive('scrollableY', ['$parse', '$compile', '$window', '$timeout', 'Scrollable', 'Animate', 'Style', 'Events', 'Utils', function($parse, $compile, $window, $timeout, Scrollable, Animate, Style, Events, Utils) {
        return {
            restrict: 'A',
            template: '<div class="content" ng-transclude></div>',
            transclude: true,
            link: function(scope, element, attributes, model) {

                var onTop, onBottom, showIndicatorFor, scrollableWhen;
                if (attributes.onTop) {
                    onTop = $parse(attributes.onTop);
                }
                if (attributes.onBottom) {
                    onBottom = $parse(attributes.onBottom);
                }
                if (attributes.showIndicatorFor) {
                    showIndicatorFor = $parse(attributes.showIndicatorFor);
                }
                if (attributes.scrollableWhen) {
                    scrollableWhen = $parse(attributes.scrollableWhen);
                }

                // ELEMENTS & STYLESHEETS;
                element.attr('unselectable', 'on').addClass('unselectable');
                var containerNode = element[0];
                var contentNode = containerNode.querySelector('.content');
                var content = angular.element(content);
                var contentStyle = new Style();

                var animate = new Animate(render);

                var scrollable = attributes.scrollableY ? $parse(attributes.scrollableY)(scope) : new Scrollable();
                link(scrollable);

                function link(scrollable) {
                    scrollable.link({
                        getItems: function() {
                            if (attributes.scrollableItem) {
                                var items = containerNode.querySelectorAll(attributes.scrollableItem);
                                return items;
                            }
                        },
                        prev: function() {
                            scrollable.scrollPrev();
                            animate.play();
                        },
                        next: function() {
                            scrollable.scrollNext();
                            animate.play();
                        },
                        reset: function() {
                            scrollable.doReset();
                            animate.play();
                        },
                        onTop: onTop,
                        onBottom: onBottom,
                    });
                }

                function render(time) {
                    scrollable.setContainer(containerNode);
                    scrollable.setContent(contentNode);
                    scrollable.setEnabled(isEnabled());
                    var animating = scrollable.renderY();
                    if (!animating) {
                        // animate.pause();
                    }
                    var current = scrollable.getCurrent();
                    contentStyle.transform('translate3d(0,' + current.y.toFixed(2) + 'px,0)');
                    contentStyle.set(contentNode);
                }

                function undrag() {
                    scrollable.off();
                    dragOff();
                }

                function onDown(event) {
                    if (scrollable.dragStart(event.absolute)) {
                        dragOn();
                        animate.play();
                    }
                }

                function onMove(event) {
                    scrollable.dragMove(event.absolute);
                    var drag = scrollable.getDrag();
                    if (Math.abs(drag.x) > Math.abs(drag.y)) {
                        onUp(event);
                    } else {
                        event.stop();
                    }
                }

                function onUp(event) {
                    scrollable.dragEnd(event.absolute);
                    event.stop();
                    dragOff();
                }

                function _onScrollY(dir, interval) {
                    return scrollable.wheelY(dir, interval);
                }

                var onScrollY = _onScrollY;
                // var onScrollY = Utils.throttle(_onScrollY, 25);

                function onWheel(event) {
                    // console.log('onWheelY', event.dir, scrollable.wheelYCheck(event.dir));
                    if (scrollable.wheelYCheck(event.dir)) {
                        onScrollY(event.dir, event.interval);
                        animate.play();
                        event.stop();
                    }
                }

                function off() {
                    dragOff();
                    // animate.pause();
                    scrollable.off();
                }

                function isEnabled() {
                    var enabled = true;
                    if (scrollableWhen) {
                        enabled = enabled && scrollableWhen(scope);
                    }
                    enabled = enabled && $window.innerWidth >= 1024;
                    enabled = enabled && (containerNode.offsetHeight < contentNode.offsetHeight);
                    return enabled;
                }

                function onResize() {
                    var enabled = isEnabled();
                    if (!enabled) {
                        off();
                    }
                    render();
                }

                scope.$watch(function() {
                    return contentNode.offsetHeight;
                }, function(newValue, oldValue) {
                    onResize();
                });

                var events = new Events(element).add({
                    down: onDown,
                    wheel: onWheel,
                }, scope);

                var windowEvents = new Events($window).add({
                    resize: onResize,
                }, scope);

                function dragOn() {
                    windowEvents.add({
                        move: onMove,
                        up: onUp,
                    }, scope);
                }

                function dragOff() {
                    windowEvents.remove({
                        move: onMove,
                        up: onUp,
                    });
                }

                scope.$on('$destroy', function() {
                    animate.pause();
                });

            },
        };
    }]);

}());
/* global angular */

(function () {
	"use strict";

	var app = angular.module('artisan');

	app.factory('Scrollable', ['Utils', 'Point', 'Rect', function (Utils, Point, Rect) {

		function Scrollable() {

			var padding = 150;
			var enabled, snappable, busy, dragging, wheeling, down, move, prev;
			var currentIndex = 0;

			snappable = true;

			var start = new Point(),
				end = new Point(),
				current = new Point(),
				drag = new Point(),
				indicator = new Point(),
				offset = new Point(),
				speed = new Point(),
				container = new Rect(),
				content = new Rect(),
				overflow = new Rect();

			var scrollable = {
				// properties
				start: start,
				end: end,
				current: current,
				indicator: indicator,
				speed: speed,
				overflow: overflow,
				container: container,
				content: content,
				// methods
				setContainer: setContainer,
				setContent: setContent,
				setEnabled: setEnabled,
				getCurrent: getCurrent,
				getDrag: getDrag,
				getIndicator: getIndicator,
				scrollToIndex: scrollToIndex,
				scrollPrev: scrollPrev,
				scrollNext: scrollNext,
				dragStart: dragStart,
				dragMove: dragMove,
				dragEnd: dragEnd,
				doReset: doReset,
				off: off,
				// x direction
				doLeft: doLeft,
				doRight: doRight,
				renderX: renderX,
				scrollToX: scrollToX,
				wheelX: wheelX,
				wheelXCheck: wheelXCheck,
				// y direction
				doTop: doTop,
				doBottom: doBottom,
				renderY: renderY,
				scrollToY: scrollToY,
				wheelY: wheelY,
				wheelYCheck: wheelYCheck,
			};

			angular.extend(this, scrollable);

			scrollable = this;

			function setContainer(node) {
				container.width = node.offsetWidth;
				container.height = node.offsetHeight;
			}

			function setContent(node) {
				content.width = node.offsetWidth;
				content.height = node.offsetHeight;
			}

			function setEnabled(flag) {
				enabled = flag;
			}

			function getCurrent() {
				return current;
			}

			function getDrag() {
				return drag;
			}

			function getIndicator() {
				return indicator;
			}

			function scrollToIndex(index) {
				if (index !== currentIndex) {
					currentIndex = index;
					var item = getItemAtIndex(index);
					if (item) {
						offset = new Point(
							item.offsetLeft,
							item.offsetTop
						);
						// console.log('scrollToIndex', index, offset);
					}
					return true;
				}
			}

			function dragStart(point) {
				if (!busy) {
					start.x = end.x = current.x;
					start.y = end.y = current.y;
					speed.x = 0;
					speed.y = 0;
					down = point;
					currentIndex = -1;
					wheeling = false;
					return true;
				} else {
					return false;
				}
			}

			function dragMove(point) {
				prev = move;
				move = point;
				drag.x = move.x - down.x;
				drag.y = move.y - down.y;
				dragging = true;
			}

			function dragEnd() {
				if (move && prev) {
					speed.x += (move.x - prev.x) * 4;
					speed.y += (move.y - prev.y) * 4;
				}
				start.x = end.x = current.x;
				start.y = end.y = current.y;
				dragging = false;
				move = null;
				down = null;
				prev = null;
			}

			function getItemAtIndex(index) {
				var item = null;
				var items = scrollable.getItems();
				if (items) {
					if (index >= 0 && index < items.length) {
						item = items[index];
					}
				}
				// console.log('getItemAtIndex', index, items.length, item);
				return item;
			}

			function scrollPrev() {
				var index = Math.max(0, currentIndex - 1);
				// console.log('scrollPrev', index);
				scrollToIndex(index);
			}

			function scrollNext() {
				var items = scrollable.getItems();
				var index = Math.min(items.length - 1, currentIndex + 1);
				// console.log('scrollNext', index);
				scrollToIndex(index);
			}

			function doReset() {
				end.x = current.x = 0;
			}

			function off() {
				dragging = false;
				wheeling = false;
				move = null;
				down = null;
			}

			// x - direction

			function doLeft(scope) {
				if (busy) {
					return;
				}
				if (!scrollable.onLeft) {
					return;
				}
				busy = true;
				scrollable.onLeft(scope).then().finally(function () {
					scrollToX(0);
				});
			}

			function doRight(scope) {
				if (busy) {
					return;
				}
				if (!scrollable.onRight) {
					return;
				}
				busy = true;
				scrollable.onRight(scope).then().finally(function () {
					var right = container.width - content.width;
					if (right > overflow.width) {
						start.x = end.x = overflow.width;
					} else {
						start.x = end.x = overflow.width + padding;
					}
					scrollToX(0);
				});
			}

			function renderX() {
				var animating = true;
				if (enabled) {
					overflow.x = 0;
					overflow.width = container.width - content.width;
					if (dragging) {
						end.x = start.x + move.x - down.x;
						if (extendX()) {
							start.x = end.x;
							down.x = move.x;
						}
					} else if (speed.x) {
						end.x += speed.x;
						speed.x *= 0.75;
						if (wheeling) {
							extendX();
						}
						if (Math.abs(speed.x) < 2.05) {
							speed.x = 0;
							scrollable.wheeling = wheeling = false;
							snapToNearestX();
						}
					} else if (offset) {
						end.x = -offset.x;
						offset = null;
					}
					end.x = Math.round(end.x * 10000) / 10000;
					end.x = Math.min(overflow.x, end.x);
					end.x = Math.max(overflow.width, end.x);
					current.x += (end.x - current.x) / 4;
					if (speed.x === 0 && Math.abs(end.x - current.x) < 0.05) {
						current.x = end.x;
						if (!snapToNearestX()) {
							animating = false;
						}
					}
					// console.log('renderX', current.x, end.x, overflow.x);
				} else {
					current.x = end.x = 0;
					animating = false;
				}
				return animating;
			}

			function extendX() {
				var extending = false;
				overflow.x += padding;
				overflow.width -= padding;
				if (end.x > overflow.x) {
					extending = true;
					doLeft();
				} else if (end.x < overflow.width) {
					extending = true;
					doRight();
				}
				return extending;
			}

			function snapToNearestX() {
				var items = scrollable.getItems();
				if (items) {
					var index = -1;
					var min = Number.POSITIVE_INFINITY;
					angular.forEach(items, function (item, i) {
						var distance = Math.abs((end.x + speed.x) - (item.offsetLeft * -1));
						if (distance < min) {
							min = distance;
							index = i;
						}
					});
					if (index !== -1) {
						if (snappable) {
							return scrollToIndex(index);
						} else {
							currentIndex = index;
						}
					}
				}
			}

			function wheelXCheck(dir) {
				// console.log('wheelYCheck', dir < 0 ? (end.x - overflow.width) : (end.x - overflow.x));
				if (!busy && enabled) {
					if (dir < 0) {
						return end.x - overflow.width;
					} else {
						return end.x - overflow.x;
					}
				} else {
					return false;
				}
			}

			function wheelX(dir, interval) {
				end.x += dir * 100 / 1000 * interval;
				speed.x += dir * 100 / 1000 * interval;
				wheeling = true;
			}

			function scrollToX(value) {
				start.x = end.x = value;
				setTimeout(function () {
					off();
					busy = false;
				}, 500);
			}

			// y - direction

			function doTop(scope) {
				if (busy) {
					return;
				}
				if (!scrollable.onTop) {
					return;
				}
				busy = true;
				scrollable.onTop(scope).then().finally(function () {
					scrollToY(0);
				});
			}

			function doBottom(scope) {
				if (busy) {
					return;
				}
				if (!scrollable.onBottom) {
					return;
				}
				busy = true;
				scrollable.onBottom(scope).then().finally(function () {
					var bottom = container.height - content.height;
					if (bottom > overflow.height) {
						start.y = end.y = overflow.height;
					} else {
						start.y = end.y = overflow.height + padding;
					}
					scrollToY(0);
				});
			}

			function renderY() {
				var animating = true;
				if (enabled) {
					overflow.y = 0;
					overflow.height = container.height - content.height;
					if (dragging) {
						end.y = start.y + move.y - down.y;
						if (extendY()) {
							start.y = end.y;
							down.y = move.y;
						}
					} else if (speed.y) {
						end.y += speed.y;
						speed.y *= 0.75;
						if (wheeling) {
							extendY();
						}
						if (Math.abs(speed.y) < 2.05) {
							speed.y = 0;
							scrollable.wheeling = wheeling = false;
							snapToNearestY();
						}
					} else if (offset) {
						end.y = -offset.y;
						offset = null;
					}
					end.y = Math.round(end.y * 10000) / 10000;
					end.y = Math.min(overflow.y, end.y);
					end.y = Math.max(overflow.height, end.y);
					current.y += (end.y - current.y) / 4;
					if (speed.y === 0 && Math.abs(end.y - current.y) < 0.05) {
						current.y = end.y;
						if (!snapToNearestY()) {
							animating = false;
						}
					}
					// console.log(parseFloat(current.y.toFixed(6)), end.y, overflow.y);
					// console.log(dragging, wheeling, end.y, speed.y, Math.abs(end.y - current.y));
				} else {
					current.y = end.y = 0;
					animating = false;
				}
				return animating;
			}

			function extendY() {
				var extending = false;
				overflow.y += padding;
				overflow.height -= padding;
				if (end.y > overflow.y) {
					extending = true;
					doTop();
				} else if (end.y < overflow.height) {
					extending = true;
					doBottom();
				}
				return extending;
			}

			function snapToNearestY() {
				var items = scrollable.getItems();
				if (items) {
					var index = -1;
					var min = Number.POSITIVE_INFINITY;
					angular.forEach(items, function (item, i) {
						var distance = Math.abs((end.y + speed.y) - (item.offsetTop * -1));
						if (distance < min) {
							min = distance;
							index = i;
						}
					});
					// console.log('snapToNearestY', index, min);
					if (index !== -1) {
						if (snappable) {
							return scrollToIndex(index);
						} else {
							currentIndex = index;
						}
					}
				}
			}

			function wheelYCheck(dir) {
				// console.log('wheelYCheck', dir < 0 ? (end.y - overflow.height) : (end.y - overflow.y));
				if (!busy && enabled) {
					if (dir < 0) {
						return end.y - overflow.height;
					} else {
						return end.y - overflow.y;
					}
				} else {
					return false;
				}
			}

			function wheelY(dir, interval) {
				end.y += dir * 100 / 1000 * interval;
				speed.y += dir * 100 / 1000 * interval;
				wheeling = true;
			}

			function scrollToY(value) {
				start.y = end.y = value;
				setTimeout(function () {
					off();
					busy = false;
				}, 500);
			}

		}

		function link(methods) {
			angular.extend(this, methods);
		}

		Scrollable.prototype = {
			link: link,
			getItems: function () {
				return [content];
			},
		};
		return Scrollable;
    }]);

}());
/* global angular */
(function () {
	"use strict";

	var app = angular.module('artisan');

	// micro interactions

	function tap(Events) {
		return {
			restrict: 'A',
			priority: 0,
			link: link
		};

		function link(scope, element, attributes, model) {
			if (attributes.ngBind) {
				return;
			}
			/*
			if (attributes.href === '#' && !attributes.ngHref && !attributes.ngClick) {
				return;
            }
            */

			element.addClass('interaction-tap');
			var node = document.createElement('interaction');
			element[0].appendChild(node);

			function onDown(e) {
				element.removeClass('interaction-animate');
				void element.offsetWidth;
				// node.style.animationPlayState = "paused";
				node.style.left = e.relative.x + 'px';
				node.style.top = e.relative.y + 'px';
				setTimeout(function () {
					element.addClass('interaction-animate');
					setTimeout(function () {
						element.removeClass('interaction-animate');
					}, 1000);
				}, 10);

				// console.log('tap.onDown', node, node.parentElement);
			}
			var listeners = { // down, move, up, click
				down: onDown,
			};
			var events = new Events(element).add(listeners, scope); // passing scope to add remove listeners automatically on $destroy
		}
	}
	app.directive('ngHref', ['Events', tap]);
	app.directive('ngClick', ['Events', tap]);

}());