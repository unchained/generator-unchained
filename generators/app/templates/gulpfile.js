'use strict';
const path = require('path'),
    del = require('del'),
    chalk = require('chalk'),
    dedent = require('dedent-js'),
    gulp = require('gulp'),
    gulpRemoveTaskOrderDependency = require('undertaker-forward-reference'),

    /**
     * Gulp plugins starting with "gulp-<name>" are loaded automatically under gulpPlugins.<name>
     *     You can rename them or call functions on required plugins via options object passed to gulp-load-plugins:
     *     {
     *     rename: {},
     *     postRequireTransforms: {}
     *     }
     * Others are manually appended via the second array.
     */
    gulpPlugins = {
        ...require('gulp-load-plugins')(),
        ...{
            'browserSync': require('browser-sync').create(),
            'webpack': require('webpack-stream'),
            'yargs': require('yargs'),
            /**
             * enables us to define webpack entry points via gulp.src
             */
            'named': require('vinyl-named')
        }
    },
    gulpOptions = {
        ...require('./config/gulp.config'),
        ...{
            production: !!(gulpPlugins.yargs.argv.production),
            analyzeWebpack: !!(gulpPlugins.yargs.argv.analyze),
        }
    };

class Flow {
    constructor() {
        /**
         * A friendly greeting for you, you beautiful ;)
         */
        console.log(chalk.blue(dedent(`
        * Hey! I'm gulp. ༼つಠ益ಠ༽つ ─=≡ΣO))
        * Your personal workflow magician.
        * I'll serve you as best as I can.
        `)));

        /**
         *  Automatically bind this to Flow class in all of it's methods (tasks)
         */
        let _this = new Proxy(this, {
            get: (target, name) => {
                if (typeof target[name] === "function") {
                    return target[name].bind(_this);
                } else {
                    return target[name];
                }
            }
        });

        /**
         * Fix gulp task dependency requirements so that we can define task:
         * default: gulp.series('build', 'server', this.watch)
         * before the build task has been defined in gulp's memory.
         */
        gulp.registry(gulpRemoveTaskOrderDependency());

        /**
         * All tasks which are accessible via "gulp <taskName>" are defined here.
         */
        this.tasks = {
            images: gulp.series(_this.images),
            build: gulp.series(_this.clean, gulp.parallel(_this.styles, _this.scripts)),
            nodemon: gulp.series(_this.server),
            server: gulp.series(_this.server, _this.startBrowserSync, function (done) {
                done();
            }),
            deploy: gulp.series('build'),
            default: gulp.series('build', 'server', _this.watch)
        };
    }

    /**
     * Runs everything we need to do with CSS.
     */
    styles() {
        return gulp.src([path.join(gulpOptions.styles.path.scss, '/**/*.scss')])
            .pipe(gulpPlugins.plumber())
            .pipe(gulpPlugins.sourcemaps.init())
            .pipe(gulpPlugins.sass(gulpOptions.styles.sassOptions).on('error', gulpPlugins.sass.logError))
            .pipe(gulpPlugins.autoprefixer({browsers: gulpOptions.styles.autoprefixerCompatibility}))
            .pipe(gulpPlugins.sourcemaps.write('.'))
            .pipe(gulp.dest(gulpOptions.styles.path.css))
            .pipe(gulpPlugins.browserSync.stream({match: '**/*.{css|map}'}));
    }

    /**
     * Runs everything we need to do with JS.
     */
    scripts() {
        return gulp.src([path.join(gulpOptions.js.src, "**/*.js")])
            .pipe(gulpPlugins.plumber())
            .pipe(gulpPlugins.named())
            .pipe(gulpPlugins.webpack(require('./config/webpack.config.js')({
                environment: gulpOptions.production ? "production" : "development",
                analyze: gulpOptions.analyzeWebpack
            })))
            .pipe(gulp.dest(gulpOptions.js.dist));
    }

    /**
     * Runs everything we need to do with images such as compression, duplicating to webp and such.
     * Processes png, jpg, svg images.
     * @param {function} [done] - An automatically assigned and invoked callback to signal asynchronius completion (do not use!)
     */
    images(done) {
        del.sync(gulpOptions.images.dist);
        gulp.src(path.join(gulpOptions.images.src, '/**/*.{jpg,png}'))
            .pipe(gulpPlugins.responsive({
                '**/*': this.getResponsiveConfig(),
            }, {
                // Global configuration for all images
                // The output quality for JPEG, WebP and TIFF output formats
                quality: 100,
                // Use progressive (interlace) scan for JPEG and PNG output
                progressive: true,
                // Zlib compression level of PNG output format
                compressionLevel: 6,
                // Strip all metadata
                withMetadata: false,
                withoutEnlargement: true,
                errorOnEnlargement: false
            }))
            .pipe(gulp.dest(gulpOptions.images.dist));
        gulp.src(path.join(gulpOptions.images.src, '/**/*.svg}'))
            .pipe(gulp.dest(gulpOptions.images.dist));
        done();
    }

    /**
     * Watches for changes and automatically performs a given task depending on the type of file changed.
     * @param {function} [done] - An automatically assigned and invoked callback to signal asynchronius completion (do not use!)
     */
    watch(done) {
        gulp.watch(path.join(gulpOptions.styles.path.scss, '/**/*.scss')).on('all', this.styles);
        gulp.watch(path.join(gulpOptions.html.src, '/**/*' + gulpOptions.html.ext)).on('all', gulp.series(this.reload));
        gulp.watch(path.join(gulpOptions.js.src, '**/*.js')).on('all', gulp.series(this.scripts, this.reload));
        gulp.watch(path.join(gulpOptions.images.src, '**/*.{jpg,png,svg}')).on('all', gulp.series(this.images, this.reload));
        done();
    }

    /**
     *      ========= "Utility" classes start =========
     */


    /**
     *      ========= BrowserSync =========
     */

    /**
     * Starts the browsersync proxy server
     * @param {function} [done] - An automatically assigned and invoked callback to signal asynchronius completion (do not use!)
     */
    startBrowserSync(done) {
        setTimeout(function () {
            gulpPlugins.browserSync.init(gulpOptions.app.browserSync);
            done();
        }, 1000);
    }

    /**
     * Reloads the whole page via browsersync
     * @param {function} [done] - An automatically assigned and invoked callback to signal asynchronius completion (do not use!)
     */
    reload(done) {
        gulpPlugins.browserSync.reload();
        done();
    }

    /**
     *      ======== Gulp-responsive ========
     */

    /**
     * Automatically generates the configuration for generationg responsive images via gulp-responsive.
     */
    getResponsiveConfig() {
        let result = [];
        for (let [key, value] of Object.entries(serverConfig.imageBreakpoints)) {
            result.push({
                width: value,
                rename: {suffix: '-' + key}
            });
            result.push({
                width: value,
                format: 'webp',
                rename: {suffix: '-' + key, extname: '.webp'}
            });
        }
        return result;
    }

    /**
     *      ======== Nodemon ========
     */

    /**
     * Initializes a nodemon server
     * @param {function} [done] - An automatically assigned and invoked callback to signal asynchronous completion (do not use!)
     */
    server(done) {
        let _this = this;
        let called = false;
        let server = gulpPlugins.nodemon(gulpOptions.app.nodemon);

        server.on('start', function () {
            if (!called) {
                called = true;
                done();
            }
        });

        server.on('restart', function () {
            console.log(chalk.green(dedent(`
            * 
            *   Retarting nodemon server...
            *
            `)));
            gulp.series(_this.reload);
        });

        server.on('crash', function () {
            console.log(chalk.green(dedent(`
            * 
            *   Nodemon server crashed! Restarting in 5 seconds...
            *
            `)));
            server.emit('restart', 5);  // restart the server in 5 seconds
        });
    }

    /**
     *      ======== Misc ========
     */

    /**
     * cleans the dist directory
     */
    clean(done) {
        del.sync('dist');
        done();
    }

    /**
     * registers tasks for use from the CLI.
     * ---- WARNING: the task order is important! ----
     * @param {Object} tasks - the object of key:value pairs of name:task
     */
    registerTasks(tasks) {
        for (let [name, task] of Object.entries(tasks)) {
            gulp.task(name, task);
        }
    }
}

/**
 *      Let's get the party started!
 *      Don't forget to have fun on this new project! (✿ ◕ ‿ ◕)ᓄ ╰U╯
 */
var work = new Flow();
module.exports = work.tasks;