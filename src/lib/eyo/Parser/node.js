/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview cpython's node.c counterparts.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.require('eYo.E')
goog.require('eYo.Node')

goog.provide('eYo.Node')

/* Parse tree node implementation *-/

#include "Python.h"
#include "node.h"
#include "errcode.h"

#define RCHILD(n, i)    (CHILD(n, NCH(n) + i))
#define TYPE(n)         ((n)->n_type)
#define STR(n)          ((n)->n_str)
#define LINENO(n)       ((n)->n_lineno)

/* Assert that the type of a node is what we expect *-/
#define REQ(n, type) assert(TYPE(n) == (type))

node * */

eYo.Node = function (scan, type, subtype) {
  if (type === undefined || type === eYo.Token.ERRORTOKEN) {
    console.error('WTF')
  }
  this.scan = scan
  this.n_type = type
  this.subtype = subtype
  this.start = scan.start
  this.start_string = scan.start_string
  scan.start_string = undefined
  this.end = scan.start = scan.end
  if (scan.first_lineno) {
    this.col_offset = scan.first_col_offset
    this.lineno = scan.first_lineno
    this.end_lineno = scan.lineno
    this.end_col_offset = scan.col_offset
    scan.first_lineno = scan.first_col_offset = undefined
  } else {
    this.lineno = scan.lineno
    this.col_offset = scan.col_offset
  }
  this.n_child = [];
  return n;
}

eYo.Node.prototype.be_keyword = function () {
  this.is_keyword = true
  return this
}

eYo.Node.prototype.be_close = function (open) {
  if (open) {
    this.open = open
    open.close = this
  }
  return this
}

eYo.Node.prototype.parent = null
eYo.Node.prototype.children = null

Object.defineProperties(eYo.Node.prototype, {
  str: {
    get () {
      return this.scan.str
    }
  },
  content: {
    get () {
      if (this._content) {
        return this._content
      }
      return (this._content = this.str.substring(this.start, this.end))
    }
  },
  string: {
    get () {
      if (this._string) {
        return this._string
      }
      if (this.start_string !== undefined) {
        return (this._string = this.str.substring(this.start_string, this.end))
      }
      return (this._string = this.content)
    }
  },
  n_type: {
    get () {
      return this.type
    }
  },
  n_str: {
    get () {
      return this.content
    }
  },
  n_lineno: {
    get () {
      return this.lineno
    }
  },
  n_nchildren: {
    get () {
      return this.n_child.length
    }
  }
})

eYo.Node.PyNode_New = (type) =>
{
  raise('THIS MUST NOT BE USED')
}

/* See comments at XXXROUNDUP below.  Returns -1 on overflow. *-/
static int */

eYo.Node.fancy_roundup = (n) =>
{
  /* Round up to the closest power of 2 >= n. */
  var result = 256
  goog.asserts.assert(n > 128, 'n too small')
  while (result < n) {
    result <<= 1;
    if (result <= 0) {
      return -1;
    }
  }
  return result;
}

/* A gimmick to make massive numbers of reallocs quicker.  The result is
 * a number >= the input.  In PyNode_AddChild, it's used like so, when
 * we're about to add child number current_size + 1:
 *
 *     if XXXROUNDUP(current_size) < XXXROUNDUP(current_size + 1):
 *         allocate space for XXXROUNDUP(current_size + 1) total children
 *     else:
 *         we already have enough space
 *
 * Since a node starts out empty, we must have
 *
 *     XXXROUNDUP(0) < XXXROUNDUP(1)
 *
 * so that we allocate space for the first child.  One-child nodes are very
 * common (presumably that would change if we used a more abstract form
 * of syntax tree), so to avoid wasting memory it's desirable that
 * XXXROUNDUP(1) == 1.  That in turn forces XXXROUNDUP(0) == 0.
 *
 * Else for 2 <= n <= 128, we round up to the closest multiple of 4.  Why 4?
 * Rounding up to a multiple of an exact power of 2 is very efficient, and
 * most nodes with more than one child have <= 4 kids.
 *
 * Else we call fancy_roundup() to grow proportionately to n.  We've got an
 * extreme case then (like test_longexp.py), and on many platforms doing
 * anything less than proportional growth leads to exorbitant runtime
 * (e.g., MacPython), or extreme fragmentation of user address space (e.g.,
 * Win98).
 *
 * In a run of compileall across the 2.3a0 Lib directory, Andrew MacIntyre
 * reported that, with this scheme, 89% of PyObject_REALLOC calls in
 * PyNode_AddChild passed 1 for the size, and 9% passed 4.  So this usually
 * wastes very little memory, but is very effective at sidestepping
 * platform-realloc disasters on vulnerable platforms.
 *
 * Note that this would be straightforward if a node stored its current
 * capacity.  The code is tricky to avoid that.
 */

eYo.Node.XXXROUNDUP = n => n <= 1
  ? n
  : n <= 128
    ? eYo.Node._Py_SIZE_ROUND_UP(n, 4)
    : fancy_roundup(n)


/* void */
eYo.Node._PyNode_FinalizeEndPos = (n) =>
{
    var nch = n.n_nchildren
    if (nch === 0) {
        return;
    }
    var last = n.n_child[nch - 1]
    eYo.Node._PyNode_FinalizeEndPos(last)
    n.n_end_lineno = last.n_end_lineno
    n.n_end_col_offset = last.n_end_col_offset
  }

  /* int */
  
  eYo.Node.PyNode_AddChild_ = (n1, n2) =>
  {
    n1.n_child.push(n2)
    n2.n_parent = n1
  }

  /* int */
  
  eYo.Node.PyNode_AddChild = (n1, type, str, lineno, col_offset,
                  end_lineno, end_col_offset) =>
  {
    raise('DO NOT CALL THAT')
    // var nch = n1.n_nchildren
    // var current_capacity
    // var required_capacity
    // var n

    // // finalize end position of previous node (if any)
    // if (nch > 0) {
    //   eYo.Node._PyNode_FinalizeEndPos(CHILD(n1, nch - 1));
    // }

    // if (nch === Number.MAX_SAFE_INTEGER || nch < 0) {
    //   return eYo.E.OVERFLOW
    // }
    

    // n = n1.n_child[n1.n_nchildren++];
    // n.n_type = type;
    // n.n_str = str;
    // n.n_lineno = lineno;
    // n.n_col_offset = col_offset;
    // n.n_end_lineno = end_lineno;  // this and below will be updates after all children are added.
    // n.n_end_col_offset = end_col_offset;
    // n.n_nchildren = 0;
    // n.n_child = NULL;
    // return 0;
}

/* Forward *-/
static void freechildren(node *);
static Py_ssize_t sizeofchildren(node *n);


void */
eYo.Node.PyNode_Free = (n) =>
{
  raise('DO NOT CALL THIS')
}

Py_ssize_t
eYo.Node._PyNode_SizeOf = (n) =>
{
  raise('DO NOT CALL THIS')
  return n ? 1 + eYo.Node.sizeofchildren(n): 0
}

/* static void */

eYo.Node.freechildren = (n) =>
{
  raise('DO NOT CALL THIS')
    // int i;
    // for (i = n.n_nchildren; --i >= 0; )
    //     freechildren(n.n_child[i)];
    // if (n.n_child != NULL)
    //     PyObject_FREE(n.n_child);
    // if (n.n_str != NULL)
    //     PyObject_FREE(n.n_str);
}

/* static Py_ssize_t */

eYo.Node.sizeofchildren = (n) =>
{
  var res = 0
  for (var i = n.n_nchildren; --i >= 0; )
      res += eYo.Node.sizeofchildren(n.n_nchild[i]);
  if (n.n_child !== NULL) {
    /* allocated size of n.n_child array */
    res += n.n_nchildren;
  }
  if (n.string)
      res += n.string.length
  return res;
}
