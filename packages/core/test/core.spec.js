import Core, {Event, Plugin} from 'core'

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
    })
    
    describe('event handling', () => {
        describe('allModulesLoaded behavior', () => {
            it('fires allModulesLoaded once all modules are loaded - sync loading', (done) => {
                const core = new Core([
                    new DummyPlugin('one', () => {}),
                    new DummyPlugin('two', () => {})
                ])

                core.on('allModulesLoaded', (event) => {
                    expect(event.type).toBe('allModulesLoaded')
                    done()
                })
            })

            it('fires allModulesLoaded once all modules are loaded - async loading', (done) => {
                const core = new Core([
                    new DummyPlugin('one', () => new Promise(resolve => setTimeout(resolve, 20))),
                    new DummyPlugin('two', () => new Promise(resolve => setTimeout(resolve, 10)))
                ])

                setTimeout(() => {
                    core.on('allModulesLoaded', () => done())
                }, 30)
            })

            it('calls handlers in correcr order - sync module loaders w/ sync event handlers', (done) => {
                const callbacks = []

                new Core([
                    new DummyPlugin('one', api => {
                        api.on('allModulesLoaded', () => {
                            callbacks.push('one')
                            expect(callbacks).toEqual(['two', 'one'])
                            done()
                        })
                    }),
                    new DummyPlugin('two', api => {
                        api.on('allModulesLoaded', () => callbacks.push('two'))
                    })
                ])
            })

            it('calls handlers is correct order - async module loaders w/ sync event handlers', (done) => {
                const callbacks = []

                new Core([
                    new DummyPlugin('one', api => {
                        return new Promise(resolve => {
                            api.on('allModulesLoaded', () => {
                                callbacks.push('one')
                                expect(callbacks).toEqual(['two', 'one'])
                                done()
                            })
                            resolve()
                        })
                    }),
                    new DummyPlugin('two', api => {
                        return new Promise(resolve => {
                            api.on('allModulesLoaded', () => callbacks.push('two'))
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
                            api.on('allModulesLoaded', () => {
                                callbacks.push('one')
                                expect(callbacks).toEqual(['two', 'one'])
                                done()
                            })
                            resolve()
                        })
                    }),
                    new DummyPlugin('two', api => {
                        return new Promise(resolve => {
                            api.on('allModulesLoaded', () => {
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
                        api.on('allModulesLoaded', () => {
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
                        api.on('add', event => {
                            expect(event.result.item).toBe('canned file')
                        })
                    }),

                    new DummyPlugin('two', api => {
                        api.on('add', event => {
                            expect(event.payload.item instanceof Blob).toBeTruthy()
                            return {
                                item: 'canned file'
                            }
                        })
                    }),

                    new DummyPlugin('three', api => {
                        api.on('allModulesLoaded', () => {
                            api.fire(
                                new Event({
                                    type: 'add',
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
                        api.on('add', event => {
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
                        api.on('add', event => {
                            expect(event.payload.item instanceof Blob).toBeTruthy()
                            return new Promise(resolve => {
                                resolve({
                                    item: 'canned file'
                                })
                            })
                        })
                    }),

                    new DummyPlugin('three', api => {
                        api.on('allModulesLoaded', () => {
                            api.fire(
                                new Event({
                                    type: 'add',
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
                        api.on('add', event => {
                            expect(event.cancelled).toBe(true)
                            expect(event.result).toEqual({error: 'expected error during unit test'})
                            return {
                                item: 'canned file 2',
                                name: 'changed name'
                            }
                        })
                    }),

                    new DummyPlugin('two', api => {
                        api.on('add', event => {
                            expect(event.payload.item instanceof Blob).toBeTruthy()
                            return new Promise((resolve, reject) => {
                                reject({
                                    error: 'expected error during unit test'
                                })
                            })
                        })
                    }),

                    new DummyPlugin('three', api => {
                        api.on('allModulesLoaded', () => {
                            api.fire(
                                new Event({
                                    type: 'add',
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
    })

    // TODO allows API to be extended by modules via load method
})
