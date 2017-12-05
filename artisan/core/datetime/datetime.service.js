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
		var FIRSTDAYOFWEEK = 1;

		var today = getDate();

		var statics = {
			dateToKey: dateToKey,
			//
			dayDiff: dayDiff,
			dayLeft: dayLeft,
			dayRight: dayRight,
			//
			getDate: getDate,
			keyToDate: keyToDate,
			//
			monthDiff: monthDiff,
			monthLeft: monthLeft,
			monthRight: monthRight,
			//
			today: today,
			//
			weekDiff: weekDiff,
			weekLeft: weekLeft,
			weekRight: weekRight,
			//
			yearDiff: yearDiff,
			yearLeft: yearLeft,
			yearRight: yearRight,
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
			FIRSTDAYOFWEEK: FIRSTDAYOFWEEK,
		};

		angular.extend(service, statics);

		function datetime(date) {
			date = date ? new Date(date) : new Date();
			return date;
		}

		function components(date) {
			date = datetime(date);
			// console.log($locale.DATETIME_FORMATS.FIRSTDAYOFWEEK);
			return {
				date: date,
				yyyy: date.getFullYear(),
				MM: date.getMonth(),
				dd: date.getDate(),
				// ee: (date.getDay() + $locale.DATETIME_FORMATS.FIRSTDAYOFWEEK) % 7,
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

		function dayDiff(diff, date) {
			var c = components(date);
			return new Date(c.yyyy, c.MM, c.dd + diff, c.HH, c.mm, c.ss, c.sss);
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

		function weekDiff(diff, date) {
			var c = components(date);
			return new Date(c.yyyy, c.MM, c.dd + diff * 7, c.HH, c.mm, c.ss, c.sss);
		}

		function weekLeft(date) {
			var c = components(date);
			return new Date(c.yyyy, c.MM, c.dd - c.ee + service.FIRSTDAYOFWEEK, 0, 0, 0, 0);
		}

		function weekRight(date) {
			var c = components(date);
			return new Date(c.yyyy, c.MM, c.dd - c.ee + service.FIRSTDAYOFWEEK + 6, 23, 59, 59, 999);
		}

		function yearDiff(diff, date) {
			var c = components(date);
			return new Date(c.yyyy, c.MM + diff * 12, c.dd, c.HH, c.mm, c.ss, c.sss);
		}

		function yearLeft(date) {
			var c = components(date);
			return new Date(c.yyyy, 0, 1, 0, 0, 0, 0);
		}

		function yearRight(date) {
			var c = components(date);
			return new Date(c.yyyy, 12, 0, 23, 59, 59, 999);
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