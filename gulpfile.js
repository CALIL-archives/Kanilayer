var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

gulp.task('default', function () {
  return browserify('./kanilayer.es2015.js')
    .transform('babelify', {presets: ['es2015']})
    .bundle()
    .pipe(source('kanilayer.js'))
    .pipe(gulp.dest('./'));
});
