// Requiring Gulp
var gulp = require('gulp'),
    sass = require('gulp-sass'),                 // Requiring gulp-sass (compiles SCSS)
    sourcemaps = require('gulp-sourcemaps'),     // Requiring sourcemaps (helps working locally)
    autoprefixer = require('gulp-autoprefixer'), // Requiring autoprefixer (adds browser prefixes)
    cssnano = require('gulp-cssnano'),           // Requiring cssnano (minifies CSS)
    imagemin = require('gulp-imagemin'),         // Requiring imagemin (lossless image optimization)
    plumber = require('gulp-plumber'),           // Requiring plumber ()
    notify = require("gulp-notify"),             // Requiring notify ()
    browserSync = require('browser-sync'),       // Requiring browser-sync (browser refresh)
    shell = require('gulp-shell'),               // Requiring gulp-shell (used for KSS node)
    kssNode = 'node ' + __dirname + '/node_modules/kss/bin/kss-node '; // Require kss-node

var server = browserSync.create();

var paths = {
    styles: {
      src: 'source/assets/stylesheets/*.scss',
      dest: 'build/assets/stylesheets'
    },
    images: {
      src: 'source/assets/images/**',
      dest: 'build/assets/images'
    }
}

// Start KSS (style guide) task
function kss(done) {
  shell.task(
    [kssNode + '--config source/kss-config.json']);
  done();
}

// Start browserSync server
function startServer(done) {
  server.init({
    // Display the build folder first
    startPath: 'styleguide',
    server: {
      // Start in root (important for relative paths between build and style guide folders)
      baseDir: ''
    }
  });
  done();
}

// Reload browserSync server
function reloadServer(done) {
  server.reload();
  done();
}

// Stylesheets task
function stylesheets() {
  return gulp
    .src(paths.styles.src) // Get all *.scss files
    .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")})) // Show error
    .pipe(sourcemaps.init()) // Initialize sourcemap plugin
    .pipe(sass().on('error', sass.logError)) // Compiling sass
    .pipe(autoprefixer('last 2 version')) // Adding browser prefixes
    .pipe(sourcemaps.write()) // Writing sourcemaps
    .pipe(cssnano()) // Compress
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(browserSync.stream());
}

// Images task
function images() {
  return gulp
    .src(paths.images.src)
    .pipe(imagemin())
    .pipe(gulp.dest(paths.images.dest));
}

// Watch files
function watchFiles() {
  gulp.watch('source/assets/stylesheets/**/*.scss', stylesheets); // Watch for SCSS changes
  gulp.watch('source/assets/images/**/*', images); // Watch for image changes
  gulp.watch('source/**', kss); // Watch for style guide changes
  gulp.watch(['build/**.html', 'styleguide/**.html'], reloadServer);
}

// Define build tasks
var watch = gulp.parallel(startServer, watchFiles);
var build = gulp.parallel(stylesheets, images, kss);

// Exports
exports.stylesheets = stylesheets;
exports.images = images;
exports.watchFiles = watchFiles;
exports.watch = watch;
exports.build = build;
exports.default = watch;
