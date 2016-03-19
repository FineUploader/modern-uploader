const privates = new WeakMap()

/**
 * Abstract class for a Modern Uploader plug-in.
 *
 * @since 0.0.0
 */
class Plugin {
    /**
     * @param name {string} A name for this plug-in (optional)
     * @since 0.0.0
     */
    constructor(name = this.constructor.name) {
        privates.set(this, {name: name})
    }

    /**
     * Called to load this specific plug-in. All setup logic, async or sync, should be completed as part of handling this call.
     *
     * @returns {null|undefined|Promise} If a Promise is returned, resolve or reject once the outcome is known.
     * Otherwise, return nothing for success or throw for failure.
     * @throws {Error} If there is an immediate issue loading the plug-in.
     * @since 0.0.0
     * @abstract
     */
    load() {
        throw new Error('Plug-in load method not properly implemented.')
    }

    /**
     * @returns {string} A name for this plug-in.
     * @since 0.0.0
     * @readonly
     */
    get name() {
        return privates.get(this).name
    }
}

export default Plugin
