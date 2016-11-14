'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var browserify = require('gulp-browserify');
var autoprefixer = require('gulp-autoprefixer');
var pug = require('gulp-pug');
var uglify = require('gulp-uglify');
var cleanCSS = require('gulp-clean-css');

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

gulp.task('js', function() {
	return gulp.src('app/js/app.js')
		.pipe(browserify())
		// .pipe(uglify())
		.pipe(gulp.dest('./public/js'))
		.pipe(reload({stream: true}));
});

gulp.task('serve', ['sass', 'pug', 'js'], function() {
	browserSync.init({
		server: './public',
		open: false,
		reloadOnRestart: true,
		notify: true,
		injectChanges: true
	});

	gulp.watch('app/sass/**/*.*', ['sass']);
	gulp.watch('app/views/**/*.*', ['pug']);
	gulp.watch('app/js/**/*.*', ['js']);
});

gulp.task('default', ['serve'])
