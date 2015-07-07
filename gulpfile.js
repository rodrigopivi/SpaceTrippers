var gulp    = require('gulp');
var tslint  = require('gulp-tslint');
var typescript = require('gulp-tsc');
var gulp    = require('gulp-help')(gulp);

gulp.task('tslint', 'Lints all TypeScript source files', function () {
  return gulp.src('src/**/*.ts')
  .pipe(tslint())
  .pipe(tslint.report('verbose'));
});

gulp.task('build','Compiles all TypeScript source files', function () {
  gulp.src(['src/**/*.ts'])
    .pipe(typescript({
    	module: "CommonJS",
		sourceMap: true,
		declaration: true,
		out: "app.js"
    }))
    .pipe(gulp.dest('dist/'))
});