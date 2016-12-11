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
    const result = restructure(items)
    debug('decycled is', result)
    sink(...result)
  }

  let pairedWith
  me.pairWith = other => {
    if (pairedWith === other) return
    pairedWith = other
    other.pairWith(me)
  }
  me.indexOf = item => map.indexOf(item)
  function toPairCode (index) {
    if (index === -1) return undefined
    return 1 + index
  }

  return me
}

exports.retrocycler = retrocycler
