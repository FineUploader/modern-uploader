const data = new WeakMap()

class Store {
    constructor() {
        data.set(this, {})
    }

    add(entry) {
        const myData = data.get(this)
        myData[entry.id] = entry
    }
}

export default Store
