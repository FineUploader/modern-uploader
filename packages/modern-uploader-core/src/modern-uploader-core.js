import Plugin from './plugin'
import loadPlugins from './plugin-loader'

const listeners = new WeakMap()

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
     * @example
     * import Core from 'modern-uploader-core'
     *
     * const modernUploader = new Core([
     *    new SomePlugin1(),
     *    new SomePlugin2()
     * ])
     */
    constructor(plugins = []) {
        super('core')

        loadPlugins(plugins)
    }

    /**
     * Trigger an event to be passed to all other registered event listeners. This event will be
     * bubbled, starting with the first registered listener, and ending with the last.
     *
     * @param type Type of event to fire.
     * @param payload Data associated with this event, to be passed to all registered listeners.
     * @returns Promise Once the event has been bubbled to all registered listeners,
     * the result will be returned by resolving or rejecting this returned Promise, depending on the outcome.
     * If the event is cancelled by a listenered, this Promise will be rejected with any data provided
     * by the cancelling listener. If this event is not cancelled, any data provided by all listeners
     * will be included when resolving the returned Promise.
     * @since 0.0.0
     * @example
     * // A plug-in that wants to add a new item (File/Blob/etc),
     * // will fire an "add" event, which will be handled by the
     * // core plug-in, resulting in the addition of the item
     * // to the internal cache maintained by the core plug-in.
     * // But some other plug-in could also prevent this add
     * // from happening before it reaches the core plug-in
     * // (perhaps a validator plug-in, for example).
     * core.fire('add', item).then(
     *    function added() {
     *       // the item was added, either handle or ignore
     *    },
     *
     *    function notAdded(reason) {
     *       // something prevented item from being added
     *       // deal with this, such as by logging the reason
     *    }
     * )
     */
    fire(type, payload) {
    }

    /**
     * Register one or more handlers for one or more specific events.
     *
     * @param typeOrListenersObject Register one listener by specifying the event type as a string here,
     * followed by the listener function as the next parameter, or pass a single object parameter
     * with event type properties and listener function values to conveniently register for multiple events.
     * @param listener Listener function to be called when the passed event type is fired.
     * This parameter is ignored if the first parameter is a listener object.
     * @since 0.0.0
     * @example
     * // register a single listener for an "add" event
     * core.on('add', function(event) {
     *    // handle "add" event
     * })
     *
     * // register a listener for the "add" event,
     * // and another for the "remove" event
     * core.on({
     *    add: function(event) {
     *       // handle "add" event
     *    },
     *    remove: function(event) {
     *       // handle "remove" event
     *    }
     * })
     */
    on(typeOrListenersObject, listener) {
        if (typeof typeOrListenersObject === 'string') {
            const type = typeOrListenersObject
            const myListeners = listeners.get(this)
            const typeListeners = myListeners[type] || []

            typeListeners.push(listener)
            myListeners[type] = typeListeners
        }
        else {
            Object.keys(typeOrListenersObject).forEach(type => {
                this.on(type, typeOrListenersObject[type])
            })
        }
    }
}

export default ModernUploaderCore
