/* global angular */

(function() {
	"use strict";

	app.directive('ngrid', ['$window', '$templateCache', '$templateRequest', '$interpolate', '$compile', '$filter', '$timeout', 'Gesture', 'Keys', 'Utils', function($window, $templateCache, $templateRequest, $interpolate, $compile, $filter, $timeout, Gesture, Keys, Utils) {
		// polyfill for trim >= IE9
		function trimWhiteSpace(string) {
			return string.replace(/^\s+|\s+$/gm, '');
		}
		return {
			priority: 1,
			restrict: 'A',
			replace: true,
			/*
			// with scope attributes watch won't work anymore
			scope: {},
			*/
			templateUrl: 'ngrid/partials/ngrid',
			transclude: true,
			controller: ['$transclude', '$attrs', function($transclude, $attrs) {
				if ($attrs.ngridTemplate === undefined) {
					$transclude(function(clone, scope) {
						var html = Array.prototype.slice.call(clone).filter(function(node) {
							// remove empty text nodes
							return (node.nodeType !== 3 || /\S/.test(node.nodeValue));
						}).map(function(node) {
							return trimWhiteSpace(node.outerHTML);
						});
						html = html.join('');
						$attrs.template = html;
					});
				}
            }],
			link: function(scope, element, attributes, model, transclude) {
				// console.log(attributes);
				var template;
				if (attributes.ngridTemplate !== undefined) {
					template = $templateCache.get(attributes.ngridTemplate);
				} else {
					template = attributes.template;
				}
				template = $compile(template);
				attributes.template = null;
				// console.log('template', template);
				var templateMonth, templateWeek, templateDay;
				var nodeElement = element[0],
					nodeHeader = nodeElement.querySelector('.ngrid-header'),
					nodeHeaderInner = nodeElement.querySelector('.ngrid-header>.ngrid-inner'),
					nodeHeaderMonths = nodeElement.querySelector('.ngrid-header>.ngrid-inner>.ngrid-months'),
					nodeHeaderWeeks = nodeElement.querySelector('.ngrid-header>.ngrid-inner>.ngrid-weeks'),
					nodeHeaderDays = nodeElement.querySelector('.ngrid-header>.ngrid-inner>.ngrid-days'),
					nodeTable = nodeElement.querySelector('.ngrid-table'),
					nodeTableInner = nodeElement.querySelector('.ngrid-table>.ngrid-inner'),
					nodeSpacer = nodeElement.querySelector('.ngrid-spacer'),
					// nodeInfo = nodeElement.querySelector('.ngrid-info'),
					monthsElement = angular.element(nodeHeaderMonths),
					weeksElement = angular.element(nodeHeaderWeeks),
					daysElement = angular.element(nodeHeaderDays),
					tableElement = angular.element(nodeTableInner),
					layout = scope.layout = {
						grid: {
							width: 0,
							height: 0
						},
						table: {
							x: 0,
							y: 0,
							width: 0,
							height: 0
						},
						scroll: {
							x: 0,
							y: 0
						},
						rows: {},
						cols: {},
						visibleMonths: [],
						visibleWeeks: [],
						visibleDays: [],
						visibles: [],
						cell: {
							width: attributes.cellWidth !== undefined ? parseInt(attributes.cellWidth) : 40,
							height: attributes.cellHeight !== undefined ? parseInt(attributes.cellHeight) : 40,
						},
						month: {
							width: attributes.monthWidth !== undefined ? parseInt(attributes.monthWidth) : 40,
							height: attributes.monthHeight !== undefined ? parseInt(attributes.monthHeight) : 25,
						},
						week: {
							width: attributes.weekWidth !== undefined ? parseInt(attributes.weekWidth) : 40,
							height: attributes.weekHeight !== undefined ? parseInt(attributes.weekHeight) : 25,
						},
						day: {
							width: attributes.dayWidth !== undefined ? parseInt(attributes.dayWidth) : 40,
							height: attributes.dayHeight !== undefined ? parseInt(attributes.dayHeight) : 40,
						},
						draw: {
							start: function(data) {
								console.log('ngrid.draw.start', data.row, data.col, data.count);
							},
							progress: function(data) {
								console.log('ngrid.draw.progress', data.row, data.col, data.count);
							},
							end: function(data) {
								console.log('ngrid.draw.end', data.row, data.col, data.count);
							},
						},
					},
					rows, cols, weeks, months;

				var keys = scope.keys = Keys;

				function updateRows() {
					var total = layout.rows.total,
						dirty = false,
						from, to, count;
					if (total > 0) {
						count = Math.ceil(layout.grid.height / layout.cell.height) + 1;
						from = Math.floor(layout.scroll.y / layout.cell.height);
						from = Math.max(0, Math.min(total - count + 1, from));
						to = Math.min(rows.length, from + count);
						count = to - from;
					} else {
						count = to = 1;
						from = 0;
					}
					dirty = (from !== layout.rows.from) || (to !== layout.rows.to);
					layout.rows.dirty = dirty;
					layout.rows.from = from;
					layout.rows.to = to;
					layout.rows.count = count;
				}

				function updateCols() {
					var total = layout.cols.total,
						dirty = false,
						from, to, count;
					if (total > 0) {
						count = Math.ceil(layout.grid.width / layout.cell.width) + 1;
						from = Math.floor(layout.scroll.x / layout.cell.width);
						from = Math.max(0, Math.min(total - count + 1, from));
						to = Math.min(cols.length, from + count);
						count = to - from;
					} else {
						count = to = 1;
						from = 0;
					}
					dirty = (from !== layout.cols.from) || (to !== layout.cols.to);
					layout.cols.dirty = dirty;
					layout.cols.from = from;
					layout.cols.to = to;
					layout.cols.count = count;
				}

				function getCell(i, item) {
					var r = Math.floor(i / layout.cols.count);
					var c = (i % layout.cols.count);
					var $row = layout.rows.from + r;
					var $col = layout.cols.from + c;
					var $index = $row * layout.cols.total + $col;
					var $scope = item ? item.scope : scope.$new();
					// console.log('getCell', $row, $col, $index);
					$scope.$i = i;
					$scope.$r = r;
					$scope.$c = c;
					$scope.$index = $index;
					$scope.$row = $row;
					$scope.$col = $col;
					if (rows) {
						$scope.row = rows[$row];
					}
					if (cols) {
						$scope.col = cols[$col];
					}
					return $scope;
				}

				function drawCells() {
					// console.log('drawCells', layout.rows.count, layout.cols.count, layout.rows.count * layout.cols.count);
					var count = layout.rows.count * layout.cols.count,
						visibles = layout.visibles,
						targetElement = tableElement;
					if (layout.rows.dirty || layout.cols.dirty || layout.dirty) {
						angular.forEach(visibles, function(item, i) {
							if (i < count) {
								var $scope = getCell(i, item);
							}
						});
					}
					while (visibles.length < count) {
						var $scope = getCell(visibles.length);
						var compiled = template($scope, function(cloned) {
							compiled = cloned;
						});
						var $element = angular.element(compiled);
						targetElement.append($element);
						visibles.push({
							element: $element,
							scope: $scope,
						});
					}
					layout.dirty = layout.rows.dirty = layout.cols.dirty = false;
				}

				function update() {
					if (layout.rows.total !== undefined &&
						layout.cols.total !== undefined) {
						updateRows();
						updateCols();
						drawCells();
						render();
						redraw();
						if (!scope.$$phase) {
							scope.$digest();
						}
					}
				}

				function refresh() {
					if (layout.rows.total !== undefined &&
						layout.cols.total !== undefined) {
						layout.rows.dirty = true;
						layout.cols.dirty = true;
						drawCells();
						if (!scope.$$phase) {
							scope.$digest();
						}
					}
				}

				function render() {
					var count = layout.rows.count * layout.cols.count,
						visibles = layout.visibles;
					angular.forEach(visibles, function(item, i) {
						var node = item.element[0];
						if (i < count) {
							node.style.width = (cols ? layout.cell.width : layout.table.width) + 'px';
							node.style.height = (rows ? layout.cell.height : layout.table.height) + 'px';
							var r = item.scope.$r;
							var c = item.scope.$c;
							transform(node, 'translateX(' + (c * layout.cell.width) + 'px) translateY(' + (r * layout.cell.height) + 'px)');
						} else {
							transform(node, 'translateX(-1000px) translateY(-1000px)');
						}
					});
				}

				function redraw() {
					layout.table.x = Math.floor(layout.scroll.x / layout.cell.width) * layout.cell.width;
					layout.table.y = Math.floor(layout.scroll.y / layout.cell.height) * layout.cell.height;
					nodeTableInner.style.width = (layout.cols.has ? layout.cell.width * layout.cols.count + 'px' : '100%'); // layout.grid.width
					nodeTableInner.style.height = (layout.rows.has ? layout.cell.height * layout.rows.count : layout.grid.height) + 'px';
					transform(nodeTableInner, 'translateX(' + layout.table.x + 'px) translateY(' + layout.table.y + 'px)');
				}

				function transform(node, value) {
					node.style.WebkitTransform =
						node.style.MozTransform =
						node.style.OTransform =
						node.style.MsTransform =
						node.style.transform =
						value;
				}

				function onRows() {
					layout.rows.total = 0;
					layout.table.height = 0;
					if (rows) {
						layout.rows.total = rows.length;
						layout.table.height = layout.rows.total * layout.cell.height;
						layout.rows.has = true;
					} else {
						layout.table.height = layout.grid.height;
						layout.rows.has = false;
					}
					if (rows && rows.length) {
						element.addClass('vertical');
					} else {
						element.removeClass('vertical');
					}
					nodeSpacer.style.height = layout.table.height + 'px';
					layout.dirty = true;
				}

				function onCols() {
					layout.cols.total = 0;
					layout.table.width = 0;
					if (cols) {
						layout.cols.total = cols.length;
						layout.table.width = layout.cols.total * layout.cell.width;
						layout.cols.has = true;
					} else {
						layout.table.width = layout.grid.width;
						layout.cols.has = false;
					}
					if (cols && cols.length) {
						element.addClass('horizontal');
						nodeSpacer.style.width = layout.table.width + 'px';
					} else {
						element.removeClass('horizontal');
						nodeSpacer.style.width = 'auto';
					}
					layout.dirty = true;
				}

				function scrollToColumn(c) {
					resize();
					nodeTable.scrollLeft = (c * layout.cell.width);
					// console.log('scrollToColumn', (layout.table.width - layout.grid.width), nodeTable.scrollLeft);
					doScroll();
				}

				function scrollToX(x) {
					nodeTable.scrollLeft = x;
					// console.log('scrollTo');
					doScroll();
				}

				function scrollToY(y) {
					nodeTable.scrollTop = y;
					// console.log('scrollTo');
					doScroll();
				}

				function scrollTo($layout) {
					nodeTable.scrollLeft = $layout.scroll.x;
					nodeTable.scrollTop = $layout.scroll.y;
					// console.log('scrollTo');
					doScroll();
				}

				function doScroll() {
					if (rows) {
						layout.rows.total = rows.length;
						layout.table.height = layout.rows.total * layout.cell.height;
					} else {
						layout.table.height = layout.grid.height;
					}
					if (cols) {
						layout.cols.total = cols.length;
						layout.table.width = layout.cols.total * layout.cell.width;
					} else {
						layout.table.width = layout.grid.width;
					}
					layout.scroll.x = Math.max(0, Math.min((layout.table.width - layout.grid.width), nodeTable.scrollLeft));
					layout.scroll.y = Math.max(0, Math.min((layout.table.height - layout.grid.height), nodeTable.scrollTop));
					// console.log(layout.scroll.x, layout.scroll.y, layout.table.width, layout.grid.width);
					// console.log('doScroll', (layout.table.width - layout.grid.width), nodeTable.scrollLeft);
					update();
				}

				function onScroll() {
					doScroll();
					// console.log('ngrid.doScroll');
					if (angular.isFunction(layout.onScroll)) {
						layout.onScroll(layout);
					}
				}

				function resize() {
					var WW = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
					var WH = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
					// nodeTable = nodeElement.querySelector('.ngrid-table');
					layout.grid.width = layout.table.width = Math.min(nodeTable.offsetWidth, WW);
					layout.grid.height = layout.table.height = Math.min(nodeTable.offsetHeight, WH);
					// console.log('ngrid.resize', layout.grid.width, layout.grid.height, nodeTable.parentElement.offsetWidth, WW, nodeTable, nodeTable.parentElement);
				}
				// resize fires on window resize and on scope update

				function onResize() {
					resize();
					update();
				}

				function addListeners() {
					angular.element(nodeTable).on('scroll', onScroll);
					angular.element($window).on('resize', onResize);
				};

				function removeListeners() {
					angular.element(nodeTable).off('scroll', onScroll);
					angular.element($window).off('resize', onResize);
				};

				addListeners();

				onRows();
				onCols();
				onResize();

				// WATCH OPTIONS
				scope.$watch(attributes.ngrid, function(value) {
					if (angular.isObject(value)) {
						console.log('attributes.ngrid', value);
						// ok but add a schema (keys)
						layout.scrollTo = scrollTo;
						layout.scrollToX = scrollToX;
						layout.scrollToY = scrollToY;
						layout.refresh = refresh;
						var keys = ['onScroll', 'draw', 'scrollTo', 'scrollToX', 'scrollToY', 'refresh'];
						angular.forEach(keys, function(key) {
							layout[key] = value[key] || layout[key];
							value[key] = value[key] || layout[key];
						});
						value.getRow = function(row) {
							return rows ? rows[row] : null;
						};
						value.getCol = function(col) {
							return cols ? cols[col] : null;
						};
						// angular.extend(layout, value);
						onResize();
						// console.log('ngrid.$watch.ngrid', layout);
					}
				});

				// WATCH ROWS
				scope.$watchCollection(attributes.ngridRows, function(value, oldValue) {
					if (value) {
						rows = value;
						onRows();
						onResize();
						console.log('ngrid.$watchCollection.ngridRows', value);
					}
				});

				// WATCH COLS
				scope.$watchCollection(attributes.ngridCols, function(value) {
					if (value) {
						cols = value;
						onCols();
						onResize();
						console.log('ngrid.$watchCollection.ngridCols', value);
					}
				});

				scope.$on('$destroy', function() {
					removeListeners();
				});

			}
		};

    }]);

}());
