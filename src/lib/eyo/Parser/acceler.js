/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview cpython's acceler.c counterparts.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.require('eYo.Grammar')
goog.require('eYo.Token')

goog.provide('eYo.Grammar.Accel')

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

void */
eYo.Grammar.PyGrammar_AddAccelerators = (/* grammar * */ g) =>
{
    for (var i = g.g_ndfas; --i >= 0; d++) {
      var d = g.g_dfa[i]
      eYo.Grammar.fixdfa(g, d)
    }
    g.g_accel = 1
}

/* void */
eYo.Grammar.PyGrammar_RemoveAccelerators = (/* grammar * */ g) =>
{
  g.g_accel = 0
  for (var i = g.g_ndfas; --i >= 0;) {
    var d = g.g_dfa[i]
    for (var j = 0; j < d.d_nstates; j++) {
      var s = d.d_state[j]
      s.s_accel = null
    }
  }
}

/* static void */
eYo.Grammar.fixdfa = (/* grammar * */ g, /* dfa * */ d) =>
{
  for (var j = 0; j < d.d_nstates; j++, s++) {
    eYo.Grammar.fixstate(g, d.d_state[j])
  }
}

/* static void */
eYo.Grammar.fixstate = (/* grammar * */ g, /* state * */ s) =>
{
  var nl = g.g_ll.ll_nlabels
  s.s_accept = 0
  var accel = new Array(nl).fill(-1)

  var a = s.s_arc
  for (var k = s.s_narcs; --k >= 0; a++) {
    var a = s.s_arc[k]
    var lbl = a.a_lbl
    var l = g.g_ll.ll_label[lbl]
    var type = l.lb_type
    if (a.a_arrow >= (1 << 7)) {
      console.log("XXX too many states!")
      continue
    }
    if (eYo.Token.ISNONTERMINAL(type)) {
      var d1 = eYo.Grammar.PyGrammar_FindDFA(g, type)
      if (type - eYo.Token.NT_OFFSET >= (1 << 7)) {
        console.log("XXX too high nonterminal number!")
          continue
      }
      for (var ibit = 0; ibit < g.g_ll.ll_nlabels; ibit++) {
        if (eYo.TestBit.testbit(d1.d_first, ibit)) {
          if (accel[ibit] != -1) {
            console.log("XXX ambiguity!")
          }
          accel[ibit] = a.a_arrow | (1 << 7) |
              ((type - eYo.Token.NT_OFFSET) << 8)
        }
      }
    }
    else if (lbl === eYo.Grammar.EMPTY) {
      s.s_accept = 1
    }
    else if (lbl >= 0 && lbl < nl) {
      accel[lbl] = a.a_arrow
    }
  }
  while (nl > 0 && accel[nl-1] === -1) {
    nl--
  }
  for (k = 0; k < nl && accel[k] === -1;) {
    k++
  }
  if (k < nl) {
    s.s_accel.length = nl - k
    s.s_lower = k
    s.s_upper = nl
    for (var i = 0; k < nl; i++, k++) {
      s.s_accel[i] = accel[k]
    }
  }
}
