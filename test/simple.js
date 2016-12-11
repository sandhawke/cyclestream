'use strict'

const test = require('tape')
const cyclestream = require('cyclestream')

test('single numeric', t => {
  let out = [] 
  const send = cyclestream.decycler((...x) => { out.push(x) })

  send(10)
  t.deepEqual(out, [
    [10]
  ])
  t.end()
})

test('multiple numeric', t => {
  let out = [] 
  const send = cyclestream.decycler((...x) => { out.push(x) })

  send(1,2,3,4,5)
  t.deepEqual(out, [
    [1,2,3,4,5]
  ])
  t.end()
})

test('single numeric', t => {
  let out = [] 
  const send = cyclestream.decycler((...x) => { out.push(x) })

  send(10)
  t.deepEqual(out, [
    [10]
  ])
  t.end()
})

test('single string', t => {
  let out = [] 
  const send = cyclestream.decycler((...x) => { out.push(x) })

  send('hello')
  t.deepEqual(out, [
    [ 'define', -2, 'hello' ],
    [ -2 ] 
  ])
  t.end()
})

test('two strings', t => {
  let out = [] 
  const send = cyclestream.decycler((...x) => { out.push(x) })

  send('hello', 'world')
  t.deepEqual(out, [
    [ 'define', -2, 'hello' ],
    [ 'define', -3, 'world' ],
    [ -2, -3 ] 
  ])
  t.end()
})



test.skip(t => {
  const a = []
  const b = {}
  a.push(b)
  b.a = a

  console.log(a)
  // => [ { a: [Circular] } ]
  console.log(b)
  // => { a: [ [Circular] ] }

  let out = [] 
  const send = cyclestream.decycler((...x) => { out.push(x) })
  
  send(a)
  t.deepEqual(out, [
    ['define', 1, [2]],
    ['define', 2, {a:1}],
    [[1]]
  ])
  
  send(a, a)
  t.deepEqual(out, [
    [[1, 1]]
  ])
  
  send(b)
  t.deepEqual(out, [
    [2]
  ])
  
})
 
