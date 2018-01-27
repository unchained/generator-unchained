const path = require('path'),
  del = require('del'),
  chalk = require('chalk'),
  dedent = require('dedent-js'),
  gulp = require('gulp'),
  GulpClass = require('classy-gulp'),

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
      browserSync: require('browser-sync').create(),
      webpack: require('webpack-stream'),
      yargs: require('yargs'),
      /**
       * enables us to define webpack entry points via gulp.src
       */
      named: require('vinyl-named'),
    },
  },
  gulpOptions = {
    ...require('./config/gulp.config'),
    ...{
      production: !!(gulpPlugins.yargs.argv.production),
      analyzeWebpack: !!(gulpPlugins.yargs.argv.analyze),
    },
  },
  serverConfig = require('./config/config');

class Flow extends GulpClass{
  constructor() {
    super();
    /**
     * A friendly greeting for you, you beautiful ;)
     */
    console.log(chalk.blue(dedent(`
        * Hey! I'm gulp. ༼つಠ益ಠ༽つ ─=≡ΣO))
        * Your personal workflow magician.
        `)));
  }

  defineTasks(){
    /**
     * All tasks which are accessible via "gulp <taskName>" are defined here.
     */
    return {
      images: gulp.series(this.images),
      build: gulp.series(this.clean, gulp.parallel(this.styles, this.scripts)),
      nodemon: gulp.series(this.server),
      server: gulp.series(this.server, this.startBrowserSync, (done) => {
        done();
      }),
      deploy: gulp.series('build'),
      default: gulp.series('build', 'server', this.watch),
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
    return gulp.src([path.join(gulpOptions.js.src, '**/*.js')])
      .pipe(gulpPlugins.plumber())
      .pipe(gulpPlugins.named())
      .pipe(gulpPlugins.webpack(require('./config/webpack.config.js')({
        environment: gulpOptions.production ? 'production' : 'development',
        analyze: gulpOptions.analyzeWebpack,
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
        errorOnEnlargement: false,
      }))
      .pipe(gulp.dest(gulpOptions.images.dist));
    gulp.src(path.join(gulpOptions.images.src, '/**/*.svg}'))
      .pipe(gulp.dest(gulpOptions.images.dist));
    done();
  }

  /**
   * Watches for changes and automatically performs a given task depending on the type of file changed.
   * @param {function} [done] - An automatically assigned and invoked callback to signal asynchronous completion (do not use!)
   */
  watch(done) {
    gulp.watch(path.join(gulpOptions.styles.path.scss, '/**/*.scss'), this.styles);
    gulp.watch(path.join(gulpOptions.html.src, `/**/*${gulpOptions.html.ext}`), gulp.series(this.reload));
    gulp.watch(path.join(gulpOptions.js.src, '**/*.js'), gulp.series(this.scripts, this.reload));
    gulp.watch(path.join(gulpOptions.images.src, '**/*.{jpg,png,svg}'), gulp.series(this.images, this.reload));
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
    setTimeout(() => {
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
    const result = [];
    for (const [key, value] of Object.entries(serverConfig.imageBreakpoints)) {
      result.push({
        width: value,
        rename: {suffix: `-${key}`},
      });
      result.push({
        width: value,
        format: 'webp',
        rename: {suffix: `-${key}`, extname: '.webp'},
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
    const _this = this;
    let called = false;
    const server = gulpPlugins.nodemon(gulpOptions.app.nodemon);

    server.on('start', () => {
      if (!called) {
        called = true;
        done();
      }
    });

    server.on('restart', () => {
      console.log(chalk.green(dedent(`
            * 
            *   Retarting nodemon server...
            *
            `)));
      gulp.series(_this.reload);
    });

    server.on('crash', () => {
      console.log(chalk.green(dedent(`
            * 
            *   Nodemon server crashed! Restarting in 5 seconds...
            *
            `)));
      server.emit('restart', 5); // restart the server in 5 seconds
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
}

/**
 *      Let's get the party started!
 *      Don't forget to have fun on this new project! (✿ ◕ ‿ ◕)ᓄ ╰U╯
 */
gulp.registry(new Flow());
