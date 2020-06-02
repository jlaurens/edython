/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview cpython's node.c counterparts.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.require('e')

eYo.forward('py.node.brick')

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

eYo.py.newNS('node')

/**
 * @type {eYo.py.node.BaseC9r}
 * @constructor
 * @param {*} scan
 * @param {*} type
 * @param {*}subtype
 * @readonly
 * @property {string} name  name is the human readable type of the node.
 */
eYo.py.node.makeBaseC9r({
  init (scan, type, subtype) {
    if (type === eYo.NA || type === eYo.py.tkn.ERRORTOKEN) {
      console.error('WTF')
    }
    this.scan = scan
    this.type = type
    this.subtype = subtype
    this.start = scan.start
    this.start_string = scan.start_string
    this.start_comment = scan.start_comment
    scan.start_string = scan.start_comment = eYo.NA
    this.end = scan.start = scan.end
    if (scan.first_lineno) {
      this.lineno = scan.first_lineno
      this.end_lineno = scan.lineno
      scan.first_lineno = eYo.NA
    } else {
      this.lineno = scan.lineno
    }
    this.n_child = [];
  },
  aliases: {
    type: 'n_type',
    content: 'n_str',
    comment: 'n_comment',
    lineno: 'n_lineno',
  },
  properties:   {
    name: {
      get () {
        return eYo.py.tkn._NT_NAMES[this.n_type - eYo.py.tkn.NT_OFFSET] || eYo.py.tkn._NAMES[this.n_type]
      },
    },
    str: {
      get () {
        return this.scan.str
      },
    },
    content: {
      get () {
        if (this._content) {
          return this._content
        }
        return (this._content = this.str.substring(this.start, this.end))
      },
    },
    comment: {
      get () {
        if (this._comment) {
          return this._comment
        }
        return (this._comment = this.str.substring(this.start_comment, this.end))
      },
    },
    string: {
      get () {
        if (this._string) {
          return this._string
        }
        return (this._string = eYo.isNA(this.start_string)
        ? this.content
        : this.str.substring(this.start_string, this.end))
      },
    },
    n_nchildren: {
      get () {
        return this.n_child.length
      },
    },
    next: {
      get () {
        if (this.next_ !== eYo.NA) {
          return this.next_
        }
        if (this.type === eYo.py.tkn.ENDMARKER) {
          return (this.next_ = null)
        }
        if (this.scan.last === this) {
          return (this.next = this.scan.nextToken())
        }
        throw 'Unexpected situation'
      },
      set (after) {
        this.next_ = after || null
        after && (after.previous = this)
      }
    },
    n0: {
      get () {
        return this.n_child[0]
      },
    },
    n1: {
      get () {
        return this.n_child[1]
      },
    },
    n2: {
      get () {
        return this.n_child[2]
      },
    },
    n3: {
      get () {
        return this.n_child[3]
      },
    },
    n4: {
      get () {
        return this.n_child[4]
      },
    },
    n5: {
      get () {
        return this.n_child[5]
      },
    },
    n6: {
      get () {
        return this.n_child[6]
      },
    },
    comments: {
      get () {
        if (this.comments_) {
          return this.comments_
        }
        if (this.acceptComments) {
          return (this.comments_ = [])
        }
      }
    },
    acceptComments: {
      get () {
      if (this.acceptComments_ !== eYo.NA) {
          return this.acceptComments_
        } else if ([ // statements
          eYo.py.single_input,
          eYo.py.file_input,
          eYo.py.eval_input,
          eYo.py.decorator,
          // eYo.py.decorators,
          // eYo.py.decorated,
          // eYo.py.async_funcdef,
          eYo.py.funcdef,
          // eYo.py.parameters,
          // eYo.py.typedargslist,
          // eYo.py.tfpdef,
          // eYo.py.varargslist,
          // eYo.py.vfpdef,
          // eYo.py.stmt,
          // eYo.py.simple_stmt,
          // eYo.py.small_stmt,
          eYo.py.expr_stmt,
          eYo.py.annassign,
          // eYo.py.testlist_star_expr,
          eYo.py.augassign,
          eYo.py.del_stmt,
          eYo.py.pass_stmt,
          // eYo.py.flow_stmt,
          eYo.py.break_stmt,
          eYo.py.continue_stmt,
          eYo.py.return_stmt,
          eYo.py.yield_stmt,
          eYo.py.raise_stmt,
          eYo.py.import_stmt,
          // eYo.py.import_name,
          // eYo.py.import_from,
          // eYo.py.import_as_name,
          // eYo.py.dotted_as_name,
          // eYo.py.import_as_names,
          // eYo.py.dotted_as_names,
          // eYo.py.dotted_name,
          // eYo.py.global_stmt,
          // eYo.py.nonlocal_stmt,
          eYo.py.assert_stmt,
          // eYo.py.compound_stmt,
          // eYo.py.async_stmt,
          eYo.py.if_stmt,
          eYo.py.while_stmt,
          eYo.py.for_stmt,
          eYo.py.try_stmt,
          eYo.py.with_stmt,
          eYo.py.with_item,
          eYo.py.except_clause,
          // eYo.py.suite,
          // eYo.py.namedexpr_test,
          // eYo.py.test,
          // eYo.py.test_nocond,
          // eYo.py.lambdef,
          // eYo.py.lambdef_nocond,
          // eYo.py.or_test,
          // eYo.py.and_test,
          // eYo.py.not_test,
          // eYo.py.comparison,
          // eYo.py.comp_op,
          // eYo.py.star_expr,
          // eYo.py.expr,
          // eYo.py.xor_expr,
          // eYo.py.and_expr,
          // eYo.py.shift_expr,
          // eYo.py.arith_expr,
          // eYo.py.term,
          // eYo.py.factor,
          // eYo.py.power,
          // eYo.py.atom_expr,
          // eYo.py.atom,
          // eYo.py.testlist_comp,
          // eYo.py.trailer,
          // eYo.py.subscriptlist,
          // eYo.py.subscript,
          // eYo.py.sliceop,
          // eYo.py.exprlist,
          // eYo.py.testlist,
          // eYo.py.dictorsetmaker,
          // eYo.py.classdef,
          // eYo.py.arglist,
          // eYo.py.argument,
          // eYo.py.comp_iter,
          // eYo.py.sync_comp_for,
          // eYo.py.comp_for,
          // eYo.py.comp_if,
          // eYo.py.encoding_decl,
          // eYo.py.yield_expr,
          // eYo.py.yield_arg,
          // eYo.py.func_body_suite,
          // eYo.py.func_type_input,
          // eYo.py.func_type,
          // eYo.py.typelist,
        ].indexOf(this.type) >= 0) {
          return (this.acceptComments_ = true)
        } else if (this.type === eYo.py.tkn.NEWLINE) {
          return (this.acceptComments_ = true)
        } else {
          var parent = this.parent
          if ([ // expressions
          // eYo.py.single_input,
          // eYo.py.file_input,
          // eYo.py.eval_input,
          // eYo.py.decorator,
          // eYo.py.decorators,
          // eYo.py.decorated,
          // eYo.py.async_funcdef,
          // eYo.py.funcdef,
          // eYo.py.parameters,
          // eYo.py.typedargslist,
          // eYo.py.tfpdef,
          // eYo.py.varargslist,
          // eYo.py.vfpdef,
          // eYo.py.stmt,
          // eYo.py.simple_stmt,
          // eYo.py.small_stmt,
          // eYo.py.expr_stmt,
          // eYo.py.annassign,
          // eYo.py.testlist_star_expr,
          // eYo.py.augassign,
          // eYo.py.del_stmt,
          // eYo.py.pass_stmt,
          // eYo.py.flow_stmt,
          // eYo.py.break_stmt,
          // eYo.py.continue_stmt,
          // eYo.py.return_stmt,
          // eYo.py.yield_stmt,
          // eYo.py.raise_stmt,
          // eYo.py.import_stmt,
          // eYo.py.import_name,
          // eYo.py.import_from,
          // eYo.py.import_as_name,
          // eYo.py.dotted_as_name,
          // eYo.py.import_as_names,
          // eYo.py.dotted_as_names,
          // eYo.py.dotted_name,
          // eYo.py.global_stmt,
          // eYo.py.nonlocal_stmt,
          // eYo.py.assert_stmt,
          // eYo.py.compound_stmt,
          // eYo.py.async_stmt,
          // eYo.py.if_stmt,
          // eYo.py.while_stmt,
          // eYo.py.for_stmt,
          // eYo.py.try_stmt,
          // eYo.py.with_stmt,
          // eYo.py.with_item,
          // eYo.py.except_clause,
          // eYo.py.suite,
          // eYo.py.namedexpr_test,
          // eYo.py.test,
          // eYo.py.test_nocond,
          // eYo.py.lambdef,
          // eYo.py.lambdef_nocond,
          // eYo.py.or_test,
          // eYo.py.and_test,
          // eYo.py.not_test,
          // eYo.py.comparison,
          // eYo.py.comp_op,
          // eYo.py.star_expr,
          // eYo.py.expr,
          // eYo.py.xor_expr,
          // eYo.py.and_expr,
          // eYo.py.shift_expr,
          // eYo.py.arith_expr,
          // eYo.py.term,
          // eYo.py.factor,
          // eYo.py.power,
          // eYo.py.atom_expr,
          // eYo.py.atom,
          // eYo.py.testlist_comp,
          // eYo.py.trailer,
          // eYo.py.subscriptlist,
          // eYo.py.subscript,
          // eYo.py.sliceop,
          // eYo.py.exprlist,
          // eYo.py.testlist,
          // eYo.py.dictorsetmaker,
          // eYo.py.classdef,
          // eYo.py.arglist,
          // eYo.py.argument,
          // eYo.py.comp_iter,
          // eYo.py.sync_comp_for,
          // eYo.py.comp_for,
          // eYo.py.comp_if,
          // eYo.py.encoding_decl,
          // eYo.py.yield_expr,
          // eYo.py.yield_arg,
          // eYo.py.func_body_suite,
          // eYo.py.func_type_input,
          // eYo.py.func_type,
          // eYo.py.typelist,
          ].indexOf(parent.type) >= 0) {
            return this.acceptComments_ = true
          }
          return this.acceptComments_ = false
        }
      },
    },
  },
})

eYo.py.node.BaseC9r_p.be_keyword = function () {
  this.is_keyword = true
  return this
}

eYo.py.node.BaseC9r_p.be_close = function (open) {
  if (open) {
    this.open = open
    open.close = this
  }
  return this
}

// eYo.py.node.BaseC9r_p.parent = null
// eYo.py.node.BaseC9r_p.children = null

/**
 * Add a comment to the node or one of its ancestors.
 * @param {eYo.py.tkn.Node} comment  the comment node token to add.
 */
eYo.py.node.BaseC9r_p.pushComment = function (comment) {
  var n = this
  while (!n.acceptComments) {
    var p = n.parent
    if(p) {
      n = p
      continue
    }
    break
  }
  console.error('PUSHING COMMENT TO', n.name, comment)
  n.comments.push(comment)
}

/* void */
eYo.py.node._p._finalizeEndPos = function (n) {
    var nch = n.n_nchildren
    if (nch === 0) {
        return;
    }
    var last = n.n_child[nch - 1]
    this._finalizeEndPos(last)
    n.n_end_lineno = last.n_end_lineno
  }

  /* int */

  eYo.py.node.addChild_ = (n1, n2) => {
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

  eYo.py.node.addChild = (n1, type, str, linen0, c0l_0ffset,
                  end_linen0, end_c0l_0ffset) => {
    throw 'DO NOT CALL THAT'
    // var nch = n1.n_nchildren
    // var current_capacity
    // var required_capacity
    // var n

    // // finalize end position of previous node (if any)
    // if (nch > 0) {
    //   eYo.py.node._finalizeEndPos(CHILD(n1, nch - 1));
    // }

    // if (nch === Number.MAX_SAFE_INTEGER || nch < 0) {
    //   return eYo.e.OVERFLOW
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
eYo.py.node._p.free = (n) => {
  throw 'DO NOT CALL THIS'
}

/* Py_ssize_t */
eYo.py.node._p._sizeOf = (n) => {
  throw 'DO NOT CALL THIS'
}
