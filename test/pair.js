'use strict'

const test = require('tape')
const cyclestream = require('cyclestream')

test('fake pair', t => {
  let out = []
  const send = cyclestream.decycler((...x) => { out.push(x) })
  const a = [10,20,30]
  const fake = [ a ]  // pretend *a* was reconstructed
  fake.pairWith = () => true
  send.pairWith(fake)

  send(a)
  t.deepEqual(out, [
    // NOT
    //  [ 'define', -2, [ 10, 20, 30 ] ],
    //  [ -2 ]
    // BUT:
    [1]
  ])
  t.end()
})

