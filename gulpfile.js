var gulp = require('gulp');
var webserver = require('gulp-webserver');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

gulp.task('js-task',function(){
    gulp.src('js/**/*.js')
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('app/jsmin/'));
});

gulp.task('webserver', function() {
      gulp.src('app')
        .pipe(webserver({
            livereload: false,
            directoryListing: false,
            open: true
        }));
});

gulp.task("default",["webserver","js-task"]);
