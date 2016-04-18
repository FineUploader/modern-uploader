import {Plugin} from 'core'

class DummyPlugin extends Plugin {
    constructor(name, loadFunction) {
        super(name)
        this.load = loadFunction
    }
}

export default DummyPlugin
