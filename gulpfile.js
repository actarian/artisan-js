/* jshint esversion: 6 */

var fs = require('fs'),
	gulp = require('gulp'),
	gulpif = require('gulp-if'),
	merge = require("merge-stream"),
	autoprefixer = require('gulp-autoprefixer'),
	concat = require('gulp-concat'),
	concatutil = require('gulp-concat-util'),
	cssmin = require('gulp-cssmin'),
	html2js = require('gulp-html2js'),
	path = require('path'),
	plumber = require('gulp-plumber'),
	rename = require('gulp-rename'),
	sass = require('gulp-sass'),
	sourcemaps = require('gulp-sourcemaps'),
	// uglifyify = require('uglifyify'),
	uglify = require('gulp-uglify'),
	webserver = require('gulp-webserver'),
	browserify = require('browserify'),
	tsify = require('tsify'),
	through2 = require('through2');

// var tsconfig = typescript.createProject("tsconfig.json");
var useTypescript = false;

// TYPESCRIPT
gulp.task('bundle:typescript', function() {
	return gulp.src('src/app/main.ts')
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(through2.obj(function(file, enc, next) {
				browserify(file.path)
					.plugin(tsify)
					.transform('babelify', { plugins: ['@babel/plugin-transform-flow-strip-types'], extensions: ['.ts'] })
					.bundle(function(error, response) {
						if (error) {
							console.log('browserify.bundle.error', error);
						} else {
							file.contents = response;
							next(null, file);
						}
					})
					.on('error', function(error) {
						console.error('browserify.error', error.toString());
					});
			}
			/*, function(done) {
				console.log('through2.done', error);
			}*/
		))
		.pipe(rename('main.js'))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('docs/js'));
});

// COMPILE
gulp.task('compile:sass', function() {
	var tasks = getCompilers('.scss').map(function(compile) {
		console.log(compile.inputFile);
		return gulp.src(compile.inputFile, {
				base: '.'
			})
			.pipe(plumber())
			.pipe(sass({
				includePaths: ['./node_modules/', __dirname + '/node_modules', 'node_modules'],
			}).on('compile:sass.error', function(error) {
				console.log('compile:sass.error', error);
			}))
			.pipe(autoprefixer()) // autoprefixer
			.pipe(rename(compile.outputFile))
			.pipe(gulp.dest('./'));
	});
	return merge(tasks);
});
gulp.task('compile', ['compile:sass']);

// BUNDLE

function doCssBundle(glob, bundle) {
	return glob
		.pipe(plumber())
		.pipe(concat(bundle.outputFileName))
		.pipe(gulp.dest('.'))
		.pipe(gulpif(bundle.minify && bundle.minify.enabled, cssmin()))
		.pipe(rename({
			extname: '.min.css'
		}))
		.pipe(gulp.dest('.'));
}
gulp.task('bundle:css', function() {
	var tasks = getBundles('.css').map(function(bundle) {
		return doCssBundle(gulp.src(bundle.inputFiles, {
			base: '.'
		}), bundle);
	});
	return merge(tasks);
});

function doJsBundle(glob, bundle) {
	return glob
		.pipe(plumber())
		.pipe(concat(bundle.outputFileName))
		.pipe(gulp.dest('.'))
		.pipe(sourcemaps.init())
		.pipe(gulpif(bundle.minify && bundle.minify.enabled, uglify()))
		.pipe(rename({
			extname: '.min.js'
		}))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('.'));
}
gulp.task('bundle:js', function() {
	var tasks = getBundles('.js').map(function(bundle) {
		return doJsBundle(gulp.src(bundle.inputFiles, {
			base: '.'
		}), bundle);
	});
	return merge(tasks);
});
gulp.task('bundle:partials', function() {
	return gulp.src('./artisan/**/*.html', {
			base: './artisan/'
		})
		.pipe(plumber())
		.pipe(rename(function(path) {
			path.dirname = path.dirname.split('\\').join('/');
			path.dirname = path.dirname.split('artisan/').join('');
			// path.basename += "-partial";
			path.extname = '';
			// console.log('path', path);
		}))
		.pipe(html2js('artisan-partials.js', {
			adapter: 'angular',
			// base: '.',
			name: 'artisan',
			fileHeaderString: '/* global angular: false */',
			quoteChar: '\'',
			indentString: '\t\t',
			singleModule: true,
			useStrict: true,
		}))
		.pipe(gulp.dest('./docs/js/')) // save .js
		.pipe(sourcemaps.init())
		.pipe(uglify()) // { preserveComments: 'license' }
		.pipe(rename({
			extname: '.min.js'
		}))
		.pipe(sourcemaps.write('./')) // save .map
		.pipe(gulp.dest('./docs/js/')); // save .min.js
});

gulp.task('bundle:snippets', function() {
	return gulp.src('./src/snippets/**/*.glsl', {
			base: './src/snippets/'
		})
		.pipe(plumber())
		.pipe(rename(function(path) {
			path.dirname = path.dirname.split('\\').join('/');
			path.dirname = path.dirname.split('src/snippets/').join('');
			path.extname = '';
		}))
		.pipe(concatutil('glsl.json', {
			process: function(source, filePath) {
				var folders = filePath.replace('src/snippets/', '').split(path.sep);
				var name = folders.join('.');
				var body = source.trim();
				var description = name;
				var r = /^\/\*(?:\s?)(.*)\*\//g.exec(body);
				if (r && r.length === 2) {
					description = r[1];
				}
				var item = {
					prefix: 'glsl.' + name,
					body: body,
					description: description,
				};
				item.body = body;
				return '\t"' + name + '":' + JSON.stringify(item, null, 2) + ",\n";
			}
		}))
		.pipe(concatutil('glsl.json', {
			process: function(source, filePath) {
				source = source.replace(new RegExp(',\n' + '$'), '\n');
				return "{\n" + source + "\n}";
			}
		}))
		.pipe(gulp.dest('./snippets/')); // save .json
});

// WATCH
gulp.task('watch', function(done) {
	function log(e) {
		console.log(e.type, e.path);
	}
	if (useTypescript) {
		gulp.watch('./src/app/**/*.ts', ['bundle:typescript']).on('change', log);
	}
	gulp.watch('./sass/**/*.scss', ['compile:sass']).on('change', log);
	getBundles('.css').forEach(function(bundle) {
		gulp.watch(bundle.inputFiles, function() {
			return doCssBundle(gulp.src(bundle.inputFiles, {
				base: '.'
			}), bundle);
		}).on('change', log);
	});
	getBundles('.js').forEach(function(bundle) {
		gulp.watch(bundle.inputFiles, function() {
			return doJsBundle(gulp.src(bundle.inputFiles, {
				base: '.'
			}), bundle);
		}).on('change', log);
	});
	gulp.watch('./artisan/**/*.html', ['bundle:partials']).on('change', log);
	// gulp.watch('./src/snippets/**/*.glsl', ['bundle:snippets']).on('change', log);
	gulp.watch('./compilerconfig.json', ['compile', 'bundle']).on('change', log);
	gulp.watch('./bundleconfig.json', ['bundle']).on('change', log);
	done();
});

// WEBSERVER
gulp.task('webserver', function() {
	return gulp.src('./docs/')
		.pipe(webserver({
			port: 6001,
			fallback: 'index.html',
			open: true,
			livereload: true,
			directoryListing: false,
		}));
});

if (useTypescript) {
	gulp.task('bundle', ['bundle:css', 'bundle:js']);
} else {
	gulp.task('bundle', ['bundle:css', 'bundle:js', 'bundle:typescript']);
}
// gulp.task('bundle', ['bundle:css', 'bundle:js', 'bundle:typescript', 'bundle:partials', 'bundle:snippets']);

gulp.task('default', ['compile', 'bundle', 'webserver', 'watch']);

gulp.task('start', ['compile', 'bundle', 'watch']);

// UTILS
function getCompilers(ext) {
	var data = getJson('./compilerconfig.json');
	if (data) {
		return data.filter(function(compile) {
			return new RegExp(`${ext}$`).test(compile.inputFile);
		});
	} else {
		return [];
	}
}

function getBundles(ext) {
	var data = getJson('./bundleconfig.json');
	if (data) {
		return data.filter(function(bundle) {
			return new RegExp(`${ext}$`).test(bundle.outputFileName);
		});
	} else {
		return [];
	}
}

function getJson(path) {
	if (fs.existsSync(path)) {
		var text = fs.readFileSync(path, 'utf8');
		// console.log('getJson', path, text);
		return JSON.parse(stripBom(text));
	} else {
		return null;
	}
}

function stripBom(text) {
	text = text.toString();
	if (text.charCodeAt(0) === 0xFEFF) {
		text = text.slice(1);
	}
	return text;
}
