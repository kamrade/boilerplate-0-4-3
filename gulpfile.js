'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var browserify = require('browserify');
var autoprefixer = require('gulp-autoprefixer');
var pug = require('gulp-pug');
var uglify = require('gulp-uglify');
var cleanCSS = require('gulp-clean-css');

var source = require('vinyl-source-stream');
var gutil = require('gulp-util');
var buffer = require('vinyl-buffer');
var notify = require('gulp-notify');
var watchify = require('watchify');
var babelify = require('babelify');

gulp.task('sass', function() {
	return gulp.src('app/sass/styles.sass')
		.pipe(sass().on('error', sass.logError))
		.pipe(autoprefixer({
			browsers: ['last 2 versions', '> 1%', 'IE 8'],
			cascade: false
		}))
		// .pipe(cleanCSS({ compatibility: 'ie8' }))
		.pipe(gulp.dest('public/css'))
		.pipe(reload({stream: true}));
});

gulp.task('pug', function() {
	return gulp.src('app/views/*.pug')
		.pipe(pug({
			pretty:true
		}))
		.pipe(gulp.dest('./public'))
		.pipe(reload({stream: true}));
});

// gulp.task('js', function() {
// 	return gulp.src('app/js/app.js')
// 		.pipe(browserify())
// 		// .pipe(uglify())
// 		.pipe(gulp.dest('./public/js'))
// 		.pipe(reload({stream: true}));
// });

function handleErrors() {
	var args = Array.prototype.slice.call(arguments);
	notify.onError({
		title: 'Compile Error',
		message: '<%= error.message %>'
	}).apply(this, args);
	this.emit('end');
}

function buildScript(file, watch) {
	var props = {
		entries: ['./app/js/' + file],
		debug: true,
		cache: {},
		packageCache: {},
		transform: [babelify.configure({
			presets: ["es2015"]
		})]
	};

	// watchify if watch requested, otherwise run browserify() once
	var bundler = watch ? watchify(browserify(props)) : browserify(props);

	function rebundle() {
		var stream = bundler.bundle();
		return stream
						.on('error', handleErrors)
						.pipe(source(file))
						// .pipe(buffer())
						// .pipe(uglify())
						.pipe(gulp.dest('./public/js/'))
						.pipe(reload({stream: true}));
	}

	bundler.on('update', function() {
		rebundle();
		gutil.log('Rebundle...');
	});
	return rebundle();
}

gulp.task('scripts', function() {
	return buildScript('app.js', false); // this will once run once because we set watch to false
});

gulp.task('serve', ['sass', 'pug', 'scripts'], function() {
	browserSync.init({
		server: './public',
		open: false,
		reloadOnRestart: true,
		notify: true,
		injectChanges: true
	});
	gulp.watch('app/sass/**/*.*', ['sass']);
	gulp.watch('app/views/**/*.*', ['pug']);
	// gulp.watch('app/js/**/*.*', ['js']);
	return buildScript('app.js', true); // browserify watch for JS changes
});

gulp.task('default', ['serve'])
