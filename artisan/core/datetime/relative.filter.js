/* global angular */

(function() {
	"use strict";

	var app = angular.module('artisan');

	/*
	app.value('now', null);
	*/

	app.value('$formats', {
		just_now: 'just now',
		seconds_ago: '{{num}} seconds ago',
		a_minute_ago: 'a minute ago',
		minutes_ago: '{{num}} minutes ago',
		an_hour_ago: 'an hour ago',
		hours_ago: '{{num}} hours ago',
		a_day_ago: 'yesterday',
		days_ago: '{{num}} days ago',
		a_week_ago: 'a week ago',
		weeks_ago: '{{num}} weeks ago',
		a_month_ago: 'a month ago',
		months_ago: '{{num}} months ago',
		a_year_ago: 'a year ago',
		years_ago: '{{num}} years ago',
		over_a_year_ago: 'over a year ago',
		seconds_from_now: '{{num}} seconds from now',
		a_minute_from_now: 'a minute from now',
		minutes_from_now: '{{num}} minutes from now',
		an_hour_from_now: 'an hour from now',
		hours_from_now: '{{num}} hours from now',
		a_day_from_now: 'tomorrow',
		days_from_now: '{{num}} days from now',
		a_week_from_now: 'a week from now',
		weeks_from_now: '{{num}} weeks from now',
		a_month_from_now: 'a month from now',
		months_from_now: '{{num}} months from now',
		a_year_from_now: 'a year from now',
		years_from_now: '{{num}} years from now',
		over_a_year_from_now: 'over a year from now'
	});

	app.filter('dateRelative', ['$rootScope', '$interval', '$injector', '$formats', function($rootScope, $interval, $injector, $formats) {

		var minute = 60;
		var hour = minute * 60;
		var day = hour * 24;
		var week = day * 7;
		var month = day * 30;
		var year = day * 365;

		var $format = getFormat();

		function getFormat() {
			if ($injector.has('$format')) {
				return $injector.get('$format');
			} else {
				return {
					instant: function(id, params) {
						return $formats[id].replace('{{num}}', params.num);
					}
				};
			}
		}

		function getDelta(now, date) {
			return Math.round(Math.abs(now - date) / 1000);
		}
		/*
        $interval(function () {
            $rootScope.$now = new Date();
            console.log($rootScope.$now);
        }, 3 * 1000);
		*/
		return function(date) {
			if (!(date instanceof Date)) {
				date = new Date(date);
			}

			// now = now || new Date();
			var now = new Date();

			var delta = getDelta(now, date);

			if (delta > day && delta < week) {
				date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
				delta = getDelta(now, date);
			}

			var suffix = now >= date ? '_ago' : '_from_now';

			function format(key, num) {
				return $format.instant(key + (delta > 30 ? suffix : ''), {
					num: num
				});
			}

			console.log('delta', delta, now, date);

			if (delta < 30) {
				return format('just_now');

			} else if (delta < minute) {
				return format('seconds', delta);

			} else if (delta < 2 * minute) {
				return format('a_minute');

			} else if (delta < hour) {
				return format('minutes', Math.floor(delta / minute));

			} else if (delta < hour * 2) {
				return format('an_hour');

			} else if (delta < day) {
				return format('hours', Math.floor(delta / hour));

			} else if (delta < day * 2) {
				return format('a_day');

			} else if (delta < week) {
				return format('days', Math.floor(delta / day));

			} else if (Math.floor(delta / week) !== 1) {
				return format('a_week');

			} else if (delta < month) {
				return format('weeks', Math.floor(delta / week));

			} else if (Math.floor(delta / month) !== 1) {
				return format('a_month');

			} else if (delta < year) {
				return format('months', Math.floor(delta / month));

			} else if (Math.floor(delta / year) !== 1) {
				return format('a_year');

			} else {
				return format('over_a_year');

			}

		};
    }]);

	app.directive('dateRelative', ['$parse', '$filter', '$interval', function($parse, $filter, $interval) {
		return {
			priority: 1001,
			restrict: 'A',
			link: function(scope, element, attributes, model) {

				function setDate() {
					var date = $parse(attributes.dateRelative)(scope);
					var relative = $filter('dateRelative')(date);
					element[0].innerHTML = relative;
					// console.log('dateRelative.setDate', relative);
				}

				setDate();

				var i = setInterval(setDate, 60 * 1000);

				scope.$on('$destroy', function() {
					cancelInterval(i);
				});

			}
		};
	}]);

	// directive dateRelative -> apply filter every timeout

	/*
	myApp.config(function ($translateProvider) {
	    $translateProvider.translations('en', {
	        just_now: 'just now',
	        seconds_ago: '{{time}} seconds ago',
	    });

	    $translateProvider.translations('de', {
	        just_now: 'soeben',
	        seconds_ago: 'vor {{time}} stunden',
	    });

	    $translateProvider.preferredLanguage('en');
	});
	*/

}());
