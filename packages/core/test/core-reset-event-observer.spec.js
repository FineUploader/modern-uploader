import Core, {Event} from 'core'
import DummyPlugin from './dummy-plugin'
import initStorePlugin from './init-store-plugin'

describe('Core "reset" event observer', () => {
    it('does not remove any items & does not trigger "reset" event if the "reset" event has been cancelled', (done) => {
        let reset = false

        new Core([
            initStorePlugin,
            
            new DummyPlugin('one', api => {
                api.on('reset', event => {
                    event.cancel()
                })
            }),

            new DummyPlugin('two', api => {
                api.on('allPluginsLoaded', () => {
                    api.fire(new Event({type: 'reset'}))
                        .catch(event => {
                            setTimeout(() => {
                                expect(event.cancelled).toBe(true)
                                expect(reset).toBe(false)
                                expect(api.get().length).toBe(2)
                                done()
                            })
                        }
                    )
                })

                api.on('resetComplete', () => {
                    reset = true
                })
            })
        ])
    })

    it('clears the store if a reset event succeeds & fires a resetComplete event', (done) => {
        new Core([
            initStorePlugin,

            new DummyPlugin('two', api => {
                api.on('allPluginsLoaded', () => {
                    api.fire(new Event({type: 'reset'}))
                        .then(event => {
                            expect(event.result).toBe(undefined)
                        })
                })

                api.on('resetComplete', () => {
                    expect(api.get().length).toBe(0)
                    done()
                })
            })
        ])
    })
})
