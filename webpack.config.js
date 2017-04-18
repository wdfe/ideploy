var path = require('path');
module.exports = function(webpackConfig) {
  webpackConfig.babel.plugins.push('antd');
  return webpackConfig;
};
