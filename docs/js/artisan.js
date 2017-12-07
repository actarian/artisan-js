/* global angular */

(function() {
    "use strict";

    var app = angular.module('artisan', ['ng', 'ngRoute', 'ngMessages']);

}());
/* global angular, firebase */

(function () {
	"use strict";

	var app = angular.module('artisan');

	app.factory('Color', [function () {
		function Color(r, g, b, a) {
			if (arguments.length > 1) {
				this.r = (r || r === 0) ? r : 0;
				this.g = (g || g === 0) ? g : 0;
				this.b = (b || b === 0) ? b : 0;
				this.a = (a || a === 0) ? a : 255;
			} else {
				var uint = r || '0xffffff';
				uint = parseInt(uint);
				if (r.length > 8) {
					this.r = uint >> 24 & 0xff;
					this.g = uint >> 16 & 0xff;
					this.b = uint >> 8 & 0xff;
					this.a = uint >> 0 & 0xff;
				} else {
					this.r = uint >> 16 & 0xff;
					this.g = uint >> 8 & 0xff;
					this.b = uint >> 0 & 0xff;
					this.a = 255;
				}
			}
		}
		Color.componentToHex = function (c) {
			var hex = c.toString(16);
			return hex.length == 1 ? '0' + hex : hex;
		};
		Color.luma = function (color) {
			// var luma = color.dot({ r: 54.213, g: 182.376, b: 18.411 });
			var luma = color.dot({
				r: 95,
				g: 100,
				b: 60
			});
			return luma;
		};
		Color.contrast = function (color) {
			var luma = Color.luma(color);
			if (luma > 0.6) {
				return new Color('0x000000');
			} else {
				return new Color('0xffffff');
			}
		};
		Color.darker = function (color, pow, min) {
			min = min || 0;
			var r = Math.max(Math.floor(color.r * min), Math.floor(color.r - 255 * pow));
			var g = Math.max(Math.floor(color.g * min), Math.floor(color.g - 255 * pow));
			var b = Math.max(Math.floor(color.b * min), Math.floor(color.b - 255 * pow));
			return new Color(r, g, b, color.a);
		};
		Color.lighter = function (color, pow, max) {
			max = max || 1;
			var r = Math.min(color.r + Math.floor((255 - color.r) * max), Math.floor(color.r + 255 * pow));
			var g = Math.min(color.g + Math.floor((255 - color.g) * max), Math.floor(color.g + 255 * pow));
			var b = Math.min(color.b + Math.floor((255 - color.b) * max), Math.floor(color.b + 255 * pow));
			return new Color(r, g, b, color.a);
		};
		/*
		Color.rgbaToHex = function (rgba) {
		    rgba = rgba.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
		    return (rgba && rgba.length === 4) ? "#" +
		        ("0" + parseInt(rgba[1], 10).toString(16)).slice(-2) +
		        ("0" + parseInt(rgba[2], 10).toString(16)).slice(-2) +
		        ("0" + parseInt(rgba[3], 10).toString(16)).slice(-2) : '';
		}
		*/
		Color.prototype = {
			toUint: function () {
				return (this.r << 24) + (this.g << 16) + (this.b << 8) + (this.a);
			},
			toHex: function () {
				return '#' + Color.componentToHex(this.r) + Color.componentToHex(this.g) + Color.componentToHex(this.b) + Color.componentToHex(this.a);
			},
			toRgba: function () {
				return 'rgba(' + this.r + ',' + this.g + ',' + this.b + ',' + (this.a / 255).toFixed(3) + ')';
			},
			dot: function (color) {
				return ((this.r / 255) * (color.r / 255) + (this.g / 255) * (color.g / 255) + (this.b / 255) * (color.b / 255));
			},
			alpha: function (pow, min, max) {
				min = min || 0;
				max = max || 1;
				this.a = Math.floor((min + (pow * (max - min))) * 255);
				return this;
			},
			makeSet: function () {
				this.foreground = Color.contrast(this);
				this.border = Color.darker(this, 0.3);
				this.light = Color.lighter(this, 0.3);
				return this;
			},
		};
		return Color;
    }]);

	app.factory('Shape', [function () {
		function Shape() {}
		Shape.shapeCircle = function (p, cx, cy, r, sa, ea) {
			sa = sa || 0;
			ea = ea || 2 * Math.PI;
			p.ctx.arc(cx, cy, r, sa, ea, false);
		};
		Shape.shapeStar = function (p, cx, cy, or, ir, steps) {
			var x, y;
			var angle = Math.PI / 2 * 3;
			var step = Math.PI / steps;
			var ctx = p.ctx;
			ctx.moveTo(cx, cy - or);
			for (i = 0; i < steps; i++) {
				x = cx + Math.cos(angle) * or;
				y = cy + Math.sin(angle) * or;
				ctx.lineTo(x, y);
				angle += step;
				x = cx + Math.cos(angle) * ir;
				y = cy + Math.sin(angle) * ir;
				ctx.lineTo(x, y);
				angle += step;
			}
			ctx.lineTo(cx, cy - or);
		};
		Shape.shapeRoundRect = function (p, rect, r) {
			var ctx = p.ctx,
				x = rect.x,
				y = rect.y,
				w = rect.w,
				h = rect.h;
			if (typeof r === undefined) {
				r = 4;
			}
			if (typeof r === 'number') {
				r = {
					tl: r,
					tr: r,
					br: r,
					bl: r
				};
			} else {
				var defaultRadius = {
					tl: 0,
					tr: 0,
					br: 0,
					bl: 0
				};
				for (var key in defaultRadius) {
					r[key] = r[key] || defaultRadius[key];
				}
			}
			ctx.moveTo(x + r.tl, y);
			ctx.lineTo(x + w - r.tr, y);
			ctx.quadraticCurveTo(x + w, y, x + w, y + r.tr);
			ctx.lineTo(x + w, y + h - r.br);
			ctx.quadraticCurveTo(x + w, y + h, x + w - r.br, y + h);
			ctx.lineTo(x + r.bl, y + h);
			ctx.quadraticCurveTo(x, y + h, x, y + h - r.bl);
			ctx.lineTo(x, y + r.tl);
			ctx.quadraticCurveTo(x, y, x + r.tl, y);
		};
		Shape.circle = function () {
			var params = Array.prototype.slice.call(arguments);
			var ctx = params[0].ctx;
			ctx.beginPath();
			Shape.shapeCircle.apply(this, params);
			ctx.closePath();
		};
		Shape.star = function () {
			var params = Array.prototype.slice.call(arguments);
			var ctx = params[0].ctx;
			ctx.beginPath();
			Shape.shapeStar.apply(this, params);
			ctx.closePath();
		};
		Shape.roundRect = function () {
			var params = Array.prototype.slice.call(arguments);
			var ctx = params[0].ctx;
			ctx.beginPath();
			Shape.shapeRoundRect.apply(this, params);
			ctx.closePath();
		};
		return Shape;
    }]);

	app.constant('PainterColors', {
		/*
		black: new Color('0x111111'),
		white: new Color('0xffffff'),
		red: new Color('0xff0000'),
		green: new Color('0x00ff00'),
		blue: new Color('0x0000ff'),
		yellow: new Color('0xffff00'),
		cyan: new Color('0x00ffff'),
		purple: new Color('0xff00ff'),
		*/
		black: '0x14191e',
		white: '0xffffff',
		blue: '0x0023FF',
		red: '0xF21500',
		lightBlue: '0x79ccf2',
		lightYellow: '0xfff79a',
		greyLighter: '0xf8f8f8',
		greyLight: '0xeeeeee',
		greyMedium: '0xcccccc',
		grey: '0x90939b',
		map: '0x24292e',
	});

	app.factory('Palette', ['$q', 'Painter', 'Rect', function ($q, Painter, Rect) {
		function Palette() {
			this.painter = new Painter().setSize(0, 0);
			this.buffer = new Painter().setSize(0, 0);
			this.size = {
				w: 0,
				h: 0
			};
			this.pool = {};
			this.rows = {};
		}
		Palette.prototype = {
			getRect: function (w, h) {
				var p = this.painter,
					size = this.size,
					rows = this.rows,
					r = new Rect(0, 0, w, h),
					row = rows[h] || {
						x: 0,
						y: size.h
					};
				size.w = Math.max(size.w, row.x + w);
				size.h = Math.max(size.h, row.y + h);
				if (!p.canvas.width && !p.canvas.height) {
					p.setSize(size.w, size.h);
				} else if (size.w > p.canvas.width || size.h > p.canvas.height) {
					// var img = new Image();
					// img.src = p.toDataURL();
					// document.body.appendChild(canvas);
					// console.log(p.canvas.width, p.canvas.height);
					// var data = p.ctx.getImageData(0, 0, p.canvas.width, p.canvas.height);
					var canvas = p.canvas;
					p.setCanvas(document.createElement('canvas'));
					p.setSize(size.w, size.h);
					p.ctx.drawImage(canvas, 0, 0);
					// p.ctx.putImageData(data, 0, 0);
					// p.ctx.drawImage(img, 0, 0);
					// document.body.removeChild(canvas);
				}
				r.x = row.x;
				r.y = row.y;
				row.x += w;
				rows[h] = row;
				return r;
			},
			add: function (key, path) {
				var palette = this;
				if (angular.isString(path)) {
					var deferred = $q.defer();
					var img = new Image();
					img.onload = function () {
						palette.addShape(key, img.width, img.height, function (p, rect) {
							p.ctx.drawImage(img, 0, 0);
						});
						deferred.resolve(img);
					};
					img.onerror = function () {
						deferred.reject('connot load ' + path);
					};
					img.src = path;
					return deferred.promise;
				} else {
					var params = Array.prototype.slice.call(arguments);
					return palette.addShape.apply(palette, params);
				}
			},
			addShape: function (key, w, h, callback) {
				var p = this.painter,
					r = this.getRect(w, h);
				p.ctx.save();
				p.ctx.rect(r.x, r.y, r.w, r.h);
				// p.ctx.stroke();
				p.ctx.clip();
				p.ctx.translate(r.x, r.y);
				callback.call(p, p, r.clone().setPos(0, 0));
				p.ctx.restore();
				this.pool[key] = r;
				// console.log('Painter.add', r);
			},
			draw: function (target, key, x, y, pre) {
				var r = this.pool[key];
				if (r) {
					// var ctx = target.ctx;
					// ctx.save();
					target.drawRect(this.painter.canvas, r, {
						x: x,
						y: y,
						w: r.w,
						h: r.h
					}, pre);
					// target.ctx.drawImage(this.painter.canvas, r.x, r.y, r.w, r.h, x - r.w / 2, y - r.h / 2, r.w, r.h);
					// ctx.restore();
				}
			},
			tint: function (target, key, x, y, color, pre) {
				var r = this.pool[key];
				if (r) {
					var p = this.painter,
						b = this.buffer.setSize(r.w, r.h);
					b.save();
					b.setFill(color);
					b.fillRect();
					b.ctx.globalCompositeOperation = "destination-atop";
					b.ctx.drawImage(p.canvas, r.x, r.y, r.w, r.h, 0, 0, r.w, r.h);
					b.restore();
					console.log(x, y, b.canvas, target.canvas);
					target.draw(b.canvas, {
						x: x,
						y: y
					}, pre);
				}
			},
			pattern: function (target, key, x, y, w, h, color) {
				function drawPattern(pattern) {
					var ctx = target.ctx;
					ctx.save();
					ctx.translate(x, y);
					// draw
					// ctx.beginPath();
					// ctx.rect(-x, -y, w, h);
					ctx.fillStyle = pattern;
					ctx.fillRect(-x, -y, w, h);
					ctx.translate(-x, -y);
					// ctx.fill();
					ctx.restore();
				}
				var r = this.pool[key];
				if (r) {
					var img = r.img,
						pattern;
					if (!img || r.color != color) {
						var b = this.buffer.setSize(r.w, r.h);
						if (color) {
							r.color = color;
							b.save();
							b.setFill(color);
							b.fillRect();
							b.ctx.globalCompositeOperation = "destination-atop";
							b.ctx.drawImage(this.painter.canvas, r.x, r.y, r.w, r.h, 0, 0, r.w, r.h);
							b.restore();
						} else {
							b.ctx.drawImage(this.painter.canvas, r.x, r.y, r.w, r.h, 0, 0, r.w, r.h);
						}
						img = new Image();
						img.onload = function () {
							r.img = img;
							pattern = target.ctx.createPattern(img, "repeat");
							drawPattern(pattern);
						};
						img.src = b.toDataURL();
					} else {
						pattern = target.ctx.createPattern(img, "repeat");
						drawPattern(pattern);
					}
				}
			},
		};
		return Palette;
    }]);

	app.factory('Painter', ['Shape', 'Rect', 'Color', 'PainterColors', function (Shape, Rect, Color, PainterColors) {
		function Painter(canvas) {
			canvas = canvas || document.createElement('canvas');
			this.rect = new Rect();
			this.drawingRect = new Rect();
			this.setColors();
			this.setCanvas(canvas);
		}
		Painter.colors = {};
		angular.forEach(PainterColors, function (value, key) {
			Painter.colors[key] = new Color(value).makeSet();
		});
		var colors = Painter.colors;
		Painter.prototype = {
			colors: Painter.colors,
			setColors: function () {
				var colors = this.colors;
				angular.forEach(PainterColors, function (value, key) {
					colors[key] = new Color(value).makeSet();
				});
			},
			setCanvas: function (canvas) {
				this.canvas = canvas;
				this.setSize(canvas.offsetWidth, canvas.offsetHeight);
				var ctx = canvas.getContext('2d');
				ctx.lineCap = 'square';
				this.ctx = ctx;
				return this;
			},
			setSize: function (w, h) {
				this.canvas.width = w;
				this.canvas.height = h;
				this.rect.w = w;
				this.rect.h = h;
				return this;
			},
			copy: function (canvas) {
				this.ctx.drawImage(canvas, 0, 0);
				return this;
			},
			clear: function () {
				this.resize();
				// this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
				return this;
			},
			resize: function () {
				this.setSize(this.canvas.offsetWidth, this.canvas.offsetHeight);
				return this;
			},
			setText: function (font, align, verticalAlign, color) {
				font = font || '11px monospace';
				align = align || 'center';
				verticalAlign = verticalAlign || 'middle';
				color = color || this.colors.black;
				var ctx = this.ctx;
				ctx.font = font;
				ctx.textAlign = align;
				ctx.textBaseline = verticalAlign;
				ctx.fillStyle = color.toRgba();
				return this;
			},
			setFill: function (color) {
				color = color || this.colors.black;
				var ctx = this.ctx;
				/*
				var my_gradient = ctx.createLinearGradient(0, 0, 0, 170);
				my_gradient.addColorStop(0, "black");
				my_gradient.addColorStop(1, "white");
				ctx.fillStyle = my_gradient;
				*/
				ctx.fillStyle = color.toRgba();
				return this;
			},
			setStroke: function (color, size) {
				color = color || this.colors.black;
				var ctx = this.ctx;
				size = size || 1;
				/*
				var gradient=ctx.createLinearGradient(0,0,170,0);
				gradient.addColorStop("0","magenta");
				gradient.addColorStop("0.5","blue");
				gradient.addColorStop("1.0","red");
				ctx.strokeStyle = gradient;
				*/
				// Fill with gradient
				ctx.strokeStyle = color.toRgba();
				ctx.lineWidth = size;
				return this;
			},
			/*
			drawRoundRect: function (rect, r) {
			    rect = rect || this.rect;
			    Shape.roundRect(this, rect, r);
			    return this;
			},
			*/
			fillText: function (text, point, width, post, maxLength) {
				if (width) {
					post = post || '';
					maxLength = maxLength || Math.floor(width / 8);
					if (text.length > maxLength) {
						text = text.substr(0, Math.min(text.length, maxLength)).trim() + post;
					}
				}
				this.ctx.fillText(text, point.x, point.y);
				return this;
			},
			fillRect: function (rect) {
				rect = rect || this.rect;
				var ctx = this.ctx,
					x = rect.x,
					y = rect.y,
					w = rect.w,
					h = rect.h;
				ctx.fillRect(x, y, w, h);
				return this;
			},
			strokeRect: function (rect) {
				rect = rect || this.rect;
				var ctx = this.ctx,
					x = rect.x,
					y = rect.y,
					w = rect.w,
					h = rect.h;
				ctx.strokeRect(x, y, w, h);
				return this;
			},
			fill: function () {
				this.ctx.fill();
				return this;
			},
			stroke: function () {
				this.ctx.stroke();
				return this;
			},
			begin: function () {
				this.ctx.beginPath();
				return this;
			},
			close: function () {
				this.ctx.closePath();
				return this;
			},
			save: function () {
				this.ctx.save();
				return this;
			},
			restore: function () {
				this.ctx.restore();
				return this;
			},
			rotate: function (angle) {
				this.ctx.rotate(angle * Math.PI / 180);
			},
			translate: function (xy) {
				this.ctx.translate(xy.x, xy.y);
			},
			toDataURL: function () {
				return this.canvas.toDataURL();
			},
			draw: function (image, t, pre) {
				if (image) {
					t.w = t.w || image.width;
					t.h = t.h || image.height;
					var ctx = this.ctx,
						rect = this.drawingRect,
						x = rect.x = t.x - t.w / 2,
						y = rect.y = t.y - t.h / 2,
						w = rect.w = t.w,
						h = rect.h = t.h;
					ctx.save();
					ctx.translate(x, y);
					if (pre) {
						pre.call(this);
					}
					ctx.drawImage(image, 0, 0);
					ctx.restore();
					// console.log('painter.draw', x, y, w, h);
				}
				return this;
			},
			drawRect: function (image, s, t, pre) {
				if (image) {
					s.w = s.w || image.width;
					s.h = s.h || image.height;
					t.w = t.w || image.width;
					t.h = t.h || image.height;
					var ctx = this.ctx,
						rect = this.drawingRect,
						x = rect.x = t.x - s.w / 2,
						y = rect.y = t.y - s.h / 2,
						w = rect.w = t.w,
						h = rect.h = t.h;
					ctx.save();
					ctx.translate(x, y);
					if (pre) {
						pre.call(this);
					}
					ctx.drawImage(image, s.x, s.y, s.w, s.h, 0, 0, t.w, t.h);
					ctx.restore();
					// console.log('painter.drawRect', x, y, w, h);
				}
				return this;
			},
			flip: function (scale) {
				scale = scale || {
					x: 1,
					y: -1
				};
				var ctx = this.ctx,
					rect = this.drawingRect;
				ctx.translate(scale.x === -1 ? rect.w : 0, scale.y === -1 ? rect.h : 0);
				ctx.scale(scale.x, scale.y);
			},
		};
		return Painter;
    }]);

}());

/* global angular */

(function () {
	"use strict";

	var app = angular.module('artisan');

	app.directive('expandable', ['$parse', 'State', 'Dom', function ($parse, State, Dom) {

		var directive = {
			restrict: 'A',
			// template: '<div ng-transclude></div>',
			// transclude: true,
			// replace: true,
			/*
			templateUrl: function (element, attributes) {
				return attributes.template || 'artisan/components/nav/partial/nav';
            },
            */
			link: ExpandableLink,
		};

		return directive;

		function ExpandableLink(scope, element, attributes, model) {

			var state = new State();
			state.pow = 0;

			var relative, absolute;

			var target, targetElement;

			var from, to, current,
				boundingClientRect, styleObj, originalCssText;

			var expanded = false;

			var placeholder = document.createElement('div'),
				placeholderElement = angular.element(placeholder);
			placeholderElement.addClass('expandable-placeholder');

			function getStyle(node) {
				var style = window.getComputedStyle(node, null);
				var styleObj = {
					'display': style.getPropertyValue('display'),
					'position': style.getPropertyValue('position'),
					'width': style.getPropertyValue('width'),
					'height': style.getPropertyValue('height'),
					'top': style.getPropertyValue('top'),
					'right': style.getPropertyValue('right'),
					'bottom': style.getPropertyValue('bottom'),
					'left': style.getPropertyValue('left'),
					'margin-top': style.getPropertyValue('margin-top'),
					'margin-right': style.getPropertyValue('margin-right'),
					'margin-bottom': style.getPropertyValue('margin-bottom'),
					'margin-left': style.getPropertyValue('margin-left'),
					'padding-top': style.getPropertyValue('padding-top'),
					'padding-right': style.getPropertyValue('padding-right'),
					'padding-bottom': style.getPropertyValue('padding-bottom'),
					'padding-left': style.getPropertyValue('padding-left'),
					'background-color': style.getPropertyValue('background-color'),
				};
				return styleObj;
			}

			function getTextStyle(style) {
				var text = '';
				angular.forEach(style, function (value, key) {
					text += key + ': ' + value + '; ';
				});
				return text;
			}

			function setStyle(node, style) {
				node.style.cssText = getTextStyle(style);
			}

			function add() {
				styleObj = getStyle(target);
				setStyle(placeholder, styleObj);
				target.parentNode.insertBefore(placeholder, target);
				originalCssText = target.style.cssText;
				targetElement.addClass('expandable-expanding');
				Dom.getParents(target).each(function (element, node) {
					element.addClass('expandable-parent');
				});
			}

			function remove() {
				target.style.cssText = originalCssText;
				targetElement.removeClass('expandable-expanding');
				placeholder.parentNode.removeChild(placeholder);
				Dom.getParents(target).each(function (element, node) {
					element.removeClass('expandable-parent');
				});
			}

			function setRects() {
				if (targetElement && targetElement.hasClass('expandable-expanding')) {
					boundingClientRect = placeholder.getBoundingClientRect();
				} else {
					boundingClientRect = target.getBoundingClientRect();
				}
				from = {
					top: 0,
					left: 0,
					width: boundingClientRect.width, // parseInt(styleObj.width), // boundingClientRect.width,
					height: boundingClientRect.height, // parseInt(styleObj.height), // boundingClientRect.height,
				};
				to = {
					top: 0 + (relative.top || 0),
					left: 0 + (relative.left || 0),
					width: from.width + (relative.right || 0),
					height: from.height + (relative.bottom || 0),
				};
				if (absolute.top) {
					to.top = absolute.top - boundingClientRect.top;
				}
				if (absolute.left) {
					to.left = absolute.left - boundingClientRect.left;
				}
				if (absolute.right) {
					var absoluteRight = (window.innerWidth - absolute.right);
					var absoluteLeft = boundingClientRect.left + to.left;
					to.width = absoluteRight - absoluteLeft;
				}
				if (absolute.bottom) {
					var absoluteBottom = (window.innerHeight - absolute.bottom);
					var absoluteTop = boundingClientRect.top + to.top;
					to.height = absoluteBottom - absoluteTop;
				}
			}

			function expand() {
				if (!expanded) {
					setRects();
					add();
					current = angular.copy(from);
					setStyle(target, from);
					dynamics.animate(state, {
						pow: 1
					}, {
						type: dynamics.easeInOut,
						duration: 350,
						complete: function () {
							expanded = true;
							state.idle();
						},
						change: function () {
							update();
						}
					});
				} else {
					state.idle();
				}
			}

			function contract() {
				if (expanded) {
					dynamics.animate(state, {
						pow: 0
					}, {
						type: dynamics.easeInOut,
						duration: 350,
						complete: function () {
							expanded = false;
							remove();
							state.idle();
						},
						change: function () {
							update();
						}
					});
				} else {
					state.idle();
				}
			}

			function update() {
				current.left = (from.left + (to.left - from.left) * state.pow) + 'px';
				current.top = (from.top + (to.top - from.top) * state.pow) + 'px';
				current.width = (from.width + (to.width - from.width) * state.pow) + 'px';
				current.height = (from.height + (to.height - from.height) * state.pow) + 'px';
				setStyle(target, current);
			}

			function toggle() {
				if (state.busy()) {
					if (expanded) {
						contract();
					} else {
						expand();
					}
				}
			}

			function set() {
				relative = attributes.expandableRelative ? $parse(attributes.expandableRelative)(scope) : {};
				absolute = attributes.expandableAbsolute ? $parse(attributes.expandableAbsolute)(scope) : {};
				target = element[0].querySelector(attributes.expandable);
				if (target) {
					targetElement = angular.element(target);
				}
			}

			function onDown(e) {
				set();
				if (target) {
					expand();
				}
			}

			function onUp(e) {
				if (Dom.getClosestNode(e.target, element[0])) {
					// nope
				} else {
					set();
					if (target) {
						contract();
					}
				}
			}

			function onResize(e) {
				if (expanded || state.isBusy) {
					setRects();
					update();
				}
			}

			function onKeyDown(e) {
				var key = e.key.toLowerCase();
				switch (key) {
					case 'escape':
						set();
						if (target) {
							contract();
						}
						break;
					case 'enter':
						set();
						if (target && target.tagName && target.tagName.toLowerCase() === 'input') {
							contract();
						}
						break;
				}
			}

			function addListeners() {
				element
					.on('mousedown touchstart', onDown)
					.on('keydown', onKeyDown);
				angular.element(window)
					.on('click', onUp)
					.on('resize', onResize);
			}

			function removeListeners() {
				element
					.off('mousedown touchstart', onDown)
					.off('keydown', onKeyDown);
				angular.element(window)
					.off('click', onUp)
					.off('resize', onResize);
			}

			scope.$on('$destroy', function () {
				removeListeners();
			});

			addListeners();

		}

    }]);

}());
/* global angular */

(function () {
	"use strict";

	var app = angular.module('artisan');

	app.directive('controlMessages', [function () {
		return {
			restrict: 'E',
			templateUrl: 'artisan/components/forms/partial/messages',
			transclude: {
				'message': '?messageItems',
			},
			link: function (scope, element, attributes, model) {}
		};
    }]);

	app.directive('control', ['$parse', function ($parse) {
		function formatLabel(string, prepend, expression) {
			string = string || '';
			prepend = prepend || '';
			var splitted = string.split(',');
			if (splitted.length > 1) {
				var formatted = splitted.shift();
				angular.forEach(splitted, function (value, index) {
					if (expression) {
						formatted = formatted.split('{' + index + '}').join('\' + ' + prepend + value + ' + \'');
					} else {
						formatted = formatted.split('{' + index + '}').join(prepend + value);
					}
				});
				if (expression) {
					return '\'' + formatted + '\'';
				} else {
					return formatted;
				}
			} else {
				return prepend + string;
			}
		}
		var uniqueId = 0;
		return {
			restrict: 'A',
			templateUrl: function (element, attributes) {
				var template = 'artisan/components/forms/partial/text';
				switch (attributes.control) {
					case 'select':
						template = 'artisan/components/forms/partial/select';
						break;
				}
				return template;
			},
			scope: {
				ngModel: '=',
				required: '=',
				form: '@',
				title: '@',
				placeholder: '@',
				source: '=?',
				key: '@?',
				label: '@?',
			},
			require: 'ngModel',
			transclude: true,
			link: {
				pre: function preLink(scope, element, attributes, controller, transclude) {
					var label = scope.label = (scope.label ? scope.label : 'name');
					var key = scope.key = (scope.key ? scope.key : 'id');
					if (attributes.control === 'select') {
						var filter = (attributes.filter ? '| ' + attributes.filter : '');
						var optionLabel = formatLabel(label, 'item.', true);
						scope.getOptions = function () {
							return attributes.number ?
								'item.' + key + ' as ' + optionLabel + ' disable when item.disabled for item in source ' + filter :
								optionLabel + ' disable when item.disabled for item in source ' + filter + ' track by item.' + key;
						};
					}
					var type = scope.type = attributes.control;
					var form = scope.form = scope.form || 'form';
					var title = scope.title = scope.title || 'untitled';
					var placeholder = scope.placeholder = scope.placeholder || title;
					var field = scope.field = title.replace(/[^0-9a-zA-Z]/g, "").split(' ').join('') + (++uniqueId);
					scope.format = attributes.format || null;
					scope.precision = attributes.precision || null;
					scope.validate = attributes.validate || attributes.control;
					scope.minLength = attributes.minLength || 0;
					scope.maxLength = attributes.maxLength || Number.POSITIVE_INFINITY;
					scope.min = attributes.min || null;
					scope.max = attributes.max || null;
					scope.options = $parse(attributes.options)(scope) || {};
					scope.focus = false;
					scope.visible = false;
					scope.onChange = function (model) {
						$parse(attributes.onChange)(scope.$parent);
					};
					scope.onFilter = function (model) {
						$parse(attributes.onFilter)(scope.$parent);
					};
					scope.getType = function () {
						var type = 'text';
						switch (attributes.control) {
							case 'password':
								type = scope.visible ? 'text' : 'password';
								break;
							default:
								type = attributes.control;
						}
						return type;
					};
					scope.getClasses = function () {
						var form = $parse(scope.form)(scope.$parent);
						var field = $parse(scope.form + '.' + scope.field)(scope.$parent);
						return {
							'control-focus': scope.focus,
							'control-success': field.$valid,
							'control-error': field.$invalid && (form.$submitted || field.$touched),
							'control-empty': !field.$viewValue
						};
					};
					scope.getMessages = function () {
						var form = $parse(scope.form)(scope.$parent);
						var field = $parse(scope.form + '.' + scope.field)(scope.$parent);
						return (form.$submitted || field.$touched) && field.$error;
					};
					scope.toggleVisibility = function () {
						scope.visible = !scope.visible;
					};
				},
			},
		};
    }]);

	app.directive('_control', ['$http', '$templateCache', '$compile', '$parse', function ($http, $templateCache, $compile, $parse) {
		function formatLabel(string, prepend, expression) {
			string = string || '';
			prepend = prepend || '';
			var splitted = string.split(',');
			if (splitted.length > 1) {
				var formatted = splitted.shift();
				angular.forEach(splitted, function (value, index) {
					if (expression) {
						formatted = formatted.split('{' + index + '}').join('\' + ' + prepend + value + ' + \'');
					} else {
						formatted = formatted.split('{' + index + '}').join(prepend + value);
					}
				});
				if (expression) {
					return '\'' + formatted + '\'';
				} else {
					return formatted;
				}
			} else {
				return prepend + string;
			}
		}
		var uniqueId = 0;
		return {
			restrict: 'A',
			templateUrl: function (element, attributes) {
				var template = 'artisan/components/forms/partial/text';
				switch (attributes.control) {
					case 'select':
						template = 'artisan/components/forms/partial/select';
						break;
				}
				return template;
			},
			scope: {
				ngModel: '=',
				required: '=',
				form: '@',
				title: '@',
				placeholder: '@',
			},
			require: 'ngModel',
			/*
			link: function(scope, element, attributes, model) {
			},
			*/
			compile: function (element, attributes) {
				return {
					pre: function (scope, element, attributes) {
						if (attributes.control === 'select') {
							var label = (attributes.label ? attributes.label : 'name');
							var key = (attributes.key ? attributes.key : 'id');
							var filter = (attributes.min ? ' | filter:gte(\'' + key + '\', ' + attributes.min + ')' : '');
							var optionLabel = formatLabel(label, 'item.', true);
							scope.options = attributes.number ?
								'item.' + key + ' as ' + optionLabel + ' disable when item.disabled for item in ' + attributes.source + filter :
								optionLabel + ' disable when item.disabled for item in ' + attributes.source + filter + ' track by item.' + key;
							console.log('control.compile.pre', scope.options);
						}
						var type = scope.type = attributes.control;
						var form = scope.form = scope.form || 'form';
						var title = scope.title = scope.title || 'untitled';
						var placeholder = scope.placeholder = scope.placeholder || title;
						var field = scope.field = title.replace(/[^0-9a-zA-Z]/g, "").split(' ').join('') + (++uniqueId);
						scope.validate = attributes.validate || attributes.control;
						scope.format = attributes.format || null;
						scope.precision = attributes.precision || null;
						scope.validate = attributes.validate || attributes.control;
						scope.minLength = attributes.min || 0;
						scope.maxLength = attributes.max || Number.POSITIVE_INFINITY;
						scope.options = $parse(attributes.options)(scope) || {};
						scope.focus = false;
						scope.visible = false;
						scope.getType = function () {
							var type = 'text';
							switch (attributes.control) {
								case 'password':
									// var form = $parse(scope.form)(scope.$parent);
									// var field = $parse(scope.form + '.' + scope.field)(scope.$parent);
									type = scope.visible ? 'text' : 'password';
									break;
								default:
									type = attributes.control;
							}
							// console.log('control.getType', type);
							return type;
						};
						scope.getClasses = function () {
							var form = $parse(scope.form)(scope.$parent);
							var field = $parse(scope.form + '.' + scope.field)(scope.$parent);
							return {
								'control-focus': scope.focus,
								'control-success': field.$valid,
								'control-error': field.$invalid && (form.$submitted || field.$touched),
								'control-empty': !field.$viewValue
							};
						};
						scope.getMessages = function () {
							var form = $parse(scope.form)(scope.$parent);
							var field = $parse(scope.form + '.' + scope.field)(scope.$parent);
							return (form.$submitted || field.$touched) && field.$error;
						};
					},
					// post: function (scope, element, attributes) { }
				};
			}
			/*
			compile: function(element, attributes) {
			    element.removeAttr('my-dir'); 
			    element.attr('ng-hide', 'true');
			    return function(scope) {
			        $compile(element)(scope);
			    };
			},
			*/
		};
    }]);

	app.directive('numberPicker', ['$parse', '$timeout', function ($parse, $timeout) {
		return {
			restrict: 'A',
			template: '<div class="input-group">' +
				'   <span class="input-group-btn"><button class="btn btn-outline-primary" type="button">-</button></span>' +
				'   <div ng-transclude></div>' +
				'   <span class="input-group-btn"><button class="btn btn-outline-primary" type="button">+</button></span>' +
				'</div>',
			replace: true,
			transclude: true,
			link: function (scope, element, attributes, model) {
				var node = element[0];
				var nodeRemove = node.querySelectorAll('.input-group-btn > .btn')[0];
				var nodeAdd = node.querySelectorAll('.input-group-btn > .btn')[1];

				function onRemove(e) {
					var min = $parse(attributes.min)(scope);
					var getter = $parse(attributes.numberPicker);
					var setter = getter.assign;
					$timeout(function () {
						setter(scope, Math.max(min, getter(scope) - 1));
					});
					// console.log('numberPicker.onRemove', min);
				}

				function onAdd(e) {
					var max = $parse(attributes.max)(scope);
					var getter = $parse(attributes.numberPicker);
					var setter = getter.assign;
					$timeout(function () {
						setter(scope, Math.min(max, getter(scope) + 1));
					});
					// console.log('numberPicker.onAdd', max);
				}

				function addListeners() {
					angular.element(nodeRemove).on('touchstart mousedown', onRemove);
					angular.element(nodeAdd).on('touchstart mousedown', onAdd);
				}

				function removeListeners() {
					angular.element(nodeRemove).off('touchstart mousedown', onRemove);
					angular.element(nodeAdd).off('touchstart mousedown', onAdd);
				}
				scope.$on('$destroy', function () {
					removeListeners();
				});
				addListeners();
			}
		};
    }]);

}());
/* global angular */

(function() {
    "use strict";

    var app = angular.module('artisan');

    app.directive('validate', ['$filter', function($filter) {
        return {
            require: 'ngModel',
            link: function(scope, element, attributes, model) {
                var type = attributes.validate;
                var format = attributes.format || '';
                var precision = attributes.precision || 2;
                var focus = false;
                // console.log('validate', type);
                switch (type) {
                    case 'date':
                    case 'datetime':
                    case 'datetime-local':
                        model.$formatters.push(function(value) {
                            if (value) {
                                return $filter('date')(value, format);
                            } else {
                                return null;
                            }
                        });
                        break;
                    case 'number':
                        model.$parsers.unshift(function(value) {
                            var valid = false;
                            if (value !== undefined && value !== "") {
                                valid = String(value).indexOf(Number(value).toString()) !== -1; // isFinite(value); // 
                                value = Number(value);
                                model.$setValidity('number', valid);
                                if (valid) {
                                    model.$setValidity('positive', value >= 0.01);
                                    if (attributes.min !== undefined) {
                                        model.$setValidity('range', value >= Number(attributes.min));
                                    }
                                    if (attributes.max !== undefined) {
                                        model.$setValidity('range', value <= Number(attributes.max));
                                    }
                                }
                            } else {
                                valid = true;
                                value = Number(value);
                                model.$setValidity('number', true);
                                model.$setValidity('positive', true);
                                if (attributes.min !== undefined) {
                                    model.$setValidity('range', true);
                                }
                                if (attributes.max !== undefined) {
                                    model.$setValidity('range', true);
                                }
                            }
                            return value;
                        });
                        model.$formatters.push(function(value) {
                            if (value) {
                                return $filter('number')(value, precision) + ' ' + format;
                            } else {
                                return null;
                            }
                        });
                        break;
                    case 'anynumber':
                        model.$parsers.unshift(function(value) {
                            var valid = false;
                            if (value !== undefined && value !== "") {
                                valid = String(value).indexOf(Number(value).toString()) !== -1; // isFinite(value); // 
                                value = Number(value);
                                model.$setValidity('number', valid);
                                if (valid) {
                                    if (attributes.min !== undefined) {
                                        model.$setValidity('range', value >= Number(attributes.min));
                                    }
                                    if (attributes.max !== undefined) {
                                        model.$setValidity('range', value <= Number(attributes.max));
                                    }
                                }
                            } else {
                                valid = true;
                                value = Number(value);
                                model.$setValidity('number', true);
                                if (attributes.min !== undefined) {
                                    model.$setValidity('range', true);
                                }
                                if (attributes.max !== undefined) {
                                    model.$setValidity('range', true);
                                }
                            }
                            return value;
                        });
                        model.$formatters.push(function(value) {
                            if (value || value === 0) {
                                return $filter('number')(value, precision) + ' ' + format;
                            } else {
                                return null;
                            }
                        });
                        break;
                }

                function onFocus() {
                    focus = true;
                    if (format) {
                        element[0].value = model.$modelValue || null;
                        if (!model.$modelValue) {
                            model.$setViewValue(null);
                        }
                    }
                }

                function doBlur() {
                    if (format && !model.$invalid) {
                        switch (type) {
                            case 'date':
                            case 'datetime':
                            case 'datetime-local':
                                element[0].value = model.$modelValue ? $filter('date')(model.$modelValue, format) : ' ';
                                break;
                            default:
                                element[0].value = model.$modelValue ? $filter('number')(model.$modelValue, precision) + ' ' + format : ' ';
                                break;
                        }
                    }
                }

                function onBlur() {
                    focus = false;
                    doBlur();
                }

                function addListeners() {
                    element.on('focus', onFocus);
                    element.on('blur', onBlur);
                }

                function removeListeners() {
                    element.off('focus', onFocus);
                    element.off('blur', onBlur);
                }
                scope.$on('$destroy', function() {
                    removeListeners();
                });
                addListeners();
            }
        };
    }]);

}());
/* global angular */
(function () {
	"use strict";

	var app = angular.module('artisan');

	// micro interactions

	function tap(Events) {
		return {
			restrict: 'A',
			priority: 0,
			link: link
		};

		function link(scope, element, attributes, model) {
			if (attributes.ngBind) {
				return;
			}
			/*
			if (attributes.href === '#' && !attributes.ngHref && !attributes.ngClick) {
				return;
            }
            */

			element.addClass('interaction-tap');
			var node = document.createElement('interaction');
			element[0].appendChild(node);

			function onDown(e) {
				element.removeClass('interaction-animate');
				void element.offsetWidth;
				// node.style.animationPlayState = "paused";
				node.style.left = e.relative.x + 'px';
				node.style.top = e.relative.y + 'px';
				setTimeout(function () {
					element.addClass('interaction-animate');
					setTimeout(function () {
						element.removeClass('interaction-animate');
					}, 1000);
				}, 10);

				// console.log('tap.onDown', node, node.parentElement);
			}
			var listeners = { // down, move, up, click
				down: onDown,
			};
			var events = new Events(element).add(listeners, scope); // passing scope to add remove listeners automatically on $destroy
		}
	}
	app.directive('ngHref', ['Events', tap]);
	app.directive('ngClick', ['Events', tap]);

}());
/* global angular */

(function () {
	"use strict";

	var app = angular.module('artisan');

	app.directive('modalView', ['$parse', '$templateRequest', '$compile', '$controller', 'Dom', function ($parse, $templateRequest, $compile, $controller, Dom) {

		function compileController(scope, element, html, data) {
			// console.log('modalView.compileController', element);
			element.html(html);
			var link = $compile(element.contents());
			if (data.controller) {
				var $scope = scope.$new();
				angular.extend($scope, data);
				var controller = $controller(data.controller, {
					$scope: $scope
				});
				if (data.controllerAs) {
					scope[data.controllerAs] = controller;
				}
				element.data('$ngControllerController', controller);
				element.children().data('$ngControllerController', controller);
				scope = $scope;
			}
			link(scope);
		}

		return {
			restrict: 'A',
			priority: -400,
			link: function (scope, element, attributes, model) {
				var modal = $parse(attributes.modalView);
				modal = modal(scope);
				modal.templateUrl = modal.templateUrl || 'artisan/components/modals/partial/modal';
				$templateRequest(modal.templateUrl).then(function (html) {
					compileController(scope, element, html, modal);
				});
				/*
				// window.scrollTo(0, element[0].offsetTop - 100);
				function onClick(e) {
				    var closest = Dom.getClosestNode(e.target, element[0]);
				    if (closest === null) {
				        modal.reject(null);
				    }
				    // console.log('onClick', closest);
				}
				function addListeners() {
				    angular.element(window).on('click', onClick);
				}
				function removeListeners() {
				    angular.element(window).off('click', onClick);
				}
				scope.$on('destroy', function () {
				    removeListeners();
				});
				setTimeout(function () {
				    addListeners();
				}, 500);
				*/
			}
		};
    }]);

}());
/* global angular */

(function () {
	"use strict";

	var app = angular.module('artisan');

	app.provider('$modal', [function $modalProvider() {

		var modals = [];
		var routes = {};

		this.modals = modals;
		this.routes = routes;
		this.when = when;

		function when(path, modal) {
			routes[path] = modal;
			return this;
		}

		this.$get = ['$q', '$timeout', function modalFactory($q, $timeout) {

			function popModal(modal) {
				// console.log('modalProvider.popModal', modal);                
				var index = -1;
				angular.forEach(modals, function (m, i) {
					if (m === modal) {
						index = i;
					}
				});
				if (index !== -1) {
					$timeout(function () {
						modal.active = false;
						modals.splice(index, 1);
						if (modals.length) {
							modals[modals.length - 1].active = true;
						}
					});
				}
			}

			function closeModal(modal) {
				// console.log('modalProvider.closeModal', modal);                
				var index = -1;
				angular.forEach(modals, function (m, i) {
					if (m === modal) {
						index = i;
					}
				});
				if (index !== -1) {
					modal.active = false;
					$timeout(function () {
						while (modals.length) {
							modals.splice(modals.length - 1, 1);
						}
					}, 500);
				}
			}

			function addModal(path, params) {
				// console.log('modalProvider.addModal', path, params);
				var deferred = $q.defer();
				params = params || null;
				var modal = {
					title: 'Untitled',
					controller: null,
					templateUrl: null,
					params: params,
				};
				var current = routes[path];
				if (current) {
					angular.extend(modal, current);
				}
				modal.deferred = deferred;
				modal.back = function (data) {
					popModal(this);
					modal.deferred.resolve(data, modal);
				}
				modal.resolve = function (data) {
					closeModal(this);
					modal.deferred.resolve(data, modal);
				}
				modal.reject = function () {
					closeModal(this);
					modal.deferred.reject(modal);
				}
				modals.push(modal);
				angular.forEach(modals, function (m, i) {
					m.active = false;
				});
				if (modals.length) {
					modal.active = true;
				} else {
					$timeout(function () {
						modal.active = true;
						// window.scrollTo(0, 0);
					}, 500);
				}
				return deferred.promise;
			}

			return {
				modals: modals,
				addModal: addModal,
			};
        }];

    }]);

}());
/* global angular */

(function () {
	"use strict";

	var app = angular.module('artisan');

	app.directive('nav', ['$parse', 'Nav', function ($parse, Nav) {

		var directive = {
			restrict: 'A',
			templateUrl: function (element, attributes) {
				return attributes.template || 'artisan/components/nav/partial/nav';
			},
			scope: {
				items: '=nav',
			},
			link: NavLink,
		};

		return directive;

		function NavLink(scope, element, attributes, model) {
			scope.$watch('items', function (value) {
				// console.log(value instanceof Nav, value);
				if (value) {
					if (angular.isArray(value)) {
						var onPath = $parse(attributes.onPath)(scope.$parent);
						var onNav = $parse(attributes.onNav)(scope.$parent);
						var nav = new Nav({
							onPath: onPath,
							onNav: onNav
						});
						nav.setItems(value);
						scope.item = nav;

					} else if (value instanceof Nav) {
						scope.item = value;
					}
				}
			});
		}

    }]);

	app.directive('navItem', ['$timeout', 'Events', function ($timeout, Events) {

		var directive = {
			restrict: 'A',
			templateUrl: function (element, attributes) {
				return attributes.template || 'artisan/components/nav/partial/nav-item';
			},
			scope: {
				item: '=navItem',
			},
			link: NavItemLink,
		};

		return directive;

		function NavItemLink(scope, element, attributes, model) {
			var navItem = angular.element(element[0].querySelector('.nav-link'));

			var output;

			function itemOpen(item, immediate) {
				var state = item.$nav.state;
				state.active = true;
				$timeout(function () {
					state.immediate = immediate;
					state.closed = state.closing = false;
					state.opening = true;
					$timeout(function () {
						state.opening = false;
						state.opened = true;
					});
				});
			}

			function itemClose(item, immediate) {
				var state = item.$nav.state;
				state.active = false;
				$timeout(function () {
					state.immediate = immediate;
					state.opened = state.opening = false;
					state.closing = true;
					$timeout(function () {
						state.closing = false;
						state.closed = true;
					});
				});
				if (item.items) {
					angular.forEach(item.items, function (o) {
						itemClose(o, true);
					});
				}
			}

			function itemToggle(item) {
				// console.log('itemToggle', item);
				var state = item.$nav.state;
				state.active = item.items ? !state.active : true;
				if (state.active) {
					if (item.$nav.parent) {
						angular.forEach(item.$nav.parent.items, function (o) {
							if (o !== item) {
								itemClose(o, true);
							}
						});
					}
					itemOpen(item);
				} else {
					itemClose(item);
				}
				// console.log(state);
			}

			function onDown(e) {
				var item = scope.item;
				// console.log('Item.onDown', item);
				var state = item.$nav.state;
				if (state.active) {
					output = false;
					trigger();
				} else if (item.$nav.onNav) {
					var promise = item.$nav.onNav(item, item.$nav);
					if (promise && typeof promise.then === 'function') {
						promise.then(function (resolved) {
							// go on
							trigger();
						}, function (rejected) {
							// do nothing
						});
						output = false;
					} else {
						output = promise;
						trigger();
					}
				}

				function trigger() {
					$timeout(function () {
						itemToggle(item);
					});
				}
				// preventDefault(e);
			}

			function onClick(e) {
				// console.log('Item.onClick', e);
				return preventDefault(e);
			}

			function preventDefault(e) {
				if (output === false) {
					// console.log('Item.preventDefault', e);
					e.stop();
					// e.preventDefault();
					// e.stopPropagation();
					return false;
				}
			}
			var events = new Events(navItem).add({
				down: onDown,
				click: onClick,
			}, scope);
		}

    }]);

	app.directive('navTo', ['$parse', '$timeout', 'Events', function ($parse, $timeout, Events) {

		var directive = {
			restrict: 'A',
			link: NavToLink
		};

		return directive;

		function NavToLink(scope, element, attributes) {
			function onDown(e) {
				console.log('navTo.onDown', attributes.navTo);
				$timeout(function () {
					var callback = $parse(attributes.navTo);
					callback(scope);
				});
				e.preventDefault();
				return false;
			}
			var events = new Events(element).add({
				down: onDown,
			}, scope);
		}

    }]);

}());
/* global angular */

(function() {
    "use strict";

    var app = angular.module('artisan');

    app.factory('Nav', ['Silent', function(Silent) {

        function Nav(options) {
            var nav = this;
            var defaults = {
                items: [],
            }
            angular.extend(nav, defaults);
            if (options) {
                angular.extend(nav, options);
            }
            nav.setNav(nav, null);
        }

        var statics = {
            silent: NavSilent,
            path: NavPath,
        };

        var publics = {
            addItem: addItem,
            addItems: addItems,
            getPath: getPath,
            setItems: setItems,
            setNav: setNav,
            setNavs: setNavs,
        };

        angular.extend(Nav, statics);
        angular.extend(Nav.prototype, publics);

        return Nav;

        // static methods

        function NavSilent(path) {
            Silent.silent(path);
        }

        function NavPath(path) {
            Silent.path(path);
        }

        // prototype methods

        function setItems(items) {
            var nav = this;
            nav.path = Silent.path();
            nav.items = items;
            nav.setNavs(items, nav);
        }

        function setNavs(items, parent) {
            var nav = this;
            if (items) {
                angular.forEach(items, function(item) {
                    nav.setNav(item, parent);
                    nav.setNavs(item.items, item);
                });
            }
        }

        function setNav(item, parent) {
            var nav = this;
            var $nav = {
                parent: parent || null,
                level: parent ? parent.$nav.level + 1 : 0,
                state: {},
                addItems: function(x) {
                    nav.addItems(x, item);
                },
                onNav: nav.onNav,
            };
            item.$nav = $nav;
            $nav.path = nav.getPath(item);
            if ($nav.path === nav.path) {
                $nav.state.active = true;
                $nav.state.opened = true;
                while ($nav.parent) {
                    $nav = $nav.parent.$nav;
                    $nav.state.active = true;
                    $nav.state.opened = true;
                }
            }
        }

        function addItems(itemOrItems, parent) {
            var nav = this;
            if (angular.isArray(itemOrItems)) {
                angular.forEach(itemOrItems, function(item) {
                    nav.addItem(item, parent);
                });
            } else {
                nav.addItem(itemOrItems, parent);
            }
        }

        function addItem(item, parent) {
            var nav = this,
                onPath = nav.onPath,
                onNav = nav.onNav;
            nav.setNav(item, parent);
            if (parent) {
                parent.items = parent.items || [];
                parent.items.push(item);
            }
        }

        function getPath(item) {
            var path = null;
            if (this.onPath) {
                path = this.onPath(item, item.$nav);
            } else {
                path = item.path;
            }
            return path;
        }

    }]);

}());
/* global angular */

(function () {
	"use strict";

	var app = angular.module('artisan');

	app.directive('popuppable', ['$parse', 'State', 'Dom', function ($parse, State, Dom) {

		var directive = {
			restrict: 'A',
			// template: '<div ng-transclude></div>',
			// transclude: true,
			// replace: true,
			/*
			templateUrl: function (element, attributes) {
				return attributes.template || 'artisan/components/nav/partial/nav';
            },
            */
			link: ExpandableLink,
		};

		return directive;

		function ExpandableLink(scope, element, attributes, model) {

			var state = new State();
			state.pow = 0;

			var relative, absolute;

			var target, targetElement;

			var from, to, current,
				boundingClientRect, styleObj, originalCssText;

			var opened = false;

			/*
			var placeholder = document.createElement('div'),
				placeholderElement = angular.element(placeholder);
			placeholderElement.addClass('popuppable-placeholder');
			*/

			function getStyle(node) {
				var style = window.getComputedStyle(node, null);
				var styleObj = {
					'display': style.getPropertyValue('display'),
					'position': style.getPropertyValue('position'),
					'width': style.getPropertyValue('width'),
					'height': style.getPropertyValue('height'),
					'top': style.getPropertyValue('top'),
					'right': style.getPropertyValue('right'),
					'bottom': style.getPropertyValue('bottom'),
					'left': style.getPropertyValue('left'),
					'margin-top': style.getPropertyValue('margin-top'),
					'margin-right': style.getPropertyValue('margin-right'),
					'margin-bottom': style.getPropertyValue('margin-bottom'),
					'margin-left': style.getPropertyValue('margin-left'),
					'padding-top': style.getPropertyValue('padding-top'),
					'padding-right': style.getPropertyValue('padding-right'),
					'padding-bottom': style.getPropertyValue('padding-bottom'),
					'padding-left': style.getPropertyValue('padding-left'),
					'background-color': style.getPropertyValue('background-color'),
				};
				return styleObj;
			}

			function getTextStyle(style) {
				var text = '';
				angular.forEach(style, function (value, key) {
					text += key + ': ' + value + '; ';
				});
				return text;
			}

			function setStyle(node, style) {
				node.style.cssText = getTextStyle(style);
			}

			function add() {
				/*
				styleObj = getStyle(target);
				setStyle(placeholder, styleObj);
				target.parentNode.insertBefore(placeholder, target);
				originalCssText = target.style.cssText;
				*/
				targetElement.addClass('popuppable-opening');
				Dom.getParents(target).each(function (element, node) {
					element.addClass('popuppable-parent');
				});
			}

			function remove() {
				/*
				target.style.cssText = originalCssText;
				placeholder.parentNode.removeChild(placeholder);
				*/
				targetElement.removeClass('popuppable-opening');
				Dom.getParents(target).each(function (element, node) {
					element.removeClass('popuppable-parent');
				});
			}

			/*
			function setRects() {
				if (targetElement && targetElement.hasClass('popuppable-opening')) {
					boundingClientRect = placeholder.getBoundingClientRect();
				} else {
					boundingClientRect = target.getBoundingClientRect();
				}
				from = {
					top: 0,
					left: 0,
					width: boundingClientRect.width, // parseInt(styleObj.width), // boundingClientRect.width,
					height: boundingClientRect.height, // parseInt(styleObj.height), // boundingClientRect.height,
				};
				to = {
					top: 0 + (relative.top || 0),
					left: 0 + (relative.left || 0),
					width: from.width + (relative.right || 0),
					height: from.height + (relative.bottom || 0),
				};
				if (absolute.top) {
					to.top = absolute.top - boundingClientRect.top;
				}
				if (absolute.left) {
					to.left = absolute.left - boundingClientRect.left;
				}
				if (absolute.right) {
					var absoluteRight = (window.innerWidth - absolute.right);
					var absoluteLeft = boundingClientRect.left + to.left;
					to.width = absoluteRight - absoluteLeft;
				}
				if (absolute.bottom) {
					var absoluteBottom = (window.innerHeight - absolute.bottom);
					var absoluteTop = boundingClientRect.top + to.top;
					to.height = absoluteBottom - absoluteTop;
				}
			}
			*/

			function open() {
				if (!opened) {
					// setRects();
					add();
					current = angular.copy(from);
					// setStyle(target, from);
					openAnimation();
					/*
					dynamics.animate(state, {
						pow: 1
					}, {
						type: dynamics.easeInOut,
						duration: 350,
						complete: function () {
							opened = true;
							state.idle();
						},
						change: function () {
							update();
						}
					});
					*/
				} else {
					state.idle();
				}
			}

			function close() {
				if (opened) {
					closeAnimation();
					/*
					dynamics.animate(state, {
						pow: 0
					}, {
						type: dynamics.easeInOut,
						duration: 350,
						complete: function () {
							opened = false;
							remove();
							state.idle();
						},
						change: function () {
							update();
						}
					});
					*/
				} else {
					state.idle();
				}
			}

			function update() {
				/*
				current.left = (from.left + (to.left - from.left) * state.pow) + 'px';
				current.top = (from.top + (to.top - from.top) * state.pow) + 'px';
				current.width = (from.width + (to.width - from.width) * state.pow) + 'px';
				current.height = (from.height + (to.height - from.height) * state.pow) + 'px';
				setStyle(target, current);
				*/
				current.left = (from.left + (to.left - from.left) * state.pow) + 'px';
				current.top = (from.top + (to.top - from.top) * state.pow) + 'px';
				current.width = (from.width + (to.width - from.width) * state.pow) + 'px';
				current.height = (from.height + (to.height - from.height) * state.pow) + 'px';
				setStyle(target, current);
			}

			function toggle() {
				if (state.busy()) {
					if (opened) {
						close();
					} else {
						open();
					}
				}
			}

			function set() {
				/*
				relative = attributes.popuppableRelative ? $parse(attributes.popuppableRelative)(scope) : {};
				absolute = attributes.popuppableAbsolute ? $parse(attributes.popuppableAbsolute)(scope) : {};
				*/
				target = element[0].querySelector(attributes.popuppable);
				if (target) {
					targetElement = angular.element(target);
					targetElement.addClass('popuppable-target');
				}
			}

			function onDown(e) {
				set();
				if (target) {
					open();
				}
			}

			function onUp(e) {
				if (Dom.getClosestNode(e.target, element[0])) {
					// nope
				} else {
					set();
					if (target) {
						close();
					}
				}
			}

			function onResize(e) {
				if (opened || state.isBusy) {
					// setRects();
					update();
				}
			}

			function onKeyDown(e) {
				var key = e.key.toLowerCase();
				switch (key) {
					case 'escape':
						set();
						if (target) {
							close();
						}
						break;
					case 'enter':
						set();
						if (target && target.tagName && target.tagName.toLowerCase() === 'input') {
							close();
						}
						break;
				}
			}

			function addListeners() {
				var trigger = element[0].querySelector('.popuppable-trigger');
				var triggerElement = trigger ? angular.element(trigger) : element;
				triggerElement
					.on('mousedown touchstart', onDown)
					.on('keydown', onKeyDown);
				angular.element(window)
					.on('click', onUp)
					.on('resize', onResize);
			}

			function removeListeners() {
				var trigger = element[0].querySelector('.popuppable-trigger');
				var triggerElement = trigger ? angular.element(trigger) : element;
				triggerElement
					.off('mousedown touchstart', onDown)
					.off('keydown', onKeyDown);
				angular.element(window)
					.off('click', onUp)
					.off('resize', onResize);
			}

			scope.$on('$destroy', function () {
				removeListeners();
			});

			addListeners();

			set();

			function openAnimation() {
				// Animate the popover
				dynamics.animate(target, {
					opacity: 1,
					scale: 1
				}, {
					type: dynamics.spring,
					frequency: 200,
					friction: 270,
					duration: 800,
					complete: function () {
						opened = true;
						state.idle();
					},
				});

				/*
			  // Animate each line individually
			  for(var i=0; i<items.length; i++) {
				var item = items[i]
				// Define initial properties
				dynamics.css(item, {
				  opacity: 0,
				  translateY: 20
				});
			
				// Animate to final properties
				dynamics.animate(item, {
				  opacity: 1,
				  translateY: 0
				}, {
				  type: dynamics.spring,
				  frequency: 300,
				  friction: 435,
				  duration: 1000,
				  delay: 100 + i * 40
				});
			  }
			*/
			}

			function closeAnimation() {
				// Animate the popover
				dynamics.animate(target, {
					opacity: 0,
					scale: 0.1
				}, {
					type: dynamics.easeInOut,
					duration: 300,
					friction: 100,
					complete: function () {
						opened = false;
						remove();
						state.idle();
					},
				});
			}

		}

    }]);

}());
/* global angular */

(function () {
	"use strict";

	window.ondragstart = function () {
		return false;
	};

	var app = angular.module('artisan');

	app.directive('scrollableX', ['$parse', '$compile', '$timeout', 'Scrollable', 'Animate', 'Style', 'Events', 'Utils', function ($parse, $compile, $timeout, Scrollable, Animate, Style, Events, Utils) {
		return {
			restrict: 'A',
			template: '<div class="scrollable-content" ng-transclude></div>',
			transclude: true,
			link: function (scope, element, attributes, model) {

				var onLeft, onRight, showIndicatorFor, scrollableWhen;
				if (attributes.onLeft) {
					onLeft = $parse(attributes.onLeft);
				}
				if (attributes.onRight) {
					onRight = $parse(attributes.onRight);
				}
				if (attributes.showIndicatorFor) {
					showIndicatorFor = $parse(attributes.showIndicatorFor);
				}
				if (attributes.scrollableWhen) {
					scrollableWhen = $parse(attributes.scrollableWhen);
				}

				// ELEMENTS & STYLESHEETS;
				element.attr('unselectable', 'on').addClass('unselectable');
				var containerNode = element[0];
				var contentNode = containerNode.querySelector('.scrollable-content');
				var content = angular.element(content);
				var contentStyle = new Style();

				var animate = new Animate(render);

				var scrollable = attributes.scrollableX ? $parse(attributes.scrollableX)(scope) : new Scrollable();

				link(scrollable);

				function link(scrollable) {
					scrollable.link({
						getItems: function () {
							if (attributes.scrollableItem) {
								var items = containerNode.querySelectorAll(attributes.scrollableItem);
								return items;
							}
						},
						prev: function () {
							scrollable.scrollPrev();
							animate.play();
						},
						next: function () {
							scrollable.scrollNext();
							animate.play();
						},
						reset: function () {
							scrollable.doReset();
							animate.play();
						},
						onLeft: onLeft,
						onRight: onRight,
					});
				}

				/*
				scope.$watch(attributes.scrollableX, function (newValue) {
					console.log(newValue);
				});
				*/

				/*
				var indicator = null,
					indicatorNode = null,
					indicatorStyle;
				showIndicatorFor = false;
				if (showIndicatorFor) {
					indicator = angular.element('<div class="indicator"></div>');
					indicatorNode = indicator[0];
					indicatorStyle = new Style();
					element.append(indicator);
					$compile(indicator.contents())(scope);
					var i = scrollbar.getIndicator();
					indicatorStyle.transform('translate3d(' + i.x.toFixed(2) + 'px,' + i.y.toFixed(2) + 'px,0)');
					indicatorStyle.set(indicatorNode);
				}
				*/

				function render(time) {
					scrollable.setContainer(containerNode);
					scrollable.setContent(contentNode);
					scrollable.setEnabled(isEnabled());
					var animating = scrollable.renderX();
					if (!animating) {
						// animate.pause();
					}
					var current = scrollable.getCurrent();
					contentStyle.transform('translate3d(' + current.x.toFixed(2) + 'px,0,0)');
					contentStyle.set(contentNode);
					/*
					if (showIndicatorFor) {
						if (dragging || wheeling || speed) {
							var percent = c.x / (containerNode.offsetWidth - contentNode.offsetWidth);
							percent = Math.max(0, Math.min(1, percent));
							i.x = (containerNode.offsetWidth - indicatorNode.offsetWidth) * (percent);
							i.y += (0 - i.y) / 4;
							// var count = Math.round(contentNode.offsetWidth / 315);
							var index = Math.max(1, Math.round(percent * showIndicatorFor.rows.length));
							indicator.html(index + '/' + showIndicatorFor.count);
							// indicator.html((percent * 100).toFixed(2).toString());
						} else {
							i.y += (45 - i.y) / 4;
						}
						indicatorStyle.transform('translate3d(' + i.x.toFixed(2) + 'px,' + i.y.toFixed(2) + 'px,0)');
						indicatorStyle.set(indicatorNode);
					}
					*/
				}

				function undrag() {
					scrollable.off();
					dragOff();
				}

				function onDown(event) {
					if (scrollable.dragStart(event.absolute)) {
						dragOn();
						animate.play();
						event.stop();
					}
				}

				function onMove(event) {
					scrollable.dragMove(event.absolute);
					var drag = scrollable.getDrag();
					if (Math.abs(drag.y) > Math.abs(drag.x)) {
						onUp(event);
					} else {
						event.stop();
					}
				}

				function onUp(event) {
					scrollable.dragEnd(event.absolute);
					event.stop();
					dragOff();
				}

				function _onScrollX(dir, interval) {
					return scrollable.wheelX(dir, interval);
				}

				var onScrollX = _onScrollX;
				// var onScrollX = Utils.throttle(_onScrollX, 25);

				function onWheel(event) {
					// console.log('onWheelX', event.dir, scrollable.wheelXCheck(event.dir));
					if (scrollable.wheelXCheck(event.dir)) {
						onScrollX(event.dir, event.interval);
						animate.play();
						event.stop();
					}
				}

				function off() {
					dragOff();
					// animate.pause();
					scrollable.off();
				}

				function isEnabled() {
					var enabled = true;
					if (scrollableWhen) {
						enabled = enabled && scrollableWhen(scope);
					}
					enabled = enabled && window.innerWidth >= 1024;
					enabled = enabled && (containerNode.offsetWidth < contentNode.offsetWidth);
					return enabled;
				}

				function onResize() {
					var enabled = isEnabled();
					if (!enabled) {
						off();
					}
					render();
				}

				scope.$watch(function () {
					return contentNode.offsetWidth;
				}, function (newValue, oldValue) {
					onResize();
				});

				var events = new Events(element).add({
					down: onDown,
					wheel: onWheel,
				}, scope);

				var windowEvents = new Events(window).add({
					resize: onResize,
				}, scope);

				function dragOn() {
					windowEvents.add({
						move: onMove,
						up: onUp,
					}, scope);
				}

				function dragOff() {
					windowEvents.remove({
						move: onMove,
						up: onUp,
					});
				}

				scope.$on('$destroy', function () {
					animate.pause();
				});

			},
		};
    }]);

	app.directive('scrollableY', ['$parse', '$compile', '$timeout', 'Scrollable', 'Animate', 'Style', 'Events', 'Utils', function ($parse, $compile, $timeout, Scrollable, Animate, Style, Events, Utils) {
		return {
			restrict: 'A',
			template: '<div class="scrollable-content" ng-transclude></div>',
			transclude: true,
			link: function (scope, element, attributes, model) {

				var onTop, onBottom, showIndicatorFor, scrollableWhen;
				if (attributes.onTop) {
					onTop = $parse(attributes.onTop);
				}
				if (attributes.onBottom) {
					onBottom = $parse(attributes.onBottom);
				}
				if (attributes.showIndicatorFor) {
					showIndicatorFor = $parse(attributes.showIndicatorFor);
				}
				if (attributes.scrollableWhen) {
					scrollableWhen = $parse(attributes.scrollableWhen);
				}

				// ELEMENTS & STYLESHEETS;
				element.attr('unselectable', 'on').addClass('unselectable');
				var containerNode = element[0];
				var contentNode = containerNode.querySelector('.scrollable-content');
				var content = angular.element(content);
				var contentStyle = new Style();

				var animate = new Animate(render);

				var scrollable = attributes.scrollableY ? $parse(attributes.scrollableY)(scope) : new Scrollable();
				link(scrollable);

				function link(scrollable) {
					scrollable.link({
						getItems: function () {
							if (attributes.scrollableItem) {
								var items = containerNode.querySelectorAll(attributes.scrollableItem);
								return items;
							}
						},
						prev: function () {
							scrollable.scrollPrev();
							animate.play();
						},
						next: function () {
							scrollable.scrollNext();
							animate.play();
						},
						reset: function () {
							scrollable.doReset();
							animate.play();
						},
						onTop: onTop,
						onBottom: onBottom,
					});
				}

				function render(time) {
					scrollable.setContainer(containerNode);
					scrollable.setContent(contentNode);
					scrollable.setEnabled(isEnabled());
					var animating = scrollable.renderY();
					if (!animating) {
						// animate.pause();
					}
					var current = scrollable.getCurrent();
					contentStyle.transform('translate3d(0,' + current.y.toFixed(2) + 'px,0)');
					contentStyle.set(contentNode);
				}

				function undrag() {
					scrollable.off();
					dragOff();
				}

				function onDown(event) {
					if (scrollable.dragStart(event.absolute)) {
						dragOn();
						animate.play();
						event.stop();
					}
				}

				function onMove(event) {
					scrollable.dragMove(event.absolute);
					var drag = scrollable.getDrag();
					if (Math.abs(drag.x) > Math.abs(drag.y)) {
						onUp(event);
					} else {
						event.stop();
					}
				}

				function onUp(event) {
					scrollable.dragEnd(event.absolute);
					event.stop();
					dragOff();
				}

				function _onScrollY(dir, interval) {
					return scrollable.wheelY(dir, interval);
				}

				var onScrollY = _onScrollY;
				// var onScrollY = Utils.throttle(_onScrollY, 25);

				function onWheel(event) {
					// console.log('onWheelY', event.dir, scrollable.wheelYCheck(event.dir));
					if (scrollable.wheelYCheck(event.dir)) {
						onScrollY(event.dir, event.interval);
						animate.play();
						event.stop();
					}
				}

				function off() {
					dragOff();
					// animate.pause();
					scrollable.off();
				}

				function isEnabled() {
					var enabled = true;
					if (scrollableWhen) {
						enabled = enabled && scrollableWhen(scope);
					}
					enabled = enabled && window.innerWidth >= 1024;
					enabled = enabled && (containerNode.offsetHeight < contentNode.offsetHeight);
					return enabled;
				}

				function onResize() {
					var enabled = isEnabled();
					if (!enabled) {
						off();
					}
					render();
				}

				scope.$watch(function () {
					return contentNode.offsetHeight;
				}, function (newValue, oldValue) {
					onResize();
				});

				var events = new Events(element).add({
					down: onDown,
					wheel: onWheel,
				}, scope);

				var windowEvents = new Events(window).add({
					resize: onResize,
				}, scope);

				function dragOn() {
					windowEvents.add({
						move: onMove,
						up: onUp,
					}, scope);
				}

				function dragOff() {
					windowEvents.remove({
						move: onMove,
						up: onUp,
					});
				}

				scope.$on('$destroy', function () {
					animate.pause();
				});

			},
		};
    }]);

}());
/* global angular */

(function() {
    "use strict";

    var app = angular.module('artisan');

    app.factory('Scrollable', ['Utils', 'Point', 'Rect', function(Utils, Point, Rect) {

        function Scrollable() {

            var padding = 150;
            var enabled, snappable, busy, dragging, wheeling, down, move, prev;
            var currentIndex = 0;

            snappable = true;

            var start = new Point(),
                end = new Point(),
                current = new Point(),
                drag = new Point(),
                indicator = new Point(),
                offset = new Point(),
                speed = new Point(),
                container = new Rect(),
                content = new Rect(),
                overflow = new Rect();

            var scrollable = {
                // properties
                start: start,
                end: end,
                current: current,
                indicator: indicator,
                speed: speed,
                overflow: overflow,
                container: container,
                content: content,
                // methods
                setContainer: setContainer,
                setContent: setContent,
                setEnabled: setEnabled,
                getCurrent: getCurrent,
                getDrag: getDrag,
                getIndicator: getIndicator,
                getIndex: getIndex,
                scrollToIndex: scrollToIndex,
                scrollPrev: scrollPrev,
                scrollNext: scrollNext,
                dragStart: dragStart,
                dragMove: dragMove,
                dragEnd: dragEnd,
                doReset: doReset,
                off: off,
                // x direction
                doLeft: doLeft,
                doRight: doRight,
                renderX: renderX,
                scrollToX: scrollToX,
                wheelX: wheelX,
                wheelXCheck: wheelXCheck,
                // y direction
                doTop: doTop,
                doBottom: doBottom,
                renderY: renderY,
                scrollToY: scrollToY,
                wheelY: wheelY,
                wheelYCheck: wheelYCheck,
            };

            angular.extend(this, scrollable);

            scrollable = this;

            function setContainer(node) {
                container.width = node.offsetWidth;
                container.height = node.offsetHeight;
            }

            function setContent(node) {
                content.width = node.offsetWidth;
                content.height = node.offsetHeight;
            }

            function setEnabled(flag) {
                enabled = flag;
            }

            function getCurrent() {
                return current;
            }

            function getDrag() {
                return drag;
            }

            function getIndicator() {
                return indicator;
            }

            function getIndex() {
                return currentIndex;
            }

            function scrollToIndex(index) {
                if (index !== currentIndex) {
                    currentIndex = index;
                    var item = getItemAtIndex(index);
                    if (item) {
                        offset = new Point(
                            item.offsetLeft,
                            item.offsetTop
                        );
                        // console.log('scrollToIndex', index, offset);
                    }
                    return true;
                }
            }

            function dragStart(point) {
                if (!busy) {
                    start.x = end.x = current.x;
                    start.y = end.y = current.y;
                    speed.x = 0;
                    speed.y = 0;
                    down = point;
                    currentIndex = -1;
                    wheeling = false;
                    return true;
                } else {
                    return false;
                }
            }

            function dragMove(point) {
                prev = move;
                move = point;
                drag.x = move.x - down.x;
                drag.y = move.y - down.y;
                dragging = true;
            }

            function dragEnd() {
                if (move && prev) {
                    speed.x += (move.x - prev.x) * 4;
                    speed.y += (move.y - prev.y) * 4;
                }
                start.x = end.x = current.x;
                start.y = end.y = current.y;
                dragging = false;
                move = null;
                down = null;
                prev = null;
            }

            function getItemAtIndex(index) {
                var item = null;
                var items = scrollable.getItems();
                if (items) {
                    if (index >= 0 && index < items.length) {
                        item = items[index];
                    }
                }
                // console.log('getItemAtIndex', index, items.length, item);
                return item;
            }

            function scrollPrev() {
                var index = Math.max(0, currentIndex - 1);
                console.log('scrollPrev', index);
                scrollToIndex(index);
            }

            function scrollNext() {
                var items = scrollable.getItems();
                var index = Math.min(items.length - 1, currentIndex + 1);
                console.log('scrollNext', index);
                scrollToIndex(index);
            }

            function doReset() {
                end.x = current.x = 0;
            }

            function off() {
                dragging = false;
                wheeling = false;
                move = null;
                down = null;
            }

            // x - direction

            function doLeft(scope) {
                if (busy) {
                    return;
                }
                if (!scrollable.onLeft) {
                    return;
                }
                busy = true;
                scrollable.onLeft(scope).then().finally(function() {
                    scrollToX(0);
                });
            }

            function doRight(scope) {
                if (busy) {
                    return;
                }
                if (!scrollable.onRight) {
                    return;
                }
                busy = true;
                scrollable.onRight(scope).then().finally(function() {
                    var right = container.width - content.width;
                    if (right > overflow.width) {
                        start.x = end.x = overflow.width;
                    } else {
                        start.x = end.x = overflow.width + padding;
                    }
                    scrollToX(0);
                });
            }

            function renderX() {
                var animating = true;
                if (enabled) {
                    overflow.x = 0;
                    overflow.width = container.width - content.width;
                    if (dragging) {
                        end.x = start.x + move.x - down.x;
                        if (extendX()) {
                            start.x = end.x;
                            down.x = move.x;
                        }
                    } else if (speed.x) {
                        end.x += speed.x;
                        speed.x *= 0.75;
                        if (wheeling) {
                            extendX();
                        }
                        if (Math.abs(speed.x) < 2.05) {
                            speed.x = 0;
                            scrollable.wheeling = wheeling = false;
                            snapToNearestX();
                        }
                    } else if (offset) {
                        end.x = -offset.x;
                        offset = null;
                    }
                    end.x = Math.round(end.x * 10000) / 10000;
                    end.x = Math.min(overflow.x, end.x);
                    end.x = Math.max(overflow.width, end.x);
                    current.x += (end.x - current.x) / 4;
                    if (speed.x === 0 && Math.abs(end.x - current.x) < 0.05) {
                        current.x = end.x;
                        if (!snapToNearestX()) {
                            animating = false;
                        }
                    }
                    // console.log('renderX', current.x, end.x, overflow.x);
                } else {
                    current.x = end.x = 0;
                    animating = false;
                }
                return animating;
            }

            function extendX() {
                var extending = false;
                overflow.x += padding;
                overflow.width -= padding;
                if (end.x > overflow.x) {
                    extending = true;
                    doLeft();
                } else if (end.x < overflow.width) {
                    extending = true;
                    doRight();
                }
                return extending;
            }

            function snapToNearestX() {
                var items = scrollable.getItems();
                if (items) {
                    var index = -1;
                    var min = Number.POSITIVE_INFINITY;
                    angular.forEach(items, function(item, i) {
                        var distance = Math.abs((end.x + speed.x) - (item.offsetLeft * -1));
                        if (distance < min) {
                            min = distance;
                            index = i;
                        }
                    });
                    if (index !== -1) {
                        if (snappable) {
                            return scrollToIndex(index);
                        } else {
                            currentIndex = index;
                        }
                    }
                }
            }

            function wheelXCheck(dir) {
                // console.log('wheelYCheck', dir < 0 ? (end.x - overflow.width) : (end.x - overflow.x));
                if (!busy && enabled) {
                    if (dir < 0) {
                        return end.x - overflow.width;
                    } else {
                        return end.x - overflow.x;
                    }
                } else {
                    return false;
                }
            }

            function wheelX(dir, interval) {
                end.x += dir * 100 / 1000 * interval;
                speed.x += dir * 100 / 1000 * interval;
                wheeling = true;
            }

            function scrollToX(value) {
                start.x = end.x = value;
                setTimeout(function() {
                    off();
                    busy = false;
                }, 500);
            }

            // y - direction

            function doTop(scope) {
                if (busy) {
                    return;
                }
                if (!scrollable.onTop) {
                    return;
                }
                busy = true;
                scrollable.onTop(scope).then().finally(function() {
                    scrollToY(0);
                });
            }

            function doBottom(scope) {
                if (busy) {
                    return;
                }
                if (!scrollable.onBottom) {
                    return;
                }
                busy = true;
                scrollable.onBottom(scope).then().finally(function() {
                    var bottom = container.height - content.height;
                    if (bottom > overflow.height) {
                        start.y = end.y = overflow.height;
                    } else {
                        start.y = end.y = overflow.height + padding;
                    }
                    scrollToY(0);
                });
            }

            function renderY() {
                var animating = true;
                if (enabled) {
                    overflow.y = 0;
                    overflow.height = container.height - content.height;
                    if (dragging) {
                        end.y = start.y + move.y - down.y;
                        if (extendY()) {
                            start.y = end.y;
                            down.y = move.y;
                        }
                    } else if (speed.y) {
                        end.y += speed.y;
                        speed.y *= 0.75;
                        if (wheeling) {
                            extendY();
                        }
                        if (Math.abs(speed.y) < 2.05) {
                            speed.y = 0;
                            scrollable.wheeling = wheeling = false;
                            snapToNearestY();
                        }
                    } else if (offset) {
                        end.y = -offset.y;
                        offset = null;
                    }
                    end.y = Math.round(end.y * 10000) / 10000;
                    end.y = Math.min(overflow.y, end.y);
                    end.y = Math.max(overflow.height, end.y);
                    current.y += (end.y - current.y) / 4;
                    if (speed.y === 0 && Math.abs(end.y - current.y) < 0.05) {
                        current.y = end.y;
                        if (!snapToNearestY()) {
                            animating = false;
                        }
                    }
                    // console.log(parseFloat(current.y.toFixed(6)), end.y, overflow.y);
                    // console.log(dragging, wheeling, end.y, speed.y, Math.abs(end.y - current.y));
                } else {
                    current.y = end.y = 0;
                    animating = false;
                }
                return animating;
            }

            function extendY() {
                var extending = false;
                overflow.y += padding;
                overflow.height -= padding;
                if (end.y > overflow.y) {
                    extending = true;
                    doTop();
                } else if (end.y < overflow.height) {
                    extending = true;
                    doBottom();
                }
                return extending;
            }

            function snapToNearestY() {
                var items = scrollable.getItems();
                if (items) {
                    var index = -1;
                    var min = Number.POSITIVE_INFINITY;
                    angular.forEach(items, function(item, i) {
                        var distance = Math.abs((end.y + speed.y) - (item.offsetTop * -1));
                        if (distance < min) {
                            min = distance;
                            index = i;
                        }
                    });
                    // console.log('snapToNearestY', index, min);
                    if (index !== -1) {
                        if (snappable) {
                            return scrollToIndex(index);
                        } else {
                            currentIndex = index;
                        }
                    }
                }
            }

            function wheelYCheck(dir) {
                // console.log('wheelYCheck', dir < 0 ? (end.y - overflow.height) : (end.y - overflow.y));
                if (!busy && enabled) {
                    if (dir < 0) {
                        return end.y - overflow.height;
                    } else {
                        return end.y - overflow.y;
                    }
                } else {
                    return false;
                }
            }

            function wheelY(dir, interval) {
                end.y += dir * 100 / 1000 * interval;
                speed.y += dir * 100 / 1000 * interval;
                wheeling = true;
            }

            function scrollToY(value) {
                start.y = end.y = value;
                setTimeout(function() {
                    off();
                    busy = false;
                }, 500);
            }

        }

        function link(methods) {
            angular.extend(this, methods);
        }

        Scrollable.prototype = {
            link: link,
            getItems: function() {
                return [content];
            },
        };
        return Scrollable;
    }]);

}());
/* global angular */

(function () {
	"use strict";

	var app = angular.module('artisan');

	app.directive('videoSource', ['$timeout', '$promise', function ($timeout, $promise) {

		var directive = {
			restrict: 'A',
			scope: {
				source: '=videoSource',
				image: '=videoImage',
			},
			templateUrl: function (element, attributes) {
				return attributes.template || 'artisan/components/video/partial/video-player';
			},
			link: VideoSourceLink
		};

		return directive;

		function VideoSourceLink(scope, element, attributes) {

			var native = element[0];
			var video = native.querySelector('video');
			var img = native.querySelector('img');
			var infos = {};
			scope.canplay = false;
			scope.playing = false;
			scope.busy = false;
			scope.toggle = toggle;
			scope.play = play;
			scope.pause = pause;
			scope.infos = infos;

			// loop><source src="{{source}}" type="video/mp4"

			function canplay() {
				return $promise(function (promise) {

					function _onCanPlay(e) {
						scope.canplay = true;
						angular.element(video).off('canplay', _onCanPlay);
						// console.log('videoSource._onCanPlay', e);
						promise.resolve();
					}

					if (scope.canplay) {
						promise.resolve();
					} else {
						angular.element(video).on('canplay', _onCanPlay);
						video.preload = true;
						video.src = scope.source;
					}
				});
			}

			function toggle() {
				if (!scope.busy) {
					scope.busy = true;
					if (scope.playing) {
						video.pause();
					} else {
						canplay().then(function () {
							video.play();
						});
					}
				}
			}

			function play() {
				if (!scope.busy) {
					scope.busy = true;
					canplay().then(function () {
						video.play();
					});
				}
			}

			function pause() {
				if (!scope.busy) {
					scope.busy = true;
					video.pause();
				}
			}

			function onCanPlay(e) {
				$timeout(function () {
					scope.canplay = true;
				});
			}

			function onPlaying(e) {
				$timeout(function () {
					scope.playing = true;
					scope.busy = false;
				});
			}

			function onPause(e) {
				$timeout(function () {
					scope.playing = false;
					scope.busy = false;
				});
			}

			function onEnded(e) {
				$timeout(function () {
					scope.playing = false;
					scope.busy = false;
				});
			}

			function onProgress(e) {
				$timeout(function () {
					infos.buffered = video.buffered; // todo: TimeRanges
					// console.log('onProgress', infos);
				});
			}

			function onTimeUpdate(e) {
				$timeout(function () {
					infos.duration = video.duration;
					infos.currentTime = video.currentTime;
					infos.progressTime = infos.currentTime / infos.duration;
					// console.log('onTimeUpdate', infos);
				});
			}

			var videoElement = angular.element(video);

			function addListeners() {
				// videoElement.on('canplay', onCanPlay);
				videoElement.on('playing', onPlaying);
				videoElement.on('pause', onPause);
				videoElement.on('ended', onEnded);
				videoElement.on('progress', onProgress);
				videoElement.on('timeupdate', onTimeUpdate);
			}

			function removeListeners() {
				// videoElement.off('canplay', onCanPlay);
				videoElement.off('playing', onPlaying);
				videoElement.off('pause', onPause);
				videoElement.off('ended', onEnded);
				videoElement.off('progress', onProgress);
				videoElement.off('timeupdate', onTimeUpdate);
			}

			addListeners();
			scope.$on('destroy', function () {
				removeListeners();
			});

		}

    }]);

	/*
	Object.defineProperty(HTMLMediaElement.prototype, 'playing', {
	    get: function () {
	        return !!(this.currentTime > 0 && !this.paused && !this.ended && this.readyState > 2);
	    }
	});
	*/

}());
/* global angular */

(function () {
	"use strict";

	var app = angular.module('artisan');

	app.factory('Animate', [function () {

		function Animate(callback) {
			this.callback = callback;
			this.key = null;
			this.ticks = 0;
		}

		var statics = {};

		var publics = {
			pause: pause,
			play: play,
			toggle: toggle,
		};

		angular.extend(Animate, statics);
		angular.extend(Animate.prototype, publics);

		return Animate;

		// static methods

		// prototype methods

		function pause() {
			var animate = this;
			if (animate.key) {
				window.cancelAnimationFrame(animate.key);
				animate.key = null;
			}
		}

		function play() {
			var animate = this;

			function loop(time) {
				animate.ticks++;
				animate.callback(time, animate.ticks);
				animate.key = window.requestAnimationFrame(loop);
			}
			if (!animate.key) {
				loop();
			}
		}

		function toggle() {
			var animate = this;
			if (animate.key) {
				animate.pause();
			} else {
				animate.play();
			}
		}

    }]);

	(function () {
		var lastTime = 0;
		var vendors = ['ms', 'moz', 'webkit', 'o'];
		for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
			window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
			window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||
				window[vendors[x] + 'CancelRequestAnimationFrame'];
		}
		if (!window.requestAnimationFrame) {
			window.requestAnimationFrame = function (callback, element) {
				var currTime = new Date().getTime();
				var timeToCall = Math.max(0, 16 - (currTime - lastTime));
				var id = window.setTimeout(function () {
					callback(currTime + timeToCall);
				}, timeToCall);
				lastTime = currTime + timeToCall;
				return id;
			};
		}
		if (!window.cancelAnimationFrame) {
			window.cancelAnimationFrame = function (id) {
				clearTimeout(id);
			};
		}
	}());

}());
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
					if (date) {
						month.setDate(date);
					}
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

	app.factory('CalendarFactory', ['DateTime', 'Hash', function (DateTime, Hash) {

		function Calendar() {
			this.days = new Hash('key');
			this.months = new Hash('mKey');
		}

		var statics = {
			clearMonth: clearMonth,
			getDate: getDate,
			getDay: getDay,
			getKey: getKey,
		};

		var publics = {
			getMonths: getMonths,
			getMonth: getMonth,
			getMonthByDate: getMonthByDate,
		};

		angular.extend(Calendar, statics);
		angular.extend(Calendar.prototype, publics);

		return Calendar;

		// statics

		function clearMonth(month) {
			month.days.each(function (day) {
				if (day) {
					day.hours = 0;
					day.tasks = new Hash('id');
				}
			});
		}

		function getDate(day) {
			if (typeof day.date.getMonth === 'function') {
				return day.date;
			} else {
				return new Date(day.date);
			}
		}

		function getDay(days) {
			var date = new Date(DateTime.today.date);
			date.setDate(date.getDate() + days);
			return date;
		}

		function getKey(date) {
			return Math.ceil(date.getTime() / DateTime.DAY);
		}

		// publics

		function getMonths(num) {
			var calendar = this;
			calendar.days.removeAll();
			calendar.months.removeAll();
			var i = 0;
			while (i < num) {
				var date = new Date();
				date.setFullYear(DateTime.today.date.getFullYear());
				date.setMonth(DateTime.today.date.getMonth() + i);
				date.setDate(1);
				date.setHours(0);
				date.setMinutes(0);
				date.setSeconds(0);
				var month = calendar.getMonthByDate(date);
				// console.log('getMonths', month);
				i++;
			}
			// console.log('getMonths', months);
			return calendar.months;
		}

		function getMonth(day) {
			var calendar = this;
			var date = getDate(day);
			var month = calendar.getMonthByDate(date);
			return month;
		}

		function getMonthByDate(date) {
			var calendar = this;
			var yyyy = date.getFullYear();
			var MM = date.getMonth();
			var key = Math.ceil(date.getTime() / DateTime.DAY);
			var mKey = yyyy * 12 + MM;
			var month = calendar.months.getId(mKey);
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
							calendar.days.add(item);
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
				month = calendar.months.add(month);
			}
			return month;
		}

	}]);

}());
/* global angular */

(function () {
	"use strict";

	var app = angular.module('artisan');

	app.service('DateTime', [function () {

		var service = this;

		var SECOND = 1000;
		var MINUTE = 60 * SECOND;
		var QUARTER = 15 * MINUTE;
		var HOUR = 60 * MINUTE;
		var DAY = 24 * HOUR;
		var WEEK = 7 * DAY;
		var FIRSTDAYOFWEEK = 1;

		var today = getDate();

		var statics = {
			dateToKey: dateToKey,
			//
			dayDiff: dayDiff,
			dayLeft: dayLeft,
			dayRight: dayRight,
			//
			getDate: getDate,
			keyToDate: keyToDate,
			//
			monthDiff: monthDiff,
			monthLeft: monthLeft,
			monthRight: monthRight,
			//
			today: today,
			//
			weekDiff: weekDiff,
			weekLeft: weekLeft,
			weekRight: weekRight,
			//
			yearDiff: yearDiff,
			yearLeft: yearLeft,
			yearRight: yearRight,
			// conversion
			hourToTime: hourToTime,
			timeToHour: timeToHour,
			timeToQuarterHour: timeToQuarterHour,
			// units
			SECOND: SECOND,
			MINUTE: MINUTE,
			QUARTER: QUARTER,
			HOUR: HOUR,
			DAY: DAY,
			WEEK: WEEK,
			FIRSTDAYOFWEEK: FIRSTDAYOFWEEK,
		};

		angular.extend(service, statics);

		function datetime(date) {
			date = date ? new Date(date) : new Date();
			return date;
		}

		function components(date) {
			date = datetime(date);
			// console.log($locale.DATETIME_FORMATS.FIRSTDAYOFWEEK);
			return {
				date: date,
				yyyy: date.getFullYear(),
				MM: date.getMonth(),
				dd: date.getDate(),
				// ee: (date.getDay() + $locale.DATETIME_FORMATS.FIRSTDAYOFWEEK) % 7,
				ee: date.getDay(),
				HH: date.getHours(),
				mm: date.getMinutes(),
				ss: date.getSeconds(),
				sss: date.getMilliseconds(),
			};
		}

		function dateToKey(date) {
			return Math.ceil(date.getTime() / DAY);
		}

		function dayDiff(diff, date) {
			var c = components(date);
			return new Date(c.yyyy, c.MM, c.dd + diff, c.HH, c.mm, c.ss, c.sss);
		}

		function dayLeft(date) {
			var c = components(date);
			return new Date(c.yyyy, c.MM, c.dd, 0, 0, 0, 0);
		}

		function dayRight(date) {
			var c = components(date);
			return new Date(c.yyyy, c.MM, c.dd, 23, 59, 59, 999);
		}

		function getDate(date) {
			date = dayLeft(date);
			return {
				date: date,
				key: dateToKey(date),
			};
		}

		function keyToDate(key) {
			return new Date(new Date().setTime(key * DAY));
		}

		function monthDiff(diff, date) {
			var c = components(date);
			return new Date(c.yyyy, c.MM + diff, 1, c.HH, c.mm, c.ss, c.sss);
		}

		function monthLeft(date) {
			var c = components(date);
			return new Date(c.yyyy, c.MM, 1, 0, 0, 0, 0);
		}

		function monthRight(date) {
			var c = components(date);
			return new Date(c.yyyy, c.MM + 1, 0, 23, 59, 59, 999);
		}

		function hourToTime(hour) {
			return hour * HOUR;
		}

		function timeToHour(time) {
			return time / HOUR;
		}

		function timeToQuarterHour(time) {
			return Math.floor(time / QUARTER) * QUARTER / HOUR;
		}

		function weekDiff(diff, date) {
			var c = components(date);
			return new Date(c.yyyy, c.MM, c.dd + diff * 7, c.HH, c.mm, c.ss, c.sss);
		}

		function weekLeft(date) {
			var c = components(date);
			return new Date(c.yyyy, c.MM, c.dd - c.ee + service.FIRSTDAYOFWEEK, 0, 0, 0, 0);
		}

		function weekRight(date) {
			var c = components(date);
			return new Date(c.yyyy, c.MM, c.dd - c.ee + service.FIRSTDAYOFWEEK + 6, 23, 59, 59, 999);
		}

		function yearDiff(diff, date) {
			var c = components(date);
			return new Date(c.yyyy, c.MM + diff * 12, c.dd, c.HH, c.mm, c.ss, c.sss);
		}

		function yearLeft(date) {
			var c = components(date);
			return new Date(c.yyyy, 0, 1, 0, 0, 0, 0);
		}

		function yearRight(date) {
			var c = components(date);
			return new Date(c.yyyy, 12, 0, 23, 59, 59, 999);
		}

		/*
		ArrayFrom = function(len, callback) {
			var a = [];
			while (a.length < len) {
				a.push(callback(a.length));
			}
			return a;
		};
		*/

	}]);

}());
/* global angular */

(function () {
	"use strict";

	var app = angular.module('artisan');

	app.factory('Range', ['$filter', 'DateTime', function ($filter, DateTime) {

		var it_IT = {
			long: {
				RANGE: '{from|date:MMM yyyy} - {to|date:MMM yyyy}',
				YEAR: 'Anno {from|date:yyyy}',
				SEMESTER: 'Semestre {from|date:MMM yyyy} - {to|date:MMM yyyy}',
				TRIMESTER: 'Quadrimestre {from|date:MMM yyyy} - {to|date:MMM yyyy}',
				QUARTER: 'Trimestre {from|date:MMM yyyy} - {to|date:MMM yyyy}',
				MONTH: '{from|date:MMMM yyyy}',
				WEEK: 'Settimana {to|isoWeek:1}',
				DAY: '{from|date:EEEE dd MMM yyyy}',
			},
			short: {
				RANGE: '{from|date:MMM yyyy} - {to|date:MMM yyyy}',
				YEAR: '{from|date:yyyy}',
				SEMESTER: '{from|date:MMM yyyy} - {to|date:MMM yyyy}',
				TRIMESTER: '{from|date:MMM yyyy} - {to|date:MMM yyyy}',
				QUARTER: '{from|date:MMM yyyy} - {to|date:MMM yyyy}',
				MONTH: '{from|date:MMMM}',
				WEEK: 'W{to|isoWeek:1}',
				DAY: '{from|date:EEEE}',
			},
			week: 1,
		};

		var en_US = {
			long: {
				RANGE: '{from|date:MMM yyyy} - {to|date:MMM yyyy}',
				YEAR: 'Year {from|date:yyyy}',
				SEMESTER: 'Semester {from|date:MMM yyyy} - {to|date:MMM yyyy}',
				TRIMESTER: 'Trimester {from|date:MMM yyyy} - {to|date:MMM yyyy}',
				QUARTER: 'Quarter {from|date:MMM yyyy} - {to|date:MMM yyyy}',
				MONTH: '{from|date:MMMM yyyy}',
				WEEK: 'Week {from|isoWeek:0}',
				DAY: '{from|date:EEEE MM/dd/yyyy}',
			},
			short: {
				RANGE: '{from|date:MMM yyyy} - {to|date:MMM yyyy}',
				YEAR: '{from|date:yyyy}',
				SEMESTER: '{from|date:MMM yyyy} - {to|date:MMM yyyy}',
				TRIMESTER: '{from|date:MMM yyyy} - {to|date:MMM yyyy}',
				QUARTER: '{from|date:MMM yyyy} - {to|date:MMM yyyy}',
				MONTH: '{from|date:MMMM}',
				WEEK: 'W{from|isoWeek:0}',
				DAY: '{from|date:EEEE}',
			},
			week: 0,
		};

		var formats = en_US;

		var RangeTypes = {
			RANGE: 10,
			YEAR: 11,
			SEMESTER: 12,
			TRIMESTER: 13,
			QUARTER: 14,
			MONTH: 15,
			WEEK: 16,
			DAY: 17,
			NEXT_YEAR: 20,
		};

		var statics = {
			copy: RangeCopy,
			expand: RangeExpand,
			getDate: DateTime.getDate,
			dateToKey: DateTime.dateToKey,
			keyToDate: DateTime.keyToDate,
			getMonth: getMonth,
			addYear: addYear,
			// getRange: getRange,
			types: RangeTypes,
			today: DateTime.today,
			DateTime: DateTime,
		};

		var publics = {
			setYear: setYear,
			setSemester: setSemester,
			setTrimester: setTrimester,
			setQuarter: setQuarter,
			setMonth: setMonth,
			setWeek: setWeek,
			setDay: setDay,

			prev: prev,
			next: next,

			setYearPeriod: setYearPeriod,
			setLastSemester: setLastSemester,
			nextYear: nextYear,
			currentYear: currentYear,
			currentSemester: currentSemester,
			currentTrimester: currentTrimester,
			currentQuarter: currentQuarter,
			currentMonth: currentMonth,
			currentWeek: currentWeek,
			currentYearPeriod: currentYearPeriod,
			lastSemester: lastSemester,
			getDiff: getDiff,
			getParams: getParams,
			getDate: getDate,
			setDate: setDate,
			setDiff: setDiff,

			set: set,
			is: is,
			isInside: isInside,
			isOutside: isOutside,
			isCurrent: isCurrent,
			isBefore: isBefore,
			isAfter: isAfter,

			eachDay: eachDay,

			getName: getName,
			getShortName: getShortName,
			toString: toString,
		};

		function Range(options) {
			var range = this;
			range.from = DateTime.dayLeft();
			range.type = RangeTypes.QUARTER;
			if (options) {
				angular.extend(range, options);
			}
			range.setDiff();
		}

		angular.extend(Range, statics);
		angular.extend(Range.prototype, publics);

		return Range;

		// static methods

		/*
		function getRange(type, size, diff, date) {
			var unit = DateTime.DAY;
			type = type || RangeTypes.DAY;
			size = size || 1;
			diff = diff || 0;
			date = date || new Date();
			var range = new Range();
			setDate
			switch (type) {
				case RangeTypes.YEAR:
					range.setSemester(date, diff);
				case RangeTypes.SEMESTER:
					range.setSemester(date, diff);
				case RangeTypes.TRIMESTER:
					range.setSemester(date, diff);
				case RangeTypes.QUARTER:
					range.setSemester(date, diff);
				case RangeTypes.MONTH:
					range.setSemester(date, diff);
					break;
				case RangeTypes.WEEK:
					range.setSemester(date, diff);
					break;
				case RangeTypes.DAY:
					range.setSemester(date, diff);
					break;
			}
			var from = DateTime.dayLeft(date);
		}
		*/

		function RangeCopy($range) {
			var range = new Range($range);
			range.from = new Date($range.from);
			range.to = new Date($range.to);
			return range;
		}

		function RangeExpand(range, time) {
			range = RangeCopy(range);
			range.from = new Date(range.from.getTime() - time);
			range.to = new Date(range.to.getTime() + time);
			console.log('RangeExpand', range.toString());
			return range;
		}

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

		function isInside(date) {
			var range = this;
			return !range.isOutside(date);
		}

		function isOutside(date) {
			date = date || new Date();
			var range = this;
			var outside = date < range.from || date > range.to;
			// console.log('isOutside', date, range.from, range.to);
			return outside;
		}

		function isCurrent(date) {
			date = date || new Date();
			var range = this;
			return !range.isOutside(date);
		}

		function isBefore(date) {
			date = date || new Date();
			var range = this;
			var before = range.to < date;
			// console.log('isBefore', before, range.to, date);
			return before;
		}

		function isAfter(date) {
			date = date || new Date();
			var range = this;
			var after = range.from > date;
			// console.log('isAfter', after);
			return after;
		}

		function setDate(date, diff) {
			var range = this;
			switch (range.type) {
				case RangeTypes.YEAR:
					range.setYear(date, diff);
					break;
				case RangeTypes.SEMESTER:
					range.setSemester(date, diff);
					break;
				case RangeTypes.TRIMESTER:
					range.setTrimester(date, diff);
					break;
				case RangeTypes.QUARTER:
					range.setQuarter(date, diff);
					break;
				case RangeTypes.MONTH:
					range.setMonth(date, diff);
					break;
				case RangeTypes.WEEK:
					range.setWeek(date, diff);
					break;
				case RangeTypes.DAY:
					range.setDay(date, diff);
					break;
				case RangeTypes.NEXT_YEAR:
					range.nextYear(date, diff);
					break;
			}
			return range;
		}

		function getDate(diff) {
			diff = diff || 0;
			var range = this;
			var date = new Date(range.from);
			switch (range.type) {
				case RangeTypes.YEAR:
				case RangeTypes.NEXT_YEAR:
					date = new Date(date.setFullYear(date.getFullYear() + diff));
					break;
				case RangeTypes.SEMESTER:
					date = new Date(date.setMonth(date.getMonth() + diff * 6));
					break;
				case RangeTypes.TRIMESTER:
					date = new Date(date.setMonth(date.getMonth() + diff * 4));
					break;
				case RangeTypes.QUARTER:
					date = new Date(date.setMonth(date.getMonth() + diff * 3));
					break;
				case RangeTypes.MONTH:
					date = new Date(date.setMonth(date.getMonth() + diff));
					break;
				case RangeTypes.WEEK:
					date = new Date(date.setDate(date.getDate() + diff * 7));
					break;
				case RangeTypes.DAY:
					date = new Date(date.setDate(date.getDate() + diff));
					break;
			}
			return date;
		}

		function getParams() {
			return {
				dateFrom: new Date(this.from),
				dateTo: new Date(this.to),
			};
		}

		function setYear(date, diff, size) {
			diff = diff || 0;
			size = size || 1;
			var left = DateTime.yearDiff(diff, date);
			var right = DateTime.yearDiff(diff + size - 1, date);
			var range = this;
			range.from = DateTime.yearLeft(left);
			range.to = DateTime.yearRight(right);
			return range;
		}

		function setSemester(date, diff, size) {
			diff = diff || 0;
			size = size || 1;
			date = date || new Date();
			date = new Date(date.setMonth(date.getMonth() + 6 * diff));
			var yyyy = date.getFullYear();
			var semester = Math.floor(date.getMonth() / 6);
			var range = this;
			// range.type = RangeTypes.SEMESTER;
			range.from = new Date(yyyy, semester * 6, 1, 0, 0, 0, 0, 0);
			range.to = new Date(yyyy, semester * 6 + 6, 0, 23, 59, 59, 999);
			return range;
		}

		function setTrimester(date, diff, size) {
			diff = diff || 0;
			size = size || 1;
			date = date || new Date();
			date = new Date(date.setMonth(date.getMonth() + 4 * diff));
			var yyyy = date.getFullYear();
			var trimester = Math.floor(date.getMonth() / 4);
			var range = this;
			// range.type = RangeTypes.TRIMESTER;
			range.from = new Date(yyyy, trimester * 4, 1, 0, 0, 0, 0, 0);
			range.to = new Date(yyyy, trimester * 4 + 4, 0, 23, 59, 59, 999);
			return range;
		}

		function setQuarter(date, diff, size) {
			diff = diff || 0;
			size = size || 1;
			date = date || new Date();
			date = new Date(date.setMonth(date.getMonth() + 3 * diff));
			var yyyy = date.getFullYear();
			var quarter = Math.floor(date.getMonth() / 3);
			var range = this;
			// range.type = RangeTypes.QUARTER;
			range.from = new Date(yyyy, quarter * 3, 1, 0, 0, 0, 0, 0);
			range.to = new Date(yyyy, quarter * 3 + 3, 0, 23, 59, 59, 999);
			return range;
		}

		function setMonth(date, diff, size) {
			diff = diff || 0;
			size = size || 1;
			var left = DateTime.monthDiff(diff, date);
			var right = DateTime.monthDiff(diff + size - 1, date);
			var range = this;
			range.from = DateTime.monthLeft(left);
			range.to = DateTime.monthRight(right);
			return range;
		}

		function setWeek(date, diff, size) {
			diff = diff || 0;
			size = size || 1;
			var left = DateTime.weekDiff(diff, date);
			var right = DateTime.weekDiff(diff + size - 1, date);
			var range = this;
			range.from = DateTime.weekLeft(left);
			range.to = DateTime.weekRight(right);
			return range;
		}

		function setDay(date, diff, size) {
			diff = diff || 0;
			size = size || 1;
			var left = DateTime.dayDiff(diff, date);
			var right = DateTime.dayDiff(diff + size - 1, date);
			var range = this;
			range.from = DateTime.dayLeft(left);
			range.to = DateTime.dayRight(right);
			return range;
		}

		function setYearPeriod(date, diff) {
			diff = diff || 0;
			this.type = RangeTypes.YEAR;
			var now = new Date();
			var m = now.getMonth() + 1;
			now.setMonth(m * diff);
			var year = now.getFullYear();
			this.from = new Date(year, 0, 1, 0, 0, 0, 0, 0);
			this.to = new Date(year, m, 0, 23, 59, 59, 999);
			return this;
		}

		function setLastSemester(date, diff) {
			// should be setLastSixMonths;
			diff = diff || 0;
			date = date || new Date();
			date = new Date(date.setMonth(date.getMonth() + 6 * diff + 1));
			var range = this;
			range.type = RangeTypes.SEMESTER;
			var yyyy = date.getFullYear();
			range.from = new Date(yyyy, date.getMonth(), 1, 0, 0, 0, 0, 0);
			range.to = new Date(yyyy, date.getMonth() + 6, 0, 23, 59, 59, 999);
			return range;
		}

		function prev() {
			return this.setDiff(-1);
		}

		function next() {
			return this.setDiff(1);
		}

		function nextYear() {
			var date = new Date();
			var yyyy = date.getFullYear();
			var range = this;
			range.type = RangeTypes.NEXT_YEAR;
			range.from = new Date(yyyy, date.getMonth(), 1, 0, 0, 0, 0, 0);
			range.to = new Date(yyyy, date.getMonth() + 12, 0, 23, 59, 59, 999);
			return range;
		}

		function currentYear() {
			var range = this;
			range.setYear();
			return range;
		}

		function currentYearPeriod() {
			var range = this;
			range.setYearPeriod();
			return range;
		}

		function currentSemester() {
			var range = this;
			range.setSemester();
			return range;
		}

		function currentTrimester() {
			var range = this;
			range.setTrimester();
			return range;
		}

		function currentQuarter() {
			var range = this;
			range.setQuarter();
			return range;
		}

		function currentMonth() {
			var range = this;
			range.setMonth();
			return range;
		}

		function currentWeek() {
			var range = this;
			range.setWeek();
			return range;
		}

		function lastSemester() {
			var range = this;
			range.setLastSemester(null, -1);
			return range;
		}

		function setDiff(diff) {
			var range = this;
			switch (range.type) {
				case RangeTypes.YEAR:
					range.setYear(range.from, diff);
					break;
				case RangeTypes.SEMESTER:
					range.setSemester(range.from, diff);
					break;
				case RangeTypes.TRIMESTER:
					range.setTrimester(range.from, diff);
					break;
				case RangeTypes.QUARTER:
					range.setQuarter(range.from, diff);
					break;
				case RangeTypes.MONTH:
					range.setMonth(range.from, diff);
					break;
				case RangeTypes.WEEK:
					range.setWeek(range.from, diff);
					break;
				case RangeTypes.DAY:
					range.setDay(range.from, diff);
					break;
				case RangeTypes.NEXT_YEAR:
					range.nextYear(range.from, diff);
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

		function extract(obj, value) {
			return Object.keys(obj)[Object.values(obj).indexOf(value)];
		}

		function getDiff(diff) {
			var range = this;
			return new Range({
				type: range.type,
			}).setDate(range.from).setDiff(diff);
		}

		function eachDay(callback) {
			var range = this;
			if (typeof callback !== 'function') {
				return range;
			}
			var fromKey = Range.dateToKey(range.from);
			var toKey = Range.dateToKey(range.to);
			while (fromKey <= toKey) {
				callback({
					key: fromKey,
					date: Range.keyToDate(fromKey),
				});
				fromKey++;
			}
			return range;
		}

		function getName() {
			var range = this;
			var key = extract(RangeTypes, range.type);
			return RangeFormat(range, formats.long[key]);
		}

		function getShortName() {
			var range = this;
			var key = extract(RangeTypes, range.type);
			return RangeFormat(range, formats.short[key]);
		}

		function RangeFormat(range, format) {
			var name = format;
			name = name.replace(/{(.*?)}/g, function (replaced, token) {
				var a = token.split('|');
				var p = a.shift();
				var f = a.join(''),
					j;
				if (f.indexOf(':') !== -1) {
					f = f.split(':');
					j = f.length ? f.pop() : null;
					f = f.join('');
				}
				// console.log(token, f, p, j);
				return f.length ? $filter(f)(range[p], j) : range[p];
			});
			// console.log(name);
			return name;
		}

		function toString() {
			return '[' +
				$filter('date')(this.from, 'MMM dd yyyy HH:mm:ss.sss') + ', ' +
				$filter('date')(this.to, 'MMM dd yyyy HH:mm:ss.sss') +
				'] \'' + this.getName() + '\'';
		}

	}]);

	(function () {
		// POLYFILL Object.values
		if (typeof Object.values !== 'function') {
			Object.defineProperty(Object, 'values', {
				value: function (obj) {
					var vals = [];
					for (var key in obj) {
						if (has(obj, key) && isEnumerable(obj, key)) {
							vals.push(obj[key]);
						}
					}
					return vals;
				}
			});
		}
	}());

}());
/* global angular */

(function () {
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

	app.filter('dateRelative', ['$rootScope', '$interval', '$injector', '$formats', function ($rootScope, $interval, $injector, $formats) {

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
					instant: function (id, params) {
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
		return function (date) {
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

	app.directive('dateRelative', ['$parse', '$filter', '$interval', function ($parse, $filter, $interval) {
		return {
			priority: 1001,
			restrict: 'A',
			link: function (scope, element, attributes, model) {

				function setDate() {
					var date = $parse(attributes.dateRelative)(scope);
					var relative = $filter('dateRelative')(date);
					element[0].innerHTML = relative;
					// console.log('dateRelative.setDate', relative);
				}

				setDate();

				var i = setInterval(setDate, 60 * 1000);

				scope.$on('$destroy', function () {
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
/*
// handle transition on resizing
var resizingTimeout;
$(window).on('resize', function () {
    clearTimeout(resizingTimeout);
    $('body').addClass('resizing');
    resizingTimeout = setTimeout(function () {
        $('body').removeClass('resizing');
    }, 100);
})
*/

/* global angular */

(function () {
	"use strict";

	var app = angular.module('artisan');

	app.service('Dom', ['Point', 'Rect', function (Point, Rect) {

		var service = this;

		var statics = {
			getBoundRect: getBoundRect,
			getClosest: getClosest,
			getClosestNode: getClosestNode,
			getDelta: getDelta,
			getDocumentNode: getDocumentNode,
			getElement: getElement,
			getNode: getNode,
			getNodeOffset: getNodeOffset,
			getPageScroll: getPageScroll,
			getParents: getParents,
			getView: getView,
			getPointInView: getPointInView,
			compileController: compileController,
			downloadFile: downloadFile,
			ua: getUA(),
		};

		angular.extend(service, statics);

		// return node element BoundingClientRect
		function getBoundRect(node) {
			node = getNode(node);
			if (node === window) {
				node = getDocumentNode();
			}
			var rect = node.getBoundingClientRect();
			return rect;
		}

		// return closest parent node that match a selector
		function getClosest(node, selector) {
			var matchesFn, parent;
            ['matches', 'webkitMatchesSelector', 'mozMatchesSelector', 'msMatchesSelector', 'oMatchesSelector'].some(function (fn) {
				if (typeof document.body[fn] == 'function') {
					matchesFn = fn;
					return true;
				}
				return false;
			});
			if (node[matchesFn](selector)) {
				return node;
			}
			while (node !== null) {
				parent = node.parentElement;
				if (parent !== null && parent[matchesFn](selector)) {
					return parent;
				}
				node = parent;
			}
			return null;
		}

		// return closest parent node that math a target node
		function getClosestNode(node, target) {
			var parent = null;
			if (node === target) {
				return node;
			}
			while (node !== null) {
				parent = node.parentElement;
				if (parent !== null && parent === target) {
					return parent;
				}
				node = parent;
			}
			return null;
		}

		// return wheel delta
		function getDelta(event) {
			var original = event.originalEvent ? event.originalEvent : event;
			var type = original.type;
			var delta = null;
			if (type === 'wheel' || type === 'mousewheel' || type === 'DOMMouseScroll') {
				var deltaX = original.deltaX || original.wheelDeltaX;
				var deltaY = original.deltaY || original.wheelDeltaY;
				delta = new Point(deltaX, deltaY);
				if (Math.abs(deltaX) > Math.abs(deltaY)) {
					delta.dir = deltaX < 0 ? 1 : -1;
				} else {
					delta.dir = deltaY < 0 ? 1 : -1;
				}
			}
			return delta;
		}

		// return document element node
		function getDocumentNode() {
			var documentNode = (document.documentElement || document.body.parentNode || document.body);
			return documentNode;
		}

		// return an angular element
		function getElement(element) {
			return angular.isArray(element) ? element : angular.element(element);
		}

		// return a native html node
		function getNode(element) {
			return angular.isArray(element) ? element[0] : element;
		}

		// return a node offset point
		function getNodeOffset(node) {
			var offset = new Point();
			node = getNode(node);
			if (node && node.nodeType === 1) {
				offset.x = node.offsetLeft;
				offset.y = node.offsetTop;
			}
			return offset;
		}

		// return the current page scroll
		function getPageScroll() {
			var scroll = new Point();
			var documentNode = getDocumentNode();
			scroll.x = window.pageXOffset || documentNode.scrollLeft;
			scroll.y = window.pageYOffset || documentNode.scrollTop;
			return scroll;
		}

		// return an array of node parants
		function getParents(node, topParentNode) {
			// if no topParentNode defined will bubble up all the way to *document*
			topParentNode = topParentNode || getDocumentNode();
			var parents = [];
			if (node) {
				parents.push(node);
				var parentNode = node.parentNode;
				while (parentNode && parentNode !== topParentNode) {
					parents.push(parentNode);
					parentNode = parentNode.parentNode;
				}
				parents.push(topParentNode); // push that topParentNode you wanted to stop at
			}
			parents.each = function (callback) {
				this.filter(function (node) {
					if (callback) {
						callback(angular.element(node), node);
					}
				});
			}
			return parents;
		}

		// return the view rect
		function getView() {
			var view = new Rect();
			if (window.innerWidth !== undefined) {
				view.width = window.innerWidth;
				view.height = window.innerHeight;
			} else {
				var documentNode = getDocumentNode();
				view.width = documentNode.clientWidth;
				view.height = documentNode.clientHeight;
			}
			return view;
		}

		// add to constant
		var MOUSE_EVENTS = ['click', 'mousedown', 'mouseup', 'mousemove', 'mouseover', 'mouseout', 'mouseenter', 'mouseleave', 'contextmenu'];
		var TOUCH_EVENTS = ['touchstart', 'touchmove', 'touchend', 'touchcancel'];

		function getPointInView(event) {
			var original = event.originalEvent ? event.originalEvent : event;
			var type = original.type;
			var point = null;
			if (TOUCH_EVENTS.indexOf(type) !== -1) {
				var touch = null;
				var touches = original.touches.length ? original.touches : original.changedTouches;
				if (touches && touches.length) {
					touch = touches[0];
				}
				if (touch) {
					point = new Point();
					point.x = touch.pageX;
					point.y = touch.pageY;
				}
			} else if (MOUSE_EVENTS.indexOf(type) !== -1) {
				point = new Point();
				point.x = original.pageX;
				point.y = original.pageY;
			}
			return point;
		}

		function getUA() {
			var agent = window.navigator.userAgent.toLowerCase();
			var safari = agent.indexOf('safari') !== -1 && agent.indexOf('chrome') === -1;
			var msie = agent.indexOf('trident') !== -1 || agent.indexOf('edge') !== -1 || agent.indexOf('msie') !== -1;
			var chrome = !safari && !msie && agent.indexOf('chrome') !== -1;
			var mobile = agent.indexOf('mobile') !== -1;
			var mac = agent.indexOf('macintosh') !== -1;
			var ua = {
				agent: agent,
				safari: safari,
				msie: msie,
				chrome: chrome,
				mobile: mobile,
				mac: mac,
			};
			angular.forEach(ua, function (value, key) {
				if (value) {
					angular.element(document.getElementsByTagName('body')).addClass(key);
				}
			});
			return ua;
		}

		/*
    function mobilecheck() {
        var check = false;
        (function(a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
        return check;
    }

    // For those wishing to include tablets in this test (though arguably, you shouldn't), you can use the following function:
    function mobileAndTabletcheck() {
        var check = false;
        (function(a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
        return check;
    }

    var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    var isMobile = mobilecheck();
    var isMobileAndTabled = mobileAndTabletcheck();
		*/

		function compileController(scope, element, html, data) {
			// console.log('Dom.compileController', element);
			element = getElement(element);
			element.html(html);
			var link = $compile(element.contents());
			if (data.controller) {
				var $scope = scope.$new();
				angular.extend($scope, data);
				var controller = $controller(data.controller, {
					$scope: $scope
				});
				if (data.controllerAs) {
					scope[data.controllerAs] = controller;
				}
				element.data('$ngControllerController', controller);
				element.children().data('$ngControllerController', controller);
				scope = $scope;
			}
			link(scope);
		}

		function downloadFile(content, name, type) {
			type = type || 'application/octet-stream';
			var base64 = null;
			var blob = new Blob([content], {
				type: type
			});
			var reader = new window.FileReader();
			reader.readAsDataURL(blob);
			reader.onloadend = function () {
				base64 = reader.result;
				download();
			};

			function download() {
				if (document.createEvent) {
					var anchor = document.createElement('a');
					anchor.href = base64;
					if (anchor.download !== undefined) {
						var downloadName = name || base64.substring(base64.lastIndexOf('/') + 1, base64.length);
						anchor.download = downloadName;
					}
					var event = document.createEvent('MouseEvents');
					event.initEvent('click', true, true);
					anchor.dispatchEvent(event);
					return true;
				}
				var query = '?download';
				window.open(base64.indexOf('?') > -1 ? base64 : base64 + query, '_self');
			}
		}

    }]);

}());
/* global angular */

(function () {
	"use strict";

	var app = angular.module('artisan');

	app.factory('Event', ['EventsService', 'Dom', 'Point', 'Rect', function (EventsService, Dom, Point, Rect) {

		function Event(event, element) {
			try {
				event = event || window.event;
				var type = event.type;
				var originalEvent = event.originalEvent ? event.originalEvent : event;
				var node = element[0]; // Dom.getNode(element);
				var offset = Dom.getNodeOffset(node);
				var rect = Dom.getBoundRect(node);
				var view = Dom.getView();
				var scroll = Dom.getPageScroll();
				var point = Dom.getPointInView(event);
				if (point) {
					var absolute = new Point(point.x - scroll.x, point.y - scroll.y);
					var relative = new Point(absolute.x - rect.left, absolute.y - rect.top);
					this.point = point;
					this.absolute = absolute;
					this.relative = relative;
				}
				var delta = Dom.getDelta(event);
				if (delta) {
					this.delta = delta;
					this.dir = delta.dir;
				}
				this.event = event;
				this.type = type;
				this.originalEvent = originalEvent;
				this.element = element;
				this.node = node;
				this.offset = offset;
				this.rect = rect;
				this.view = view;
				this.scroll = scroll;
				this.timestamp = new Date().getTime();
			} catch (error) {
				console.log('Event.error', error);
			}
		}

		var statics = {};

		var publics = {
			stop: stop,
		};

		angular.extend(Event, statics);
		angular.extend(Event.prototype, publics);
		return Event;

		// prototype methods

		function stop() {
			this.event.stopPropagation();
			this.event.preventDefault();
		}

	}]);

	app.factory('Events', ['EventsService', 'Event', 'Dom', function (EventsService, Event, Dom) {

		function Events(element) {
			var events = this;

			this.element = Dom.getElement(element);
			this.listeners = {};
			this.standardEvents = {
				click: {
					key: 'click',
					callback: onClick
				},
				down: {
					key: 'mousedown',
					callback: onMouseDown
				},
				move: {
					key: 'mousemove',
					callback: onMouseMove
				},
				up: {
					key: 'mouseup',
					callback: onMouseUp
				},
				resize: {
					key: 'resize',
					callback: onResize
				},
			};
			this.touchEvents = {
				down: {
					key: 'touchstart',
					callback: onTouchStart
				},
				move: {
					key: 'touchmove',
					callback: onTouchMove
				},
				up: {
					key: 'touchend',
					callback: onTouchEnd
				},
			};
			this.wheelEvents = {
				wheel: {
					key: 'mousewheel',
					callback: onMouseWheel
				},
			};
			this.scrollEvents = {
				wheel: {
					key: 'DOMMouseScroll',
					callback: onMouseScroll
				},
			};
			this.timestamp = new Date().getTime();
			this.setTimestamp = setTimestamp;

			function setTimestamp(event) {
				if (event) {
					event.interval = Math.min(250, event.timestamp - events.timestamp);
					// console.log(event.interval, event.timestamp, events.timestamp);
				}
				events.timestamp = new Date().getTime();
			}

			function onClick(e) {
				// console.log('onClick', e, events);
				var event = new Event(e, events.element);
				events.setTimestamp(event);
				events.listeners.click.apply(this, [event]);
			}

			function onMouseDown(e) {
				// console.log('onMouseDown', e);
				var event = new Event(e, events.element);
				events.setTimestamp(event);
				events.listeners.down.apply(this, [event]);
				events.removeTouchEvents();
			}

			function onMouseMove(e) {
				// console.log('onMouseMove', e);
				var event = new Event(e, events.element);
				events.setTimestamp(event);
				events.listeners.move.apply(this, [event]);
			}

			function onMouseUp(e) {
				// console.log('onMouseUp', e);
				var event = new Event(e, events.element);
				events.setTimestamp(event);
				events.listeners.up.apply(this, [event]);
			}

			function onMouseWheel(e) {
				// console.log('onMouseWheel', e);
				var event = new Event(e, events.element);
				events.setTimestamp(event);
				events.listeners.wheel.apply(this, [event]);
				events.removeScrollEvents();
			}

			function onMouseScroll(e) {
				// console.log('onMouseScroll', e);
				var event = new Event(e, events.element);
				events.setTimestamp(event);
				events.listeners.wheel.apply(this, [event]);
				events.removeWheelEvents();
			}

			function onResize(e) {
				// console.log('onResize', e);
				var event = new Event(e, events.element);
				events.setTimestamp(event);
				events.listeners.resize.apply(this, [event]);
			}

			function onTouchStart(e) {
				// console.log('onTouchStart', e);
				var event = new Event(e, events.element);
				events.setTimestamp(event);
				events.listeners.down.apply(this, [event]);
				events.removeStandardEvents();
			}

			function onTouchMove(e) {
				// console.log('onTouchMove', e);
				var event = new Event(e, events.element);
				events.setTimestamp(event);
				events.listeners.move.apply(this, [event]);
			}

			function onTouchEnd(e) {
				// console.log('onTouchEnd', e);
				var event = new Event(e, events.element);
				events.setTimestamp(event);
				events.listeners.up.apply(this, [event]);
			}
		}

		var statics = {
			getTouch: getTouch,
			getRelativeTouch: getRelativeTouch,
		};

		var publics = {
			add: add,
			remove: remove,
			removeStandardEvents: removeStandardEvents,
			removeTouchEvents: removeTouchEvents,
			removeWheelEvents: removeWheelEvents,
			removeScrollEvents: removeScrollEvents,
		};

		angular.extend(Events, statics);
		angular.extend(Events.prototype, publics);
		return Events;

		// prototype methods

		function add(listeners, scope) {
			var events = this,
				standard = this.standardEvents,
				touch = this.touchEvents,
				wheel = this.wheelEvents,
				scroll = this.scrollEvents;
			var element = this.element,
				windowElement = angular.element(window);

			angular.forEach(listeners, function (callback, key) {
				if (events.listeners[key]) {
					var listener = {};
					listener[key] = events.listeners[key];
					remove(listener);
				}
				events.listeners[key] = callback;
				if (standard[key]) {
					if (key === 'resize') {
						windowElement.on(standard[key].key, standard[key].callback);
					} else {
						element.on(standard[key].key, standard[key].callback);
					}
				}
				if (touch[key]) {
					element.on(touch[key].key, touch[key].callback);
				}
				if (wheel[key]) {
					element.on(wheel[key].key, wheel[key].callback);
				}
				if (scroll[key]) {
					element.on(scroll[key].key, scroll[key].callback);
				}
			});

			if (scope) {
				scope.$on('$destroy', function () {
					events.remove(listeners);
				});
			}

			return events;
		}

		function remove(listeners) {
			var events = this,
				standard = this.standardEvents,
				touch = this.touchEvents,
				wheel = this.wheelEvents,
				scroll = this.scrollEvents;
			var element = this.element,
				windowElement = angular.element(window);
			angular.forEach(listeners, function (callback, key) {
				if (standard[key]) {
					if (key === 'resize') {
						windowElement.off(standard[key].key, standard[key].callback);
					} else {
						element.off(standard[key].key, standard[key].callback);
					}
				}
				if (touch[key]) {
					element.off(touch[key].key, touch[key].callback);
				}
				if (wheel[key]) {
					element.off(wheel[key].key, wheel[key].callback);
				}
				if (scroll[key]) {
					element.off(scroll[key].key, scroll[key].callback);
				}
				events.listeners[key] = null;
			});
			return events;
		}

		function removeStandardEvents() {
			var events = this,
				standard = events.standardEvents,
				touch = events.touchEvents;
			var element = events.element;
			element.off('mousedown', standard.down.callback);
			element.off('mousemove', standard.move.callback);
			element.off('mouseup', standard.up.callback);
		}

		function removeTouchEvents() {
			var events = this,
				standard = events.standardEvents,
				touch = events.touchEvents;
			var element = events.element;
			element.off('touchstart', touch.down.callback);
			element.off('touchmove', touch.move.callback);
			element.off('touchend', touch.up.callback);
		}

		function removeWheelEvents() {
			var events = this;
			var element = events.element;
			element.off('mousewheel', events.mouseEvents.wheel.callback);
		}

		function removeScrollEvents() {
			var events = this;
			var element = events.element;
			element.off('DOMMouseScroll', events.scrollEvents.wheel.callback);
		}

		// statics methods

		function getTouch(e, previous) {
			var point = new Point();
			if (e.type === 'touchstart' || e.type === 'touchmove' || e.type === 'touchend' || e.type === 'touchcancel') {
				var touch = null;
				var event = e.originalEvent ? e.originalEvent : e;
				var touches = event.touches.length ? event.touches : event.changedTouches;
				if (touches && touches.length) {
					touch = touches[0];
				}
				if (touch) {
					point.x = touch.pageX;
					point.y = touch.pageY;
				}
			} else if (e.type === 'click' || e.type === 'mousedown' || e.type === 'mouseup' || e.type === 'mousemove' || e.type === 'mouseover' || e.type === 'mouseout' || e.type === 'mouseenter' || e.type === 'mouseleave' || e.type === 'contextmenu') {
				point.x = e.pageX;
				point.y = e.pageY;
			}
			if (previous) {
				point.s = Point.difference(t, previous);
			}
			point.type = e.type;
			return point;
		}

		function getRelativeTouch(node, point) {
			node = angular.isArray(node) ? node[0] : node;
			return Point.difference(point, {
				x: node.offsetLeft,
				y: node.offsetTop
			});
		}

    }]);

	app.service('EventsService', ['Dom', function (Dom) {

		var service = this;

		var statics = {
			hasPassiveEvents: hasPassiveEvents,
			addEventListener: getAddEventListener(),
		};

		angular.extend(service, statics);

		// prevent history back on mac os

		preventHistoryNavigation();

		// static methods

		function hasPassiveEvents() {
			var supported = false;
			if (window.addEventListener) {
				try {
					var options = Object.defineProperty({}, 'passive', {
						get: function () {
							supported = true;
						},
					});
					window.addEventListener('test', null, options);
				} catch (e) {
					console.log('getAddEventListener.isSupprted', e);
				}
			}
			return supported;
		}

		function getAddEventListener() {
			var supported = hasPassiveEvents();
			if (!supported) {
				return;
			}

			var defaults = {
				passive: false,
				capture: false,
			};

			function getModifiedAddEventListener(original) {
				function addEventListener(type, listener, options) {
					if (typeof options !== 'object') {
						var capture = options === true;
						options = angular.copy(defaults);
						options.capture = capture;
					} else {
						options = angular.extend(angular.copy(defaults), options);
					}
					original.call(this, type, listener, options);
				}
				return addEventListener;
			}

			var original = EventTarget.prototype.addEventListener;
			var modified = getModifiedAddEventListener(original);
			EventTarget.prototype.addEventListener = modified;
			return modified;
		}

		function preventHistoryNavigation() {
			if (!Dom.ua.mac) {
				return;
			}
			if (Dom.ua.chrome || Dom.ua.safari || Dom.ua.firefox) {
				window.addEventListener('mousewheel', onScroll, {
					passive: false
				});
			}

			function onScroll(e) {
				if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
					return;
				}
				if (
					(e.deltaX < 0 && (Dom.getParents(e.target).filter(function (node) {
						return node.scrollLeft > 0;
					}).length === 0)) ||
					(e.deltaX > 0 && (Dom.getParents(e.target).filter(function (node) {
						return node.scrollWidth - node.scrollLeft > node.clientWidth;
					}).length === 0))
				) {
					e.preventDefault();
				}
			}
		}

    }]);

}());
/* global angular, app, Autolinker */
(function () {

	"use strict";

	var app = angular.module('artisan');

	app.filter('notIn', ['$filter', function ($filter) {
		return function (array, filters, element) {
			if (filters) {
				return $filter("filter")(array, function (item) {
					for (var i = 0; i < filters.length; i++) {
						if (filters[i][element] === item[element]) return false;
					}
					return true;
				});
			}
		};
    }]);

	app.filter('autolink', [function () {
		return function (value) {
			return Autolinker.link(value, {
				className: "a-link"
			});
		};
    }]);

	app.filter('shortName', ['$filter', function ($filter) {
		function toTitleCase(str) {
			return str.replace(/\w\S*/g, function (txt) {
				return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
			});
		}
		return function (value) {
			if (!value) {
				return '';
			}
			if (value.indexOf(' .') === value.length - 2) {
				value = value.split(' .').join('');
			}
			/*
			var splitted;
			if (value.indexOf('.') !== -1) {
			    splitted = value.split('.');
			} else {
			    splitted = value.split(' ');
			}
			*/
			var splitted = value.split(' ');
			var firstName = splitted.shift();
			if (splitted.length) {
				var lastName = splitted.join(' ');
				return firstName.substr(0, 1).toUpperCase() + '.' + toTitleCase(lastName);
			} else {
				return firstName;
			}
		};
    }]);

	app.filter('customCurrency', ['$filter', function ($filter) {
		var legacyFilter = $filter('currency');
		return function (cost, currency) {
			return legacyFilter(cost * currency.ratio, currency.formatting);
		};
    }]);

	app.filter('customSize', ['APP', function (APP) {
		return function (inches) {
			if (APP.unit === APP.units.IMPERIAL) {
				var feet = Math.floor(inches / 12);
				inches = inches % 12;
				inches = Math.round(inches * 10) / 10;
				return (feet ? feet + '\' ' : '') + (inches + '\'\'');
			} else {
				var meters = Math.floor(inches * APP.size.ratio);
				var cm = (inches * APP.size.ratio * 100) % 100;
				cm = Math.round(cm * 10) / 10;
				return (meters ? meters + 'm ' : '') + (cm + 'cm');
			}
		};
    }]);

	app.filter('customWeight', ['APP', function (APP) {
		return function (pounds) {
			if (APP.unit === APP.units.IMPERIAL) {
				if (pounds < 1) {
					var oz = pounds * 16;
					oz = Math.round(oz * 10) / 10;
					return (oz ? oz + 'oz ' : '');
				} else {
					pounds = Math.round(pounds * 100) / 100;
					return (pounds ? pounds + 'lb ' : '');
				}
			} else {
				var kg = Math.floor(pounds * APP.weight.ratio / 1000);
				var grams = (pounds * APP.weight.ratio) % 1000;
				grams = Math.round(grams * 10) / 10;
				return (kg ? kg + 'kg ' : '') + (grams + 'g');
			}
		};
    }]);

	app.filter('customNumber', ['$filter', function ($filter) {
		return function (value, precision, unit) {
			unit = unit || '';
			// return ((value || value === 0) ? $filter('number')(value, precision) + unit : '-');
			if (value !== undefined) {
				if (Math.floor(value) === value) {
					precision = 0;
				}
				value = $filter('number')(value, precision) + unit;
			} else {
				value = '-';
			}
			return value;
		};
    }]);

	app.filter('reportNumber', ['$filter', function ($filter) {
		return function (value, precision, unit) {
			unit = unit || '';
			if (value !== undefined) {
				value = $filter('number')(value, precision) + unit;
			} else {
				value = '-';
			}
			return value;
		};
    }]);

	app.filter('customHours', [function () {
		return function (value) {
			if (value !== undefined) {
				var hours = Math.floor(value);
				var minutes = Math.floor((value - hours) * 60);
				var label = hours ? hours + ' H' : '';
				label += minutes ? ' ' + minutes + ' m' : '';
				return label;
			} else {
				return '-';
			}
		};
    }]);

	app.filter('customTimer', [function () {
		var second = 1000;
		var minute = second * 60;
		var hour = minute * 60;
		return function (value) {
			if (value !== undefined) {
				var hours = Math.floor(value / hour);
				var minutes = Math.floor((value - hours * hour) / minute);
				var seconds = Math.floor((value - hours * hour - minutes * minute) / second);
				var label = hours ? hours + ' H' : '';
				label += minutes ? ' ' + minutes + ' m' : '';
				label += seconds ? ' ' + seconds + ' s' : '';
				return label;
			} else {
				return '-';
			}
		};
    }]);

	app.filter('customDigitalTimer', [function () {
		var second = 1000;
		var minute = second * 60;
		var hour = minute * 60;
		return function (value) {
			if (value !== undefined) {
				var hours = Math.floor(value / hour);
				var minutes = Math.floor((value - hours * hour) / minute);
				var seconds = Math.floor((value - hours * hour - minutes * minute) / second);
				// hours = hours % 24;
				return (hours < 10 ? '0' : '') + hours + ':' + (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
			} else {
				return '-';
			}
		};
    }]);

	app.filter('customDigitalTime', [function () {
		var second = 1000;
		var minute = second * 60;
		var hour = minute * 60;
		return function (value) {
			if (value !== undefined) {
				var hours = Math.floor(value / hour);
				var minutes = Math.floor((value - hours * hour) / minute);
				// hours = hours % 24;
				return (hours < 10 ? '0' : '') + hours + ':' + (minutes < 10 ? '0' : '') + minutes;
			} else {
				return '-';
			}
		};
    }]);

	app.filter('isoWeek', [function () {
		// getWeek() was developed by Nick Baicoianu at MeanFreePath: http://www.epoch-calendar.com
		return function (value, offsetDays) {
			if (value) {
				value = new Date(value);
				offsetDays = offsetDays || 0; // default offsetDays to zero
				var startingDayOfWeek = 4; // first week of year with thursday;
				var firstDayOfYear = new Date(value.getFullYear(), 0, 1);
				var dayOfWeek = firstDayOfYear.getDay() - offsetDays; // the day of week the year begins on
				dayOfWeek = (dayOfWeek >= 0 ? dayOfWeek : dayOfWeek + 7);
				var dayOfYear = Math.floor((value.getTime() - firstDayOfYear.getTime() - (value.getTimezoneOffset() - firstDayOfYear.getTimezoneOffset()) * 60000) / 86400000) + 1;
				var week;
				// if the year starts before the middle of a week
				if (dayOfWeek < startingDayOfWeek) {
					week = Math.floor((dayOfYear + dayOfWeek - 1) / 7) + 1;
					if (week > 52) {
						var firstDayOfNextYear = new Date(value.getFullYear() + 1, 0, 1);
						dayOfWeek = firstDayOfNextYear.getDay() - offsetDays;
						dayOfWeek = (dayOfWeek >= 0 ? dayOfWeek : dayOfWeek + 7);
						// if the next year starts before the middle of the week, it is week #1 of that year
						week = dayOfWeek < startingDayOfWeek ? 1 : 53;
					}
				} else {
					week = Math.floor((dayOfYear + dayOfWeek - 1) / 7);
				}
				return week < 10 ? '0' + week : week; // padded
			} else {
				return '-';
			}
		};
    }]);

	app.filter('customDate', ['$filter', function ($filter) {
		var filter = $filter('date');
		return function (value, format, timezone) {
			return value ? filter(value, format, timezone) : '-';
		};
    }]);

	app.filter('customTime', ['$filter', function ($filter) {
		return function (value, placeholder) {
			if (value) {
				return Utils.parseTime(value);
			} else {
				return (placeholder ? placeholder : '-');
			}
		};
    }]);

	app.filter('customDigital', ['$filter', function ($filter) {
		return function (value, placeholder) {
			if (value) {
				return Utils.parseHour(value);
			} else {
				return (placeholder ? placeholder : '-');
			}
		};
    }]);

	app.filter('customString', ['$filter', function ($filter) {
		return function (value, placeholder) {
			return value ? value : (placeholder ? placeholder : '-');
		};
    }]);

	app.filter('customEnum', function () {
		return function (val) {
			val = val + 1;
			return val < 10 ? '0' + val : val;
		};
	});

	app.filter('groupBy', ['$parse', 'filterWatcher', function ($parse, filterWatcher) {
		function _groupBy(collection, getter) {
			var dict = {};
			var key;
			angular.forEach(collection, function (item) {
				key = getter(item);
				if (!dict[key]) {
					dict[key] = [];
				}
				dict[key].push(item);
			});
			return dict;
		}
		return function (collection, property) {
			if (!angular.isObject(collection) || angular.isUndefined(property)) {
				return collection;
			}
			return filterWatcher.isMemoized('groupBy', arguments) || filterWatcher.memoize('groupBy', arguments, this, _groupBy(collection, $parse(property)));
		};
    }]);

	app.filter('htmlToPlaintext', function () {
		function getStyle(n, p) {
			return n.currentStyle ? n.currentStyle[p] : window.getComputedStyle(n, null).getPropertyValue(p);
		}

		function toText(node) {
			var result = '';
			if (node.nodeType == document.TEXT_NODE) {
				var nodeValue = node.nodeValue;
				result = nodeValue;
				result = result ? String(result).replace(/</gm, '&lt;') : '';
				result = result ? String(result).replace(/>/gm, '&gt;') : '';
			} else if (node.nodeType == document.ELEMENT_NODE) {
				for (var i = 0, j = node.childNodes.length; i < j; i++) {
					result += toText(node.childNodes[i]);
				}
				var display = getStyle(node, 'display');
				if (display.match(/^block/) || display.match(/list/) || display.match(/row/) || node.tagName == 'BR' || node.tagName == 'HR') {
					result += '\n<br>';
				}
			}
			return result;
		}
		return function (html) {
			console.log(html);
			var div = document.createElement('div');
			div.innerHTML = html;
			return toText(div);
			// return html ? String(html).replace(/<[^>]+>/gm, '') : '';
		};
	});

}());
/* global angular, firebase */

(function () {
	"use strict";

	var app = angular.module('artisan');

	app.factory('Point', [function () {

		function Point(x, y) {
			this.x = x || 0;
			this.y = y || 0;
		}

		var statics = {
			difference: PointDifference,
			multiply: PointMultiply,
		};

		var publics = {
			clone: clone,
			copy: copy,
			difference: difference,
			mult: mult,
			offset: offset,
			setPos: setPos,
			setX: setX,
			setY: setY,
			toString: toString,
		};

		angular.extend(Point, statics);
		angular.extend(Point.prototype, publics);

		return Point;

		// static methods

		function PointDifference(a, b) {
			return new Point(a.x - b.x, a.y - b.y);
		}

		function PointMultiply(point, value) {
			point.x *= value;
			point.y *= value;
			return point;
		}

		// prototype methods

		function clone() {
			return new Point(this.x, this.y);
		}

		function copy(point) {
			this.x = point.x;
			this.y = point.y;
			return this;
		}

		function difference(b) {
			return PointDifference(this, b);
		}

		function mult(value) {
			return PointMultiply(this, value);
		}

		function offset(x, y) {
			this.x += x;
			this.y += y;
			return this;
		}

		function setPos(x, y) {
			this.x = x;
			this.y = y;
			return this;
		}

		function setX(x) {
			this.x = x;
			return this;
		}

		function setY(y) {
			this.y = y;
			return this;
		}

		function toString() {
			return '{' + this.x + ',' + this.y + '}';
		}

    }]);

}());
/* global angular, firebase */

(function () {
	"use strict";

	var app = angular.module('artisan');

	app.factory('Rect', [function () {

		function Rect(x, y, w, h) {
			this.x = x || 0;
			this.y = y || 0;
			this.w = w || 0;
			this.h = h || 0;
		}

		var statics = {
			mult: RectMultiply,
		};

		var publics = {
			bottom: bottom,
			bottomLeft: bottomLeft,
			bottomRight: bottomRight,
			center: center,
			clone: clone,
			copy: copy,
			expand: expand,
			expandRect: expandRect,
			intersect: intersect,
			left: left,
			mult: mult,
			offset: offset,
			reduce: reduce,
			reduceRect: reduceRect,
			right: right,
			setH: setH,
			setPos: setPos,
			setSize: setSize,
			setX: setX,
			setY: setY,
			setW: setW,
			top: top,
			topLeft: topLeft,
			topRight: topRight,
			toString: toString,
		};

		angular.extend(Rect, statics);
		angular.extend(Rect.prototype, publics);

		return Rect;

		// static methods

		function RectMultiply(rect, value) {
			rect.x *= value;
			rect.y *= value;
			rect.w *= value;
			rect.h *= value;
			return rect;
		}

		// prototype methods

		function bottom() {
			var x = this.x,
				y = this.y,
				w = this.w,
				h = this.h;
			return {
				x: x + w / 2,
				y: y + h
			};
		}

		function bottomLeft() {
			var x = this.x,
				y = this.y,
				w = this.w,
				h = this.h;
			return {
				x: x,
				y: y + h
			};
		}

		function bottomRight() {
			var x = this.x,
				y = this.y,
				w = this.w,
				h = this.h;
			return {
				x: x + w,
				y: y + h
			};
		}

		function center() {
			var x = this.x,
				y = this.y,
				w = this.w,
				h = this.h;
			return {
				x: x + w / 2,
				y: y + h / 2
			};
		}

		function clone() {
			return new Rect(this.x, this.y, this.w, this.h);
		}

		function copy(rect) {
			this.x = rect.x;
			this.y = rect.y;
			this.w = rect.w;
			this.h = rect.h;
			return this;
		}

		function expand(size) {
			return this.expandRect({
				x: size,
				y: size,
				w: size * 2,
				h: size * 2
			});
		}

		function expandRect(rect) {
			this.x -= rect.x || 0;
			this.y -= rect.y || 0;
			this.w += rect.w || 0;
			this.h += rect.h || 0;
			return this;
		}

		function intersect(rect) {
			var x = this.x,
				y = this.y,
				w = this.w,
				h = this.h;
			return !(rect.x > x + w || rect.x + rect.w < x || rect.y > y + h || rect.y + rect.h < y);
		}

		function left() {
			var x = this.x,
				y = this.y,
				w = this.w,
				h = this.h;
			return {
				x: x,
				y: y + h / 2
			};
		}

		function mult(value) {
			return RectMultiply(this, value);
		}

		function offset(x, y) {
			this.x += x;
			this.y += y;
			return this;
		}

		function reduce(size) {
			return this.offset(-size);
		}

		function reduceRect(rect) {
			return this.offsetRect(RectMultiply(rect, -1));
		}

		function right() {
			var x = this.x,
				y = this.y,
				w = this.w,
				h = this.h;
			return {
				x: x + w,
				y: y + h / 2
			};
		}

		function setH(h) {
			this.h = h;
			return this;
		}

		function setPos(x, y) {
			this.x = x;
			this.y = y;
			return this;
		}

		function setSize(w, h) {
			this.w = w;
			this.h = h;
			return this;
		}

		function setX(x) {
			this.x = x;
			return this;
		}

		function setY(y) {
			this.y = y;
			return this;
		}

		function setW(w) {
			this.w = w;
			return this;
		}

		function top() {
			var x = this.x,
				y = this.y,
				w = this.w,
				h = this.h;
			return {
				x: x + w / 2,
				y: y
			};
		}

		function topLeft() {
			var x = this.x,
				y = this.y,
				w = this.w,
				h = this.h;
			return {
				x: x,
				y: y
			};
		}

		function topRight() {
			var x = this.x,
				y = this.y,
				w = this.w,
				h = this.h;
			return {
				x: x + w,
				y: y
			};
		}

		function toString() {
			return '{' + this.x + ',' + this.y + ',' + this.w + ',' + this.h + '}';
		}

    }]);

}());
/* global angular, firebase */

(function () {
	"use strict";

	var app = angular.module('artisan');

	app.factory('Vector', function () {
		function Vector(x, y) {
			this.x = x || 0;
			this.y = y || 0;
		}

		var statics = {
			cross: VectorCross,
			difference: VectorDifference,
			distance: VectorDistance,
			incidence: VectorIncidence,
			make: VectorMake,
			normalize: VectorNormalize,
			power: VectorPower,
			size: VectorSize,
		};

		var publics = {
			add: add,
			copy: copy,
			cross: cross,
			difference: difference,
			distance: distance,
			friction: friction,
			incidence: incidence,
			normalize: normalize,
			power: power,
			size: size,
			towards: towards,
			toString: toString,
		};

		angular.extend(Vector, statics);
		angular.extend(Vector.prototype, publics);

		return Vector;

		// statics methods

		function VectorCross(a, b) {
			return (a.x * b.y) - (a.y * b.x);
		}

		function VectorDifference(a, b) {
			return new Vector(a.x - b.x, a.y - b.y);
		}

		function VectorDistance(a, b) {
			return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
		}

		function VectorIncidence(a, b) {
			var angle = Math.atan2(b.y, b.x) - Math.atan2(a.y, a.x);
			return angle;
		}

		function VectorMake(a, b) {
			return new Vector(b.x - a.x, b.y - a.y);
		}

		function VectorNormalize(a) {
			var l = Vector.size(a);
			a.x /= l;
			a.y /= l;
			return a;
		}

		function VectorPower(a, b) {
			var x = Math.abs(b.x - a.x);
			var y = Math.abs(b.y - a.y);
			return (x + y) / 2;
		}

		function VectorSize(a) {
			return Math.sqrt(a.x * a.x + a.y * a.y);
		}

		// prototype methods

		function add(b) {
			this.x += b.x;
			this.y += b.y;
			return this;
		}

		function copy(b) {
			return new Vector(this.x, this.y);
		}

		function cross(b) {
			return VectorCross(this, b);
		}

		function difference(b) {
			return VectorDifference(this, b);
		}

		function distance(b) {
			return VectorDistance(this, b);
		}

		function friction(b) {
			this.x *= b;
			this.y *= b;
			return this;
		}

		function incidence(b) {
			return VectorIncidence(this, b);
		}

		function normalize() {
			return VectorNormalize(this);
		}

		function power() {
			return (Math.abs(this.x) + Math.abs(this.y)) / 2;
		}

		function size() {
			return VectorSize(this);
		}

		function towards(b, friction) {
			friction = friction || 0.125;
			this.x += (b.x - this.x) * friction;
			this.y += (b.y - this.y) * friction;
			return this;
		}

		function toString() {
			return '{' + this.x + ',' + this.y + '}';
		}

	});

}());
/* global angular */

(function () {
	"use strict";

	var app = angular.module('artisan');

	app.factory('Hash', [function () {

		function Hash(key, pool) {
			key = key || 'id';
			pool = pool ? HashGet(pool) : {};
			Object.defineProperties(this, {
				key: {
					value: key,
					enumerable: false,
					writable: false
				},
				pool: {
					value: pool,
					enumerable: false,
					writable: false
				},
				length: {
					value: 0,
					enumerable: false,
					writable: true
				}
			});
		}

		var pools = {};

		var statics = {
			get: HashGet,
		};

		var publics = {
			has: has,
			getId: getId,
			get: get,
			set: set,
			once: once,
			add: add,
			remove: remove,
			each: each,
			addMany: addMany,
			removeMany: removeMany,
			removeAll: removeAll,
			forward: forward,
			backward: backward,
			differs: differs,
			updatePool: updatePool,
		};

		Hash.prototype = new Array;

		angular.extend(Hash, statics);
		angular.extend(Hash.prototype, publics);

		return Hash;

		// static methods

		function HashGet(pool) {
			return (pools[pool] = pools[pool] || {});
		}

		function has(id) {
			return this.pool[id] !== undefined;
		}

		function getId(id) {
			return this.pool[id];
		}

		function get(item) {
			var hash = this,
				key = this.key;
			return item ? hash.getId(item[key]) : null;
		}

		function set(item) {
			var hash = this,
				pool = this.pool,
				key = this.key;
			pool[item[key]] = item;
			hash.push(item);
			return item;
		}

		function once(newItem, callback) {
			var hash = this;
			var item = hash.get(newItem);
			if (!item) {
				item = hash.set(newItem);
			} else if (typeof callback == 'function') {
				callback(item);
			}
			return item;
		}

		function add(newItem) {
			var hash = this;
			var item = hash.get(newItem);
			if (item) {
				for (var i = 0, keys = Object.keys(newItem), p; i < keys.length; i++) {
					p = keys[i];
					item[p] = newItem[p];
				}
			} else {
				item = hash.set(newItem);
			}
			return item;
		}

		function remove(oldItem) {
			var hash = this,
				pool = this.pool,
				key = this.key;
			var item = hash.get(oldItem);
			if (item) {
				var index = hash.indexOf(item);
				if (index !== -1) {
					hash.splice(index, 1);
				}
				delete pool[item[key]];
			}
			return hash;
		}

		function addMany(items) {
			var hash = this;
			if (!items) {
				return hash;
			}
			var i = 0;
			while (i < items.length) {
				hash.add(items[i]);
				i++;
			}
			return hash;
		}

		function removeMany(items) {
			var hash = this;
			if (!items) {
				return hash;
			}
			var i = 0;
			while (i < items.length) {
				hash.remove(items[i]);
				i++;
			}
			return hash;
		}

		function removeAll() {
			var hash = this,
				key = hash.key,
				pool = hash.pool;
			var i = 0,
				t = hash.length,
				item;
			while (hash.length) {
				item = hash.shift();
				delete pool[item[key]];
				i++;
			}
			return hash;
		}

		function each(callback) {
			var hash = this;
			if (callback) {
				var i = 0;
				while (i < hash.length) {
					callback(hash[i], i);
					i++;
				}
			}
			return hash;
		}

		function forward(key, reverse) {
			var hash = this;
			key = (key || this.key);
			hash.sort(function (c, d) {
				var a = reverse ? d : c;
				var b = reverse ? c : d;
				return a[key] - b[key];
			});
			return hash;
		}

		function backward(key) {
			return this.forward(key, true);
		}

		function differs(hash) {
			if (hash.key !== this.key || hash.length !== this.length) {
				return true;
			} else {
				var differs = false,
					i = 0,
					t = this.length,
					key = this.key;
				while (differs && i < t) {
					differs = this[i][key] !== hash[i][key];
					i++;
				}
			}
		}

		function updatePool() {
			var hash = this,
				pool = this.pool,
				key = this.key;
			Object.keys(pool).forEach(function (key) {
				delete pool[key];
			});
			angular.forEach(hash, function (item) {
				pool[item[key]] = item;
			});
		}

    }]);

}());
/* global angular */

(function () {
	"use strict";

	var app = angular.module('artisan');

	app.factory('$promise', ['$q', function ($q) {

		function $promise(callback) {
			if (typeof callback !== 'function') {
				throw ('promise resolve callback missing');
			}
			var deferred = $q.defer();
			callback(deferred);
			return deferred.promise;
		}

		var statics = {
			all: $promiseAll,
		};

		var publics = {};

		angular.extend($promise, statics);
		angular.extend($promise.prototype, publics);

		return $promise;

		function $promiseAll(promises) {
			return $q.all(promises);
		}

    }]);

}());
/* global angular */

(function() {
    "use strict";

    var app = angular.module('artisan');

    app.factory('State', ['$timeout', '$rootScope', function($timeout, $rootScope) {

        function State() {
            this.idle();
        }

        var DELAY = 2000;

        var statics = {};

        var publics = {
            busy: busy,
            classes: classes,
            enabled: enabled,
            error: error,
            errorMessage: errorMessage,
            errors: [],
            idle: idle,
            labels: labels,
            ready: ready,
            submitClass: submitClass,
            success: success,
        };

        angular.extend(State, statics);
        angular.extend(State.prototype, publics);

        return State;

        // static methods

        // publics methods

        function busy() {
            var state = this;
            if (!state.isBusy) {
                state.isBusy = true;
                state.isError = false;
                state.isErroring = false;
                state.isSuccess = false;
                state.isSuccessing = false;
                state.errors = [];
                return true;
            } else {
                return false;
            }
        }

        function classes(addons) {
            var state = this,
                classes = null;
            classes = {
                ready: state.isReady,
                busy: state.isBusy,
                successing: state.isSuccessing,
                success: state.isSuccess,
                errorring: state.isErroring,
                error: state.isError,
            };
            if (addons) {
                angular.forEach(addons, function(value, key) {
                    classes[value] = classes[key];
                });
            }
            return classes;
        }

        function enabled() {
            var state = this;
            return !state.isBusy && !state.isErroring && !state.isSuccessing;
        }

        function error(error) {
            console.log('State.error', error);
            var state = this;
            state.isBusy = false;
            state.isError = true;
            state.isErroring = true;
            state.isSuccess = false;
            state.isSuccessing = false;
            state.errors.push(error);
            $timeout(function() {
                state.isErroring = false;
            }, DELAY);
        }

        function errorMessage() {
            var state = this;
            return state.isError ? state.errors[state.errors.length - 1] : null;
        }

        function idle() {
            var state = this;
            state.isBusy = false;
            state.isError = false;
            state.isErroring = false;
            state.isSuccess = false;
            state.isSuccessing = false;
            state.button = null;
            state.errors = [];
        }

        function labels(addons) {
            var state = this;
            var defaults = {
                ready: 'submit',
                busy: 'sending',
                error: 'error',
                success: 'success',
            };
            if (addons) {
                angular.extend(defaults, addons);
            }
            var label = defaults.ready;
            if (state.isBusy) {
                label = defaults.busy;
            } else if (state.isSuccess) {
                label = defaults.success;
            } else if (state.isError) {
                label = defaults.error;
            }
            return label;
        }

        function ready() {
            var state = this;
            state.idle();
            state.isReady = true;
            $rootScope.$broadcast('$stateReady', state);
        }

        function submitClass() {
            var state = this;
            return {
                busy: state.isBusy,
                ready: state.isReady,
                successing: state.isSuccessing,
                success: state.isSuccess,
                errorring: state.isErroring,
                error: state.isError,
            };
        }

        function success() {
            var state = this;
            state.isBusy = false;
            state.isError = false;
            state.isErroring = false;
            state.isSuccess = true;
            state.isSuccessing = true;
            state.errors = [];
            $timeout(function() {
                state.isSuccessing = false;
            }, DELAY);
        }

    }]);

}());
/* global angular */

(function () {
	"use strict";

	var transformProperty = detectTransformProperty();

	var app = angular.module('artisan');

	app.factory('Style', [function () {

		function Style() {
			this.props = {
				scale: 1,
				hoverScale: 1,
				currentScale: 1,
			};
		}

		var statics = {};

		var publics = {
			set: set,
			transform: transform,
			transformOrigin: transformOrigin,
		};

		angular.extend(Style, statics);
		angular.extend(Style.prototype, publics);

		return Style;

		// static methods

		// prototype methods

		function set(element) {
			var styles = [];
			for (var key in this) {
				if (key !== 'props') {
					styles.push(key + ':' + this[key]);
				}
			}
			element.style.cssText = styles.join(';') + ';';
		}

		function transform(transform) {
			this[transformProperty] = transform;
		}

		function transformOrigin(x, y) {
			this[transformProperty + '-origin-x'] = (Math.round(x * 1000) / 1000) + '%';
			this[transformProperty + '-origin-y'] = (Math.round(y * 1000) / 1000) + '%';
		}

    }]);

	function detectTransformProperty() {
		var transformProperty = 'transform',
			safariPropertyHack = 'webkitTransform';
		var div = document.createElement("DIV");
		if (typeof div.style[transformProperty] !== 'undefined') {
            ['webkit', 'moz', 'o', 'ms'].every(function (prefix) {
				var e = '-' + prefix + '-transform';
				if (typeof div.style[e] !== 'undefined') {
					transformProperty = e;
					return false;
				}
				return true;
			});
		} else if (typeof div.style[safariPropertyHack] !== 'undefined') {
			transformProperty = '-webkit-transform';
		} else {
			transformProperty = undefined;
		}
		return transformProperty;
	}

}());
/* global angular */

(function () {
	"use strict";

	var app = angular.module('artisan');

	app.service('Utils', ['$compile', '$controller', 'Vector', function ($compile, $controller, Vector) {

		var service = this;

		var statics = {
			compileController: compileController,
			extract: extract,
			format: format,
			indexOf: indexOf,
			reducer: reducer,
			reducerAdder: reducerAdder,
			reducerSetter: reducerSetter,
			removeValue: removeValue,
			reverseSortOn: reverseSortOn,
			throttle: throttle,
			toMd5: toMd5,
			where: where,
		};

		angular.extend(service, statics);

		var getNow = Date.now || function () {
			return new Date().getTime();
		};

		function compileController(scope, element, html, data) {
			// console.log('Utils.compileController', element);
			element.html(html);
			var link = $compile(element.contents());
			if (data.controller) {
				var $scope = scope.$new();
				angular.extend($scope, data);
				var controller = $controller(data.controller, {
					$scope: $scope
				});
				if (data.controllerAs) {
					scope[data.controllerAs] = controller;
				}
				element.data('$ngControllerController', controller);
				element.children().data('$ngControllerController', controller);
				scope = $scope;
			}
			link(scope);
		}

		function extract(obj, value) {
			return Object.keys(obj)[Object.values(obj).indexOf(value)];
		}

		function format(string, prepend, expression) {
			string = string || '';
			prepend = prepend || '';
			var splitted = string.split(',');
			if (splitted.length > 1) {
				var formatted = splitted.shift();
				angular.forEach(splitted, function (value, index) {
					if (expression) {
						formatted = formatted.split('{' + index + '}').join('\' + ' + prepend + value + ' + \'');
					} else {
						formatted = formatted.split('{' + index + '}').join(prepend + value);
					}
				});
				if (expression) {
					return '\'' + formatted + '\'';
				} else {
					return formatted;
				}
			} else {
				return prepend + string;
			}
		}

		function indexOf(array, object, key) {
			key = key || 'id';
			var index = -1;
			if (array) {
				var i = 0,
					t = array.length;
				while (i < t) {
					if (array[i] && array[i][key] === object[key]) {
						index = i;
						break;
					}
					i++;
				}
			}
			return index;
		}

		function reducer(o, key) {
			return o[key];
		}

		function reducerAdder(o, key, value) {
			if (typeof key == 'string') {
				return reducerAdder(o, key.split('.'), value);
			} else if (key.length == 1 && value !== undefined) {
				return (o[key[0]] += value);
			} else if (key.length === 0) {
				return o;
			} else {
				return reducerAdder(o[key[0]], key.slice(1), value);
			}
		}

		function reducerSetter(o, key, value) {
			if (typeof key == 'string') {
				return reducerSetter(o, key.split('.'), value);
			} else if (key.length == 1 && value !== undefined) {
				return (o[key[0]] = value);
			} else if (key.length === 0) {
				return o;
			} else {
				return reducerSetter(o[key[0]], key.slice(1), value);
			}
		}

		function removeValue(array, value) {
			var index = -1;
			if (array) {
				var i = 0,
					t = array.length;
				while (i < t) {
					if (array[i] === value) {
						index = i;
						break;
					}
					i++;
				}
			}
			if (index !== -1) {
				array.splice(index, 1);
				return value;
			} else {
				return null;
			}
		}

		function reverseSortOn(key) {
			return function (a, b) {
				if (a[key] < b[key]) {
					return 1;
				}
				if (a[key] > b[key]) {
					return -1;
				}
				// a must be equal to b
				return 0;
			};
		}

		function throttle(func, wait, options) {
			// Returns a function, that, when invoked, will only be triggered at most once
			// during a given window of time. Normally, the throttled function will run
			// as much as it can, without ever going more than once per `wait` duration;
			// but if you'd like to disable the execution on the leading edge, pass
			// `{leading: false}`. To disable execution on the trailing edge, ditto.
			var context, args, result;
			var timeout = null;
			var previous = 0;
			if (!options) options = {};
			var later = function () {
				previous = options.leading === false ? 0 : getNow();
				timeout = null;
				result = func.apply(context, args);
				if (!timeout) context = args = null;
			};
			return function () {
				var now = getNow();
				if (!previous && options.leading === false) previous = now;
				var remaining = wait - (now - previous);
				context = this;
				args = arguments;
				if (remaining <= 0 || remaining > wait) {
					if (timeout) {
						clearTimeout(timeout);
						timeout = null;
					}
					previous = now;
					result = func.apply(context, args);
					if (!timeout) context = args = null;
				} else if (!timeout && options.trailing !== false) {
					timeout = setTimeout(later, remaining);
				}
				return result;
			};
		}

		function toMd5(string) {
			// return Md5.encode(string);
		}

		function where(array, query) {
			var found = null;
			if (array) {
				angular.forEach(array, function (item) {
					var has = true;
					angular.forEach(query, function (value, key) {
						has = has && item[key] === value;
					});
					if (has) {
						found = item;
					}
				});
			}
			return found;
		}

    }]);

	(function () {
		// POLYFILL Array.prototype.reduce
		// Production steps of ECMA-262, Edition 5, 15.4.4.21
		// Reference: http://es5.github.io/#x15.4.4.21
		// https://tc39.github.io/ecma262/#sec-array.prototype.reduce
		if (typeof Array.prototype.reduce !== 'function') {
			Object.defineProperty(Array.prototype, 'reduce', {
				value: function (callback) { // , initialvalue
					if (this === null) {
						throw new TypeError('Array.prototype.reduce called on null or undefined');
					}
					if (typeof callback !== 'function') {
						throw new TypeError(callback + ' is not a function');
					}
					var o = Object(this);
					var len = o.length >>> 0;
					var k = 0;
					var value;
					if (arguments.length == 2) {
						value = arguments[1];
					} else {
						while (k < len && !(k in o)) {
							k++;
						}
						if (k >= len) {
							throw new TypeError('Reduce of empty array with no initial value');
						}
						value = o[k++];
					}
					while (k < len) {
						if (k in o) {
							value = callback(value, o[k], k, o);
						}
						k++;
					}
					return value;
				}
			});
		}
	}());

	(function () {
		// POLYFILL Object.values
		if (typeof Object.values !== 'function') {
			Object.defineProperty(Object, 'values', {
				value: function (obj) {
					var vals = [];
					for (var key in obj) {
						if (has(obj, key) && isEnumerable(obj, key)) {
							vals.push(obj[key]);
						}
					}
					return vals;
				}
			});
		}
	}());

}());
/* global angular */

(function() {
    "use strict";

    var app = angular.module('artisan');

    app.provider('environment', ['$locationProvider', '$httpProvider', function($locationProvider, $httpProvider) {

        var provider = this;

        var statics = {
            add: EnvironmentAdd,
            use: EnvironmentUse,
        };

        angular.extend(provider, statics);

        var defaults = {
            plugins: {
                facebook: {
                    fields: 'id,name,first_name,last_name,email,gender,picture,cover,link',
                    scope: 'public_profile, email', // publish_stream
                    version: 'v2.10',
                },
                google: {},
                googlemaps: {
                    clusterer: true,
                    styles: '/googlemaps/applemapesque.json',
                    options: {
                        center: {
                            lat: 43.9023386,
                            lng: 12.8505094
                        },
                        disableDefaultUI: true,
                        mapTypeId: 'roadmap', // "hybrid", "roadmap", "satellite", "terrain"
                        scrollwheel: true,
                        // tilt: 0, // 45
                        zoom: 4.0,
                    },
                },
                mapbox: {
                    clusterer: true,
                    options: {
                        bearing: 0.0,
                        center: [
                            12.8505094,
                            43.9023386
                        ],
                        curve: 1,
                        pitch: 0.0,
                        speed: 1.5,
                        zoom: 4.0,
                    },
                    version: 'v0.42.0',
                }
            },
            http: {
                interceptors: [], // ['AuthService'],
                withCredentials: false,
            },
            language: {
                code: 'en',
                culture: 'en_US',
                iso: 'ENU',
                name: 'English',
            },
            location: {
                hash: '!',
                html5: false,
            },
            paths: {},
        };

        var global = {};

        if (window.environment) {
            angular.merge(global, window.environment);
        }

        var config = {};

        var environment = angular.copy(defaults);
        angular.merge(environment, global);

        function EnvironmentSetHttp() {
            $httpProvider.defaults.headers.common["Accept-Language"] = environment.language.code;
            $httpProvider.defaults.withCredentials = environment.http.withCredentials;
            $httpProvider.interceptors.push.apply($httpProvider.interceptors, environment.http.interceptors);
        }

        function EnvironmentSetLocation() {
            $locationProvider.html5Mode(environment.location.html5);
            $locationProvider.hashPrefix(environment.location.hash);
        }

        function EnvironmentAdd(key, data) {
            config[key] = config[key] ? angular.merge(config[key], data) : data;
            EnvironmentSet();
        }

        function EnvironmentSet() {
            environment = angular.copy(defaults);
            if (config.environment) {
                angular.merge(environment, config.environment);
            }
            var value = EnvironmentGet();
            if (value) {
                angular.merge(environment, value);
            }
            angular.merge(environment, global);
            EnvironmentSetHttp();
            EnvironmentSetLocation();
        }

        function EnvironmentUse(key) {
            if (config[key]) {
                environment = angular.copy(defaults);
                angular.merge(environment, config[key]);
                angular.merge(environment, global);
                EnvironmentSetHttp();
                EnvironmentSetLocation();
            }
        }

        function EnvironmentGet() {
            for (var key in config) {
                var value = config[key];
                if (value.paths && window.location.href.indexOf(value.paths.app) !== -1) {
                    return value;
                }
            }
        }

        provider.$get = function() {
            return environment;
        };

    }]);

}());
/* global angular */

(function () {
	"use strict";

	var app = angular.module('artisan');

	app.factory('Doc', ['Api', '$promise', function (Api, $promise) {

		function Doc(item) {
			if (item) {
				angular.extend(this, item);
			}
		}

		var statics = {};

		var publics = {};

		angular.extend(Doc, statics);
		angular.extend(Doc.prototype, publics);

		return Doc;

		// static methods

		// prototype methods

    }]);

}());
/* global angular */

(function () {
	"use strict";

	var app = angular.module('artisan');

	app.factory('Route', ['$promise', '$location', '$route', '$routeParams', 'Router', function ($promise, $location, $route, $routeParams, Router) {

		function Route(current) {

			var route = {
				controller: current.$$route.controller,
				params: current.params,
				path: $location.path(),
				pathParams: current.pathParams,
				originalPath: current.$$route.originalPath,
				templateUrl: current.loadedTemplateUrl,
			};
			angular.extend(this, route);
		}

		var statics = {
			current: RouteCurrent,
		};

		var publics = {};

		angular.extend(Route, statics);
		angular.extend(Route.prototype, publics);

		return Route;

		// static methods

		function RouteCurrent() {
			return new Route($route.current);
		}

		// prototype methods

    }]);

}());
/* global angular */

(function() {
    "use strict";

    var app = angular.module('artisan');

    app.factory('View', ['Api', '$promise', 'environment', 'Doc', 'Route', function(Api, $promise, environment, Doc, Route) {

        function View(doc, route) {
            var view = {
                doc: doc,
                environment: environment,
                route: route,
            };
            angular.extend(this, view);
        }

        var statics = {
            current: ViewCurrent, // ViewCurrentSimple
        };

        var publics = {};

        angular.extend(View, statics);
        angular.extend(View.prototype, publics);

        return View;

        // static methods

        function ViewCurrent() {
            return $promise(function(promise) {
                var route = Route.current();
                var path = route.path;
                console.log('ViewCurrent', path);
                Api.docs.path(path).then(function(response) {
                    var doc = new Doc(response);
                    var view = new View(doc, route);
                    promise.resolve(view);

                }, function(error) {
                    promise.reject(error);

                });
            });
        }

        function ViewCurrentSimple() {
            return $promise(function(promise) {
                console.log('ViewCurrentSimple');
                var route = Route.current();
                var path = route.path;
                Api.navs.main().then(function(items) {
                    var doc = null,
                        view = null,
                        path = path,
                        pool = ViewPool(items);
                    var item = pool[path];
                    if (item) {
                        doc = new Doc(item);
                        view = new View(doc, route);
                    }
                    promise.resolve(view);

                }, function(error) {
                    promise.reject(error);

                });
            });
        }

        function ViewPool(items) {
            var pool = {};

            function _getPool(items) {
                if (items) {
                    angular.forEach(items, function(item) {
                        pool[item.path] = item;
                        _getPool(item.items);
                    });
                }
            }
            _getPool(items);
            return pool;
        }

        // prototype methods

    }]);

}());
/* global angular */

(function() {
    "use strict";

    var app = angular.module('artisan');

    // todo

    app.service('AuthService', ['$q', '$rootScope', '$location', 'LocalStorage', 'environment', function($q, $rootScope, $location, LocalStorage, environment) {

        var service = this;

        var statics = {
            isAuthorizedOrGoTo: isAuthorizedOrGoTo,
            isAuthorized: isAuthorized,
            request: request,
            response: response,
            responseError: responseError,
            signOut: signOut,
        };

        angular.extend(service, statics);

        /* * * * * * * * * * * * * * * * *
         *  detect current auth storage  *
         * * * * * * * * * * * * * * * * */

        console.log(environment.plugins);

        // statics methods

        function isAuthorizedOrGoTo(redirect) {
            var deferred = $q.defer();
            var auth = LocalStorage.get('authorization');
            if (auth && auth.created_at + auth.expires_in < new Date().getTime()) {
                deferred.resolve(auth);
            } else {
                deferred.reject({
                    status: 'unauthorized'
                });
                $location.path(redirect);
            }
            return deferred.promise;
        }

        function isAuthorized() {
            var auth = LocalStorage.get('authorization');
            return (auth && auth.created_at + auth.expires_in < new Date().getTime());
        }

        function request(config) {
            var auth = LocalStorage.get('authorization');
            if (auth && auth.created_at + auth.expires_in < new Date().getTime()) {
                config.headers = config.headers || {};
                config.headers.Authorization = 'Bearer ' + auth.access_token; // add your token from your service or whatever
            }
            return config;
        }

        function response(response) {
            return response || $q.when(response);
        }

        function responseError(error) {
            console.log('AuthService.responseError', error);
            // your error handler
            switch (error.status) {
                case 400:
                    var errors = [];
                    if (error.data) {
                        errors.push(error.data.Message);
                        for (var key in error.data.ModelState) {
                            for (var i = 0; i < error.data.ModelState[key].length; i++) {
                                errors.push(error.data.ModelState[key][i]);
                            }
                        }
                    } else {
                        errors.push('Server error');
                    }
                    error.Message = errors.join(' ');
                    // warning !!
                    $rootScope.httpError = error;
                    $rootScope.$broadcast('onHttpInterceptorError', error);
                    break;
                case 404:
                    error.Message = "Not found";
                    $rootScope.httpError = error;
                    $rootScope.$broadcast('onHttpInterceptorError', error);
                    break;
                case 500:
                    // console.log('500',error);
                    $rootScope.httpError = error;
                    $rootScope.$broadcast('onHttpInterceptorError', error);
                    break;
                case 401:
                    LocalStorage.delete('authorization');
                    LocalStorage.delete('user');
                    $location.path('/signin');
                    break;
                case -1:
                    window.open(error.config.path, '_blank');
                    // status == 0 you lost connection
            }
            return $q.reject(error);
        }

        function signOut() {
            LocalStorage.delete('authorization');
            LocalStorage.delete('user');
            LocalStorage.delete('CampagnoloToken');
            LocalStorage.delete('GoogleToken');
            LocalStorage.delete('StravaToken');
            LocalStorage.delete('FacebookToken');
            LocalStorage.delete('GarminToken');
        }

    }]);

}());
/* global angular */

(function() {
    "use strict";

    var app = angular.module('artisan');

    app.service('Http', ['$http', '$promise', '$timeout', 'environment', function($http, $promise, $timeout, environment) {

        var service = this;

        var statics = {
            get: HttpGet,
            post: HttpPost,
            put: HttpPut,
            patch: HttpPatch,
            'delete': HttpDelete,
            fake: HttpFake,
        };

        angular.extend(service, statics);

        // statics methods

        function HttpPath(path) {
            return environment.paths.api + path;
        }

        function HttpPromise(method, path, data) {
            return $promise(function(promise) {
                $http[method](HttpPath(path), data).then(function(response) {
                    promise.resolve(response.data);

                }, function(e, status) {
                    var error = (e && e.data) ? e.data : {};
                    error.status = e.status;
                    promise.reject(error);

                });
            });
        }

        function HttpGet(path) {
            return HttpPromise('get', path);
        }

        function HttpPost(path, data) {
            return HttpPromise('post', path, data);
        }

        function HttpPut(path, data) {
            return HttpPromise('put', path, data);
        }

        function HttpPatch(path, data) {
            return HttpPromise('patch', path, data);
        }

        function HttpDelete(path) {
            return HttpPromise('delete', path);
        }

        function HttpFake(data, msec) {
            msec = msec || 1000;
            return $promise(function(promise) {
                $timeout(function() {
                    promise.resolve({
                        data: data
                    });
                }, msec);
            });
        }

    }]);

}());
/* global angular */

(function() {
    "use strict";

    var app = angular.module('artisan');

    app.factory('Preload', ['$promise', function($promise) {

        function Preload(path) {
            var preload = this;
            preload.path = path;
            preload.loaded = 0;
            preload.total = 0;
            preload.progress = 0;
        }

        var statics = {
            all: PreloadAll,
        };

        var publics = {
            start: PreloadStart,
            image: PreloadImage,
        };

        angular.extend(Preload, statics);
        angular.extend(Preload.prototype, publics);

        return Preload;

        // statics methods

        function PreloadAll(paths, callback) {
            return $promise(function(promise) {
                var preloads = paths.map(function(path) {
                    return new Preload(path);
                });
                var progress = {
                    loaded: 0,
                    total: 0,
                    progress: 0,
                    preloads: preloads
                };
                var i = setInterval(update, 1000 / 10);
                $promise.all(
                    preloads.map(function(preload) {
                        return preload.start();
                    })
                ).then(function() {
                    clearInterval(i);
                    update();
                    promise.resolve(preloads.slice());
                    // destroy();
                }, function(error) {
                    promise.reject(error);
                    // destroy();
                });

                function update() {
                    progress.loaded = 0;
                    progress.total = 0;
                    angular.forEach(preloads, function(preload) {
                        progress.loaded += preload.loaded;
                        progress.total += preload.total;
                    });
                    var percent = progress.total ? progress.loaded / progress.total : 0;
                    if (percent > progress.progress) {
                        progress.progress = percent;
                        if (callback) {
                            callback(progress);
                        }
                    }
                }

                function destroy() {
                    angular.forEach(preloads, function(preload) {
                        preload.buffer = null;
                        preload.xhr = null;
                    });
                }
            });
        }

        // instance methods

        function PreloadStart() {
            var preload = this;
            return $promise(function(promise) {
                var xhr = new XMLHttpRequest();
                xhr.responseType = "arraybuffer";
                xhr.open("GET", preload.path, true);
                xhr.onloadstart = function(e) {
                    /*
                    preload.loaded = 0;
                    preload.total = 1;
                    preload.progress = 0;
                    */
                };
                xhr.onprogress = function(e) {
                    preload.loaded = e.loaded;
                    preload.total = e.total;
                    preload.progress = e.total ? e.loaded / e.total : 0;
                };
                xhr.onloadend = function(e) {
                    preload.loaded = preload.total;
                    preload.progress = 1;
                };
                xhr.onload = function() {
                    preload.buffer = xhr.response;
                    promise.resolve(preload);
                };
                xhr.onerror = function(error) {
                    console.log('Preload.xhr.onerror', error);
                    preload.loaded = preload.total;
                    preload.progress = 1;
                    promise.reject(error);
                };
                xhr.send();
                preload.xhr = xhr;
            });
        }

        function PreloadImage() {
            var preload = this;
            var blob = new Blob([preload.buffer]);
            var image = new Image();
            image.src = window.URL.createObjectURL(blob);
            return image;
        }

    }]);

}());
/* global angular */

(function() {
    "use strict";

    var app = angular.module('artisan');

    app.service('$once', ['$promise', function($promise) {

        var service = this;

        var statics = {
            load: OnceLoad,
            script: OnceScript,
            link: OnceLink,
        };

        angular.extend(service, statics);

        var paths = {},
            uid = 0;

        function OnceLoad(path, callback) {
            if (path.indexOf('.js')) {
                return OnceScript(path, callback);

            } else if (path.indexOf('.css')) {
                return OnceLink(path);

            }
        }

        function OnceScript(path, callback) {
            return $promise(function(promise) {
                try {
                    var id = (paths[path] = paths[path] || ++uid);
                    id = 'OnceScript' + id;
                    if (document.getElementById(id)) {
                        promise.reject();
                    } else {
                        var scripts = document.getElementsByTagName('script');
                        var script = scripts[scripts.length - 1];
                        var node = document.createElement('script');
                        node.id = id;
                        if (callback) {
                            if (callback === true) {
                                callback = id;
                                path = path.split('{{callback}}').join(callback);
                            }
                            window[callback] = function(data) {
                                promise.resolve(data);
                            };
                        } else {
                            node.addEventListener('load', promise.resolve);
                        }
                        node.addEventListener('error', promise.reject);
                        node.src = path;
                        script.parentNode.insertBefore(node, script.nextSibling);
                    }
                } catch (error) {
                    promise.reject(error);
                }
            });
        }

        function OnceLink(path) {
            return $promise(function(promise) {
                try {
                    var id = (paths[path] = paths[path] || ++uid);
                    id = 'OnceStyle' + id;
                    if (document.getElementById(id)) {
                        promise.resolve();
                    } else {
                        var links = document.getElementsByTagName('link');
                        var link = links[links.length - 1];
                        var node = document.createElement('link');
                        node.id = id;
                        node.rel = 'stylesheet';
                        node.href = path;
                        node.addEventListener('load', promise.resolve);
                        node.addEventListener('error', promise.reject);
                        link.parentNode.insertBefore(node, link.nextSibling);
                    }
                } catch (error) {
                    promise.reject(error);
                }
            });
        }

    }]);

}());
/* global angular */

(function() {
    "use strict";

    var app = angular.module('artisan');

    app.service('Router', ['$rootScope', '$location', '$route', '$timeout', function($rootScope, $location, $route, $timeout) {

        var service = this;

        var statics = {
            isController: RouterIsController,
            redirect: RouterRedirect,
            path: RouterPath,
            apply: RouterApply,
        };

        angular.extend(service, statics);

        $rootScope.$on('$routeChangeStart', RouterOnChangeStart);
        $rootScope.$on('$routeChangeSuccess', RouterOnChangeSuccess);
        $rootScope.$on('$routeChangeError', RouterOnChangeError);
        $rootScope.$on('$routeUpdate', RouterOnUpdate);
        $rootScope.$on('$stateReady', RouterOnStateReady);

        var $previous, $current, $next;
        var $previousController, $currentController, $nextController;

        function RouterSetControllers() {
            $previousController = $previous ? $previous.controller : null;
            $currentController = $current ? $current.controller : null;
            $nextController = $next ? $next.controller : null;
        }

        /*
        $routeChangeStart
        Broadcasted before a route change. At this point the route services starts resolving all of the dependencies needed for the route change to occur. Typically this involves fetching the view template as well as any dependencies defined in resolve route property. Once all of the dependencies are resolved $routeChangeSuccess is fired.
        The route change (and the $location change that triggered it) can be prevented by calling preventDefault method of the event. See $rootScope.Scope for more details about event object.
        */
        function RouterOnChangeStart(event, next, current) {
            $previous = null;
            $current = current ? current.$$route : null;
            $next = next ? next.$$route : null;
            RouterSetControllers();
            // console.log('Router.RouterOnChangeStart', '$previous', $previous, '$current', $current, '$next', $next);
            service.loading = true;
        }

        /*
        $routeChangeSuccess
        Broadcasted after a route change has happened successfully. The resolve dependencies are now available in the current.locals property.
        */
        function RouterOnChangeSuccess(event, current, previous) {
            $previous = previous ? previous.$$route : null;
            $current = current ? current.$$route : null;
            $next = null;
            RouterSetControllers();
            // console.log('Router.RouterOnChangeSuccess', '$previous', $previous, '$current', $current, '$next', $next);
        }

        /*
        $routeChangeError
        Broadcasted if a redirection function fails or any redirection or resolve promises are rejected.
        */
        function RouterOnChangeError(event, current, previous, rejection) {
            $previous = null;
            $current = previous.$$route || null;
            $next = null;
            RouterSetControllers();
            // console.log('Router.RouterOnChangeError', '$previous', $previous, '$current', $current, '$next', $next);
        }

        /*
        $routeUpdate
        The reloadOnSearch property has been set to false, and we are reusing the same instance of the Controller.
        */
        function RouterOnUpdate(event, current) {
            $previous = current ? current.$$route : null;
            $current = current ? current.$$route : null;
            $next = null;
            RouterSetControllers();
            // console.log('Router.RouterOnUpdate', '$previous', $previous, '$current', $current, '$next', $next);
        }

        function RouterOnStateReady(scope, state) {
            $timeout(function() {
                service.loading = false;
            }, 1000);
        }

        function RouterIsController(controller) {
            return $currentController === controller;
        }

        // navigation

        function RouterRedirectTo(path) {
            $location.$$lastRequestedPath = $location.path();
            $location.path(path);
        }

        function RouterRetryLastRequestedPath(path) {
            path = $location.$$lastRequestedPath || path;
            $location.$$lastRequestedPath = null;
            $location.path(path);
        }

        function RouterRedirect(path, msecs) {
            if (msecs) {
                $timeout(function() {
                    RouterRedirectTo(path);
                }, msecs);
            } else {
                RouterRedirectTo(path);
            }
        }

        function RouterPath(path, msecs) {
            if (msecs) {
                $timeout(function() {
                    RouterRetryLastRequestedPath(path);
                }, msecs);
            } else {
                RouterRetryLastRequestedPath(path);
            }
        }

        function RouterApply(path, msecs) {
            if (msecs) {
                $timeout(function() {
                    $location.path(path);
                }, msecs);
            } else {
                $timeout(function() {
                    $location.path(path);
                });
            }
        }

    }]);

}());
/* global angular */

(function () {
	"use strict";

	var app = angular.module('artisan');

	app.service('Silent', ['$rootScope', '$location', function ($rootScope, $location) {

		var service = this;

		var statics = {
			silent: SilentSilent,
			path: SilentPath,
		};

		angular.extend(service, statics);

		$rootScope.$$listeners.$locationChangeSuccess.unshift(SilentListener);
		// console.log('$rootScope.$$listeners.$locationChangeSuccess', $rootScope.$$listeners.$locationChangeSuccess);

		// private vars

		var $path;

		// static methods

		function SilentGetDomain() {
			var currentDomain = window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
			return currentDomain;
		}

		function SilentUnlink() {
			var listeners = $rootScope.$$listeners.$locationChangeSuccess;
			angular.forEach(listeners, function (value, name) {
				if (value === listener) {
					return;
				}

				function relink() {
					listeners[name] = value;
				}
				listeners[name] = relink; // temporary unlinking
			});
		}

		function SilentListener(e) {
			// console.log('onLocationChangeSuccess', e);
			if ($path === $location.path()) {
				SilentUnlink();
			}
			$path = null;
		}

		function SilentSilent(path, replace) {
			// this.prev = $location.path(); ???
			var location = $location.url(path);
			if (replace) {
				location.replace();
			}
			$path = $location.path();
		}

		function SilentPath(path) {
			return $location.path(path);
		}

    }]);

}());
/* global angular */

(function () {
	"use strict";

	var app = angular.module('artisan');

	var TIMEOUT = 5 * 60 * 1000; // five minutes

	app.service('Cookie', ['$promise', function ($promise) {

		var service = {
			TIMEOUT: TIMEOUT,
			delete: CookieDelete,
			exist: CookieExists,
			get: CookieGet,
			on: CookieOn,
			set: CookieSet,
		};

		angular.extend(this, service);

		function CookieDelete(name) {
			CookieSetter(name, "", -1);
		}

		function CookieExists(name) {
			return document.cookie.indexOf(';' + name + '=') !== -1 || document.cookie.indexOf(name + '=') === 0;
		}

		function CookieGet(name) {
			var cookieName = name + "=";
			var ca = document.cookie.split(';');
			for (var i = 0; i < ca.length; i++) {
				var c = ca[i];
				while (c.charAt(0) == ' ') {
					c = c.substring(1, c.length);
				}
				if (c.indexOf(cookieName) === 0) {
					var value = c.substring(cookieName.length, c.length);
					var model = null;
					try {
						model = JSON.parse(decodeURIComponent(atob(value)));
					} catch (e) {
						console.log('Cookie.get.error parsing', key, e);
					}
					return model;
				}
			}
			return null;
		}

		function CookieOn(name) {
			return $promise(function (promise) {
				var i, interval = 1000,
					elapsed = 0,
					timeout = Cookie.TIMEOUT;

				function checkCookie() {
					if (elapsed > timeout) {
						promise.reject('timeout');
					} else {
						var c = CookieGet(name);
						if (c) {
							promise.resolve(c);
						} else {
							elapsed += interval;
							i = setTimeout(checkCookie, interval);
						}
					}
				}
				checkCookie();
			});
		}

		function CookieSet(name, value, days) {
			try {
				var cache = [];
				var json = JSON.stringify(value, function (key, value) {
					if (key === 'pool') {
						return;
					}
					if (typeof value === 'object' && value !== null) {
						if (cache.indexOf(value) !== -1) {
							// Circular reference found, discard key
							return;
						}
						cache.push(value);
					}
					return value;
				});
				cache = null;
				CookieSetter(name, btoa(encodeURIComponent(json)), days);
			} catch (e) {
				console.log('CookieSet.error serializing', name, value, e);
			}
		}

		function CookieSetter(name, value, days) {
			var expires;
			if (days) {
				var date = new Date();
				date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
				expires = '; expires=' + date.toGMTString();
			} else {
				expires = '';
			}
			document.cookie = name + '=' + value + expires + '; path=/';
		}

    }]);

	app.service('LocalStorage', ['$promise', 'Cookie', function ($promise, Cookie) {

		var service = {
			TIMEOUT: TIMEOUT,
			delete: LocalDelete,
			exist: LocalExists,
			get: LocalGet,
			on: LocalOn,
			set: LocalSet,
		};

		var supported = LocalSupported();

		if (supported) {
			angular.extend(this, service);
		} else {
			angular.extend(this, Cookie);
		}

		this.supported = supported;

		function LocalSupported() {
			var supported = false;
			try {
				supported = 'localStorage' in window && window.localStorage !== null;
				if (supported) {
					window.localStorage.setItem('test', '1');
					window.localStorage.removeItem('test');
				} else {
					supported = false;
				}
			} catch (e) {
				supported = false;
			}
			return supported;
		}

		function LocalExists(name) {
			return window.localStorage[name] !== undefined;
		}

		function LocalGet(name) {
			var value = null;
			if (window.localStorage[name] !== undefined) {
				try {
					value = JSON.parse(window.localStorage[name]);
				} catch (e) {
					console.log('LocalStorage.get.error parsing', name, e);
				}
			}
			return value;
		}

		function LocalSet(name, value) {
			try {
				var cache = [];
				var json = JSON.stringify(value, function (key, value) {
					if (key === 'pool') {
						return;
					}
					if (typeof value === 'object' && value !== null) {
						if (cache.indexOf(value) !== -1) {
							// Circular reference found, discard key
							return;
						}
						cache.push(value);
					}
					return value;
				});
				cache = null;
				window.localStorage.setItem(name, json);
			} catch (e) {
				console.log('LocalStorage.set.error serializing', name, value, e);
			}
		}

		function LocalDelete(name) {
			window.localStorage.removeItem(name);
		}

		function LocalOn(name) {
			return $promise(function (promise) {
				var i, timeout = Cookie.TIMEOUT;

				function storageEvent(e) {
					// console.log('LocalStorage.on', name, e);
					if (i) {
						clearTimeout(i);
					}
					if (e.originalEvent.key == name) {
						try {
							var value = JSON.parse(e.originalEvent.newValue); // , e.originalEvent.oldValue
							promise.resolve(value);
						} catch (error) {
							console.log('LocalStorage.on.error parsing', name, error);
							promise.reject('error parsing ' + name);
						}
					}
				}
				angular.element(window).on('storage', storageEvent);
				i = setTimeout(function () {
					promise.reject('timeout');
				}, timeout);
			});
		}

    }]);

	app.factory('SessionStorage', ['$promise', 'Cookie', function ($promise, Cookie) {

		var service = {
			TIMEOUT: TIMEOUT,
			delete: LocalDelete,
			exist: LocalExists,
			get: LocalGet,
			on: LocalOn,
			set: LocalSet,
		};

		var supported = SessionSupported();

		if (supported) {
			angular.extend(this, service);
		} else {
			angular.extend(this, Cookie);
		}

		this.supported = supported;

		function SessionSupported() {
			var supported = false;
			try {
				supported = 'sessionStorage' in window && window.sessionStorage !== undefined;
				if (supported) {
					window.sessionStorage.setItem('test', '1');
					window.sessionStorage.removeItem('test');
				} else {
					supported = false;
				}
			} catch (e) {
				supported = false;
			}
			return supported;
		}

		function SessionExists(name) {
			return window.sessionStorage[name] !== undefined;
		}

		function SessionGet(name) {
			var value = null;
			if (window.sessionStorage[name] !== undefined) {
				try {
					value = JSON.parse(window.sessionStorage[name]);
				} catch (e) {
					console.log('SessionStorage.get.error parsing', name, e);
				}
			}
			return value;
		}

		function SessionSet(name, value) {
			try {
				var cache = [];
				var json = JSON.stringify(value, function (key, value) {
					if (key === 'pool') {
						return;
					}
					if (typeof value === 'object' && value !== null) {
						if (cache.indexOf(value) !== -1) {
							// Circular reference found, discard key
							return;
						}
						cache.push(value);
					}
					return value;
				});
				cache = null;
				window.sessionStorage.setItem(name, json);
			} catch (e) {
				console.log('SessionStorage.set.error serializing', name, value, e);
			}
		}

		function SessionDelete(name) {
			window.sessionStorage.removeItem(name);
		}

		function SessionOn(name) {
			return $promise(function (promise) {
				var i, timeout = Cookie.TIMEOUT;

				function storageEvent(e) {
					// console.log('SessionStorage.on', name, e);
					if (i) {
						clearTimeout(i);
					}
					if (e.originalEvent.key === name) {
						try {
							var value = JSON.parse(e.originalEvent.newValue); // , e.originalEvent.oldValue
							promise.resolve(value);
						} catch (error) {
							console.log('SessionStorage.on.error parsing', name, error);
							promise.reject('error parsing ' + name);
						}
					}
				}
				angular.element(window).on('storage', storageEvent);
				i = setTimeout(function () {
					promise.reject('timeout');
				}, timeout);
			});
		}

    }]);

}());
/* global angular */

(function () {
	"use strict";

	var app = angular.module('artisan');

	app.service('Trust', ['$sce', function ($sce) {

		var service = this;

		var statics = {
			html: TrustHtml,
			resource: TrustResource,
			url: TrustUrl,
		};

		angular.extend(service, statics);

		// private vars

		var values = [],
			trustedValues = [];

		function TrustGetValue(value) {
			var index = values.indexOf(value);
			if (index !== -1) {
				return trustedValues[index];
			} else {
				return null;
			}
		}

		function TrustSetValue(value, trustedValue) {
			values.push(value);
			values.push(trustedValue);
		}

		function TrustGetOrSet(value, callback) {
			var trustedValue = TrustGetValue(value);
			if (!trustedValue) {
				trustedValue = callback();
				TrustSetValue(value, trustedValue);
			}
			return trustedValue;
		}

		function TrustHtml(value) {
			return TrustGetOrSet(value, function () {
				return $sce.trustAsHtml(value);
			});
		}

		function TrustResource(value) {
			return TrustGetOrSet(value, function () {
				return $sce.trustAsResourceUrl(value);
			});
		}

		function TrustUrl(value) {
			return TrustGetOrSet(value, function () {
				return 'url(\'' + value + '\')';
			});
		}

    }]);

}());
/* global angular */

(function() {
    "use strict";

    var app = angular.module('artisan');

    app.service('FacebookService', ['$promise', '$once', 'LocalStorage', 'environment', function($promise, $once, storage, environment) {

        var service = this;

        var statics = {
            login: FacebookLogin,
            logout: FacebookLogout,
            status: FacebookStatus,
            getMe: FacebookGetMe,
            getMyPicture: FacebookGetMyPicture,
        };

        angular.extend(service, statics);

        // private vars

        if (!environment.plugins.facebook) {
            trhow('FacebookService.error missing config object in environment.plugins.facebook');
        }

        var config = environment.plugins.facebook;

        // statics methods

        /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
         *  calling facebook initializer on page load to avoid popup blockers via asyncronous loading  *
         * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

        Facebook();

        var authResponse = storage.get('facebook');
        /*
        authResponse = {
            accessToken: "accessTokenXXXXX",
            expiresIn: 4962,
            signedRequest: "signedRequestXXXXX",
            userID: "10214671620773661",
        }
        */
        console.log('facebook.storage', authResponse);

        function Facebook() {
            return $promise(function(promise) {
                if (window.FB !== undefined) {
                    promise.resolve(window.FB);
                } else {
                    FacebookOnce().then(function(success) {
                        promise.resolve(window.FB);
                    }, function(error) {
                        promise.reject(error);
                    });
                }
            });
        }

        function FacebookOnce() {
            return $promise(function(promise) {
                $once.script('//connect.facebook.net/' + environment.language.culture + '/sdk.js', 'fbAsyncInit').then(function() {
                    // console.log('FacebookOnce.fbAsyncInit', window.FB);
                    window.FB.init({
                        appId: config.appId,
                        status: true,
                        cookie: true,
                        xfbml: true,
                        version: config.version,
                    });
                    promise.resolve(window.FB);
                    // window.fbAsyncInit = null;
                }, function(error) {
                    promise.reject(error);
                });
            });
        }

        function FacebookStatus(response, promise, init) {
            service.authResponse = null;
            if (response.status === 'connected') {
                service.authResponse = response.authResponse;
                storage.set('facebook', response.authResponse);
                promise.resolve(response);
            } else if (response.status === 'not_authorized') {
                storage.delete('facebook');
                if (init) {
                    promise.resolve(response);
                } else {
                    promise.reject(response);
                }
            } else {
                promise.reject(response);
            }
        }

        function FacebookGetMe(fields) {
            fields = fields || config.fields;
            return $promise(function(promise) {
                FacebookLogin().then(function(response) {
                    window.FB.api('/me', {
                        fields: fields
                    }, function(response) {
                        if (!response || response.error) {
                            var error = response ? response.error : 'error';
                            console.log('FacebookGetMe.error', error);
                            promise.reject(error);

                        } else {
                            console.log('FacebookGetMe.success', response);
                            promise.resolve(response);

                        }
                    });
                });
            });
        }

        function FacebookGetMyPicture(size) {
            size = size || 300;
            return $promise(function(promise) {
                FacebookLogin().then(function(facebook) {
                    window.FB.api('/me/picture', {
                        width: size,
                        height: size,
                        type: 'square'
                    }, function(response) {
                        if (!response || response.error) {
                            var error = response ? response.error : 'error';
                            console.log('FacebookGetMyPicture.error', error);
                            promise.reject(error);

                        } else {
                            console.log('FacebookGetMyPicture.success', response);
                            promise.resolve(response);

                        }
                    });
                });
            });
        }

        function FacebookLogin() {
            return $promise(function(promise) {
                Facebook().then(function(facebook) {
                    console.log('FacebookLogin', facebook);
                    facebook.login(function(response) {
                        FacebookStatus(response, promise);
                    }, {
                        scope: config.scope
                    });
                });
            });
        }

        function FacebookLogout() {
            return $promise(function(promise) {
                Facebook().then(function(facebook) {
                    facebook.logout(function(response) {
                        promise.resolve(response);
                    });
                });
            });
        }

    }]);

}());
/* global angular */

(function() {
    "use strict";

    var app = angular.module('artisan');

    // todo !!!

    app.service('GoogleService', ['$timeout', '$promise', '$once', 'LocalStorage', 'environment', function($timeout, $promise, $once, storage, environment) {

        var service = this;

        var statics = {
            login: GoogleLogin,
            logout: GoogleLogout,
            getMe: GoogleGetMe,
            // status: GoogleStatus,
            // getMyPicture: GoogleGetMyPicture,
        };

        angular.extend(service, statics);

        // private vars

        if (!environment.plugins.google) {
            trhow('GoogleService.error missing config object in environment.plugins.google');
        }

        var config = environment.plugins.google;

        var auth2 = null;

        var instance = null;

        // statics methods

        /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
         *  calling google initializer on page load to avoid popup blockers via asyncronous loading  *
         * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

        Auth2Init();

        var authResponse = storage.get('google');
        /*
        authResponse = {
            access_token: "accessTokenXXXXX",
            expires_at: 1511992065944,
            expires_in: 3600,
            first_issued_at: 1511988465944,
            id_token: "idTokenXXXXX",
            idpId: "google",
            login_hint: "loginHintXXXXXX",
            scope: "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/plus.me openid email profile"
            session_state: {
                extraQueryParams: { … }
            },
            token_type: "Bearer"
        }
        */
        console.log('google.storage', authResponse);

        function Google() {
            return $promise(function(promise) {
                if (window.gapi !== undefined) {
                    promise.resolve(window.gapi);
                } else {
                    GoogleOnce().then(function(response) {
                        promise.resolve(window.gapi);
                    }, function(error) {
                        promise.reject(error);
                    });
                }
            });
        }

        function GoogleOnce() {
            return $promise(function(promise) {
                $once.script('https://apis.google.com/js/api:client.js?onload={{callback}}', true).then(function(data) {
                    promise.resolve(data);
                }, function(error) {
                    promise.reject(error);
                });
            });
        }

        function Auth2Init() {
            return $promise(function(promise) {

                if (auth2) {
                    promise.resolve(auth2);
                } else {
                    Google().then(function() {
                        function onLoaded() {
                            var result = window.gapi.auth2.init({
                                client_id: environment.plugins.google.clientId,
                                cookiepolicy: 'single_host_origin',
                                scope: 'profile email',
                                fetch_basic_profile: true,
                                ux_mode: 'popup',

                            }).then(function() {
                                auth2 = window.gapi.auth2;
                                console.log('Auth2Init.success', auth2);
                                promise.resolve(auth2);

                            }, function(error) {
                                console.log('Auth2Init.error', error);
                                promise.reject(error);

                            });
                        }
                        if (window.gapi.auth2) {
                            onLoaded();
                        } else {
                            window.gapi.load('auth2', function() {
                                $timeout(function() {
                                    onLoaded();
                                }, 200);
                            });
                        }
                    }, function(error) {
                        console.log('Auth2Init.error', error);
                        promise.reject(error);

                    });
                }
            });
        }

        function Auth2Instance() {
            return $promise(function(promise) {
                if (instance) {
                    promise.resolve();
                } else {
                    Auth2Init().then(function(auth2) {
                        instance = auth2.getAuthInstance();
                        console.log('GoogleService.Auth2Instance.success', instance);
                        promise.resolve();

                    }, function(error) {
                        console.log('GoogleService.Auth2Instance.error', error);
                        promise.reject(error);
                    });
                }
            });
        }

        function GoogleGetMe() {
            return $promise(function(promise) {
                GoogleLogin().then(function(response) {
                    var profile = instance.currentUser.get().getBasicProfile();
                    var user = {
                        id: profile.getId(),
                        name: profile.getName(),
                        firstName: profile.getGivenName(),
                        lastName: profile.getFamilyName(),
                        picture: profile.getImageUrl(),
                        email: profile.getEmail(),
                    };
                    console.log('GoogleGetMe.success', user);
                    promise.resolve(user);

                }, function(error) {
                    console.log('GoogleGetMe.error', error);
                    promise.reject(error);

                });
            });
        }

        function GoogleLogin() {
            return $promise(function(promise) {
                Auth2Instance().then(function() {
                    if (instance.isSignedIn && instance.isSignedIn.get()) {
                        // Auth2Instance.isSignedIn.listen(onStatus);
                        readAccessToken();

                    } else {
                        console.log('GoogleLogin.signIn');
                        instance.signIn({
                            scope: 'profile email',

                        }).then(function(signed) {
                            readAccessToken();

                        }, function(error) {
                            console.log('GoogleLogin.error', error);
                            storage.delete('google');
                            promise.reject(error);

                        });
                    }

                    function readAccessToken() {
                        console.log('GoogleLogin.readAccessToken');
                        try {
                            var response = instance.currentUser.get().getAuthResponse(true);
                            console.log('GoogleLogin.readAccessToken.success', response);
                            storage.set('google', response);
                            promise.resolve({
                                code: response.access_token,
                            });
                        } catch (error) {
                            console.log('GoogleLogin.readAccessToken.error', error);
                            storage.delete('google');
                            promise.reject(error);
                        }
                    }

                    function onStatus(signed) {
                        console.log('GoogleLogin.onStatus', signed);
                        if (signed) {
                            readAccessToken();
                        }
                    }
                }, function(error) {
                    console.log('GoogleLogin.error', error);
                    // promise.reject(error);

                });
            });
        }

        function GoogleLogout() {
            return $promise(function(promise) {

                Auth2Instance().then(function() {
                    if (instance.isSignedIn && instance.isSignedIn.get()) {
                        instance.signOut().then(function(signed) {
                            promise.resolve();

                        }, function(error) {
                            console.log('GoogleService.signOut.error', error);
                            promise.reject(error);

                        });
                    } else {
                        promise.resolve();
                    }

                }, function(error) {
                    console.log('GoogleService.signOut.error', error);
                    promise.reject(error);

                });
            });
        }

    }]);

}());
/* global angular */

(function() {
    "use strict";

    var app = angular.module('artisan');

    // todo !!!

    app.directive('googlemaps', ['$timeout', '$compile', '$promise', 'Http', 'GoogleMaps', 'environment', function($timeout, $compile, $promise, Http, GoogleMaps, environment) {

        var directive = {
            restrict: 'A',
            scope: {
                connector: '=googlemaps',
            },
            link: GooglemapsLink,
        };

        if (!environment.plugins.googlemaps) {
            trhow('googlemaps.error missing config object in environment.plugins.googlemaps');
        }

        var config = environment.plugins.googlemaps;

        return directive;

        function GooglemapsLink(scope, element, attributes) {
            console.log('GooglemapsLink', arguments);

            var map, options, info, bounds, clusterer;
            var filters = {};
            var markers = [];

            var publics = {
                // methods available for controllers
                /*
                fly: MapboxFly,
                flyPosition: MapboxFlyPosition,
                jump: MapboxJump,
                jumpPosition: MapboxJumpPosition,
                */
                setMarkers: GooglemapsMarkersSet,
                setType: GooglemapsSetType,
            };

            if (scope.connector) {
                angular.extend(scope.connector, publics);
            }

            Googlemaps();

            function Googlemaps() {
                return $promise(function(promise) {
                    GoogleMaps.maps().then(function() {
                        GooglemapsOptions().then(function(options) {
                            map = new google.maps.Map(element[0], options);
                            info = GooglemapsInfo();
                            promise.resolve(map);
                        });
                    });
                });
            }

            function GooglemapsOptions() {
                return $promise(function(promise) {
                    var options = angular.copy(config.options);
                    if (config.styles) {
                        Http.get(config.styles).then(function(styles) {
                            options.styles = styles;
                            promise.resolve(options);

                        }, function(error) {
                            console.log('GooglemapsOptions.error', 'unable to load styles', config.styles);
                            promise.resolve(options);

                        });

                    } else {
                        promise.resolve(options);
                    }
                });
            }

            function GooglemapsMarkersRemove() {
                angular.forEach(markers, function(marker) {
                    marker.setMap(null);
                });
            }

            function GooglemapsMarkersSet(items) {
                Googlemaps().then(function(map) {
                    GooglemapsMarkersRemove();
                    bounds = new google.maps.LatLngBounds();

                    markers = items.filter(function(item) {
                        var has = true;
                        if (filters.month) {
                            has = has && filters.month.items.has(item.id);
                        }
                        if (filters.category) {
                            has = has && item.categories.indexOf(filters.category.key) !== -1;
                        }
                        return has;

                    }).map(function(item) {
                        return GooglemapsMarker(item);

                    });

                    if (config.clusterer) {
                        clusterer = GooglemapsClusterer(markers);
                    }

                });
            }

            function GooglemapsBoundsFit() {
                if (!bounds.isEmpty()) {
                    map.fitBounds(bounds);
                }
            }

            function GooglemapsSetType(typeId) {
                var types = ['hybrid', 'roadmap', 'satellite', 'terrain'];
                if (types.indexOf(typeId) !== -1) {
                    map.setMapTypeId(typeId);
                }
            }

            function GooglemapsInfo() {

                var info = new google.maps.InfoWindow({
                    maxWidth: 350,
                    pixelOffset: new google.maps.Size(0, 15),
                });

                google.maps.event.addListener(info, 'domready', function() {
                    var outer = $('.gm-style-iw');
                    var background = outer.prev();
                    background.children(':nth-child(2)').css({
                        'display': 'none'
                    });
                    background.children(':nth-child(4)').css({
                        'display': 'none'
                    });
                    outer.parent().parent().css({
                        left: '115px'
                    });
                    background.children(':nth-child(1)').attr('style', function(i, s) {
                        return s + 'display: none!important';
                    });
                    background.children(':nth-child(3)').attr('style', function(i, s) {
                        return s + 'display: none!important';
                    });
                    background.children(':nth-child(3)').find('div').children().attr('style', function(i, s) {
                        return s + 'opacity: 0!important;';
                    });
                    var close = outer.next();
                    close.css({
                        'width': '13px',
                        'height': '13px',
                        'overflow': 'hidden',
                        'position': 'absolute',
                        'right': '56px',
                        'top': '17px',
                        'z-index': '10000',
                        'cursor': 'pointer',
                        'opacity': 1,
                        'transform': 'scale(0.8)'
                    });
                    close.mouseout(function() {
                        $(this).css({
                            opacity: '1'
                        });
                    });
                });

                return info;
            }

            function GooglemapsMarker(item) {

                var latLng = new google.maps.LatLng(
                    item.position.latitude,
                    item.position.longitude
                );

                var marker = new google.maps.Marker({
                    position: latLng,
                    item: item,
                    icon: {
                        url: 'img/maps/marker.png',
                        scaledSize: new google.maps.Size(25, 25),
                        origin: new google.maps.Point(0, 0),
                        anchor: new google.maps.Point(0, 0)
                    },
                    map: map,
                    contentString: '<div id="iw-container">' +
                        '<div class="iw-image" ng-style="{ \'background-image\': cssUrl(selectedBlog.image.url) }"></div>' +
                        '<div class="iw-title" ng-bind="selectedBlog.title"></div>' +
                        '<div class="iw-cta"><button type="button" class="iw-link" ng-click="openBlog(selectedBlog)">Details</button></div>' +
                        '</div>'
                });

                marker.onClick = function() {
                    var marker = this;
                    $timeout(function() {
                        scope.selectedBlog = marker.item;
                        var html = $compile(marker.contentString)(scope);
                        info.setContent(html[0]);
                        info.open(map, marker);
                    });
                };

                marker.addListener('click', marker.onClick);

                bounds.extend(latLng);

                return marker;
            }

            function GooglemapsClusterer(markers) {

                var clusterer = new MarkerClusterer(map, markers, {
                    cssClass: 'cluster',
                    imagePath: '/img/gmap/m'
                });

                return clusterer;

            }

        }

    }]);

}());
/* global angular */

(function() {
    "use strict";

    var app = angular.module('artisan');

    app.service('GoogleMaps', ['$promise', '$once', 'environment', function($promise, $once, environment) {

        var service = this;

        var statics = {
            maps: GoogleMaps,
            geocoder: GoogleMapsGeocoder,
            parse: GoogleMapsParse,
        };

        angular.extend(service, statics);

        if (!environment.plugins.googlemaps) {
            trhow('GoogleMaps.error missing config object in environment.plugins.googlemaps');
        }

        function GoogleMaps() {
            return $promise(function(promise) {
                var apiKey = environment.plugins.googlemaps.apiKey;
                $once.script('https://maps.googleapis.com/maps/api/js?key=' + apiKey + '&callback={{callback}}', true).then(function(data) {
                    promise.resolve(window.google.maps);
                }, function(error) {
                    promise.reject(error);
                });
            });
        }

        function GoogleMapsGeocoder() {
            var service = this;
            return $promise(function(promise) {
                GoogleMaps().then(function(maps) {
                    var geocoder = new maps.Geocoder();
                    promise.resolve(geocoder);

                }, function(error) {
                    promise.reject(error);

                });
            });
        }

        function GoogleMapsType(type, item) {
            var types = {
                street: 'route',
                number: 'street_number',
                locality: 'locality',
                postalCode: 'postal_code',
                city: 'administrative_area_level_3',
                province: 'administrative_area_level_2',
                region: 'administrative_area_level_1',
                country: 'country',
            };
            var label = null;
            angular.forEach(item.address_components, function(c) {
                angular.forEach(c.types, function(t) {
                    if (t === types[type]) {
                        label = c.long_name;
                    }
                });
            });
            // console.log('GoogleMapsType', type, item, label);
            return label;
        }

        function GoogleMapsParse(results) {
            var items = null;
            if (results.length) {
                items = results.filter(function(item) {
                    return true; // item.geometry.location_type === 'ROOFTOP' ||
                    // item.geometry.location_type === 'RANGE_INTERPOLATED' ||
                    // item.geometry.location_type === 'GEOMETRIC_CENTER';
                }).map(function(item) {
                    return {
                        name: item.formatted_address,
                        street: GoogleMapsType('street', item),
                        number: GoogleMapsType('number', item),
                        locality: GoogleMapsType('locality', item),
                        postalCode: GoogleMapsType('postalCode', item),
                        city: GoogleMapsType('city', item),
                        province: GoogleMapsType('province', item),
                        region: GoogleMapsType('region', item),
                        country: GoogleMapsType('country', item),
                        position: {
                            lng: item.geometry.location.lng(),
                            lat: item.geometry.location.lat(),
                        }
                    };
                });
                /*
                var first = response.data.results[0];
                scope.model.position = first.geometry.location;
                console.log(scope.model);
                setLocation();
                */
            }
            console.log('GoogleMapsParse', results, items);
            return items;
        }

    }]);

}());
/* global angular */

(function() {
    "use strict";

    var app = angular.module('artisan');

    app.directive('mapbox', ['$http', '$timeout', '$compile', '$promise', 'MapBox', 'environment', function($http, $timeout, $compile, $promise, MapBox, environment) {

        var directive = {
            restrict: 'A',
            scope: {
                connector: '=mapbox',
            },
            link: MapboxLink,
        };

        if (!environment.plugins.mapbox) {
            trhow('mapbox.error missing config object in environment.plugins.mapbox');
        }

        var config = environment.plugins.mapbox;

        return directive;

        function MapboxLink(scope, element, attributes, model) {
            var map, markers, marker, geocoder, bounds, canvas, dragging, overing;

            var publics = {
                // methods available for controllers
                fly: MapboxFly,
                flyPosition: MapboxFlyPosition,
                jump: MapboxJump,
                jumpPosition: MapboxJumpPosition,
                setMarkers: MapboxMarkersSet,
                fitBounds: MapboxBoundsFit,
            };

            if (scope.connector) {
                angular.extend(scope.connector, publics);
            }

            function MapboxMap() {
                return $promise(function(promise) {

                    MapBox.get().then(function(mapboxgl) {
                        map = new mapboxgl.Map({
                            container: element[0],
                            style: config.style,
                            interactive: true,
                            logoPosition: 'bottom-right',
                            // center: config.options.center,
                            // zoom: config.options.zoom,
                        });
                        canvas = map.getCanvasContainer();
                        /*
                        scope.map.setAddress = function (item) {
                        	// console.log('setAddress', item);
                        	scope.map.results = null;
                        	flyTo(item.position);
                        };
                        scope.map.search = function () {
                        	// console.log('address', scope.map.address);
                        	scope.map.results = null;
                        	geocodeAddress(scope.map.address);
                        	return true;
                        };
                        scope.map.styles = {
                        	FICO: 1,
                        	SATELLITE: 2,
                        };
                        scope.map.style = scope.map.styles.FICO;
                        scope.map.styleToggle = function () {
                        	if (scope.map.style === scope.map.styles.FICO) {
                        		scope.map.style = scope.map.styles.SATELLITE;
                        		map.setStyle('mapbox://styles/mapbox/satellite-v9');
                        	} else {
                        		scope.map.style = scope.map.styles.FICO;
                        		map.setStyle('mapbox://styles/mapbox/streets-v9');
                        	}
                        };
                        scope.map.setStyle = function (style) {
                        	scope.map.style = style;
                        	if (scope.map.style === scope.map.styles.FICO) {
                        		map.setStyle('mapbox://styles/mapbox/streets-v9');
                        	} else {
                        		map.setStyle('mapbox://styles/mapbox/satellite-v9');
                        	}
                        };                
                        */
                        if (config.options) {
                            map.jumpTo(config.options);
                        }
                        promise.resolve(map);
                    });
                });
            }

            function MapboxFly(options) {
                map.flyTo(options);
            }

            function MapboxFlyPosition(position) {
                var options = getOptions({
                    center: [position.lng, position.lat],
                    zoom: 20,
                });
                MapboxFly(options);
            }

            function MapboxJump(options) {
                map.jumpTo(options);
            }

            function MapboxJumpPosition(position) {
                var options = getOptions({
                    center: [position.lng, position.lat],
                    zoom: 20,
                });
                map.MapboxJump(options);
            }

            /*
            googleMaps.geocoder().then(function (response) {
                geocoder = response;
                init();
            });
            */

            function getOptions(options) {
                return angular.extend(angular.copy(config.options), options);
            }

            function MapboxMarkersRemove() {
                if (markers) {
                    angular.forEach(markers, function(item) {
                        item.remove();
                    });
                }
            }

            function MapboxMarkersSet(items) {
                MapboxMap().then(function() {
                    MapboxMarkersRemove();
                    markers = [];
                    if (config.clusterer) {
                        MapboxClusterer(items);

                    } else {
                        if (items) {
                            angular.forEach(items, function(item) {
                                var marker = MapboxMarkerAdd(item);
                                markers.push(marker);
                            });
                        }
                    }
                });
            }

            function MapboxMarkerAdd(item) {
                var $scope = scope.$new(true);
                $scope.item = item;
                var node = document.createElement('div');
                node.id = 'point';
                node.className = 'marker ' + item.area.code;
                node.className += item.type;
                node.setAttribute('marker', 'item');
                var marker = new mapboxgl.Marker(node, {
                        offset: [-10, -10]
                    })
                    .setLngLat([item.position.lng, item.position.lat])
                    .addTo(map);
                var markerElement = angular.element(node);
                markerElement.on('click', function(e) {
                    // console.log('marker.click', item);
                    scope.$emit('onMarkerClicked', item);
                });
                $compile(markerElement)($scope); // Compiling marker
                return marker;
            }

            function MapboxCoordinatesGet(item) {
                var coordinates = null;
                if (item.position) {
                    coordinates = [
                        item.position.longitude,
                        item.position.latitude,
                        item.position.altitude || 0.0,
                    ];
                }
                // [0, 1, 2]; longitude, latitude, altitude
                return coordinates;
            }

            function MapboxFeaturesGet(items) {
                var collection = null;
                if (items) {
                    var features = items.map(function(item) {
                        return {
                            type: 'Feature',
                            properties: angular.extend({}, item),
                            geometry: {
                                type: 'Point',
                                coordinates: MapboxCoordinatesGet(item),
                            }
                        };
                    });
                    collection = {
                        type: 'FeatureCollection',
                        crs: {
                            type: 'name',
                            properties: {
                                name: 'urn:ogc:def:crs:OGC:1.3:CRS84'
                            }
                        },
                        features: features,
                    };
                }
                return collection;
            }

            function MapboxClusterer(items) {

                var collection = MapboxFeaturesGet(items);

                map.on('load', function() {
                    // Add a new source from our GeoJSON data and set the
                    // 'cluster' option to true. GL-JS will add the point_count property to your source data.
                    map.addSource('earthquakes', {
                        type: 'geojson',
                        // Point to GeoJSON data. This example visualizes all M1.0+ earthquakes
                        // from 12/22/15 to 1/21/16 as logged by USGS' Earthquake hazards program.
                        // data: '/api/mapbox/earthquakes.geo.json',
                        data: collection,
                        cluster: true,
                        clusterMaxZoom: 14, // Max zoom to cluster points on
                        clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
                    });

                    map.addLayer({
                        id: 'clusters',
                        type: 'circle',
                        source: 'earthquakes',
                        filter: ['has', 'point_count'],
                        paint: {
                            'circle-color': {
                                property: 'point_count',
                                type: 'interval',
                                stops: [
                                    [0, '#51bbd6'],
                                    [100, '#f1f075'],
                                    [750, '#f28cb1'],
                                ]
                            },
                            'circle-radius': {
                                property: 'point_count',
                                type: 'interval',
                                stops: [
                                    [0, 20],
                                    [100, 30],
                                    [750, 40]
                                ]
                            }
                        }
                    });

                    map.addLayer({
                        id: 'cluster-count',
                        type: 'symbol',
                        source: 'earthquakes',
                        filter: ['has', 'point_count'],
                        layout: {
                            'text-field': '{point_count_abbreviated}',
                            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                            'text-size': 12
                        }
                    });

                    map.addLayer({
                        id: 'unclustered-point',
                        type: 'circle',
                        source: 'earthquakes',
                        filter: ['!has', 'point_count'],
                        paint: {
                            'circle-color': '#11b4da',
                            'circle-radius': 4,
                            'circle-stroke-width': 1,
                            'circle-stroke-color': '#fff'
                        }
                    });
                });
            }

            function MapboxBoundsFit() {
                if (bounds) {
                    map.fitBounds(bounds, {
                        speed: 1.5,
                        curve: 1,
                        padding: 30,
                        linear: false,
                        maxZoom: 8,
                    });
                }
            }

            function geocodeAddress(address) {
                geocoder.geocode({
                    'address': address
                }, function(results, status) {
                    $timeout(function() {
                        if (status === 'OK') {
                            connector.results = googleMaps.parse(results);
                        } else {
                            alert('Geocode was not successful for the following reason: ' + status);
                        }
                    });
                });
            }

            function reverseGeocode(position) {
                // console.log('reverseGeocode', position);
                geocoder.geocode({
                    'location': position
                }, function(results, status) {
                    $timeout(function() {
                        if (status === 'OK') {
                            connector.results = googleMaps.parse(results);
                        } else {
                            console.log('Geocoder failed due to: ' + status);
                        }
                    });
                });
            }

            function geolocalize() {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(function(p) {
                        $timeout(function() {
                            var position = {
                                lat: p.coords.latitude,
                                lng: p.coords.longitude
                            };
                            flyTo(position);
                            reverseGeocode(position);
                        });
                    }, function(e) {
                        console.log('error', e);
                    });
                } else {
                    console.log('error', 'Browser doesn\'t support Geolocation');
                }
            }

            /*
            function flyTo(position) {
                map.flyTo({
                    center: [
                        parseFloat(position.lng),
                        parseFloat(position.lat)
                    ],
                    zoom: 15,
                    speed: 1.5,
                    curve: 1,
                });
            }
            */

        }
    }]);

    app.directive('marker', ['$http', '$timeout', function($http, $timeout) {
        return {
            restrict: 'A',
            scope: {
                item: '=marker',
            },
            template: '<div class="inner">' +
                '   <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24">' +
                '       <path d="M12 0c-5.522 0-10 4.395-10 9.815 0 5.505 4.375 9.268 10 14.185 5.625-4.917 10-8.68 10-14.185 0-5.42-4.478-9.815-10-9.815zm0 18c-4.419 0-8-3.582-8-8s3.581-8 8-8 8 3.582 8 8-3.581 8-8 8z"/>' +
                '   </svg>' +
                '   <span ng-bind="item.code"></span>' +
                '</div>',
            link: link,
        };

        function link(scope, element, attributes, model) {
            // console.log('marker', scope.item);
        }

    }]);

    /*
	app.service('GoogleMaps', ['$q', '$http', function ($q, $http) {
		var _key = 'AIzaSyAYuhIEO-41YT_GdYU6c1N7DyylT_OcMSY';
		var _init = false;

		this.maps = maps;
		this.geocoder = geocoder;
		this.parse = parse;

		function maps() {
			var deferred = $q.defer();
			if (_init) {
				deferred.resolve(window.google.maps);
			} else {
				window.googleMapsInit = function () {
					deferred.resolve(window.google.maps);
					window.googleMapsInit = null;
					_init = true;
				};
				var script = document.createElement('script');
				script.setAttribute('async', null);
				script.setAttribute('defer', null);
				script.setAttribute('src', 'https://maps.googleapis.com/maps/api/js?key=' + _key + '&callback=googleMapsInit');
				document.body.appendChild(script);
			}
			return deferred.promise;
		}

		function geocoder() {
			var service = this;
			var deferred = $q.defer();
			maps().then(function (maps) {
				var _geocoder = new maps.Geocoder();
				deferred.resolve(_geocoder);
			}, function (error) {
				deferred.reject(error);
			});
			return deferred.promise;
		}

		function getType(type, item) {
			var types = {
				street: 'route',
				number: 'street_number',
				locality: 'locality',
				postalCode: 'postal_code',
				city: 'administrative_area_level_3',
				province: 'administrative_area_level_2',
				region: 'administrative_area_level_1',
				country: 'country',
			};
			var label = null;
			angular.forEach(item.address_components, function (c) {
				angular.forEach(c.types, function (t) {
					if (t === types[type]) {
						label = c.long_name;
					}
				});
			});
			// console.log('googleMaps.getType', type, item, label);
			return label;
		}

		function parse(results) {
			var items = null;
			if (results.length) {
				items = results.filter(function (item) {
					return true; // item.geometry.location_type === 'ROOFTOP' ||
					// item.geometry.location_type === 'RANGE_INTERPOLATED' ||
					// item.geometry.location_type === 'GEOMETRIC_CENTER';
				}).map(function (item) {
					return {
						name: item.formatted_address,
						street: getType('street', item),
						number: getType('number', item),
						locality: getType('locality', item),
						postalCode: getType('postalCode', item),
						city: getType('city', item),
						province: getType('province', item),
						region: getType('region', item),
						country: getType('country', item),
						position: {
							lng: item.geometry.location.lng(),
							lat: item.geometry.location.lat(),
						}
					};
				});
			}
			console.log('googleMaps.parse', results, items);
			return items;
		}

    }]);
    */

}());
/* global angular */

(function() {
    "use strict";

    var app = angular.module('artisan');

    app.service('MapBox', ['$q', '$http', '$promise', '$once', 'environment', function($q, $http, $promise, $once, environment) {

        var service = this;

        var statics = {
            get: MapBoxGet,
        };

        angular.extend(service, statics);

        if (!environment.plugins.mapbox) {
            trhow('MapBox.error missing config object in environment.plugins.mapbox');
        }

        var config = environment.plugins.mapbox;

        function MapBoxGet() {
            return $promise(function(promise) {
                if (window.mapboxgl) {
                    promise.resolve(window.mapboxgl);
                } else {
                    $promise.all([
                        $once.script('//api.tiles.mapbox.com/mapbox-gl-js/' + config.version + '/mapbox-gl.js'),
                        $once.link('//api.tiles.mapbox.com/mapbox-gl-js/' + config.version + '/mapbox-gl.css'),
                    ]).then(function() {
                        window.mapboxgl.accessToken = config.accessToken;
                        promise.resolve(window.mapboxgl);
                    }, function(error) {
                        promise.reject(error);
                    });
                }
            });
        }

    }]);

}());