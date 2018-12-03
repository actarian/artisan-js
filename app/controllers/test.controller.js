/* global angular */

(function() {
	"use strict";

	var app = angular.module('app');

	app.controller('TestCtrl', ['$scope', '$filter', '$http', 'State', 'Hash', 'DateTime', 'Range', 'LocalStorage', function($scope, $filter, $http, State, Hash, DateTime, Range, storage) {

		var state = new State();

		var sources = {};

		var publics = {
			state: state,
			sources: sources,
		};

		angular.extend($scope, publics);

		$http.get('api/test.json').then(function(response) {
			var slots = response.data;
			sources.slots = slots;
			setTodos();
			state.ready();
		});

		function setTodos() {
			var slots = sources.slots;
			var todos = new Hash('key');
			angular.forEach(slots, function(item) {
				var day = item.day;
				var week = $filter('isoWeek')(day.date, 1);
				var keys = [week, day.activityId, day.taskId || 0, day.locked ? day.key : 0];
				var key = keys.join('-');
				var todo = todos.once({
					key: key,
					customer: item.customer,
					project: item.project,
					activity: item.activity,
					task: item.task,
					hours: 0,
					recordedHours: 0,
					slots: new Hash('id'),
					player: {},
				});
				if (day.locked) {
					todo.day = day;
				}
				todo.slots.add(day);
				todo.hours += day.hours;
				// console.log(key, day);
			});
			/*
			todos.each(function (todo) {
				console.log(todo.key, todo);
			});
			*/
			todos.forward();
			sources.todos = todos;
		}

		$scope.$on('onTodoPause', function(scope, item) {
			var accumulatedHours = DateTime.timeToQuarterHour(item.player.accumulatedTime);
			// console.log('onTodoPause', accumulatedHours);
			item.recordedHours += accumulatedHours;
			item.player.update();
		});

		/*
		var day = Range.Day();
		var date = new Date();

		if (day.isInside(date)) {
			console.log('inside', day.toString(), date);
		}

		sources.day = day;
		*/

		//

		var range = Range.Week();

		console.log(range.toString());

		var days = new Hash('key');
		range.eachDay(function(day) {
			days.add(day);
		});

		console.log('days', days);

    }]);

}());
