/* global angular */

(function () {
	"use strict";

	var app = angular.module('artisan');

	app.factory('Range', ['$filter', function ($filter) {

		var ONEDAY = 24 * 60 * 60 * 1000;

		var RangeTypes = {
			YEAR: 10,
			SEMESTER: 11,
			QUARTER: 12,
			MONTH: 13,
			WEEK: 14,
			DAY: 15,
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
			nextYear: nextYear,
			currentYear: currentYear,
			currentYearPeriod: currentYearPeriod,
			currentSemester: currentSemester,
			currentQuarter: currentQuarter,
			currentMonth: currentMonth,
			currentWeek: currentWeek,
			lastSemester: lastSemester,
			setYear: setYear,
			setYearPeriod: setYearPeriod,
			setSemester: setSemester,
			setLastSemester: setLastSemester,
			setQuarter: setQuarter,
			setMonth: setMonth,
			setWeek: setWeek,
			setDay: setDay,
			getName: getName,
			getParams: getParams,
			getDate: getDate,
			setDate: setDate,
			setDiff: setDiff,
			set: set,
			is: is,
			isOutside: isOutside,
			isCurrent: isCurrent,
		};

		function Range(options) {
			var range = this;
			range.type = RangeTypes.QUARTER;
			range.diff = 0;
			if (options) {
				angular.extend(range, options);
			}
			range.setDiff(range.diff);
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
			var range = this;
			var outside = date < range.from || date > range.to;
			return outside;
		}

		function isCurrent() {
			var range = this;
			return !range.isOutside(new Date());
		}

		function setDate(date) {
			var range = this;
			range.diff = 0;
			switch (range.type) {
				case RangeTypes.YEAR:
					range.setYear(date);
					break;
				case RangeTypes.SEMESTER:
					range.setSemester(date);
					break;
				case RangeTypes.QUARTER:
					range.setQuarter(date);
					break;
				case RangeTypes.MONTH:
					range.setMonth(date);
					break;
				case RangeTypes.WEEK:
					range.setWeek(date);
					break;
				case RangeTypes.DAY:
					range.setDay(date);
					break;
				case RangeTypes.NEXT_YEAR:
					range.nextYear(date);
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
					date = new Date(date.setFullYear(date.getFullYear() + 1));
					break;
				case RangeTypes.SEMESTER:
					date = new Date(date.setMonth(date.getMonth() + diff * 6));
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

		function getName() {
			var name = '';
			var range = this;
			switch (range.type) {
				case RangeTypes.YEAR:
					name = 'Anno ' + $filter('date')(range.from, 'yyyy');
					break;
				case RangeTypes.SEMESTER:
					name = 'Semestre ' + $filter('date')(range.from, 'MMM') + '-' + $filter('date')(range.to, 'MMM') + ' ' + $filter('date')(range.from, 'yyyy');
					break;
				case RangeTypes.QUARTER:
					name = 'Trimestre ' + $filter('date')(range.from, 'MMM') + '-' + $filter('date')(range.to, 'MMM') + ' ' + $filter('date')(range.from, 'yyyy');
					break;
				case RangeTypes.MONTH:
					name = $filter('date')(range.from, 'MMMM') + ' ' + $filter('date')(range.from, 'yyyy');
					break;
				case RangeTypes.WEEK:
					name = 'Week' + $filter('isoWeek')(range.from, 1) + ' ' + $filter('date')(range.from, 'dd MMM yyyy') + ' — ' + $filter('date')(range.to, 'dd MMM yyyy');
					break;
				case RangeTypes.DAY:
					name = $filter('date')(range.from, 'EEEE dd MMM yyyy');
					break;
				case RangeTypes.NEXT_YEAR:
					name = 'Periodo da ' + $filter('date')(range.from, 'MMM') + ' ' + $filter('date')(range.from, 'yyyy') + ' a ' + $filter('date')(range.to, 'MMM') + ' ' + $filter('date')(range.to, 'yyyy');
					break;

			}
			return name;
		}

		function getParams() {
			return {
				dateFrom: new Date(this.from),
				dateTo: new Date(this.to),
			};
		}

		function setYear(date) {
			date = date || new Date();
			date = new Date(date.setMonth(date.getMonth() + 12 * this.diff));
			var yyyy = date.getFullYear();
			var range = this;
			range.type = RangeTypes.YEAR;
			range.from = new Date(yyyy, 0, 1);
			range.to = new Date(yyyy, 12, 0, 22);
			return range;
		}

		function setYearPeriod(date) {
			date = date || new Date();
			date = new Date(date.setMonth((date.getMonth() + 1) * this.diff));
			var range = this;
			range.type = RangeTypes.YEAR;
			var yyyy = date.getFullYear();
			range.from = new Date(yyyy, 0, 1);
			range.to = new Date(yyyy, m, 0, 22);
			return range;
		}

		function setSemester(date) {
			date = date || new Date();
			date = new Date(date.setMonth(date.getMonth() + 6 * this.diff));
			var range = this;
			range.type = RangeTypes.SEMESTER;
			var yyyy = date.getFullYear();
			var semester = Math.floor(date.getMonth() / 6);
			range.from = new Date(yyyy, semester * 6, 1);
			range.to = new Date(yyyy, semester * 6 + 6, 0, 22);
			return range;
		}

		function setLastSemester(date) {
			// should be setLastSixMonths;
			date = date || new Date();
			date = new Date(date.setMonth(date.getMonth() + 6 * this.diff + 1));
			var range = this;
			range.type = RangeTypes.SEMESTER;
			var yyyy = date.getFullYear();
			range.from = new Date(yyyy, date.getMonth(), 1);
			range.to = new Date(yyyy, date.getMonth() + 6, 0, 22);
			return range;
		}

		function setQuarter(date) {
			date = date || new Date();
			date = new Date(date.setMonth(date.getMonth() + 3 * this.diff));
			var yyyy = date.getFullYear();
			var quarter = Math.floor(date.getMonth() / 3);
			var range = this;
			range.type = RangeTypes.QUARTER;
			range.from = new Date(yyyy, quarter * 3, 1);
			range.to = new Date(yyyy, quarter * 3 + 3, 0, 22);
			return range;
		}

		function setMonth(date) {
			date = date || new Date();
			date = new Date(date.setMonth(date.getMonth() + this.diff));
			var yyyy = date.getFullYear();
			var MM = date.getMonth();
			var dd = date.getDate();
			var range = this;
			range.type = RangeTypes.MONTH;
			range.from = new Date(yyyy, MM, 1);
			range.to = new Date(yyyy, MM + 1, 0, 22);
			// console.log('setMonth', yyyy, MM, dd, range);
			return range;
		}

		function setWeek(date) {
			date = date || new Date();
			date = new Date(date.setDate(date.getDate() + this.diff * 7));
			var yyyy = date.getFullYear();
			var MM = date.getMonth();
			var dd = date.getDate();
			var n = date.getDay();
			var range = this;
			range.type = RangeTypes.WEEK;
			range.from = new Date(yyyy, MM, dd - n);
			range.to = new Date(yyyy, MM, dd - n + 6, 22);
			return range;
		}

		function setDay(date) {
			date = date || new Date();
			date = new Date(date.setDate(date.getDate() + this.diff));
			var yyyy = date.getFullYear();
			var MM = date.getMonth();
			var dd = date.getDate();
			var range = this;
			range.type = RangeTypes.DAY;
			range.from = new Date(yyyy, MM, dd);
			range.to = new Date(yyyy, MM, dd, 22);
			return range;
		}

		function nextYear() {
			var range = this;
			range.type = RangeTypes.NEXT_YEAR;
			var date = new Date();
			var yyyy = date.getFullYear();
			range.from = new Date(yyyy, date.getMonth(), 1);
			range.to = new Date(yyyy, date.getMonth() + 12, 0, 22);
			return range;
		}

		function currentYear() {
			var range = this;
			range.diff = 0;
			range.setYear();
			return range;
		}

		function currentYearPeriod() {
			var range = this;
			range.diff = 0;
			range.setYearPeriod();
			return range;
		}

		function currentSemester() {
			var range = this;
			range.diff = 0;
			range.setSemester();
			return range;
		}

		function currentQuarter() {
			var range = this;
			range.diff = 0;
			range.setQuarter();
			return range;
		}

		function currentMonth() {
			var range = this;
			range.diff = 0;
			range.setMonth();
			return range;
		}

		function currentWeek() {
			var range = this;
			range.diff = 0;
			range.setWeek();
			return range;
		}

		function lastSemester() {
			var range = this;
			range.diff = -1;
			range.setLastSemester();
			return range;
		}

		function setDiff(diff) {
			var range = this;
			range.diff += diff;
			switch (range.type) {
				case RangeTypes.YEAR:
					range.setYear();
					break;
				case RangeTypes.SEMESTER:
					range.setSemester();
					break;
				case RangeTypes.QUARTER:
					range.setQuarter();
					break;
				case RangeTypes.MONTH:
					range.setMonth();
					break;
				case RangeTypes.WEEK:
					range.setWeek();
					break;
				case RangeTypes.DAY:
					range.setDay();
					break;
				case RangeTypes.NEXT_YEAR:
					range.nextYear();
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

		}]);

}());