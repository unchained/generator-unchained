const path = require('path'),
  rootPath = path.normalize(`${__dirname}/..`),
  env = process.env.NODE_ENV || 'development';

const config = {
  /**
   * general config common for all environments
   */
  general: {
    root: rootPath,
    app: {
      name: 'unchained-studio',
    },
    port: process.env.PORT || 3000,
    environment: env,
    viewEngine: 'ejs',<% if(responsiveImages){ %>
    imageBreakpoints: {
      xs: 576,
      sm: 768,
      md: 992,
      lg: 1280,
      xl: 1920,
    },<% } %>
  },
  /**
   * configuration specific for the development environment
   */
  development: {},
  /**
   * configuration specific for the test environment
   */
  test: {},
  /**
   * configuration specific for the production environment
   */
  production: {},
};

function getConfig(env) {
  return {...config.general, ...config[env]};
}

module.exports = getConfig(env);
