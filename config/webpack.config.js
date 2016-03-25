var path = require('path')

module.exports = {
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
