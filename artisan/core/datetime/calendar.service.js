/* global angular */

(function () {
	"use strict";

	var app = angular.module('artisan');

	app.service('Calendar', ['DateTime', 'Hash', function (DateTime, Hash) {

		var service = this;

		var days = new Hash('key');
		var months = new Hash('mKey');

		var statics = {
			getDate: getDate,
			clearMonth: clearMonth,
			getMonthByDate: getMonthByDate,
			getMonths: getMonths,
			getMonth: getMonth,
			getDay: getDay,
			getKey: getKey,
			days: days,
			months: months,
		};

		angular.extend(service, statics);

		function getDate(day) {
			if (typeof day.date.getMonth === 'function') {
				return day.date;
			} else {
				return new Date(day.date);
			}
		}

		function clearMonth(month) {
			month.days.each(function (day) {
				if (day) {
					day.hours = 0;
					day.tasks = new Hash('id');
				}
			});
		}

		function getMonthByDate(date) {
			var yyyy = date.getFullYear();
			var MM = date.getMonth();
			var key = Math.ceil(date.getTime() / DateTime.DAY);
			var mKey = yyyy * 12 + MM;
			var month = months.getId(mKey);
			if (!month) {
				var fromDay = new Date(yyyy, MM, 1).getDay() - 1;
				fromDay = fromDay < 0 ? 6 : fromDay;
				var monthDays = new Date(yyyy, MM + 1, 0).getDate();
				var weeks = 6; // Math.ceil((fromDay + monthDays) / 7);
				// console.log('month', MM, 'weeks', weeks);
				month = {
					date: date,
					mKey: mKey,
					month: MM,
					monthDays: monthDays,
					fromDay: fromDay,
					days: new Hash('key'),
				};
				month.weeks = new Array(weeks).fill().map(function (o, r) {
					var days = new Array(7).fill().map(function (o, c) {
						var item = null;
						var d = r * 7 + c - fromDay;
						if (d >= 0 && d < monthDays) {
							var date = new Date(yyyy, MM, d + 1);
							var key = Math.ceil(date.getTime() / DateTime.DAY);
							item = {
								$today: key === DateTime.today.key,
								c: c,
								r: r,
								d: d + 1,
								date: date,
								key: key,
								hours: 0,
								tasks: new Hash('id'),
							};
							service.days.add(item);
							item = month.days.add(item);
						}
						return item;
					});
					return {
						r: r,
						date: new Date(yyyy, MM, r * 7 - fromDay + 1),
						days: days,
					};
				});
				month.getMonth = function (diff) {
					diff = diff || 0;
					return new Date(yyyy, MM + diff, 1);
				};
				month = months.add(month);
			}
			return month;
		}

		function getMonths(num) {
			days.removeAll();
			months.removeAll();
			var i = 0;
			while (i < num) {
				var date = new Date();
				date.setFullYear(DateTime.today.date.getFullYear());
				date.setMonth(DateTime.today.date.getMonth() + i);
				date.setDate(1);
				date.setHours(0);
				date.setMinutes(0);
				date.setSeconds(0);
				var month = getMonthByDate(date);
				// console.log('getMonths', month);
				i++;
			}
			// console.log('getMonths', months);
			return months;
		}

		function getMonth(day) {
			var date = getDate(day);
			var month = getMonthByDate(date);
			return month;
		}

		function getDay(days) {
			var date = new Date(DateTime.today.date);
			date.setDate(date.getDate() + days);
			return date;
		}

		function getKey(date) {
			return Math.ceil(date.getTime() / DateTime.DAY);
		}

	}]);

}());