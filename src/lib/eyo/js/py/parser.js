/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview cpython's parser.c counterpart.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

/**
 * @name {eYo.py.parser}
 * @namespace
 */
eYo.py.newNS('parser')

/* Parser implementation */

/* For a description, see the comments at end of this file */

/* XXX To do: error recovery *-/

#include "Python.h"
#include "pgenheaders.h"
#include "token.h"
#include "grammar.h"
#include "node.h"
#include "parser.h"
#include "errcode.h"
#include "graminit.h"

#ifdef Py_DEBUG
extern int Py_DEBUG
#define D(x) if (!Py_DEBUG); else x
#else
#define D(x)
#endif
*/

eYo.o4t.newC9r(eYo.py, 'Stack', {
  init () {
    this.s_base = []
  },
  properties: {
    s_top: {
      get () {
        return this.s_base[this.s_base.length - 1]
      }
    },
  },
})
;(() => {

  /* STACK DATA TYPE *-/

  static void s_reset(stack *)

  static void */
  // var s_reset = s =>
  // {
  //     s.s_base.length = 0
  // }

  var s_empty = s => 0 === s.s_base.length

  /* static int */
  var s_push = (/* stack * */ s, /* dfa * */ d, /* node * */ parent) => {
    var top = {}
    s.s_base.push(top)
    top.s_dfa = d
    top.s_parent = parent
    top.s_state = 0
    return 0
  }

  var s_pop = (/* stack * */ s) => {
    if (s_empty(s)) {
      throw "s_pop: parser stack underflow -- FATAL"
    }
    s.s_base.pop()
  }

  /* PARSER CREATION */

  /* parser_state * */
  eYo.py.parser.new = function (scan, /* grammar * */ g, /* int */ start) {
    var /* parser_state * */ ps = {}
    if (!g.g_accel) {
      eYo.py.gmr.accelerators.add(g)
    }
    ps.p_grammar = g
    var s = ps.p_stack = new eYo.py.Stack()
    // #ifdef PY_PARSER_REQUIRES_FUTURE_KEYWORD
    //     ps.p_flags = 0
    // #endif
    ps.p_tree = s.last_tkn = new eYo.py.tkn.Node(scan, start)
    // s_reset(ps.p_stack)
    s_push(s, eYo.py.gmr.findDFA(g, start), ps.p_tree)
    return ps
  }

  /* void */
  eYo.py.parser.delete = (/* parser_state * */ ps) => { // eslint-disable-line
    throw 'NO CALL'
  }

  /* PARSER STACK OPERATIONS */

  /* static int */
  var shift = (/* stack * */ s, child, /* int */ newstate) => {
    // eYo.assert(!s_empty(s))
    var err = eYo.py.node.addChild_(s.s_top.s_parent, child)
    if (err) {
      return err
    }
    s.s_top.s_state = newstate
    return 0
  }

  /* static int */
  var push = (/* stack * */ s, tkn, type, /* dfa * */ d, /* int */ newstate) => {
    // eYo.assert(!s_empty(s))
    var child = s.last_tkn = new eYo.py.tkn.Node(tkn.scan, type)
    child.lineno = tkn.lineno
    child.end_lineno = tkn.end_lineno
    var err
    var n = s.s_top.s_parent
    if ((err = eYo.py.node.addChild_(n, child))) {
      return err
    }
    s.s_top.s_state = newstate
    s_push(s, d, child)
    return 0
  }

  /* PARSER PROPER */

  /* static int */
  var classify = (/* parser_state * */ ps, /* int */ type, /* const char * */ str) => {
    var ll_label = ps.p_grammar.g_ll.ll_label
    var n = ll_label.length
    if (type === eYo.py.tkn.NAME) {
      for (var i = 0; i < n; i++) {
        var l = ll_label[i]
        if (l.lb_type !== eYo.py.tkn.NAME || l.lb_str == null ||
          l.lb_str[0] != str[0] || l.lb_str !== str) {
          continue
        }
        if (eYo.DEBUG.Py) {
          console.log("It's a keyword\n")
        }
        return i
      }
    }
    for (i = 0; i < n; i++) {
      l = ll_label[i]
      if (l.lb_type === type) {
        if (l.lb_str === null) {
          if (eYo.DEBUG.Py) {
            console.log("It's a token we know\n")
          }
          return i
        }
      }
    }
    console.error("Illegal token", ps, type, str)
    return -1
  }

  eYo.py.parser.addToken = (/* parser_state * */ps, tkn) => {
    if (eYo.DEBUG.Py) {
      console.log("Token %s/'%s' ... ", eYo.py.tkn._NAMES[tkn.n_type], tkn.n_str)
    }
    var ans = {}

    /* Find out which label this token is */
    var ilabel = classify(ps, tkn.n_type, tkn.n_str)
    if (ilabel < 0) {
      ans.error = eYo.e.SYNTAX
      return ans
    }

    /* Loop until the token is shifted or an error occurred */
    for (;;) {
      /* Fetch the current dfa and state */
      var /* dfa * */ d = ps.p_stack.s_top.s_dfa
      var /* state * */ s = d.d_state[ps.p_stack.s_top.s_state]
      if (eYo.DEBUG.Py) {
        console.log(` DFA '${d.d_name}', state ${ps.p_stack.s_top.s_state}, label ${ilabel}, tkn ${eYo.py.tkn._NAMES[tkn.n_type]}`)
      }

      /* Check accelerator */
      if (s.s_lower <= ilabel && ilabel < s.s_upper) {
        var x = s.s_accel[ilabel - s.s_lower]
        if (x != -1) {
          if (x & (1<<7)) {
            /* Push non-terminal */
            var nt = (x >> 8) + eYo.py.tkn.NT_OFFSET
            // if (nt === eYo.py.gmr.func_body_suite && !(ps.p_flags & PyCF_TYPE_COMMENTS)) {
            //     /* When parsing type comments is not requested,
            //        we can provide better errors about bad indentation
            //        by using 'suite' for the body of a funcdef *-/
            //     D(console.log(" [switch func_body_suite to suite]"))
            //     nt = suite
            // }
            var d1 = eYo.py.gmr.findDFA(ps.p_grammar, nt)
            var arrow = x & ((1<<7)-1)
            if (eYo.DEBUG.Py) {
              console.log(` Push '${d1.d_name}', -> ${arrow}`)
            }
            push(ps.p_stack, tkn, nt, d1, arrow)
            continue
          }
          /* Shift the token */
          shift(ps.p_stack, tkn, x)
          if (eYo.DEBUG.Py) {
            console.log(" Shift.")
          }
          /* Pop while we are in an accept-only state */
          while ((s = d.d_state[ps.p_stack.s_top.s_state]),
          s.s_accept && s.s_narcs === 1) {
            if (eYo.DEBUG.Py) {
              console.log("  DFA '%s', state %d: \nDirect pop.",
                d.d_name,
                ps.p_stack.s_top.s_state)
            }
            s_pop(ps.p_stack)
            if (s_empty(ps.p_stack)) {
              if (eYo.DEBUG.Py) {
                console.log(" Accept.")
              }
              ans.error = eYo.e.DONE
              return ans
            }
            d = ps.p_stack.s_top.s_dfa
          }
          ans.error = eYo.e.OK
          return ans
        }
      }
      if (s.s_accept) {
        /* Pop this dfa and try again */
        s_pop(ps.p_stack)
        if (eYo.DEBUG.Py) {
          console.log(" Pop ...")
        }
        if (s_empty(ps.p_stack)) {
          if (eYo.DEBUG.Py) {
            console.log(" Error: bottom of stack.")
          }
          ans.error = eYo.e.SYNTAX
          return ans
        }
        continue
      }
      /* Stuck, report syntax error */
      if (eYo.DEBUG.Py) {
        console.log(` Error ${s.s_name}/${s.s_index}.`)
      }
      if (s.s_lower === s.s_upper - 1) {
        /* Only one possible expected token */
        ans.expected = ps.p_grammar.
          g_ll.ll_label[s.s_lower].lb_type
      } else {
        ans.expected = -1
      }
      ans.error = eYo.e.SYNTAX
      return ans
    }
  }

  /* DEBUG OUTPUT */

  /* void */
  eYo.py.parser.printtree = (/* parser_state * */ ps) => {
    if (eYo.DEBUG.Py) {
      console.log("Parse tree:\n")
      eYo.py.gmr.dumptree(ps.p_grammar, ps.p_tree)
      console.log("\n")
      console.log("Tokens:\n")
      eYo.py.gmr.showtree(ps.p_grammar, ps.p_tree)
      console.log("\n")
    }
    console.log("Listing:\n")
    eYo.py.node.listTree(ps.p_tree)
    console.log("\n")
  }

  //#endif /* Py_DEBUG */

  /*

  Description
  -----------

  The parser's interface is different than usual: the function addtoken()
  must be called for each token in the input.  This makes it possible to
  turn it into an incremental parsing system later.  The parsing system
  constructs a parse tree as it goes.

  A parsing rule is represented as a Deterministic Finite-state Automaton
  (DFA).  A node in a DFA represents a state of the parser; an arc represents
  a transition.  Transitions are either labeled with terminal symbols or
  with non-terminals.  When the parser decides to follow an arc labeled
  with a non-terminal, it is invoked recursively with the DFA representing
  the parsing rule for that as its initial state; when that DFA accepts,
  the parser that invoked it continues.  The parse tree constructed by the
  recursively called parser is inserted as a child in the current parse tree.

  The DFA's can be constructed automatically from a more conventional
  language description.  An extended LL(1) grammar (ELL(1)) is suitable.
  Certain restrictions make the parser's life easier: rules that can produce
  the empty string should be outlawed (there are other ways to put loops
  or optional parts in the language).  To avoid the need to construct
  FIRST sets, we can require that all but the last alternative of a rule
  eYo.py.parser. = (really: arc going out of a DFA's state) => must begin with a terminal
  symbol.

  As an example, consider this grammar:

  expr:   term (OP term)*
  term:   CONSTANT | '(' expr ')'

  The DFA corresponding to the rule for expr is:

  ------..---term-..------.
      ^          |
      |          |
      \----OP----/

  The parse tree generated for the input a+b is:

  eYo.py.parser. = (expr: (term: (NAME: a)), (OP: +), (term: (NAME: b))) =>

  */

})()