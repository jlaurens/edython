/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview cpython's acceler.c counterparts.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

/**
 * @name {eYo.py.gmr.accelerators}
 * @namespace
 */
eYo.py.gmr.newNS('accelerators')

/* Parser accelerator module */

/* The parser as originally conceived had disappointing performance.
   This module does some precomputation that speeds up the selection
   of a DFA based upon a token, turning a search through an array
   into a simple indexing operation.  The parser now cannot work
   without the accelerators installed.  Note that the accelerators
   are installed dynamically when the parser is initialized, they
   are not part of the static data structure written on graminit.[ch]
   by the parser generator. *-/

#include "pgenheaders.h"
#include "grammar.h"
#include "node.h"
#include "token.h"
#include "parser.h"

/* Forward references *-/
static void fixdfa(/* grammar * *-/ , dfa *)
static void fixstate(/* grammar * *-/ , state *)
*/
;(function(){

  /* static void */
  var fixstate = (/* grammar * */ g, /* state * */ s) => {
    var nl = g.g_ll.ll_nlabels
    s.s_accept = 0
    var accel = new Int16Array(nl)
    for (var k = 0; k < nl; k++) {
      accel[k] = -1
    }
    var a = s.s_arc
    for (k = s.s_narcs; --k >= 0; a++) {
      var arc = s.s_arc[k]
      var lbl = arc.a_lbl
      var l = g.g_ll.ll_label[lbl]
      var type = l.lb_type
      if (arc.a_arrow >= (1 << 7)) {
        console.log("XXX too many states!")
        continue
      }
      if (eYo.py.tkn.ISNONTERMINAL(type)) {
        var d1 = eYo.py.gmr.findDFA(g, type)
        if (type - eYo.py.tkn.NT_OFFSET >= (1 << 7)) {
          console.log("XXX too high nonterminal number!")
          continue
        }
        for (var ibit = 0; ibit < g.g_ll.ll_nlabels; ibit++) {
          if (eYo.bitSet.testbit(d1.d_first, ibit)) {
            if (accel[ibit] != -1) {
              console.log("XXX ambiguity!")
            }
            accel[ibit] = arc.a_arrow | (1 << 7) |
                ((type - eYo.py.tkn.NT_OFFSET) << 8)
          }
        }
      }
      else if (lbl === 0 /* EMPTY */) {
        s.s_accept = 1
      }
      else if (lbl >= 0 && lbl < nl) {
        accel[lbl] = arc.a_arrow
      }
    }
    while (nl > 0 && accel[nl-1] === -1) {
      nl--
    }
    for (k = 0; k < nl && accel[k] === -1;) {
      k++
    }
    if (k < nl) {
      s.s_accel = accel.slice(k, nl)
      s.s_lower = k
      s.s_upper = nl
    }
  }

  /* static void */
  var fixdfa = (/* grammar * */ g, /* dfa * */ d) => {
    for (var j = 0; j < d.d_nstates; j++) {
      var s = d.d_state[j]
      if (eYo.DEBUG.Py) {
        s.s_index = j
        s.s_name = d.d_name
      }
      fixstate(g, s)
    }
  }

  /* void */
  eYo.py.gmr.accelerators.add = (/* grammar * */ g) => {
    for (var i = g.g_ndfas; --i >= 0; d++) {
      var d = g.g_dfa[i]
      fixdfa(g, d)
    }
    g.g_accel = 1
  }

  /* void */
  eYo.py.gmr.accelerators.remove = (/* grammar * */ g) => {
    g.g_accel = 0
    for (var i = g.g_ndfas; --i >= 0;) {
      var d = g.g_dfa[i]
      for (var j = 0; j < d.d_nstates; j++) {
        var s = d.d_state[j]
        s.s_accel = null
      }
    }
  }
  
})()