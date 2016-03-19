class Plugin {
    constructor(name = this.constructor.name) {
        this._name = name
    }

    load() {
        throw new Error('Plug-in load method not properly implemented.')
    }

    get name() {
        return this._name
    }
}

export default Plugin
