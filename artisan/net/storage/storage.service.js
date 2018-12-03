/* global angular */

(function() {
	"use strict";

	var app = angular.module('artisan');

	var TIMEOUT = 5 * 60 * 1000; // five minutes

	app.service('Cookie', ['$promise', function($promise) {

		var service = {
			TIMEOUT: TIMEOUT,
			'delete': CookieDelete,
			exist: CookieExists,
			get: CookieGet,
			on: CookieOn,
			set: CookieSet,
		};

		angular.extend(this, service);

		function CookieDelete(name) {
			CookieSetter(name, "", -1);
		}

		function CookieExists(name) {
			return document.cookie.indexOf(';' + name + '=') !== -1 || document.cookie.indexOf(name + '=') === 0;
		}

		function CookieGet(name) {
			var cookieName = name + "=";
			var ca = document.cookie.split(';');
			for (var i = 0; i < ca.length; i++) {
				var c = ca[i];
				while (c.charAt(0) == ' ') {
					c = c.substring(1, c.length);
				}
				if (c.indexOf(cookieName) === 0) {
					var value = c.substring(cookieName.length, c.length);
					var model = null;
					try {
						model = JSON.parse(decodeURIComponent(atob(value)));
					} catch (e) {
						console.log('Cookie.get.error parsing', key, e);
					}
					return model;
				}
			}
			return null;
		}

		function CookieOn(name) {
			return $promise(function(promise) {
				var i, interval = 1000,
					elapsed = 0,
					timeout = Cookie.TIMEOUT;

				function checkCookie() {
					if (elapsed > timeout) {
						promise.reject('timeout');
					} else {
						var c = CookieGet(name);
						if (c) {
							promise.resolve(c);
						} else {
							elapsed += interval;
							i = setTimeout(checkCookie, interval);
						}
					}
				}
				checkCookie();
			});
		}

		function CookieSet(name, value, days) {
			try {
				var cache = [];
				var json = JSON.stringify(value, function(key, value) {
					if (key === 'pool') {
						return;
					}
					if (typeof value === 'object' && value !== null) {
						if (cache.indexOf(value) !== -1) {
							// Circular reference found, discard key
							return;
						}
						cache.push(value);
					}
					return value;
				});
				cache = null;
				CookieSetter(name, btoa(encodeURIComponent(json)), days);
			} catch (e) {
				console.log('CookieSet.error serializing', name, value, e);
			}
		}

		function CookieSetter(name, value, days) {
			var expires;
			if (days) {
				var date = new Date();
				date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
				expires = '; expires=' + date.toGMTString();
			} else {
				expires = '';
			}
			document.cookie = name + '=' + value + expires + '; path=/';
		}

    }]);

	app.service('LocalStorage', ['$promise', 'Cookie', function($promise, Cookie) {

		var service = {
			TIMEOUT: TIMEOUT,
			'delete': LocalDelete,
			exist: LocalExists,
			get: LocalGet,
			on: LocalOn,
			set: LocalSet,
		};

		var supported = LocalSupported();

		if (supported) {
			angular.extend(this, service);
		} else {
			angular.extend(this, Cookie);
		}

		this.supported = supported;

		function LocalSupported() {
			var supported = false;
			try {
				supported = 'localStorage' in window && window.localStorage !== null;
				if (supported) {
					window.localStorage.setItem('test', '1');
					window.localStorage.removeItem('test');
				} else {
					supported = false;
				}
			} catch (e) {
				supported = false;
			}
			return supported;
		}

		function LocalExists(name) {
			return window.localStorage[name] !== undefined;
		}

		function LocalGet(name) {
			var value = null;
			if (window.localStorage[name] !== undefined) {
				try {
					value = JSON.parse(window.localStorage[name]);
				} catch (e) {
					console.log('LocalStorage.get.error parsing', name, e);
				}
			}
			return value;
		}

		function LocalSet(name, value) {
			try {
				var cache = [];
				var json = JSON.stringify(value, function(key, value) {
					if (key === 'pool') {
						return;
					}
					if (typeof value === 'object' && value !== null) {
						if (cache.indexOf(value) !== -1) {
							// Circular reference found, discard key
							return;
						}
						cache.push(value);
					}
					return value;
				});
				cache = null;
				window.localStorage.setItem(name, json);
			} catch (e) {
				console.log('LocalStorage.set.error serializing', name, value, e);
			}
		}

		function LocalDelete(name) {
			window.localStorage.removeItem(name);
		}

		function LocalOn(name) {
			return $promise(function(promise) {
				var i, timeout = Cookie.TIMEOUT;

				function storageEvent(e) {
					// console.log('LocalStorage.on', name, e);
					if (i) {
						clearTimeout(i);
					}
					if (e.originalEvent.key == name) {
						try {
							var value = JSON.parse(e.originalEvent.newValue); // , e.originalEvent.oldValue
							promise.resolve(value);
						} catch (error) {
							console.log('LocalStorage.on.error parsing', name, error);
							promise.reject('error parsing ' + name);
						}
					}
				}
				angular.element(window).on('storage', storageEvent);
				i = setTimeout(function() {
					promise.reject('timeout');
				}, timeout);
			});
		}

    }]);

	app.service('SessionStorage', ['$promise', 'Cookie', function($promise, Cookie) {

		var service = {
			TIMEOUT: TIMEOUT,
			'delete': SessionDelete,
			exist: SessionExists,
			get: SessionGet,
			on: SessionOn,
			set: SessionSet,
		};

		var supported = SessionSupported();

		if (supported) {
			angular.extend(this, service);
		} else {
			angular.extend(this, Cookie);
		}

		this.supported = supported;

		function SessionSupported() {
			var supported = false;
			try {
				supported = 'sessionStorage' in window && window.sessionStorage !== undefined;
				if (supported) {
					window.sessionStorage.setItem('test', '1');
					window.sessionStorage.removeItem('test');
				} else {
					supported = false;
				}
			} catch (e) {
				supported = false;
			}
			return supported;
		}

		function SessionExists(name) {
			return window.sessionStorage[name] !== undefined;
		}

		function SessionGet(name) {
			var value = null;
			if (window.sessionStorage[name] !== undefined) {
				try {
					value = JSON.parse(window.sessionStorage[name]);
				} catch (e) {
					console.log('SessionStorage.get.error parsing', name, e);
				}
			}
			return value;
		}

		function SessionSet(name, value) {
			try {
				var cache = [];
				var json = JSON.stringify(value, function(key, value) {
					if (key === 'pool') {
						return;
					}
					if (typeof value === 'object' && value !== null) {
						if (cache.indexOf(value) !== -1) {
							// Circular reference found, discard key
							return;
						}
						cache.push(value);
					}
					return value;
				});
				cache = null;
				window.sessionStorage.setItem(name, json);
			} catch (e) {
				console.log('SessionStorage.set.error serializing', name, value, e);
			}
		}

		function SessionDelete(name) {
			window.sessionStorage.removeItem(name);
		}

		function SessionOn(name) {
			return $promise(function(promise) {
				var i, timeout = Cookie.TIMEOUT;

				function storageEvent(e) {
					// console.log('SessionStorage.on', name, e);
					if (i) {
						clearTimeout(i);
					}
					if (e.originalEvent.key === name) {
						try {
							var value = JSON.parse(e.originalEvent.newValue); // , e.originalEvent.oldValue
							promise.resolve(value);
						} catch (error) {
							console.log('SessionStorage.on.error parsing', name, error);
							promise.reject('error parsing ' + name);
						}
					}
				}
				angular.element(window).on('storage', storageEvent);
				i = setTimeout(function() {
					promise.reject('timeout');
				}, timeout);
			});
		}

    }]);

}());
