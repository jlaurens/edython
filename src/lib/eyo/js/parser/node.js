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

eYo.forwardDeclare('node_Brick')

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
eYo.makeClass('Node', {
  init (scan, type, subtype) {
    if (type === eYo.NA || type === eYo.tkn.ERRORTOKEN) {
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
  computed:   {
    name () {
      return eYo.tkn._NT_NAMES[this.n_type - eYo.tkn.NT_OFFSET] || eYo.tkn._NAMES[this.n_type]
    },
    str () {
      return this.scan.str
    },
    content () {
      if (this._content) {
        return this._content
      }
      return (this._content = this.str.substring(this.start, this.end))
    },
    comment () {
      if (this._comment) {
        return this._comment
      }
      return (this._comment = this.str.substring(this.start_comment, this.end))
    },
    string () {
      if (this._string) {
        return this._string
      }
      return (this._string = eYo.isNA(this.start_string)
      ? this.content
      : this.str.substring(this.start_string, this.end))
    },
    n_type () {
      return this.type
    },
    n_str () {
      return this.content
    },
    n_comment () {
      return this.comment
    },
    n_lineno () {
      return this.lineno
    },
    n_nchildren () {
      return this.n_child.length
    },
    next: {
      get () {
        if (this.next_ !== eYo.NA) {
          return this.next_
        }
        if (this.type === eYo.tkn.ENDMARKER) {
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
        return this.n0_
      }
    },
    n1 () {
      return this.n0_.sibling
    },
    n2 () {
      return this.n_child[2]
    },
    n3 () {
      return this.n_child[3]
    },
    n4 () {
      return this.n_child[4]
    },
    n5 () {
      return this.n_child[5]
    },
    n6 () {
      return this.n_child[6]
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
    acceptComments () {
      if (this.acceptComments_ !== eYo.NA) {
        return this.acceptComments_
      } else if ([ // statements
        eYo.tkn.Single_input,
        eYo.tkn.file_input,
        eYo.tkn.eval_input,
        eYo.tkn.decorator,
        // eYo.tkn.decorators,
        // eYo.tkn.decorated,
        // eYo.tkn.Async_funcdef,
        eYo.tkn.funcdef,
        // eYo.tkn.Parameters,
        // eYo.tkn.typedargslist,
        // eYo.tkn.tfpdef,
        // eYo.tkn.varargslist,
        // eYo.tkn.vfpdef,
        // eYo.tkn.Stmt,
        // eYo.tkn.Simple_stmt,
        // eYo.tkn.Small_stmt,
        eYo.tkn.expr_stmt,
        eYo.tkn.Annassign,
        // eYo.tkn.testlist_star_expr,
        eYo.tkn.Augassign,
        eYo.tkn.del_stmt,
        eYo.tkn.pass_stmt,
        // eYo.tkn.flow_stmt,
        eYo.tkn.Break_stmt,
        eYo.tkn.Continue_stmt,
        eYo.tkn.return_stmt,
        eYo.tkn.yield_stmt,
        eYo.tkn.raise_stmt,
        eYo.tkn.import_stmt,
        // eYo.tkn.import_name,
        // eYo.tkn.import_from,
        // eYo.tkn.import_as_name,
        // eYo.tkn.Dotted_as_name,
        // eYo.tkn.import_as_names,
        // eYo.tkn.Dotted_as_names,
        // eYo.tkn.Dotted_name,
        // eYo.tkn.global_stmt,
        // eYo.tkn.nonlocal_stmt,
        eYo.tkn.Assert_stmt,
        // eYo.tkn.Compound_stmt,
        // eYo.tkn.Async_stmt,
        eYo.tkn.if_stmt,
        eYo.tkn.while_stmt,
        eYo.tkn.for_stmt,
        eYo.tkn.try_stmt,
        eYo.tkn.with_stmt,
        eYo.tkn.with_item,
        eYo.tkn.except_clause,
        // eYo.tkn.Suite,
        // eYo.tkn.namedexpr_test,
        // eYo.tkn.test,
        // eYo.tkn.test_nocond,
        // eYo.tkn.lambdef,
        // eYo.tkn.lambdef_nocond,
        // eYo.tkn.or_test,
        // eYo.tkn.And_test,
        // eYo.tkn.not_test,
        // eYo.tkn.Comparison,
        // eYo.tkn.Comp_op,
        // eYo.tkn.Star_expr,
        // eYo.tkn.expr,
        // eYo.tkn.xor_expr,
        // eYo.tkn.And_expr,
        // eYo.tkn.Shift_expr,
        // eYo.tkn.Arith_expr,
        // eYo.tkn.term,
        // eYo.tkn.factor,
        // eYo.tkn.power,
        // eYo.tkn.Atom_expr,
        // eYo.tkn.Atom,
        // eYo.tkn.testlist_comp,
        // eYo.tkn.trailer,
        // eYo.tkn.Subscriptlist,
        // eYo.tkn.Subscript,
        // eYo.tkn.Sliceop,
        // eYo.tkn.exprlist,
        // eYo.tkn.testlist,
        // eYo.tkn.dictorsetmaker,
        // eYo.tkn.Classdef,
        // eYo.tkn.Arglist,
        // eYo.tkn.Argument,
        // eYo.tkn.Comp_iter,
        // eYo.tkn.Sync_comp_for,
        // eYo.tkn.Comp_for,
        // eYo.tkn.Comp_if,
        // eYo.tkn.encoding_decl,
        // eYo.tkn.yield_expr,
        // eYo.tkn.yield_arg,
        // eYo.tkn.func_body_suite,
        // eYo.tkn.func_type_input,
        // eYo.tkn.func_type,
        // eYo.tkn.typelist,
      ].indexOf(this.type) >= 0) {
        return (this.acceptComments_ = true)
      } else if (this.type === eYo.tkn.NEWLINE) {
        return (this.acceptComments_ = true)
      } else {
        var parent = this.parent
        if ([ // expressions
        // eYo.tkn.Single_input,
        // eYo.tkn.file_input,
        // eYo.tkn.eval_input,
        // eYo.tkn.decorator,
        // eYo.tkn.decorators,
        // eYo.tkn.decorated,
        // eYo.tkn.Async_funcdef,
        // eYo.tkn.funcdef,
        // eYo.tkn.Parameters,
        // eYo.tkn.typedargslist,
        // eYo.tkn.tfpdef,
        // eYo.tkn.varargslist,
        // eYo.tkn.vfpdef,
        // eYo.tkn.Stmt,
        // eYo.tkn.Simple_stmt,
        // eYo.tkn.Small_stmt,
        // eYo.tkn.expr_stmt,
        // eYo.tkn.Annassign,
        // eYo.tkn.testlist_star_expr,
        // eYo.tkn.Augassign,
        // eYo.tkn.del_stmt,
        // eYo.tkn.pass_stmt,
        // eYo.tkn.flow_stmt,
        // eYo.tkn.Break_stmt,
        // eYo.tkn.Continue_stmt,
        // eYo.tkn.return_stmt,
        // eYo.tkn.yield_stmt,
        // eYo.tkn.raise_stmt,
        // eYo.tkn.import_stmt,
        // eYo.tkn.import_name,
        // eYo.tkn.import_from,
        // eYo.tkn.import_as_name,
        // eYo.tkn.Dotted_as_name,
        // eYo.tkn.import_as_names,
        // eYo.tkn.Dotted_as_names,
        // eYo.tkn.Dotted_name,
        // eYo.tkn.global_stmt,
        // eYo.tkn.nonlocal_stmt,
        // eYo.tkn.Assert_stmt,
        // eYo.tkn.Compound_stmt,
        // eYo.tkn.Async_stmt,
        // eYo.tkn.if_stmt,
        // eYo.tkn.while_stmt,
        // eYo.tkn.for_stmt,
        // eYo.tkn.try_stmt,
        // eYo.tkn.with_stmt,
        // eYo.tkn.with_item,
        // eYo.tkn.except_clause,
        // eYo.tkn.Suite,
        // eYo.tkn.namedexpr_test,
        // eYo.tkn.test,
        // eYo.tkn.test_nocond,
        // eYo.tkn.lambdef,
        // eYo.tkn.lambdef_nocond,
        // eYo.tkn.or_test,
        // eYo.tkn.And_test,
        // eYo.tkn.not_test,
        // eYo.tkn.Comparison,
        // eYo.tkn.Comp_op,
        // eYo.tkn.Star_expr,
        // eYo.tkn.expr,
        // eYo.tkn.xor_expr,
        // eYo.tkn.And_expr,
        // eYo.tkn.Shift_expr,
        // eYo.tkn.Arith_expr,
        // eYo.tkn.term,
        // eYo.tkn.factor,
        // eYo.tkn.power,
        // eYo.tkn.Atom_expr,
        // eYo.tkn.Atom,
        // eYo.tkn.testlist_comp,
        // eYo.tkn.trailer,
        // eYo.tkn.Subscriptlist,
        // eYo.tkn.Subscript,
        // eYo.tkn.Sliceop,
        // eYo.tkn.exprlist,
        // eYo.tkn.testlist,
        // eYo.tkn.dictorsetmaker,
        // eYo.tkn.Classdef,
        // eYo.tkn.Arglist,
        // eYo.tkn.Argument,
        // eYo.tkn.Comp_iter,
        // eYo.tkn.Sync_comp_for,
        // eYo.tkn.Comp_for,
        // eYo.tkn.Comp_if,
        // eYo.tkn.encoding_decl,
        // eYo.tkn.yield_expr,
        // eYo.tkn.yield_arg,
        // eYo.tkn.func_body_suite,
        // eYo.tkn.func_type_input,
        // eYo.tkn.func_type,
        // eYo.tkn.typelist,
        ].indexOf(parent.type) >= 0) {
          return this.acceptComments_ = true
        }
        return this.acceptComments_ = false
      }
    },
  },
})

eYo.Node_p.be_keyword = function () {
  this.is_keyword = true
  return this
}

eYo.Node_p.be_close = function (open) {
  if (open) {
    this.open = open
    open.close = this
  }
  return this
}

// eYo.Node_p.parent = null
// eYo.Node_p.children = null

/**
 * Add a comment to the node or one of its ancestors.
 * @param {eYo.Node} comment  the comment node token to add.
 */
eYo.Node_p.pushComment = function (comment) {
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

eYo.Node.PyNode_New = type => {
  throw 'THIS MUST NOT BE USED'
}

/* void */
eYo.Node._PyNode_FinalizeEndPos = (n) => {
    var nch = n.n_nchildren
    if (nch === 0) {
        return;
    }
    var last = n.n_child[nch - 1]
    eYo.Node._PyNode_FinalizeEndPos(last)
    n.n_end_lineno = last.n_end_lineno
  }

  /* int */

  eYo.Node.PyNode_AddChild_ = (n1, n2) => {
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
                  end_linen0, end_c0l_0ffset) => {
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
eYo.Node.PyNode_Free = (n) => {
  throw 'DO NOT CALL THIS'
}

/* Py_ssize_t */
eYo.Node._PyNode_SizeOf = (n) => {
  throw 'DO NOT CALL THIS'
}
