import Core, {Event} from 'core'
import DummyPlugin from './dummy-plugin'
import initStorePlugin, {itemIds, items} from './init-store-plugin'

describe('Core "update" event observer', () => {
    it('does not update an item & does not trigger "updated" event if the "update" event has been cancelled', (done) => {
        let updated = false

        new Core([
            initStorePlugin,
            
            new DummyPlugin('one', api => {
                api.on('update', event => {
                    event.cancel()
                })
            }),

            new DummyPlugin('two', api => {
                api.on('allPluginsLoaded', () => {
                    api.fire(new Event({
                        type: 'update',
                        payload: {
                            id: itemIds[1],
                            item: 'updated item'
                        }
                    }))
                        .catch(event => {
                            setTimeout(() => {
                                expect(event.cancelled).toBe(true)
                                expect(updated).toBe(false)
                                expect(api.get({id: itemIds[1]}).item).toBe(items[1])
                                done()
                            })
                        }
                    )
                })

                api.on('updated', () => {
                    updated = true
                })
            })
        ])
    })

    it('updates an item & triggers "updated" event', (done) => {
        new Core([
            initStorePlugin,

            new DummyPlugin('two', api => {
                api.on('allPluginsLoaded', () => {
                    api.fire(new Event({
                        type: 'update',
                        payload: {
                            id: itemIds[1],
                            item: 'updated item'
                        }
                    }))
                        .then(event => {
                            expect(event.payload).toEqual({
                                id: itemIds[1],
                                item: 'updated item'
                            })
                        }
                    )
                })

                api.on('updated', () => {
                    expect(api.get({id: itemIds[1]}).item).toBe('updated item')
                    done()
                })
            })
        ])
    })
})
