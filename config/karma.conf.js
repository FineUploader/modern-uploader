var path = require('path'),
    webpackConfig = require('./webpack.config'),
    customLaunchers = {
        sl_chrome: {
            base: 'SauceLabs',
            browserName: 'chrome',
            platform: 'Windows 7',
            version: 'latest'
        },
        sl_firefox: {
            base: 'SauceLabs',
            browserName: 'firefox',
            platform: 'Windows 10',
            version: 'latest'
        },
        sl_ios_safari: {
            base: 'SauceLabs',
            browserName: 'iphone',
            platform: 'OS X 10.11',
            version: '9.0'
        },
        sl_osx_safari: {
            base: 'SauceLabs',
            browserName: 'Safari',
            platform: 'OS X 10.11',
            version: '9.0'
        },
        sl_ie_11: {
            base: 'SauceLabs',
            browserName: 'internet explorer',
            platform: 'Windows 8.1',
            version: '11'
        },
        sl_edge: {
            base: 'SauceLabs',
            browserName: 'microsoftedge',
            platform: 'Windows 10',
            version: '13.10586'
        }
    }

webpackConfig.module.loaders[0].query.plugins = ['rewire'];
webpackConfig.devtool = 'inline-source-map'

module.exports = function (config) {
    config.set({
        basePath: '',
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
            'karma-sauce-launcher',
            'karma-sourcemap-loader',
            'karma-sinon'
        ],
        preprocessors: (function() {
            var preprocessors = {}
            preprocessors[path.resolve('test/tests.bundle.js')] = ['webpack', 'sourcemap']
            return preprocessors
        }()),
        sauceLabs: {
            testName: 'Modern Uploader tests'
        },
        customLaunchers: customLaunchers,
        browsers: Object.keys(customLaunchers),
        reporters: ['spec', 'saucelabs'],
        singleRun: true,
        webpack: webpackConfig,
        webpackMiddleware: {
            noInfo: true
        }
    });
};