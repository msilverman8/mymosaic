'use strict';
const { series, parallel, src, dest, watch } = require('gulp');
// js
const browserify = require('browserify');
const babelify = require('babelify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const uglify = require('gulp-uglify');
const watchify = require('watchify');

// utilities
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const del = require('del');
const log = require('fancy-log');

// urls
// globs don't work on windows....fix this when there are more apps
const appGLOB = './imgconvert/static/imgconvert/';
const buildDIR = './build/build/';

// css locations
// const cssFOLDER = 'styles/';
// const styleSRC = appGLOB + cssFOLDER + 'main.css';
// const styleDEST = buildDIR + cssFOLDER;


// clear the build directory
function clean(done) {
  // if dryrun true, don't delete just display to be deleted
  const dryrun = false;
  del([
      buildDIR + '*/**',
      '!' + buildDIR + 'manualAdds'
    ], {
      dryRun: dryrun,
    })
      .then((resp) => {
        if(dryrun){
          log('---- to be deleted ----');
          log(resp);
        }
      })
      .catch((e) => {log(e);});
  done();
}


// js locations
const jsFOLDER = 'scripts/';
const jsSRC = appGLOB + jsFOLDER;
const jsFILES = ['main.js'];
const jsDEST = buildDIR + jsFOLDER;

function js(done) {
  // loop trough all js files to be browserified
  jsFILES.map( function( entry ) {
    // browserify
    return browserify({
      // entries: [jsSRC + entry]
      entries: [jsSRC + entry]
    })
    //babelify
    .transform( babelify, {
      presets: [
        '@babel/preset-env'
      ],
      plugins: [
        '@babel/plugin-transform-runtime',
      ]
    })
    .bundle() // bundle transformed
    // .on('error', e => {
    //   log(e)
    // })
    .pipe( source( entry ))
    .pipe( rename({
      basename: 'bundle_' + entry.split('.')[0],
      extname: '.js'
    }))
    .pipe( buffer()) // buffer for the next series of alterations
    .pipe( sourcemaps.init({ loadMaps: true })) // loadMaps true loads already existing maps from other modules
    // .pipe( uglify())
    // .pipe( sourcemaps.write('./'))
    .pipe( dest( jsDEST));
  });

  done();
}

// copy npm modules that need to be copied and can't just be imported / required
const vendorSRC = './node_modules/';
const commonDIR = ''
const vendorLIST = [
  'caman/dist/caman.full.min.js',
  'cropperjs/dist/cropper.min.css',
  'cropperjs/dist/cropper.min.js',
  // 'ditherjs/dist/ditherjs.dist.js',
  'face-api.js/dist/face-api.min.js',
  'face-api.js/dist/face-api.js.map',
];
const vendorDEST = buildDIR + 'vendor/';

function copy(done) {
  vendorLIST.map( function(entry) {
    return src(vendorSRC + entry)
    .pipe( dest(vendorDEST) );
  })
  done();
}

// watch locations
const jsWATCH = appGLOB + jsFOLDER + '*.js';

function watch_files() {
  watch(jsWATCH, js);
}

exports.clean = series(clean);
exports.copy = series(copy);
exports.js = series(js);
exports.watch = series(watch_files);
exports.default = series(clean, parallel(copy, js));
