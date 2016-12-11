'use strict'

const test = require('tape')
const cyclestream = require('cyclestream')

test.skip('decon then recon: ', t => {
  let out = []
  const recon = cyclestream.retrocycler((...x) => { out.push(x) })
  const decon = cyclestream.decycler(recon)

  decon('hello')
  t.deepEqual(out, [
    ['hello']
  ])

})
