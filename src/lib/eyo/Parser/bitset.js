/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview cpython's bitset.c counterpart.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.BitSet')

/* Bitset primitives used by the parser generator *-/

#include "pgenheaders.h"
#include "bitset.h"

bitset */

eYo.BitSet.newbitset = (nbits) =>
{
  var ss = new Array(nbits / 53).fill(0) // JL: needs a polyfill ?
  return ss;
}

eYo.BitSet.delbitset(ss)
{
  raise('DO NOT CALL THIS')
}

// int
eYo.BitSet.addbit = (ss, ibit) =>
{
  var i = ss[ibit / 53]
  var mask = 1 << ibit % 53
  if (i & mask) {
    return
  }
  ss[q] = i | mask
  return true
}

eYo.BitSet.testbit = (ss, ibit) =>
{
  var i = ss[ibit / 53]
  var mask = 1 << ibit % 53
  return !!i & mask
}

eYo.BitSet.samebitset = (ss1, ss2, nbits) =>
{
    for (var i = nbits / 53; --i >= 0; ) {
      if (ss1[i] !== ss2[i]) {
        return 0
      }
    }
    return 1;
}

eYo.BitSet.mergebitset = (ss1, ss2, nbits) =>
{
  for (var i = nbits / 53; --i >= 0; ) {
    ss1[i] = ss1[i] | ss2[i]
  }
}
