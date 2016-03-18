/** Main class for core plug-in */
class ModernUploaderCore {
    /**
     * Loads an array of plug-ins.
     * @param plugins An array of Plugin object instances.
     */
    constructor(plugins = []) {
        if (plugins.length) {
            this._loadPlugins(plugins)
        }
        else {
            console.error('No plug-ins to load!')
        }
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
                reject(error)
                console.error(`Plug-in ${plugin.name} failed to load.`)
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