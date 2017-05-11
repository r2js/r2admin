const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const browserify = require('browserify');
const babelify = require('babelify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const path = require('path');
const concat = require('gulp-concat');
const minifyCSS = require('gulp-minify-css');

const vendors = [
  'jquery',
  'selectize',
  'debug',
  'tinymce/tinymce',
  'tinymce/themes/modern/theme',
  'tinymce/plugins/paste',
  'tinymce/plugins/link',
];

const vendorStyles = [
  './node_modules/bootstrap/dist/css/bootstrap.min.css',
  './node_modules/selectize/dist/css/selectize.bootstrap3.css',
  './app/styles/theme.css',
  './node_modules/float-labels.js/dist/float-labels.css',
];

const appStyles = [
  './app/styles/demo.css',
  './app/styles/nav.css',
  './app/styles/main.css',
];

gulp.task('build:vendor', () => {
  const b = browserify({ debug: true });
  vendors.forEach(lib => b.require(lib));
  b.bundle()
  .pipe(source('vendor.js'))
  .pipe(buffer())
  .pipe($.uglify())
  .pipe($.sourcemaps.init({ loadMaps: true }))
  .pipe($.sourcemaps.write('./'))
  .pipe(gulp.dest('public/dist'));
});

gulp.task('build:app', () => {
  browserify({
    entries: ['app/index.js'],
    extensions: ['.js'],
    debug: true,
  })
  .external(vendors)
  .transform(babelify, { presets: ['es2015'] })
  .bundle()
  .pipe(source('app.js'))
  .pipe(buffer())
  .pipe($.uglify())
  .pipe($.sourcemaps.init({ loadMaps: true }))
  .pipe($.sourcemaps.write('./'))
  .pipe(gulp.dest('public/dist'));
});

gulp.task('lint', () => (
  gulp.src(['app/**/*.js'])
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.eslint.failAfterError())
));

gulp.task('images', () => (
  gulp.src('app/images/**/*')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true,
    })))
    .pipe(gulp.dest('public/dist/images'))
    .pipe($.size({ title: 'images' }))
));

gulp.task('fonts', () => (
  gulp.src([
    'app/fonts/**/*',
    'node_modules/bootstrap/dist/fonts/**/*',
  ])
    .pipe($.flatten())
    .pipe(gulp.dest('public/dist/fonts'))
));

gulp.task('styles:app', () => (
  gulp.src(appStyles)
   .pipe(minifyCSS())
   .pipe(concat('app.css'))
   .pipe(gulp.dest('public/dist'))
));

gulp.task('styles:vendor', () => (
  gulp.src(vendorStyles)
   .pipe(minifyCSS())
   .pipe(concat('vendor.css'))
   .pipe(gulp.dest('public/dist'))
));

gulp.task('less', () => (
  gulp.src('app/less/**/*.less')
    .pipe($.less({
      paths: [path.join(__dirname, 'less', 'includes')],
    }))
    .pipe(gulp.dest('app/styles'))
));

gulp.task('run', ['less', 'styles:vendor', 'styles:app', 'build:vendor', 'build:app'], () => {
  gulp.watch([
    'views/**/*.html',
    'app/**/*.js',
  ], ['build:app']);

  gulp.watch('app/styles/**/*.css', ['styles:app']);
  gulp.watch('app/less/**/*.less', ['less']);
});
