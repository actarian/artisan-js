/* global angular */

(function() {
    "use strict";

    var app = angular.module('artisan');

    app.factory('Scrollable', [function() {
        function Scrollable() {
            var scrollable = {
                start: { x: 0, y: 0 },
                end: { x: 0, y: 0 },
                current: { x: 0, y: 0 },
                indicator: { x: 45, y: 0 },
                speed: { x: 0, y: 0 },
                rect: { top: 0, right: 0, bottom: 0, left: 0 },
                container: { width: 0, height: 0 },
                content: { width: 0, height: 0 },
            };
            angular.extend(this, scrollable);
        }
        Scrollable.prototype = {
            bounceX: function() {
                var scrollable = this;
                var end = scrollable.end,
                    rect = scrollable.rect;
                var padding = 100;
                rect.left += padding;
                rect.right -= padding;
                if (end.x > rect.left) {
                    scrollable.doLeft();
                } else if (end.x < l.right) {
                    scrollable.doRight();
                }
            },
            renderX: function() {
                var scrollable = this,
                    enabled = scrollable.enabled,
                    dragging = scrollable.dragging,
                    wheeling = scrollable.wheeling,
                    move = scrollable.move,
                    down = scrollable.down;
                var start = scrollable.start,
                    end = scrollable.end,
                    current = scrollable.current,
                    indicator = scrollable.indicator,
                    speed = scrollable.speed,
                    rect = scrollable.rect;
                var container = scrollable.container,
                    content = scrollable.content;
                if (enabled) {
                    rect.left = 0;
                    rect.right = container.width - content.width;
                    if (dragging) {
                        end.x = start.x + move.x - down.x;
                        scrollable.bounceX();
                    } else if (speed.x) {
                        end.x += speed.x;
                        speed.x *= 0.75;
                        if (wheeling) {
                            scrollable.bounceX();
                        }
                        if (Math.abs(speed.x) < 0.05) {
                            speed.x = 0;
                            end.x = start.x = current.x;
                            scrollable.wheeling = false;
                            // animate.pause();
                        }
                    }
                    end.x = Math.min(rect.left, end.x);
                    end.x = Math.max(rect.right, end.x);
                    current.x += (end.x - current.x) / 4;
                } else {
                    current.x = end.x = 0;
                }
            },
            scrollToX: function(x) {
                var scrollable = this;
                scrollable.start.x = scrollable.end.x = 0;
                setTimeout(function() {
                    scrollable.undrag();
                    scrollable.busy = false;
                }, 500);
            },
            doLeft: function(scope) {
                var scrollable = this;
                if (scrollable.busy) {
                    return;
                }
                if (!scrollable.onLeft) {
                    return;
                }
                scrollable.busy = true;
                scrollable.onLeft(scope).then().finally(function() {
                    scrollable.scrollToX(0);
                });
            },
            doRight: function(scope) {
                var scrollable = this;
                if (scrollable.busy) {
                    return;
                }
                if (!scrollable.onRight) {
                    return;
                }
                scrollable.busy = true;
                scrollable.onRight(scope).then().finally(function() {
                    var right = scope.container.width - scope.content.width;
                    if (right > rect.right) {
                        start.x = end.x = rect.right;
                    } else {
                        start.x = end.x = rect.right + padding;
                    }
                    scrollable.scrollToX(0);
                });
            },
            undrag: function() {
                var scrollable = this;
                scrollable.dragging = false;
                scrollable.wheeling = false;
                scrollable.move = null;
                scrollable.down = null;
            },
            onDown: function(down) {
                var scrollable = this,
                    start = scrollable.start,
                    end = scrollable.end,
                    current = scrollable.current,
                    speed = scrollable.speed;
                start.x = end.x = current.x;
                speed.x = 0;
                scrollable.down = down;
                scrollable.wheeling = false;
            },
            onMove: function(move) {
                var scrollable = this;
                scrollable.prev = scrollable.move;
                scrollable.move = move;
                scrollable.dragging = true;
            },
            onUp: function() {
                var scrollable = this,
                    enabled = scrollable.enabled,
                    dragging = scrollable.dragging,
                    wheeling = scrollable.wheeling,
                    move = scrollable.move,
                    down = scrollable.down;
                var start = scrollable.start,
                    end = scrollable.end,
                    current = scrollable.current,
                    indicator = scrollable.indicator,
                    speed = scrollable.speed,
                    rect = scrollable.rect;
                var container = scrollable.container,
                    content = scrollable.content;
                if (move && prev) {
                    speed.x += (move.x - prev.x) * 4;
                }
                start.x = end.x = current.x;
                scrollable.dragging = false;
                scrollable.move = null;
                scrollable.down = null;
                scrollable.prev = null;
            },
            getWheelIncrement: function() {
                var scrollable = this;
                var container = scrollable.container,
                    content = scrollable.content;
                var increment = (content.width - container.width) / 20;
                increment = Math.min(10, Math.max(100, increment));
                return increment;
            },
            onWheel: function(e) {
                var scrollable = this,
                    speed = scrollable.speed;
                if (!scrollable.busy && scrollable.enabled) {
                    if (!e) e = $window.event;
                    e = e.originalEvent ? e.originalEvent : e;
                    var dir = (((e.deltaY < 0 || e.wheelDelta > 0) || e.deltaY < 0) ? 1 : -1);
                    speed.x += dir * scrollable.getWheelIncrement();
                    scrollable.wheeling = true;
                    // animate.play();
                    return true;
                }
            },
            link: function(methods) {
                angular.extend(this, methods);
            },
        };
        return Scrollable;
    }]);

}());