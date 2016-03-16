var path = require('path')

module.exports = {
    resolve: {
        alias: {
            core: path.resolve('packages/modern-uploader-core')
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
