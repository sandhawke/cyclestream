'use strict'

const debug = require('debug')('retrocycler')

function retrocycler (options, sink) {
  if (!sink) {
    sink = options
    options = {}
  }
  let settings = {
  }
  Object.assign(settings, options)

  
  const map = []
  // rather than sending the index into the array, we send
  // (-2 - index), for reasons that are probably obsolete
  function toCode (index) {
    if (index === -1) return undefined
    return -2 - index
  }

  const me = function customRetrocycler (...items) {
    debug('\n\n\ndecycling', ...items)
    restructure(items)
  }

  let pairedWith
  me.pairWith = other => {
    if (pairedWith === other) return
    pairedWith = other
    other.pairWith(me)
  }
  me.indexOf = item => map.indexOf(item)
  me.atIndex = index => map[index]
  function toPairCode (index) {
    if (index === -1) return undefined
    return 1 + index
  }

  function restructure (item) {
    debug('restructing', item)
    // if (typeof (item) === 'number') return item
    if (Array.isArray(item)) {
      let [op, code, arg] = item
      // in case you want first word to be 'escape' or 'define'
      if (op === 'escape') {
        const msg = item.slice(1).map(deref)
        sink(...msg)
        return
      }
      if (op === 'define') {  
        if (!inMyCodeRange(code)) throw Error('invalid range for define')
        map[indexFromMyCode(code)] = arg
        console.log('map changed to', map)
        return
      }
      const msg = item.map(deref)
      sink(...msg)
    }
  }

  function deref (code) {
    if (inMyCodeRange(code)) return map[indexFromMyCode(code)]
    if (inPairCodeRange(code)) return pairedWith.atIndex(indexFromPairCode(code))
    // is safe?
    return code
  }

  function inMyCodeRange (code) {
    debug('inMyCodeRange', code)
    return (typeof code === 'number' && code <= -2)
  }

  function inPairCodeRange (code) {
    return (pairedWith && typeof code === 'number' && code >= 1)
  }

  function indexFromMyCode (code) {
    return (-2 - code)
  }

  function indexFromPairCode (code) {
    return code - 1
  }
  
  return me
}

exports.retrocycler = retrocycler
