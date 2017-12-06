(function () {
	"use strict";

	var app = angular.module('artisan');

	app.directive('calendarPopupRecords', ['$templateCache', '$parse', '$q', '$timeout', '$filter', 'Hash', 'DateTime', 'Range', 'CalendarFactory', 'State', 'Api', function ($templateCache, $parse, $q, $timeout, $filter, Hash, DateTime, Range, CalendarFactory, State, Api) {
		return {
			restrict: 'A',
			template: function (element, attributes) {
				return '<div calendar-popup="options"></div>';
			},
			require: 'ngModel',
			scope: {
				user: '=calendarUser',
			},
			link: function (scope, element, attributes, model, transclude) {

				var user = scope.user;

				var state = new State();

				var options = {
					onMonthDidChange: onMonthDidChange,
					onWeekDidSelect: onWeekDidSelect,
					onDayDidSelect: onDayDidSelect,
				};

				var sources = {};

				var publics = {
					// user: user,
					state: state,
					options: options,
					// sources: sources,
				};

				angular.extend(scope, publics);

				var currentDay = new Range({
					type: Range.types.DAY
				});

				state.busy();
				$q.all([
                    Api.gantt.resources.actives().then(function success(response) {
						setResources(response);
					}),

                ]).then(function success(response) {
					state.ready();

				}, function error(error) {
					state.error(error);
					// console.log('calendarPopup.error', error);

				});

				function onMonthDidChange(date, month, calendar) {
					var deferred = $q.defer();
					// console.log('calendarPopupRecords.onMonthDidChange', month.toString());
					GetMonthRecords(month).then(function () {
						setAbsencesAndOvertimes();
						updateCalendar(date, month, calendar);
						deferred.resolve(getFirstWorkingDate(date, month, calendar));

					}, function () {
						deferred.reject();

					});
				}

				function GetMonthRecords(month) {
					var deferred = $q.defer();
					var monthExpanded = Range.expand(month, DateTime.DAY * 7);
					// console.log('calendarPopupRecords.GetMonthRecords', monthExpanded.toString());
					$q.all([
                        Api.gantt.absencesAndOvertimes(monthExpanded.getParams()).then(function success(response) {
							sources.absencesAndOvertimes = response;
						}),
                        Api.gantt.calendar(monthExpanded.getParams()).then(function success(response) {
							var unworkings = {};
							angular.forEach(response, function (item) {
								unworkings[item.key] = item;
							});
							sources.unworkings = unworkings;
							sources.calendar = response;
						}),
                        /*
                        Api.gantt.planning.full(user.id, monthExpanded.getParams()).then(function (rows) {
                            sources.monthSlots = rows.map(function (row) {
                                row.day.date = new Date(row.day.date);
                                return row;
                            });
                        }),
                        */
                        Api.gantt.records(user.id, monthExpanded.getParams()).then(function (rows) {
							sources.monthRecords = rows.map(function (row) {
								row.state = new State();
								row.record.date = new Date(row.record.date);
								return row;
							});
						}),

                    ]).then(function (response) {
						// state.success();
						deferred.resolve();

					}, function (error) {
						// state.error(error);
						deferred.reject();

					});
					return deferred.promise;
				}

				function onWeekDidSelect(week, month, calendar) {
					// console.log('calendarPopupRecords.onWeekDidSelect', month.toString());
					// var monthExpanded = Range.expand(month, DateTime.DAY * 7);
					return true;
				}

				function onDayDidSelect(day, month, calendar) {
					// var monthExpanded = Range.expand(month, DateTime.DAY * 7);
					if (!day || currentDay.isBefore(day.date)) {
						return;
					}
					// console.log('calendarPopupRecords.onDayDidSelect', day, day.working, day.date);
					if (day && day.working) {
						$timeout(function () {
							model.$setViewValue(day.date);
						});
						return true;
					}
				}

				function updateCalendar(date, month, calendar) {
					var resource = sources.resource;
					var monthRecords = sources.monthRecords;
					if (!monthRecords) {
						return;
					}
					calendar.days.each(function (day) {
						var availableHours = 0;
						if (day.working) {
							availableHours += resource.baseHours;
						}
						var ao = resource.absencesAndOvertimes[day.key];
						if (ao) {
							availableHours += ao.hours;
						}
						day.availableHours = availableHours;
						day.recordedHours = 0;
						//
						var has = availableHours > 0;
						day.working = !sources.unworkings[day.key];
						day.holiday = !day.working && !has && !day.weekend;
						day.vacation = day.working && !has;
						day.wasVacation = day.vacation && day.past;
						day.wasWorkable = day.working && day.past && has;
						day.workable = day.working && !day.past && has;
					});
					angular.forEach(monthRecords, function (row) {
						var day = calendar.days.getId(row.record.key);
						if (day) {
							day.recordedHours += row.record.hours;
						}
					});
					calendar.days.each(function (day) {
						day.green = day.working && !currentDay.isBefore(day.date) && day.recordedHours >= 8;
						day.orange = day.working && !currentDay.isBefore(day.date) && day.recordedHours < 8;
						// day.full = day.workable && day.hours >= day.availableHours;
						// day.available = day.workable && day.hours < day.availableHours;
					});
				}

				function setResources(resources) {
					sources.resources = resources;
					angular.forEach(resources, function (resource) {
						resource.absencesAndOvertimes = {};
						if (resource.id === user.id) {
							sources.resource = resource;
						}
					});
				}

				function setAbsencesAndOvertimes() {
					var resource = sources.resource;
					if (!resource) {
						return;
					}
					// assegno assenze e straordinari alla risorsa
					resource.absencesAndOvertimes = {};
					angular.forEach(sources.absencesAndOvertimes, function (item) {
						if (resource.id === item.resourceId) {
							resource.absencesAndOvertimes[item.key] = item;
						}
					});
				}

				function getFirstWorkingDate(date, month, calendar) {
					// console.log('calendarPopupRecords.getFirstWorkingDate', date);
					var firstWorkingDate = null;

					function setFirstDay() {
						calendar.days.forward();
						calendar.days.each(function (day) {
							if (!firstWorkingDate && !month.isOutside(day.date) && day.working && !day.vacation) {
								// console.log('check', day.working, day.vacation, day.date);
								firstWorkingDate = day.date;
							}
						});
						// console.log('setFirstDay', firstWorkingDate);
					}
					if (date) {
						var key = CalendarFactory.getKey(date);
						var day = calendar.days.getId(key);
						// console.log('getFirstWorkingDate', day.working, day.vacation, date);
						if (day && day.working && !day.vacation) {
							firstWorkingDate = date;
						} else {
							setFirstDay();
						}
					} else {
						setFirstDay();
					}
					return firstWorkingDate;
				}

			}
		};
    }]);

	app.directive('calendarPopup', ['$templateCache', '$parse', '$q', '$timeout', '$filter', 'Hash', 'DateTime', 'Range', 'CalendarFactory', 'State', 'Api', function ($templateCache, $parse, $q, $timeout, $filter, Hash, DateTime, Range, CalendarFactory, State, Api) {

		return {
			priority: 1002,
			restrict: 'A',
			templateUrl: TemplateUrl,
			scope: {
				options: '=calendarPopup',
			},
			link: Link,
		}

		function TemplateUrl(element, attributes) {
			var url = attributes.template;
			if (!url) {
				url = 'partials/calendar/popup';
				if (!$templateCache.get(url)) {
					$templateCache.put(url, '<div><json-formatter json="item"></json-formatter></div>');
				}
			}
			return url;
		}

		function Link(scope, element, attributes, model, transclude) {

			var calendar = new CalendarFactory();

			var options = scope.options || {
				onMonthDidChange: function () {},
				onWeekDidSelect: function () {},
				onDayDidSelect: function () {},
			};

			var month = new Range({
				type: Range.types.MONTH
			});
			var week = new Range({
				type: Range.types.WEEK
			});
			var day = new Range({
				type: Range.types.DAY
			});

			var sources = {
				month: month,
				week: week,
				day: day,
			};

			var publics = {
				sources: sources,
				doNavMonth: doNavMonth,
				onWeekSelect: onWeekSelect,
				onDaySelect: onDaySelect,
				getDayClasses: getDayClasses,
			};

			angular.extend(scope, publics);

			// console.log('scope', scope);

			setMonth(); // Init

			function setMonth(date) {
				if (!date || month.isOutside(date)) {
					date ? month.setDate(date) : null;
					onMonthChange(date);
				}
			}

			function onMonthChange(date) {
				var calendarMonth = calendar.getMonthByDate(month.getDate());
				calendarMonth.days.each(function (day) {
					var d = day.date.getDay();
					day.dirty = true;
					day.hours = 0;
					day.availableHours = 0;
					day.recordedHours = 0;
					day.selected = sources.day.isCurrent(day.date);
					day.past = day.key < Range.today.key;
					day.weekend = d === 0 || d === 6;
					day.working = !day.weekend;
					// reset
					day.holiday = false;
					day.vacation = false;
					day.wasVacation = false;
					day.wasWorkable = false;
					day.workable = false;
					day.green = false;
					day.orange = false;
				});
				sources.calendarMonth = calendarMonth;
				// console.log('calendarPopup.onMonthChange', calendarMonth);
				options.onMonthDidChange(date, month, calendarMonth);
			}

			function onWeekSelect(week) {
				// console.log('onWeekSelect', week);
				if (!week) {
					return;
				}
				if (options.onWeekDidSelect(week, month, sources.calendarMonth) === true) {
					// sources.week.setDate(week.date);
					// updateSelections();
				}
			}

			function onDaySelect(day) {
				// console.log('onDaySelect', day);
				if (!day) {
					return;
				}
				if (options.onDayDidSelect(day, month, sources.calendarMonth) === true) {
					sources.day.setDate(day.date);
					updateSelections();
				}
			}

			function updateSelections() {
				var calendarMonth = sources.calendarMonth;
				calendarMonth.days.each(function (day) {
					day.selected = sources.day.isCurrent(day.date);
				});
			}

			function doNavMonth(dir) {
				// console.log('doNavMonth', dir);
				setMonth(month.getDate(dir));
			}

			function getDayClasses(day) {
				var classes = {
					'day': day,
				}
				if (day) {
					angular.extend(classes, {
						'today': day.$today,
						'selected': day.selected,
						'workable': day.workable,
						'holiday': day.holiday,
						'vacation': day.vacation,
						'working': day.working,
						'available': day.available,
						'full': day.full,
						'status-green': day.green,
						'status-orange': day.orange,
					});
				}
				return classes;
			}

		}

    }]);

}());