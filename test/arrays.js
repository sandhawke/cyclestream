'use strict'

const test = require('tape')
const cyclestream = require('cyclestream')

test('two different arrays of 3 numbers', t => {
  let out = [] 
  const send = cyclestream.decycler((...x) => { out.push(x) })

  send([10,20,30])
  send([10,20,30])
  t.deepEqual(out, [
    [ 'define', -2, [ 10, 20, 30 ] ],
    [ -2 ],
    [ 'define', -3, [ 10, 20, 30 ] ],
    [ -3 ]
  ])
  t.end()
})

test('an array of 3 numbers, twice', t => {
  let out = [] 
  const send = cyclestream.decycler((...x) => { out.push(x) })

  const a = [10,20,30]
  send(a)
  send(a)
  t.deepEqual(out, [
    [ 'define', -2, [ 10, 20, 30 ] ],
    [ -2 ],
    [ -2 ]
  ])
  t.end()
})


test('empty array', t => {
  let out = [] 
  const send = cyclestream.decycler((...x) => { out.push(x) })

  const a = []
  send(a)
  send(a)
  t.deepEqual(out, [
    [ 'define', -2, [ ] ],
    [ -2 ],
    [ -2 ]
  ])
  t.end()
})

test('nested array', t => {
  let out = [] 
  const send = cyclestream.decycler((...x) => { out.push(x) })

  const a = [10, [20]]
  send(a)
  send(a)
  t.deepEqual(out, [
    [ 'define', -3, [ 20 ] ],
    [ 'define', -2, [ 10, -3 ] ],
    [ -2 ],
    [ -2 ] 
  ])
  t.end()
})


test('deeply nested array', t => {
  let out = [] 
  const send = cyclestream.decycler((...x) => { out.push(x) })

  const a = [10, [20]]
  const b = [[[[[a,50,a]]]]]
  send(b)
  t.deepEqual(out, [
    [ 'define', -8, [ 20 ] ],
    [ 'define', -7, [ 10, -8 ] ],
    [ 'define', -6, [ -7, 50, -7 ] ],
    [ 'define', -5, [ -6 ] ],
    [ 'define', -4, [ -5 ] ],
    [ 'define', -3, [ -4 ] ],
    [ 'define', -2, [ -3 ] ],
    [ -2 ]
  ])
  t.end()
})

