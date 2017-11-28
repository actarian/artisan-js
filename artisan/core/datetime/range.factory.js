/* global angular */

(function () {
	"use strict";

	var app = angular.module('artisan');

	app.factory('Range', ['$filter', function ($filter) {

		var RangeTypes = {
			YEAR: 1,
			SEMESTER: 2,
			QUARTER: 3,
			MONTH: 4,
			WEEK: 5,
		};

		var statics = {
			getMonth: getMonth,
			addYear: addYear,
			types: RangeTypes,
		};

		var publics = {
			currentQuarter: currentQuarter,
			currentSemester: currentSemester,
			currentYear: currentYear,
			currentYearPeriod: currentYearPeriod,
			lastSemester: lastSemester,
			setQuarter: setQuarter,
			setSemester: setSemester,
			setYear: setYear,
			setYearPeriod: setYearPeriod,
			setLastSemester: setLastSemester,
			getName: getName,
			setDiff: setDiff,
			set: set,
			is: is,
		};

		function Range(options) {
			var range = this;
			range.type = RangeTypes.QUARTER;
			if (options) {
				angular.extend(range, options);
			}
		}

		angular.extend(Range, statics);
		angular.extend(Range.prototype, publics);

		return Range;

		// static methods

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

		// public methods

		function currentQuarter() {
			var range = this;
			range.diff = 0;
			range.setQuarter();
			return range;
		}

		function currentSemester() {
			var range = this;
			range.diff = 0;
			range.setSemester();
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

		function lastSemester() {
			var range = this;
			range.diff = -1;
			range.setLastSemester();
			return range;
		}

		function setQuarter() {
			var range = this;
			range.type = RangeTypes.QUARTER;
			var now = new Date();
			now.setMonth(now.getMonth() + 3 * range.diff);
			var year = now.getFullYear();
			var quarter = Math.floor(now.getMonth() / 3);
			range.from = new Date(year, quarter * 3, 1);
			range.to = new Date(year, quarter * 3 + 3, 0);
			return range;
		}

		function setSemester() {
			var range = this;
			range.type = RangeTypes.SEMESTER;
			var now = new Date();
			now.setMonth(now.getMonth() + 6 * range.diff);
			var year = now.getFullYear();
			var semester = Math.floor(now.getMonth() / 6);
			range.from = new Date(year, semester * 6, 1);
			range.to = new Date(year, semester * 6 + 6, 0);
			return range;
		}

		function setYear() {
			var range = this;
			range.type = RangeTypes.YEAR;
			var now = new Date();
			now.setMonth(now.getMonth() + 12 * range.diff);
			var year = now.getFullYear();
			range.from = new Date(year, 0, 1);
			range.to = new Date(year, 12, 0);
			return range;
		}

		function setYearPeriod() {
			var range = this;
			range.type = RangeTypes.YEAR;
			var now = new Date();
			var m = now.getMonth() + 1;
			now.setMonth(m * range.diff);
			var year = now.getFullYear();
			range.from = new Date(year, 0, 1);
			range.to = new Date(year, m, 0);
			return range;
		}

		function setLastSemester() {
			var range = this;
			range.type = RangeTypes.SEMESTER;
			var now = new Date();
			now.setMonth(now.getMonth() + 6 * range.diff + 1);
			var year = now.getFullYear();
			range.from = new Date(year, now.getMonth(), 1);
			range.to = new Date(year, now.getMonth() + 6, 0);
			return range;
		}

		function getName() {
			var range = this,
				name = '';
			switch (range.type) {
				case RangeTypes.QUARTER:
					name = 'Trimestre ' + $filter('date')(range.from, 'MMM') + '-' + $filter('date')(range.to, 'MMM') + ' ' + $filter('date')(range.from, 'yyyy');
					break;
				case RangeTypes.SEMESTER:
					name = 'Semestre ' + $filter('date')(range.from, 'MMM') + '-' + $filter('date')(range.to, 'MMM') + ' ' + $filter('date')(range.from, 'yyyy');
					break;
				case RangeTypes.YEAR:
					name = 'Anno ' + $filter('date')(range.from, 'yyyy');
					break;
			}
			return name;
		}

		function setDiff(diff) {
			var range = this;
			range.diff += diff;
			switch (range.type) {
				case RangeTypes.QUARTER:
					range.setQuarter();
					break;
				case RangeTypes.SEMESTER:
					range.setSemester();
					break;
				case RangeTypes.YEAR:
					range.setYear();
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