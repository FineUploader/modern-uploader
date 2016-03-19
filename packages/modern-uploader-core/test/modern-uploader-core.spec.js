import Core, {Plugin} from 'core'

class DummyPlugin extends Plugin {
    constructor(name, loadFunction) {
        super(name)
        this.load = loadFunction
    }
}

describe('Core plug-in loader', () => {
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
