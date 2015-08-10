/*
 * Created with Sublime Text 2.
 * license: http://www.lovewebgames.com/jsmodule/index.html
 * User: 田想兵
 * Date: 2015-04-27
 * Time: 15:15:51
 * Contact: 55342775@qq.com
 */
var gulp = require('gulp'),
    rjs = require('gulp-requirejs'),
    uglify = require('gulp-uglify'),
    cssmin = require('gulp-minify-css'),
    watchF = require('gulp-watch');
var paths = {
    script: 'src/*.js',
    css: 'src/*.css',
    img:'src/*.png'
};
gulp.task('js', function() {
    return gulp.src(paths.script).pipe(uglify()).pipe(gulp.dest('dist'));
});
gulp.task('css', function() {
    return gulp.src(paths.css)
        .pipe(cssmin({
            compatibility: 'ie8'
        })) //兼容ie
        .pipe(gulp.dest('dist'))
        .pipe(gulp.dest('dest'));
});
gulp.task('img', function() {
    return gulp.src(paths.img)
        .pipe(gulp.dest('dist'))
        .pipe(gulp.dest('dest'));
});
gulp.task('requirejs', function() {
    return rjs({
            "name": "tip",
            "baseUrl": "src",
            "out": "tip.js",
            shim: {
                '$': {
                    exports: '_'
                }
            },
            "paths": {
                $:"jquery-1.11.2"
            },
            exclude:["$"],
            //这里不打包zepto
            // map: {
            //     "*": {
            //         "$": "jquery-private"
            //     },
            //     "jquery-private": {}
            // }
            // ... more require.js options
        }).pipe(uglify())
        .pipe(gulp.src(['src/jquery-1.11.2.js', 'src/require.js']).pipe(uglify()))
        .pipe(gulp.dest('dest')); // pipe it to the output DIR
});
gulp.task('watch',function(){
    watchF(['src/*.*','html/*.*'],function(){
        gulp.start('default')
    });
});
gulp.task('default', ['js', 'css','img']);