(function() {
	"use strict";

	var app = angular.module('artisan');

	app.directive('calendarPopupRecords', ['$templateCache', '$parse', '$q', '$timeout', '$filter', 'Hash', 'DateTime', 'Range', 'CalendarFactory', 'State', 'Api', function($templateCache, $parse, $q, $timeout, $filter, Hash, DateTime, Range, CalendarFactory, State, Api) {
		return {
			restrict: 'A',
			template: function(element, attributes) {
				return '<div calendar-popup="options"></div>';
			},
			require: 'ngModel',
			scope: {
				user: '=calendarUser',
			},
			link: function(scope, element, attributes, model, transclude) {

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

				var currentDay = Range.Day();

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
					GetMonthRecords(month).then(function() {
						setAbsencesAndOvertimes();
						updateCalendar(date, month, calendar);
						deferred.resolve(getFirstWorkingDate(date, month, calendar));

					}, function() {
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
							angular.forEach(response, function(item) {
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
                        Api.gantt.records(user.id, monthExpanded.getParams()).then(function(rows) {
							sources.monthRecords = rows.map(function(row) {
								row.state = new State();
								row.record.date = new Date(row.record.date);
								return row;
							});
						}),

                    ]).then(function(response) {
						// state.success();
						deferred.resolve();

					}, function(error) {
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
						$timeout(function() {
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
					calendar.days.each(function(day) {
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
					angular.forEach(monthRecords, function(row) {
						var day = calendar.days.get(row.record.key);
						if (day) {
							day.recordedHours += row.record.hours;
						}
					});
					calendar.days.each(function(day) {
						day.green = day.working && !currentDay.isBefore(day.date) && day.recordedHours >= 8;
						day.orange = day.working && !currentDay.isBefore(day.date) && day.recordedHours < 8;
						// day.full = day.workable && day.hours >= day.availableHours;
						// day.available = day.workable && day.hours < day.availableHours;
					});
				}

				function setResources(resources) {
					sources.resources = resources;
					angular.forEach(resources, function(resource) {
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
					angular.forEach(sources.absencesAndOvertimes, function(item) {
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
						calendar.days.each(function(day) {
							if (!firstWorkingDate && !month.isOutside(day.date) && day.working && !day.vacation) {
								// console.log('check', day.working, day.vacation, day.date);
								firstWorkingDate = day.date;
							}
						});
						// console.log('setFirstDay', firstWorkingDate);
					}
					if (date) {
						var key = CalendarFactory.getKey(date);
						var day = calendar.days.get(key);
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

	app.directive('calendarPopup', ['$templateCache', '$parse', '$q', '$timeout', '$filter', 'Hash', 'DateTime', 'Range', 'CalendarFactory', 'State', 'Api', function($templateCache, $parse, $q, $timeout, $filter, Hash, DateTime, Range, CalendarFactory, State, Api) {

		return {
			priority: 1002,
			restrict: 'A',
			templateUrl: TemplateUrl,
			scope: {
				options: '=calendarPopup',
			},
			link: Link,
		};

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
				onMonthDidChange: function() {},
				onWeekDidSelect: function() {},
				onDayDidSelect: function() {},
			};

			var month = Range.Month();
			var week = Range.Week();
			var day = Range.Day();

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
					if (date) {
						month.setDate(date);
					}
					onMonthChange(date);
				}
			}

			function onMonthChange(date) {
				var calendarMonth = calendar.getMonthByDate(month.getDate());
				calendarMonth.days.each(function(day) {
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
				calendarMonth.days.each(function(day) {
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
				};
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

/*

(function () {
    "use strict";

    var app = angular.module('app');


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
            link: CalendarPopupLink,
        };

        function CalendarPopupLink(scope, element, attributes, model, transclude) {
            console.log('calendarPopupRecords.link');

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

            var currentDay = new Range({ type: Range.types.DAY });

            function loadResources() {
                var deferred = $q.defer();
                if (sources.resources) {
                    deferred.resolve();
                } else {
                    Api.gantt.resources.actives().then(function success(response) {
                        setResources(response);
                        deferred.resolve();
                    }, function (error) {
                        deferred.reject();
                    });
                }
                return deferred.promise;
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
                    var day = calendar.days.get(key);
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

            function getMonthRecords(month) {
                var deferred = $q.defer();
                var user = scope.user;
                var monthExpanded = Range.expand(month, DateTime.DAY * 7);
                // console.log('calendarPopupRecords.getMonthRecords', monthExpanded.toString());
                $q.all([
                    loadResources(),
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

            function onMonthDidChange(date, month, calendar) {
                var deferred = $q.defer();
                console.log('calendarPopupRecords.onMonthDidChange', month.toString());
                getMonthRecords(month).then(function () {
                    setAbsencesAndOvertimes();
                    updateCalendar(date, month, calendar);
                    deferred.resolve(getFirstWorkingDate(date, month, calendar));

                }, function () {
                    deferred.reject();

                });
                return deferred.promise;
            }

            function onWeekDidSelect(week, month, calendar) {
                // console.log('calendarPopupRecords.onWeekDidSelect', month.toString());
                // var monthExpanded = Range.expand(month, DateTime.DAY * 7);
                return true;
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

            function setResources(resources) {
                var user = scope.user;
                sources.resources = resources;
                console.log('calendarPopupRecords.setResources', resources.length, user);
                angular.forEach(resources, function (resource) {
                    resource.absencesAndOvertimes = {};
                    if (resource.id === user.id) {
                        sources.resource = resource;
                        // console.log('calendarPopupRecords.setResources.resource', resource);
                    }
                });
            }

            function setWorkableDay(day) {
                var resource = sources.resource;
                day.working = !sources.unworkings[day.key];
                var availableHours = 0;
                if (resource) {
                    if (day.working) {
                        availableHours += resource.baseHours;
                    }
                    var ao = resource.absencesAndOvertimes[day.key];
                    if (ao) {
                        availableHours += ao.hours;
                    }
                } else if (day.working) {
                    availableHours += 8;
                }
                var has = availableHours > 0;
                day.availableHours = availableHours;
                day.recordedHours = 0;
                day.holiday = !day.working && !has && !day.weekend;
                day.vacation = day.working && !has;
                day.wasVacation = day.vacation && day.past;
                day.workable = day.working && !day.past && has;
                day.wasWorkable = day.working && day.past && has;
            }

            function updateCalendar(date, month, calendar) {
                calendar.days.each(function (day) {
                    setWorkableDay(day);
                });
            }

            function updateCalendar(date, month, calendar) {
                calendar.days.each(function (day) {
                    setWorkableDay(day);
                });
                var monthRecords = sources.monthRecords;
                if (monthRecords) {
                    angular.forEach(monthRecords, function (row) {
                        var day = calendar.days.get(row.record.key);
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
            }

        }
    }]);

    app.directive('calendarPopupWorkables', ['$templateCache', '$parse', '$q', '$timeout', '$filter', 'Hash', 'DateTime', 'Range', 'CalendarFactory', 'State', 'Api', function ($templateCache, $parse, $q, $timeout, $filter, Hash, DateTime, Range, CalendarFactory, State, Api) {
        return {
            restrict: 'A',
            template: function (element, attributes) {
                return '<div calendar-popup="options" template="partials/calendar/popup/workables"></div>';
            },
            require: 'ngModel',
            scope: {
                user: '=?calendarUser',
            },
            link: CalendarPopupLink,
        };

        function CalendarPopupLink(scope, element, attributes, model, transclude) {
            console.log('calendarPopupWorkables.link');

            var user = scope.user;

            var state = new State();

            var options = {
                onMonthDidChange: onMonthDidChange,
                onWeekDidSelect: onWeekDidSelect,
                onDayDidSelect: onDayDidSelect,
            };

            var sources = {};

            var publics = {
                state: state,
                options: options,
            };

            angular.extend(scope, publics);

            var currentDay = new Range({ type: Range.types.DAY });

            function getFirstWorkingDate(date, month, calendar) {
                var firstWorkingDate = null;
                function setFirstDay() {
                    calendar.days.forward();
                    calendar.days.each(function (day) {
                        if (!firstWorkingDate && !month.isOutside(day.date) && day.working && !day.vacation) {
                            firstWorkingDate = day.date;
                        }
                    });
                }
                if (date) {
                    var key = CalendarFactory.getKey(date);
                    var day = calendar.days.get(key);
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

            function loadResources(monthExpanded) {
                var deferred = $q.defer();
                if (sources.resources) {
                    deferred.resolve();
                } else {
                    Api.gantt.resources.actives().then(function success(response) {
                        setResources(response);
                        deferred.resolve();
                    }, function (error) {
                        deferred.reject();
                    });
                }
                return deferred.promise;
            }

            function loadAbsencesAndOvertimes(monthExpanded) {
                return Api.gantt.absencesAndOvertimes(monthExpanded.getParams()).then(function success(response) {
                    sources.absencesAndOvertimes = response;
                });
            }

            function loadCalendar(monthExpanded) {
                return Api.gantt.calendar(monthExpanded.getParams()).then(function success(response) {
                    var unworkings = {};
                    angular.forEach(response, function (item) {
                        unworkings[item.key] = item;
                    });
                    sources.unworkings = unworkings;
                    sources.calendar = response;
                })
            }

            function getMonthRecords(month) {
                var deferred = $q.defer();
                var user = scope.user;
                var monthExpanded = Range.expand(month, DateTime.DAY * 7);
                var promises;
                if (user) {
                    promises = [loadResources(monthExpanded), loadAbsencesAndOvertimes(monthExpanded), loadCalendar(monthExpanded)];
                } else {
                    promises = [loadCalendar(monthExpanded)];
                }
                $q.all(promises).then(function (response) {
                    deferred.resolve();

                }, function (error) {
                    deferred.reject();

                });
                return deferred.promise;
            }

            function onDayDidSelect(day, month, calendar) {
                if (!day) { // || currentDay.isBefore(day.date)) {
                    return;
                }
                if (day && day.working) {
                    $timeout(function () {
                        model.$setViewValue(day.date);
                    });
                    return true;
                }
            }

            function onMonthDidChange(date, month, calendar) {
                var deferred = $q.defer();
                console.log('calendarPopupRecords.onMonthDidChange', month.toString());
                getMonthRecords(month).then(function () {
                    setAbsencesAndOvertimes();
                    updateCalendar(date, month, calendar);
                    deferred.resolve(getFirstWorkingDate(date, month, calendar));

                }, function () {
                    deferred.reject();

                });
                return deferred.promise;
            }

            function onWeekDidSelect(week, month, calendar) {
                // console.log('calendarPopupRecords.onWeekDidSelect', month.toString());
                // var monthExpanded = Range.expand(month, DateTime.DAY * 7);
                return true;
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

            function setResources(resources) {
                var user = scope.user;
                sources.resources = resources;
                console.log('calendarPopupRecords.setResources', resources.length, user);
                angular.forEach(resources, function (resource) {
                    resource.absencesAndOvertimes = {};
                    if (resource.id === user.id) {
                        sources.resource = resource;
                        // console.log('calendarPopupRecords.setResources.resource', resource);
                    }
                });
            }

            function setWorkableDay(day) {
                var resource = sources.resource;
                day.working = !sources.unworkings[day.key];
                var availableHours = 0;
                if (resource) {
                    if (day.working) {
                        availableHours += resource.baseHours;
                    }
                    var ao = resource.absencesAndOvertimes[day.key];
                    if (ao) {
                        availableHours += ao.hours;
                    }
                } else if (day.working) {
                    availableHours += 8;
                }
                // console.log('setWorkableDay', day.key, 'day.working', day.working, 'availableHours', availableHours);
                var has = availableHours > 0;
                day.availableHours = availableHours;
                day.recordedHours = 0;
                day.holiday = !day.working && !has && !day.weekend;
                day.vacation = day.working && !has;
                day.wasVacation = day.vacation && day.past;
                day.workable = day.working && !day.past && has;
                day.wasWorkable = day.working && day.past && has;
            }

            function updateCalendar(date, month, calendar) {
                calendar.days.each(function (day) {
                    setWorkableDay(day);
                });
            }

        }
    }]);

    app.directive('calendarPopup', ['$templateCache', '$parse', '$q', '$timeout', '$filter', 'Hash', 'DateTime', 'Range', 'CalendarFactory', 'State', 'Api', function ($templateCache, $parse, $q, $timeout, $filter, Hash, DateTime, Range, CalendarFactory, State, Api) {
        return {
            restrict: 'A',
            templateUrl: TemplateUrl,
            scope: {
                options: '=calendarPopup',
            },
            link: CalendarPopupLink,
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

        function CalendarPopupLink(scope, element, attributes, model, transclude) {
            console.log('calendarPopup.link', scope.options);

            var calendar = new CalendarFactory();

            var options;

            var month = new Range({ type: Range.types.MONTH });
            var week = new Range({ type: Range.types.WEEK });
            var day = new Range({ type: Range.types.DAY });

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

            scope.$watch('options', function (newValue) {
                options = newValue;
                options = options || {
                    onMonthDidChange: function () {
                        var deferred = $q.defer();
                        deferred.resolve();
                        return deferred.promise;
                    },
                    onWeekDidSelect: function () { },
                    onDayDidSelect: function () { },
                }
                setMonth(); // Init
            });

            function setMonth(date) {
                if (!date || month.isOutside(date)) {
                    onMonthChange(date);
                }
            }

            function onMonthChange(date) {
                var calendarMonth = calendar.getMonthByDate(date); // month.getDate();
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
                // console.log('calendarPopup.onMonthChange', calendarMonth);
                options.onMonthDidChange(date, Range.currentMonth().setDate(date), calendarMonth).then(function () {
                    date ? month.setDate(date) : null;
                    sources.calendarMonth = calendarMonth;
                    scope.$emit('onMonthDidChange', options);
                });
            }

            function onWeekSelect(week) {
                // console.log('onWeekSelect', week);
                if (!week) {
                    return;
                }
                if (options.onWeekDidSelect(week, month, sources.calendarMonth) === true) {
                    // sources.week.setDate(week.date);
                    // updateSelections();
                    scope.$emit('onWeekDidSelect', options);
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
                    scope.$emit('onDayDidSelect', options);
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

*/
