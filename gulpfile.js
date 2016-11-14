'use strict';

var gulp = require('gulp');

var browserSync = require('browser-sync');
var reload = browserSync.reload;

var source = require('vinyl-source-stream');
var watchify = require('watchify');
var browserify = require('browserify');
var babelify = require('babelify');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');

var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var cleanCSS = require('gulp-clean-css');

var pug = require('gulp-pug');

var gutil = require('gulp-util');
var notify = require('gulp-notify');

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
	return buildScript('app.js', true); // browserify watch for JS changes
});

gulp.task('default', ['serve'])
