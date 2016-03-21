import Plugin from './plugin'

function checkPluginTypes(plugins) {
    plugins.forEach(plugin => {
        if (!(plugin instanceof Plugin)) {
            throw new Error('Provided module does not extend Plugin. ' + plugin)
        }
    })
}

function load(plugins) {
    if (plugins.length) {
        checkPluginTypes(plugins)
        loadPlugins(plugins)
    }
    else {
        throw new Error('No plug-ins to load!')
    }
}

function loadPlugin(plugin) {
    try {
        const returnValue = plugin.load()

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

function loadPlugins(plugins, index = 0) {
    const plugin = plugins[index]

    loadPlugin(plugin).then(
        function() {
            let nextIndex = index + 1
            if (nextIndex < plugins.length) {
                loadPlugins(plugins, nextIndex)
            }
        },

        errorMessage => {
            console.error(`${errorMessage} No more plug-ins will be loaded.`)
        }
    )
}


export default load
