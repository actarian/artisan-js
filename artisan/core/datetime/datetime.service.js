/* global angular */

(function () {
	"use strict";

	var app = angular.module('artisan');

	app.service('DateTime', [function () {

		var service = this;

		var SECOND = 1000;
		var MINUTE = 60 * SECOND;
		var QUARTER = 15 * MINUTE;
		var HOUR = 60 * MINUTE;
		var DAY = 24 * HOUR;
		var WEEK = 7 * DAY;

		var today = getDate();

		var statics = {
			dateToKey: dateToKey,
			dayLeft: dayLeft,
			dayRight: dayRight,
			getDate: getDate,
			keyToDate: keyToDate,
			monthDiff: monthDiff,
			monthLeft: monthLeft,
			monthRight: monthRight,
			today: today,
			weekLeft: weekLeft,
			weekRight: weekRight,
			// conversion
			hourToTime: hourToTime,
			timeToHour: timeToHour,
			timeToQuarterHour: timeToQuarterHour,
			// units
			SECOND: SECOND,
			MINUTE: MINUTE,
			QUARTER: QUARTER,
			HOUR: HOUR,
			DAY: DAY,
			WEEK: WEEK,
		};

		angular.extend(service, statics);

		function datetime(date) {
			date = date ? new Date(date) : new Date();
			return date;
		}

		function components(date) {
			date = datetime(date);
			return {
				date: date,
				yyyy: date.getFullYear(),
				MM: date.getMonth(),
				dd: date.getDate(),
				ee: date.getDay(),
				HH: date.getHours(),
				mm: date.getMinutes(),
				ss: date.getSeconds(),
				sss: date.getMilliseconds(),
			};
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

		function monthDiff(diff, date) {
			var c = components(date);
			return new Date(c.yyyy, c.MM + diff, 1, c.HH, c.mm, c.ss, c.sss);
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

		function weekLeft(date) {
			var c = components(date);
			return new Date(c.yyyy, c.MM, c.dd - c.ee, 0, 0, 0, 0);
		}

		function weekRight(date) {
			var c = components(date);
			return new Date(c.yyyy, c.MM, c.dd - c.ee + 6, 23, 59, 59, 999);
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