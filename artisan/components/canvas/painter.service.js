/* global angular, firebase */

(function() {
	"use strict";

	var app = angular.module('artisan');

	app.factory('Color', [function() {
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
		Color.componentToHex = function(c) {
			var hex = c.toString(16);
			return hex.length == 1 ? '0' + hex : hex;
		};
		Color.luma = function(color) {
			// var luma = color.dot({ r: 54.213, g: 182.376, b: 18.411 });
			var luma = color.dot({
				r: 95,
				g: 100,
				b: 60
			});
			return luma;
		};
		Color.contrast = function(color) {
			var luma = Color.luma(color);
			if (luma > 0.6) {
				return new Color('0x000000');
			} else {
				return new Color('0xffffff');
			}
		};
		Color.darker = function(color, pow, min) {
			min = min || 0;
			var r = Math.max(Math.floor(color.r * min), Math.floor(color.r - 255 * pow));
			var g = Math.max(Math.floor(color.g * min), Math.floor(color.g - 255 * pow));
			var b = Math.max(Math.floor(color.b * min), Math.floor(color.b - 255 * pow));
			return new Color(r, g, b, color.a);
		};
		Color.lighter = function(color, pow, max) {
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
			toUint: function() {
				return (this.r << 24) + (this.g << 16) + (this.b << 8) + (this.a);
			},
			toHex: function() {
				return '#' + Color.componentToHex(this.r) + Color.componentToHex(this.g) + Color.componentToHex(this.b) + Color.componentToHex(this.a);
			},
			toRgba: function() {
				return 'rgba(' + this.r + ',' + this.g + ',' + this.b + ',' + (this.a / 255).toFixed(3) + ')';
			},
			dot: function(color) {
				return ((this.r / 255) * (color.r / 255) + (this.g / 255) * (color.g / 255) + (this.b / 255) * (color.b / 255));
			},
			alpha: function(pow, min, max) {
				min = min || 0;
				max = max || 1;
				this.a = Math.floor((min + (pow * (max - min))) * 255);
				return this;
			},
			makeSet: function() {
				this.foreground = Color.contrast(this);
				this.border = Color.darker(this, 0.3);
				this.light = Color.lighter(this, 0.3);
				return this;
			},
		};
		return Color;
    }]);

	app.factory('Shape', [function() {
		function Shape() {}
		Shape.shapeCircle = function(p, cx, cy, r, sa, ea) {
			sa = sa || 0;
			ea = ea || 2 * Math.PI;
			p.ctx.arc(cx, cy, r, sa, ea, false);
		};
		Shape.shapeStar = function(p, cx, cy, or, ir, steps) {
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
		Shape.shapeRoundRect = function(p, rect, r) {
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
		Shape.circle = function() {
			var params = Array.prototype.slice.call(arguments);
			var ctx = params[0].ctx;
			ctx.beginPath();
			Shape.shapeCircle.apply(this, params);
			ctx.closePath();
		};
		Shape.star = function() {
			var params = Array.prototype.slice.call(arguments);
			var ctx = params[0].ctx;
			ctx.beginPath();
			Shape.shapeStar.apply(this, params);
			ctx.closePath();
		};
		Shape.roundRect = function() {
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

	app.factory('Palette', ['$q', 'Painter', 'Rect', function($q, Painter, Rect) {
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
			getRect: function(w, h) {
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
			add: function(key, path) {
				var palette = this;
				if (angular.isString(path)) {
					var deferred = $q.defer();
					var img = new Image();
					img.onload = function() {
						palette.addShape(key, img.width, img.height, function(p, rect) {
							p.ctx.drawImage(img, 0, 0);
						});
						deferred.resolve(img);
					};
					img.onerror = function() {
						deferred.reject('connot load ' + path);
					};
					img.src = path;
					return deferred.promise;
				} else {
					var params = Array.prototype.slice.call(arguments);
					return palette.addShape.apply(palette, params);
				}
			},
			addShape: function(key, w, h, callback) {
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
			draw: function(target, key, x, y, pre) {
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
			tint: function(target, key, x, y, color, pre) {
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
			pattern: function(target, key, x, y, w, h, color) {
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
						img.onload = function() {
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

	app.factory('Painter', ['Shape', 'Rect', 'Color', 'PainterColors', function(Shape, Rect, Color, PainterColors) {
		function Painter(canvas) {
			canvas = canvas || document.createElement('canvas');
			this.rect = new Rect();
			this.drawingRect = new Rect();
			this.setColors();
			this.setCanvas(canvas);
		}
		Painter.colors = {};
		angular.forEach(PainterColors, function(value, key) {
			Painter.colors[key] = new Color(value).makeSet();
		});
		var colors = Painter.colors;
		Painter.prototype = {
			colors: Painter.colors,
			setColors: function() {
				var colors = this.colors;
				angular.forEach(PainterColors, function(value, key) {
					colors[key] = new Color(value).makeSet();
				});
			},
			setCanvas: function(canvas) {
				this.canvas = canvas;
				this.setSize(canvas.offsetWidth, canvas.offsetHeight);
				var ctx = canvas.getContext('2d');
				ctx.lineCap = 'square';
				this.ctx = ctx;
				return this;
			},
			setSize: function(w, h) {
				this.canvas.width = w;
				this.canvas.height = h;
				this.rect.w = w;
				this.rect.h = h;
				return this;
			},
			copy: function(canvas) {
				this.ctx.drawImage(canvas, 0, 0);
				return this;
			},
			clear: function() {
				this.resize();
				// this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
				return this;
			},
			resize: function() {
				this.setSize(this.canvas.offsetWidth, this.canvas.offsetHeight);
				return this;
			},
			setText: function(font, align, verticalAlign, color) {
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
			setFill: function(color) {
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
			setStroke: function(color, size) {
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
			fillText: function(text, point, width, post, maxLength) {
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
			fillRect: function(rect) {
				rect = rect || this.rect;
				var ctx = this.ctx,
					x = rect.x,
					y = rect.y,
					w = rect.w,
					h = rect.h;
				ctx.fillRect(x, y, w, h);
				return this;
			},
			strokeRect: function(rect) {
				rect = rect || this.rect;
				var ctx = this.ctx,
					x = rect.x,
					y = rect.y,
					w = rect.w,
					h = rect.h;
				ctx.strokeRect(x, y, w, h);
				return this;
			},
			fill: function() {
				this.ctx.fill();
				return this;
			},
			stroke: function() {
				this.ctx.stroke();
				return this;
			},
			begin: function() {
				this.ctx.beginPath();
				return this;
			},
			close: function() {
				this.ctx.closePath();
				return this;
			},
			save: function() {
				this.ctx.save();
				return this;
			},
			restore: function() {
				this.ctx.restore();
				return this;
			},
			rotate: function(angle) {
				this.ctx.rotate(angle * Math.PI / 180);
			},
			translate: function(xy) {
				this.ctx.translate(xy.x, xy.y);
			},
			toDataURL: function() {
				return this.canvas.toDataURL();
			},
			draw: function(image, t, pre) {
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
			drawRect: function(image, s, t, pre) {
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
			flip: function(scale) {
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
