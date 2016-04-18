import Core, {Event} from 'core'
import DummyPlugin from './dummy-plugin'
import initStorePlugin, {itemIds} from './init-store-plugin'

describe('Core "remove" event observer', () => {
    it('does not remove any items & does not trigger "removed" event if the "remove" event has been cancelled', (done) => {
        let removed = false

        new Core([
            initStorePlugin,
            
            new DummyPlugin('one', api => {
                api.on('remove', event => {
                    event.cancel()
                })
            }),

            new DummyPlugin('two', api => {
                api.on('allPluginsLoaded', () => {
                    api.fire(new Event({
                        type: 'remove',
                        payload: itemIds
                    })).then(
                        function onRemoved() {},
                        function notRemoved(event) {
                            setTimeout(() => {
                                expect(event.cancelled).toBe(true)
                                expect(removed).toBe(false)
                                expect(api.get().length).toBe(2)
                                done()
                            })
                        }
                    )
                })

                api.on('removed', () => {
                    removed = true
                })
            })
        ])
    })

    it('removes a single item if a non-array ID is part of the "remove" payload - "removed" event reflects this', (done) => {
        new Core([
            initStorePlugin,

            new DummyPlugin('two', api => {
                api.on('allPluginsLoaded', () => {
                    api.fire(new Event({
                        type: 'remove',
                        payload: itemIds[0]
                    }))
                        .then(event => {
                            expect(event.result).toBe(undefined)
                        })
                })

                api.on('removed', event => {
                    expect(Array.isArray(event.payload)).toBe(true)
                    expect(event.payload).toEqual([itemIds[0]])

                    const itemsInStore = api.get()
                    expect(itemsInStore.length).toBe(1)
                    expect(itemsInStore[0].id).toBe(itemIds[1])
                    done()
                })
            })
        ])
    })

    it('removes all items & triggers a "removed" event if an "remove" event succeeds for all items', (done) => {
        new Core([
            initStorePlugin,

            new DummyPlugin('two', api => {
                api.on('allPluginsLoaded', () => {
                    api.fire(new Event({
                        type: 'remove',
                        payload: itemIds
                    }))
                    .then(event => {
                        expect(event.result).toBe(undefined)
                    })
                })

                api.on('removed', event => {
                    expect(Array.isArray(event.payload)).toBe(true)
                    expect(event.payload).toEqual(itemIds)
                    expect(api.get().length).toBe(0)
                    done()
                })
            })
        ])
    })


    it('removes a subset of items if a "remove" event handler requests as such - "removed" event reflects this', (done) => {
        new Core([
            initStorePlugin,

            new DummyPlugin('one', api => {
                api.on('remove', event => {
                    event.result = event.payload[1]
                })
            }),

            new DummyPlugin('two', api => {
                api.on('allPluginsLoaded', () => {
                    api.fire(new Event({
                        type: 'remove',
                        payload: itemIds
                    }))
                    .then(event => {
                        expect(event.result).toBe(itemIds[1])
                    })
                })

                api.on('removed', event => {
                    expect(Array.isArray(event.payload)).toBe(true)
                    expect(event.payload).toEqual([itemIds[1]])

                    const itemsInStore = api.get()
                    expect(itemsInStore.length).toBe(1)
                    expect(itemsInStore[0].id).toBe(itemIds[0])
                    done()
                })
            })
        ])
    })
})
