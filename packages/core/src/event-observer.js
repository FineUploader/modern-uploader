import mergeOptions from 'merge-options'

import Event from './event'
import Uuid from './uuid'

function observeEvents(api, store) {
    api.on('add', event => {
        if (!event.cancelled) {
            const entry = mergeOptions({}, event.result || event.payload)

            if (entry.id == null) {
                entry.id = new Uuid().toString()
            }

            store.add(entry)

            api.fire(new Event({
                informational: true,
                payload: {id: entry.id},
                type: 'added'
            }))
        }
    })
}

export default observeEvents
