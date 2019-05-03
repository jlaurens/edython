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
/**
 * @param {*} scan
 * @param {*} type
 * @param {*}subtype
 * @readonly
 * @property {string} name  name is the human readable type of the node.
 */
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
    this.lineno = scan.first_lineno
    this.end_lineno = scan.lineno
    scan.first_lineno = undefined
  } else {
    this.lineno = scan.lineno
  }
  this.n_child = [];
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
  comment: {
    get () {
      if (this._comment) {
        return this._comment
      }
      return (this._comment = this.str.substring(this.start_comment, this.end))
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
  n_comment: {
    get () {
      return this.comment
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
  },
  n0: {
    get () {
      return this.n0_
    }
  },
  n1: {
    get () {
      return this.n0_.sibling
    }
  },
  n2: {
    get () {
      return this.n_child[2]
    }
  },
  n3: {
    get () {
      return this.n_child[3]
    }
  },
  n4: {
    get () {
      return this.n_child[4]
    }
  },
  n5: {
    get () {
      return this.n_child[5]
    }
  },
  n6: {
    get () {
      return this.n_child[6]
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
  }

  /* int */
  
  eYo.Node.PyNode_AddChild_ = (n1, n2) =>
  {
    n1.n_child.push(n2)
    n2.parent = n1
    if (n1.last_child) {
      n1.last_child.sibling = n2
    } else {
      n1.n0_ = n2
    }
    n1.last_child = n2
  }

  /* int */
  
  eYo.Node.PyNode_AddChild = (n1, type, str, linen0, c0l_0ffset,
                  end_linen0, end_c0l_0ffset) =>
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
    // n.n_c0l_offset = c0l_offset;
    // n.n_end_lineno = end_lineno;  // this and below will be updates after all children are added.
    // n.n_end_c0l_offset = end_col_0ffset;
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
