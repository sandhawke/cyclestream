'use strict'

const test = require('tape')
const bimap = require('../bimap')

test('bimap', t => {
  const m = bimap()
  t.deepEqual(m.values, [])
  m.add(10)
  t.deepEqual(m.values, [10])
  m.add(20)
  m.add(30)
  t.deepEqual(m.values, [10, 20, 30])
  t.equal(m.indexOf(10), -2)
  t.equal(m.indexOf(20), -3)
  t.equal(m.indexOf(30), -4)
  t.end()
})

test('array as bimap', t => {
  const m = []

  function toCode (index) {
    if (index === -1) return undefined
    return -2 - index
  }
  
  t.deepEqual(m, [])
  m.push(10)
  t.deepEqual(m, [10])
  m.push(20)
  m.push(30)
  t.deepEqual(m, [10, 20, 30])
  t.equal(toCode(m.indexOf(10)), -2)
  t.equal(toCode(m.indexOf(20)), -3)
  t.equal(toCode(m.indexOf(30)), -4)
  t.end()
})
