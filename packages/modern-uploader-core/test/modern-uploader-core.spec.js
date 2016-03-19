import Core from 'core/src/modern-uploader-core'

class Plugin {
    constructor(name, loadFunction) {
        this.name = name
        this.load = loadFunction
    }
}

describe('Core plug-in loader', () => {
    it('loads all plug-ins that return nothing on load()', (done) => {
        const loadedOrder = []

        new Core([
            new Plugin('one', () => {loadedOrder.push('one')}),

            new Plugin('two', () => {loadedOrder.push('two')}),

            new Plugin('three', () => {
                loadedOrder.push('three')
                expect(loadedOrder).toEqual(['one', 'two', 'three'])
                done()
            })
        ])
    })

    it('stops loading plug-ins after one throws on load()', (done) => {
        const loadedOrder = []

        new Core([
            new Plugin('one', () => {loadedOrder.push('one')}),

            new Plugin('two', () => {
                loadedOrder.push('two')
                setTimeout(() => {
                    expect(loadedOrder).toEqual(['one', 'two'])
                    done()
                })
                throw new Error('Test plug-in load failure.')
            }),

            new Plugin('three', () => {loadedOrder.push('three')})
        ])
    })

    it('loads all plug-ins that return and resolve a Promise on load()', (done) => {
        const loadedOrder = []

        new Core([
            new Plugin('one', () => {
                return new Promise(resolve => {
                    loadedOrder.push('one')
                    resolve()
                })
            }),

            new Plugin('two', () => {
                return new Promise(resolve => {
                    loadedOrder.push('two')
                    resolve()
                })
            }),

            new Plugin('three', () => {
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
            new Plugin('one', () => {
                return new Promise(resolve => {
                    loadedOrder.push('one')
                    resolve()
                })
            }),

            new Plugin('two', () => {
                return new Promise((resolve, reject) => {
                    loadedOrder.push('two')
                    reject('Test plug-in load failure.')
                    setTimeout(() => {
                        expect(loadedOrder).toEqual(['one', 'two'])
                        done()
                    })
                })
            }),

            new Plugin('three', () => {
                return new Promise(resolve => {
                    loadedOrder.push('three')
                    resolve()
                })
            })
        ])
    })
})
