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
    viewEngine: 'ejs',
    imageBreakpoints: {},
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
