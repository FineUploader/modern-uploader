import observeAdd from './observe-add'
import observeRemove from './observe-remove'
import observeReset from './observe-reset'

function observeEvents(api, store) {
    observeAdd(api, store)
    observeRemove(api, store)
    observeReset(api, store)
}

export default observeEvents
