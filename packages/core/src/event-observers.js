import mergeOptions from 'merge-options'

import Event from './event'
import Uuid from './uuid'

function observeEvents(api, store) {
    api.on('add', event => {
        if (!event.cancelled) {
            const itemOrItems = event.result || event.payload
            addItems({items: [].concat(itemOrItems), store, api})
        }
    })
}

function addItems({api, items, store}) {
    let groupId = null

    if (items.length > 1) {
        groupId = new Uuid().toString()
    }

    const addedItemInfo = items.map(item => {
        return addItem({item, store, groupId})
    })

    api.fire(new Event({
        informational: true,
        payload: addedItemInfo.length === 1 ? addedItemInfo[0] : addedItemInfo,
        type: 'added'
    }))

}
function addItem({item, store, groupId}) {
    const entry = mergeOptions({}, item)

    if (entry.id == null) {
        entry.id = new Uuid().toString()
    }

    if (groupId) {
        entry.groupId = groupId
    }

    store.addEntry(entry)

    return {id: entry.id}
}

export default observeEvents
