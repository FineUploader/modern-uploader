import objectAssign from 'object-assign'

function deliverEvent(event, listeners) {
    const listenersForEventType = listeners[event.type] || listeners['*']
    if (listenersForEventType) {
        return deliverEventToListener(event, objectAssign([], listenersForEventType))
    }

    return new Promise(resolve => resolve(event))
}

function deliverEventToListener(event, listeners) {
    return new Promise((resolve, reject) => {
        const listener = listeners.pop()

        if (event.cancelled || event.informational) {
            listener(event)
            listeners.length ? deliverEventToListener(event, listeners).then(resolve, reject) : reject(event)
        }
        else {
            const listenerResult = listener(event)

            if (listenerResult instanceof Promise) {
                listenerResult.then(
                    (result) => {
                        if (result != null) {
                            event.result = result
                        }
                        listeners.length ? deliverEventToListener(event, listeners).then(resolve, reject) : resolve(event)
                    },

                    (failureData) => {
                        event.cancel()
                        if (failureData) {
                            event.result = failureData
                        }
                        listeners.length ? deliverEventToListener(event, listeners).then(resolve, reject) : reject(event)
                    }
                )
            }
            else {
                if (listenerResult != null) {
                    event.result = listenerResult
                }
                listeners.length ? deliverEventToListener(event, listeners).then(resolve, reject) : resolve(event)
            }
        }
    })
}

export default deliverEvent
