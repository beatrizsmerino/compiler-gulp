"use strict";



// DEPENDENCIES
// =================================================
const gulp = require("gulp");
const gulpAutoprefixer = require("gulp-autoprefixer");
const browserSync = require("browser-sync").create();
const reload = browserSync.reload;
const gulpCleanCss = require("gulp-clean-css");
const gulpConcat = require("gulp-concat");
const gulpHtmlmin = require("gulp-htmlmin");
const gulpLineEndingCorrector = require("gulp-line-ending-corrector");
const gulpRename = require("gulp-rename");
const gulpSass = require("gulp-sass")(require("sass"));
const gulpSourcemaps = require("gulp-sourcemaps");
const gulpUglify = require("gulp-uglify");
const gulpBabel = require("gulp-babel");


// SETTINGS: FOLDER/FILE PATHS
// =================================================
const paths = {
	src: {
		base: "src/",
		sass: "src/sass/",
		js: "src/js/",
	},
	dist: {
		base: "dist/",
		css: "dist/css/",
		js: "dist/js/",
	},
	files: {
		base: "**/*",
		html: "*.html",
		sass: "**/*.sass",
		css: "**/*.css",
		js: "**/*.js",
	},
};

// Paths used to concat the files in a specific order.
const filesJsCompile = [
	`${paths.src.js}scripts.js`,
];


// FUNCTIONS USED IN THE TASKS
// =================================================
function copyDirectory(directoryToCopy, directoryOutput) {
	return gulp
		.src(`${directoryToCopy}${paths.files.base}`)
		.pipe(gulp.dest(directoryOutput));
};

function copyFiles(filesToCopy, directoryOutput) {
	return gulp
		.src(filesToCopy)
		.pipe(gulp.dest(directoryOutput));
};


// FUNCTIONS & TASKS
// =================================================
function createServer() {
	browserSync.init({
		server: {
			baseDir: paths.dist.base,
			browser: [
				"google-chrome",
				"firefox",
			],
		},
	});
};

// HTML
// -------------------------------------------------
function htmlCopy() {
	return copyFiles(
		`${paths.src.base}${paths.files.html}`,
		paths.dist.base
	);
};

function htmlMinfy() {
	return gulp
		.src(`${paths.dist.base}${paths.files.html}`)
		.pipe(
			gulpHtmlmin({
				collapseWhitespace: true,
			})
		)
		.pipe(gulp.dest(paths.dist.base));
};

// CSS
// -------------------------------------------------
function sassCompile() {
	return gulp
		.src([
			`${paths.src.sass}styles.sass`,
		])
		.pipe(
			gulpSourcemaps.init({
				loadMaps: true,
			})
		)
		.pipe(
			gulpSass({
				outputStyle: "compressed",
			}).on(
				"error",
				gulpSass.logError
			)
		)
		.pipe(
			gulpAutoprefixer({
				versions: [
					"last 2 versions",
				],
				cascade: false,
			})
		)
		.pipe(gulpCleanCss())
		.pipe(gulpSourcemaps.write())
		.pipe(gulpLineEndingCorrector())
		.pipe(gulpRename("styles.min.css"))
		.pipe(gulp.dest(paths.dist.css));
};

// JS
// -------------------------------------------------
function jsCompile() {
	return gulp
		.src(filesJsCompile)
		.pipe(
			gulpBabel({
				presets: [
					"@babel/preset-env",
				],
			})
		)
		.pipe(gulpConcat("scripts.min.js"))
		.pipe(gulpUglify())
		.pipe(gulpLineEndingCorrector())
		.pipe(gulp.dest(paths.dist.js));
};


// WATCH
// =================================================
function watch() {
	createServer();

	gulp.watch(
		`${paths.src.base}${paths.files.html}`,
		gulp.series(
			htmlCopy,
			htmlMinfy
		)
	);

	gulp.watch(
		`${paths.src.sass}${paths.files.sass}`,
		sassCompile
	);

	gulp.watch(
		`${paths.src.js}${paths.files.js}`,
		jsCompile
	);

	gulp.watch(
		[
			`${paths.dist.base}${paths.files.html}`,
			`${paths.dist.css}${paths.files.css}`,
			`${paths.dist.js}${paths.files.js}`,
		]
	).on(
		"change",
		reload
	);
};


// EXPORTS
// =================================================
exports.createServer = createServer;
exports.htmlCopy = htmlCopy;
exports.htmlMinfy = htmlMinfy;
exports.sassCompile = sassCompile;
exports.jsCompile = jsCompile;
exports.watch = watch;


// TASKS
// =================================================
gulp.task(
	"default",
	gulp.series(
		htmlCopy,
		htmlMinfy,
		sassCompile,
		jsCompile,
		watch
	)
);

gulp.task(
	"serve",
	createServer
);

gulp.task(
	"build",
	gulp.series(
		htmlCopy,
		htmlMinfy,
		sassCompile,
		jsCompile
	)
);

gulp.task(
	"html",
	gulp.series(
		htmlCopy,
		htmlMinfy
	)
);

gulp.task(
	"css",
	sassCompile
);

gulp.task(
	"js",
	jsCompile
);

gulp.task(
	"watch",
	watch
);
