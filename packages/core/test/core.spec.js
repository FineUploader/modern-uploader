import Core, {Event, Plugin} from 'core'
import Uuid from 'core/uuid'

class DummyPlugin extends Plugin {
    constructor(name, loadFunction) {
        super(name)
        this.load = loadFunction
    }
}

describe('Core', () => {
    describe('plug-in loader', () => {
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
    
    describe('event handling', () => {
        describe('allPluginsLoaded behavior', () => {
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

        describe('generic event handling', () => {
            it('marks an event as cancelled if a handler calls the cancel method', (done) => {
                const callbacks = []

                new Core([
                    new DummyPlugin('one', api => {
                        api.on('test', (event) => {
                            callbacks.push('one')
                            expect(event.cancelled).toBe(true)
                            expect(callbacks).toEqual(['three', 'one'])
                        })
                    }),

                    new DummyPlugin('two', api => {
                        api.on('allPluginsLoaded', () => {
                            api.fire(new Event({type: 'test'})).then(
                                () => {},
                                event => {
                                    expect(event.cancelled).toBe(true)
                                    done()
                                }
                            )
                        })
                    }),

                    new DummyPlugin('three', api => {
                        api.on('test', (event) => {
                            callbacks.push('three')
                            expect(event.cancelled).toBe(false)
                            event.cancel()
                        })
                    })
                ])
            })

            it('passes data returned from one handler to subsequent handlers & event creator', (done) => {
                new Core([
                    new DummyPlugin('one', api => {
                        api.on('test', event => {
                            expect(event.result.item).toBe('canned file')
                        })
                    }),

                    new DummyPlugin('two', api => {
                        api.on('test', event => {
                            expect(event.payload.item instanceof Blob).toBeTruthy()
                            return {
                                item: 'canned file'
                            }
                        })
                    }),

                    new DummyPlugin('three', api => {
                        api.on('allPluginsLoaded', () => {
                            api.fire(
                                new Event({
                                    type: 'test',
                                    payload: {
                                        item: new Blob(['hello!'], {type: 'text/plain'})
                                    }
                                })
                            ).then(event => {
                                expect(event.cancelled).toBe(false)
                                expect(event.result.item).toBe('canned file')
                                done()
                            })
                        })
                    })
                ])
            })

            it('passes data returned from one handler to subsequent handlers & event creator w/ async handlers', (done) => {
                new Core([
                    new DummyPlugin('one', api => {
                        api.on('test', event => {
                            return new Promise(resolve => {
                                expect(event.result.item).toBe('canned file')
                                resolve({
                                    item: 'canned file 2',
                                    name: 'changed name'
                                })
                            })
                        })
                    }),

                    new DummyPlugin('two', api => {
                        api.on('test', event => {
                            expect(event.payload.item instanceof Blob).toBeTruthy()
                            return new Promise(resolve => {
                                resolve({
                                    item: 'canned file'
                                })
                            })
                        })
                    }),

                    new DummyPlugin('three', api => {
                        api.on('allPluginsLoaded', () => {
                            api.fire(
                                new Event({
                                    type: 'test',
                                    payload: {
                                        item: new Blob(['hello!'], {type: 'text/plain'})
                                    }
                                })
                            ).then(event => {
                                expect(event.cancelled).toBe(false)
                                expect(event.result.item).toBe('canned file 2')
                                expect(event.result.name).toBe('changed name')
                                done()
                            })
                        })
                    })
                ])
            })

            it('marks event as cancelled and ignores return value for subsequent handlers when a handler rejects returned promise', (done) => {
                new Core([
                    new DummyPlugin('one', api => {
                        api.on('test', event => {
                            expect(event.cancelled).toBe(true)
                            expect(event.result).toEqual({error: 'expected error during unit test'})
                            return {
                                item: 'canned file 2',
                                name: 'changed name'
                            }
                        })
                    }),

                    new DummyPlugin('two', api => {
                        api.on('test', event => {
                            expect(event.payload.item instanceof Blob).toBeTruthy()
                            return new Promise((resolve, reject) => {
                                reject({
                                    error: 'expected error during unit test'
                                })
                            })
                        })
                    }),

                    new DummyPlugin('three', api => {
                        api.on('allPluginsLoaded', () => {
                            api.fire(
                                new Event({
                                    type: 'test',
                                    payload: {
                                        item: new Blob(['hello!'], {type: 'text/plain'})
                                    }
                                })
                            )
                            .then(
                                () => {},
                                event => {
                                    expect(event.cancelled).toBe(true)
                                    expect(event.result).toEqual({error: 'expected error during unit test'})
                                    done()
                                }
                            )
                        })
                    })
                ])
            })
        })

        describe('"add" event observer', () => {
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
                            expect(event.payload.id).toBe(uuid.toString())
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
                            expect(Array.isArray(event.payload)).toBeTruthy()
                            expect(event.payload[0].id).toBe(uuid0.toString())
                            expect(event.payload[1].id).toBe(uuid1.toString())
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
                            expect(event.payload.id).toBeTruthy()
                            done()
                        })
                    })
                ])
            })
        })
    })
})
