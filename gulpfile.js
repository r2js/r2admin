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
  'bootstrap',
  'bootstrap-table',
  'selectize',
  'flatpickr',
  'dropzone',
  'filesize',
  'debug',
  'tinymce/tinymce',
  'tinymce/themes/modern/theme',
  'tinymce/plugins/advlist',
  'tinymce/plugins/autolink',
  'tinymce/plugins/link',
  'tinymce/plugins/image',
  'tinymce/plugins/lists',
  'tinymce/plugins/charmap',
  'tinymce/plugins/print',
  'tinymce/plugins/preview',
  'tinymce/plugins/hr',
  'tinymce/plugins/anchor',
  'tinymce/plugins/pagebreak',
  'tinymce/plugins/spellchecker',
  'tinymce/plugins/searchreplace',
  'tinymce/plugins/wordcount',
  'tinymce/plugins/visualblocks',
  'tinymce/plugins/visualchars',
  'tinymce/plugins/code',
  'tinymce/plugins/fullscreen',
  'tinymce/plugins/insertdatetime',
  'tinymce/plugins/media',
  'tinymce/plugins/nonbreaking',
  'tinymce/plugins/save',
  'tinymce/plugins/table',
  'tinymce/plugins/contextmenu',
  'tinymce/plugins/directionality',
  'tinymce/plugins/emoticons',
  'tinymce/plugins/template',
  'tinymce/plugins/paste',
  'tinymce/plugins/textcolor',
  'tinymce/plugins/placeholder',
];

const vendorStyles = [
  './node_modules/bootstrap/dist/css/bootstrap.min.css',
  './node_modules/bootstrap-table/dist/bootstrap-table.min.css',
  './node_modules/selectize/dist/css/selectize.bootstrap3.css',
  './app/styles/theme.css',
  './node_modules/float-labels.js/dist/float-labels.css',
  './node_modules/tinymce/skins/lightgray/skin.min.css',
  './node_modules/tinymce/skins/lightgray/content.min.css',
  './node_modules/flatpickr/dist/flatpickr.min.css',
  './public/assets/lib/switchery/dist/switchery.min.css',
  './node_modules/dropzone/dist/dropzone.css',
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
    'node_modules/tinymce/skins/lightgray/fonts/**/*',
  ])
    .pipe($.flatten())
    .pipe(gulp.dest('public/fonts'))
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

gulp.task('run', ['less', 'styles:vendor', 'styles:app', 'build:vendor', 'build:app', 'fonts'], () => {
  gulp.watch([
    'views/**/*.html',
    'app/**/*.js',
  ], ['build:app']);

  gulp.watch('app/styles/**/*.css', ['styles:app']);
  gulp.watch('app/less/**/*.less', ['less']);
});
