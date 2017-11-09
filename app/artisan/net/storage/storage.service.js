/* global angular */

(function() {
    "use strict";

    var app = angular.module('artisan');

    app.factory('Cookie', ['$q', '$window', function($q, $window) {
        function Cookie() {}
        Cookie.TIMEOUT = 5 * 60 * 1000; // five minutes
        Cookie._set = function(name, value, days) {
            var expires;
            if (days) {
                var date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                expires = '; expires=' + date.toGMTString();
            } else {
                expires = '';
            }
            $window.document.cookie = name + '=' + value + expires + '; path=/';
        };
        Cookie.exists = function(name) {
            return $window.document.cookie.indexOf(';' + name + '=') !== -1 || $window.document.cookie.indexOf(name + '=') === 0;
        };
        Cookie.get = function(name) {
            var cookieName = name + "=";
            var ca = $window.document.cookie.split(';');
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
        };
        Cookie.set = function(name, value, days) {
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
                Cookie._set(name, btoa(encodeURIComponent(json)), days);
            } catch (e) {
                console.log('Cookie.set.error serializing', name, value, e);
            }
        };
        Cookie.delete = function(name) {
            Cookie._set(name, "", -1);
        };
        Cookie.on = function(name) {
            var deferred = $q.defer();
            var i, interval = 1000,
                elapsed = 0,
                timeout = Cookie.TIMEOUT;

            function checkCookie() {
                if (elapsed > timeout) {
                    deferred.reject('timeout');
                } else {
                    var c = Cookie.get(name);
                    if (c) {
                        deferred.resolve(c);
                    } else {
                        elapsed += interval;
                        i = setTimeout(checkCookie, interval);
                    }
                }
            }
            checkCookie();
            return deferred.promise;
        };
        return Cookie;
    }]);

    app.factory('LocalStorage', ['$q', '$window', 'Cookie', function($q, $window, Cookie) {
        function LocalStorage() {}

        function isLocalStorageSupported() {
            var supported = false;
            try {
                supported = 'localStorage' in $window && $window.localStorage !== null;
                if (supported) {
                    $window.localStorage.setItem('test', '1');
                    $window.localStorage.removeItem('test');
                } else {
                    supported = false;
                }
            } catch (e) {
                supported = false;
            }
            return supported;
        }
        LocalStorage.isSupported = isLocalStorageSupported();
        if (LocalStorage.isSupported) {
            LocalStorage.exists = function(name) {
                return $window.localStorage[name] !== undefined;
            };
            LocalStorage.get = function(name) {
                var value = null;
                if ($window.localStorage[name] !== undefined) {
                    try {
                        value = JSON.parse($window.localStorage[name]);
                    } catch (e) {
                        console.log('LocalStorage.get.error parsing', name, e);
                    }
                }
                return value;
            };
            LocalStorage.set = function(name, value) {
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
                    $window.localStorage.setItem(name, json);
                } catch (e) {
                    console.log('LocalStorage.set.error serializing', name, value, e);
                }
            };
            LocalStorage.delete = function(name) {
                $window.localStorage.removeItem(name);
            };
            LocalStorage.on = function(name) {
                var deferred = $q.defer();
                var i, timeout = Cookie.TIMEOUT;

                function storageEvent(e) {
                    // console.log('LocalStorage.on', name, e);
                    clearTimeout(i);
                    if (e.originalEvent.key == name) {
                        try {
                            var value = JSON.parse(e.originalEvent.newValue); // , e.originalEvent.oldValue
                            deferred.resolve(value);
                        } catch (error) {
                            console.log('LocalStorage.on.error parsing', name, error);
                            deferred.reject('error parsing ' + name);
                        }
                    }
                }
                angular.element($window).on('storage', storageEvent);
                i = setTimeout(function() {
                    deferred.reject('timeout');
                }, timeout);
                return deferred.promise;
            };
        } else {
            console.log('LocalStorage.unsupported switching to cookies');
            LocalStorage.exists = Cookie.exists;
            LocalStorage.set = Cookie.set;
            LocalStorage.get = Cookie.get;
            LocalStorage.delete = Cookie.delete;
            LocalStorage.on = Cookie.on;
        }
        return LocalStorage;
    }]);

    app.factory('SessionStorage', ['$q', '$window', 'Cookie', function($q, $window, Cookie) {
        function SessionStorage() {}

        function isSessionStorageSupported() {
            var supported = false;
            try {
                supported = 'sessionStorage' in $window && $window.sessionStorage !== undefined;
                if (supported) {
                    $window.sessionStorage.setItem('test', '1');
                    $window.sessionStorage.removeItem('test');
                } else {
                    supported = false;
                }
            } catch (e) {
                supported = false;
            }
            return supported;
        }
        SessionStorage.isSupported = isSessionStorageSupported();
        if (SessionStorage.isSupported) {
            SessionStorage.exists = function(name) {
                return $window.sessionStorage[name] !== undefined;
            };
            SessionStorage.get = function(name) {
                var value = null;
                if ($window.sessionStorage[name] !== undefined) {
                    try {
                        value = JSON.parse($window.sessionStorage[name]);
                    } catch (e) {
                        console.log('SessionStorage.get.error parsing', name, e);
                    }
                }
                return value;
            };
            SessionStorage.set = function(name, value) {
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
                    $window.sessionStorage.setItem(name, json);
                } catch (e) {
                    console.log('SessionStorage.set.error serializing', name, value, e);
                }
            };
            SessionStorage.delete = function(name) {
                $window.sessionStorage.removeItem(name);
            };
            SessionStorage.on = function(name) {
                var deferred = $q.defer();
                var i, timeout = Cookie.TIMEOUT;

                function storageEvent(e) {
                    // console.log('SessionStorage.on', name, e);
                    clearTimeout(i);
                    if (e.originalEvent.key === name) {
                        try {
                            var value = JSON.parse(e.originalEvent.newValue); // , e.originalEvent.oldValue
                            deferred.resolve(value);
                        } catch (error) {
                            console.log('SessionStorage.on.error parsing', name, error);
                            deferred.reject('error parsing ' + name);
                        }
                    }
                }
                angular.element($window).on('storage', storageEvent);
                i = setTimeout(function() {
                    deferred.reject('timeout');
                }, timeout);
                return deferred.promise;
            };
        } else {
            console.log('SessionStorage.unsupported switching to cookies');
            SessionStorage.exists = Cookie.exists;
            SessionStorage.set = Cookie.set;
            SessionStorage.get = Cookie.get;
            SessionStorage.delete = Cookie.delete;
            SessionStorage.on = Cookie.on;
        }
        return SessionStorage;
    }]);

}());