/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview cpython's bitset.c counterpart.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

/**
 * @name {eYo.py.bitset}
 * @namespace
 */
eYo.py.newNS('bitset')

/* Bitset primitives used by the parser generator *-/

#include "pgenheaders.h"
#include "bitset.h"

bitset */

/**
 * @name {eYo.py.bitset.BaseC9r}
 * @namespace
 */
eYo.py.bitset.makeBaseC9r({
  init (nbits) {
    this.ra = new Uint8Array(1 + Math.floor((nbits - 1) / 8))
  }
})

// eYo.py.gmr.delbitset = (ss) => {
//   throw 'DO NOT CALL THIS'
// }

// int
eYo.py.bitset.addbit = (ss, ibit) => {
  var q = Math.floor(ibit / 8)
  var i = ss.ra[q]
  var mask = 1 << (ibit % 8)
  if (i & mask) {
    return false
  }
  ss.ra[q] = i | mask
  return true
}

eYo.py.bitset.testbit = (ss, ibit) => {
  var i = ss.ra[Math.floor(ibit / 8)]
  var mask = 1 << (ibit % 8)
  return !!(i & mask)
}

eYo.py.bitset.samebitset = (ss1, ss2, nbits) => {
  for (var i = nbits / 8; --i >= 0; ) {
    if (ss1.ra[i] !== ss2.ra[i]) {
      return 0
    }
  }
  return 1;
}

eYo.py.bitset.mergebitset = (ss1, ss2, nbits) => {
  for (var i = nbits / 8; --i >= 0; ) {
    ss1.ra[i] = ss1.ra[i] | ss2.ra[i]
  }
}
