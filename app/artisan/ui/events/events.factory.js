/* global angular */

(function () {
	"use strict";

	var app = angular.module('artisan');

	app.factory('Events', [function () {

		function Event(e, element) {
			var documentNode = (document.documentElement || document.body.parentNode || document.body);
			var scroll = {
				x: window.pageXOffset || documentNode.scrollLeft,
				y: window.pageYOffset || documentNode.scrollTop
			};
			if (e.type === 'resize') {
				var view = {
					w: this.getWidth(),
					h: this.getHeight(),
				};
				this.view = view;
			}
			var node = getNode(element);
			var offset = {
				x: node.offsetLeft,
				y: node.offsetTop,
			};
			var rect = node.getBoundingClientRect();
			var page = this.getPage(e);
			if (page) {
				var relative = {
					x: page.x - scroll.x - rect.left,
					y: page.y - scroll.y - rect.top,
				};
				var absolute = {
					x: page.x - scroll.x,
					y: page.y - scroll.y,
				};
				this.relative = relative;
				this.absolute = absolute;
			}
			if (this.type === 'resize') {
				console.log(this.type);
			}
			this.originalEvent = e;
			this.element = element;
			this.node = node;
			this.offset = offset;
			this.rect = rect;
			// console.log('Event', 'page', page, 'scroll', scroll, 'offset', offset, 'rect', rect, 'relative', relative, 'absolute', absolute);
			// console.log('scroll.y', scroll.y, 'page.y', page.y, 'offset.y', offset.y, 'rect.top', rect.top);
		}
		Event.prototype = {
			getPage: getPage,
			getWidth: getWidth,
			getHeight: getHeight,
		};

		function getWidth() {
			if (self.innerWidth) {
				return self.innerWidth;
			}
			if (document.documentElement && document.documentElement.clientWidth) {
				return document.documentElement.clientWidth;
			}
			if (document.body) {
				return document.body.clientWidth;
			}
		}

		function getHeight() {
			if (self.innerHeight) {
				return self.innerHeight;
			}
			if (document.documentElement && document.documentElement.clientHeight) {
				return document.documentElement.clientHeight;
			}
			if (document.body) {
				return document.body.clientHeight;
			}
		}

		function getPage(e) {
			var standardEvents = ['click', 'mousedown', 'mouseup', 'mousemove', 'mouseover', 'mouseout', 'mouseenter', 'mouseleave', 'contextmenu'];
			var touchEvents = ['touchstart', 'touchmove', 'touchend', 'touchcancel'];
			var page = null;
			if (touchEvents.indexOf(e.type) !== -1) {
				var t = null;
				var event = e.originalEvent ? e.originalEvent : e;
				var touches = event.touches.length ? event.touches : event.changedTouches;
				if (touches && touches.length) {
					t = touches[0];
				}
				if (t) {
					page = {
						x: t.pageX,
						y: t.pageY,
					};
				}
			} else if (standardEvents.indexOf(e.type) !== -1) {
				page = {
					x: e.pageX,
					y: e.pageY,
				};
			}
			this.type = e.type;
			return page;
		}

		function Events(element) {
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

			var events = this;

			function onClick(e) {
				// console.log('onClick', e, events);
				var event = new Event(e, events.element);
				events.listeners.click.apply(this, [event]);
			}

			function onMouseDown(e) {
				// console.log('onMouseDown', e);
				var event = new Event(e, events.element);
				events.listeners.down.apply(this, [event]);
				events.removeTouchEvents();
			}

			function onMouseMove(e) {
				// console.log('onMouseMove', e);
				var event = new Event(e, events.element);
				events.listeners.move.apply(this, [event]);
			}

			function onMouseUp(e) {
				// console.log('onMouseUp', e);
				var event = new Event(e, events.element);
				events.listeners.up.apply(this, [event]);
			}

			function onResize(e) {
				console.log('onResize', e);
				var event = new Event(e, events.element);
				events.listeners.resize.apply(this, [event]);
			}

			function onTouchStart(e) {
				// console.log('onTouchStart', e);
				var event = new Event(e, events.element);
				events.listeners.down.apply(this, [event]);
				events.removeStandardEvents();
			}

			function onTouchMove(e) {
				// console.log('onTouchMove', e);
				var event = new Event(e, events.element);
				events.listeners.move.apply(this, [event]);
			}

			function onTouchEnd(e) {
				// console.log('onTouchEnd', e);
				var event = new Event(e, events.element);
				events.listeners.up.apply(this, [event]);
			}
		}
		Events.prototype = {
			add: add,
			remove: remove,
			removeStandardEvents: removeStandardEvents,
			removeTouchEvents: removeTouchEvents,
		};
		return Events;

		function getNode(element) {
			return element.length ? element[0] : element; // (element.length && (element[0] instanceOf Node || element[0] instanceOf HTMLElement)) ? element[0] : element;
		}

		function getElement(element) {
			return element.length ? element : angular.element(element); // (element.length && (element[0] instanceOf Node || element[0] instanceOf HTMLElement)) ? element : angular.element(element);
		}

		function add(listeners, scope) {
			var events = this,
				standard = this.standardEvents,
				touch = this.touchEvents;
			var element = getElement(this.element),
				windowElement = angular.element(window);

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
				touch = this.touchEvents;
			var element = getElement(this.element),
				windowElement = angular.element(window);
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
				events.listeners[key] = null;
			});
			return events;
		}

		function removeStandardEvents() {
			var events = this,
				standard = events.standardEvents,
				touch = events.touchEvents;
			var element = getElement(events.element);
			element.off('mousedown', standard.down.callback);
			element.off('mousemove', standard.move.callback);
			element.off('mouseup', standard.up.callback);
		}

		function removeTouchEvents() {
			var events = this,
				standard = events.standardEvents,
				touch = events.touchEvents;
			var element = getElement(events.element);
			element.off('touchstart', touch.down.callback);
			element.off('touchmove', touch.move.callback);
			element.off('touchend', touch.up.callback);
		}

    }]);

}());