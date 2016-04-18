import DummyPlugin from './dummy-plugin'
import {Event} from 'core'

export const itemIds = [123, 456]
export const items = ['foo', 'bar']

const initStorePlugin = new DummyPlugin('storeInit', api => {
    api.fire(new Event({
        type: 'add',
        payload: [
            {
                id: itemIds[0],
                item: items[0]
            },
            {
                id: itemIds[1],
                item: items[1]
            }
        ]
    }))
})

export default initStorePlugin
