'use strict'

const test = require('tape')
const cyclestream = require('cyclestream')

test('{}', t => {
  let out = [] 
  const send = cyclestream.decycler((...x) => { out.push(x) })

  send({})
  t.deepEqual(out, [
    [ 'define', -2, {} ],
    [ -2 ] 
  ])
  t.end()
})


test('{a:1} interned', t => {
  let out = [] 
  const send = cyclestream.decycler((...x) => { out.push(x) })

  send({a:1})
  t.deepEqual(out, [
    [ 'define', -3, 'a' ],
    [ 'define', -2, { '-3': 1 } ],
    [ -2 ] 
  ])
  t.end()
})

test('{a:1} not interned', t => {
  let out = [] 
  const send = cyclestream.decycler(
    {internStrings: false},
    (...x) => { out.push(x) })

  send({a:1})
  t.deepEqual(out, [
    [ 'define', -2, { a: 1 } ],
    [ -2 ] 
  ])
  t.end()
})

test('object loop', t => {
  let out = [] 
  const send = cyclestream.decycler((...x) => { out.push(x) })

  const obj = {}
  obj.a = obj
  send(obj)
  t.deepEqual(out, [
    [ 'define', -3, 'a' ],
    [ 'define', -2, { '-3': -2 } ],
    [ -2 ] 
  ])
  t.end()
})
