var gulp = require('gulp');
var connect = require('gulp-connect');
var swig = require('gulp-swig');
var stylus = require('gulp-stylus');
var plumber = require('gulp-plumber');
var inlineCss = require('gulp-inline-css');
var data = require('gulp-data');
var rename = require('gulp-rename');
var path = require('path');
var jade = require('gulp-jade');
var dom = require('gulp-dom');


var src = {
    html: ['./src/projects/*/*.html'],
    jade: ['./src/projects/*/*.jade'],
    stylus: ['./src/projects/*/styl/*.styl']
}
var watch = {
    html: ['./src/**/*.html'],
    jade: ['./src/**/*.jade'],
    stylus: ['./src/**/*.styl']
}
var getJsonData = function (file) {
    var name = path.dirname(file.path);
    name = name.split('/');
    name = name[name.length - 1];
    console.log(name)
    return require('./data/' + name + '.json')
}
gulp.task('connect', function () {
    connect.server({
        root: 'build',
        livereload: true
    });
});

gulp.task('stylus', function () {
    gulp.src(src.stylus)
        .pipe(plumber())
        .pipe(stylus())
        .pipe(gulp.dest('build/'))
});
function rename_element(node,name) {
}
gulp.task('inline', function () {

    gulp.src('./build/*/*.html')
        .pipe(inlineCss({
            applyStyleTags: true,
            applyLinkTags: true,
            removeStyleTags: false,
            removeLinkTags: true
        }))
        .pipe(dom(function(){
            var p = this.querySelectorAll('p'), i;
            for (i = 0; i < p.length; ++i) {

                var d = this.createElement('div');
                d.innerHTML = p[i].innerHTML;
                d.setAttribute('style', p[i].getAttribute('style'))

                p[i].parentNode.insertBefore(d, p[i]);
                p[i].parentNode.removeChild(p[i]);
            }
            return this;
        }))
        .pipe(rename({
            suffix: '-inline'
        }))
        .pipe(gulp.dest('build/_inline'))
})
gulp.task('html', function () {
    gulp.src(src.html)
        .pipe(plumber())
        .pipe(data(getJsonData))
        .pipe(swig({
            defaults: {cache: false},
        }))
        .pipe(gulp.dest('build/'))
        .pipe(connect.reload());
});
gulp.task('html-jade', function () {
    gulp.src(src.jade)
        .pipe(plumber())
        .pipe(data(getJsonData))
        .pipe(jade({
            pretty: true,
        }))
        .pipe(gulp.dest('build/'))
        .pipe(connect.reload());
});
gulp.task('render', ['stylus', 'html', 'html-jade'])

gulp.task('watch', function () {
    gulp.watch([watch.html], ['render']);
    gulp.watch([watch.stylus], ['render']);
    gulp.watch([watch.jade], ['render']);
});

gulp.task('default', ['watch', 'connect', 'render']);
