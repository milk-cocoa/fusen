var gulp = require('gulp');
var webserver = require('gulp-webserver');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var gulpUtil = require('gulp-util');

gulp.task('js-task',function(){
    return gulp.src('js/src/*.js')
        .pipe(uglify().on('error', gulpUtil.log))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('jsmin/'));
});

gulp.task("js-lib-task",function(){
    return gulp.src("js/lib/*.js")
        .pipe(gulp.dest("jsmin/lib/"));
});

gulp.task('webserver', function() {
      gulp.src('./')
        .pipe(webserver({
            livereload: false,
            directoryListing: false,
            open: true
        }));
});

gulp.task("watch",function(){
    return gulp.watch("js/**/*.js",["js-task"]);
});

gulp.task("default",["webserver","js-task","js-lib-task"]);
