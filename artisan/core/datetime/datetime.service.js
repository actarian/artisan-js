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
		var WEEK = 7 * DAY;
		var FIRSTDAYOFWEEK = 1;

		var today = getFullDate();

		var statics = {
			getIndexLeft: getIndexLeft,
			getIndexRight: getIndexRight,
			//
			getDayLeft: getDayLeft,
			getDayRight: getDayRight,
			//
			getMonthLeft: getMonthLeft,
			getMonthRight: getMonthRight,
			//
			getWeekLeft: getWeekLeft,
			getWeekRight: getWeekRight,
			//
			getYearLeft: getYearLeft,
			getYearRight: getYearRight,
			//
			dateToKey: dateToKey,
			//
			dayDiff: dayDiff,
			dayLeft: dayLeft,
			dayRight: dayRight,
			//
			getDate: getDate,
			getFullDate: getFullDate,
			getDay: getDay,
			getFullDay: getFullDay,
			getWeek: getWeek,
			getDayByKey: getDayByKey,
			getDayByDate: getDayByDate,
			hourToTime: hourToTime,
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
			date = datetime(date);
			var offset = date.getTimezoneOffset();
			return Math.floor((date.valueOf() - offset * MINUTE) / DAY);
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
			return getDayByDate(date);
		}

		function getFullDate(date) {
			return getFullDay(getDate(date));
		}

		function getDay(date, key) {
			return {
				date: date,
				key: key,
			};
		}

		function getDayByKey(key) {
			return getDay(keyToDate(key), key);
		}

		function getDayByDate(date) {
			return getDay(date, dateToKey(date));
		}

		function getFullDay(day) {
			var c = components(day.date);
			c.key = day.key;
			c.wKey = dateToKey(weekLeft(day.date));
			c.mKey = dateToKey(monthLeft(day.date));
			c.ww = getWeek(day.date, FIRSTDAYOFWEEK);
			return c;
		}

		function hourToTime(hour) {
			return hour * HOUR;
		}

		function keyToDate(key) {
			var date = new Date();
			var offset = date.getTimezoneOffset();
			return new Date(date.setTime(key * DAY + offset * MINUTE));
		}

		function monthDiff(diff, date, step) {
			step = step || 1;
			var c = components(date);
			var MM = Math.floor(c.MM / step) * step + diff * step;
			return new Date(c.yyyy, MM, 1, c.HH, c.mm, c.ss, c.sss);
		}

		function monthLeft(date, step) {
			step = step || 1;
			var c = components(date);
			var MM = Math.floor(c.MM / step) * step;
			return new Date(c.yyyy, MM, 1, 0, 0, 0, 0);
		}

		function monthRight(date, step) {
			step = step || 1;
			var c = components(date);
			var MM = Math.floor(c.MM / step) * step;
			return new Date(c.yyyy, MM + step, 0, 23, 59, 59, 999);
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
			return new Date(c.yyyy, c.MM, c.dd - c.ee + FIRSTDAYOFWEEK, 0, 0, 0, 0);
		}

		function weekRight(date) {
			var c = components(date);
			return new Date(c.yyyy, c.MM, c.dd - c.ee + FIRSTDAYOFWEEK + 6, 23, 59, 59, 999);
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

		function getIndexLeft(diff, size, step) {
			diff = diff || 0;
			size = size || 1;
			step = step || 1;
			var index = diff * step;
			return index;
		}

		function getIndexRight(diff, size, step) {
			size = size || 1;
			step = step || 1;
			var index = getIndexLeft(diff, size, step);
			index += (size * step) - 1;
			return index;
		}

		function getYearLeft(date, diff, size, step) {
			step = step || 1;
			var c = components(date);
			var yyyy = Math.floor(c.yyyy / step) * step;
			yyyy += getIndexLeft(diff, size, step);
			date = new Date(yyyy, c.MM, c.dd, c.HH, c.mm, c.ss, c.sss);
			return yearLeft(date);
		}

		function getYearRight(date, diff, size, step) {
			step = step || 1;
			var c = components(date);
			var yyyy = Math.floor(c.yyyy / step) * step;
			yyyy += getIndexRight(diff, size, step);
			date = new Date(yyyy, c.MM, c.dd, c.HH, c.mm, c.ss, c.sss);
			return yearRight(date);
		}

		function getMonthLeft(date, diff, size, step) {
			step = step || 1;
			var c = components(date);
			var MM = Math.floor(c.MM / step) * step;
			MM += getIndexLeft(diff, size, step);
			date = new Date(c.yyyy, MM, c.dd, c.HH, c.mm, c.ss, c.sss);
			return monthLeft(date);
		}

		function getMonthRight(date, diff, size, step) {
			step = step || 1;
			var c = components(date);
			var MM = Math.floor(c.MM / step) * step;
			MM += getIndexRight(diff, size, step);
			date = new Date(c.yyyy, MM, c.dd, c.HH, c.mm, c.ss, c.sss);
			return monthRight(date);
		}

		function getWeekLeft(date, diff, size, step) {
			var c = components(date);
			var dd = c.dd + getIndexLeft(diff, size, step) * 7;
			date = new Date(c.yyyy, c.MM, dd, c.HH, c.mm, c.ss, c.sss);
			return weekLeft(date);
		}

		function getWeekRight(date, diff, size, step) {
			var c = components(date);
			var dd = c.dd + getIndexRight(diff, size, step) * 7;
			date = new Date(c.yyyy, c.MM, dd, c.HH, c.mm, c.ss, c.sss);
			return weekRight(date);
		}

		function getDayLeft(date, diff, size, step) {
			step = step || 1;
			var c = components(date);
			var dd = Math.floor(c.dd / step) * step;
			dd += getIndexLeft(diff, size, step);
			date = new Date(c.yyyy, c.MM, dd, c.HH, c.mm, c.ss, c.sss);
			return dayLeft(date);
		}

		function getDayRight(date, diff, size, step) {
			step = step || 1;
			var c = components(date);
			var dd = Math.floor(c.dd / step) * step;
			dd += getIndexRight(diff, size, step);
			date = new Date(c.yyyy, c.MM, dd, c.HH, c.mm, c.ss, c.sss);
			return dayRight(date);
		}

		function getWeekDay(date, offsetDays) {
			offsetDays = offsetDays || 0; // default offsetDays to zero
			var ee = date.getDay();
			ee -= offsetDays;
			if (ee < 0) {
				ee += 7;
			}
			return ee;
		}

		function getWeek(date, offsetDays) {
			var startingDayOfWeek = 4; // first week of year with thursday;
			var now = getDayByDate(date);
			var first = getDayByDate(getYearLeft(date)); // diff, size, step
			var ee = getWeekDay(first.date, offsetDays);
			var num = now.key - first.key;
			var week = Math.floor((num + ee) / 7);
			if (ee < startingDayOfWeek) {
				week++;
				if (week > 52) {
					// next year
					ee = getWeekDay(getYearLeft(date, 1), offsetDays);
					// if the next year starts before the middle of the week, it is week #1 of that year
					week = ee < startingDayOfWeek ? 1 : 53;
				}
			}
			return week;
		}

    }]);

	app.filter('isoWeek', ['DateTime', function(DateTime) {
		return function(value, offsetDays) {
			if (value) {
				var week = DateTime.getWeek(value, offsetDays);
				return week < 10 ? '0' + week : week; // padded
			} else {
				return '-';
			}
		};
    }]);

}());
