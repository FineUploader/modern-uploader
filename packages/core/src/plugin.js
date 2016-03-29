const privates = new WeakMap()

/**
 * Abstract class for a Modern Uploader plug-in.
 *
 * @since 0.0.0
 */
class Plugin {
    /**
     * @param {string} name A name for this plug-in (optional)
     * @since 0.0.0
     */
    constructor(name = this.constructor.name) {
        privates.set(this, {name: name})
    }

    /**
     * Called to load this specific plug-in. All setup logic, async or sync,
     * should be completed as part of handling this call. For example, register
     * event handlers here.
     *
     * @param {Core} api API for core module.
     * @returns {(null|undefined|Promise)} If a Promise is returned, resolve or reject once the outcome is known.
     * Otherwise, return nothing for success or throw for failure. To override existing
     * API methods, or provide new API methods, simply return an object (or pass one
     * through your call to resolve the returned Promise). Any new or overridden methods
     * will be available to all other plug-ins.
     * @throws {Error} If there is an immediate issue loading the plug-in.
     * @since 0.0.0
     * @abstract
     * @example
     * // simple load implementation
     * load(api) {
     *    api.on('add', event => {
     *       // handle "add" event
     *    })
     * }
     *
     * // adding a new API method
     * load(api) {
     *    return {
     *       sayHi: () => 'hi'
     *    }
     * }
     *
     * // overriding an existing API method
     * load(api) {
     *    // Always do this to ensure the original
     *    // method that you are overriding maintains
     *    // access to its expected context. Only
     *    // needed if you intend to call the original
     *    // method in the new method.
     *    const oldSayHi = api.add.bind(api)
     *
     *    return {
     *       sayHi: () => {
     *          return oldSayHi() + ' you!'
     *       }
     *    }
     * }
     */
    load(api) { // eslint-disable-line no-unused-vars
        throw new Error(`Plugin '${this.name}' is not meant to be loaded!`)
    }

    /**
     * A name for this plug-in.
     *
     * @type {string}
     * @since 0.0.0
     * @readonly
     */
    get name() {
        return privates.get(this).name
    }
}

export default Plugin
