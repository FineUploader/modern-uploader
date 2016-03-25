import Core from 'core'

describe('sanity check', () => {
    it('makes sure test runner works w/ PhantomJS, Karma, and Jasmine', () => {
        expect(true).toBe(true)
    })

    it('makes sure that we can import modules', () => {
        expect(Core).toBeTruthy()
    })
})
