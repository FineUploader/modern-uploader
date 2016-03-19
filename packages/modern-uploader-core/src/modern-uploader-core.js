import Plugin from './plugin'

/** Main class for core plug-in */
class ModernUploaderCore extends Plugin {
    /**
     * Loads an array of plug-ins.
     * @param plugins An array of Plugin object instances.
     */
    constructor(plugins = []) {
        super('core')

        if (plugins.length) {
            this._checkPluginTypes(plugins)
            this._loadPlugins(plugins)
        }
        else {
            console.error('No plug-ins to load!')
        }
    }

    _checkPluginTypes(plugins) {
        plugins.forEach(plugin => {
            if (!(plugin instanceof Plugin)) {
                throw new Error('Provided module does not extend Plugin. ' + plugin)
            }
        })
    }

    _loadPlugin(plugin) {
        try {
            let returnValue = plugin.load()

            if (returnValue instanceof Promise) {
                return returnValue
            }

            return new Promise(resolve => resolve())
        }
        catch(error) {
            return new Promise((resolve, reject) => {
                error.message += ` Plug-in '${plugin.name}' failed to load.`
                reject(error)
            })
        }
    }

    _loadPlugins(plugins, index = 0) {
        const plugin = plugins[index]

        this._loadPlugin(plugin).then(
            () => {
                let nextIndex = index + 1
                if (nextIndex < plugins.length) {
                    this._loadPlugins(plugins, nextIndex)
                }
            },

            errorMessage => {
                console.error(`${errorMessage} No more plug-ins will be loaded.`)
            }
        )
    }
}

export default ModernUploaderCore
