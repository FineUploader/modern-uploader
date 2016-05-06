/**
 * It would be nicer to simply import this from '@modern-uploader/core',
 * but without Webpack 2 tree-shaking, that will result in webpack
 * including the entire core plug-in in bundled code. Once this project
 * switches to using and recommended Webpack 2, this and other similar
 * imports should be simplified.
 */
import Plugin from '@modern-uploader/core/lib/plugin'

const options = new WeakMap()

/**
 * Main class for the Modern Uploader logger plug-in.
 *
 * @extends Plugin
 * @since 0.0.0
 */
class Logger extends Plugin {
    /**
     * Create a new instance of the Logger plug-in. The plug-in can be configured
     * by passing various options at this point.
     *
     * @param {Object} options - Various options used to configure the plug-in.
     * @param {boolean} [options.logAllEvents=false] - Log all events that progress through the system (even cancelled ones).
     * @param {string} [options.minimumLevel='info'] - Only log events with this severity level or greater.
     * @param {boolean} [options.timestamp=true] - Include the current time when logging the event.
     * @since 0.0.0
     * @example
     * import Core from '@modern-uploader/core'
     * import Logger from '@modern-uploader/logger'
     * // insert Logger plug-in into system with all default options
     * const modernUploader = new Core([
     *    new Logger()
     * ])
     *
     * import Core from '@modern-uploader/core'
     * import Logger from '@modern-uploader/logger'
     * // insert Logger plug-in into system - ensure it also logs all events
     * const modernUploader = new Core([
     *    new Logger({logAllEvents: true})
     * ])
     */
    constructor({logAllEvents = false, minimumLevel = 'info', timestamp = true} = {}) {
        super()
        options.set(this, {logAllEvents, minimumLevel, timestamp})
    }
}

export default Logger
