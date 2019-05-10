/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview Create blocks from a tree node obtained by parsing some python code.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Node.Block')

goog.require('eYo.Node')
goog.require('eYo.TKN')
goog.require('eYo.GMR')

goog.require('eYo.DelegateSvg.Primary')

/**
 * Converts the receiver to a visual block.
 * `this.type === eYo.TKN.suite`.
 * @param {!Object} a block delegate
 */
eYo.Node.prototype.suiteInDlgt = function (dlgt) {
  // simple_stmt | NEWLINE INDENT stmt+ DEDENT
  var n = this.n0
  // suite: simple_stmt | NEWLINE INDENT stmt+ DEDENT
  if (n.n_type === eYo.TKN.NEWLINE) {
    var m4t = dlgt.magnets.suite
    var comments = n.comments
    if (comments.length) {
      comments.forEach(n => {
        m4t = m4t.connectSmart(n.toDlgt(dlgt))
      })
    }
    n = n.sibling.sibling // skip NEWLINE INDENT
    do {
      m4t = m4t.connectSmart(n.toDlgt(dlgt))
    } while ((n = n.sibling) && n.n_type !== eYo.TKN.DEDENT)
  } else {
    var d = n.simple_stmt2Dlgt(dlgt)
    dlgt.magnets.rightMost.connectSmart(d)// what if we cannot connect?
  }
}

/**
 * `this` is the function body node.
 * `this.type === eYo.TKN.func_body_suite`.
 * @param {!Object} a block delegate
 */
eYo.Node.prototype.func_body_suiteInDlgt = function (dlgt) {
  var n = this.n0
  // func_body_suite: simple_stmt | NEWLINE [TYPE_COMMENT NEWLINE] INDENT stmt+ DEDENT
  if (n.n_type === eYo.TKN.NEWLINE) {
    var m4t = dlgt.magnets.suite
    var comments = n.comments
    if (comments.length) {
      comments.forEach(n => {
        m4t = m4t.connectSmart(n.toDlgt(dlgt))
      })
    }
    n = n.sibling // skip NEWLINE
    if (n.n_type === eYo.TKN.TYPE_COMMENT) {
      m4t = m4t.connectSmart(n.typeComment2Dlgt(dlgt))
      n = n.sibling // advance to NEWLINE
      comments = n.comments // manage comments
      if (comments.length) {
        comments.forEach(n => {
          m4t = m4t.connectSmart(n.toDlgt(dlgt))
        })
      }
      n = n.sibling // skip NEWLINE
    }
    n = n.sibling // skip INDENT
    do {
      m4t = m4t.connectSmart(n.toDlgt(dlgt))
    } while ((n = n.sibling) && n.n_type !== eYo.TKN.DEDENT)
  } else {
    var d = n.simple_stmt2Dlgt(dlgt)
    dlgt.magnets.rightMost.connectSmart(d)// what if we cannot connect?
  }
}

/**
 * `this` is the comment node.
 * `this.type === eYo.TKN.COMMENT`
 * @param {!Object} a block delegate
 */
eYo.Node.prototype.comment2Dlgt = function (owner) {
  var dlgt = eYo.DelegateSvg.newComplete(owner, eYo.T3.Stmt.comment_stmt)
  dlgt.comment_p = this.n_comment
  console.log('ONE COMMENT', this.n_comment)
  return dlgt
}

/**
 * `this` is the comment node.
 * `this.type === eYo.TKN.TYPE_COMMENT`
 * @param {!Object} a block delegate
 */
eYo.Node.prototype.typeComment2Dlgt = function (owner) {
  var slgt = eYo.DelegateSvg.newComplete(owner, eYo.T3.Stmt.comment_stmt)
  dlgt.comment_p = this.n0.n_str
  return slgt
}

/**
 * `this` is the simple statement node.
 * `this.type === eYo.TKN.simple_stmt`
 * @param {!Object} a block delegate
 */
eYo.Node.prototype.simple_stmt2Dlgt = function (owner) {
  // simple_stmt: small_stmt (';' small_stmt)* [';'] NEWLINE
  var n = this.n0
  var dlgt = n.toDlgt(owner)
  var d = dlgt
  var m4t = d.magnets.rightMost
  while ((n = n.sibling)) {
    if (n.type === eYo.TKN.SEMI) {
      n = n.sibling
      if (n.type === eYo.TKN.simple_stmt) {
        var dd = n.toDlgt(owner)
        if (dd) {
          m4t.connect(dd.magnets.left)
          m4t = dd.magnets.rightMost
        } else {
          console.error("BREAK HERE, MISSING BLOCK", n)
        }
        continue
      }
    }
    // n.type === eYo.TKN.NEWLINE
    // manage the comments and break
    var comments = n.comments
    if (comments.length) {
      dlgt.pendingComments = comments.map(n => n.toDlgt(owner))
    }
    break
  }
  return dlgt
}

/**
 * `this` is the NAME node.
 * `this.type === eYo.TKN.NAME`
 * @param {!Object} a block delegate
 */
eYo.Node.prototype.NAME2Dlgt = function (owner) {
  var dlgt = eYo.DelegateSvg.newComplete(owner, {
    type: eYo.T3.Expr.identifier,
    target_p: this.n_str
  })
  dlgt.variant_p = eYo.Key.NONE
  return dlgt
}

/**
 * `this` is the dotted_name node.
 * `this.type === eYo.TKN.dotted_name`
 * @param {!Object} a block delegate
 */
eYo.Node.prototype.dotted_name2Dlgt = function (owner) {
  // dotted_name: NAME ('.' NAME)*
  var n = this.n0
  var dlgt = eYo.DelegateSvg.newComplete(owner, {
    type: eYo.T3.Expr.identifier,
    target_p: n.n_str
  })
  while ((n = n.sibling) && (n = n.sibling)) {
    var dd = eYo.DelegateSvg.newComplete(owner, {
      type: eYo.T3.Expr.identifier,
      target_p: n.n_str
    })
    dd.holder_s.connect(dlgt)
    dlgt = dd
  }
  return dlgt
}

/**
 * `this` is the comp_iter node.
 * `this.type === eYo.TKN.comp_iter`
 * @param {!Object} a block delegate
 */
eYo.Node.prototype.comp_iter2Dlgt = function (workspace) {
  // comp_iter: comp_for | comp_if
  var n = this.n0
  if (n.type === eYo.TKN.comp_if) {
    return n.comp_if2Dlgt(workspace)
  } else if (n.type === eYo.TKN.comp_for) {
    if (n.n1) {
      var b = n.n1.sync_comp_for2Dlgt(workspace)
      dlgt.async = true
      return b
    } else {
      return n.n0.sync_comp_for2Dlgt(workspace)
    }
  } else {
    console.error(`UNEXPECTED block type: ${n.type}`)
    return n.toDlgt(workspace)
  }
}

/**
 * Converts the node `n` to a visual block.
 * `this.type === eYo.TKN.comp_for`
 * @param {!eYo.Delegate} dlgt  a block delegate with a 'for' slot.
 */
eYo.Node.prototype.comp_forInDlgt = function (dlgt) {
  // comp_for: ['async'] sync_comp_for
  this.last_child.sync_comp_forInDlgt(dlgt)
  if (this.n1) {
    dlgt.async = true
    console.error('async is not supported')
  }
}

/**
 * Converts the node `n` to a visual block.
 * `this.type === eYo.TKN.sync_comp_for`
 * @param {!eYo.Delegate} dlgt  a block delegate with a 'for' slot.
 */
eYo.Node.prototype.sync_comp_forInDlgt = function (dlgt) {
  // 'for' exprlist 'in' or_test [comp_iter]
  this.n1.exprlistInDlgt(dlgt.for_t)
  dlgt.in_s.connect(this.n3.toDlgt(dlgt))
  var n = this.n4
  n && (dlgt.comp_iter = n.comp_iter2Dlgt(dlgt))
}

/**
 * `this` is the sync_comp_for node.
 * `this.type === eYo.TKN.sync_comp_for`
 * @param {!Object} a block delegate
 */
eYo.Node.prototype.sync_comp_for2Dlgt = function (workspace) {
  // 'for' exprlist 'in' or_test [comp_iter]
  var dlgt = eYo.DelegateSvg.newComplete(workspace, eYo.T3.Expr.comp_for)
  this.sync_comp_forInDlgt(dlgt)
  return dlgt
}

/**
 * `this` is the comp_if node.
 * `this.type === eYo.TKN.comp_if`
 * @param {!Object} a block delegate
 */
eYo.Node.prototype.comp_if2Dlgt = function (workspace) {
  // 'if' test_nocond [comp_iter]
  var dlgt = eYo.DelegateSvg.newComplete(workspace, eYo.T3.Expr.comp_if)
  dlgt.if_s.connect(this.n1.toDlgt(workspace))
  var n = this.n2
  n && (dlgt.comp_iter = n.comp_iter2Dlgt(workspace))
  return dlgt
}

/**
 * `this` is the for_stmt node.
 * `this.type === eYo.TKN.for_stmt`
 * @param {!Object} a block delegate
 */
eYo.Node.prototype.for_stmt2Dlgt = function (workspace) {
  // 'for' exprlist 'in' testlist ':' suite ['else' ':' suite]
  var dlgt = eYo.DelegateSvg.newComplete(workspace, eYo.T3.Stmt.for_part)
  var n = this.n1
  n.exprlistInDlgt(dlgt.for_t)
  n = n.sibling.sibling
  n.testlistInDlgt(dlgt.in_t)
  n = n.sibling.sibling
  n.suiteInDlgt(dlgt)
  if ((n = n.sibling.sibling.sibling)) {
    var dd = eYo.DelegateSvg.newComplete(workspace, eYo.T3.Stmt.else_part)
    n.suiteInDlgt(dd)
    dlgt.connectBottom(dd)
  }
  return b
}

/**
 * `this` is the namedexpr_test node.
 * `this.type === eYo.TKN.namedexpr_test`
 * @param {!Object} a block delegate
 */
eYo.Node.prototype.namedexpr_test2Dlgt = function (workspace) {
  // test [':=' test]
  var dlgt = this.n0.toDlgt(workspace)
  var n = this.n2
  if (n) {
    // if this is already an identifier
    if (dlgt.type !== eYo.T3.Expr.identifier) {
      var dd = eYo.DelegateSvg.newComplete(workspace, eYo.T3.Expr.identifier)
      if (dd.target_t.connectLast(dlgt)) {
        dlgt = dd
      } else {
        console.error('IMPOSSIBLE CONNECTION:', dd, dlgt)
      }
    }
    // b is an identifier, turn it into an identifier_valued
    // before any connection
    dlgt.variant_p = eYo.Key.COL_VALUED
    dd = n.toDlgt(workspace)
    if (!dlgt.value_t.connectLast(dd)) {
      console.error('IMPOSSIBLE CONNECTION:', dlgt, dd)
    }
  }
  return dlgt
}

/**
 * `this` is the if_stmt node.
 * `this.type === eYo.TKN.if_stmt`
 * @param {!Object} a block delegate
 */
eYo.Node.prototype.if_stmt2Dlgt = function (workspace) {
  // 'if' namedexpr_test ':' suite ('elif' namedexpr_test ':' suite)* ['else' ':' suite]
  var dlgt = eYo.DelegateSvg.newComplete(workspace, eYo.T3.Stmt.if_part)
  var n = this.n1
  dlgt.if_s.connect(n.namedexpr_test2Dlgt(workspace))
  n = n.sibling.sibling
  n.suiteInDlgt(dlgt)
  var dd = dlgt
  while ((n = n.sibling)) {
    var m4t = dd.magnets.foot
    if ((n.n_str === 'elif')) {
      dd = eYo.DelegateSvg.newComplete(workspace, eYo.T3.Stmt.elif_part)
      n = n.sibling
      dd.if_s.connect(n.namedexpr_test2Dlgt(workspace))
    } else /* n.n_str === 'else' */ {
      dd = eYo.DelegateSvg.newComplete(workspace, eYo.T3.Stmt.else_part)
    }
    n = n.sibling.sibling
    n.suiteInDlgt(dd)
    m4t.connectSmart(dd)
  }
  return dlgt
}

/**
 * `this` is the while_stmt node.
 * We coud have merged with the if_stmt2Dlgt above.
 * `this.type === eYo.TKN.while_stmt`
 * @param {!Object} a block delegate
 */
eYo.Node.prototype.while_stmt2Dlgt = function (workspace) {
  // 'while' namedexpr_test ':' suite ['else' ':' suite]
  var dlgt = eYo.DelegateSvg.newComplete(workspace, eYo.T3.Stmt.while_part)
  var n = this.n1
  dlgt.if_s.connect(n.namedexpr_test2Dlgt(workspace))
  n = n.sibling.sibling
  n.suiteInDlgt(dlgt)
  var dd = dlgt
  if ((n = n.sibling)) {
    var m4t = dd.magnets.foot
    dd = eYo.DelegateSvg.newComplete(workspace, eYo.T3.Stmt.else_part)
    n.sibling.sibling.suiteInDlgt(dd)
    m4t.connectSmart(dd)
  }
  return dlgt
}

/**
 * `this` is the try_stmt node.
 * `this.type === eYo.TKN.try_stmt`
 * @param {!Object} a block delegate
 */
eYo.Node.prototype.try_stmt2Dlgt = function (workspace) {
  /*try_stmt: ('try' ':' suite
           ((except_clause ':' suite)+
            ['else' ':' suite]
            ['finally' ':' suite] |
           'finally' ':' suite))*/
  // NO consistency test
  var root = eYo.DelegateSvg.newComplete(workspace, eYo.T3.Stmt.try_part)
  var n = this.n2
  n.suiteInDlgt(root)
  var dlgt = root
  while ((n = n.sibling)) {
    if (n.type === eYo.TKN.except_clause) {
      // 'except' [test ['as' NAME]]
      var dd = eYo.DelegateSvg.newComplete(workspace, eYo.T3.Stmt.except_part)
      var nn = n.n1
      if (nn) {
        dd.expression_s.connect(nn.toDlgt(workspace))
      }
      if ((nn = n.n3)) {
        dd.alias_s.connect(nn.NAME2Dlgt(workspace))
      }
    } else if (n.n_str === 'else') {
      dd = eYo.DelegateSvg.newComplete(workspace, eYo.T3.Stmt.else_part)
    } else if (n.n_str === 'finally') {
      dd = eYo.DelegateSvg.newComplete(workspace, eYo.T3.Stmt.finally_part)
    } else {
      console.error(`Unknown node type: {n.name}`)
      break
    }
    n = n.sibling.sibling
    n.suiteInDlgt(dd)
    dlgt = dlgt.connectBottom(dd)
  }
  return root
}

/**
 * `this` is the with_stmt node.
 * `this.type === eYo.TKN.with_stmt`
 * @param {!Object} a block delegate
 */
eYo.Node.prototype.with_stmt2Dlgt = function (workspace) {
  // 'with' with_item (',' with_item)*  ':' suite
  var root = eYo.DelegateSvg.newComplete(workspace, eYo.T3.Stmt.with_part)
  var with_t = root.with_t
  var n = this.n1
  do {
    // with_item: test ['as' expr]
    var nn = n.n2
    if (nn) {
      var dd = eYo.DelegateSvg.newComplete(workspace, eYo.T3.Expr.identifier)
      dd.alias_s.connect(nn.toDlgt(workspace))
      dd.target_t.connectLast(n.n0.toDlgt(workspace))
    } else {
      dd = n.n0.toDlgt(workspace)
    }
    with_t.connectLast(dd)
  } while ((n = n.sibling) && n.type === eYo.TKN.COMMA && (n = n.sibling))
  // n.type === eYo.TKN.COLON
  n.sibling.suiteInDlgt(root)
  return root
}

/**
 * `this` is the funcdef node.
 * `this.type === eYo.TKN.funcdef`
 * @param {!Object} a block delegate
 */
eYo.Node.prototype.funcdef2Dlgt = function (workspace) {
  // 'def' NAME parameters ['->' test] ':' [TYPE_COMMENT] func_body_suite
  var root = eYo.DelegateSvg.newComplete(workspace, eYo.T3.Stmt.funcdef_part)
  root.name_p = this.n1.n_str
  // parameters: '(' [typedargslist] ')'
  var n = this.n2.n1
  if (n.type !== eYo.TKN.RPAR) {
    n.typedargslistInDlgt(root.parameters_t)
  }
  n = this.n4
  if (this.n3.type === eYo.TKN.RARROW) {
    root.type_s.connect(n.toDlgt(workspace))
    root.variant_p = eYo.Key.TYPE
    n = n.sibling.sibling
  }
  if (n.type === eYo.TKN.TYPE_COMMENT) {
    root.magnets.right.connectSmart(n.typeComment2Dlgt(workspace))
    n = n.sibling
  }
  n.func_body_suiteInDlgt(root)
  return root
}

/**
 * `this` is the classdef node.
 * `this.type === eYo.TKN.classdef`
 * @param {!Object} a block delegate
 */
eYo.Node.prototype.classdef2Dlgt = function (workspace) {
  // 'class' NAME ['(' [arglist] ')'] ':' suite
  var root = eYo.DelegateSvg.newComplete(workspace, eYo.T3.Stmt.classdef_part)
  var n = this.n1
  root.name_p = n.n_str
  n = n.sibling
  if (n.type === eYo.TKN.LPAR) {
    root.variant_p = eYo.Key.N_ARY
    n = n.sibling
    if (n.type !== eYo.TKN.RPAR) {
      n.arglistInDlgt(root.n_ary_t)
      n = n.sibling
    }
    n = n.sibling // skip the ')'
  }
  n.sibling.suiteInDlgt(root)
  return root
}

/**
 * `this` is the decorated node.
 * `this.type === eYo.TKN.decorated`
 * @param {!Object} a block delegate
 */
eYo.Node.prototype.decorated2Dlgt = function (workspace) {
  /*
decorators: decorator+
decorated: decorators (classdef | funcdef | async_funcdef)
*/
  // all the decorators:
  var n = this.n0.n0
  var root = n.decorator2Dlgt(workspace)
  var dlgt = root
  while ((n = n.sibling)) {
    dlgt = dlgt.connectBottom(n.decorator2Dlgt(workspace))
  }
  n = this.n1
  if (n.type === eYo.TKN.classdef) {
    dlgt.connectBottom(n.classdef2Dlgt(workspace))
  } else if (n.type === eYo.TKN.funcdef) {
    dlgt.connectBottom(n.funcdef2Dlgt(workspace))
  } else if (n.type === eYo.TKN.async_funcdef) {
    dlgt.connectBottom(n.n1.funcdef2Dlgt(workspace)).async = true
  } else {
    console.error(`UNEXPECTED node type: ${n.type}`)
  }
  return root
}

/**
 * `this` is the decorator node.
 * `this.type === eYo.TKN.decorator`
 * @param {!Object} a block delegate
 */
eYo.Node.prototype.decorator2Dlgt = function (workspace) {
  // decorator: '@' dotted_name [ '(' [arglist] ')' ] NEWLINE
  var dlgt = eYo.DelegateSvg.newComplete(workspace, eYo.T3.Stmt.decorator_stmt)
  var n = this.n1
  dlgt.name_p = n.n_child.map(child => child.type === eYo.TKN.NAME ? child.n_str : '.').join('')
  n = n.sibling
  if (n.n_type === eYo.TKN.LPAR) {
    dlgt.variant_p = eYo.Key.N_ARY
    n = n.sibling
    if (n.n_type !== eYo.TKN.RPAR) {
      n.arglistInDlgt(dlgt.n_ary_t)
      n = n.sibling
    }
    n = n.sibling
  }
  var comments = n.comments
  if (comments.length) {
    var m4t = dlgt.magnets.footMost
    comments.forEach(n => {
      var m = m4t.connectSmart(n.toDlgt(workspace))
      m && (m = m4t)
    })
  }
  return dlgt
}

/**
 * `this` is the tfpdef2Dlgt node.
 * `this.type === eYo.TKN.tfpdef`
 * @param {!Object} a block delegate
 */
eYo.Node.prototype.tfpdef2Dlgt = function (workspace) {
  /* tfpdef: NAME [':' test] */
  var dlgt = eYo.DelegateSvg.newComplete(workspace, eYo.T3.Expr.identifier)
  var n = this.n0
  dlgt.target_p = n.n_str
  if ((n = this.n2)) {
    dlgt.annotated_s.connect(n.toDlgt(workspace))
    dlgt.variant_p = eYo.Key.ANNOTATED
  }
  return dlgt
}

/**
 * `this` is the first node of a typedargslist.
 * `this.type === eYo.TKN.typedargslist`
 * @param {!eYo.Delegate} dlgt  a block delegate
 */
eYo.Node.prototype.typedargslistInDlgt = function (dlgt) {
  var n = this.n0
  /* typedargslist:
  1) tfpdef ['=' test] (',' tfpdef ['=' test])* [',' [
          '*' [tfpdef] (',' tfpdef ['=' test])* [',' ['**' tfpdef [',']]]
        | '**' tfpdef [',']]]
  2) '*' [tfpdef] (',' tfpdef ['=' test])* [',' ['**' tfpdef [',']]]
  3) '**' tfpdef [',']*/
  // We do not look for consistency here, the consolidator does it for us
  while (n) {
    if (n.type === eYo.TKN.STAR) {
      if ((n = n.sibling)) {
        if (n.type === eYo.TKN.tfpdef) {
          var d = dlgt.connectLast(eYo.T3.Expr.parameter_star)
          d.modified_s.connect(n.tfpdef2Dlgt(dlgt.workspace))
          if (!(n = n.sibling)) {
            return
          }
        } else {
          dlgt.connectLast(eYo.T3.Expr.star)
        }
        // n is the comma
        if ((n = n.sibling)) { // skip the comma
          continue
        }
      } else {
        dlgt.connectLast(eYo.T3.Expr.star)
      }
    } else if (n.type === eYo.TKN.DOUBLESTAR) {
      d = dlgt.connectLast(eYo.T3.Expr.parameter_star_star)
      n = n.sibling
      d.modified_s.connect(n.tfpdef2Dlgt(dlgt.workspace))
      if ((n = n.sibling)) { // comma
        n = n.sibling
        continue
      }
    } else {
      d = dlgt.connectLast(n.tfpdef2Dlgt(dlgt))
      if ((n = n.sibling)) {
        if (n.type === eYo.TKN.EQUAL) {
          d.variant_p = d.variant_p === eYo.Key.ANNOTATED
          ? eYo.Key.ANNOTATED_VALUED
          : eYo.Key.TARGET_VALUED
          n = n.sibling
          d.value_t.connectLast(n.toDlgt(dlgt))
          if (!(n = n.sibling)) {
            return
          }
        }
        n = n.sibling // skip the comma
        continue
      }
    }
    return
  }
}

/**
 * `this` is the first node of a typedargslist.
 * You'd better not call this twice on the same target.
 * @param {!Object} a block delegate
 */
eYo.Node.prototype.knownListInDlgt = function (dlgt, toDlgt) {
  var n = this.n0
  while (true) {
    var d = toDlgt.call(n, dlgt)
    if (!d) {
      console.error('MISSING BLOCK', toDlgt.call(n, dlgt))
    }
    dlgt.connectLast(d)
    if ((n = n.sibling)) {
      if ((n = n.sibling)) {
        continue
      }
      dlgt.orphan_comma_p = true
    } // goddle comma
    break
  }
}

/**
 * `this` is the first node of a typedargslist.
 * @param {!Object} a block delegate
 */
eYo.Node.prototype.do_list = function (dlgt) {
  var n = this.n0
  do {
    var d = n.toDlgt(dlgt)
    if (!d) {
      console.error('MISSING BLOCK', n.toDlgt(dlgt))
    }
    if (!dlgt.connectLast(d)) {
      console.error('NO CONNECTION, BREAK HERE', n.toDlgt(dlgt), dlgt.connectLast(d))
    }
  } while ((n = n.sibling) && (n = n.sibling)) // goddle comma
}

eYo.Node.prototype.exprlistInDlgt =
eYo.Node.prototype.arglistInDlgt =
eYo.Node.prototype.testlistInDlgt =
eYo.Node.prototype.testlist_star_exprInDlgt =
eYo.Node.prototype.subscriptlistInDlgt = eYo.Node.prototype.do_list

/**
 * `this` is binary expression.
 * @param {!eYo.Workspace|eYo.Delegate} owner
 * @param {!String} type
 * @param {!String} op
 */
eYo.Node.prototype.binary2Dlgt = function (owner, type, op) {
  var n0 = this.n0
  var n1
  var root = n0.toDlgt(owner)
  while ((n1 = n0.sibling) && (n0 = n1.sibling)) {
    var dlgt = eYo.DelegateSvg.newComplete(owner, type)
    dlgt.lhs_s.connect(root)
    dlgt.operator_p = (op && op(n1)) || n1.n_str
    dlgt.rhs_s.connect(n0.toDlgt(owner))
    root = dlgt
  }
  return root
}

/**
 * `this` is yield expression.
 * `this.type === eYo.TKN.yield_expr`
 * @param {!Object} owner
 */
eYo.Node.prototype.yield_expr2Dlgt = function (owner) {
  /*yield_expr: 'yield' [yield_arg]
yield_arg: 'from' test | testlist_star_expr */
  var dlgt = eYo.DelegateSvg.newComplete(owner, eYo.T3.Expr.yield_expr)
  this.yield_exprInDlgt(dlgt)
  return dlgt
}

/**
 * `this` is a yield_expr.
 * `this.type === eYo.TKN.yield_expr`
 * @param {!Object} a block delegate
 */
eYo.Node.prototype.yield_exprInDlgt = function (dlgt) {
  var n = this.n1
  if (n) {
    if (n.n1) {
      dlgt.from_s.connect(n.n1.toDlgt(dlgt))
    } else {
      n.n0.testlist_star_exprInDlgt(dlgt.expression_t)
    }
  }
}

/**
 * `this` is a yield_expr.
 * `this.type === eYo.TKN.yield_expr`
 * @param {!Object} dlgt  a delegate
 */
eYo.Node.prototype.yield_exprInListDlgt = function (dlgt) {
  dlgt.connectLast(this.yield_expr2Dlgt(dlgt))
}

/**
 * `this` is the first node of a typedargslist.
 * `this.type === eYo.TKN.varargslist`
 * @param {!Object} a block delegate
 */
eYo.Node.prototype.varargslistInDlgt = function (dlgt) {
/* (vfpdef ['=' test] (',' vfpdef ['=' test])* [',' [
        '*' [vfpdef] (',' vfpdef ['=' test])* [',' ['**' vfpdef [',']]]
      | '**' vfpdef [',']]]
  | '*' [vfpdef] (',' vfpdef ['=' test])* [',' ['**' vfpdef [',']]]
  | '**' vfpdef [',']*/
  // We do not check any consistency here
  var n = this.n0
  while (n) {
    if (n.type === eYo.TKN.STAR) {
      if ((n = n.sibling)) {
        if (n.type !== eYo.TKN.COMMA) {
          var d = dlgt.connectLast(eYo.T3.Expr.parameter_star)
          d.modified_s.connect(n.n0.NAME2Dlgt(dlgt))
          if (!(n = n.sibling)) {
            return
          }
        } else {
          dlgt.connectLast(eYo.T3.Expr.star)
        }
        if ((n = n.sibling)) { // skip the comma
          continue
        }
      } else {
        dlgt.connectLast(eYo.T3.Expr.star)
      }
    } else if (n.type === eYo.TKN.DOUBLESTAR) {
      d = dlgt.connectLast(eYo.T3.Expr.parameter_star_star)
      n = n.sibling
      d.modified_s.connect(n.n0.NAME2Dlgt(dlgt))
      if ((n = n.sibling)) { // comma
        n = n.sibling
        continue
      }
    } else {
      d = dlgt.connectLast(n.n0.NAME2Dlgt(dlgt))
      if ((n = n.sibling)) {
        if (n.type === eYo.TKN.EQUAL) {
          d.variant_p = eYo.Key.TARGET_VALUED
          n = n.sibling
          d.value_t.connectLast(n.toDlgt(dlgt))
          if (!(n = n.sibling)) {
            return
          }
        }
        n = n.sibling // skip the comma
        continue
      }
    }
    break
  }
  return
}

/**
 * `this` is the first node of a typedargslist.
 * `this.type === eYo.TKN.dictorsetmaker`
 * @param {!eYo.Delegate} dlgt  a block delegate
 */
eYo.Node.prototype.dictorsetmakerInDlgt = function (dlgt) {
/*dictorsetmaker: ( ((test ':' test | '**' expr)
    (comp_for | (',' (test ':' test | '**' expr))* [','])) |
  ((test | star_expr)
    (comp_for | (',' (test | star_expr))* [','])) )
    */
  var n = this.n0
  var n1, n2, n3
  if ((n1 = n.sibling)) {
    if (n1.n_type === eYo.TKN.comp_for) {
      // set comprehension
      dlgt.connectLast(this.comprehension2Dlgt(dlgt))
      dlgt.variant_p = eYo.Key.BRACE
      return dlgt
    } else if ((n2 = n1.sibling)) {
      if (n2.n_type === eYo.TKN.comp_for) {
        // set comprehension with '**'
        // this is a syntax error but I still consider it to be valid
        var root = eYo.DelegateSvg.newComplete(dlgt, eYo.T3.Expr.comprehension)
        var dd = eYo.DelegateSvg.newComplete(dlgt, eYo.T3.Expr.expression_star_star)
        root.expression_s.connect(dd)
        dlgt.modified_s.connect(n1.toDlgt(dlgt))
        n2.comprehensionInDlgt(dlgt)
        return dlgt
      } else if ((n3 = n2.sibling)) {
        if (n3.n_type === eYo.TKN.comp_for) {
          // dict comprehension
          dlgt.connectLast(this.dict_comprehension2Dlgt(dlgt))
          return dlgt
        }
      }
    }
  }
  // no comprehension
  while (true) {
    if (n.n_type === eYo.TKN.DOUBLESTAR) {
      var dd = eYo.DelegateSvg.newComplete(dlgt, eYo.T3.Expr.expression_star_star)
      dlgt.connectLast(dd)
      if ((n1 = n.sibling)) {
        dd.modified_s.connect(n1.toDlgt(dlgt))
        if ((n1 = n1.sibling) && (n = n1.sibling)) {
          continue
        }
      }
    } else {
      dd = n.toDlgt(dlgt)
      if ((n1 = n.sibling)) {
        if (n1.n_type === eYo.TKN.COLON) {
          var ddd = eYo.DelegateSvg.newComplete(dlgt, eYo.T3.Expr.key_datum)
          dlgt.connectLast(ddd)
          ddd.target_t.connectLast(dd)
          if ((n2 = n1.sibling)) {
            ddd.annotated_s.connect(n2.toDlgt(dlgt))
            if ((n3 = n2.sibling) && (n = n3.sibling)) {
              continue
            }
          }
        } else {
          dlgt.connectLast(dd)
          if ((n = n1.sibling)) {
            continue
          }
        }
      } else {
        dlgt.connectLast(dd)
      }
    }
    return dlgt
  }
}

/**
 * Partially converts the node `this` to a visual block.
 * `this.n_type === eo.TKN.comp_for`
 * @param {!eYo.Delegate} dlgt a block delegate
 */
eYo.Node.prototype.comprehensionInDlgt = function (dlgt) {
  this.comp_forInDlgt(dlgt)
  var for_if_t = dlgt.for_if_t
  var d = dlgt
  var dd
  while ((dd = d.comp_iter)) {
    d.comp_iter = undefined
    for_if_t.connectLast((d = dd))
  }
}

/**
 * Converts the node `this` to a visual block.
 * @param {!Object} workspace  a workspace
 */
eYo.Node.prototype.comprehension2Dlgt = function (owner) {
  var dlgt = eYo.DelegateSvg.newComplete(owner, eYo.T3.Expr.comprehension)
  dlgt.expression_s.connect(this.n0.toDlgt(owner))
  this.n1.comprehensionInDlgt(dlgt)
  return dlgt
}

/**
 * Converts the node `this` to a visual block.
 * `this.type === eYo.TKN.dictorsetaker`
 * @param {!Object} a block delegate
 */
eYo.Node.prototype.dict_comprehension2Dlgt = function (owner) {
  /*dictorsetmaker: (test ':' test | '**' expr) comp_for
    */
  var dlgt = eYo.DelegateSvg.newComplete(owner, eYo.T3.Expr.dict_comprehension)
  var dd = eYo.DelegateSvg.newComplete(owner, eYo.T3.Expr.key_datum)
  dd.target_t.connectLast(this.n0.toDlgt(owner))
  dd.annotated_s.connect(this.n2.toDlgt(owner))
  dlgt.expression_s.connect(dd)
  this.n3.comp_forInDlgt(dlgt)
  var t = dlgt.for_if_t
  var d0 = dlgt
  var d1
  while ((d1 = d0.comp_iter)) {
    d0.comp_iter = undefined
    t.connectLast((d0 = d1))
  }
  return dlgt
}

/**
 * Converts the node `n` to a visual block.
 * `this.type === eYo.TKN.testlist_comp`
 * @param {!Object} a block delegate
 */
eYo.Node.prototype.testlist_compInDlgt = function (dlgt) {
  // (namedexpr_test|star_expr) ( comp_for | (',' (namedexpr_test|star_expr))* [','] )
  var n = this.n1
  if (n && n.n_type === eYo.TKN.comp_for) {
    dlgt.connectLast(this.comprehension2Dlgt(dlgt))
  } else {
    this.testlistInDlgt(dlgt)
  }
}

/**
 * Converts the node `n` to a visual block.
 * @param {!Object} workspace A workspace.
 * @param {!Object} a block or an array of blocks
 */
eYo.Node.prototype.toDlgt = function (workspace) {
  var root = this.toDlgt_(workspace)
  if (this.comments) {
    var ds = this.comments.map(n => n.comment2Dlgt(workspace))
    if (root) {
      if (this.type === eYo.TKN.file_input) {
        ds.reverse().forEach(d => {
          if (d) {
            root.head = d
            root = d
          }
        })
      } else if (root.isBlank) {
        // connect all the blocks below root.
        var dd = root
        ds.forEach(d => {
          if (d) {
            dd.foot = d
            dd = d
          }
        })
      } else if (root.isStmt) {
        // connect the first comment as right statement
        // and connect the others later because we do not know yet where.
        // It may be to the next connector, or the left next one...
        if ((dd = ds.shift())) {
          root.right = dd
          root.pendingComments = ds
        }
      } else {
        root.commentBlocks = ds
      }
    } else if ((root = ds.shift())) {
      var dd = root
      ds.forEach(dd => {
        if (dd) {
          dd.foot = dd
          dd = dd
        }
      })
    }
  } else if (!root) {
    if (this.type === eYo.TKN.file_input) {
      root = eYo.DelegateSvg.newComplete(workspace, eYo.T3.Stmt.blank_stmt)
    } else {
      console.error('BREAK HERE', this.toDlgt_(workspace))
    }
  }
  return root
}

/**
 * Converts the node `n` to a visual block.
 * @param {!Object} workspace A workspace.
 * @param {!Object} a block or an array of blocks
 */
eYo.Node.prototype.toDlgt_ = function (workspace) {
  // console.log(`node type: ${this.name}`)
  var root, d, d0, d1, d2, n, n0, n1, n2, i, s, t, m4t
  switch (this.n_type) {
    case eYo.TKN.file_input: // (NEWLINE | stmt)* ENDMARKER
      var bs = this.n_child.map(n => n.toDlgt(workspace))
      if ((root = bs.shift())) {
        m4t = root.magnets.footMost
        bs.forEach(dd => {
          var m = m4t.connectSmart(dd)
          m && (m4t = m)
        })
      }
      return root
    case eYo.TKN.simple_stmt:
      return this.simple_stmt2Dlgt(workspace)
    case eYo.TKN.expr_stmt: // testlist_star_expr (annassign | augassign (yield_expr|testlist) | [('=' (yield_expr|testlist_star_expr))+ [TYPE_COMMENT]] )
      n0 = this.n0
      if (!(n1 = n0.sibling)) {
        // simple expression statement: only a testlist_star_expr
        root = eYo.DelegateSvg.newComplete(workspace, eYo.T3.Stmt.expression_stmt)
        n0.testlist_star_exprInDlgt(root.value_t)
        // manage comments

        return root
      }
      if (n1.n_type === eYo.TKN.EQUAL) {
        // assignment,
        root = d1 = eYo.DelegateSvg.newComplete(workspace, eYo.T3.Stmt.assignment_stmt)
        while (true) {
          // targets
          (n0.type === eYo.TKN.yield_expr ? n0.yield_exprInListDlgt : n0.testlist_star_exprInDlgt).call(n0, d1.target_t) // .call is necessary !
          // values
          n0 = n1.sibling
          if ((n1 = n0.sibling)) {
            if (n1.n_type === eYo.TKN.EQUAL) {
              d2 = eYo.DelegateSvg.newComplete(workspace, eYo.T3.Expr.assignment_chain)
              if ((d = d1.value_t)) {
                d.connectLast(d2)
                d1.variant_p = eYo.Key.TARGET_VALUED // necessary ?
              } else {
                console.error('ERROR')
              }
              d1 = d2
              continue
            } else {
              root.type_comment_node = n1
            }
          }
          (n0.type === eYo.TKN.yield_expr
            ? n0.yield_exprInListDlgt
            : n0.testlist_star_exprInDlgt).call(n0, d1.value_t)
          break
        }
      } else if (n1.type === eYo.TKN.augassign) { // augassign: ('+=' | '-=' | '*=' | '@=' | '/=' | '%=' | '&=' | '|=' | '^=' | '<<=' | '>>=' | '**=' | '//=')
        root = eYo.DelegateSvg.newComplete(workspace, {
          type: eYo.T3.Stmt.augmented_assignment_stmt,
          operator_p: n1.n0.n_str
        })
        n0.testlist_star_exprInDlgt(root.target_t)
        n2 = n1.sibling
        ;(n2.type === eYo.TKN.yield_expr
            ? n2.yield_exprInListDlgt
            : n2.testlistInDlgt).call(n2, root.value_t)
      } else if (n1.type === eYo.TKN.annassign) { // ':' test ['=' (yield_expr|testlist)]
        if ((s = n1.n3)) {
          root = eYo.DelegateSvg.newComplete(workspace, eYo.T3.Stmt.annotated_assignment_stmt)
          n0.testlist_star_exprInDlgt(root.target_t)
          d1 = n1.n1.toDlgt(workspace)
          root.annotated_s.connect(d1)
          ;(s.type === eYo.TKN.yield_expr
            ? s.yield_exprInListDlgt
            : s.testlistInDlgt).call(s, root.value_t)
        } else {
          root = eYo.DelegateSvg.newComplete(workspace, eYo.T3.Stmt.annotated_stmt)
          n0.testlist_star_exprInDlgt(root.target_t)
          d1 = n1.n1.toDlgt(workspace)
          if (d1.toString === 'str') {
            console.error('STOP HERE')
          }
          root.annotated_s.connect(d1)
        }
      }
      return root
    case eYo.TKN.atom_expr: // ['await'] atom trailer*
      i = 0
      n0 = this.n0
      if (n0.n_type === eYo.TKN.NAME && n0.n_str === 'await') {
        n1 = this.n1
        root = n1.toDlgt(workspace)
        root.await = true
        n0 = n1
      } else {
        root = n0.toDlgt(workspace)
      }
      d0 = root
      // root is an atom
      // trailers ?
      while ((n0 = n0.sibling)) {
        // n0 is a trailer: '(' [arglist] ')' | '[' subscriptlist ']' | '.' NAME
        if (n0.n0.n_type === eYo.TKN.LPAR) {
          d = d0.n_ary_t
          if (d && d0.variant_p === eYo.Key.NONE) {
            d0.variant_p = eYo.Key.CALL_EXPR
          } else {
            root = eYo.DelegateSvg.newComplete(workspace, eYo.T3.Expr.call_expr)
            root.target_t.connectLast(d0)
            d0 = root
            d = d0.n_ary_t
          }
          n1 = n0.n1
          if (n1.n_type !== eYo.TKN.RPAR) {
            n1.arglistInDlgt(dlgt)
          }
        } else if (n0.n0.n_type === eYo.TKN.LSQB) {
          d = d0.slicing_t
          if (d && d0.variant_p === eYo.Key.NONE) {
            d0.variant_p = eYo.Key.SLICING
          } else {
            root = eYo.DelegateSvg.newComplete(workspace, eYo.T3.Expr.slicing)
            root.target_t.connectLast(d0)
            d0 = root
            d = d0.slicing_t
          }
          n1 = n0.n1
          if (n1.n_type !== eYo.TKN.RSQB) {
            n1.subscriptlistInDlgt(dlgt)
          }
        } else /* if (n0.n0.n_type === eYo.TKN.DOT) */ {
          if (!d0.dotted_d || d0.variant_p !== eYo.Key.NONE || d0.dotted_p !== 0) {
            root = n0.n1.NAME2Dlgt(workspace)
            root.holder_s.connect(d0)
            d0 = root
            d0.dotted_p = 1
          } else {
            d0.changeWrap(() => {
              if ((d = d0.target_s.unwrappedTarget)) {
                d0.holder_s.connect(d)
              } else {
                d0.holder_p = d0.target_p
                d0.target_p = ''
              }
              d0.dotted_p = 1
              d0.target_t.connectLast(n0.n1.NAME2Dlgt(workspace))
            })
          }
        }
      }
      return root
    case eYo.TKN.subscript: // test | [test] ':' [test] [sliceop] // sliceop: ':' [test]
      n0 = this.n0
      if (n0.type === eYo.TKN.test) {
        d0 = n0.toDlgt(workspace)
        if (!(n0 = n0.sibling)) {
          return d0
        }
      }
      root = eYo.DelegateSvg.newComplete(workspace, eYo.T3.Expr.proper_slice)
      d0 && root.lower_bound_s.connect(d0)
      // n0.type === eYo.TKN.COLON
      if ((n0 = n0.sibling)) {
        if (n0.type === eYo.TKN.test) {
          root.upper_bound_s.connect(n0.toDlgt(workspace))
          if (!(n0 = n0.sibling)) {
            return root
          }
        }
        root.variant_p = eYo.Key.STRIDE
        n0.n1 && root.stride_s.connect(n0.n1.toDlgt(workspace))
      }
      return root
    case eYo.TKN.atom: //atom: ('(' [yield_expr|testlist_comp] ')' | '[' [testlist_comp] ']' | '{' [dictorsetmaker] '}') | NAME | NUMBER | STRING+ | '...' | 'None' | 'True' | 'False')
      n0 = this.n0
      if (n0.type === eYo.TKN.STRING) {
        var s = n0.n_str
        while ((n0 = n0.sibling)) {
          s += n0.n_str
        }
        return eYo.DelegateSvg.newComplete(workspace, s) // THIS IS NOT COMPLETE
      }
      if ((n1 = n0.sibling)) {
        root = eYo.DelegateSvg.newComplete(workspace, eYo.T3.Expr.enclosure)
        switch(n0.n_str) {
          case '(':
            t = eYo.Key.PAR
            s = n1.type === eYo.TKN.yield_expr
            ? n1.yield_exprInListDlgt
            : n1.type === eYo.TKN.testlist_comp
              ? n1.testlist_compInDlgt
              : null
            break
          case '[':
            t = eYo.Key.SQB
            s = n1.type === eYo.TKN.testlist_comp
            ? n1.testlist_compInDlgt
            : null
            break
          case '{':
            t = eYo.Key.BRACE
            s = n1.type === eYo.TKN.dictorsetmaker
            ? n1.dictorsetmakerInDlgt
            : null
            break
        }
        root.variant_p = t
        s && s.call(n1, root)
        return root
      } else if (['...', 'None', 'True', 'False'].indexOf((s = n0.n_str)) < 0) {
        if (n0.type === eYo.TKN.NAME) {
          return n0.NAME2Dlgt(workspace)
        } else if (n0.type === eYo.TKN.NUMBER) {
          return eYo.DelegateSvg.newComplete(workspace, {
            type: eYo.T3.Expr.numberliteral,
            value_p: s
          })
        } else /* STRING+ */ {
          d0 = root = eYo.DelegateSvg.newComplete(workspace, {
            type: s.endsWith('"""') || s.endsWith("'''") ? eYo.T3.Expr.longliteral : eYo.T3.Expr.shortliteral,
            value_p: s
          })
          while ((n0 = n0.sibling)) {
            d0 = d0.next_string_block = eYo.DelegateSvg.newComplete(workspace, {
              type: s.endsWith('"""') || s.endsWith("'''") ? eYo.T3.Expr.longliteral : eYo.T3.Expr.shortliteral,
              value_p: n0.n_str
            })
          }
        }
        return root
      } else {
        return eYo.DelegateSvg.newComplete(workspace, {
          type: eYo.T3.Expr.builtin__object,
          value_p: s
        })
      }
    case eYo.TKN.star_expr: // star_expr: '*' expr
      root = eYo.DelegateSvg.newComplete(workspace, eYo.T3.Expr.expression_star)
      root.modified_s.connect(this.n1.toDlgt(workspace))
    return root
    /*
term: factor (('*'|'@'|'/'|'%'|'//') factor)*
factor: ('+'|'-'|'~') factor | power
*/
    case eYo.TKN.xor_expr: // and_expr ('^' and_expr)*
    case eYo.TKN.and_expr: // shift_expr ('&' shift_expr)*
    case eYo.TKN.shift_expr: // arith_expr (('<<'|'>>') arith_expr)*
    case eYo.TKN.arith_expr: // term (('+'|'-') term)*
    case eYo.TKN.term: // factor (('*'|'@'|'/'|'%'|'//') factor)*
    case eYo.TKN.expr: // xor_expr ('|' xor_expr)*
      n0 = this.n0
      root = n0.toDlgt(workspace)
      while ((n1 = n0.sibling) && (n2 = n1.sibling)) {
        d0 = eYo.DelegateSvg.newComplete(workspace, eYo.T3.Expr.m_expr)
        d0.operator_p = n1.n_str
        d0.lhs_s.connect(root)
        root = d0
        d0.rhs_s.connect(n2.toDlgt(workspace))
        n0 = n2
      }
      return root
    case eYo.TKN.factor: // ('+'|'-'|'~') factor | power
      if ((n1 = this.n1)) {
        root = eYo.DelegateSvg.newComplete(workspace, eYo.T3.Expr.unary)
        root.operator_p = this.n0.n_str
        root.rhs_s.connect(n1.toDlgt(workspace))
      } else {
        return this.n0.toDlgt(workspace)
      }
      return root
    case eYo.TKN.power: // atom_expr ['**' factor]
      d0 = this.n0.toDlgt(workspace)
      if (d0.type === eYo.T3.Stmt.comment_stmt) {
        console.error("BREAK HERE", d0 = this.n0.toDlgt(workspace))
      }
      if ((n2 = this.n2)) {
        root = eYo.DelegateSvg.newComplete(workspace, eYo.T3.Expr.power)
        root.lhs_s.connect(d0)
        root.rhs_s.connect(n2.toDlgt(workspace))
        return root
      } else {
        return d0
      }
    case eYo.TKN.argument: /*argument: ( test [comp_for] |
      test ':=' test |
      test '=' test |
      '**' test |
      '*' test )*/
      n0 = this.n0
      if (n0.n_type === eYo.TKN.STAR) {
        root = eYo.DelegateSvg.newComplete(workspace, eYo.T3.Expr.expression_star)
        root.modified_s.connect(n0.sibling.toDlgt(workspace))
      } else if (n0.n_type === eYo.TKN.DOUBLESTAR) {
        root = eYo.DelegateSvg.newComplete(workspace, eYo.T3.Expr.expression_star_star)
        root.modified_s.connect(n0.sibling.toDlgt(workspace))
      } else if ((n1 = n0.sibling)) {
        if (n1.n_type === eYo.TKN.COLONEQUAL) {
          root = eYo.DelegateSvg.newComplete(workspace, eYo.T3.Expr.named_expr)
          root.target_t.connectLast(n0.toDlgt(workspace))
          root.value_t.connectLast(n1.sibling.toDlgt(workspace))
        } else if (n1.n_type === eYo.TKN.EQUAL) {
          root = eYo.DelegateSvg.newComplete(workspace, eYo.T3.Expr.identifier_valued)
          root.target_t.connectLast(n0.toDlgt(workspace))
          root.value_t.connectLast(n1.sibling.toDlgt(workspace))
        } else {
          root = this.comprehension2Dlgt(workspace)
        }
      } else {
        root = n0.toDlgt(workspace)
      }
      return root
    case eYo.TKN.NAME: // test [':=' test]
      return this.NAME2Dlgt(workspace)
    case eYo.TKN.namedexpr_test: // test [':=' test]
      d0 = this.n0.toDlgt(workspace)
      if ((n2 = this.n2)) {
        root = eYo.DelegateSvg.newComplete(workspace, eYo.T3.Expr.named_expr)
        root.target_t.connectLast(d0)
        root.value_t.connectLast(n2.toDlgt(workspace))
      } else {
        root = d0
      }
      return root
    case eYo.TKN.lambdef: // 'lambda' [varargslist] ':' test
      root = eYo.DelegateSvg.newComplete(workspace, eYo.T3.Expr.lambda_expr)
      n = this.n
      if (n.type !== eYo.TKN.COLON) {
        n.varargslistInDlgt(root.parameters_t)
        n = n.sibling
      }
      n = n.sibling
      root.expression_s.connect(n.toDlgt(workspace))
      return root
    case eYo.TKN.lambdef_nocond: // 'lambda' [varargslist] ':' test_nocond
      root = eYo.DelegateSvg.newComplete(workspace, eYo.T3.Expr.lambda_expr_nocond)
      n = this.n
      if (n.type !== eYo.TKN.COLON) {
        n.varargslistInDlgt(root.parameters_t)
        n = n.sibling
      }
      n = n.sibling
      root.expression_s.connect(n.toDlgt(workspace))
      return root
    case eYo.TKN.async_funcdef: // 'async' funcdef
      root = this.n1.funcdef2Dlgt(workspace)
      root.async = true
      return root
    case eYo.TKN.pass_stmt: // 'pass'
      return eYo.DelegateSvg.newComplete(workspace, eYo.T3.Stmt.pass_stmt)
    case eYo.TKN.break_stmt: // 'break'
      return eYo.DelegateSvg.newComplete(workspace, eYo.T3.Stmt.break_stmt)
    case eYo.TKN.continue_stmt: // 'continue'
      return eYo.DelegateSvg.newComplete(workspace, eYo.T3.Stmt.continue_stmt)
    case eYo.TKN.compound_stmt: //
      /* compound_stmt: if_stmt | while_stmt | for_stmt | try_stmt | with_stmt | funcdef | classdef | decorated | async_stmt */
      n = this.n0
      switch(n.type) {
        case eYo.TKN.if_stmt: return n.if_stmt2Dlgt(workspace)
        case eYo.TKN.while_stmt: return n.while_stmt2Dlgt(workspace)
        case eYo.TKN.for_stmt: return n.for_stmt2Dlgt(workspace)
        case eYo.TKN.try_stmt: return n.try_stmt2Dlgt(workspace)
        case eYo.TKN.with_stmt: return n.with_stmt2Dlgt(workspace)
        case eYo.TKN.funcdef: return n.funcdef2Dlgt(workspace)
        case eYo.TKN.classdef: return n.classdef2Dlgt(workspace)
        case eYo.TKN.decorated: return n.decorated2Dlgt(workspace)
        case eYo.TKN.async_stmt:
          // async_stmt: 'async' (funcdef | with_stmt | for_stmt)
          n = n.n1
          switch(n.type) {
            case eYo.TKN.funcdef: root = n.funcdef2Dlgt(workspace); break
            case eYo.TKN.with_stmt: root = n.with_stmt2Dlgt(workspace); break
            case eYo.TKN.for_stmt: root = n.for_stmt2Dlgt(workspace); break
          }
          root.async = true
          return root
        default: console.error("BREAK HERE, UNEXPECTED NAME", n.name)
        throw 'ERROR'
      }
    case eYo.TKN.yield_expr:
      return this.yield_expr2Dlgt(workspace)
    case eYo.TKN.yield_stmt:
      root = eYo.DelegateSvg.newComplete(workspace, eYo.T3.Stmt.yield_stmt)
      this.n0.yield_exprInDlgt(root)
      return root
    case eYo.TKN.break_stmt:
      return eYo.DelegateSvg.newComplete(workspace, eYo.T3.Stmt.break_stmt)
    case eYo.TKN.continue_stmt:
      return eYo.DelegateSvg.newComplete(workspace, eYo.T3.Stmt.continue_stmt)
    case eYo.TKN.pass_stmt:
      return eYo.DelegateSvg.newComplete(workspace, eYo.T3.Stmt.pass_stmt)
    case eYo.TKN.return_stmt: // 'return' [testlist_star_expr]
      root = eYo.DelegateSvg.newComplete(workspace, eYo.T3.Stmt.return_stmt)
      (n = this.n1) && n.testlist_star_exprInDlgt(root.return_t)
      return root
    case eYo.TKN.import_stmt: // import_stmt: import_name | import_from
      n0 = this.n0
      if (n0.type === eYo.TKN.import_name) {
        //import_name: 'import' dotted_as_names
        root = eYo.DelegateSvg.newComplete(workspace, eYo.T3.Stmt.import_stmt)
        var t = root.import_module_t
        n0.n1.knownListInDlgt(t, function () {
          // dotted_as_name: dotted_name ['as' NAME]
          // dotted_name: NAME ('.' NAME)*
          if ((n2 = this.n2)) {
            var ddd = eYo.DelegateSvg.newComplete(workspace, eYo.T3.Expr.identifier_as)
            dlgt.alias_p = n2.n_str
          } else {
            ddd = eYo.DelegateSvg.newComplete(workspace, eYo.T3.Expr.identifier)
          }
          var s = this.n0.n_child.map(child => child.type === eYo.TKN.NAME ? child.n_str : '.').join('')
          dlgt.target_p = s
          return ddd
        })
        return root
      } else {
      /*
      ('from' (('.' | '...')* dotted_name | ('.' | '...')+)
                'import' ('*' | '(' import_as_names ')' | import_as_names))
        import_as_name: NAME ['as' NAME]*/
        root = eYo.DelegateSvg.newComplete(workspace, eYo.T3.Stmt.import_stmt)
        s = ''
        n = n0.n1
        do {
          if (n.type === eYo.TKN.dotted_name) {
            s += n.n_child.map(child => child.type === eYo.TKN.NAME ? child.n_str : '.').join('')
            root.from_p = s
            s = ''
          } else if (n.type === eYo.TKN.DOT) {
            s += '.'
          } else if (n.type === eYo.TKN.ELLIPSIS) {
            s += '...'
          } else if (n.n_str.length === 6) {
            // found the 'import'
            if (s.length) {
              root.from_p = s
            }
            break
          }
        } while ((n = n.sibling))
        n = n.sibling
        if (n.type === eYo.TKN.STAR) {
          root.star_p = true
        } else {
          var t = root.import_t
          if (n.type === eYo.TKN.LPAR) {
            n = n.sibling
            root.import_t.parenth_p = true
          }
          n.knownListInDlgt(t, function () {
            // import_as_name: NAME ['as' NAME]
            var n = this.n2
            if (n) {
              var ddd = eYo.DelegateSvg.newComplete(workspace, eYo.T3.Expr.identifier_as)
              dlgt.alias_p = n.n_str
            } else {
              ddd = eYo.DelegateSvg.newComplete(workspace, eYo.T3.Expr.identifier)
            }
            dlgt.target_p = this.n0.n_str
            return ddd
          })
        }
        return root
      }
    case eYo.TKN.raise_stmt: // raise_stmt: 'raise' [test ['from' test]]
      root = eYo.DelegateSvg.newComplete(workspace, eYo.T3.Stmt.raise_stmt)
      if ((n = this.n0.sibling)) {
        root.expression_s.connect(n.toDlgt(workspace))
        root.variant_p = eYo.Key.EXPRESSION
        if ((n = n.sibling) && (n = n.sibling)) {
          root.from_s.connect(n.toDlgt(workspace))
          root.variant_p = eYo.Key.FROM
        }
      }
      return root
    case eYo.TKN.or_test: // or_test: and_test ('or' and_test)*
      return this.binary2Dlgt(workspace, eYo.T3.Expr.or_test)
    case eYo.TKN.and_test: // and_expr: shift_expr ('&' shift_expr)*
      return this.binary2Dlgt(workspace, eYo.T3.Expr.and_test)
    case eYo.TKN.xor_expr: // xor_expr: and_expr ('^' and_expr)*
      return this.binary2Dlgt(workspace, eYo.T3.Expr.xor_expr)
    case eYo.TKN.and_expr:
      return this.binary2Dlgt(workspace, eYo.T3.Expr.and_expr)
    case eYo.TKN.shift_expr: // shift_expr: arith_expr (('<<'|'>>') arith_expr)*
      return this.binary2Dlgt(workspace, eYo.T3.Expr.shift_expr)
    case eYo.TKN.arith_expr: // arith_expr: term (('+'|'-') term)*
      return this.binary2Dlgt(workspace, eYo.T3.Expr.a_expr)
    case eYo.TKN.term: // term: factor (('*'|'@'|'/'|'%'|'//') factor)*
      return this.binary2Dlgt(workspace, eYo.T3.Expr.m_expr)
    case eYo.TKN.comparison: // expr (comp_op expr)*
      return this.binary2Dlgt(workspace, eYo.T3.Expr.comparison, n => n.n0.n_str)
    case eYo.TKN.namedexpr_test:
      return this.namedexpr_test2Dlgt(workspace)
    case eYo.TKN.global_stmt:
      // global_stmt: 'global' NAME (',' NAME)*
      root = eYo.DelegateSvg.newComplete(workspace, eYo.T3.Stmt.global_stmt)
      t = root.identifiers_t
      n = this.n1
      do {
        t.connectLast(n.toDlgt(workspace))
      } while ((n = n.sibling) && (n = n.sibling))
      return root
    case eYo.TKN.nonlocal_stmt:
      // nonlocal_stmt: 'nonlocal' NAME (',' NAME)*
      root = eYo.DelegateSvg.newComplete(workspace, eYo.T3.Stmt.nonlocal_stmt)
      t = root.identifiers_t
      n = this.n1
      do {
        t.connectLast(n.toDlgt(workspace))
      } while ((n = n.sibling) && (n = n.sibling))
      return root
    case eYo.TKN.NEWLINE:
      return eYo.DelegateSvg.newComplete(workspace, eYo.T3.Stmt.blank_stmt)
    case eYo.TKN.ENDMARKER:
      return  null
    // case eYo.TKN.NUMBER: break
    // case eYo.TKN.STRING: break
    // case eYo.TKN.INDENT: break
    // case eYo.TKN.DEDENT: break
    // case eYo.TKN.LPAR: break
    // case eYo.TKN.RPAR: break
    // case eYo.TKN.LSQB: break
    // case eYo.TKN.RSQB: break
    // case eYo.TKN.COLON: break
    // case eYo.TKN.COMMA: break
    // case eYo.TKN.SEMI: break
    // case eYo.TKN.PLUS: break
    // case eYo.TKN.MINUS: break
    // case eYo.TKN.STAR: break
    // case eYo.TKN.SLASH: break
    // case eYo.TKN.VBAR: break
    // case eYo.TKN.AMPER: break
    // case eYo.TKN.LESS: break
    // case eYo.TKN.GREATER: break
    // case eYo.TKN.EQUAL: break
    // case eYo.TKN.DOT: break
    // case eYo.TKN.PERCENT: break
    // case eYo.TKN.LBRACE: break
    // case eYo.TKN.RBRACE: break
    // case eYo.TKN.EQEQUAL: break
    // case eYo.TKN.NOTEQUAL: break
    // case eYo.TKN.LESSEQUAL: break
    // case eYo.TKN.GREATEREQUAL: break
    // case eYo.TKN.TILDE: break
    // case eYo.TKN.CIRCUMFLEX: break
    // case eYo.TKN.LEFTSHIFT: break
    // case eYo.TKN.RIGHTSHIFT: break
    // case eYo.TKN.DOUBLESTAR: break
    // case eYo.TKN.PLUSEQUAL: break
    // case eYo.TKN.MINEQUAL: break
    // case eYo.TKN.STAREQUAL: break
    // case eYo.TKN.SLASHEQUAL: break
    // case eYo.TKN.PERCENTEQUAL: break
    // case eYo.TKN.AMPEREQUAL: break
    // case eYo.TKN.VBAREQUAL: break
    // case eYo.TKN.CIRCUMFLEXEQUAL: break
    // case eYo.TKN.LEFTSHIFTEQUAL: break
    // case eYo.TKN.RIGHTSHIFTEQUAL: break
    // case eYo.TKN.DOUBLESTAREQUAL: break
    // case eYo.TKN.DOUBLESLASH: break
    // case eYo.TKN.DOUBLESLASHEQUAL: break
    // case eYo.TKN.AT: break
    // case eYo.TKN.ATEQUAL: break
    // case eYo.TKN.RARROW: break
    // case eYo.TKN.ELLIPSIS: break
    // case eYo.TKN.COLONEQUAL: break
    // case eYo.TKN.OP: break
    // case eYo.TKN.TYPE_IGNORE: break
    // case eYo.TKN.TYPE_COMMENT: break
    // case eYo.TKN.ERRORTOKEN: break
    // case eYo.TKN.N_TOKENS: break
    // case eYo.TKN.single_input: break
    // // case eYo.TKN.file_input: break
    // case eYo.TKN.eval_input: break
    // case eYo.TKN.decorator: break
    // case eYo.TKN.decorators: break
    // case eYo.TKN.decorated: break
    // case eYo.TKN.async_funcdef: break
    // case eYo.TKN.funcdef: break
    // case eYo.TKN.parameters: break
    // case eYo.TKN.typedargslist: break
    // case eYo.TKN.tfpdef: break
    // case eYo.TKN.varargslist: break
    // case eYo.TKN.vfpdef: break
    // case eYo.TKN.stmt: break
    // case eYo.TKN.simple_stmt: break
    // case eYo.TKN.small_stmt: break
    // case eYo.TKN.expr_stmt: break
    // case eYo.TKN.annassign: break
    // case eYo.TKN.testlist_star_expr: break
    // case eYo.TKN.augassign: break
    // case eYo.TKN.del_stmt: break
    // case eYo.TKN.pass_stmt: break
    // case eYo.TKN.flow_stmt: break
    // case eYo.TKN.break_stmt: break
    // case eYo.TKN.continue_stmt: break
    // case eYo.TKN.return_stmt: break
    // case eYo.TKN.yield_stmt: break
    // case eYo.TKN.import_name: break
    // case eYo.TKN.import_from: break
    // case eYo.TKN.import_as_name: break
    // case eYo.TKN.dotted_as_name: break
    // case eYo.TKN.import_as_names: break
    // case eYo.TKN.dotted_as_names: break
    // case eYo.TKN.dotted_name: break
    // case eYo.TKN.assert_stmt: break
    // case eYo.TKN.compound_stmt: break
    // case eYo.TKN.async_stmt: break
    // case eYo.TKN.if_stmt: break
    // case eYo.TKN.while_stmt: break
    // case eYo.TKN.for_stmt: break
    // case eYo.TKN.try_stmt: break
    // case eYo.TKN.with_stmt: break
    // case eYo.TKN.with_item: break
    // case eYo.TKN.except_clause: break
    // case eYo.TKN.suite: break
    // case eYo.TKN.test: break
    // case eYo.TKN.test_nocond: break
    // case eYo.TKN.lambdef: break
    // case eYo.TKN.lambdef_nocond: break
    // case eYo.TKN.not_test: break
    // case eYo.TKN.comp_op: break
    // case eYo.TKN.star_expr: break
    // case eYo.TKN.expr: break
    // case eYo.TKN.factor: break
    // case eYo.TKN.power: break
    // case eYo.TKN.atom_expr: break
    // case eYo.TKN.testlist: break
    // case eYo.TKN.trailer: break
    // case eYo.TKN.subscriptlist: break
    // case eYo.TKN.subscript: break
    // case eYo.TKN.sliceop: break
    // case eYo.TKN.exprlist: break
    // case eYo.TKN.dictorsetmaker: break
    // case eYo.TKN.classdef: break
    // case eYo.TKN.arglist: break
    // case eYo.TKN.argument: break
    // case eYo.TKN.comp_iter: break
    // case eYo.TKN.sync_comp_for: break
    // case eYo.TKN.comp_for: break
    // case eYo.TKN.comp_if: break
    // case eYo.TKN.encoding_decl: break
    // case eYo.TKN.yield_expr: break
    // case eYo.TKN.yield_arg: break
    // case eYo.TKN.func_body_suite: break
    // case eYo.TKN.func_type_input: break
    // case eYo.TKN.func_type: break
    // case eYo.TKN.typelist: break
    default:
      if (!this.n0) {
        throw `2) NOTHING TO DO WITH ${this.name}`
      } else if (!this.n1) {
        // console.log(`PASSED ${this.name} to ${this.n0.name}`, )
        return this.n0.toDlgt(workspace)
      } else {
        // eYo.GMR.showtree(eYo.GMR._PyParser_Grammar, this)
        console.error('BREAK HERE TO DEBUG', this.name, this.n_child)
        throw `3) NOTHING TO DO WITH ${this.name}`
      }
  }
}
