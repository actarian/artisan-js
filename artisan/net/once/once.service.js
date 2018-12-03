/* global angular */

(function() {
	"use strict";

	var app = angular.module('artisan');

	app.service('$once', ['$promise', function($promise) {

		var service = this;

		var statics = {
			load: OnceLoad,
			script: OnceScript,
			link: OnceLink,
		};

		angular.extend(service, statics);

		var paths = {},
			uid = 0;

		function OnceLoad(path, callback) {
			if (path.indexOf('.js')) {
				return OnceScript(path, callback);

			} else if (path.indexOf('.css')) {
				return OnceLink(path);

			}
		}

		function OnceScript(path, callback) {
			return $promise(function(promise) {
				try {
					var id = (paths[path] = paths[path] || ++uid);
					id = 'OnceScript' + id;
					if (document.getElementById(id)) {
						promise.reject();
					} else {
						var scripts = document.getElementsByTagName('script');
						var script = scripts[scripts.length - 1];
						var node = document.createElement('script');
						node.id = id;
						if (callback) {
							if (callback === true) {
								callback = id;
								path = path.split('{{callback}}').join(callback);
							}
							window[callback] = function(data) {
								promise.resolve(data);
							};
						} else {
							node.addEventListener('load', promise.resolve);
						}
						node.addEventListener('error', promise.reject);
						node.src = path;
						script.parentNode.insertBefore(node, script.nextSibling);
					}
				} catch (error) {
					promise.reject(error);
				}
			});
		}

		function OnceLink(path) {
			return $promise(function(promise) {
				try {
					var id = (paths[path] = paths[path] || ++uid);
					id = 'OnceStyle' + id;
					if (document.getElementById(id)) {
						promise.resolve();
					} else {
						var links = document.getElementsByTagName('link');
						var link = links[links.length - 1];
						var node = document.createElement('link');
						node.id = id;
						node.rel = 'stylesheet';
						node.href = path;
						node.addEventListener('load', promise.resolve);
						node.addEventListener('error', promise.reject);
						link.parentNode.insertBefore(node, link.nextSibling);
					}
				} catch (error) {
					promise.reject(error);
				}
			});
		}

    }]);

}());
