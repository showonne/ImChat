'use strict';

import gulp from 'gulp';
import sass from 'gulp-sass';
import autoprefixer from 'gulp-autoprefixer';
import nodemon from 'gulp-nodemon';
import browserSync from 'browser-sync';
import minifyCss from 'gulp-minify-css';
import rename from 'gulp-rename';
import clean from 'gulp-clean';
import babel from 'gulp-babel';
import plumber from 'gulp-plumber';

gulp.task('clean', () => {
    return gulp.src('./public/stylesheets/*.css')
               .pipe(clean());
});

gulp.task('sass',['clean'], () => {
    return gulp.src('./public/sass/*.scss')
               .pipe(sass().on('error', sass.logError))
               .pipe(autoprefixer())
               .pipe(gulp.dest('./public/stylesheets/'))
});

gulp.task('minify', ['sass'], () => {
   gulp.src('./public/stylesheets/*.css')
       .pipe(minifyCss())
       .pipe(rename({suffix: '.min'}))
       .pipe(gulp.dest('./public/stylesheets/'))
       .pipe(browserSync.reload({stream: true}));
});

gulp.task('es6', () => {
    return gulp.src('./public/javascripts/*.js')
        .pipe(plumber())
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest('./public/dist/'));
});

gulp.task('server', ['nodemon'], () => {
    browserSync.init({
        proxy: "http://localhost:3000",
        files: ['public/stylesheets/*.css'],
        port: 4000
    });
    gulp.watch('./public/sass/*.scss', ['minify']);
    gulp.watch('./views/*.ejs').on('change', browserSync.reload);
});

gulp.task('nodemon', (cb) => {
    let called = false;

    return nodemon({
        script: './app.js',
        ext: 'js',
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

gulp.task('default', ['minify', 'es6', 'server'], function(){
    gulp.watch('./public/javascripts/*.js', ['es6']);
});
