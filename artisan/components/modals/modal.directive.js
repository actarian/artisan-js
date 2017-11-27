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
				modal.templateUrl = modal.templateUrl || 'artisan/components/modals/partial/modal';
				$templateRequest(modal.templateUrl).then(function (html) {
					compileController(scope, element, html, modal);
				});
				/*
				// window.scrollTo(0, element[0].offsetTop - 100);
				function onClick(e) {
				    var closest = Dom.getClosestNode(e.target, element[0]);
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