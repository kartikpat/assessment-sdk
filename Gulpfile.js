/**
 * Sample gulpfile corresponding to the current repo structure including sass to css compilation, css concatenation and minification, js concatenation and minification.
 */

var gulp = require("gulp");
var gutil = require("gulp-util");
var sass = require("gulp-sass");
var del = require("del");
var notify = require("gulp-notify");
var moment = require("moment");
var uglifycss = require("gulp-uglifycss");
var concat = require('gulp-concat');
var staticMapper = require("./asset-mapper.json");
var uglify = require('gulp-uglify');
var gulpDebug = require('gulp-debug');
var rollupBabel = require('rollup-plugin-babel');
var rollupStream = require('rollup-stream');
var rollup = require('rollup');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var sourcemaps = require('gulp-sourcemaps');
var nodeResolve = require('rollup-plugin-node-resolve');

const babelConfig = {
    paths: {
        index: './static/js/index.js',
        dist: './bundle'
    },
    babel: {
	    babelrc: false,
	    presets: [['env', { modules: false }]]
  	}
}

// Use mocha for test driven development. But make this your last resort.
// var mocha = require('./gulp-mocha')

function getAssetsArray(location){
	var assets = [];
	location.forEach(function(anAsset){
		assets.push(anAsset);
	});
	return assets;
}

gulp.task('clean', function(){
	gutil.log('Cleaning build directory');
	return del([
			'static/build/css/**/*.css',
			'static/build/js/**/*.js',
		]);
});

gulp.task('build-css', function(){
	gutil.log('building minified css');
	for(var key in staticMapper){
		gulp.src(getAssetsArray(staticMapper[key]["styles"]["debug"]))
		.pipe(concat(staticMapper[key]["styles"]["prod"][0]))
		.on('error', notify.onError("Error: <%= error.message %>"))
		.pipe(uglifycss())
		.on('error', notify.onError("Error: <%= error.message %>"))
		.pipe(gulp.dest('.'))
	    .pipe(notify('Concatenated stylesheets for ' + staticMapper[key]["styles"]["prod"][0] + ' (' + moment().format('MMM Do h:mm:ss A') + ')'))
	}
});

gulp.task('build-js', function(){
	gutil.log('building minified js')
	for(var key in staticMapper){
		gulp.src(getAssetsArray(staticMapper[key]["scripts"]["debug"]))
		.pipe(gulpDebug())
        .on('error', notify.onError("Error: <%= error.message %>"))
        .pipe(concat(staticMapper[key]["scripts"]["prod"][0]))
        .on('error', notify.onError("Error: <%= error.message %>"))
        .pipe(uglify())
        .on('error', function(err){
        	console.log(err);
        })
        //.on('error', notify.onError("Error: <%= error.message %>"))
        .pipe(gulp.dest('.'))
        .pipe(notify('Uglified JavaScript (' +staticMapper[key]["scripts"]["prod"][0]+ moment().format('MMM Do h:mm:ss A') + ')'))
	}
})

gulp.task('build-sass',function(){
	gulp.src('static/scss/**/*.scss')
		.pipe(sass())
		.on('error', notify.onError("Error: <%= error.message %>"))
		.pipe(gulp.dest('static/css'))
});

gulp.task('make:iife', () => {
    return rollupStream({
        input: babelConfig.paths.index,
        output: {
            file: 'bundle.js',
            format: 'amd',
            name: 'assessmentSdk',
            exports: 'default',
            sourcemap: true
        },
        plugins: [
            nodeResolve(),
            rollupBabel(babelConfig.babel)
        ],
        rollup: rollup
    })
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sourcemaps.write('./bundle'))
    .pipe(gulp.dest(babelConfig.paths.dist));
});

//For running test through mocha
// gulp.task('run-test', function(){
// 	 gulp.src('test/**.js', {read: false})
//         .pipe(mocha({reporter: 'list'}));
//   //mocha({reporter: 'list'});
// });


gulp.task('watch-test', function(){
	gulp.watch('test/**.js', ['run-test']);
})


gulp.task('watch', ['clean','build-sass', 'build-css', 'make:iife'], function(){
	gulp.watch('static/scss/**/*.scss', ['build-sass']);
    gulp.watch('static/js/**/*.js', ['make:iife'])
});

gulp.task('build', ['clean', 'build-sass', 'build-css', 'build-js']);

gulp.task('default', ['watch']);



gulp.task('iife:min', () => {
    return rollupStream({
        input: babelConfig.paths.index,
        output: {
            file: 'bundle.js',
            format: 'iife',
            name: 'te',
            exports: 'default'
        },
        plugins: [
            rollupBabel(babelConfig.babel)
        ],
        sourcemap: true,
        rollup: rollup
    })
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(uglify())
    .pipe(sourcemaps.write('./test'))
    .pipe(gulp.dest(babelConfig.paths.dist));
});
