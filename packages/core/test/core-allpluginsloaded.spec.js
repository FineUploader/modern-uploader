import Core, {Event} from 'core'
import DummyPlugin from './dummy-plugin'

describe('Core allPluginsLoaded behavior', () => {
    it('fires allPluginsLoaded once all modules are loaded - sync loading', (done) => {
        const core = new Core([
            new DummyPlugin('one', () => {}),
            new DummyPlugin('two', () => {})
        ])

        core.on('allPluginsLoaded', (event) => {
            expect(event.type).toBe('allPluginsLoaded')
            done()
        })
    })

    it('fires allPluginsLoaded once all modules are loaded - async loading', (done) => {
        const core = new Core([
            new DummyPlugin('one', () => new Promise(resolve => setTimeout(resolve, 20))),
            new DummyPlugin('two', () => new Promise(resolve => setTimeout(resolve, 10)))
        ])

        setTimeout(() => {
            core.on('allPluginsLoaded', () => done())
        }, 29)
    })

    it('calls handlers in correct order - sync module loaders w/ sync event handlers', (done) => {
        const callbacks = []

        new Core([
            new DummyPlugin('one', api => {
                api.on('allPluginsLoaded', () => {
                    callbacks.push('one')
                    expect(callbacks).toEqual(['three', 'two', 'one'])
                    done()
                })
            }),
            new DummyPlugin('two', api => {
                api.on('allPluginsLoaded', () => callbacks.push('two'))
            }),
            new DummyPlugin('three', api => {
                api.on('allPluginsLoaded', () => callbacks.push('three'))
            })
        ])
    })

    it('calls handlers in correct order - w/ a handler registered for all events', (done) => {
        const callbacks = []

        new Core([
            new DummyPlugin('one', api => {
                api.on('test-event', () => {
                    callbacks.push('one')
                    expect(callbacks).toEqual(['three', 'two', 'one'])
                    done()
                })
            }),
            new DummyPlugin('two', api => {
                api.onAll(event => {
                    if (event.type === 'test-event') {
                        callbacks.push('two')
                    }
                })
            }),
            new DummyPlugin('three', api => {
                api.on('test-event', () => {
                    callbacks.push('three')
                })
            }),
            new DummyPlugin('four', api => {
                api.on('allPluginsLoaded', () => {
                    api.fire(new Event({type: 'test-event'}))
                })
            })
        ])
    })

    it('calls handler registered for all events, even without any other specifically registered listeners', (done) => {
        const eventsHandled = []

        new Core([
            new DummyPlugin('one', api => {
                api.onAll(event => {
                    eventsHandled.push(event.type)
                    if (eventsHandled.length === 2) {
                        expect(eventsHandled).toEqual(['test-event', 'test-event2'])
                        done()
                    }
                })
            }),
            new DummyPlugin('two', api => {
                api.on('allPluginsLoaded', () => {
                    api.fire(new Event({type: 'test-event'}))
                    api.fire(new Event({type: 'test-event2'}))
                })
            })
        ])
    })

    it('calls handlers is correct order - async module loaders w/ sync event handlers', (done) => {
        const callbacks = []

        new Core([
            new DummyPlugin('one', api => {
                return new Promise(resolve => {
                    api.on('allPluginsLoaded', () => {
                        callbacks.push('one')
                        expect(callbacks).toEqual(['two', 'one'])
                        done()
                    })
                    resolve()
                })
            }),
            new DummyPlugin('two', api => {
                return new Promise(resolve => {
                    api.on('allPluginsLoaded', () => callbacks.push('two'))
                    resolve()
                })
            })
        ])
    })

    it('calls handlers in correct order - async module loaders w/ async event handlers', (done) => {
        const callbacks = []

        new Core([
            new DummyPlugin('one', api => {
                return new Promise(resolve => {
                    api.on('allPluginsLoaded', () => {
                        callbacks.push('one')
                        expect(callbacks).toEqual(['two', 'one'])
                        done()
                    })
                    resolve()
                })
            }),
            new DummyPlugin('two', api => {
                return new Promise(resolve => {
                    api.on('allPluginsLoaded', () => {
                        return new Promise(resolve => {
                            callbacks.push('two')
                            resolve()
                        })
                    })
                    resolve()
                })
            })
        ])
    })
})
