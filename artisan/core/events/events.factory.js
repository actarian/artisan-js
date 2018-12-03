/* global angular */

(function() {
	"use strict";

	var app = angular.module('artisan');

	app.factory('Event', ['EventsService', 'Dom', 'Point', 'Rect', function(EventsService, Dom, Point, Rect) {

		function Event(event, element) {
			try {
				event = event || window.event;
				var type = event.type;
				var originalEvent = event.originalEvent ? event.originalEvent : event;
				var node = element[0]; // Dom.getNode(element);
				var offset = Dom.getNodeOffset(node);
				var rect = Dom.getBoundRect(node);
				var view = Dom.getView();
				var scroll = Dom.getPageScroll();
				var point = Dom.getPointInView(event);
				if (point) {
					var absolute = new Point(point.x - scroll.x, point.y - scroll.y);
					var relative = new Point(absolute.x - rect.left, absolute.y - rect.top);
					this.point = point;
					this.absolute = absolute;
					this.relative = relative;
				}
				var delta = Dom.getDelta(event);
				if (delta) {
					this.delta = delta;
					this.dir = delta.dir;
				}
				this.event = event;
				this.type = type;
				this.originalEvent = originalEvent;
				this.element = element;
				this.node = node;
				this.offset = offset;
				this.rect = rect;
				this.view = view;
				this.scroll = scroll;
				this.timestamp = new Date().getTime();
			} catch (error) {
				console.log('Event.error', error);
			}
		}

		var statics = {};

		var publics = {
			stop: stop,
		};

		angular.extend(Event, statics);
		angular.extend(Event.prototype, publics);
		return Event;

		// prototype methods

		function stop() {
			this.event.stopPropagation();
			this.event.preventDefault();
		}

	}]);

	app.factory('Events', ['EventsService', 'Event', 'Dom', function(EventsService, Event, Dom) {

		function Events(element) {
			var events = this;

			this.element = Dom.getElement(element);
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

		var statics = {
			getTouch: getTouch,
			getRelativeTouch: getRelativeTouch,
		};

		var publics = {
			add: add,
			remove: remove,
			removeStandardEvents: removeStandardEvents,
			removeTouchEvents: removeTouchEvents,
			removeWheelEvents: removeWheelEvents,
			removeScrollEvents: removeScrollEvents,
		};

		angular.extend(Events, statics);
		angular.extend(Events.prototype, publics);
		return Events;

		// prototype methods

		function add(listeners, scope) {
			var events = this,
				standard = this.standardEvents,
				touch = this.touchEvents,
				wheel = this.wheelEvents,
				scroll = this.scrollEvents;
			var element = this.element,
				windowElement = angular.element(window);

			angular.forEach(listeners, function(callback, key) {
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
				scope.$on('$destroy', function() {
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
			var element = this.element,
				windowElement = angular.element(window);
			angular.forEach(listeners, function(callback, key) {
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
			var element = events.element;
			element.off('mousedown', standard.down.callback);
			element.off('mousemove', standard.move.callback);
			element.off('mouseup', standard.up.callback);
		}

		function removeTouchEvents() {
			var events = this,
				standard = events.standardEvents,
				touch = events.touchEvents;
			var element = events.element;
			element.off('touchstart', touch.down.callback);
			element.off('touchmove', touch.move.callback);
			element.off('touchend', touch.up.callback);
		}

		function removeWheelEvents() {
			var events = this;
			var element = events.element;
			element.off('mousewheel', events.mouseEvents.wheel.callback);
		}

		function removeScrollEvents() {
			var events = this;
			var element = events.element;
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

	app.service('EventsService', ['Dom', function(Dom) {

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
			if (window.addEventListener) {
				try {
					var options = Object.defineProperty({}, 'passive', {
						get: function() {
							supported = true;
						},
					});
					window.addEventListener('test', null, options);
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
				window.addEventListener('mousewheel', onScroll, {
					passive: false
				});
			}

			function onScroll(e) {
				if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
					return;
				}
				if (
					(e.deltaX < 0 && (Dom.getParents(e.target).filter(function(node) {
						return node.scrollLeft > 0;
					}).length === 0)) ||
					(e.deltaX > 0 && (Dom.getParents(e.target).filter(function(node) {
						return node.scrollWidth - node.scrollLeft > node.clientWidth;
					}).length === 0))
				) {
					e.preventDefault();
				}
			}
		}

    }]);

}());
