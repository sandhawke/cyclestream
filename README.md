Decycle/retrocycle for objects/arrays in an ongoing sequence

Convert objects which might refer to each other into a sequence of instructions for reconstructing them, with backward and forward references.  Similar to the [JSON cycle/retrocycle](https://www.npmjs.com/package/cycle) except:

* We don't actually do the serialization/deserialization.  You can use JSON.stringify + JSON.parse if you want, or cbor.pack + cbor.unpack, or whatever.

* We keep ongoing state, like you might want for a network connection, so you can send along an object, then later send along a reference to it.   In contrast, classic decycle and retrocycle operate on the entire structure at once.

* While we're at it, we can also make references to strings, so if you're sending your objects over a network, the strings end up interned.  This means that, as in JavaScript, you can use long strings as protocol elements (including object property-keys), knowing that after the first use, long strings are cheap.

## installation

```sh
npm install --save cyclestream
```

### taking out the cycles

(might be called deflate, toCommands, toStream, wrap)

```js
const cyclestream = require('cyclestream')

// let's make some circular objects:
a = []
b = {}
a.push(b)
b.a = a
console.log(a)
// => [ { a: [Circular] } ]
console.log(b)
// => { a: [ [Circular] ] }

// now make a decycler
dc = cyclestream.decycler(console.log)
de(a)
// Here we see the instructions for rebuilding the structure.
// => ['define', 1, [2]]
// => ['define', 2, {a:1}]
// => 1
de(b)
// => 2
```

If that seems inefficient, see refstyle='cbor'

## Adding the cycles back in

(might be called reconstructor, inflate, toMessages, messagesTo, toObjects, unwrap, unwrapper, unpacker)

```js
let out
rc = cyclestream.retrocycler(x => { out = x})
rc(...)
// out === undefined
rc(...)
// out === undefined
rc(...)
// out === an array in the cycle like a

```



## refstyle: more efficient reference identifiers

For some serializations, an alternative selection of identifiers can
be more efficient.   For example:

```js

dc.refstyle = 'cbor-neg'

// Here we see the instructions for rebuilding the structure.
// Instructions and references are negative integers, because
// they pack so nicely in cbor.
//
// define item-4 as array of item-5
// => -2, -4, [-5]
// define item-5 as object with key @@@ and value of item-4
// => -2, -5, {a:-4}
// actually pass along value, item-4
// => -4
de(b)
// => -5
