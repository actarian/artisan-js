/* global angular */

(function() {
    "use strict";

    var app = angular.module('artisan');

    app.directive('expandable', ['State', 'Events', function(State, Events) {

        var directive = {
            restrict: 'A',
            // template: '<div ng-transclude></div>',
            // transclude: true,
            // replace: true,
            /*
			templateUrl: function (element, attributes) {
				return attributes.template || 'artisan/nav/nav';
            },
            */
            link: ExpandableLink,
        };

        return directive;

        function ExpandableLink(scope, element, attributes, model) {

            var state = new State();

            var node = element[0],
                placeholderNode = document.createElement('div'),
                placeholder = angular.element(placeholderNode);
            placeholder.addClass('expandable-placeholder');

            var fromRect, toRect, cssText;

            var expanded = false;

            function getStyle(node) {
                var style = window.getComputedStyle(node, null);
                var styleObj = {
                    'display': style.getPropertyValue('display'),
                    'position': style.getPropertyValue('position'),
                    'width': style.getPropertyValue('width'),
                    'height': style.getPropertyValue('height'),
                    'top': style.getPropertyValue('top'),
                    'right': style.getPropertyValue('right'),
                    'bottom': style.getPropertyValue('bottom'),
                    'left': style.getPropertyValue('left'),
                    'margin-top': style.getPropertyValue('margin-top'),
                    'margin-right': style.getPropertyValue('margin-right'),
                    'margin-bottom': style.getPropertyValue('margin-bottom'),
                    'margin-left': style.getPropertyValue('margin-left'),
                    'padding-top': style.getPropertyValue('padding-top'),
                    'padding-right': style.getPropertyValue('padding-right'),
                    'padding-bottom': style.getPropertyValue('padding-bottom'),
                    'padding-left': style.getPropertyValue('padding-left'),
                    'background-color': style.getPropertyValue('background-color'),
                };
                console.log(styleObj);
                return styleObj;
            }

            function getTextStyle(style) {
                var text = '';
                angular.forEach(style, function(value, key) {
                    text += key + ': ' + value + '; ';
                });
                return text;
            }

            function add() {
                var styleObj = getStyle(node);
                var styleText = getTextStyle(styleObj);
                placeholderNode.style.cssText = styleText;
                node.parentNode.insertBefore(placeholderNode, node);
                cssText = node.style.cssText;
                element.addClass('expandable-expanding');
            }

            function remove() {
                node.style.cssText = cssText;
                element.removeClass('expandable-expanding');
                placeholderNode.parentNode.removeChild(placeholderNode);
            }

            function expand() {
                var rect = node.getBoundingClientRect();
                fromRect = {
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height,
                };
                toRect = {
                    top: 10,
                    left: 10,
                    width: 100,
                    height: 100,
                };
                console.log('fromRect', fromRect);
                add();
                dynamics.css(node, fromRect);
                dynamics.animate(node, toRect, {
                    type: dynamics.spring,
                    frequency: 200,
                    friction: 200,
                    duration: 1500,
                    complete: function() {
                        state.idle();
                    }
                });
            }

            function contract() {
                dynamics.animate(node, fromRect, {
                    type: dynamics.spring,
                    frequency: 200,
                    friction: 200,
                    duration: 1500,
                    complete: function() {
                        remove();
                        state.idle();
                    }
                });
            }

            function toggle() {
                if (state.busy()) {
                    expanded = !expanded;
                    if (expanded) {
                        expand();
                    } else {
                        contract();
                    }
                }
            }

            function onDown(e) {
                console.log('ExpandableLink', e);
                toggle();
            }

            var events = new Events(element).add({
                down: onDown,
            }, scope);

        }

    }]);

}());