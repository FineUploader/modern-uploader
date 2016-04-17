import deliverEvent from './event-handler'
import Event from './event'
import loadPlugins from './plugin-loader'
import observeEvents from './event-observers'
import Plugin from './plugin'
import Store from './store'

const listeners = new WeakMap()
const stores = new WeakMap()

/**
 * Invoked when notifying a handler about an event it has registered for.
 *
 * @callback eventCallback
 * @param {Event} Event object associated with the registered event.
 * @since 0.0.0
 */

/**
 * Add one or more items to the system. This event is triggered before the item(s)
 * is/are actually persisted. If the event is cancelled, the item(s) will not
 * be persisted. Furthermore, the item(s) and their associated data can be
 * influenced by various event handlers.
 *
 * @event add
 * @type {Event}
 * @property {Event#payload} payload - Any data to store with the item.
 * In addition to the standardized properties described below, you may
 * include other custom properties that are useful to your specific use case
 * or plug-in as well. Note that the payload may be an Object or an Array.
 * In order to group multiple entries to be added, include an Array as the payload.
 * In that case, each array element will represent a single item and its associated
 * data. If you would like to group multiple items this way, the payload properties
 * documented here apply to each object in the array.
 * @property {*} payload.item - The item to be added. May be anything,
 * such as a File, Blob, &lt;canvas&gt;, etc.
 * @property {string} [payload.id] - A unique ID for this item. Will be
 * calculated by Core if not provided.
 * @property {string} [payload.name] - A name for the item.
 * @since 0.0.0
 * @example
 * // add a single item, ID will be generated
 * new Event({
 *    type: 'add',
 *    payload: {
 *       item: blob1,
 *       name: 'cat photos'
 *    }
 * })
 *
 * // add multiple items, IDs will be generated
 * new Event({
 *    type: 'add',
 *    payload: [
 *       {
 *          item: blob1,
 *          name: 'cat photos'
 *       },
 *       {
 *          item: blob2,
 *          name: 'dog photos'
 *       }
 *    ]
 * })
 */

/**
 * Indicates that one or more items have been added to the system.
 * This is an informational event.
 *
 * @event added
 * @type {Event}
 * @property {Event#payload} payload - This will always be an array of IDs
 * representing the added items.
 * @since 0.0.0
 */

/**
 * Indicates that all plugins have been successfully loaded by the library.
 * This is an informational event.
 *
 * @event allPluginsLoaded
 * @type {Event}
 * @since 0.0.0
 */

/**
 * Removes one or more items from the system. This event is triggered before the item(s)
 * is/are actually persisted. If the event is cancelled, the item(s) will not
 * be removed. To remove only a subset of the items originally bound for removal,
 * event handlers can return the subset of item IDs to remove. This means that another way
 * to prevent all items from being removed is to return an empty array.
 *
 * @event remove
 * @type {Event}
 * @property {Event#payload} payload - One or more items to remove from the system. To remove
 * a single item, simply include that item's ID as the payload. To remove multiple items,
 * pass an array of the item IDs as the payload.
 * @since 0.0.0
 * @example
 * // remove a single item w/ an ID of 12345
 * new Event({
 *    type: 'remove',
 *    payload: 12345
 * })
 *
 * // another way to remove a single item w/ an ID of 12345
 * new Event({
 *    type: 'remove',
 *    payload: [12345]
 * })
 *
 * // remove two items w/ an IDs of 12345 and 67890 respectively
 * new Event({
 *    type: 'remove',
 *    payload: [12345, 67890]
 * })
 */

/**
 * Indicates that one or more items have been removed from the system.
 * This is an informational event.
 *
 * @event removed
 * @type {Event}
 * @property {Event#payload} payload - IDs of the removed items. This will always be an array.
 * @since 0.0.0
 */

/**
 * Requests that an existing item record be updated. Specifics TBD.
 *
 * @event updateData
 * @type {Event}
 * @since 0.0.0
 */

/**
 * Main class for core plug-in.
 *
 * @extends Plugin
 * @listens add
 * @fires allPluginsLoaded
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
     * This looks up items in the store. It also provides an opportunity to
     * retrieve all items maintained by the system. Currently, items may be
     * looked up by ID, or you may retrieve all items from the store. By
     * default, the returned items will be deeply cloned, but this can be
     * switched off to save processor cycles for large data sets.
     * Any records that you would like to modify must be sent back
     * to the system in an [updateData event]{@link event:updateData}.
     *
     * @param {(Object|undefined)} entryQuery - Retrieve the associated
     * records from the store. An object describes the specific entries to return.
     * If this is undefined, all records will be returned.
     * @param {(string|number|Array)} entryQuery.id - The ID or IDs of the entries
     * to retrieve.
     * @param {boolean} [clone=true]
     * @returns {(Object|Array|null)} One or more matching records, or null if no matches were found.
     * If only one record was requested, the an Array will not be returned - only the
     * entry object or null if the entry cannot be located. If multiple records are
     * requested, an array will always be returned with any matching entries.
     * If no entries match, the array will be empty.
     * @since 0.0.0
     * @example
     * // get one record
     * const record = api.get({id: 'uuid-000'})
     * expect(record).toEqual(uuid000Record)
     *
     * // get multiple records
     * const record = api.get({id: ['uuid-000', 'uuid-001']})
     * expect(record).toEqual([uuid000Record, uuid001Record])
     *
     * // get all records
     * const record = api.get()
     * expect(record).toEqual([uuid000Record, uuid001Record, uuid002Record, ...])
     */
    get(entryQuery, clone = true) {
        const myStore = stores.get(this)

        if (!entryQuery) {
            return myStore.getAll(clone)
        }

        if (typeof entryQuery !== 'object') {
            throw new Error('entryQuery parameter must be an object!')
        }
        if (!entryQuery.id) {
            throw new Error('You may only query for IDs at the moment - so your entryQuery object must include an "id" property.')
        }

        if (!Array.isArray(entryQuery.id)) {
            return myStore.getById(entryQuery.id, clone)
        }

        const matchingRecords = []
        const ids = [].concat(entryQuery.id)
        ids.forEach(id => {
            const matchingRecord = myStore.getById(id, clone)
            matchingRecord && matchingRecords.push(matchingRecord)
        })
        return matchingRecords
    }

    /**
     * Trigger an event to be passed to all other registered event listeners. This event will be
     * bubbled, starting with the first registered listener, and ending with the last.
     *
     * @param {Event} event - event to pass to all registered listeners for this event type.
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
        if ( !(event instanceof Event) ) {
            throw new Error('You must pass an Event object to the fire method!')
        }

        const myListeners = listeners.get(this)
        return deliverEvent(event, myListeners)
    }

    /**
     * Register one or more handlers for one or more specific events.
     *
     * @param {(string|Object)} typeOrListenersObject - Register one listener by specifying the event type as a string here,
     * followed by the listener function as the next parameter, or pass a single object parameter
     * with event type properties and listener function values to conveniently register for multiple events.
     * @param {eventCallback} listener - Listener Function to be called when the passed event type is fired.
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
        if (typeof typeOrListenersObject !== 'object' && typeof typeOrListenersObject !== 'string') {
            throw new Error('The first argument to the on method must be a string or object!')
        }
        if (typeof listener !== 'function') {
            throw new Error('You must pass a callback function as the second argument to the on method!')
        }

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
     * @param {eventCallback} listener - Listener function
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
        if (typeof listener !== 'function') {
            throw new Error('You must pass a callback function to the onAll method!')
        }

        const myListeners = listeners.get(this)
        Object.keys(myListeners).concat('*').forEach(type => this.on(type, listener))
    }
}

export default Core
