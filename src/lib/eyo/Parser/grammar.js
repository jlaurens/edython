/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview cpython's grammar.c, graminit.h and grammar1.c counterparts.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.require('eYo.E')
goog.require('eYo.Token')

goog.provide('eYo.Grammar')

/* Grammar implementation *-/

#include "Python.h"
#include "pgenheaders.h"

#include <ctype.h>

#include "token.h"
#include "grammar.h"
*/

/* Grammar interface */

// #include "bitset.h" /* Sigh... */

/* A label of an arc *-/

typedef struct {
    int          lb_type
    char        *lb_str
} label

eYo.Grammar.EMPTY = 0         /* Label number 0 is by definition the empty label *-/

/* A list of labels *-/

typedef struct {
    int          length
    label       *ll_label
} labellist

/* An arc from one state to another *-/

typedef struct {
    short       a_lbl;          /* Label of this arc *-/
    short       a_arrow;        /* State where this arc goes to *-/
} arc

/* A state in a DFA *-/

typedef struct {
    int          s_narcs
    arc         *s_arc;         /* Array of arcs *-/

    /* Optional accelerators *-/
    int          s_lower;       /* Lowest label index *-/
    int          s_upper;       /* Highest label index *-/
    int         *s_accel;       /* Accelerator *-/
    int          s_accept;      /* Nonzero for accepting state *-/
} state

/* A DFA *-/

typedef struct {
    int          d_type;        /* Non-terminal this represents *-/
    char        *d_name;        /* For printing *-/
    int          d_initial;     /* Initial state *-/
    int          d_nstates
    state       *d_state;       /* Array of states *-/
    bitset       d_first
} dfa

/* A grammar *-/

typedef struct {
    int          g_ndfas
    dfa         *g_dfa;         /* Array of DFAs *-/
    labellist    g_ll
    int          g_start;       /* Start symbol of the grammar *-/
    int          g_accel;       /* Set if accelerators present *-/
} grammar

/* FUNCTIONS *-/

grammar *newgrammar(int start)
void freegrammar(grammar *g)
dfa *adddfa(grammar *g, int type, const char *name)
int addstate(dfa *d)
void addarc(dfa *d, int from, int to, int lbl)
dfa *PyGrammar_FindDFA(grammar *g, int type)

int addlabel(labellist *ll, int type, const char *str)
int findlabel(labellist *ll, int type, const char *str)
const char *PyGrammar_LabelRepr(label *lb)
void translatelabels(grammar *g)

void addfirstsets(grammar *g)

void PyGrammar_AddAccelerators(grammar *g)
void PyGrammar_RemoveAccelerators(grammar *)

void printgrammar(grammar *g, FILE *fp)
void printnonterminals(grammar *g, FILE *fp)

/*

extern int Py_DebugFlag

grammar * */

eYo.Grammar = function () {
  this.g_ndfas = 0
  this.g_dfa = []
  this.g_start = start
  this.g_ll.length = 0
  this.g_ll.ll_label = []
  this.g_accel = 0
}

eYo.Grammar.newgrammar = (/* int */ start) =>
{
  return new eYo.Grammar()
}

/* dfa * */
eYo.Grammar.adddfa = (/* grammar * */ g, /* int */ type, /* const char * */ name) =>
{
    var /* dfa * */ d = {}
    g.g_dfa.push(d)
    g.g_ndfas++
    d.d_type = type
    d.d_name = strdup(name)
    d.d_nstates = 0
    d.d_state = []
    d.d_initial = -1
    d.d_first = null
    return d; /* Only use while fresh! */
}

/* int */
eYo.Grammar.addstate = (/* dfa * */ d) =>
{
  var /* state * */ s = {}
  d.d_state.push(state)
  ++d.d_nstates
  s.s_narcs = 0
  s.s_arc = []
  s.s_lower = 0
  s.s_upper = 0
  s.s_accel = null
  s.s_accept = 0
  return d.d_state.length - 1
}

/* void */
eYo.Grammar.addarc = (/* dfa * */ d, /* int */ from, /* int */ to, /* int */ lbl) =>
{
    var /* state * */ s
    var /* arc * */ a = {}
    // assert(0 <= from && from < d.d_nstates)
    // assert(0 <= to && to < d.d_nstates)
    s = d.d_state[from]
    s.s_arc.push(a)
    s.s_narcs++
    a.a_lbl = lbl
    a.a_arrow = to
}

/* int */
eYo.Grammar.addlabel = (/* labellist * */ ll, /* int */ type, /* const char * */ str) =>
{
  var /* int */ i
  for (i = 0; i < ll.length; i++) {
    if (ll[i].lb_type === type && ll[i].lb_str === str) {
      return i
    }
  }
  var /* label * */ lb = {}
  ll.push(lb)
  lb.lb_type = type
  lb.lb_str = str
  return ll.length - 1
}

/* Same, but rather dies than adds *-/

int */
eYo.Grammar.findlabel = (/* labellist * */ ll, /* int */ type, /* const char * */ str) =>
{
  var i

  for (i = 0; i < ll.length; i++) {
    if (ll[i].lb_type === type /*&&
      ll[i].lb_str === str*/) // JL: WHY IS IT COMMENTED OUT ?
      return i
  }
  console.error("Label %d/'%s' not found\n", type, str)
  raise("grammar.c:findlabel()")

  /* Py_FatalError() is declared with __attribute__((__noreturn__)).
      GCC emits a warning without "return 0;" (compiler bug!), but Clang is
      smarter and emits a warning on the return... */
}

/* Forward *-/
static void translabel(grammar *, label *)

void */
eYo.Grammar.translatelabels = (/* grammar * */ g) =>
{
  /* Don't translate EMPTY */
  for (var i = eYo.Grammar.EMPTY+1; i < g.g_ll.length; i++) {
    eYo.Grammar.translabel(g, g.g_ll[i])
  }
}

eYo.Do.isalpha = c => XRegExp.exec(c, eYo.Scan.XRE.letter, 0, true)
eYo.Do.Py_CHARMASK = c => c & 0xff

/* static void */
eYo.Grammar.translabel = (/* grammar * */ g, /* label * */ lb) =>
{
  var i
  if (lb.lb_type === eYo.Token.NAME) {
    for (i = 0; i < g.g_ndfas; i++) {
      if (lb.lb_str === g.g_dfa[i].d_name) {
        lb.lb_type = g.g_dfa[i].d_type
        lb.lb_str = null
        return
      }
    }
    for (i = 0; i < eYo.Token.N_TOKENS; i++) {
      if (lb.lb_str === eYo.Token._NAMES[i]) {
          lb.lb_type = i
          lb.lb_str = null
          return
      }
    }
    console.log("Can't translate NAME label '%s'\n", lb.lb_str)
    return
  }
  if (lb.lb_type === eYo.Token.STRING) {
    if (eYo.Do.isalpha(eYo.Do.Py_CHARMASK(lb.lb_str[1])) ||
      lb.lb_str[1] === '_') {
      var /* size_t */ name_len
      if (eYo.Const.Py_DebugFlag) {
        console.log("Label %s is a keyword\n", lb.lb_str)
      }
      lb.lb_type = eYo.Token.NAME
      name_len = str.indexOf("'", 1)
      if (name_len < 0) {
        lb.lb_str = str
      } else {
        lb.lb_str = str.substring(0, name_len)
      }
    }
    else if (lb.lb_str[2] === lb.lb_str[0]) {
      var type = eYo.Token.PyToken_OneChar(lb.lb_str[1])
      if (type !== eYo.Token.OP) {
        lb.lb_type = type
        lb.lb_str = null
      }
      else {
        console.log("Unknown OP label %s\n", lb.lb_str)
      }
    }
    else if (lb.lb_str[2] && lb.lb_str[3] === lb.lb_str[0]) {
        var type = eYo.Token.PyToken_TwoChars(lb.lb_str[1],
                                    lb.lb_str[2])
        if (type !== eYo.Token.OP) {
            lb.lb_type = type
            lb.lb_str = null
        }
        else {
          console.log("Unknown OP label %s\n", lb.lb_str)
        }
    }
    else if (lb.lb_str[2] && lb.lb_str[3] && lb.lb_str[4] === lb.lb_str[0]) {
        var type = eYo.Token.PyToken_ThreeChars(lb.lb_str[1],
                                            lb.lb_str[2],
                                            lb.lb_str[3])
        if (type !== eYo.Token.OP) {
            lb.lb_type = type
            lb.lb_str = null
        }
        else {
          console.log("Unknown OP label %s\n", lb.lb_str)
        }
    }
    else {
      console.log("Can't translate STRING label %s\n",
      lb.lb_str)
    }
  }
  else {
    console.log("Can't translate label '%s'\n",
            eYo.Grammar.PyGrammar_LabelRepr(lb))
  }
}

/* Including grammar1.c /*

/* Grammar subroutines needed by parser */

/* Return the DFA for the given type */

/* dfa * */
eYo.Grammar.PyGrammar_FindDFA = (/* grammar * */ g, /* int */ type) =>
{
  var /* dfa * */ d = g.g_dfa[type - eYo.Token.NT_OFFSET]
  goog.asserts.assert(d.d_type === type, `${d.d_type} === ${type}`)
  return d
}

/* const char * */
eYo.Grammar.PyGrammar_LabelRepr = (/* label * */ lb) =>
{
  if (lb.lb_type === eYo.Token.ENDMARKER) {
    return "EMPTY"
  } else if (eYo.Token.ISNONTERMINAL(lb.lb_type)) {
    if (lb.lb_str === null) {
      return `NT${lb.lb_type}`
    } else {
      return lb.lb_str
    }
  }
  else if (lb.lb_type < N_TOKENS) {
    if (lb.lb_str === null)
      return eYo.Token._NAMES[lb.lb_type]
    else {
      return `${lb.lb_type}(${lb.lb_str})`
    }
  }
  else {
    console.error("invalid label in PyGrammar_LabelRepr")
    return null
  }
}

/* Generated by Parser/pgen */

Object.defineProperties(eYo.Grammar,{
  single_input: { get () { return 256 } },
  file_input: { get () { return 257 } },
  eval_input: { get () { return 258 } },
  decorator: { get () { return 259 } },
  decorators: { get () { return 260 } },
  decorated: { get () { return 261 } },
  async_funcdef: { get () { return 262 } },
  funcdef: { get () { return 263 } },
  parameters: { get () { return 264 } },
  typedargslist: { get () { return 265 } },
  tfpdef: { get () { return 266 } },
  varargslist: { get () { return 267 } },
  vfpdef: { get () { return 268 } },
  stmt: { get () { return 269 } },
  simple_stmt: { get () { return 270 } },
  small_stmt: { get () { return 271 } },
  expr_stmt: { get () { return 272 } },
  annassign: { get () { return 273 } },
  testlist_star_expr: { get () { return 274 } },
  augassign: { get () { return 275 } },
  del_stmt: { get () { return 276 } },
  pass_stmt: { get () { return 277 } },
  flow_stmt: { get () { return 278 } },
  break_stmt: { get () { return 279 } },
  continue_stmt: { get () { return 280 } },
  return_stmt: { get () { return 281 } },
  yield_stmt: { get () { return 282 } },
  raise_stmt: { get () { return 283 } },
  import_stmt: { get () { return 284 } },
  import_name: { get () { return 285 } },
  import_from: { get () { return 286 } },
  import_as_name: { get () { return 287 } },
  dotted_as_name: { get () { return 288 } },
  import_as_names: { get () { return 289 } },
  dotted_as_names: { get () { return 290 } },
  dotted_name: { get () { return 291 } },
  global_stmt: { get () { return 292 } },
  nonlocal_stmt: { get () { return 293 } },
  assert_stmt: { get () { return 294 } },
  compound_stmt: { get () { return 295 } },
  async_stmt: { get () { return 296 } },
  if_stmt: { get () { return 297 } },
  while_stmt: { get () { return 298 } },
  for_stmt: { get () { return 299 } },
  try_stmt: { get () { return 300 } },
  with_stmt: { get () { return 301 } },
  with_item: { get () { return 302 } },
  except_clause: { get () { return 303 } },
  suite: { get () { return 304 } },
  namedexpr_test: { get () { return 305 } },
  test: { get () { return 306 } },
  test_nocond: { get () { return 307 } },
  lambdef: { get () { return 308 } },
  lambdef_nocond: { get () { return 309 } },
  or_test: { get () { return 310 } },
  and_test: { get () { return 311 } },
  not_test: { get () { return 312 } },
  comparison: { get () { return 313 } },
  comp_op: { get () { return 314 } },
  star_expr: { get () { return 315 } },
  expr: { get () { return 316 } },
  xor_expr: { get () { return 317 } },
  and_expr: { get () { return 318 } },
  shift_expr: { get () { return 319 } },
  arith_expr: { get () { return 320 } },
  term: { get () { return 321 } },
  factor: { get () { return 322 } },
  power: { get () { return 323 } },
  atom_expr: { get () { return 324 } },
  atom: { get () { return 325 } },
  testlist_comp: { get () { return 326 } },
  trailer: { get () { return 327 } },
  subscriptlist: { get () { return 328 } },
  subscript: { get () { return 329 } },
  sliceop: { get () { return 330 } },
  exprlist: { get () { return 331 } },
  testlist: { get () { return 332 } },
  dictorsetmaker: { get () { return 333 } },
  classdef: { get () { return 334 } },
  arglist: { get () { return 335 } },
  argument: { get () { return 336 } },
  comp_iter: { get () { return 337 } },
  sync_comp_for: { get () { return 338 } },
  comp_for: { get () { return 339 } },
  comp_if: { get () { return 340 } },
  encoding_decl: { get () { return 341 } },
  yield_expr: { get () { return 342 } },
  yield_arg: { get () { return 343 } },
  func_body_suite: { get () { return 344 } },
  func_type_input: { get () { return 345 } },
  func_type: { get () { return 346 } },
  typelist: { get () { return 347 } },
})
