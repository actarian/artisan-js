/* global angular */

(function() {
    "use strict";

    var app = angular.module('artisan');

    app.provider('$modal', [function $modalProvider() {

        var modals = [];
        var routes = {};

        this.modals = modals;
        this.routes = routes;
        this.when = when;

        function when(path, modal) {
            routes[path] = modal;
            return this;
        }

        this.$get = ['$q', '$timeout', function modalFactory($q, $timeout) {

            function popModal(modal) {
                // console.log('modalProvider.popModal', modal);                
                var index = -1;
                angular.forEach(modals, function(m, i) {
                    if (m === modal) {
                        index = i;
                    }
                });
                if (index !== -1) {
                    $timeout(function() {
                        modal.active = false;
                        modals.splice(index, 1);
                        if (modals.length) {
                            modals[modals.length - 1].active = true;
                        }
                    });
                }
            }

            function closeModal(modal) {
                // console.log('modalProvider.closeModal', modal);                
                var index = -1;
                angular.forEach(modals, function(m, i) {
                    if (m === modal) {
                        index = i;
                    }
                });
                if (index !== -1) {
                    modal.active = false;
                    $timeout(function() {
                        while (modals.length) {
                            modals.splice(modals.length - 1, 1);
                        }
                    }, 500);
                }
            }

            function addModal(path, params) {
                // console.log('modalProvider.addModal', path, params);
                var deferred = $q.defer();
                params = params || null;
                var modal = {
                    title: 'Untitled',
                    controller: null,
                    templateUrl: null,
                    params: params,
                };
                var current = routes[path];
                if (current) {
                    angular.extend(modal, current);
                }
                modal.deferred = deferred;
                modal.back = function(data) {
                    popModal(this);
                    modal.deferred.resolve(data, modal);
                }
                modal.resolve = function(data) {
                    closeModal(this);
                    modal.deferred.resolve(data, modal);
                }
                modal.reject = function() {
                    closeModal(this);
                    modal.deferred.reject(modal);
                }
                modals.push(modal);
                angular.forEach(modals, function(m, i) {
                    m.active = false;
                });
                if (modals.length) {
                    modal.active = true;
                } else {
                    $timeout(function() {
                        modal.active = true;
                        // window.scrollTo(0, 0);
                    }, 500);
                }
                return deferred.promise;
            }

            return {
                modals: modals,
                addModal: addModal,
            };
        }];

    }]);

}());