var gulp = require('gulp');
var coffee = require('gulp-coffee');
var gutil = require('gulp-util');
var codo = require('gulp-codo');

gulp.task('codo', function () {
    return gulp.src('kanilayer.coffee')
        .pipe(codo({
            name: 'Kanilayer',
            title: 'Haika Layer Manager for OpenLayers3',
            readme: 'README.md'
        })
    );
});

gulp.task('default', [], function () {
    return gulp.src('kanilayer.coffee')
        .pipe(coffee({bare: true}).on('error', gutil.log))
        .pipe(gulp.dest('./')
    );
});
