import Uuid from './uuid'

function observeEvents(api, store) { // eslint-disable-line no-unused-vars
    api.on('add', event => {
        if (!event.cancelled) {
            const data = event.result || event.payload
            const newEntry = {
                id: data.id
            }

            if (newEntry.id != null) {
                newEntry.id = new Uuid().toString()
            }

            // TODO add to store if event not cancelled
            // TODO fire "added" event
        }
    })
}

export default observeEvents
