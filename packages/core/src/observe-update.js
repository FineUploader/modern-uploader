import mergeOptions from 'merge-options'
import objectAssign from 'object-assign'

import Event from './event'

function observeUpdate(api, store) {
    api.on('update', event => {
        if (!event.cancelled) {
            const updateDescriptor = mergeOptions({}, event.result || event.payload)
            const id = updateDescriptor.id

            delete updateDescriptor[id]

            store.update(id, updateDescriptor)

            api.fire(new Event({
                informational: true,
                payload: objectAssign({id}, updateDescriptor),
                type: 'updated'
            }))
        }
    })
}

export default observeUpdate
