import Uuid from 'core/uuid'

describe('new Uuid', function () {
    it('generates a unique ID', () => {
        const  bucket = []

        // generate a bucket of 1000 unique ids
        for (let i = 0; i < 10000; i++) {
            bucket[i] = new Uuid().toString()
        }

        // check for duplicates
        bucket.sort()
        let last = bucket[0]
        for (let j = 1; j < bucket.length; j++) {
            expect(bucket[j]).not.toEqual(last)
            last = bucket[j]
        }
    })
})
