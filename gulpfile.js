/*
This file in the main entry point for defining Gulp tasks and using Gulp plugins.
Click here to learn more. http://go.microsoft.com/fwlink/?LinkId=518007
*/

var gulp = require("gulp");
var htmlclean = require('gulp-htmlclean');
var cleanCSS = require('gulp-clean-css');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var babel = require('gulp-babel');
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');

var config = {
    //Include all js files but exclude any min.js files
    src: {
        //js: ['./restaurant/js/*.js', '!./restaurant/js/*.min.js'],
        js_index: ['./restaurant/js/localForage.min.js', './restaurant/js/dbhelper.js', './restaurant/js/main.js'],
        js_restaurant_info: ['./restaurant/js/localForage.min.js', './restaurant/js/dbhelper.js', './restaurant/js/restaurant_info.js'],
        css: ['./restaurant/css/*.css', '!./restaurant/css/*.min.css'],
        img: './restaurant/img/*.jpg',
        html: './restaurant/*.html',
        root: './restaurant/'
    },
    dist: {
        js: './dist/js/',
        css: './dist/css/',
        img: './dist/img/',
        html: './dist/',
        root: './dist/',
    }
}

gulp.task('copy', function () {
    //gulp.src(config.src.root + '/web.config').pipe(gulp.dest(config.dist.root)),
    gulp.src(config.src.root + '/sw.js').pipe(gulp.dest(config.dist.root)),
    gulp.src(config.src.root + 'data/*.json').pipe(gulp.dest(config.dist.root + 'data/'))
    
});

gulp.task('html:dist', function () {
    return gulp.src(config.src.html)
        .pipe(plumber())      
        .pipe(htmlclean())
        .pipe(gulp.dest(config.dist.html));
});

gulp.task('css:dist', function () {
    return gulp.src(config.src.css)
        .pipe(plumber())
        .pipe(concat('style.min.css'))
        .pipe(cleanCSS())
        .pipe(gulp.dest(config.dist.css));
});


gulp.task('js_index:dist', function () {
    return gulp.src(config.src.js_index)
        .pipe(plumber())
        //.pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(concat('script_index.min.js'))
        .pipe(uglify())
        //.pipe(sourcemaps.write())
        .pipe(gulp.dest(config.dist.js));
});

gulp.task('js_info:dist', function () {
    return gulp.src(config.src.js_restaurant_info)
        .pipe(plumber())
        //.pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(concat('script_info.min.js'))
        .pipe(uglify())
        //.pipe(sourcemaps.write())
        .pipe(gulp.dest(config.dist.js));
});

gulp.task('copy:dist', ['html:dist', 'css:dist', 'js_index:dist', 'js_info:dist', 'copy']);


gulp.task('watch', function () {
    gulp.watch([config.src.html], ['html:dist']);
    gulp.watch([config.src.css], ['css:dist']);
    gulp.watch([config.src.js_index], ['js_index:dist']);
    gulp.watch([config.src.js_restaurant_info], ['js_info:dist']);
    //gulp.watch([config.src.root + '/web.config', config.src.root + '/sw.js', 'data/*.json'], ['copy']);
    gulp.watch([config.src.root + '/sw.js', 'data/*.json'], ['copy']);
});

//Set a default tasks
gulp.task('default', ['copy:dist','watch'], function () {
    // place code for your default task here
});