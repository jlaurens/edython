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

goog.provide('eYo.Node')

goog.require('eYo.E')

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
  if (type === eYo.VOID || type === eYo.TKN.ERRORTOKEN) {
    console.error('WTF')
  }
  this.scan = scan
  this.type = type
  this.subtype = subtype
  this.start = scan.start
  this.start_string = scan.start_string
  this.start_comment = scan.start_comment
  scan.start_string = scan.start_comment = eYo.VOID
  this.end = scan.start = scan.end
  if (scan.first_lineno) {
    this.lineno = scan.first_lineno
    this.end_lineno = scan.lineno
    scan.first_lineno = eYo.VOID
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
      if (this.start_string !== eYo.VOID) {
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
      if (this.next_ !== eYo.VOID) {
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
    }
  },
  acceptComments: {
    get () {
      if (this.acceptComments_ !== eYo.VOID) {
        return this.acceptComments_
      } else if ([ // statements
        eYo.TKN.single_input,
        eYo.TKN.file_input,
        eYo.TKN.eval_input,
        eYo.TKN.decorator,
        // eYo.TKN.decorators,
        // eYo.TKN.decorated,
        // eYo.TKN.async_funcdef,
        eYo.TKN.funcdef,
        // eYo.TKN.parameters,
        // eYo.TKN.typedargslist,
        // eYo.TKN.tfpdef,
        // eYo.TKN.varargslist,
        // eYo.TKN.vfpdef,
        // eYo.TKN.stmt,
        // eYo.TKN.simple_stmt,
        // eYo.TKN.small_stmt,
        eYo.TKN.expr_stmt,
        eYo.TKN.annassign,
        // eYo.TKN.testlist_star_expr,
        eYo.TKN.augassign,
        eYo.TKN.del_stmt,
        eYo.TKN.pass_stmt,
        // eYo.TKN.flow_stmt,
        eYo.TKN.break_stmt,
        eYo.TKN.continue_stmt,
        eYo.TKN.return_stmt,
        eYo.TKN.yield_stmt,
        eYo.TKN.raise_stmt,
        eYo.TKN.import_stmt,
        // eYo.TKN.import_name,
        // eYo.TKN.import_from,
        // eYo.TKN.import_as_name,
        // eYo.TKN.dotted_as_name,
        // eYo.TKN.import_as_names,
        // eYo.TKN.dotted_as_names,
        // eYo.TKN.dotted_name,
        // eYo.TKN.global_stmt,
        // eYo.TKN.nonlocal_stmt,
        eYo.TKN.assert_stmt,
        // eYo.TKN.compound_stmt,
        // eYo.TKN.async_stmt,
        eYo.TKN.if_stmt,
        eYo.TKN.while_stmt,
        eYo.TKN.for_stmt,
        eYo.TKN.try_stmt,
        eYo.TKN.with_stmt,
        eYo.TKN.with_item,
        eYo.TKN.except_clause,
        // eYo.TKN.suite,
        // eYo.TKN.namedexpr_test,
        // eYo.TKN.test,
        // eYo.TKN.test_nocond,
        // eYo.TKN.lambdef,
        // eYo.TKN.lambdef_nocond,
        // eYo.TKN.or_test,
        // eYo.TKN.and_test,
        // eYo.TKN.not_test,
        // eYo.TKN.comparison,
        // eYo.TKN.comp_op,
        // eYo.TKN.star_expr,
        // eYo.TKN.expr,
        // eYo.TKN.xor_expr,
        // eYo.TKN.and_expr,
        // eYo.TKN.shift_expr,
        // eYo.TKN.arith_expr,
        // eYo.TKN.term,
        // eYo.TKN.factor,
        // eYo.TKN.power,
        // eYo.TKN.atom_expr,
        // eYo.TKN.atom,
        // eYo.TKN.testlist_comp,
        // eYo.TKN.trailer,
        // eYo.TKN.subscriptlist,
        // eYo.TKN.subscript,
        // eYo.TKN.sliceop,
        // eYo.TKN.exprlist,
        // eYo.TKN.testlist,
        // eYo.TKN.dictorsetmaker,
        // eYo.TKN.classdef,
        // eYo.TKN.arglist,
        // eYo.TKN.argument,
        // eYo.TKN.comp_iter,
        // eYo.TKN.sync_comp_for,
        // eYo.TKN.comp_for,
        // eYo.TKN.comp_if,
        // eYo.TKN.encoding_decl,
        // eYo.TKN.yield_expr,
        // eYo.TKN.yield_arg,
        // eYo.TKN.func_body_suite,
        // eYo.TKN.func_type_input,
        // eYo.TKN.func_type,
        // eYo.TKN.typelist,
      ].indexOf(this.type) >= 0) {
        return (this.acceptComments_ = true)
      } else if (this.type === eYo.TKN.NEWLINE) {
        return (this.acceptComments_ = true)
      } else {
        var parent = this.parent
        if ([ // expressions
        // eYo.TKN.single_input,
        // eYo.TKN.file_input,
        // eYo.TKN.eval_input,
        // eYo.TKN.decorator,
        // eYo.TKN.decorators,
        // eYo.TKN.decorated,
        // eYo.TKN.async_funcdef,
        // eYo.TKN.funcdef,
        // eYo.TKN.parameters,
        // eYo.TKN.typedargslist,
        // eYo.TKN.tfpdef,
        // eYo.TKN.varargslist,
        // eYo.TKN.vfpdef,
        // eYo.TKN.stmt,
        // eYo.TKN.simple_stmt,
        // eYo.TKN.small_stmt,
        // eYo.TKN.expr_stmt,
        // eYo.TKN.annassign,
        // eYo.TKN.testlist_star_expr,
        // eYo.TKN.augassign,
        // eYo.TKN.del_stmt,
        // eYo.TKN.pass_stmt,
        // eYo.TKN.flow_stmt,
        // eYo.TKN.break_stmt,
        // eYo.TKN.continue_stmt,
        // eYo.TKN.return_stmt,
        // eYo.TKN.yield_stmt,
        // eYo.TKN.raise_stmt,
        // eYo.TKN.import_stmt,
        // eYo.TKN.import_name,
        // eYo.TKN.import_from,
        // eYo.TKN.import_as_name,
        // eYo.TKN.dotted_as_name,
        // eYo.TKN.import_as_names,
        // eYo.TKN.dotted_as_names,
        // eYo.TKN.dotted_name,
        // eYo.TKN.global_stmt,
        // eYo.TKN.nonlocal_stmt,
        // eYo.TKN.assert_stmt,
        // eYo.TKN.compound_stmt,
        // eYo.TKN.async_stmt,
        // eYo.TKN.if_stmt,
        // eYo.TKN.while_stmt,
        // eYo.TKN.for_stmt,
        // eYo.TKN.try_stmt,
        // eYo.TKN.with_stmt,
        // eYo.TKN.with_item,
        // eYo.TKN.except_clause,
        // eYo.TKN.suite,
        // eYo.TKN.namedexpr_test,
        // eYo.TKN.test,
        // eYo.TKN.test_nocond,
        // eYo.TKN.lambdef,
        // eYo.TKN.lambdef_nocond,
        // eYo.TKN.or_test,
        // eYo.TKN.and_test,
        // eYo.TKN.not_test,
        // eYo.TKN.comparison,
        // eYo.TKN.comp_op,
        // eYo.TKN.star_expr,
        // eYo.TKN.expr,
        // eYo.TKN.xor_expr,
        // eYo.TKN.and_expr,
        // eYo.TKN.shift_expr,
        // eYo.TKN.arith_expr,
        // eYo.TKN.term,
        // eYo.TKN.factor,
        // eYo.TKN.power,
        // eYo.TKN.atom_expr,
        // eYo.TKN.atom,
        // eYo.TKN.testlist_comp,
        // eYo.TKN.trailer,
        // eYo.TKN.subscriptlist,
        // eYo.TKN.subscript,
        // eYo.TKN.sliceop,
        // eYo.TKN.exprlist,
        // eYo.TKN.testlist,
        // eYo.TKN.dictorsetmaker,
        // eYo.TKN.classdef,
        // eYo.TKN.arglist,
        // eYo.TKN.argument,
        // eYo.TKN.comp_iter,
        // eYo.TKN.sync_comp_for,
        // eYo.TKN.comp_for,
        // eYo.TKN.comp_if,
        // eYo.TKN.encoding_decl,
        // eYo.TKN.yield_expr,
        // eYo.TKN.yield_arg,
        // eYo.TKN.func_body_suite,
        // eYo.TKN.func_type_input,
        // eYo.TKN.func_type,
        // eYo.TKN.typelist,
        ].indexOf(parent.type) >= 0) {
          return this.acceptComments_ = true
        }
        return this.acceptComments_ = false
      }
    }
  }
})

/**
 * Add a comment to the node or one of its ancestors.
 * @param {!eYo.Node} comment  the comment node token to add.
 */
eYo.Node.prototype.pushComment = function (comment) {
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

eYo.Node.PyNode_New = type =>
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
