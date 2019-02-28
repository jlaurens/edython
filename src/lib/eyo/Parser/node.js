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
  if (type === undefined || type === eYo.TKN.ERRORTOKEN) {
    console.error('WTF')
  }
  this.scan = scan
  this.type = type
  this.subtype = subtype
  this.start = scan.start
  this.start_string = scan.start_string
  this.start_comment = scan.start_comment
  scan.start_string = scan.start_comment = undefined
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

// eYo.Node.prototype.parent = null
// eYo.Node.prototype.children = null

Object.defineProperties(eYo.Node.prototype, {
  name: {
    get () {
      return eYo.TKN._NT_NAMES[this.n_type - eYo.TKN.NT_OFFSET] || eYo.TKN._NAMES[this.n_type]
    }
  },
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
  },
  next: {
    get () {
      if (this.next_ !== undefined) {
        return this.next_
      }
      if (this.type === eYo.TKN.ENDMARKER) {
        return (this.next_ = null)
      }
      if (this.scan.last === this) {
        return (this.next = this.scan.nextToken())
      }
      throw 'Unexpected situation'
    },
    set (newValue) {
      this.next_ = newValue || null
      newValue && (newValue.previous = this)
    }
  }
})

eYo.Node.PyNode_New = (type) =>
{
  throw 'THIS MUST NOT BE USED'
}

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
    throw 'DO NOT CALL THAT'
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
  throw 'DO NOT CALL THIS'
}

/* Py_ssize_t */
eYo.Node._PyNode_SizeOf = (n) =>
{
  throw 'DO NOT CALL THIS'
}
