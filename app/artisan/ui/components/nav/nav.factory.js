/* global angular */

(function() {
    "use strict";

    var app = angular.module('artisan');

    app.factory('Nav', ['$silent', function($silent) {
        function Nav(options) {
            var nav = this;
            var defaults = {
                items: [],
            }
            angular.extend(nav, defaults);
            if (options) {
                angular.extend(nav, options);
            }
            nav.setNav(nav, null);
        }
        Nav.prototype = {
            setItems: function(items) {
                var nav = this;
                nav.path = $silent.path();
                nav.items = items;
                nav.setNavs(items, nav);
            },
            setNavs: function(items, parent) {
                var nav = this;
                if (items) {
                    angular.forEach(items, function(item) {
                        nav.setNav(item, parent);
                        nav.setNavs(item.items, item);
                    });
                }
            },
            setNav: function(item, parent) {
                var nav = this;
                var $nav = {
                    parent: parent || null,
                    level: parent ? parent.$nav.level + 1 : 0,
                    state: {},
                    addItems: function(x) {
                        nav.addItems(x, item);
                    },
                    onNav: nav.onNav,
                };
                item.$nav = $nav;
                $nav.link = nav.getLink(item);
                if ($nav.link === nav.path) {
                    $nav.state.active = true;
                    $nav.state.opened = true;
                    while ($nav.parent) {
                        $nav = $nav.parent.$nav;
                        $nav.state.active = true;
                        $nav.state.opened = true;
                    }
                }
            },
            addItems: function(itemOrItems, parent) {
                var nav = this;
                if (angular.isArray(itemOrItems)) {
                    angular.forEach(itemOrItems, function(item) {
                        nav.addItem(item, parent);
                    });
                } else {
                    nav.addItem(itemOrItems, parent);
                }
            },
            addItem: function(item, parent) {
                var nav = this,
                    onLink = nav.onLink,
                    onNav = nav.onNav;
                nav.setNav(item, parent);
                if (parent) {
                    parent.items = parent.items || [];
                    parent.items.push(item);
                }
            },
            getLink: function(item) {
                var link = null;
                if (this.onLink) {
                    link = this.onLink(item, item.$nav);
                } else {
                    link = item.link;
                }
                return link;
            },
        };
        var statics = {
            silent: function(path) {
                $silent.silent(path);
            },
            path: function(path) {
                $silent.path(path);
            },
        };
        angular.extend(Nav, statics);
        return Nav;
    }]);

}());