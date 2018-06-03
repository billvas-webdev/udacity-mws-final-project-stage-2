/* eslint-env node */
/* eslint max-len: ["error", { "code": 100 }]*/
/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "watch" }]*/

let gulp = require('gulp');
let sass = require('gulp-sass');
let autoprefixer = require('gulp-autoprefixer');
let browserSync = require('browser-sync').create();
let concat = require('gulp-concat');
let eslint = require('gulp-eslint');
let uglify = require('gulp-uglify');
let babel = require('gulp-babel');
let watch = require('gulp-watch');
let sourcemaps = require('gulp-sourcemaps');
let imagemin = require('gulp-imagemin');
let pngquant = require('imagemin-pngquant');
let cleanCSS = require('gulp-clean-css');
// let gzip = require('gulp-gzip');

gulp.task('default', ['copy-html', 'copy-images', 'styles'], function() {
 gulp.watch('sass/**/*.scss', ['styles']);
 gulp.watch('/*.html', ['copy-html']);
  browserSync.init({
    server: './dist',
    port: 8000,
  });
 gulp.watch('./*.html').on('change', browserSync.reload);
});

gulp.task('dist', [
 'copy-html',
 'copy-images',
 'styles',
 'scripts-dist',
]);

gulp.task('imagemin', function() {
 return gulp.src('img/*')
 .pipe(imagemin({
  progressive: true,
  use: [pngquant()],
  }))
  .pipe(gulp.dest('dist/img'));
});

gulp.task('styles', function() {
 gulp.src('sass/**/*.scss')
 .pipe(sass({
  outputStyle: 'compressed',
  }).on('error', sass.logError))
  .pipe(autoprefixer({
  browsers: ['last 2 versions'],
  }))
 .pipe(gulp.dest('./dist/css'))
 .pipe(browserSync.stream());
});

gulp.task('min-css', function() {
  gulp.src('css/*.css')
    .pipe(sourcemaps.init())
    .pipe(cleanCSS())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/css'));
});


// gulp.task('gzip', function() {
//  gulp.src('js/**/*.js')
//  .pipe(gzip())
//  .pipe(gulp.dest('dist/js'));
// });

gulp.task('copy-html', function() {
 gulp.src('./*.html')
 .pipe(gulp.dest('./dist'));
});

gulp.task('copy-images', function() {
 gulp.src('img/*')
 .pipe(gulp.dest('dist/img'));
});

gulp.task('scripts', function() {
 gulp.src('js/**/*.js')
 .pipe(babel())
 // .pipe(concat('all.js'))
 .pipe(gulp.dest('dist/js'));
});

gulp.task('scripts-dist', function() {
 gulp.src('js/*.js')
 .pipe(sourcemaps.init())
 .pipe(babel({presets: ['es2015']}))
 .pipe(concat('all.js'))
 .pipe(uglify())
 .pipe(sourcemaps.write())
 .pipe(gulp.dest('dist/js'));
});


gulp.task('lint', function() {
 return gulp.src(['js/**/*.js'])
// eslint() attaches the lint output to the eslint property
// of the file object so it can be used by other modules.
 .pipe(eslint())
// eslint.format() outputs the lint results to the console.
// Alternatively use eslint.formatEach() (see Docs).
 .pipe(eslint.format())
// To have the process exit with an error code (1) on
// lint error, return the stream and pipe to failOnError last.
 .pipe(eslint.failOnError());
});

gulp.task('test', function() {
  console.log('Gulp testing message!');
});

