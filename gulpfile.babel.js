'use strict';

import gulp from 'gulp';
import sass from 'gulp-sass';
import autoprefixer from 'gulp-autoprefixer';
import nodemon from 'gulp-nodemon';
var browserSync = require('browser-sync').create();

gulp.task('sass', () => {
    gulp.src('./public/sass/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(gulp.dest('./public/stylesheets'))
    .pipe(browserSync.stream());
});

gulp.task('server', ['nodemon'], () => {
    browserSync.init(null, {
        proxy: "http://localhost:3000",
        files: ['public/stylesheets/*.css'],
        browser: "google chrome",
        port: 4000
    });
    gulp.watch('./public/sass/*.scss', ['sass']);
});

gulp.task('nodemon', (cb) => {
    let called = false;

    return nodemon({
        script: './app.js',
        ext: 'ejs js',
        ignore: ['public/**']
    }).on('start', () => {
        if(!called){
            cb();
        }
        called = true;
    }).on('restart', () => {
       console.log("restart!");
    });
});

gulp.task('default', ['server']);
