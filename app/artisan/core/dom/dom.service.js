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