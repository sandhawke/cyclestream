'use strict'

const debug = require('debug')('decycler')
// const bimap = require('./bimap')

function decycler(options, sink) {
  if (!sink) {
    sink = options
    options = {}
  }
  let settings = {
    internStrings: true,
    emit: 'neg'
  }
  Object.assign(settings, options)



  // temp
  let needsEscaping = x => false
  
  // might use a class the implements a faster indexOf, someday
  const map = []
  // rather than sending the index into the array, we send
  // (-2 - index), for reasons that are probably obsolete

  const me = function customDecycler (...items) {
    debug('\n\n\ndecycling', ...items)
    const result = destructure(items)
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
  me.atIndex = index => map[index]

  let codeFromMyIndex, codeFromPairIndex
  // map an index into (1, 2, ...)
  function goHi (index) {
    if (index === -1) return undefined
    return index + 1
  }
  // map an index into (-2, -3, ...)
  function goLo (index) {
    if (index === -1) return undefined
    return -2 - index
  }
  if (settings.emit === 'pos') {
    codeFromMyIndex = goHi
    codeFromPairIndex = goLo
  } else if (settings.emit === 'neg') {
    codeFromMyIndex = goLo
    codeFromPairIndex = goHi
  } else throw Error('unknown value for .emit option')
  // we could also use odd + even
  // or {ref:xxx}
  // or new Ref(...)

  
  /* Can we just send this item as-is, passing it through with no processing?
   */
  function simplySend (item) {
    if (typeof item === 'function') throw Error('Cant serialize functions')
    if (!settings.internStrings && typeof item === 'string') return true
    return (item === null ||
            item === undefined ||
            item === true ||
            item === false ||
            typeof item === 'number')
  }

  /* Can be treated as a single value in the map?  If not, we'll have
     to call destructure.

     Wont be called on simplySend items.
  */
  function atomic (item) {
    return (typeof item === 'symbol' ||
            typeof item === 'string')
            
  }

  function valueFor (item) {
    debug('value for', item)
    if (needsEscaping(item)) return escape(item)
    if (simplySend(item)) return item
    let code = codeFromMyIndex(map.indexOf(item))
    if (code === undefined && pairedWith) {
      code = codeFromPairIndex(pairedWith.indexOf(item))
      debug('item in pair map? code=', code)
    }
    if (code === undefined) {
      debug('no code found', item)
      if (atomic(item)) {
        code = codeFromMyIndex(map.push(item) - 1)
        debug('code', code, 'assigned to atom', item)
        sink('define', code, item)
      } else {
        code = codeFromMyIndex(map.push(item) - 1)
        const coded = destructure(item)
        debug('code', code, 'assigned to structure', item, 'which coded is', coded)
        const check = codeFromMyIndex(map.indexOf(item))
        if (check !== code) throw Error('internal structure damaged')
        sink('define', code, coded)
      }
    }
    return code
  }

  function destructure (item) {
    debug('destructuring', item)
    if (Array.isArray(item)) {
      const result = []
      for (const e of item) {
        result.push(valueFor(e))
      }
      debug('-> ', result)
      return result
    }
    if (typeof item === 'object') {
      const result = {}
      for (const key of Reflect.ownKeys(item)) {
        result[valueFor(key)] = valueFor(item[key])
      }
      debug('-> ', result)
      return result
    }
    throw Error('cant destructure ' + typeof item)
  }
  
  return me
}

exports.decycler = decycler
