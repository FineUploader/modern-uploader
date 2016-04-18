import Core, {Event} from 'core'
import DummyPlugin from './dummy-plugin'

describe('Core plug-in loader', () => {
    it('throws if no plug-ins are passed', () => {
        expect(() => {
            new Core()
        }).toThrow()
    })

    it('does not attempt to load plugins if one of them does not extend Plugin', () => {
        class PlainOleClass {}

        expect(() => {
            new Core([
                new DummyPlugin('one', () => {}),
                new PlainOleClass(),
                new DummyPlugin('three', () => {})
            ])
        }).toThrow()
    })

    it('loads all plug-ins that return nothing on load()', (done) => {
        const loadedOrder = []

        new Core([
            new DummyPlugin('one', () => {loadedOrder.push('one')}),

            new DummyPlugin('two', () => {loadedOrder.push('two')}),

            new DummyPlugin('three', () => {
                loadedOrder.push('three')
                expect(loadedOrder).toEqual(['one', 'two', 'three'])
                done()
            })
        ])
    })

    it('stops loading plug-ins after one throws on load()', (done) => {
        const loadedOrder = []

        new Core([
            new DummyPlugin('one', () => {loadedOrder.push('one')}),

            new DummyPlugin('two', () => {
                loadedOrder.push('two')
                setTimeout(() => {
                    expect(loadedOrder).toEqual(['one', 'two'])
                    done()
                })
                throw new Error('Test plug-in load failure.')
            }),

            new DummyPlugin('three', () => {loadedOrder.push('three')})
        ])
    })

    it('loads all plug-ins that return and resolve a Promise on load()', (done) => {
        const loadedOrder = []

        new Core([
            new DummyPlugin('one', () => {
                return new Promise(resolve => {
                    loadedOrder.push('one')
                    resolve()
                })
            }),

            new DummyPlugin('two', () => {
                return new Promise(resolve => {
                    loadedOrder.push('two')
                    resolve()
                })
            }),

            new DummyPlugin('three', () => {
                return new Promise(resolve => {
                    loadedOrder.push('three')
                    expect(loadedOrder).toEqual(['one', 'two', 'three'])
                    resolve()
                    done()
                })
            })
        ])
    })

    it('stops loading plug-ins after one rejects a Promise on load()', (done) => {
        const loadedOrder = []

        new Core([
            new DummyPlugin('one', () => {
                return new Promise(resolve => {
                    loadedOrder.push('one')
                    resolve()
                })
            }),

            new DummyPlugin('two', () => {
                return new Promise((resolve, reject) => {
                    loadedOrder.push('two')
                    reject('Test plug-in load failure.')
                    setTimeout(() => {
                        expect(loadedOrder).toEqual(['one', 'two'])
                        done()
                    })
                })
            }),

            new DummyPlugin('three', () => {
                return new Promise(resolve => {
                    loadedOrder.push('three')
                    resolve()
                })
            })
        ])
    })

    it('allows plug-ins to extend the API simply by returning new methods', (done) => {
        new Core([
            new DummyPlugin('one', () => {
                return {
                    returnOne: () => 'one'
                }
            }),

            new DummyPlugin('two', (api) => {
                const oldReturnOne = api.returnOne.bind(api)
                const oldFire = api.fire.bind(api)

                return {
                    fire: (event) => {
                        event.override_test = true
                        return oldFire(event)
                    },
                    returnOne: () => {
                        return oldReturnOne() + '1'
                    }
                }
            }),

            new DummyPlugin('three', (api) => {
                api.on('allPluginsLoaded', () => {
                    expect(api.returnOne()).toBe('one1')

                    api.fire(
                        new Event({type: 'api-override-test'})
                    )
                    .then(event => {
                        expect(event.override_test).toBe(true)
                        done()
                    })
                })
            })
        ])
    })
})
