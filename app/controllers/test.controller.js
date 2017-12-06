/* global angular */

(function () {
	"use strict";

	var app = angular.module('app');

	app.controller('TestCtrl', ['$scope', '$filter', '$http', 'State', 'Hash', 'DateTime', 'Range', 'LocalStorage', function ($scope, $filter, $http, State, Hash, DateTime, Range, storage) {

		var state = new State();

		var calendarOptions = {
			month: function () {
				console.log('TestCtrl.month', arguments);
			},
		};

		var sources = {
			calendarOptions: calendarOptions,
		};

		var publics = {
			state: state,
			sources: sources,
		};

		angular.extend($scope, publics); // todo

		$http.get('api/test.json').then(function (response) {
			var slots = response.data;
			sources.slots = slots;
			setTodos();
			state.ready();
		});

		function setTodos() {
			var slots = sources.slots;
			var todos = new Hash('key');
			angular.forEach(slots, function (item) {
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
			todos.each(function (todo) {
				console.log(todo.key, todo);
			});
			todos.forward();
			sources.todos = todos;
		}

		$scope.$on('onTodoPause', function (scope, item) {
			var accumulatedHours = DateTime.timeToQuarterHour(item.player.accumulatedTime);
			console.log('onTodoPause', accumulatedHours);
			item.recordedHours += accumulatedHours;
			item.player.update();
		});

		var day = new Range({
			type: Range.types.DAY
		});
		var date = new Date();

		if (day.isInside(date)) {
			console.log('inside', day.toString(), date);
		}

		sources.day = day;

    }]);

	/*
	app.controller('TodoRecordModalCtrl', ['$scope', '$routeParams', '$q', '$timeout', '$filter', 'State', 'Api', 'Range', 'Painter', function ($scope, $routeParams, $q, $timeout, $filter, State, Api, Range, Painter) {

		var state = new State();
		var user = $scope.modal.params.user;
		var row = $scope.modal.params.row;
		var model = angular.copy(row);
		var sources = $scope.modal.params.sources;
		sources = {
			hours: sources.hours,
			activities: sources.activities.map(function (row) {
				return row.activity;
			}),
		}
		var publics = {
			state: state,
			user: user,
			row: row,
			model: model,
			sources: sources,
			getStatusColor: getStatusColor,
		};

		angular.extend($scope, publics);

		function getDefaultAvatar() {
			var p = new Painter().setSize(100, 100);
			p.setFill(p.colors.blue);
			p.fillRect();
			p.setText('60px Project');
			p.setFill(p.colors.white);
			p.fillText('2', p.rect.center());
			return p.toDataURL();
		}

		var colors = ['blue', 'red', 'orange', 'light-orange', 'green', 'light-green', 'purple', 'light-blue']; // 'yellow', 'azur', 
		function getStatusColor(row) {
			return 'status-' + colors[row.activity.id % colors.length];
		}

		function Init() {
			if (!state.isReady) {
				state.ready();
			}
		}

		Init();

		$scope.submit = function () {
			if (state.busy()) {
				$scope.modal.resolve(model);
			}
		};

		$scope.onResourceSelect = function (resource) {
			model.resource = resource;
		};

	}]);
	*/

}());