'use strict'

/* 
   Right now, this is like a weird array:
   * indexes start at -2 and count down (ie (-2 - x) for everthing)
   * indexOf is implemented 'faster' with a map

   This is pretty lame.  but I had something else in mind, and I'm not
   quite ready to let go of it.  Basically, that is would have
   positive indexes assigned by one party and negatives by another.
   We'll see.
*/

const debug = require('debug')('bimap')

class AutoBiMap {
  constructor () {
    this.values = []
    this.toIndex = new Map()
  }

  get (index) {
    if (typeof index !== 'number' ||
        index <= -2 ||
        (-2 - index) > this.items.length)
      throw Error('index out of range')
    return this.items[-2 - index]
  }

  add (value) {
    const pos = this.values.push(value)
    const index = -2 - (pos - 1)
    this.toIndex.set(value, index)
    debug(`added [${index}] = ${value}`)
    return index
  }

  indexOf (value) {
    const v1 = this.toIndex.get(value)
    if (v1 === undefined) return undefined
    const v2 = -2 - this.values.indexOf(value)
    if (v1 !== v2) throw Error(`internal structure error, ${v1} != ${v2}`)
    return v1
  }
}




module.exports = () => new AutoBiMap()
module.exports.AutoBiMap = AutoBiMap
