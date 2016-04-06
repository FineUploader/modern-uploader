import deliverEvent from './event-handler'
import loadPlugins from './plugin-loader'
import observeEvents from './event-observer'
import Plugin from './plugin'
import Store from './store'

const listeners = new WeakMap()
const stores = new WeakMap()

/**
 * Invoked when notifying a handler about an event it has registered for.
 *
 * @callback eventCallback
 * @param {Event} Event object associated with the registered event.
 */

/**
 * Add an item to the system. This event is triggered before the item
 * is actually persisted. If the event is cancelled, the item will not
 * be persisted. Furthermore, the item and its associated data can be
 * influenced by various event handlers.
 *
 * @event add
 * @type {Event}
 * @property {Event#payload} payload - Any data to store with the item.
 * In addition to the standardized properties described below, you may
 * include other custom properties that are useful to your specific use case
 * or plug-in as well.
 * @property {*} payload.item - The item to be added. May be anything,
 * such as a File, Blob, &lt;canvas&gt;, etc.
 * @property {string} [payload.id] - A unique ID for this item. Will be
 * calculated by Core if not provided.
 * @property {string} [payload.name] - A name for the item.
 */

/**
 * Indicates that a specific item has been added to the system.
 * This is an informational event.
 *
 * @event added
 * @type {Event}
 * @property {Event#payload} payload - Information about the added item.
 * @property {*} payload.id - The unique ID of the added item.
 */

/**
 * Indicates that all plugins/modules have been successfully loaded by the library.
 * This is an informational event.
 *
 * @event allModulesLoaded
 * @type {Event}
 */

/**
 * Requests that an existing item record be updated. Specifics TBD.
 *
 * @event updateData
 * @type {Event}
 */

/**
 * Main class for core plug-in.
 *
 * @extends Plugin
 * @listens add
 * @fires allModulesLoaded
 * @fires added
 * @since 0.0.0
 * @example
 * import Core from 'core'
 *
 * const modernUploader = new Core([
 *    new SomePlugin1(),
 *    new SomePlugin2()
 * ])
 */
class Core extends Plugin {
    /**
     * Loads an array of plug-ins.
     *
     * @param {Array} plugins - Plugin object instances.
     * @throws {Error} If one of the passed plug-ins does not extend Plugin or if no plug-ins are passed.
     * @since 0.0.0
     */
    constructor(plugins = []) {
        super('core')

        if (!window.Promise) {
            throw new Error('Promises are required by this library, but are supported in this browser. Please use a Promise polyfill.')
        }

        listeners.set(this, {})
        stores.set(this, new Store())
        
        observeEvents(this, stores.get(this))
        
        loadPlugins(plugins, this)
    }

    /**
     * This looks up items by ID. It also provides an opportunity to retrieve all items
     * maintained by the system. The returned records will NOT be cloned (in an effort to
     * ensure this operation is not time consuming). So, please do NOT modify these records
     * directly. Any records that you would like to modify must be cloned and then sent back
     * to the module in an [updateData event]{@link event:updateData}.
     *
     * @param {(string|Array|undefined)} idOrIds - Retrieve the associated records by ID.
     * If this is undefined, all records will be returned.
     * @returns {(Array|null)} One or more matching records, or null if no matches were found.
     * @example
     * // get one record
     * const record = api.get('uuid-000')
     * expect(record).toEqual([uuid000Record])
     *
     * // get multiple records
     * const record = api.get(['uuid-000', 'uuid-001'])
     * expect(record).toEqual([uuid000Record, uuid001Record])
     *
     * // get all records
     * const record = api.get()
     * expect(record).toEqual([uuid000Record, uuid001Record, uuid002Record, ...])
     */
    get(idOrIds) {
        stores.get(this).get(idOrIds)
    }

    /**
     * Trigger an event to be passed to all other registered event listeners. This event will be
     * bubbled, starting with the first registered listener, and ending with the last.
     *
     * @param {Event} event event to pass to all registered listeners for this event type.
     * @returns {Promise} Once the event has been bubbled to all registered listeners,
     * the result will be returned by resolving or rejecting this returned Promise, depending on the outcome.
     * If the event is cancelled by a listener, this Promise will be rejected with any data provided
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
     * core.fire(
     *    new Event({
     *       type: 'add',
     *       payload: {
     *          item: someFile
     *       }
     *    })
     * )
     * .then(
     *    function added(event) {
     *       // the item was added
     *    },
     *
     *    function notAdded(event) {
     *       // something prevented item from being added
     *    }
     * )
     */
    fire(event) {
        const myListeners = listeners.get(this)
        return deliverEvent(event, myListeners)
    }

    /**
     * Register one or more handlers for one or more specific events.
     *
     * @param {(string|Object)} typeOrListenersObject Register one listener by specifying the event type as a string here,
     * followed by the listener function as the next parameter, or pass a single object parameter
     * with event type properties and listener function values to conveniently register for multiple events.
     * @param {eventCallback} Listener Function to be called when the passed event type is fired.
     * This parameter is ignored if the first parameter is a listener object. In that case, it must be
     * supplied as the value for each event type property in the passed object.
     * @since 0.0.0
     * @example
     * // register a single listener for an "add" event
     * core.on('add', event => {
     *    // handle "add" event
     * })
     *
     * // register a listener for the "add" event,
     * // and another for the "remove" event
     * core.on({
     *    add: event => {
     *       // handle "add" event
     *    },
     *    remove: event => {
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
            listeners.set(this, myListeners)
        }
        else {
            Object.keys(typeOrListenersObject).forEach(type => {
                this.on(type, typeOrListenersObject[type])
            })
        }
    }

    /**
     * Register a listener for all events. This may be useful for plug-ins that need to be notified
     * whenever any event is triggered in the system. A good example would be a plug-in that logs all
     * activity.
     *
     * @param {eventCallback} listener Listener function
     * @since 0.0.0
     * @example
     * // register for all system events
     * core.onAll(event => {
     *    console.log(`I just received an event of type ${event.type}.`)
     *    // do something else with this event:
     *    //   - return a new value for the originator
     *    //   - cancel the event
     *    //   - passively listen or react in some other way
     * })
     */
    onAll(listener) {
        const myListeners = listeners.get(this)
        Object.keys(myListeners).concat('*').forEach(type => this.on(type, listener))
    }
}

export default Core
