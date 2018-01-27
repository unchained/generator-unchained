const projectConfig = require('./config');

module.exports = {
  app: {
    nodemon: {
      script: 'app.js',
      nodeArgs: ['--inspect'],
      ext: 'js json',
      ignore: ['public/**/*.js', 'app/views/**/*.js', 'config/**/*.config.js', 'gulpfile.js', 'node_modules/'],
      env: {
        NODE_ENV: 'development',
      },
    },
    browserSync: {
      proxy: `http://localhost:${projectConfig.port}`,
      port: projectConfig.port + 1000,
      notify: true,
    },
  },
  html: {
    src: 'app/views',
    ext: `.${projectConfig.viewEngine}`,
  },
  js: {
    /**
     * src is the folder including all entry points for webpack
     */
    src: 'src/js/entries',
    dist: 'dist/js/',
  },
  images: {
    src: 'src/img/',
    dist: 'dist/img/',
  },
  styles: {
    path: {
      scss: 'src/scss/',
      css: 'dist/css/',
    },
    autoprefixerCompatibility: ['last 3 versions', '> 1%'],
    sassOptions: {
      /*
       * Applicable output styles are showcased below:
       *

       ------- nested:(indented like scss)-------

       .widget-social {
       text-align: right; }
       .widget-social a,
       .widget-social a:visited {
       padding: 0 3px;
       color: #222222;
       color: rgba(34, 34, 34, 0.77); }

       ------- expanded:(classic css) -------

       .widget-social {
       text-align: right;
       }
       .widget-social a,
       .widget-social a:visited {
       padding: 0 3px;
       color: #222222;
       color: rgba(34, 34, 34, 0.77);
       }

       ------- compact -------

       .widget-social { text-align: right; }
       .widget-social a, .widget-social a:visited { padding: 0 3px; color: #222222; color: rgba(34, 34, 34, 0.77); }

       ------- compressed:(minified) -------

       .widget-social{text-align:right}.widget-social a,.widget-social a:visited{padding:0 3px;color:#222222;color:rgba(34,34,34,0.77)}
       */
      outputStyle: 'compressed',
      /**
       * Paths to the scss packages from node_modules go below.
       */
      includePaths: [],
    },
  },
};
