/* global angular */

(function() {
	"use strict";

	var app = angular.module('artisan');

	var it_IT = {
		long: {
			RANGE: '{from|date:MMM yyyy} - {to|date:MMM yyyy}',
			YEAR: 'Anno {from|date:yyyy}',
			SEMESTER: 'Semestre {from|date:MMM yyyy} - {to|date:MMM yyyy}',
			TRIMESTER: 'Quadrimestre {from|date:MMM yyyy} - {to|date:MMM yyyy}',
			QUARTER: 'Trimestre {from|date:MMM yyyy} - {to|date:MMM yyyy}',
			MONTH: '{from|date:MMMM yyyy}',
			WEEK: 'Settimana {to|isoWeek:1}',
			DAY: '{from|date:EEEE dd MMM yyyy}',
		},
		short: {
			RANGE: '{from|date:MMM yyyy} - {to|date:MMM yyyy}',
			YEAR: '{from|date:yyyy}',
			SEMESTER: '{from|date:MMM yyyy} - {to|date:MMM yyyy}',
			TRIMESTER: '{from|date:MMM yyyy} - {to|date:MMM yyyy}',
			QUARTER: '{from|date:MMM yyyy} - {to|date:MMM yyyy}',
			MONTH: '{from|date:MMMM}',
			WEEK: 'W{to|isoWeek:1}',
			DAY: '{from|date:EEEE}',
		},
		week: 1,
	};

	var en_US = {
		long: {
			RANGE: '{from|date:MMM yyyy} - {to|date:MMM yyyy}',
			YEAR: 'Year {from|date:yyyy}',
			SEMESTER: 'Semester {from|date:MMM yyyy} - {to|date:MMM yyyy}',
			TRIMESTER: 'Trimester {from|date:MMM yyyy} - {to|date:MMM yyyy}',
			QUARTER: 'Quarter {from|date:MMM yyyy} - {to|date:MMM yyyy}',
			MONTH: '{from|date:MMMM yyyy}',
			WEEK: 'Week {from|isoWeek:0}',
			DAY: '{from|date:EEEE MM/dd/yyyy}',
		},
		short: {
			RANGE: '{from|date:MMM yyyy} - {to|date:MMM yyyy}',
			YEAR: '{from|date:yyyy}',
			SEMESTER: '{from|date:MMM yyyy} - {to|date:MMM yyyy}',
			TRIMESTER: '{from|date:MMM yyyy} - {to|date:MMM yyyy}',
			QUARTER: '{from|date:MMM yyyy} - {to|date:MMM yyyy}',
			MONTH: '{from|date:MMMM}',
			WEEK: 'W{from|isoWeek:0}',
			DAY: '{from|date:EEEE}',
		},
		week: 0,
	};

	var formats = it_IT;

	app.constant('RangeTypes', {
		RANGE: 10,
		YEAR: 11,
		SEMESTER: 12,
		TRIMESTER: 13,
		QUARTER: 14,
		MONTH: 15,
		WEEK: 16,
		DAY: 17,
	});

	app.factory('Range', ['$filter', 'DateTime', 'RangeTypes', function($filter, DateTime, RangeTypes) {

		function Range(options) {
			var range = this;
			range.from = DateTime.dayLeft();
			range.type = RangeTypes.QUARTER;
			if (options) {
				angular.extend(range, options);
			}
			range.setDiff();
		}

		var publics = {
			setYear: setYear,
			setSemester: setSemester,
			setTrimester: setTrimester,
			setQuarter: setQuarter,
			setMonth: setMonth,
			setWeek: setWeek,
			setDay: setDay,
			setKey: setKey,

			prev: prev,
			next: next,

			getDiff: getDiff,
			getParams: getParams,
			getDate: getDate,
			setDate: setDate,
			setDiff: setDiff,

			set: set,
			is: is,
			isInside: isInside,
			isOutside: isOutside,
			isCurrent: isCurrent,
			isBefore: isBefore,
			isAfter: isAfter,
			equals: equals,

			eachDay: eachDay,
			totalDays: totalDays,

			getName: getName,
			getShortName: getShortName,
			toString: toString,
		};

		var statics = {
			//
			copy: RangeCopy,
			expand: RangeExpand,
			getMonth: RangeGetMonth,
			addYear: RangeAddYear,
			types: RangeTypes,
			//
			Year: RangeYear,
			Semester: RangeSemester,
			Trimester: RangeTrimester,
			Quarter: RangeQuarter,
			Month: RangeMonth,
			Week: RangeWeek,
			Day: RangeDay,
			//
			getDate: DateTime.getDate,
			getFullDate: DateTime.getFullDate,
			dateToKey: DateTime.dateToKey,
			keyToDate: DateTime.keyToDate,
			getDay: DateTime.getDay,
			getFullDay: DateTime.getFullDay,
			getDayByKey: DateTime.getDayByKey,
			getDayByDate: DateTime.getDayByDate,
			today: DateTime.today,
			DateTime: DateTime,
		};

		angular.extend(Range.prototype, publics);
		angular.extend(Range, statics);

		return Range;

		// public methods
		function isInside(date) {
			var range = this;
			return !range.isOutside(date);
		}

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
			}
			return range;
		}

		function getDate(diff) {
			diff = diff || 0;
			var range = this;
			var date = new Date(range.from);
			switch (range.type) {
				case RangeTypes.YEAR:
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

		function getDiff(diff) {
			var range = this;
			return new Range({
				type: range.type,
			}).setDate(range.from).setDiff(diff);
		}

		function getParams() {
			return {
				dateFrom: new Date(this.from),
				dateTo: new Date(this.to),
			};
		}

		function setYear(date, diff, size, step) {
			var range = this;
			range.from = DateTime.getYearLeft(date, diff, size, step);
			range.to = DateTime.getYearRight(date, diff, size, step);
			return range;
		}

		function setSemester(date, diff, size) {
			return this.setMonth(date, diff, size, 6);
		}

		function setTrimester(date, diff, size) {
			return this.setMonth(date, diff, size, 4);
		}

		function setQuarter(date, diff, size) {
			return this.setMonth(date, diff, size, 3);
		}

		function setMonth(date, diff, size, step) {
			var range = this;
			range.from = DateTime.getMonthLeft(date, diff, size, step);
			range.to = DateTime.getMonthRight(date, diff, size, step);
			return range;
		}

		function setWeek(date, diff, size, step) {
			var range = this;
			range.from = DateTime.getWeekLeft(date, diff, size, step);
			range.to = DateTime.getWeekRight(date, diff, size, step);
			return range;
		}

		function setDay(date, diff, size, step) {
			var range = this;
			range.from = DateTime.getDayLeft(date, diff, size, step);
			range.to = DateTime.getDayRight(date, diff, size, step);
			return range;
		}

		function setKey(key, diff, size, step) {
			return this.setDay(DateTime.keyToDate(key), diff, size, step);
		}

		function prev() {
			return this.setDiff(-1);
		}

		function next() {
			return this.setDiff(1);
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

		function equals(r) {
			var range = this;
			return r && DateTime.dateToKey(r.from) === DateTime.dateToKey(range.from) && DateTime.dateToKey(r.to) === DateTime.dateToKey(range.to);
		}

		function eachDay(callback) {
			var range = this;
			if (typeof callback !== 'function') {
				return range;
			}
			var fromKey = DateTime.dateToKey(range.from);
			var toKey = DateTime.dateToKey(range.to);
			while (fromKey <= toKey) {
				callback(DateTime.getDayByKey(fromKey, formats.week));
				fromKey++;
			}
			return range;
		}

		function totalDays() {
			var range = this;
			var fromKey = DateTime.dateToKey(range.from);
			var toKey = DateTime.dateToKey(range.to);
			return toKey - fromKey + 1;
		}

		function getName() {
			var range = this;
			var key = RangeExtract(RangeTypes, range.type);
			return RangeFormat(range, formats.long[key]);
		}

		function getShortName() {
			var range = this;
			var key = RangeExtract(RangeTypes, range.type);
			return RangeFormat(range, formats.short[key]);
		}

		function toString() {
			var range = this;
			return '[' +
				$filter('date')(range.from, 'MMM dd yyyy HH:mm:ss.sss') + ', ' +
				$filter('date')(range.to, 'MMM dd yyyy HH:mm:ss.sss') +
				'] \'' + range.getName() + '\'';
		}

		// static methods
		function RangeCopy($range) {
			var range = new Range($range);
			range.from = new Date($range.from);
			range.to = new Date($range.to);
			return range;
		}

		function RangeExpand(range, time) {
			range = RangeCopy(range);
			range.from = new Date(range.from.getTime() - time);
			range.to = new Date(range.to.getTime() + time);
			// console.log('RangeExpand', range.toString());
			return range;
		}

		function RangeGetMonth(date) {
			if (!date) {
				return null;
			}
			date = new Date(date);
			date.setDate(1);
			date.setHours(0, 0, 0, 0);
			return date.getTime();
		}

		function RangeAddYear(date, years) {
			if (!date) {
				return null;
			}
			date = new Date(date);
			return new Date(date.setFullYear(date.getFullYear() + years));
		}

		function RangeYear() {
			return new Range({
				type: RangeTypes.YEAR
			});
		}

		function RangeSemester() {
			return new Range({
				type: RangeTypes.SEMESTER
			});
		}

		function RangeTrimester() {
			return new Range({
				type: RangeTypes.TRIMESTER
			});
		}

		function RangeQuarter() {
			return new Range({
				type: RangeTypes.QUARTER
			});
		}

		function RangeMonth() {
			return new Range({
				type: RangeTypes.MONTH
			});
		}

		function RangeWeek() {
			return new Range({
				type: RangeTypes.WEEK
			});
		}

		function RangeDay() {
			return new Range({
				type: RangeTypes.DAY
			});
		}

		function RangeFormat(range, format) {
			var name = format;
			name = name.replace(/{(.*?)}/g, function(replaced, token) {
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

		function RangeExtract(obj, value) {
			return Object.keys(obj)[Object.values(obj).indexOf(value)];
		}

    }]);

	(function() {
		// POLYFILL Object.values
		if (typeof Object.values !== 'function') {
			Object.defineProperty(Object, 'values', {
				value: function(obj) {
					var vals = [];
					for (var key in obj) {
						if (has(obj, key) && isEnumerable(obj, key)) {
							vals.push(obj[key]);
						}
					}
					return vals;
				}
			});
		}
	}());

}());
