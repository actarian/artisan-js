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

	app.service('Dom', ['Point', 'Rect', function (Point, Rect) {

		var service = this;

		var statics = {
			getBoundRect: getBoundRect,
			getClosest: getClosest,
			getClosestNode: getClosestNode,
			getDelta: getDelta,
			getDocumentNode: getDocumentNode,
			getElement: getElement,
			getNode: getNode,
			getNodeOffset: getNodeOffset,
			getPageScroll: getPageScroll,
			getParents: getParents,
			getView: getView,
			getPointInView: getPointInView,
			compileController: compileController,
			downloadFile: downloadFile,
			ua: getUA(),
		};

		angular.extend(service, statics);

		// return node element BoundingClientRect
		function getBoundRect(node) {
			node = getNode(node);
			if (node === window) {
				node = getDocumentNode();
			}
			var rect = node.getBoundingClientRect();
			return rect;
		}

		// return closest parent node that match a selector
		function getClosest(node, selector) {
			var matchesFn, parent;
            ['matches', 'webkitMatchesSelector', 'mozMatchesSelector', 'msMatchesSelector', 'oMatchesSelector'].some(function (fn) {
				if (typeof document.body[fn] == 'function') {
					matchesFn = fn;
					return true;
				}
				return false;
			});
			if (node[matchesFn](selector)) {
				return node;
			}
			while (node !== null) {
				parent = node.parentElement;
				if (parent !== null && parent[matchesFn](selector)) {
					return parent;
				}
				node = parent;
			}
			return null;
		}

		// return closest parent node that math a target node
		function getClosestNode(node, target) {
			var parent = null;
			if (node === target) {
				return node;
			}
			while (node !== null) {
				parent = node.parentElement;
				if (parent !== null && parent === target) {
					return parent;
				}
				node = parent;
			}
			return null;
		}

		// return wheel delta
		function getDelta(event) {
			var original = event.originalEvent ? event.originalEvent : event;
			var type = original.type;
			var delta = null;
			if (type === 'mousewheel' || type === 'DOMMouseScroll') {
				var deltaX = original.deltaX || original.wheelDeltaX;
				var deltaY = original.deltaY || original.wheelDeltaY;
				delta = new Point(deltaX, deltaY);
				if (Math.abs(deltaX) > Math.abs(deltaY)) {
					delta.dir = deltaX < 0 ? 1 : -1;
				} else {
					delta.dir = deltaY < 0 ? 1 : -1;
				}
			}
			return delta;
		}

		// return document element node
		function getDocumentNode() {
			var documentNode = (document.documentElement || document.body.parentNode || document.body);
			return documentNode;
		}

		// return an angular element
		function getElement(element) {
			return angular.isArray(element) ? element : angular.element(element);
		}

		// return a native html node
		function getNode(element) {
			return angular.isArray(element) ? element[0] : element;
		}

		// return a node offset point
		function getNodeOffset(node) {
			var offset = new Point();
			node = getNode(node);
			if (node && node.nodeType === 1) {
				offset.x = node.offsetLeft;
				offset.y = node.offsetTop;
			}
			return offset;
		}

		// return the current page scroll
		function getPageScroll() {
			var scroll = new Point();
			var documentNode = getDocumentNode();
			scroll.x = window.pageXOffset || documentNode.scrollLeft;
			scroll.y = window.pageYOffset || documentNode.scrollTop;
			return scroll;
		}

		// return an array of node parants
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

		// return the view rect
		function getView() {
			var view = new Rect();
			if (window.innerWidth !== undefined) {
				view.width = window.innerWidth;
				view.height = window.innerHeight;
			} else {
				var documentNode = getDocumentNode();
				view.width = documentNode.clientWidth;
				view.height = documentNode.clientHeight;
			}
			return view;
		}

		// add to constant
		var MOUSE_EVENTS = ['click', 'mousedown', 'mouseup', 'mousemove', 'mouseover', 'mouseout', 'mouseenter', 'mouseleave', 'contextmenu'];
		var TOUCH_EVENTS = ['touchstart', 'touchmove', 'touchend', 'touchcancel'];

		function getPointInView(event) {
			var original = event.originalEvent ? event.originalEvent : event;
			var type = original.type;
			var point = null;
			if (TOUCH_EVENTS.indexOf(type) !== -1) {
				var touch = null;
				var touches = original.touches.length ? original.touches : original.changedTouches;
				if (touches && touches.length) {
					touch = touches[0];
				}
				if (touch) {
					point = new Point();
					point.x = touch.pageX;
					point.y = touch.pageY;
				}
			} else if (MOUSE_EVENTS.indexOf(type) !== -1) {
				point = new Point();
				point.x = original.pageX;
				point.y = original.pageY;
			}
			return point;
		}

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

		function compileController(scope, element, html, data) {
			// console.log('Dom.compileController', element);
			element = getElement(element);
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