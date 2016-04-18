import Core, {Event} from 'core'
import DummyPlugin from './dummy-plugin'

describe('Core generic event handling', () => {
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
