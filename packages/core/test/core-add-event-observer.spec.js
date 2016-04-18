import Core, {Event} from 'core'
import DummyPlugin from './dummy-plugin'
import Uuid from 'core/uuid'

describe('Core "add" event observer', () => {
    it('does not add an item if the add event has been cancelled', (done) => {
        let added = false

        new Core([
            new DummyPlugin('one', api => {
                api.on('add', event => {
                    event.cancel()
                })
            }),

            new DummyPlugin('two', api => {
                api.on('allPluginsLoaded', () => {
                    api.fire(new Event({
                        type: 'add',
                        payload: {
                            item: 'dummy file'
                        }
                    })).then(
                        function onAdded() {},
                        function notAdded() {
                            setTimeout(() => {
                                expect(added).toBe(false)
                                done()
                            })
                        }
                    )
                })

                api.on('added', () => {
                    added = true
                })
            })
        ])
    })

    it('triggers an "added" event if an "add" event succeeds', (done) => {
        let added = false
        const uuid = new Uuid()

        new Core([
            new DummyPlugin('one', api => {
                api.on('allPluginsLoaded', () => {
                    api.fire(new Event({
                        type: 'add',
                        payload: {
                            id: uuid.toString(),
                            item: 'dummy file'
                        }
                    })).then(
                        function onAdded() {
                            setTimeout(() => {
                                expect(added).toBe(true)
                                done()
                            })
                        }
                    )
                })

                api.on('added', event => {
                    added = true
                    expect(event.payload.length).toBe(1)
                    expect(event.payload[0]).toBe(uuid.toString())
                })
            })
        ])
    })

    it('triggers an "added" event for all added items if an "add" event succeeds w/ multiple items specified', (done) => {
        let added = false
        const uuid0 = new Uuid()
        const uuid1 = new Uuid()

        new Core([
            new DummyPlugin('one', api => {
                api.on('allPluginsLoaded', () => {
                    api.fire(new Event({
                        type: 'add',
                        payload: [
                            {
                                id: uuid0.toString(),
                                item: 'dummy file 0'
                            },
                            {
                                id: uuid1.toString(),
                                item: 'dummy file 1'
                            }
                        ]
                    })).then(
                        function onAdded() {
                            setTimeout(() => {
                                expect(added).toBe(true)
                                done()
                            })
                        }
                    )
                })

                api.on('added', event => {
                    added = true
                    expect(event.payload.length).toBe(2)
                    expect(event.payload[0]).toBe(uuid0.toString())
                    expect(event.payload[1]).toBe(uuid1.toString())
                })
            })
        ])
    })

    it('generates an ID if one is not passed', (done) => {
        new Core([
            new DummyPlugin('one', api => {
                api.on('allPluginsLoaded', () => {
                    api.fire(new Event({
                        type: 'add',
                        payload: {
                            item: 'dummy file'
                        }
                    }))
                })

                api.on('added', event => {
                    expect(event.payload.length).toBe(1)
                    expect(event.payload[0]).toBeTruthy()
                    done()
                })
            })
        ])
    })
})
