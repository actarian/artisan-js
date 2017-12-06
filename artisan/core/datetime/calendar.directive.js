(function () {
	"use strict";

	var app = angular.module('artisan');

	app.directive('calendarPopup', ['$templateCache', '$parse', '$q', '$timeout', '$filter', 'Hash', 'DateTime', 'Range', 'CalendarFactory', 'State', 'Api', function ($templateCache, $parse, $q, $timeout, $filter, Hash, DateTime, Range, CalendarFactory, State, Api) {
		return {
			priority: 1001,
			restrict: 'A',
			templateUrl: function (element, attributes) {
				var url = attributes.template;
				if (!url) {
					url = 'partials/calendar/popup';
					if (!$templateCache.get(url)) {
						$templateCache.put(url, '<div><json-formatter json="item"></json-formatter></div>');
					}
				}
				return url;
			},
			require: 'ngModel',
			scope: {
				ngModel: '=',
				options: '=calendarPopup',
				user: '=calendarUser',
			},
			link: function (scope, element, attributes, model, transclude) {
				// console.log('todoItem.link');
				/*
				$timeout(function() {
				    model.$setViewValue(newValue);
				});
				// update the color picker whenever the value on the scope changes
				  model.$render = function() {
				    element.val(model.$modelValue);
				    element.change();                
				  };
				*/

				// var calendar = element[0].querySelector('.calendar-popup');
				var calendar = new CalendarFactory();

				var state = new State();

				var options = scope.options;

				console.log('options', options);

				var user = scope.user;
				console.log('calendarUser', user);

				var range = new Range({
					type: Range.types.RANGE
				}).setMonth(null, -6, 12);

				var currentYear = new Range({
					type: Range.types.YEAR
				});
				var currentMonth = new Range({
					type: Range.types.MONTH
				});
				var currentWeek = new Range({
					type: Range.types.WEEK
				});
				var currentDay = new Range({
					type: Range.types.DAY
				});

				var year = new Range({
					type: Range.types.YEAR
				});
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
					currentYear: currentYear,
					currentMonth: currentMonth,
					currentWeek: currentWeek,
					currentDay: currentDay,
					year: year,
					month: month,
					week: week,
					day: day,
					today: Range.today,
				};

				var publics = {
					state: state,
					sources: sources,
					doNavMonth: doNavMonth,
					getDayClasses: getDayClasses,
					onDaySelect: onDaySelect,
				};

				angular.extend(scope, publics);

				function setCalendar(date) {
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
					// console.log('calendarPopup.setCalendar', calendarMonth);
					if (options && options.month) {
						var monthExpanded = Range.expand(month, DateTime.DAY * 7);
						options.month(calendarMonth, date, month, monthExpanded);
					}
				}

				function updateCalendar() {
					var resource = sources.resource;
					var monthRecords = sources.monthRecords;
					if (!monthRecords) {
						return;
					}
					console.log('sources', sources);
					var calendarMonth = sources.calendarMonth;
					calendarMonth.days.each(function (day) {
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
						var day = calendarMonth.days.getId(row.record.key);
						if (day) {
							day.recordedHours += row.record.hours;
						}
					});
					calendarMonth.days.each(function (day) {
						day.green = day.working && !currentDay.isBefore(day.date) && day.recordedHours >= 8;
						day.orange = day.working && !currentDay.isBefore(day.date) && day.recordedHours < 8;
						// day.full = day.workable && day.hours >= day.availableHours;
						// day.available = day.workable && day.hours < day.availableHours;
					});
				}

				function getFirstWorkingDate(date) {
					var firstWorkingDate = null;
					var calendarMonth = sources.calendarMonth;

					function setFirstDay() {
						calendarMonth.days.forward();
						calendarMonth.days.each(function (day) {
							if (!firstWorkingDate && !month.isOutside(day.date) && day.working && !day.vacation) {
								console.log('check', day.working, day.vacation, day.date);
								firstWorkingDate = day.date;
							}
						});
						console.log('setFirstDay', firstWorkingDate);
					}
					if (date) {
						var key = CalendarFactory.getKey(date);
						var day = calendarMonth.days.getId(key);
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

				function setMonth(date) {
					var deferred = $q.defer();
					if (!date || month.isOutside(date)) {
						date ? month.setDate(date) : null;
						var monthExpanded = Range.expand(month, DateTime.DAY * 7);

						setCalendar(date);

						/*
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
                            Api.gantt.planning.full(user.id, monthExpanded.getParams()).then(function (rows) {
                                sources.monthSlots = rows.map(function (row) {
                                    row.day.date = new Date(row.day.date);
                                    return row;
                                });
                            }),
                            Api.gantt.records(user.id, monthExpanded.getParams()).then(function (rows) {
								sources.monthRecords = rows.map(function (row) {
									row.state = new State();
									row.record.date = new Date(row.record.date);
									return row;
								});
							}),

                        ]).then(function (response) {
							state.success();
							setResources();
							updateCalendar();
							deferred.resolve(getFirstWorkingDate(date));

						}, function (error) {
							state.error(error);
							deferred.reject();

						});
						*/

						deferred.resolve(date);

					} else {
						if (!sources.calendar) {
							setCalendar(date);
						}
						updateCalendar();
						// deferred.resolve(getFirstWorkingDate(date));
						deferred.resolve(date);

					}
					return deferred.promise;
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

				function onDaySelect(day) {
					console.log('onDaySelect', day);
					if (!day || currentDay.isBefore(day.date)) {
						return;
					}
					if (day && day.working) {
						$timeout(function () {
							model.$setViewValue(day.date);
						});
					}
					/*
					// update the color picker whenever the value on the scope changes
					model.$render = function () {
					    element.val(model.$modelValue);
					    element.change();
					};
					*/
				}

				/*
				state.busy();
				$q.all([
                    Api.gantt.resources.actives().then(function success(response) {
						sources.resources = response;
					}),

                ]).then(function success(response) {
					setMonth(); // Init
					state.ready();

				}, function error(response) {
					console.log('calendarPopup.error', response);

				});
				*/

				setMonth(); // Init

				function onClick(e) {}

				function addListeners() {
					element.on('click', onClick);
				}

				function removeListeners() {
					element.off('click', onClick);
				}
				scope.$on('$destroy', function () {
					removeListeners();
				});
				addListeners();

			}
		};
    }]);

}());