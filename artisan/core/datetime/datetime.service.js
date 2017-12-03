/* global angular */

(function() {
    "use strict";

    var app = angular.module('artisan');

    app.service('DateTime', [function() {

        var service = this;

        var SECOND = 1000;
        var MINUTE = 60 * SECOND;
        var QUARTER = 15 * MINUTE;
        var HOUR = 60 * MINUTE;
        var DAY = 24 * HOUR;

        var today = getDate();

        var statics = {
            dateToKey: dateToKey,
            dayLeft: dayLeft,
            dayRight: dayRight,
            getDate: getDate,
            keyToDate: keyToDate,
            monthLeft: monthLeft,
            monthRight: monthRight,
            today: today,
            // conversion
            hourToTime: hourToTime,
            timeToHour: timeToHour,
            timeToQuarterHour: timeToQuarterHour,
            // units
            MINUTE: MINUTE,
            QUARTER: QUARTER,
            HOUR: HOUR,
            DAY: DAY,
        };

        angular.extend(service, statics);

        function components(date) {
            date = datetime(date);
            return {
                date: date,
                yyyy: date.getFullYear(),
                MM: date.getMonth(),
                dd: date.getDate(),
                HH: date.getHours(),
                mm: date.getMinutes(),
                ss: date.getSeconds(),
                sss: date.getMilliseconds(),
            };
        }

        function datetime(date) {
            date = date ? new Date(date) : new Date();
            return date;
        }

        function dateToKey(date) {
            return Math.ceil(date.getTime() / DAY);
        }

        function dayLeft(date) {
            var c = components(date);
            return new Date(c.yyyy, c.MM, c.dd, 0, 0, 0, 0);
        }

        function dayRight(date) {
            var c = components(date);
            return new Date(c.yyyy, c.MM, c.dd, 23, 59, 59, 999);
        }

        function getDate(date) {
            date = dayLeft(date);
            return {
                date: date,
                key: dateToKey(date),
            };
        }

        function keyToDate(key) {
            return new Date(new Date().setTime(key * DAY));
        }

        function monthLeft(date) {
            var c = components(date);
            return new Date(c.yyyy, c.MM, 1, 0, 0, 0, 0);
        }

        function monthRight(date) {
            var c = components(date);
            return new Date(c.yyyy, c.MM + 1, 0, 23, 59, 59, 999);
        }

        function hourToTime(hour) {
            return hour * HOUR;
        }

        function timeToHour(time) {
            return time / HOUR;
        }

        function timeToQuarterHour(time) {
            return Math.floor(time / QUARTER) * QUARTER / HOUR;
        }

        /*
        ArrayFrom = function(len, callback) {
            var a = [];
            while (a.length < len) {
                a.push(callback(a.length));
            }
            return a;
		};
		*/

    }]);

}());