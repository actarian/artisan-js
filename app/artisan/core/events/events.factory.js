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