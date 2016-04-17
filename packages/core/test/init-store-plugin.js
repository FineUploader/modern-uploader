import DummyPlugin from './dummy-plugin'
import {Event} from 'core'

export const itemIds = [123, 456]

const initStorePlugin = new DummyPlugin('storeInit', api => {
    api.fire(new Event({
        type: 'add',
        payload: [
            {
                id: itemIds[0],
                item: 'foo'
            },
            {
                id: itemIds[1],
                item: 'bar'
            }
        ]
    }))
})

export default initStorePlugin
