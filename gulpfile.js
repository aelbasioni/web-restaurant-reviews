﻿/*
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
var critical = require('critical');


var config = {
    //Include all js files but exclude any min.js files
    src: {
        //js: ['./src/js/*.js', '!./src/js/*.min.js'],
        js_common: ['./src/js/localForage.min.js', './src/js/dbhelper.js', './src/js/registerserviceworker.js'],
        //js_index: ['./src/js/main.js'],
        //js_restaurant_info: ['./src/js/restaurant_info.js'],
        js_index: ['./src/js/localForage.min.js', './src/js/dbhelper.js', './src/js/main.js', './src/js/registerserviceworker.js'],
        js_restaurant_info: ['./src/js/localForage.min.js', './src/js/dbhelper.js', './src/js/restaurant_info.js', './src/js/registerserviceworker.js'],
        //js_index: ['./src/js/dbhelper.js', './src/js/main.js', './src/js/registerserviceworker.js'],
        //js_restaurant_info: ['./src/js/dbhelper.js', './src/js/restaurant_info.js', './src/js/registerserviceworker.js'],
        css: ['./src/css/*.css', '!./src/css/*.min.css'],
        img: './src/img/*.jpg',
        html: './src/*.html',
        root: './src/',
        polyfills: './src/js/polyfills/*.js'
    },
    dist: {
        js: './dist/js/',
        css: './dist/css/',
        img: './dist/img/',
        html: './dist/',
        root: './dist/',
        polyfills: './dist/js/polyfills/'
    }
}

gulp.task('copy', function () {
    //gulp.src(config.src.root + '/web.config').pipe(gulp.dest(config.dist.root)),
    gulp.src(config.src.root + 'sw.js').pipe(gulp.dest(config.dist.root)),
    //gulp.src(config.src.root + 'js/map.js').pipe(gulp.dest(config.dist.js)),
    gulp.src(config.src.root + 'manifest.json').pipe(gulp.dest(config.dist.root)),
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
        .pipe(sourcemaps.init())
        .pipe(concat('style.min.css'))
        .pipe(cleanCSS())
        .pipe(sourcemaps.write("./"))
        .pipe(gulp.dest(config.dist.css));
});

gulp.task('js_polyfills:dist', function () {
    return gulp.src(config.src.polyfills)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(uglify())
        .pipe(sourcemaps.write("./"))
        .pipe(gulp.dest(config.dist.polyfills));
});


gulp.task('js_common:dist', function () {
    return gulp.src(config.src.js_common)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(concat('common.min.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write("./"))
        .pipe(gulp.dest(config.dist.js));
});


gulp.task('js_index:dist', function () {
    return gulp.src(config.src.js_index)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(concat('script_index.min.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write("./"))
        .pipe(gulp.dest(config.dist.js));
});

gulp.task('js_info:dist', function () {
    return gulp.src(config.src.js_restaurant_info)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(concat('script_info.min.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write("./"))
        .pipe(gulp.dest(config.dist.js));
});

gulp.task('copy:dist', ['html:dist', 'css:dist', 'js_common:dist','js_index:dist', 'js_info:dist', 'js_polyfills:dist','copy']);



gulp.task('css:critical_index', function (cb) {
    critical.generate({
        base: config.dist.root,
        src: 'index.html',
        css: [config.dist.root+'css/style.min.css'],
        dimensions: [{
            width: 320,
            height: 480
        }, {
            width: 768,
            height: 1024
        }, {
            width: 1280,
            height: 960
        }],
        dest: 'css/critical_index.css',
        minify: true,
        extract: false,
        ignore: ['font-face']
    });
});

gulp.task('css:critical_info', function (cb) {
    critical.generate({
        base: config.dist.root,
        src: 'restaurant.html',
        css: [config.dist.root+'css/style.min.css'],
        dimensions: [{
            width: 320,
            height: 480
        }, {
            width: 768,
            height: 1024
        }, {
            width: 1280,
            height: 960
        }],
        dest: 'css/critical_info.css',
        minify: true,
        extract: false,
        ignore: ['font-face']
    });
});


gulp.task('watch', function () {
    gulp.watch([config.src.html], ['html:dist']);
    gulp.watch([config.src.css], ['css:dist']);
    gulp.watch([config.src.js_index], ['js_index:dist']);
    gulp.watch([config.src.js_restaurant_info], ['js_info:dist']);
    //gulp.watch([config.src.root + '/web.config', config.src.root + '/sw.js', 'data/*.json'], ['copy']);
    gulp.watch([config.src.root + 'sw.js', config.src.root + 'js/map.js', config.src.root + 'manifest.json', config.src.root + 'data/*.json'], ['copy']);
});

//Set a default tasks
gulp.task('default', ['copy:dist','watch','css:critical_index','css:critical_info'], function () {
    // place code for your default task here
});