var defaultConfig = require('./karma.conf'),
    webpackConfig = require('./webpack.config')

webpackConfig.module.loaders[0].query.plugins = ['rewire'];

module.exports = function (config) {
    defaultConfig(config)
    config.set({
        browsers: ['PhantomJS', 'Firefox'],
        reporters: ['spec'],
        webpack: webpackConfig
    });
};
