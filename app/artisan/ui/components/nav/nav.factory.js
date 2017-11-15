/* global angular */

(function () {
	"use strict";

	var app = angular.module('artisan');

	app.factory('Nav', ['Silent', function (Silent) {

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

		var statics = {
			silent: NavSilent,
			path: NavPath,
		};

		var methods = {
			addItem: addItem,
			addItems: addItems,
			getLink: getLink,
			setItems: setItems,
			setNav: setNav,
			setNavs: setNavs,
		};

		angular.extend(Nav, statics);
		angular.extend(Nav.prototype, methods);

		return Nav;

		// static methods

		function NavSilent(path) {
			Silent.silent(path);
		}

		function NavPath(path) {
			Silent.path(path);
		}

		// prototype methods

		function setItems(items) {
			var nav = this;
			nav.path = Silent.path();
			nav.items = items;
			nav.setNavs(items, nav);
		}

		function setNavs(items, parent) {
			var nav = this;
			if (items) {
				angular.forEach(items, function (item) {
					nav.setNav(item, parent);
					nav.setNavs(item.items, item);
				});
			}
		}

		function setNav(item, parent) {
			var nav = this;
			var $nav = {
				parent: parent || null,
				level: parent ? parent.$nav.level + 1 : 0,
				state: {},
				addItems: function (x) {
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
		}

		function addItems(itemOrItems, parent) {
			var nav = this;
			if (angular.isArray(itemOrItems)) {
				angular.forEach(itemOrItems, function (item) {
					nav.addItem(item, parent);
				});
			} else {
				nav.addItem(itemOrItems, parent);
			}
		}

		function addItem(item, parent) {
			var nav = this,
				onLink = nav.onLink,
				onNav = nav.onNav;
			nav.setNav(item, parent);
			if (parent) {
				parent.items = parent.items || [];
				parent.items.push(item);
			}
		}

		function getLink(item) {
			var link = null;
			if (this.onLink) {
				link = this.onLink(item, item.$nav);
			} else {
				link = item.link;
			}
			return link;
		}

    }]);

}());