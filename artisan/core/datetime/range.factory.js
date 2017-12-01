/* global angular */

(function () {
	"use strict";

	var app = angular.module('artisan');

	app.factory('Range', ['$filter', function ($filter) {

		var ONEDAY = 24 * 60 * 60 * 1000;

		var formats_it = {
			long: {
				YEAR: 'Anno {from|date:yyyy}',
				SEMESTER: 'Semestre {from|date:MMM yyyy} - {to|date:MMM yyyy}',
				TRIMESTER: 'Quadrimestre {from|date:MMM yyyy} - {to|date:MMM yyyy}',
				QUARTER: 'Trimestre {from|date:MMM yyyy} - {to|date:MMM yyyy}',
				MONTH: '{from|date:MMMM yyyy}',
				WEEK: 'Settimana {to|isoWeek:1}',
				DAY: '{from|date:EEEE dd MMM yyyy}',
			},
			short: {
				YEAR: '{from|date:yyyy}',
				SEMESTER: '{from|date:MMM yyyy} - {to|date:MMM yyyy}',
				TRIMESTER: '{from|date:MMM yyyy} - {to|date:MMM yyyy}',
				QUARTER: '{from|date:MMM yyyy} - {to|date:MMM yyyy}',
				MONTH: '{from|date:MMMM}',
				WEEK: 'W{to|isoWeek:1}',
				DAY: '{from|date:EEEE}',
			}
		};
		var formats_en = {
			long: {
				YEAR: 'Year {from|date:yyyy}',
				SEMESTER: 'Semester {from|date:MMM yyyy} - {to|date:MMM yyyy}',
				TRIMESTER: 'Trimester {from|date:MMM yyyy} - {to|date:MMM yyyy}',
				QUARTER: 'Quarter {from|date:MMM yyyy} - {to|date:MMM yyyy}',
				MONTH: '{from|date:MMMM yyyy}',
				WEEK: 'Week {from|isoWeek:0}',
				DAY: '{from|date:EEEE MM/dd/yyyy}',
			},
			short: {
				YEAR: '{from|date:yyyy}',
				SEMESTER: '{from|date:MMM yyyy} - {to|date:MMM yyyy}',
				TRIMESTER: '{from|date:MMM yyyy} - {to|date:MMM yyyy}',
				QUARTER: '{from|date:MMM yyyy} - {to|date:MMM yyyy}',
				MONTH: '{from|date:MMMM}',
				WEEK: 'W{from|isoWeek:0}',
				DAY: '{from|date:EEEE}',
			}
		};

		var formats = formats_en;

		var RangeTypes = {
			YEAR: 10,
			SEMESTER: 11,
			TRIMESTER: 12,
			QUARTER: 13,
			MONTH: 14,
			WEEK: 15,
			DAY: 16,
			NEXT_YEAR: 20,
		};

		var today = getToday();

		var statics = {
			today: today,
			getToday: getToday,
			getMonth: getMonth,
			addYear: addYear,
			dateToKey: dateToKey,
			keyToDate: keyToDate,
			types: RangeTypes,
		};

		var publics = {
			setYear: setYear,
			setSemester: setSemester,
			setTrimester: setTrimester,
			setQuarter: setQuarter,
			setMonth: setMonth,
			setWeek: setWeek,
			setDay: setDay,

			prev: prev,
			next: next,

			setYearPeriod: setYearPeriod,
			setLastSemester: setLastSemester,
			nextYear: nextYear,
			currentYear: currentYear,
			currentSemester: currentSemester,
			currentTrimester: currentTrimester,
			currentQuarter: currentQuarter,
			currentMonth: currentMonth,
			currentWeek: currentWeek,
			currentYearPeriod: currentYearPeriod,
			lastSemester: lastSemester,
			getDiff: getDiff,
			getParams: getParams,
			getDate: getDate,
			setDate: setDate,
			setDiff: setDiff,

			set: set,
			is: is,
			isOutside: isOutside,
			isCurrent: isCurrent,
			isBefore: isBefore,
			isAfter: isAfter,

			getName: getName,
			getShortName: getShortName,
			toString: toString,
		};

		function Range(options) {
			var range = this;
			range.from = new Date();
			range.type = RangeTypes.QUARTER;
			if (options) {
				angular.extend(range, options);
			}
			range.setDiff();
		}

		angular.extend(Range, statics);
		angular.extend(Range.prototype, publics);

		return Range;

		// static methods

		function getToday() {
			var date = new Date();
			date.setHours(0);
			date.setMinutes(0);
			date.setSeconds(0);
			var key = Math.ceil(date.getTime() / ONEDAY);
			return {
				date: date,
				key: key
			};
		}

		function getMonth(date) {
			if (!date) {
				return null;
			}
			date = new Date(date);
			date.setDate(1);
			date.setHours(0, 0, 0, 0);
			return date.getTime();
		}

		function addYear(date, years) {
			if (!date) {
				return null;
			}
			date = new Date(date);
			return new Date(date.setFullYear(date.getFullYear() + years));
		}

		function dateToKey(date) {
			return Math.ceil(date.getTime() / ONEDAY);
		}

		function keyToDate(key) {
			return new Date(new Date().setTime(key * ONEDAY));
		}

		// public methods

		function isOutside(date) {
			date = date || new Date();
			var range = this;
			var outside = date < range.from || date > range.to;
			// console.log('isOutside', date, range.from, range.to);
			return outside;
		}

		function isCurrent(date) {
			date = date || new Date();
			var range = this;
			return !range.isOutside(date);
		}

		function isBefore(date) {
			date = date || new Date();
			var range = this;
			var before = range.to < date;
			// console.log('isBefore', before, range.to, date);
			return before;
		}

		function isAfter(date) {
			date = date || new Date();
			var range = this;
			var after = range.from > date;
			// console.log('isAfter', after);
			return after;
		}

		function setDate(date, diff) {
			var range = this;
			switch (range.type) {
				case RangeTypes.YEAR:
					range.setYear(date, diff);
					break;
				case RangeTypes.SEMESTER:
					range.setSemester(date, diff);
					break;
				case RangeTypes.TRIMESTER:
					range.setTrimester(date, diff);
					break;
				case RangeTypes.QUARTER:
					range.setQuarter(date, diff);
					break;
				case RangeTypes.MONTH:
					range.setMonth(date, diff);
					break;
				case RangeTypes.WEEK:
					range.setWeek(date, diff);
					break;
				case RangeTypes.DAY:
					range.setDay(date, diff);
					break;
				case RangeTypes.NEXT_YEAR:
					range.nextYear(date, diff);
					break;
			}
			return range;
		}

		function getDate(diff) {
			diff = diff || 0;
			var range = this;
			var date = new Date(range.from);
			switch (range.type) {
				case RangeTypes.YEAR:
				case RangeTypes.NEXT_YEAR:
					date = new Date(date.setFullYear(date.getFullYear() + diff));
					break;
				case RangeTypes.SEMESTER:
					date = new Date(date.setMonth(date.getMonth() + diff * 6));
					break;
				case RangeTypes.TRIMESTER:
					date = new Date(date.setMonth(date.getMonth() + diff * 4));
					break;
				case RangeTypes.QUARTER:
					date = new Date(date.setMonth(date.getMonth() + diff * 3));
					break;
				case RangeTypes.MONTH:
					date = new Date(date.setMonth(date.getMonth() + diff));
					break;
				case RangeTypes.WEEK:
					date = new Date(date.setDate(date.getDate() + diff * 7));
					break;
				case RangeTypes.DAY:
					date = new Date(date.setDate(date.getDate() + diff));
					break;
			}
			return date;
		}

		function getParams() {
			return {
				dateFrom: new Date(this.from),
				dateTo: new Date(this.to),
			};
		}

		function setYear(date, diff) {
			diff = diff || 0;
			date = date || new Date();
			date = new Date(date.setMonth(date.getMonth() + 12 * diff));
			var yyyy = date.getFullYear();
			var range = this;
			range.type = RangeTypes.YEAR;
			range.from = new Date(yyyy, 0, 1);
			range.to = new Date(yyyy, 12, 0, 23, 59, 59, 999);
			return range;
		}

		function setSemester(date, diff) {
			diff = diff || 0;
			date = date || new Date();
			date = new Date(date.setMonth(date.getMonth() + 6 * diff));
			var yyyy = date.getFullYear();
			var semester = Math.floor(date.getMonth() / 6);
			var range = this;
			range.type = RangeTypes.SEMESTER;
			range.from = new Date(yyyy, semester * 6, 1);
			range.to = new Date(yyyy, semester * 6 + 6, 0, 23, 59, 59, 999);
			return range;
		}

		function setTrimester(date, diff) {
			diff = diff || 0;
			date = date || new Date();
			date = new Date(date.setMonth(date.getMonth() + 4 * diff));
			var yyyy = date.getFullYear();
			var trimester = Math.floor(date.getMonth() / 4);
			var range = this;
			range.type = RangeTypes.TRIMESTER;
			range.from = new Date(yyyy, trimester * 4, 1);
			range.to = new Date(yyyy, trimester * 4 + 4, 0, 23, 59, 59, 999);
			return range;
		}

		function setQuarter(date, diff) {
			diff = diff || 0;
			date = date || new Date();
			date = new Date(date.setMonth(date.getMonth() + 3 * diff));
			var yyyy = date.getFullYear();
			var quarter = Math.floor(date.getMonth() / 3);
			var range = this;
			range.type = RangeTypes.QUARTER;
			range.from = new Date(yyyy, quarter * 3, 1);
			range.to = new Date(yyyy, quarter * 3 + 3, 0, 23, 59, 59, 999);
			return range;
		}

		function setMonth(date, diff) {
			diff = diff || 0;
			date = date || new Date();
			date = new Date(date.setMonth(date.getMonth() + diff));
			var yyyy = date.getFullYear();
			var MM = date.getMonth();
			var dd = date.getDate();
			var range = this;
			range.type = RangeTypes.MONTH;
			range.from = new Date(yyyy, MM, 1);
			range.to = new Date(yyyy, MM + 1, 0, 23, 59, 59, 999);
			// console.log('setMonth', yyyy, MM, dd, range);
			return range;
		}

		function setWeek(date, diff) {
			diff = diff || 0;
			date = date || new Date();
			date = new Date(date.setDate(date.getDate() + diff * 7));
			var yyyy = date.getFullYear();
			var MM = date.getMonth();
			var dd = date.getDate();
			var n = date.getDay();
			var range = this;
			range.type = RangeTypes.WEEK;
			range.from = new Date(yyyy, MM, dd - n);
			range.to = new Date(yyyy, MM, dd - n + 6, 23, 59, 59, 999);
			return range;
		}

		function setDay(date, diff) {
			diff = diff || 0;
			date = date || new Date();
			date = new Date(date.setDate(date.getDate() + diff));
			var yyyy = date.getFullYear();
			var MM = date.getMonth();
			var dd = date.getDate();
			var range = this;
			range.type = RangeTypes.DAY;
			range.from = new Date(yyyy, MM, dd);
			range.to = new Date(yyyy, MM, dd, 23, 59, 59, 999);
			return range;
		}

		function setYearPeriod(date, diff) {
			diff = diff || 0;
			this.type = Range.types.YEAR;
			var now = new Date();
			var m = now.getMonth() + 1;
			now.setMonth(m * diff);
			var year = now.getFullYear();
			this.from = new Date(year, 0, 1);
			this.to = new Date(year, m, 0);
			return this;
		}

		function setLastSemester(date, diff) {
			// should be setLastSixMonths;
			diff = diff || 0;
			date = date || new Date();
			date = new Date(date.setMonth(date.getMonth() + 6 * diff + 1));
			var range = this;
			range.type = RangeTypes.SEMESTER;
			var yyyy = date.getFullYear();
			range.from = new Date(yyyy, date.getMonth(), 1);
			range.to = new Date(yyyy, date.getMonth() + 6, 0, 23, 59, 59, 999);
			return range;
		}

		function prev() {
			return this.setDiff(-1);
		}

		function next() {
			return this.setDiff(1);
		}

		function nextYear() {
			var date = new Date();
			var yyyy = date.getFullYear();
			var range = this;
			range.type = RangeTypes.NEXT_YEAR;
			range.from = new Date(yyyy, date.getMonth(), 1);
			range.to = new Date(yyyy, date.getMonth() + 12, 0, 23, 59, 59, 999);
			return range;
		}

		function currentYear() {
			var range = this;
			range.setYear();
			return range;
		}

		function currentYearPeriod() {
			var range = this;
			range.setYearPeriod();
			return range;
		}

		function currentSemester() {
			var range = this;
			range.setSemester();
			return range;
		}

		function currentTrimester() {
			var range = this;
			range.setTrimester();
			return range;
		}

		function currentQuarter() {
			var range = this;
			range.setQuarter();
			return range;
		}

		function currentMonth() {
			var range = this;
			range.setMonth();
			return range;
		}

		function currentWeek() {
			var range = this;
			range.setWeek();
			return range;
		}

		function lastSemester() {
			var range = this;
			range.setLastSemester(null, -1);
			return range;
		}

		function setDiff(diff) {
			var range = this;
			switch (range.type) {
				case RangeTypes.YEAR:
					range.setYear(range.from, diff);
					break;
				case RangeTypes.SEMESTER:
					range.setSemester(range.from, diff);
					break;
				case RangeTypes.TRIMESTER:
					range.setTrimester(range.from, diff);
					break;
				case RangeTypes.QUARTER:
					range.setQuarter(range.from, diff);
					break;
				case RangeTypes.MONTH:
					range.setMonth(range.from, diff);
					break;
				case RangeTypes.WEEK:
					range.setWeek(range.from, diff);
					break;
				case RangeTypes.DAY:
					range.setDay(range.from, diff);
					break;
				case RangeTypes.NEXT_YEAR:
					range.nextYear(range.from, diff);
					break;
			}
			return range;
		}

		function set(filters, source) {
			var range = this;
			filters.dateFrom = range.from;
			filters.dateTo = range.to;
			if (source) {
				source.setDates(filters.dateFrom, filters.dateTo);
			}
			return range;
		}

		function is(filters) {
			var range = this,
				flag = false;
			if (filters.dateFrom && filters.dateTo) {
				flag = filters.dateFrom.getTime() == range.from.getTime() && filters.dateTo.getTime() == range.to.getTime();
			}
			return flag;
		}

		function values(obj) {
			var vals = [];
			for (var key in obj) {
				if (has(obj, key) && isEnumerable(obj, key)) {
					vals.push(obj[key]);
				}
			}
			return vals;
		}

		if (typeof Object.values !== 'function') {
			Object.values = values;
		}

		function extract(obj, value) {
			return Object.keys(obj)[Object.values(obj).indexOf(value)];
		}

		function getDiff(diff) {
			var range = this;
			return new Range({
				type: range.type,
			}).setDate(range.from).setDiff(diff);
		}

		function getName() {
			var range = this;
			var key = extract(RangeTypes, range.type);
			return RangeFormat(range, formats.long[key]);
		}

		function getShortName() {
			var range = this;
			var key = extract(RangeTypes, range.type);
			return RangeFormat(range, formats.short[key]);
		}

		function RangeFormat(range, format) {
			var name = format;
			name = name.replace(/{(.*?)}/g, function (replaced, token) {
				var a = token.split('|');
				var p = a.shift();
				var f = a.join(''),
					j;
				if (f.indexOf(':') !== -1) {
					f = f.split(':');
					j = f.length ? f.pop() : null;
					f = f.join('');
				}
				// console.log(token, f, p, j);
				return f.length ? $filter(f)(range[p], j) : range[p];
			});
			// console.log(name);
			return name;
		}

		function toString() {
			return '[' + $filter('date')(this.from, 'MM-dd-yyyy') + ', ' + $filter('date')(this.to, 'MM-dd-yyyy') + '] \'' + this.getName() + '\'';
		}

	}]);

}());