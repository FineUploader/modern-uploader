const privates = new WeakMap()

class Plugin {
    constructor(name = this.constructor.name) {
        privates.set(this, {name: name})
    }

    load() {
        throw new Error('Plug-in load method not properly implemented.')
    }

    get name() {
        return privates.get(this).name
    }
}

export default Plugin
