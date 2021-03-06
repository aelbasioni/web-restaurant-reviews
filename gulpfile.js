﻿/*
This file in the main entry point for defining Gulp tasks and using Gulp plugins.
Click here to learn more. http://go.microsoft.com/fwlink/?LinkId=518007
*/

var gulp = require("gulp");
var $ = require('gulp-load-plugins')();
var critical = require('critical');


var config = {
    //Include all js files but exclude any min.js files
    src: {
        root: './src/',
        js_common: ['./src/js/localForage.min.js', './src/js/dbhelper.js', './src/js/registerserviceworker.js'],
        //js_index: ['./src/js/main.js'],
        //js_restaurant_info: ['./src/js/restaurant_info.js'],
        js_index: ['./src/js/localForage.min.js', './src/js/dbhelper.js', './src/js/main.js', './src/js/registerserviceworker.js'],
        js_restaurant_info: ['./src/js/localForage.min.js', './src/js/dbhelper.js', './src/js/restaurant_info.js', './src/js/registerserviceworker.js'],
        css: ['./src/css/*.css', '!./src/css/*.min.css'],
        html: './src/*.html',
        img: './src/img/*.jpg',
        img_logo: './src/img/logo.png',
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


/*
 * copy files from src to dist
 */
gulp.task('copy', function () {
    gulp.src(config.src.root + 'sw.js').pipe(gulp.dest(config.dist.root)),
    gulp.src(config.src.root + 'manifest.json').pipe(gulp.dest(config.dist.root)),
    gulp.src(config.src.root + 'data/*.json').pipe(gulp.dest(config.dist.root + 'data/'))    
});


/*
 * minimize html files
 */
gulp.task('html:dist', function () {
    return gulp.src(config.src.html)
        .pipe($.plumber())
        .pipe($.htmlclean())
        .pipe(gulp.dest(config.dist.html));
});


/*
 * Add vendor prefixes to CSS rules, bundle, minimize, and generate source map for the final css file
 */
gulp.task('css:dist', function () {
    return gulp.src(config.src.css)
        .pipe($.plumber())
        .pipe($.sourcemaps.init())
        .pipe($.autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe($.concat('style.min.css'))
        .pipe($.cleanCss())
        .pipe($.sourcemaps.write("./"))
        .pipe(gulp.dest(config.dist.css));
});


/*
 * transpile polyfill files, uglify them, and add source map to them
 */
gulp.task('js_polyfills:dist', function () {
    return gulp.src(config.src.polyfills)
        .pipe($.plumber())
        .pipe($.sourcemaps.init())
        .pipe($.babel())
        .pipe($.uglify())
        .pipe($.sourcemaps.write("./"))
        .pipe(gulp.dest(config.dist.polyfills));
});


/*
 * transpile common js files, bundle, uglify, and add source map to them
 */
gulp.task('js_common:dist', function () {
    return gulp.src(config.src.js_common)
        .pipe($.plumber())
        .pipe($.sourcemaps.init())
        .pipe($.babel())
        .pipe($.concat('common.min.js'))
        .pipe($.uglify())
        .pipe($.sourcemaps.write("./"))
        .pipe(gulp.dest(config.dist.js));
});


/*
 * transpile js files for index.html page, bundle, uglify them, and add source map to them
 */
gulp.task('js_index:dist', function () {
    return gulp.src(config.src.js_index)
        .pipe($.plumber())
        .pipe($.sourcemaps.init())
        .pipe($.babel())
        .pipe($.concat('script_index.min.js'))
        .pipe($.uglify())
        .pipe($.sourcemaps.write("./"))
        .pipe(gulp.dest(config.dist.js));
});


/*
 * transpile js files for restaurant.html page, bundle, uglify them, and add source map to them
 */
gulp.task('js_info:dist', function () {
    return gulp.src(config.src.js_restaurant_info)
        .pipe($.plumber())
        .pipe($.sourcemaps.init())
        .pipe($.babel())
        .pipe($.concat('script_info.min.js'))
        .pipe($.uglify())
        .pipe($.sourcemaps.write("./"))
        .pipe(gulp.dest(config.dist.js));
});


gulp.task('copy:dist', ['html:dist', 'css:dist', 'js_index:dist', 'js_info:dist', 'js_polyfills:dist','copy']);


/*
 * generate the critical css for index.html page and minimize it
 */
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


/*
 * generate the critical css for restaurant.html page and minimize it
 */
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


/*** monitor change of images in src then rezise, optimize, and add the size prefixe to the image name ***/


//resize to width 800
gulp.task('img-opt-large', function () {
    gulp.src(config.src.img)
    .pipe($.changed(config.dist.img))
    .pipe($.imageResize({ width: 800 }))
    .pipe($.imagemin({ progressive: true, optimizationLevel: 10 }))
    .pipe($.rename({ suffix: '-800px' }))
    .pipe(gulp.dest(config.dist.img))
});


//resize to width 800 and webp
gulp.task('img-webp-large', function () {
    gulp.src(config.src.img)
    .pipe($.changed(config.dist.img))
    .pipe($.webp())
    .pipe($.imagemin({ progressive: true, optimizationLevel: 10 }))
    .pipe($.rename({ suffix: '-800px' }))
    .pipe(gulp.dest(config.dist.img))
});


//resize to width 650
gulp.task('img-resize-medium2', function () {
    gulp.src(config.src.img)
    .pipe($.changed(config.dist.img))
    .pipe($.imageResize({ width: 650 }))
    .pipe($.imagemin({ progressive: true, optimizationLevel: 10 }))
    .pipe($.rename({ suffix: '-650px' }))
    .pipe(gulp.dest(config.dist.img))

});


//resize to width 420
gulp.task('img-resize-medium', function () {
    gulp.src(config.src.img)
    .pipe($.changed(config.dist.img))
    .pipe($.imageResize({ width: 420 }))
    .pipe($.imagemin({ progressive: true, optimizationLevel: 10 }))
    .pipe($.rename({ suffix: '-420px' }))
    .pipe(gulp.dest(config.dist.img))
});


//resize to width 300
gulp.task('img-resize-small', function () {
    gulp.src(config.src.img)
    .pipe($.changed(config.dist.img))
    .pipe($.imageResize({ width: 300 }))
    .pipe($.imagemin({ progressive: true, optimizationLevel: 10 }))
    .pipe($.rename({ suffix: '-300px' }))
    .pipe(gulp.dest(config.dist.img))

});


//resize to width 650 & webp
gulp.task('img-resize-medium2-webp', function () {
    gulp.src(config.src.img)
    .pipe($.changed(config.dist.img))
    .pipe($.imageResize({ width: 650 }))
    .pipe($.webp())
    .pipe($.imagemin({ progressive: true, optimizationLevel: 10 }))
    .pipe($.rename({ suffix: '-650px' }))
    .pipe(gulp.dest(config.dist.img))

});


//resize to width 420 & webp
gulp.task('img-resize-medium-webp', function () {
    gulp.src(config.src.img)
    .pipe($.changed(config.dist.img))
    .pipe($.imageResize({ width: 420 }))
    .pipe($.webp())
    .pipe($.imagemin({ progressive: true, optimizationLevel: 10 }))
    .pipe($.rename({ suffix: '-420px' }))
    .pipe(gulp.dest(config.dist.img))
});


//resize to width 300 & webp
gulp.task('img-resize-small-webp', function () {
    gulp.src(config.src.img)
    .pipe($.changed(config.dist.img))
    .pipe($.imageResize({ width: 300 }))
    .pipe($.webp())
    .pipe($.imagemin({ progressive: true, optimizationLevel: 10 }))
    .pipe($.rename({ suffix: '-300px' }))
    .pipe(gulp.dest(config.dist.img))

});


/*
* monitor change in the logo then rezise & optimize it
 */
gulp.task('logo-resize', function () {
    gulp.src(config.src.img_logo)
    .pipe($.changed(config.dist.img))
    .pipe($.imageResize({ width: 100 }))
    .pipe($.imagemin({ progressive: true, optimizationLevel: 10 }))
    .pipe(gulp.dest(config.dist.img))

});


gulp.task('img-resize', ['img-opt-large', 'img-webp-large', 'img-resize-medium', 'img-resize-small','logo-resize']);
gulp.task('img-resize-webp', ['img-resize-medium2-webp', 'img-resize-medium-webp', 'img-resize-small-webp']);


/*
 * monitor any change to re-run the tasks
 */
gulp.task('watch', function () {
    gulp.watch([config.src.html], ['html:dist']);
    gulp.watch([config.src.css], ['css:dist']);
    gulp.watch([config.src.js_index], ['js_index:dist']);
    gulp.watch([config.src.js_restaurant_info], ['js_info:dist']);
    gulp.watch([config.src.root + 'sw.js', config.src.root + 'js/map.js', config.src.root + 'manifest.json', config.src.root + 'data/*.json'], ['copy']);
});


//Set a default tasks
gulp.task('default', ['copy:dist','watch','css:critical_index','css:critical_info'], function () {
    // place code for your default task here
});

