import observeAdd from './observe-add'
import observeRemove from './observe-remove'

function observeEvents(api, store) {
    observeAdd(api, store)
    observeRemove(api, store)
}

export default observeEvents
