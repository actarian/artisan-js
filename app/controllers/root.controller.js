/* global angular */

(function() {
    "use strict";

    var app = angular.module('app');

    app.controller('RootCtrl', ['$scope', '$timeout', '$promise', 'Nav', 'Api', 'Scrollable', 'AuthService', 'FacebookService', 'GoogleService', function($scope, $timeout, $promise, Nav, Api, Scrollable, AuthService, FacebookService, GoogleService) {

        var nav = new Nav({
            onPath: onPath,
            onNav: onNav,
        });

        Api.navs.main().then(function(items) {
            nav.setItems(items);

        }, function(error) {
            console.log('RootCtrl.error', error);

        });

        function onPath(item) {
            var path = item.path;
            // console.log('RootCtrl.onPath', item.$nav.level, path);
            return path;
        }

        function onNav(item) {
            // console.log('RootCtrl.onNav', item.$nav.level, item.$nav.path);
            Nav.path(item.$nav.path);
            return false; // returning false disable default link behaviour;
        }

        function onNavPromise(item) {
            $scope.selected = item;
            return $promise(function(promise) {
                // console.log('RootCtrl.onNavPromise', item.$nav.level, item.$nav.path);
                $timeout(function() {
                    if (item.items) {
                        item.$nav.addItems({
                            name: "Item",
                        });
                    }
                    promise.resolve();
                });
            }); // a promise always disable default link behaviour;
        }

        $scope.nav = nav;

        ////////////

        var items = new Array(20).fill(null).map(function(value, index) {
            return {
                id: index + 1,
                name: 'Item',
                items: new Array(3).fill(null).map(function(value, index) {
                    return {
                        id: index + 1,
                        name: 'Item',
                        items: new Array(2).fill(null).map(function(value, index) {
                            return {
                                id: index + 1,
                                name: 'Item',
                            };
                        }),
                    };
                }),
            };
        });

        $scope.items = items;

        var scrollable = new Scrollable();

        $scope.scrollable = scrollable;

        //////////////

        function getFacebookMe() {
            FacebookService.getMe().then(function(user) {
                console.log('FacebookService.getMe', user);
            }, function(error) {
                console.log('FacebookService.getMe.error', error);
            });
        }

        function getGoogleMe() {
            GoogleService.getMe().then(function(user) {
                console.log('GoogleService.getMe', user);
            }, function(error) {
                console.log('GoogleService.getMe.error', error);
            });
        }

        $scope.getFacebookMe = getFacebookMe;
        $scope.getGoogleMe = getGoogleMe;

    }]);

}());