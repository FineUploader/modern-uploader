const data = new WeakMap()

/**
 * An instance of this class represents an event that describes some
 * change in state or proposed change in state in the system.
 * @since 0.0.0
 * @example
 * // create a new event
 * const event = new Event({
 *    type: 'add',
 *    payload: {
 *       id: 0,
 *       name: 'my file.txt'
 *       item: someBlob
 *    }
 * })
 */
class Event {
    /**
     * Create a new Event.
     *
     * @param {Object} eventData
     * @param {boolean} [eventData.informational=false]
     * @param {*} [eventData.payload] Data associated with this event
     * from the entity that triggered the event.
     * @param {string} eventData.type Type of event to fire.
     * @since 0.0.0
     */
    constructor({informational = false, payload, type}) {
        data.set(this, {
            informational: informational,
            payload: payload,
            type: type
        })
    }

    /**
     * Marks this event as cancelled such that it should not
     * reach any further registered listeners.
     * @since 0.0.0
     */
    cancel() {
        data.get(this).cancelled = true
    }

    /**
     * True if the event was cancelled.
     *
     * @type {boolean}
     * @since 0.0.0
     * @readonly
     */
    get cancelled() {
        return !!data.get(this).cancelled
    }

    /**
     * True if the event is informational. False if it is actionable.
     *
     * @type {boolean}
     * @since 0.0.0
     * @readonly
     */
    get informational() {
        return data.get(this).informational
    }

    /**
     * Data associated with this event from the entity that triggered the event.
     *
     * @type {*}
     * @since 0.0.0
     * @readonly
     */
    get payload() {
        return data.get(this).payload
    }

    set result(newResult) {
        data.get(this).result = newResult
    }

    /**
     * Data provided by the previous event handler.
     *
     * @since 0.0.0
     * @type {*|undefined}
     * @readonly
     */
    get result() {
        return data.get(this).result
    }

    /**
     * Type of this event.
     *
     * @since 0.0.0
     * @type {string}
     * @readonly
     */
    get type() {
        return data.get(this).type
    }
}

export default Event
