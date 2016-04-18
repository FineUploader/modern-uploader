import mergeOptions from 'merge-options'

const entries = new WeakMap()

class Store {
    constructor() {
        this.clear()
    }

    addEntry(entry) {
        entries.get(this)[entry.id] = entry
    }

    clear() {
        entries.set(this, {})
    }

    getAll(clone = true) {
        const entriesMap = entries.get(this)
        return Object.keys(entriesMap).map(entryId => {
            if (clone) {
                return mergeOptions({}, entriesMap[entryId])
            }

            return entriesMap[entryId]
        })
    }

    getById(id, clone = true) {
        const entry = entries.get(this)[id]

        if (entry && clone) {
            return mergeOptions({}, entry)
        }

        return entry || null
    }

    removeEntry(id) {
        const entriesMap = entries.get(this)
        delete entriesMap[id]
    }

    update(id, dataToUpdate) {
        const entry = entries.get(this)[id]
        this.addEntry(mergeOptions(entry, dataToUpdate))
    }
}

export default Store
