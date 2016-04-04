const placeholder = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'

/**
 * A new instance of this class creates a version 4 UUID,
 * which is accessible via the classes toString method.
 *
 * @since 0.0.0
 * @example
 * const uuid = new Uuid().toString()
 */
class Uuid {
    constructor() {
        const uuid = placeholder.replace(/[xy]/g, character => {
            const r = Math.random() * 16 | 0, v = character == 'x' ? r : (r & 0x3 | 0x8)
            return v.toString(16)
        })

        this.toString = () => uuid
    }
}

export default Uuid
