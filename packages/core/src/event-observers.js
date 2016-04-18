import observeAdd from './observe-add'
import observeRemove from './observe-remove'
import observeReset from './observe-reset'
import observeUpdate from './observe-update'

function observeEvents(api, store) {
    observeAdd(api, store)
    observeRemove(api, store)
    observeReset(api, store)
    observeUpdate(api, store)
}

export default observeEvents
