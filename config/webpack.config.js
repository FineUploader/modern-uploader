const path = require('path')
const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
    entry: {
        core: [path.resolve('packages/core')]
    },
    output: {
        path: path.resolve('packages'),
        filename: `[name]/_dist/[name].${isProduction ? 'min.js' : '.js'}`
    },
    resolve: {
        alias: {
            core: path.resolve('packages/core')
        }
    },
    module: {
        loaders: [
            {
                test: /\.js/,
                loader: 'babel',
                exclude: /node_modules/,
                query: {
                    presets: ['es2015']
                }
            }
        ]
    },
    devtool: 'source-map'
}
