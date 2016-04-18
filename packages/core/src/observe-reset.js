import Event from './event'

function observeReset(api, store) {
    api.on('reset', event => {
        if (!event.cancelled) {
            store.clear()

            api.fire(new Event({
                informational: true,
                type: 'resetComplete'
            }))
        }
    })
}

export default observeReset
