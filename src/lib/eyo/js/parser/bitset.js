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

goog.require('eYo')

goog.provide('eYo.BitSet')

/* Bitset primitives used by the parser generator *-/

#include "pgenheaders.h"
#include "bitset.h"

bitset */

eYo.BitSet = function(nbits) {
  this.ra = new Uint8Array(1 + Math.floor((nbits - 1) / 8))
}

eYo.BitSet.newbitset = (nbits) =>
{
  var ss = new eYo.BitSet(nbits)
  return ss;
}

eYo.BitSet.delbitset = (ss) =>
{
  throw 'DO NOT CALL THIS'
}

// int
eYo.BitSet.addbit = (ss, ibit) =>
{
  var i = ss.ra[Math.floor(ibit / 8)]
  var mask = 1 << (ibit % 8)
  if (i & mask) {
    return
  }
  ss.ra[q] = i | mask
  return true
}

eYo.BitSet.testbit = (ss, ibit) =>
{
  var i = ss.ra[Math.floor(ibit / 8)]
  var mask = 1 << (ibit % 8)
  return !!(i & mask)
}

eYo.BitSet.samebitset = (ss1, ss2, nbits) =>
{
    for (var i = nbits / 8; --i >= 0; ) {
      if (ss1.ra[i] !== ss2.ra[i]) {
        return 0
      }
    }
    return 1;
}

eYo.BitSet.mergebitset = (ss1, ss2, nbits) =>
{
  for (var i = nbits / 8; --i >= 0; ) {
    ss1.ra[i] = ss1.ra[i] | ss2.ra[i]
  }
}