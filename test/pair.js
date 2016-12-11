'use strict'

const test = require('tape')
const cyclestream = require('cyclestream')

test('decycle: fake pair', t => {
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

test('retrocycle: fake pair', t => {
  let out = []
  const send = cyclestream.retrocycler((...x) => { out.push(x) })
  const a = [10,20,30]
  const fake = [ a ]  // pretend *a* was reconstructed
  fake.pairWith = () => true
  fake.atIndex = index => fake[index]
  send.pairWith(fake)

  send(1, 1, 1)
  t.deepEqual(out, [
    // NOT
    //  [ 'define', -2, [ 10, 20, 30 ] ],
    //  [ -2 ]
    // BUT:
    [a, a, a]
  ])
  t.end()
})

test.skip('pair', t => {
  let out = []
  const recon = cyclestream.retrocycler((...x) => { out.push(x) })
  // const locateDecon = cyclestream.decycler(recon)
  const remoteDecon = cyclestream.decycler({emit: 'pos'}, recon)

  // An inverted decycler can be paired, and now it will actually
  // share objects.
  remoteDecon.pairWith(recon)

  const a = [10,20,30]
  remoteDecon(a)
  // Literally, the SAME object, because of the pairing
  t.equal(out[0], a)
  a[1] = 50
  t.equal(out[0][1], 50)
  t.end()
})
