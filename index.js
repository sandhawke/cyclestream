'use strict'

const debug = require('debug')('cyclestream')
const bimap = require('./bimap')

function decycler(options, sink) {
  if (!sink) {
    sink = options
    options = {}
  }
  let settings = {
    internStrings: true
  }
  Object.assign(settings, options)



  // temp
  let needsEscaping = x => false
  
  const map = bimap()

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
    let code = map.indexOf(item)
    if (code === undefined) {
      debug('no code found', item)
      if (atomic(item)) {
        code = map.add(item)
        debug('code', code, 'assigned to atom', item)
        sink('define', code, item)
      } else {
        code = map.add(item)
        const coded = destructure(item)
        debug('code', code, 'assigned to structure', item, 'which coded is', coded)
        const check = map.indexOf(item)
        debug('CONFIRM', check,'is the code')
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
  
  return function customDecycler (...items) {
    debug('\n\n\ndecycling', ...items)
    const result = destructure(items)
    debug('decycled is', result)
    sink(...result)
  }
}

exports.decycler = decycler
