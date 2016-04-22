/**
 * It would be nicer to simply import this from '@modern-uploader/core',
 * but without Webpack 2 tree-shaking, that will result in webpack
 * including the entire core plug-in in bundled code. Once this project
 * switches to using and recommended Webpack 2, this and other similar
 * imports should be simplified.
 */
import Plugin from '@modern-uploader/core/lib/plugin'

/**
 * Main class for the Modern Uploader logger plug-in.
 *
 * @extends Plugin
 * @since 0.0.0
 */
class Logger extends Plugin {
    
}

export default Logger
