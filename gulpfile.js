var gulp = require('gulp');
var webserver = require('gulp-webserver');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

gulp.task('js-task',function(){
  return gulp.src('js/src/**/*.js')
  .pipe(uglify())
  .pipe(rename({suffix: '.min'}))
  .pipe(gulp.dest('app/jsmin/'));
});

gulp.task("js-lib-task",function(){
  return gulp.src("js/lib/*.js")
  .pipe(gulp.dest("app/jsmin/lib/"));
});

gulp.task('webserver', function() {
  gulp.src('app')
  .pipe(webserver({
    livereload: true
  }));
});

gulp.task("watch",function(){
  return gulp.watch("js/src/**/*.js", ["js-task"]);
});

gulp.task("default",["webserver","js-task","js-lib-task", "watch"]);
gulp.task("build",["js-task","js-lib-task"]);
