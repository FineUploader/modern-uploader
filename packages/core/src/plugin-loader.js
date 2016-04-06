import objectAssign from 'object-assign'

import Event from './event'
import Plugin from './plugin'

function checkPluginTypes(plugins) {
    plugins.forEach(plugin => {
        if (!(plugin instanceof Plugin)) {
            throw new Error('Provided module does not extend Plugin. ' + plugin)
        }
    })
}

function load(plugins, api) {
    if (plugins.length) {
        checkPluginTypes(plugins)
        loadPlugins(plugins, {api})
    }
    else {
        throw new Error('No plug-ins to load!')
    }
}

function loadPlugin(plugin, api) {
    try {
        const returnValue = plugin.load(api)

        if (returnValue instanceof Promise) {
            return returnValue
        }

        return new Promise(resolve => resolve(returnValue))
    }
    catch(error) {
        return new Promise((resolve, reject) => {
            error.message += ` Plug-in '${plugin.name}' failed to load.`
            reject(error)
        })
    }
}

function loadPlugins(plugins, {api, index = 0}) {
    const plugin = plugins[index]

    loadPlugin(plugin, api).then(
        function(returnValue) {
            if (typeof returnValue === 'object') {
                objectAssign(api, returnValue)
            }

            let nextIndex = index + 1
            if (nextIndex < plugins.length) {
                loadPlugins(plugins, {api, index: nextIndex})
            }
            else {
                api.fire(new Event({
                    informational: true,
                    type: 'allModulesLoaded'
                }))
            }
        },

        errorMessage => {
            console.error(`${errorMessage} No more plug-ins will be loaded.`)
        }
    )
}

export default load
