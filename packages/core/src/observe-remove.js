import Event from './event'

function observeRemove(api, store) {
    api.on('remove', event => {
        if (!event.cancelled) {
            const idOrIds = event.result || event.payload
            removeEntries({
                ids: [].concat(idOrIds),
                api,
                store
            })
        }
    })
}

function removeEntries({ids, api, store}) {
    ids.forEach(id => store.removeEntry(id))

    api.fire(new Event({
        informational: true,
        payload: ids,
        type: 'removed'
    }))
}

export default observeRemove
