/* global angular */

(function() {
    "use strict";

    var app = angular.module('artisan');

    app.factory('Vector', function() {
        function Vector(x, y) {
            this.x = x || 0;
            this.y = y || 0;
        }
        Vector.make = function(a, b) {
            return new Vector(b.x - a.x, b.y - a.y);
        };
        Vector.size = function(a) {
            return Math.sqrt(a.x * a.x + a.y * a.y);
        };
        Vector.normalize = function(a) {
            var l = Vector.size(a);
            a.x /= l;
            a.y /= l;
            return a;
        };
        Vector.incidence = function(a, b) {
            var angle = Math.atan2(b.y, b.x) - Math.atan2(a.y, a.x);
            // if (angle < 0) angle += 2 * Math.PI;
            // angle = Math.min(angle, (Math.PI * 2 - angle));
            return angle;
        };
        Vector.distance = function(a, b) {
            return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
        };
        Vector.cross = function(a, b) {
            return (a.x * b.y) - (a.y * b.x);
        };
        Vector.difference = function(a, b) {
            return new Vector(a.x - b.x, a.y - b.y);
        };
        Vector.power = function(a, b) {
            var x = Math.abs(b.x - a.x);
            var y = Math.abs(b.y - a.y);
            return (x + y) / 2;
        };
        Vector.prototype = {
            size: function() {
                return Vector.size(this);
            },
            normalize: function() {
                return Vector.normalize(this);
            },
            incidence: function(b) {
                return Vector.incidence(this, b);
            },
            cross: function(b) {
                return Vector.cross(this, b);
            },
            distance: function(b) {
                return Vector.distance(this, b);
            },
            difference: function(b) {
                return Vector.difference(this, b);
            },
            power: function() {
                return (Math.abs(this.x) + Math.abs(this.y)) / 2;
            },
            towards: function(b, friction) {
                friction = friction || 0.125;
                this.x += (b.x - this.x) * friction;
                this.y += (b.y - this.y) * friction;
                return this;
            },
            add: function(b) {
                this.x += b.x;
                this.y += b.y;
                return this;
            },
            friction: function(b) {
                this.x *= b;
                this.y *= b;
                return this;
            },
            copy: function(b) {
                return new Vector(this.x, this.y);
            },
            toString: function() {
                return '{' + this.x + ',' + this.y + '}';
            },
        };
        return Vector;
    });

    app.service('UI', ['Vector', function(Vector) {
        var service = this;
        service.getTouch = getTouch;
        service.getRelativeTouch = getRelativeTouch;
        service.getClosest = getClosest;
        service.getClosestElement = getClosestElement;
        return service;

        function getTouch(e, previous) {
            var point = new Vector();
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
                point.s = Vector.difference(t, previous);
            }
            point.type = e.type;
            return point;
        }

        function getRelativeTouch(node, point) {
            node = angular.isArray(node) ? node[0] : node;
            return Vector.difference(point, {
                x: node.offsetLeft,
                y: node.offsetTop
            });
            /*
            var element = angular.element(node);
            node = element[0];
            var rect = node.getBoundingClientRect();
            var topLeft = new Vector(rect.left, rect.top);
            return Vector.difference(point, topLeft);
            */

        }

        function getClosest(node, selector) {
            var matchesFn, parent;
            ['matches', 'webkitMatchesSelector', 'mozMatchesSelector', 'msMatchesSelector', 'oMatchesSelector'].some(function(fn) {
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

        function getClosestElement(node, target) {
            var matchesFn, parent;
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

    }]);

}());