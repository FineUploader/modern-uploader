const data = new WeakMap()

class Store {
    constructor() {
        data.set(this, {})
    }
}

export default Store
