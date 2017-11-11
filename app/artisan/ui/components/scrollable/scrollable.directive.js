/* global angular */

(function () {
	"use strict";

	window.ondragstart = function () {
		return false;
	};

	var app = angular.module('artisan');

	app.directive('scrollableX', ['$parse', '$compile', '$window', '$timeout', 'Scrollable', 'Animate', 'Style', 'Events', 'Utils', function ($parse, $compile, $window, $timeout, Scrollable, Animate, Style, Events, Utils) {
		return {
			restrict: 'A',
			template: '<div class="content" ng-transclude></div>',
			transclude: true,
			link: function (scope, element, attributes, model) {

				var scrollable, onLeft, onRight, showIndicatorFor, scrollableWhen;
				if (attributes.scrollableX) {
					scrollable = $parse(attributes.scrollableX)(scope);
				} else {
					scrollable = new Scrollable();
				}
				if (attributes.onLeft !== undefined) {
					onLeft = $parse(attributes.onLeft);
				}
				if (attributes.onRight !== undefined) {
					onRight = $parse(attributes.onRight);
				}
				if (attributes.showIndicatorFor !== undefined) {
					showIndicatorFor = $parse(attributes.showIndicatorFor);
				}
				if (attributes.scrollableWhen !== undefined) {
					scrollableWhen = $parse(attributes.scrollableWhen);
				}
				scrollable.link({
					reset: function () {
						scrollable.doReset();
						render();
					},
					onLeft: onLeft,
					onRight: onRight,
				});

				// ELEMENTS & STYLESHEETS;
				element.attr('unselectable', 'on').addClass('unselectable');
				var containerNode = element[0];
				var contentNode = containerNode.querySelector('.content');
				var content = angular.element(content);
				var contentStyle = new Style();

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

				var animate = new Animate(render);

				function render(time) {
					scrollable.setEnabled(isEnabled());
					scrollable.renderX();
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
					if (event.type == 'touchstart') {
						element.off('mousedown', onDown);
					}
					if (scrollable.dragStart(Utils.getTouch(event))) {
						dragOn();
						animate.play();
					}
				}

				function onMove(event) {
					if (event.type == 'touchmove') {
						angular.element($window).off('mousemove', onMove);
					}
					scrollable.dragMove(Utils.getTouch(event));
				}

				function onUp(event) {
					if (event.type == 'touchend') {
						angular.element($window).off('mouseup', onUp);
					}
					scrollable.dragEnd();
					dragOff();
				}

				function _onWheel(e) {
					if (!e) e = $window.event;
					e = e.originalEvent ? e.originalEvent : e;
					var dir = (((e.deltaY < 0 || e.wheelDelta > 0) || e.deltaY < 0) ? 1 : -1);
					var shouldStopPageScrolling = scrollable.wheelX(dir);
					if (shouldStopPageScrolling) {
						animate.play();
					}
					// event stop propagation not working
				}

				var onWheel = Utils.throttle(_onWheel, 25);
				// var onWheel = _onWheel;

				function off() {
					dragOff();
					animate.pause();
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
					scrollable.setContainer(containerNode);
					scrollable.setContent(contentNode);
					var enabled = isEnabled();
					if (!enabled) {
						off();
					}
					render();
				}

				scope.$watch(function () {
					return contentNode.offsetWidth;
				}, function (newValue, oldValue) {
					onResize();
				});

				function addListeners() {
					angular.element($window).on('resize', onResize);
					element.on('touchstart mousedown', onDown);
					element.on('wheel', onWheel);
					/*
					element[0].addEventListener('DOMMouseScroll', onWheel, {
						passive: false
					}); // for Firefox
					element[0].addEventListener('mousewheel', onWheel, {
						passive: false
					}); // for everyone else
					*/
				}

				function removeListeners() {
					angular.element($window).off('resize', onResize);
					element.off('touchstart mousedown', onDown);
					element.off('wheel', onWheel);
				}

				function dragOn() {
					angular.element($window).on('touchmove mousemove', onMove);
					angular.element($window).on('touchend mouseup', onUp);
				}

				function dragOff() {
					angular.element($window).off('touchmove mousemove', onMove);
					angular.element($window).off('touchend mouseup', onUp);
				}
				scope.$on('$destroy', function () {
					removeListeners();
					animate.pause();
				});

				addListeners();

				/*
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
					});
				}

				function dragOff() {
					windowEvents.remove({
						move: onMove,
						up: onUp,
					});
				}

				scope.$on('$destroy', function () {
					animate.pause();
				});
				*/

			},
		};
    }]);

}());
