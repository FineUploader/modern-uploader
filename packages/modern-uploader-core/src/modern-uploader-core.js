import Plugin from './plugin'
import loadPlugins from './plugin-loader'

/**
 * Main class for core plug-in.
 *
 * @extends Plugin
 * @since 0.0.0
 */
class ModernUploaderCore extends Plugin {
    /**
     * Loads an array of plug-ins.
     *
     * @param {Array} plugins - Plugin object instances.
     * @throws {Error} If one of the passed plug-ins does not extend Plugin or if no plug-ins are passed.
     * @since 0.0.0
     */
    constructor(plugins = []) {
        super('core')

        loadPlugins(plugins)
    }
}

export default ModernUploaderCore
