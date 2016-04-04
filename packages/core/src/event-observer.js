function observeEvents(api, store) {
    api.on('add', event => {
        if (!event.cancelled) {
            // TODO calculate ID if one not provided
            // TODO add to store if event not cancelled
            // TODO fire "added" event
        }
    })
}

export default observeEvents
