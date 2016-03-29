const path = require('path')
const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
    entry: {
        core: [path.resolve('packages/core/src')]
    },
    output: {
        path: path.resolve('packages'),
        filename: `[name]/dist/[name].${isProduction ? 'min.js' : '.js'}`
    },
    resolve: {
        alias: {
            core: path.resolve('packages/core/src')
        }
    },
    module: {
        loaders: [
            {
                test: /\.js/,
                loader: 'babel',
                exclude: /node_modules/
            }
        ]
    },
    devtool: 'source-map'
}
