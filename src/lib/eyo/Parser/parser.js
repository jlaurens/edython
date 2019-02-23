/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview cpython's parser.c counterpart.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Parser')
goog.provide('eYo.Stack')

goog.require('eYo.Scan')
goog.require('eYo.E')

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
extern int Py_DebugFlag;
#define D(x) if (!Py_DebugFlag); else x
#else
#define D(x)
#endif


/* STACK DATA TYPE *-/

static void s_reset(stack *);

static void */
eYo.Stack = function () {
  this.s_base = []
}
Object.defineProperties(eYo.Stack.prototype, {
  s_top: {
    get () {
      return this.s_base[this.s_base.length - 1]
    }
  }
})
eYo.Stack.s_reset = s =>
{
    s.s_base.length = 0
}

eYo.Stack.s_empty = s => s.s_base.length = 0

/* static int */
eYo.Stack.s_push = (/* stack * */ s, /* dfa * */ d, /* node * */ parent) =>
{
  var top = {}
  s.s_base.push(top)
  top.s_dfa = d;
  top.s_parent = parent;
  top.s_state = 0;
  return 0;
}

eYo.Stack.s_pop = (/* stack * */ s) =>
{
  if (eYo.Stack.s_empty(s)) {
    raise("s_pop: parser stack underflow -- FATAL")
  }
  s.s_base.pop()
}


/* PARSER CREATION *-/

parser_state * */
eYo.Parser.PyParser_New = (/* grammar * */ g, /* int */ start) =>
{
  raise('DO NOT CALL THIS')
//     var /* parser_state * */ ps = {}
//     if (!g.g_accel) {
//       eYo.Grammar.PyGrammar_AddAccelerators(g)
//     }
//     ps.p_grammar = g;
//     ps.p_stack = []
// // #ifdef PY_PARSER_REQUIRES_FUTURE_KEYWORD
// //     ps.p_flags = 0;
// // #endif
//     ps.p_tree = null
//     // eYo.Stack.s_reset(ps.p_stack)
//     eYo.Stack.s_push(&ps.p_stack, PyGrammar_FindDFA(g, start), ps.p_tree);
//     return ps;
}
eYo.Parser.PyParser_New_ = (scan, /* grammar * */ g, /* int */ start) =>
{
  var /* parser_state * */ ps = {}
  if (!g.g_accel) {
    eYo.Grammar.PyGrammar_AddAccelerators(g)
  }
  ps.p_grammar = g;
  ps.p_stack = new eYo.Stack()
// #ifdef PY_PARSER_REQUIRES_FUTURE_KEYWORD
//     ps.p_flags = 0;
// #endif
  ps.p_tree = scan.first
  // eYo.Stack.s_reset(ps.p_stack)
  eYo.Stack.s_push(ps.p_stack, eYo.Grammar.PyGrammar_FindDFA(g, start), ps.p_tree)
  return ps
}

/* void */
eYo.Parser.PyParser_Delete = (/* parser_state * */ ps) =>
{
  raise('NO CALL')
    /* NB If you want to save the parse tree,
       you must set p_tree to NULL before calling delparser! *-/
    PyNode_Free(ps.p_tree);
    PyMem_FREE(ps);
}


/* PARSER STACK OPERATIONS *-/

static int */
eYo.Stack.shift = (/* stack * */ s, /* int */ type, /* char * */ str, /* int */ newstate, /* int */ lineno, /* int */ col_offset,
  /* int */ end_lineno, /* int */ end_col_offset) =>
{
  raise ('NO CALL')
  // int err;
  // assert(!s_empty(s));
  // err = PyNode_AddChild(s.s_top.s_parent, type, str, lineno, col_offset,
  //                       end_lineno, end_col_offset);
  // if (err)
  //     return err;
  // s.s_top.s_state = newstate;
  // return 0;
}
eYo.Stack.shift_ = (/* stack * */ s, child, /* int */ newstate) =>
{
  var err
  assert(!eYo.Stack.s_empty(s))
  err = eYo.Node.PyNode_AddChild_(s.s_top.s_parent, child)
  if (err) {
    return err
  }
  s.s_top.s_state = newstate
  return 0;
}

/* static int */
eYo.Stack.push = (/* stack * */ s, /* int */ type, /* dfa * */ d, /* int */ newstate, /* int */ lineno, /* int */ col_offset,
     /* int */ end_lineno, /* int */ end_col_offset) =>
{
  raise('NO CALL')
  // int err;
  // node *n;
  // n = s.s_top.s_parent;
  // assert(!s_empty(s));
  // err = PyNode_AddChild(n, type, (char *)NULL, lineno, col_offset,
  //                       end_lineno, end_col_offset);
  // if (err)
  //     return err;
  // s.s_top.s_state = newstate;
  // return s_push(s, d, CHILD(n, n.n_nchildren - 1));
}
eYo.Stack.push_ = (/* stack * */ s, /* int */ child, /* dfa * */ d, /* int */ newstate) =>
{
  assert(!eYo.Stack.s_empty(s));
  var err
  var n = s.s_top.s_parent
  if ((err = eYo.Node.PyNode_AddChild_(n, child))) {
    return err
  }
  s.s_top.s_state = newstate
  return eYo.Stack.s_push(s, d, child)
}

eYo.Stack.push__ = (/* stack * */ s, tkn_src, type, /* dfa * */ d, /* int */ newstate) =>
{
  assert(!eYo.Stack.s_empty(s));
  var child = new eYo.Node(scan, type)
  child.lineno = tkn_src.lineno
  child.col_offset = tkn_src.col_offset
  child.end_lineno = tkn_src.end_lineno
  child.end_col_offset = tkn_src.end_col_offset
  
  var err
  var n = s.s_top.s_parent
  if ((err = eYo.Node.PyNode_AddChild_(n, child))) {
    return err
  }
  s.s_top.s_state = newstate
  return eYo.Stack.s_push(s, d, child)
}

/* PARSER PROPER *-/

static int */
eYo.Parser.classify = (/* parser_state * */ ps, /* int */ type, /* const char * */ str) =>
{
  var g = ps.p_grammar
  var n = g.g_ll.ll_nlabels
  if (type === eYo.Token.NAME) {
    for (var i = n; i > 0; i--) {
      var l = g.g_ll.ll_label[i]
      if (l.lb_type !== eYo.Token.NAME || l.lb_str == NULL ||
        l.lb_str[0] != str[0] || l.lb_str !== str) {
        continue
      }
      if (eYo.Const.PyDebug) {
        console.log("It's a keyword\n")
      }
      return n - i
    }
  }
  for (var i = n; i > 0; i--) {
    l = g.g_ll.ll_label[i]
    if (l.lb_type === type && l.lb_str === null) {
        D(printf("It's a token we know\n"));
        return n - i;
    }
  }
  console.error("Illegal token")
  return -1;
}

/* int */
eYo.Parser.PyParser_AddToken = (/* parser_state * */ps, /* int */ type, /* char * */ str,
                  /* int */ lineno, /* int */ col_offset,
                  /* int */ end_lineno, /* int */ end_col_offset,
                  /* int * */ expected_ret) =>
{
  raise('NO CALL')
//     int ilabel;
//     int err;

//     D(printf("Token %s/'%s' ... ", _PyParser_TokenNames[type], str));

//     /* Find out which label this token is *-/
//     ilabel = classify(ps, type, str);
//     if (ilabel < 0)
//         return E_SYNTAX;

//     /* Loop until the token is shifted or an error occurred *-/
//     for (;;) {
//         /* Fetch the current dfa and state *-/
//         dfa *d = ps.p_stack.s_top.s_dfa;
//         state *s = &d.d_state[ps.p_stack.s_top.s_state];

//         D(printf(" DFA '%s', state %d:",
//             d.d_name, ps.p_stack.s_top.s_state));

//         /* Check accelerator *-/
//         if (s.s_lower <= ilabel && ilabel < s.s_upper) {
//             int x = s.s_accel[ilabel - s.s_lower];
//             if (x != -1) {
//                 if (x & (1<<7)) {
//                     /* Push non-terminal *-/
//                     int nt = (x >> 8) + NT_OFFSET;
//                     int arrow = x & ((1<<7)-1);
//                     dfa *d1;
//                     if (nt == func_body_suite && !(ps.p_flags & PyCF_TYPE_COMMENTS)) {
//                         /* When parsing type comments is not requested,
//                            we can provide better errors about bad indentation
//                            by using 'suite' for the body of a funcdef *-/
//                         D(printf(" [switch func_body_suite to suite]"));
//                         nt = suite;
//                     }
//                     d1 = PyGrammar_FindDFA(
//                         ps.p_grammar, nt);
//                     if ((err = push(&ps.p_stack, nt, d1,
//                         arrow, lineno, col_offset,
//                         end_lineno, end_col_offset)) > 0) {
//                         D(printf(" MemError: push\n"));
//                         return err;
//                     }
//                     D(printf(" Push '%s'\n", d1.d_name));
//                     continue;
//                 }

//                 /* Shift the token *-/
//                 if ((err = shift(&ps.p_stack, type, str,
//                                 x, lineno, col_offset,
//                                 end_lineno, end_col_offset)) > 0) {
//                     D(printf(" MemError: shift.\n"));
//                     return err;
//                 }
//                 D(printf(" Shift.\n"));
//                 /* Pop while we are in an accept-only state *-/
//                 while (s = &d.d_state
//                                 [ps.p_stack.s_top.s_state],
//                     s.s_accept && s.s_narcs == 1) {
//                     D(printf("  DFA '%s', state %d: "
//                              "Direct pop.\n",
//                              d.d_name,
//                              ps.p_stack.s_top.s_state));
// #ifdef PY_PARSER_REQUIRES_FUTURE_KEYWORD
// #if 0
//                     if (d.d_name[0] == 'i' &&
//                         strcmp(d.d_name,
//                            "import_stmt") == 0)
//                         future_hack(ps);
// #endif
// #endif
//                     s_pop(&ps.p_stack);
//                     if (s_empty(&ps.p_stack)) {
//                         D(printf("  ACCEPT.\n"));
//                         return E_DONE;
//                     }
//                     d = ps.p_stack.s_top.s_dfa;
//                 }
//                 return E_OK;
//             }
//         }

//         if (s.s_accept) {
// #ifdef PY_PARSER_REQUIRES_FUTURE_KEYWORD
// #if 0
//             if (d.d_name[0] == 'i' &&
//                 strcmp(d.d_name, "import_stmt") == 0)
//                 future_hack(ps);
// #endif
// #endif
//             /* Pop this dfa and try again *-/
//             s_pop(&ps.p_stack);
//             D(printf(" Pop ...\n"));
//             if (s_empty(&ps.p_stack)) {
//                 D(printf(" Error: bottom of stack.\n"));
//                 return E_SYNTAX;
//             }
//             continue;
//         }

//         /* Stuck, report syntax error *-/
//         D(printf(" Error.\n"));
//         if (expected_ret) {
//             if (s.s_lower == s.s_upper - 1) {
//                 /* Only one possible expected token *-/
//                 *expected_ret = ps.p_grammar.
//                     g_ll.ll_label[s.s_lower].lb_type;
//             }
//             else
//                 *expected_ret = -1;
//         }
//         return E_SYNTAX;
//     }
}

eYo.Parser.PyParser_AddToken_ = (/* parser_state * */ps, /* int */ tkn,
  /* int * */ expected_ret) =>
{
  var ilabel
  var err
  if (eYo.Const.Py_DEBUG) {
    console.log("Token %s/'%s' ... ", eYo.Token._NAMES[type], tkn.n_str)
  }

  /* Find out which label this token is */
  ilabel = eYo.Parser.classify(ps, type, str)
  if (ilabel < 0) {
    return eYo.E.SYNTAX
  }

  /* Loop until the token is shifted or an error occurred */
  for (;;) {
    /* Fetch the current dfa and state */
    var /* dfa * */ d = ps.p_stack.s_top.s_dfa;
    var /* state * */ s = d.d_state[ps.p_stack.s_top.s_state]
    if (eYo.Const.Py_DEBUG) {
      console.log(" DFA '%s', state %d:",
      d.d_name, ps.p_stack.s_top.s_state)
    }

    /* Check accelerator */
    if (s.s_lower <= ilabel && ilabel < s.s_upper) {
      var x = s.s_accel[ilabel - s.s_lower]
      if (x != -1) {
        if (x & (1<<7)) {
          /* Push non-terminal */
          var nt = (x >> 8) + eYo.Token.NT_OFFSET
          var arrow = x & ((1<<7)-1)
          var d1;
          // if (nt === eYo.Grammar.func_body_suite && !(ps.p_flags & PyCF_TYPE_COMMENTS)) {
          //     /* When parsing type comments is not requested,
          //        we can provide better errors about bad indentation
          //        by using 'suite' for the body of a funcdef *-/
          //     D(printf(" [switch func_body_suite to suite]"));
          //     nt = suite;
          // }
          d1 = eYo.Grammar.PyGrammar_FindDFA(ps.p_grammar, nt)
          if ((err = eYo.Stack.push__(ps.p_stack, nt, d1,
            arrow)) > 0) {
            if (eYo.Const.Py_DEBUG) {
              console.log("MemError: push_")
            }
            return err
          }
          if (eYo.Const.Py_DEBUG) {
            console.log(" Push '%s'", d1.d_name)
          }
          continue;
        }
        /* Shift the token */
        if ((err = eYo.Stack.shift_(ps.p_stack, tkn, x)) > 0) {
          if (eYo.Const.Py_DEBUG) {
            console.log(" MemError: shift_")
          }
          return err;
        }
        if (eYo.Const.Py_DEBUG) {
          console.log(" Shift.")
        }
        /* Pop while we are in an accept-only state */
        while ((s = d.d_state[ps.p_stack.s_top.s_state]),
            s.s_accept && s.s_narcs === 1) {
          if (eYo.Const.Py_DEBUG) {
            console.log("  DFA '%s', state %d: \nDirect pop.",
            d.d_name,
            ps.p_stack.s_top.s_state)
          }
          eYo.Stack.s_pop(ps.p_stack)
          if (eYo.Stack.s_empty(ps.p_stack)) {
            if (eYo.Const.Py_DEBUG) {
              console.log(" Accept.")
            }
            return eYo.E.DONE;
          }
          d = ps.p_stack.s_top.s_dfa
        }
        return eYo.E.OK
      }
    }
    if (s.s_accept) {
      /* Pop this dfa and try again */
      eYo.Stack.s_pop(ps.p_stack)
      if (eYo.Const.Py_DEBUG) {
        console.log(" Pop ...")
      }
      if (eYo.Stack.s_empty(ps.p_stack)) {
        if (eYo.Const.Py_DEBUG) {
          console.log(" Error: bottom of stack.")
        }
        return eYo.E.SYNTAX
      }
      continue;
    }
    /* Stuck, report syntax error */
    if (eYo.Const.Py_DEBUG) {
      console.log(" Error.")
    }
    if (expected_ret) {
      if (s.s_lower === s.s_upper - 1) {
        /* Only one possible expected token */
        expected_ret.ans = ps.p_grammar.
            g_ll.ll_label[s.s_lower].lb_type
      } else {
        expected_ret.ans = -1
      }
    }
    return eYo.E.SYNTAX;
  }
}


/* DEBUG OUTPUT */

/* void */
eYo.Grammar.dumptree = (/* grammar * */ g, /* node * */ n) =>
{
    if (!n) {
      printf("NIL");
    } else {
        label l
        l.lb_type = n.n_type;
        l.lb_str = n.n_str;
        printf("%s", PyGrammar_LabelRepr(&l));
        if (ISNONTERMINAL(n.n_type)) {
            printf("(");
            for (i = 0; i < n.n_nchildren; i++) {
                if (i > 0)
                    printf(",");
                dumptree(g, n.n_child[i)];
            }
            printf(")");
        }
    }
}

void
eYo.Parser.showtree = (grammar *g, node *n) =>
{
    int i;

    if (n == NULL)
        return;
    if (ISNONTERMINAL(n.n_type)) {
        for (i = 0; i < n.n_nchildren; i++)
            showtree(g, n.n_child[i)];
    }
    else if (ISTERMINAL(n.n_type)) {
        printf("%s", _PyParser_TokenNames[n.n_type]);
        if (n.n_type == NUMBER || n.n_type == NAME)
            printf("(%s)", n.n_str);
        printf(" ");
    }
    else
        printf("? ");
}

void
eYo.Parser.printtree = (parser_state *ps) =>
{
    if (Py_DebugFlag) {
        printf("Parse tree:\n");
        dumptree(ps.p_grammar, ps.p_tree);
        printf("\n");
        printf("Tokens:\n");
        showtree(ps.p_grammar, ps.p_tree);
        printf("\n");
    }
    printf("Listing:\n");
    PyNode_ListTree(ps.p_tree);
    printf("\n");
}

#endif /* Py_DEBUG *-/

/*

Description
-----------

The parser's interface is different than usual: the function addtoken()
must be called for each token in the input.  This makes it possible to
turn it into an incremental parsing system later.  The parsing system
constructs a parse tree as it goes.

A parsing rule is represented as a Deterministic Finite-state Automaton
eYo.Parser. = (DFA) =>.  A node in a DFA represents a state of the parser; an arc represents
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
eYo.Parser. = (really: arc going out of a DFA's state) => must begin with a terminal
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

eYo.Parser. = (expr: (term: (NAME: a)), (OP: +), (term: (NAME: b))) =>

*/
