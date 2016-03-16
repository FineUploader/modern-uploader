var path = require('path'),
    webpackConfig = require('./webpack.config')

webpackConfig.module.loaders[0].query.plugins = ['rewire'];

module.exports = function (config) {
    config.set({
        basePath: '',
        browsers: ['Firefox', 'PhantomJS'],
        files: [
            path.resolve('test/tests.bundle.js')
        ],
        frameworks: ['jasmine', 'sinon'],
        plugins: [
            require('karma-webpack'),
            'karma-spec-reporter',
            'karma-jasmine',
            'karma-firefox-launcher',
            'karma-phantomjs-launcher',
            'karma-sinon'
        ],
        preprocessors: (function() {
            var preprocessors = {}
            preprocessors[path.resolve('test/tests.bundle.js')] = 'webpack'
            return preprocessors
        }()),
        reporters: ['spec'],
        singleRun: true,
        webpack: webpackConfig,
        webpackMiddleware: {
            noInfo: true
        }
    });
};
