const express = require('express');
const glob = require('glob');
const logger = require('morgan');<% if(responsiveImages){ %>
const path = require('path');
const config = require('./config');<% } %>
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const compress = require('compression');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');

<% if(responsiveImages){ %>
const responsiveImage = (filePath, alt, sizes = '', attributes = '', imgAttributes = '') => {
  const dirname = path.dirname(filePath);
  const extname = path.extname(filePath);
  const filename = path.basename(filePath, extname);
  let normalSrcset = '';
  let webpSrcset = '';
  const fallbacks = [];
  let first = true;
  if (sizes !== '') {
    sizes = `sizes="${sizes}"`;
  }
  let lastValue = 1;
  for (const [key, value] of Object.entries(config.imageBreakpoints)) {
    normalSrcset += `${(first ? '' : ', ') + path.join(dirname, `${filename}-${key}${extname}`)} ${lastValue}w`;
    webpSrcset += `${(first ? '' : ', ') + path.join(dirname, `${filename}-${key}.webp`)} ${lastValue}w`;
    fallbacks.push(path.join(dirname, `${filename}-${key}${extname}`));
    first = false;
    lastValue = value;
  }
  const result = `<picture ${attributes}>
                <source type="image/webp" srcset="${webpSrcset}" ${sizes}>
                <img src="${fallbacks.pop()}" alt="${alt}" ${imgAttributes} srcset="${normalSrcset}" ${sizes}>
            </picture>`;
  return result;
};
<% } %>

module.exports = (app, config) => {
  app.locals.ENV = config.env;
  app.locals.ENV_DEVELOPMENT = config.env === 'development';<% if(responsiveImages){ %>
  app.locals.responsiveImage = responsiveImage;<% } %>

  app.set('views', `${config.root}/app/views`);
  app.set('view engine', config.viewEngine);
  app.use(expressLayouts);
  app.set('layout', 'layouts/layout');

  // app.use(favicon(config.root + '/public/img/favicon.ico'));
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true,
  }));
  app.use(cookieParser());
  app.use(compress());
  app.use(express.static(`${config.root}/dist`));
  app.use(methodOverride());

  const controllers = glob.sync(`${config.root}/app/controllers/*.js`);
  controllers.forEach((controller) => {
    require(controller)(app);
  });

  app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  // error handler
  app.use((err, req, res, next) => {
    // render the error page
    res.status(err.status || 500);
    res.render('error', {
      title: '404 Page not found',
      pageName: 'error',
      error: req.app.get('env') === 'development' ? err : {},
      message: err.message,
    });
  });

  return app;
};
