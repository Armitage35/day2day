'use strict';

const gulp = require('gulp'),
	sass = require('gulp-sass'),
	sassPath = './src/**/*.sass';


gulp.task('sass', function() {
	return gulp.src(sassPath)
		.pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
		.pipe(gulp.dest('./src'));
});

gulp.task('sass:watch', function() {
	gulp.watch(sassPath, ['sass']);
});

gulp.task('default', ['sass', 'sass:watch']);
