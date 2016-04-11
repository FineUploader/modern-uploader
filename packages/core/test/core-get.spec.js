import Core, {Event} from 'core'
import DummyPlugin from './dummy-plugin'
import Uuid from 'core/uuid'

describe('Core - getting specific records by ID or every record from the store', () => {
    const uuid0 = new Uuid()
    const uuid1 = new Uuid()
    let core

    beforeEach((done) => {
        core = new Core([
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
                    })).then(done)
                })
            })
        ])
    })

    it('returns all records when no params are passed', () => {
        const getResults = core.get()

        expect(getResults.length).toBe(2)

        expect(getResults[0].id).toEqual(uuid0.toString())
        expect(getResults[0].item).toEqual('dummy file 0')
        expect(getResults[0].groupId).toBeTruthy()

        expect(getResults[1].id).toEqual(uuid1.toString())
        expect(getResults[1].item).toEqual('dummy file 1')
        expect(getResults[1].groupId).toBeTruthy()
    })

    it('returns null when a single ID is queried and the ID does not exist', () => {
        const getResults = core.get({id: 'foo'})

        expect(getResults).toBe(null)
    })

    it('returns the matching record when a single ID is queried and it has a match', () => {
        const getResults = core.get({id: uuid0.toString()})

        expect(getResults.id).toEqual(uuid0.toString())
        expect(getResults.item).toEqual('dummy file 0')
        expect(getResults.groupId).toBeTruthy()
    })

    it('returns all matching records when multiple IDs are queried', () => {
        const getResults = core.get({
            id: [uuid0.toString(), uuid1.toString()]
        })

        expect(getResults.length).toBe(2)

        expect(getResults[0].id).toEqual(uuid0.toString())
        expect(getResults[0].item).toEqual('dummy file 0')
        expect(getResults[0].groupId).toBeTruthy()

        expect(getResults[1].id).toEqual(uuid1.toString())
        expect(getResults[1].item).toEqual('dummy file 1')
        expect(getResults[1].groupId).toBeTruthy()
    })

    it('clones returned records by default', () => {
        const getResults = core.get({id: uuid1.toString()})
        getResults.item = 'changed'

        const currentGetResults = core.get({id: uuid1.toString()})
        expect(currentGetResults.item).toBe('dummy file 1')
    })

    it('does not clone returned records if requested', () => {
        const getResults = core.get({id: uuid1.toString()}, false)
        getResults.item = 'changed'

        const currentGetResults = core.get({id: uuid1.toString()})
        expect(currentGetResults.item).toBe('changed')
    })
})
