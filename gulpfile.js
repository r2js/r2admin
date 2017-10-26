const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const browserify = require('browserify');
const babelify = require('babelify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const path = require('path');
const concat = require('gulp-concat');
const minifyCSS = require('gulp-minify-css');

// NOTE: run example
// node_modules/gulp/bin/gulp.js --cwd "./example" run

const basePath = process.env.BASEPATH || __dirname;
const appPath = process.cwd();

const vendors = [
  'jquery',
  'bootstrap',
  'selectize',
  'flatpickr',
  'filesize',
  'debug',
  'noty',
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
  `${basePath}/node_modules/bootstrap/dist/css/bootstrap.min.css`,
  `${basePath}/node_modules/selectize/dist/css/selectize.bootstrap3.css`,
  `${basePath}/node_modules/float-labels.js/dist/float-labels.css`,
  `${basePath}/node_modules/tinymce/skins/lightgray/skin.min.css`,
  `${basePath}/node_modules/tinymce/skins/lightgray/content.min.css`,
  `${basePath}/node_modules/flatpickr/dist/flatpickr.min.css`,
  `${basePath}/node_modules/noty/lib/noty.css`,
  `${basePath}/assets/lib/switchery/dist/switchery.min.css`,
  `${basePath}/assets/lib/fontawesome-5/fontawesome-pro-core.css`,
  `${basePath}/assets/lib/fontawesome-5/fontawesome-pro-light.css`,
  `${basePath}/assets/lib/modulz.min.css`,
];

gulp.task('build:app', () => {
  browserify({
    entries: [`${appPath}/app/js/app.js`],
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

gulp.task('build:base', () => {
  browserify({
    entries: [`${basePath}/assets/js/base.js`],
    extensions: ['.js'],
    debug: true,
  })
    .external(vendors)
    .transform(babelify, { presets: ['es2015'] })
    .bundle()
    .pipe(source('base.js'))
    .pipe(buffer())
    .pipe($.uglify())
    .pipe($.sourcemaps.init({ loadMaps: true }))
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest('public/dist'));
});

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

gulp.task('setup', () => {
  gulp.src(`${basePath}/assets/lib/tinymce-placeholder/**/*`)
    .pipe(gulp.dest(`${appPath}/node_modules/tinymce/plugins/placeholder`));

  gulp.src([`${basePath}/assets/lib/switchery/dist/switchery.min.js`])
    .pipe(gulp.dest(`${appPath}/public/dist`));
});

gulp.task('fonts', () => (
  gulp.src([
    `${appPath}/app/font/**/*`,
    './node_modules/bootstrap/dist/fonts/**/*',
    './node_modules/tinymce/skins/lightgray/fonts/**/*',
    `${basePath}/assets/lib/fontawesome-5/fonts/**/*`,
  ])
    .pipe($.flatten())
    .pipe(gulp.dest('public/fonts'))
    .pipe(gulp.dest('public/webfonts'))
    .pipe(gulp.dest('public/dist/fonts'))
));

gulp.task('styles:app', () => (
  gulp.src(`${appPath}/public/assets/styles/app/**/*`)
    .pipe(minifyCSS())
    .pipe(gulp.dest(`${appPath}/public/dist`))
));

gulp.task('styles:base', () => (
  gulp.src(`${appPath}/public/assets/styles/base/**/*`)
    .pipe(minifyCSS())
    .pipe(gulp.dest(`${appPath}/public/dist`))
));

gulp.task('styles:vendor', () => (
  gulp.src(vendorStyles)
    .pipe(minifyCSS())
    .pipe(concat('vendor.css'))
    .pipe(gulp.dest(`${appPath}/public/dist`))
));

gulp.task('less:app', () => (
  gulp.src(`${appPath}/app/less/**/*.less`)
    .pipe($.less({
      paths: [path.join(__dirname, 'less', 'includes')],
    }))
    .pipe(gulp.dest(`${appPath}/public/assets/styles/app`))
));

gulp.task('less:base', () => (
  gulp.src(`${basePath}/assets/less/base.less`) // NOTE: using imports
    .pipe($.less({
      paths: [path.join(__dirname, 'less', 'includes')],
    }))
    .pipe(gulp.dest(`${appPath}/public/assets/styles/base`))
));

gulp.task('run', ['less:base', 'less:app', 'styles:vendor', 'styles:base', 'styles:app', 'fonts', 'setup', 'build:vendor', 'build:base', 'build:app'], () => {
  // watch base
  gulp.watch(`${basePath}/assets/less/**/*.less`, ['less:base']);
  gulp.watch(`${appPath}/public/assets/styles/base/**/*.css`, ['styles:base']);
  gulp.watch([`${basePath}/assets/js/**/*.js`], ['build:base']);

  // watch app
  gulp.watch(`${appPath}/app/less/**/*.less`, ['less:app']);
  gulp.watch(`${appPath}/public/assets/styles/app/**/*.css`, ['styles:app']);
  gulp.watch([`${appPath}/app/js/**/*.js`], ['build:app']);
});
