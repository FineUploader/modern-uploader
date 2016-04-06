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
     * @param {boolean} [eventData.informational=false] True to mark this event
     * as information. That is, no action can be taken by listeners to affect the
     * event.
     * @param {Object} [eventData.payload] - Data associated with this event
     * from the entity that triggered the event.
     * @param {string} eventData.type - Type of event to fire.
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
     * Marks this event as cancelled. When an event is cancelled, the event
     * will continue to bubble up through the list of registered listeners,
     * but the action associated with the event must no longer occur. For example,
     * if the "add" event is cancelled, the item to be added must not actually be
     * added to the system, but the "add" event will continue to reach all subsequent
     * listeners. Return values from subsequent listeners will be ignored for cancelled
     * events as well.
     *
     * Another use case for cancelling an event - a listener that has already performed
     * the action associated with the event and want to prevent any subsequent listeners
     * from performing any further actions.
     *
     * @since 0.0.0
     */
    cancel() {
        data.get(this).cancelled = true
    }

    /**
     * True if the event was cancelled. Event listeners must short-circuit and not perform
     * any intended action associated with an event if it has been cancelled. Also note
     * that return values for subsequent listeners are ignored once the event has been
     * cancelled.
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
     * Do NOT mutate the value of this property. Instead, create a deep copy
     * and mutate the copy.
     *
     * @type {(Object|undefined)}
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
     * Data provided by the previous event handler. In many, if not most cases,
     * this result value, which matches the return value of the most recent
     * event listener, replaces the [payload]{@link Event#payload} specified
     * by the creator of the event. Lack of a result indicates that the data
     * provided by the event creator is in effect and will be considered by all
     * listeners responding to the event. In other words, listeners that want to
     * affect the data associated with this event must clone the payload, make
     * appropriate changes, and then return this modified copy. Exceptional
     * events where this logic is not followed should be documented.
     *
     * Do NOT mutate the value of this property. Instead, create a deep
     * copy and mutate the copy.
     *
     * @type {(Object|undefined)}
     * @since 0.0.0
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
