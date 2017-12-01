/* global angular */

(function () {
	"use strict";

	var app = angular.module('artisan');

	app.factory('Calendar', ['Hash', function (Hash) {
		const oneday = (24 * 60 * 60 * 1000);
		var today = new Date();
		today.setHours(0);
		today.setMinutes(0);
		today.setSeconds(0);
		var todayKey = Math.ceil(today.getTime() / oneday);
		ArrayFrom = function (len, callback) {
			var a = [];
			while (a.length < len) {
				a.push(callback(a.length));
			}
			return a;
		};
		var days = new Hash('key');
		var months = new Hash('mKey');

		function Calendar() {}
		Calendar.getDate = function (day) {
			if (typeof day.date.getMonth === 'function') {
				return day.date;
			} else {
				return new Date(day.date);
			}
		};
		Calendar.clearMonth = function (month) {
			month.days.each(function (day) {
				if (day) {
					day.hours = 0;
					day.tasks = new Hash('id');
				}
			});
		};
		Calendar.getMonthByDate = function (date) {
			today = new Date();
			today.setHours(0);
			today.setMinutes(0);
			today.setSeconds(0);
			todayKey = Math.ceil(today.getTime() / oneday);
			var yyyy = date.getFullYear();
			var MM = date.getMonth();
			var key = Math.ceil(date.getTime() / oneday);
			var mKey = yyyy * 12 + MM;
			var month = months.getId(mKey);
			if (!month) {
				var fromDay = new Date(yyyy, MM, 1).getDay() - 1;
				fromDay = fromDay < 0 ? 6 : fromDay;
				var monthDays = new Date(yyyy, MM + 1, 0).getDate();
				var weeks = 6; // Math.ceil((fromDay + monthDays) / 7);
				// console.log('month', MM, 'weeks', weeks);
				var month = {
					date: date,
					mKey: mKey,
					month: MM,
					monthDays: monthDays,
					fromDay: fromDay,
					days: new Hash('key'),
				};
				month.weeks = ArrayFrom(weeks, function (r) {
					var days = ArrayFrom(7, function (c) {
						var item = null;
						var d = r * 7 + c - fromDay;
						if (d >= 0 && d < monthDays) {
							var date = new Date(yyyy, MM, d + 1);
							var key = Math.ceil(date.getTime() / oneday);
							item = {
								$today: key === todayKey,
								c: c,
								r: r,
								d: d + 1,
								date: date,
								key: key,
								hours: 0,
								tasks: new Hash('id'),
							};
							Calendar.days.add(item);
							item = month.days.add(item);
						}
						return item;
					});
					return {
						r: r,
						date: new Date(yyyy, MM, r * 7 - fromDay + 1),
						days: days,
					}
				});
				month.getMonth = function (diff) {
					diff = diff || 0;
					return new Date(yyyy, MM + diff, 1);
				}
				month = months.add(month);
			}
			return month;
		};
		Calendar.getMonths = function (num) {
			days.removeAll();
			months.removeAll();
			today = new Date();
			today.setHours(0);
			today.setMinutes(0);
			today.setSeconds(0);
			var i = 0;
			while (i < num) {
				var date = new Date();
				date.setFullYear(today.getFullYear());
				date.setMonth(today.getMonth() + i);
				date.setDate(1);
				date.setHours(0);
				date.setMinutes(0);
				date.setSeconds(0);
				var month = Calendar.getMonthByDate(date);
				// console.log('Calendar.getMonths', month);
				i++;
			}
			// console.log('Calendar.getMonths', months);
			return months;
		};
		Calendar.getMonth = function (day) {
			var date = Calendar.getDate(day);
			var month = Calendar.getMonthByDate(date);
			return month;
		};
		Calendar.getDay = function (days) {
			var date = new Date(today);
			date.setDate(date.getDate() + days);
			return date;
		};
		Calendar.getKey = function (date) {
			return Math.ceil(date.getTime() / oneday);
		};
		Calendar.days = days;
		Calendar.months = months;
		return Calendar;
	}]);

}());