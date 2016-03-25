import {Event} from 'core'

describe('Event', () => {
    it('constructs an event properly with minimal options', () => {
        const event = new Event({
            payload: {
                item: new Blob(['hello!'], {type: 'text/plain'})
            },
            type: 'add'
        })

        expect(event.type).toBe('add')
        expect(event.payload.item.type).toBe('text/plain')
        expect(event.informational).toBe(false)
    })

    it('constructs an event properly with all options specified', () => {
        const event = new Event({
            informational: true,
            payload: {
                item: new Blob(['hello!'], {type: 'text/plain'})
            },
            type: 'add'
        })

        expect(event.informational).toBe(true)
    })

    describe('Event instance', () => {
        let event

        beforeEach(() => {
            event = new Event({
                payload: {
                    item: new Blob(['hello!'], {type: 'text/plain'})
                },
                type: 'add'
            })
        })

        it('allows an event to be cancelled', () => {
            event.cancel()
            expect(event.cancelled).toBe(true)
        })

        it('allows an event result to be updated', () => {
            expect(event.result).toBe(undefined)
            event.result = 'some result'
            expect(event.result).toBe('some result')
        })
    })
})
