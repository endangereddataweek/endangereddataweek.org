// Load plugins
const autoprefixer = require("autoprefixer");
const browsersync  = require('browser-sync').create();
const cp           = require('child_process');
const cssnano      = require("cssnano");
const eslint       = require("gulp-eslint");
const imagemin     = require("gulp-imagemin");
const include      = require('gulp-include');
const gulp         = require('gulp');
const newer        = require("gulp-newer");
const plumber      = require("gulp-plumber");
const postcss      = require("gulp-postcss");
const pump         = require('pump');
const rename       = require("gulp-rename");
const sass         = require("gulp-sass");
const sourcemaps   = require('gulp-sourcemaps');
const uglify       = require('gulp-uglify');

// adapted from https://gist.github.com/jeromecoupe/0b807b0c1050647eb340360902c3203a

const jekyll = process.platform === 'win32' ? 'jekyll.bat' : 'jekyll';

// BrowserSync
function browserSync(done) {
    browsersync.init({
        server: {
            baseDir: "./_site/"
        },
        port: 3000
    });
    done();
}

/**
* Build the Jekyll Site
*/
function jekyllBuild() {
    return cp.spawn(jekyll, ['build', '--incremental', '--baseurl', ''], {
        stdio: 'inherit'
    });
}

/**
* Rebuild Jekyll & do page reload
*/
function browserSyncReload(done) {
    browsersync.reload();
    done();
}

/**
* Compress SASS files
* @param  {Function} done callback
*/
function scss(done) {
    gulp
    .src("_sass/**/*.scss")
    .pipe(plumber())
    .pipe(sass({
        outputStyle: "expanded"
    }))
    .pipe(gulp.dest('./site/assets/css/'))
    .pipe(rename({
        suffix: ".min"
    }))
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(gulp.dest("./_site/css/"))
    .pipe(browsersync.stream());

    done();
}

function images(done){
    // return gulp
    //     .src('img/**/*')
    //     .
    pump([
        gulp.src('img/**/*'),
        newer('img/**/*'),
        imagemin([
            imagemin.gifsicle({ interlaced: true }),
            imagemin.jpegtran({ progressive: true }),
            imagemin.optipng({ optimizationLevel: 5 }),
            imagemin.svgo({
                plugins: [
                    {
                        removeViewBox: false,
                        collapseGroups: true
                    }
                ]
            }),
        ]),
        gulp.dest('img')
    ]);
    done();
}



/**
* Watch files in Jekyll project
*/
function watchFiles() {
    gulp.watch("./_sass/**/*", scss);
    gulp.watch('./js/src/*.js', gulp.series(includeJS, compressJS));
    gulp.watch('./img', images);
    gulp.watch([
        '*.html',
        '*.md',
        '_includes/**/*',
        '_layouts/**/*',
        '_posts/**/*',
        'data/**/*',
        'templates/**/*',
    ], gulp.series(jekyllBuild, browserSyncReload));
}

/**
* Include the dependencies from the include file.
*
* TODO: Move to webpacker
*
* @param  {Function} done callback
*/
function includeJS(done){
    pump([
        gulp.src(['./js/src/scripts.js']),
        include(),
        gulp.dest('./js/src/build/')
    ]);

    done();
}

function scriptsLint(done){
    pump([
        gulp.src('js/src/*.js'),
        // plumber(),
        eslint(),
        eslint.format(),
        eslint.failAfterError()
    ]);

    done();
}

gulp.task('lint', scriptsLint);

/**
* Compress and uglify JavaScript files
*/
function compressJS(done){
    pump([
        gulp.src('js/src/build/*.js'),
        sourcemaps.init(),
        uglify(),
        sourcemaps.write(),
        gulp.dest('js'),
        browsersync.stream()
    ], done());
}

// Tasks
gulp.task('browser-sync', gulp.series(sass, jekyllBuild, browserSync));
gulp.task('compress', gulp.series(includeJS, compressJS));
gulp.task('images', images);
gulp.task('jekyll-build', jekyllBuild);
gulp.task('sass', scss);
gulp.task('scripts', includeJS);

/**
* Default task, running just `gulp` will compile the sass,
* compile the jekyll site, launch BrowserSync & watch files.
*/
gulp.task('default', gulp.parallel(browserSync, watchFiles));
