/* global angular, app, Autolinker */
(function() {

    "use strict";

    var app = angular.module('artisan');

    app.filter('notIn', ['$filter', function($filter) {

        return function(array, filters, element) {
            if (filters) {
                return $filter("filter")(array, function(item) {
                    for (var i = 0; i < filters.length; i++) {
                        if (filters[i][element] === item[element]) return false;
                    }
                    return true;
                });
            }
        };

    }]);

    app.filter('isoWeek', [function() {
        // getWeek() was developed by Nick Baicoianu at MeanFreePath: http://www.epoch-calendar.com
        return function(value, offsetDays) {
            if (value) {
                value = new Date(value);
                offsetDays = offsetDays || 0; // default offsetDays to zero
                var startingDayOfWeek = 4; // first week of year with thursday;
                var firstDayOfYear = new Date(value.getFullYear(), 0, 1);
                var dayOfWeek = firstDayOfYear.getDay() - offsetDays; // the day of week the year begins on
                dayOfWeek = (dayOfWeek >= 0 ? dayOfWeek : dayOfWeek + 7);
                var dayOfYear = Math.floor((value.getTime() - firstDayOfYear.getTime() - (value.getTimezoneOffset() - firstDayOfYear.getTimezoneOffset()) * 60000) / 86400000) + 1;
                var week;
                // if the year starts before the middle of a week
                if (dayOfWeek < startingDayOfWeek) {
                    week = Math.floor((dayOfYear + dayOfWeek - 1) / 7) + 1;
                    if (week > 52) {
                        var firstDayOfNextYear = new Date(value.getFullYear() + 1, 0, 1);
                        dayOfWeek = firstDayOfNextYear.getDay() - offsetDays;
                        dayOfWeek = (dayOfWeek >= 0 ? dayOfWeek : dayOfWeek + 7);
                        // if the next year starts before the middle of the week, it is week #1 of that year
                        week = dayOfWeek < startingDayOfWeek ? 1 : 53;
                    }
                } else {
                    week = Math.floor((dayOfYear + dayOfWeek - 1) / 7);
                }
                return week < 10 ? '0' + week : week; // padded
            } else {
                return '-';
            }
        }
    }]);

}());