/* global angular */

(function() {
    "use strict";

    var app = angular.module('artisan');

    app.directive('ngClick', ['Events', function(Events) {
        return {
            restrict: 'A',
            priority: 0,
            link: link
        };

        function link(scope, element, attributes, model) {
            element.addClass('material');
            var material = document.createElement('material');
            element[0].appendChild(material);

            function onClick(e) {
                element.removeClass('animate');
                void element.offsetWidth;
                // material.style.animationPlayState = "paused";
                material.style.left = e.relative.x + 'px';
                material.style.top = e.relative.y + 'px';
                setTimeout(function() {
                    element.addClass('animate');
                    setTimeout(function() {
                        element.removeClass('animate');
                    }, 1000);
                }, 10);
            }

            var listeners = {
                click: onClick,
            };
            var events = new Events(element).add(listeners);

            scope.$on('$destroy', function() {
                events.remove(listeners);
            });

        }
    }]);

}());