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
eYo.Node.prototype.suite2Dlgt = function (t_eyo) {
  // simple_stmt | NEWLINE INDENT stmt+ DEDENT
  var n = this.n0
  // suite: simple_stmt | NEWLINE INDENT stmt+ DEDENT
  if (n.n_type === eYo.TKN.NEWLINE) {
    var c8n = t_eyo.suiteStmtConnection
    n = n.sibling.sibling // skip NEWLINE INDENT
    do {
      var b = n.toBlock(t_eyo.workspace)
      c8n && c8n.connect(b.previousConnection)
      c8n = b.eyo.bottomMostConnection
    } while ((n = n.sibling) && n.n_type !== eYo.TKN.DEDENT)
  } else {
    b = n.simple_stmt2Block(t_eyo.workspace)
    c8n = t_eyo.rightStmtConnection
    c8n && c8n.connect(b.eyo.leftStmtConnection) // what if we cannot connect?
  }
}

/**
 * `this` is the function body node.
 * `this.type === eYo.TKN.func_body_suite`.
 * @param {!Object} a block delegate
 */
eYo.Node.prototype.func_body_suite2Dlgt = function (t_eyo) {
  var n = this.n0
  // func_body_suite: simple_stmt | NEWLINE [TYPE_COMMENT NEWLINE] INDENT stmt+ DEDENT
  if (n.n_type === eYo.TKN.NEWLINE) {
    var c8n = t_eyo.suiteStmtConnection
    n = n.sibling // skip NEWLINE
    if (n.n_type === eYo.TKN.TYPE_COMMENT) {
      var b = n.typeComment2Block(workpace)
      c8n && c8n.connect(b.eyo.previousConnection)
      c8n = b.eyo.bottomMostConnection
      n = n.sibling.sibling // skip NEWLINE
    }
    n = n.sibling // skip INDENT
    do {
      b = n.toBlock(t_eyo.workspace)
      c8n && c8n.connect(b.previousConnection)
      c8n = b.eyo.bottomMostConnection
    } while ((n = n.sibling) && n.n_type !== eYo.TKN.DEDENT)
  } else {
    b = n.toBlock(t_eyo.workspace)
    t_eyo.rightStmtConnection.connect(b.eyo.leftStmtConnection)
  }
}

/**
 * `this` is the comment node.
 * `this.type === eYo.TKN.COMMENT`
 * @param {!Object} a block delegate
 */
eYo.Node.prototype.comment2Block = function (workspace) {
  var b = eYo.DelegateSvg.newBlockComplete(workspace, eYo.T3.Stmt.comment_stmt)
  b.eyo.comment_p = this.n_comment
  return b
}

/**
 * `this` is the comment node.
 * `this.type === eYo.TKN.TYPE_COMMENT`
 * @param {!Object} a block delegate
 */
eYo.Node.prototype.typeComment2Block = function (workspace) {
  var b = eYo.DelegateSvg.newBlockComplete(workspace, eYo.T3.Stmt.comment_stmt)
  b.eyo.comment_p = this.n0.n_str
  return b
}

/**
 * `this` is the simple statement node.
 * `this.type === eYo.TKN.simple_stmt`
 * @param {!Object} a block delegate
 */
eYo.Node.prototype.simple_stmt2Block = function (workspace) {
  // simple_stmt: small_stmt (';' small_stmt)* [';'] NEWLINE
  var n = this.n0
  var root = n.toBlock(workspace)
  var b = root
  while ((n = n.sibling.sibling) && (n.n_type === eYo.TKN.small_stmt)) {
    var bb = n.toBlock(workspace)
    b.eyo.rightStmtConnection.connect(bb.eyo.leftStmtConnection)
    b = bb
  }
  return root
}

/**
 * `this` is the NAME node.
 * `this.type === eYo.TKN.NAME`
 * @param {!Object} a block delegate
 */
eYo.Node.prototype.NAME2Block = function (workspace) {
  var b = eYo.DelegateSvg.newBlockComplete(workspace, {
    type: eYo.T3.Expr.identifier,
    target_p: this.n_str
  })
  b.eyo.variant_p = eYo.Key.NONE
  return b
}

/**
 * `this` is the dotted_name node.
 * `this.type === eYo.TKN.dotted_name`
 * @param {!Object} a block delegate
 */
eYo.Node.prototype.dotted_name2Block = function (workspace) {
  // dotted_name: NAME ('.' NAME)*
  var n = this.n0
  var root = eYo.DelegateSvg.newBlockComplete(workspace, {
    type: eYo.T3.Expr.identifier,
    target_p: n.n_str
  })
  while ((n = n.sibling) && (n = n.sibling)) {
    var b = eYo.DelegateSvg.newBlockComplete(workspace, {
      type: eYo.T3.Expr.identifier,
      target_p: n.n_str
    })
    b.eyo.holder_s.connect(root)
    root = b
  }
  return root
}

/**
 * `this` is the comp_iter node.
 * `this.type === eYo.TKN.comp_iter`
 * @param {!Object} a block delegate
 */
eYo.Node.prototype.comp_iter2Block = function (workspace) {
  // comp_iter: comp_for | comp_if
  var n = this.n0
  if (n.type === eYo.TKN.comp_if) {
    return n.comp_if2Block(workspace)
  } else if (n.type === eYo.TKN.comp_for) {
    if (n.n1) {
      var b = n.n1.sync_comp_for2Block(workspace)
      b.eyo.async = true
      return b
    } else {
      return n.n0.sync_comp_for2Block(workspace)
    }
  } else {
    console.error(`UNEXPECTED block type: ${n.type}`)
    return n.toBlock(workspace)
  }
}

/**
 * Converts the node `n` to a visual block.
 * `this.type === eYo.TKN.comp_for`
 * @param {!Object} a block delegate with a 'for' slot.
 */
eYo.Node.prototype.comp_for2Dlgt = function (t_eyo) {
  // comp_for: ['async'] sync_comp_for
  this.last_child.sync_comp_for2Dlgt(t_eyo)
  if (this.n1) {
    t_eyo.async = true
    console.error('async is not supported')
  }
}

/**
 * Converts the node `n` to a visual block.
 * `this.type === eYo.TKN.sync_comp_for`
 * @param {!Object} a block delegate with a 'for' slot.
 */
eYo.Node.prototype.sync_comp_for2Dlgt = function (t_eyo) {
  // 'for' exprlist 'in' or_test [comp_iter]
  this.n1.exprlist2Dlgt(t_eyo.for_t)
  t_eyo.in_s.connect(this.n3.toBlock(t_eyo.workspace))
  var n = this.n4
  n && (t_eyo.comp_iter = n.comp_iter2Block(t_eyo.workspace))
}

/**
 * `this` is the sync_comp_for node.
 * `this.type === eYo.TKN.sync_comp_for`
 * @param {!Object} a block delegate
 */
eYo.Node.prototype.sync_comp_for2Block = function (workspace) {
  // 'for' exprlist 'in' or_test [comp_iter]
  var b = eYo.DelegateSvg.newBlockComplete(workspace, eYo.T3.Expr.comp_for)
  this.sync_comp_for2Dlgt(b.eyo)
  return b
}

/**
 * `this` is the comp_if node.
 * `this.type === eYo.TKN.comp_if`
 * @param {!Object} a block delegate
 */
eYo.Node.prototype.comp_if2Block = function (workspace) {
  // 'if' test_nocond [comp_iter]
  var b = eYo.DelegateSvg.newBlockComplete(workspace, eYo.T3.Expr.comp_if)
  b.eyo.if_s.connect(this.n1.toBlock(workspace))
  var n = this.n2
  n && (b.eyo.comp_iter = n.comp_iter2Block(workspace))
  return b
}

/**
 * `this` is the for_stmt node.
 * `this.type === eYo.TKN.for_stmt`
 * @param {!Object} a block delegate
 */
eYo.Node.prototype.for_stmt2Block = function (workspace) {
  // 'for' exprlist 'in' testlist ':' suite ['else' ':' suite]
  var b = eYo.DelegateSvg.newBlockComplete(workspace, eYo.T3.Stmt.for_part)
  this.n1.exprlist2Dlgt(b.eyo.for_t)
  this.n3.testlist2Dlgt(b.eyo.in_t)
  var n = this.n_child[5]
  n.suite2Dlgt(b.eyo)
  if ((n = this.n_child[8])) {
    var bb = eYo.DelegateSvg.newBlockComplete(workspace, eYo.T3.Stmt.else_part)
    n.suite2Dlgt(bb.eyo)
    b.eyo.nextConnect(bb)
  }
  return b
}

/**
 * `this` is the namedexpr_test node.
 * `this.type === eYo.TKN.namedexpr_test`
 * @param {!Object} a block delegate
 */
eYo.Node.prototype.namedexpr_test2Block = function (workspace) {
  // test [':=' test]
  var b = this.n0.toBlock(workspace)
  var n = this.n2
  if (n) {
    // if this is already an identifier
    if (b.type !== eYo.T3.Expr.identifier) {
      var bb = eYo.DelegateSvg.newBlockComplete(workspace, eYo.T3.Expr.identifier)
      if (bb.eyo.target_t.lastConnect(b)) {
        b = bb
      } else {
        console.error('IMPOSSIBLE CONNECTION:', bb, b)
      }
    }
    // b is an identifier, turn it into an identifier_valued
    // before any connection
    b.eyo.variant_p = eYo.Key.COL_VALUED
    bb = n.toBlock(workspace)
    if (!b.eyo.value_t.lastConnect(bb)) {
      console.error('IMPOSSIBLE CONNECTION:', b, bb)
    }
  }
  return b
}

/**
 * `this` is the if_stmt node.
 * `this.type === eYo.TKN.if_stmt`
 * @param {!Object} a block delegate
 */
eYo.Node.prototype.if_stmt2Block = function (workspace) {
  // 'if' namedexpr_test ':' suite ('elif' namedexpr_test ':' suite)* ['else' ':' suite]
  var b = eYo.DelegateSvg.newBlockComplete(workspace, eYo.T3.Stmt.if_part)
  b.eyo.if_s.connect(this.n1.namedexpr_test2Block(workspace))
  this.n3.suite2Dlgt(b.eyo)
  var bb = b
  var n = this.n3
  while ((n = n.sibling)) {
    var c8n = bb.nextConnection
    if ((n.n_str === 'elif')) {
      bb = eYo.DelegateSvg.newBlockComplete(workspace, eYo.T3.Stmt.elif_part)
      n = n.sibling
      bb.eyo.if_s.connect(n.namedexpr_test2Block(workspace))
    } else /* n.n_str === 'else' */ {
      bb = eYo.DelegateSvg.newBlockComplete(workspace, eYo.T3.Stmt.else_part)
    }
    n = n.sibling.sibling
    n.suite2Dlgt(bb.eyo)
    c8n.connect(bb.previousConnection)
  }
  return b
}

/**
 * `this` is the while_stmt node.
 * We coud have merged with the if_stmt2Block above.
 * `this.type === eYo.TKN.while_stmt`
 * @param {!Object} a block delegate
 */
eYo.Node.prototype.while_stmt2Block = function (workspace) {
  // 'while' namedexpr_test ':' suite ['else' ':' suite]
  var b = eYo.DelegateSvg.newBlockComplete(workspace, eYo.T3.Stmt.while_part)
  b.eyo.if_s.connect(this.n1.namedexpr_test2Block(workspace))
  this.n3.suite2Dlgt(b.eyo)
  var bb = b
  var n = this.n3
  while ((n = n.sibling)) {
    var c8n = bb.nextConnection
    bb = eYo.DelegateSvg.newBlockComplete(workspace, eYo.T3.Stmt.else_part)
    n = n.sibling.sibling
    n.suite2Dlgt(bb.eyo)
    c8n.connect(bb.previousConnection)
  }
  return b
}

/**
 * `this` is the try_stmt node.
 * `this.type === eYo.TKN.try_stmt`
 * @param {!Object} a block delegate
 */
eYo.Node.prototype.try_stmt2Block = function (workspace) {
  /*try_stmt: ('try' ':' suite
           ((except_clause ':' suite)+
            ['else' ':' suite]
            ['finally' ':' suite] |
           'finally' ':' suite))*/
  // NO consistency test
  var b = eYo.DelegateSvg.newBlockComplete(workspace, eYo.T3.Stmt.try_part)
  var n = this.n2
  n.suite2Dlgt(b.eyo)
  var b0 = b
  while ((n = n.sibling)) {
    if (n.type === eYo.TKN.except_clause) {
      // 'except' [test ['as' NAME]]
      var b1 = eYo.DelegateSvg.newBlockComplete(workspace, eYo.T3.Stmt.except_part)
      var nn = n.n1
      if (nn) {
        b1.eyo.expression_s.connect(nn.toBlock(workspace))
      }
      if ((nn = n.n3)) {
        b1.eyo.alias_s.connect(nn.NAME2Block(workspace))
      }
    } else if (n.n_str === 'else') {
      b1 = eYo.DelegateSvg.newBlockComplete(workspace, eYo.T3.Stmt.else_part)
    } else if (n.n_str === 'finally') {
      b1 = eYo.DelegateSvg.newBlockComplete(workspace, eYo.T3.Stmt.finally_part)
    } else {
      console.error(`Unknown node type: {n.name}`)
      break
    }
    n = n.sibling.sibling
    n.suite2Dlgt(b1.eyo)
    b0 = b0.eyo.nextConnect(b1)
  }
  return b
}

/**
 * `this` is the with_stmt node.
 * `this.type === eYo.TKN.with_stmt`
 * @param {!Object} a block delegate
 */
eYo.Node.prototype.with_stmt2Block = function (workspace) {
  // 'with' with_item (',' with_item)*  ':' suite
  var root = eYo.DelegateSvg.newBlockComplete(workspace, eYo.T3.Stmt.with_part)
  var with_t = root.eyo.with_t
  var n = this.n1
  do {
    // with_item: test ['as' expr]
    var nn = n.n2
    if (nn) {
      var bb = eYo.DelegateSvg.newBlockComplete(workspace, eYo.T3.Expr.identifier)
      bb.eyo.alias_s.connect(nn.toBlock(workspace))
      bb.eyo.target_t.lastConnect(n.n0.toBlock(workspace))
    } else {
      bb = n.n0.toBlock(workspace)
    }
    with_t.lastConnect(bb)
  } while ((n = n.sibling) && n.type === eYo.TKN.COMMA && (n = n.sibling))
  // n.type === eYo.TKN.COLON
  n.sibling.suite2Dlgt(root.eyo)
  return root
}

/**
 * `this` is the funcdef node.
 * `this.type === eYo.TKN.funcdef`
 * @param {!Object} a block delegate
 */
eYo.Node.prototype.funcdef2Block = function (workspace) {
  // 'def' NAME parameters ['->' test] ':' [TYPE_COMMENT] func_body_suite
  var root = eYo.DelegateSvg.newBlockComplete(workspace, eYo.T3.Stmt.funcdef_part)
  root.eyo.name_p = this.n1.n_str
  // parameters: '(' [typedargslist] ')'
  var n = this.n2.n1
  if (n.type !== eYo.TKN.RPAR) {
    n.typedargslist2Dlgt(root.eyo.parameters_t)
  }
  n = this.n4
  if (this.n3.type === eYo.TKN.RARROW) {
    root.eyo.type_s.connect(n.toBlock(workspace))
    root.eyo.variant_p = eYo.Key.TYPE
    n = n.sibling.sibling
  }
  if (n.type === eYo.TKN.TYPE_COMMENT) {
    var b = n.typeComment2Block(workspace)
    root.eyo.rightStmtConnection.connect(b.eyo.previousConnection)
    n = n.sibling
  }
  n.func_body_suite2Dlgt(root.eyo)
  return root
}

/**
 * `this` is the classdef node.
 * `this.type === eYo.TKN.classdef`
 * @param {!Object} a block delegate
 */
eYo.Node.prototype.classdef2Block = function (workspace) {
  // 'class' NAME ['(' [arglist] ')'] ':' suite
  var n = this.n1
  var root = eYo.DelegateSvg.newBlockComplete(workspace, eYo.T3.Stmt.classdef_part)
  root.eyo.name_p = n.n_str
  n = n.sibling
  if (n.type === eYo.TKN.LPAR) {
    root.eyo.variant_p = eYo.Key.N_ARY
    n = n.sibling
    if (n.type !== eYo.TKN.RPAR) {
      n.arglist2Dlgt(root.eyo.n_ary_t)
      n = n.sibling
    }
    n = n.sibling // skip the ')'
  }
  n.sibling.suite2Dlgt(root.eyo)
  return root
}

/**
 * `this` is the decorated node.
 * `this.type === eYo.TKN.decorated`
 * @param {!Object} a block delegate
 */
eYo.Node.prototype.decorated2Block = function (workspace) {
  /*
decorators: decorator+
decorated: decorators (classdef | funcdef | async_funcdef)
*/
  // all the decorators:
  var n = this.n0.n0
  var root = n.decorator2Block(workspace)
  var b = root
  while ((n = n.sibling)) {
    b = b.eyo.nextConnect(n.decorator2Block(workspace))
  }
  n = this.n1
  if (n.type === eYo.TKN.classdef) {
    b.eyo.nextConnect(n.classdef2Block(workspace))
  } else if (n.type === eYo.TKN.funcdef) {
    b.eyo.nextConnect(n.funcdef2Block(workspace))
  } else if (n.type === eYo.TKN.async_funcdef) {
    b.eyo.nextConnect(n.n1.funcdef2Block(workspace)).eyo.async = true
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
eYo.Node.prototype.decorator2Block = function (workspace) {
  // decorator: '@' dotted_name [ '(' [arglist] ')' ] NEWLINE
  var b = eYo.DelegateSvg.newBlockComplete(workspace, eYo.T3.Stmt.decorator_stmt)
  var n = this.n1
  b.eyo.name_p = n.n_child.map(child => child.type === eYo.TKN.NAME ? child.n_str : '.').join('')
  if ((n = this.n2) && n.n_type === eYo.TKN.LPAR) {
    b.eyo.variant_p = eYo.Key.N_ARY
  }
  if ((n = this.n3) && n.n_type !== eYo.TKN.RPAR) {
    n.arglist2Dlgt(b.eyo.n_ary_t)
  }
  return b
}

/**
 * `this` is the tfpdef2Block node.
 * `this.type === eYo.TKN.tfpdef`
 * @param {!Object} a block delegate
 */
eYo.Node.prototype.tfpdef2Block = function (workspace) {
  var b = eYo.DelegateSvg.newBlockComplete(workspace, eYo.T3.Expr.identifier)
  var n = this.n0
  b.eyo.target_p = n.n_str
  if ((n = this.n2)) {
    b.eyo.annotated_s.connect(n.toBlock(workspace))
    b.eyo.variant_p = eYo.Key.ANNOTATED
  }
  return b
}

/**
 * `this` is the first node of a typedargslist.
 * `this.type === eYo.TKN.typedargslist`
 * @param {!Object} a block delegate
 */
eYo.Node.prototype.typedargslist2Dlgt = function (t_eyo) {
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
          var eyo = t_eyo.lastConnect(eYo.T3.Expr.parameter_star)
          eyo.modified_s.connect(n.tfpdef2Block(t_eyo.workspace))
          if (!(n = n.sibling)) {
            return
          }
        } else {
          t_eyo.lastConnect(eYo.T3.Expr.star)
        }
        // n is the comma
        if ((n = n.sibling)) { // skip the comma
          continue
        }
      } else {
        t_eyo.lastConnect(eYo.T3.Expr.star)
      }
    } else if (n.type === eYo.TKN.DOUBLESTAR) {
      eyo = t_eyo.lastConnect(eYo.T3.Expr.parameter_star_star)
      n = n.sibling
      eyo.modified_s.connect(n.tfpdef2Block(t_eyo.workspace))
      if ((n = n.sibling)) { // comma
        n = n.sibling
        continue
      }
    } else {
      eyo = t_eyo.lastConnect(n.tfpdef2Block(t_eyo.workspace))
      if ((n = n.sibling)) {
        if (n.type === eYo.TKN.EQUAL) {
          eyo.variant_p = eyo.variant_p === eYo.Key.ANNOTATED
          ? eYo.Key.ANNOTATED_VALUED
          : eYo.Key.TARGET_VALUED
          n = n.sibling
          eyo.value_t.lastConnect(n.toBlock(t_eyo.workspace))
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
eYo.Node.prototype.knownList2Dlgt = function (target, toBlock) {
  var n = this.n0
  while (true) {
    var b = toBlock.call(n, target.workspace)
    if (!b) {
      console.error('MISSING BLOCK', toBlock.call(n, target.workspace))
    }
    target.lastConnect(b)
    if ((n = n.sibling)) {
      if ((n = n.sibling)) {
        continue
      }
      target.orphan_comma_p = true
    } // gobble comma
    break
  }
}

/**
 * `this` is the first node of a typedargslist.
 * @param {!Object} a block delegate
 */
eYo.Node.prototype.do_list = function (t_eyo) {
  var n = this.n0
  do {
    var b = n.toBlock(t_eyo.workspace)
    if (!b) {
      console.error('MISSING BLOCK', n.toBlock(t_eyo.workspace))
    }
    if (!t_eyo.lastConnect(b)) {
      console.error('NO CONNECTION, BREAK HERE', t_eyo.lastConnect(b))
    }
  } while ((n = n.sibling) && (n = n.sibling)) // gobble comma
}

eYo.Node.prototype.exprlist2Dlgt =
eYo.Node.prototype.arglist2Dlgt =
eYo.Node.prototype.testlist2Dlgt =
eYo.Node.prototype.testlist_star_expr2Dlgt =
eYo.Node.prototype.subscriptlist2Dlgt = eYo.Node.prototype.do_list

/**
 * `this` is binary expression.
 * @param {!Object} workspace
 */
eYo.Node.prototype.binary2Block = function (workspace, type, op) {
  var n0 = this.n0
  var n1
  var root = n0.toBlock(workspace)
  while ((n1 = n0.sibling) && (n0 = n1.sibling)) {
    var b0 = eYo.DelegateSvg.newBlockComplete(workspace, type)
    b0.eyo.lhs_s.connect(root)
    b0.eyo.operator_p = (op && op(n1)) || n1.n_str  
    b0.eyo.rhs_s.connect(n0.toBlock(workspace))
    root = b0
  }
  return root
}

/**
 * `this` is yield expression.
 * `this.type === eYo.TKN.yield_expr`
 * @param {!Object} workspace
 */
eYo.Node.prototype.yield_expr2Block = function (workspace) {
  /*yield_expr: 'yield' [yield_arg]
yield_arg: 'from' test | testlist_star_expr */
  var b = eYo.DelegateSvg.newBlockComplete(workspace, eYo.T3.Expr.yield_expr)
  this.yield_expr2Dlgt(b.eyo)
  return b
}

/**
 * `this` is a yield_expr.
 * `this.type === eYo.TKN.yield_expr`
 * @param {!Object} a block delegate
 */
eYo.Node.prototype.yield_expr2Dlgt = function (target) {
  var n = this.n1
  if (n) {
    if (n.n1) {
      target.from_s.connect(n.n1.toBlock(target.workspace))
    } else {
      n.n0.testlist_star_expr2Dlgt(target.expression_t)
    }
  }
}

/**
 * `this` is a yield_expr.
 * `this.type === eYo.TKN.yield_expr`
 * @param {!Object} a block delegate
 */
eYo.Node.prototype.yield_expr2ListDelegate = function (target) {
  target.lastConnect(this.yield_expr2Block(target.workspace))
}

/**
 * `this` is the first node of a typedargslist.
 * `this.type === eYo.TKN.varargslist`
 * @param {!Object} a block delegate
 */
eYo.Node.prototype.varargslist2Dlgt = function (t_eyo) {
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
          var eyo = t_eyo.lastConnect(eYo.T3.Expr.parameter_star)
          eyo.modified_s.connect(n.n0.NAME2Block(t_eyo.workspace))
          if (!(n = n.sibling)) {
            return
          }
        } else {
          t_eyo.lastConnect(eYo.T3.Expr.star)
        }
        if ((n = n.sibling)) { // skip the comma
          continue
        }
      } else {
        t_eyo.lastConnect(eYo.T3.Expr.star)
      }
    } else if (n.type === eYo.TKN.DOUBLESTAR) {
      eyo = t_eyo.lastConnect(eYo.T3.Expr.parameter_star_star)
      n = n.sibling
      eyo.modified_s.connect(n.n0.NAME2Block(t_eyo.workspace))
      if ((n = n.sibling)) { // comma
        n = n.sibling
        continue
      }
    } else {
      eyo = t_eyo.lastConnect(n.n0.NAME2Block(t_eyo.workspace))
      if ((n = n.sibling)) {
        if (n.type === eYo.TKN.EQUAL) {
          eyo.variant_p = eYo.Key.TARGET_VALUED
          n = n.sibling
          eyo.value_t.lastConnect(n.toBlock(t_eyo.workspace))
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
 * @param {!Object}t_eyo  a block delegate
 */
eYo.Node.prototype.dictorsetmaker2Dlgt = function (t_eyo) {
/*dictorsetmaker: ( ((test ':' test | '**' expr)
    (comp_for | (',' (test ':' test | '**' expr))* [','])) |
  ((test | star_expr)
    (comp_for | (',' (test | star_expr))* [','])) )
    */
  var n0 = this.n0
  var n1, n2, n3
  if ((n1 = n0.sibling)) {
    if (n1.n_type === eYo.TKN.comp_for) {
      // set comprehension
      t_eyo.lastConnect(this.comprehension2Block(t_eyo.workspace))
      t_eyo.variant_p = eYo.Key.BRACE
      return t_eyo
    } else if ((n2 = n1.sibling)) {
      if (n2.n_type === eYo.TKN.comp_for) {
        // set comprehension with '**'
        // this is a syntax error but I still consider it to be valid
        var root = eYo.DelegateSvg.newBlockComplete(t_eyo.workspace, eYo.T3.Expr.comprehension)
        var b = eYo.DelegateSvg.newBlockComplete(t_eyo.workspace, eYo.T3.Expr.expression_star_star)
        b.eyo.modified_s.connect(n1.toBlock(t_eyo.workspace))
        root.eyo.expression_s.connect(b)
        n2.comprehension2Dlgt(b.eyo)
        return t_eyo
      } else if ((n3 = n2.sibling)) {
        if (n3.n_type === eYo.TKN.comp_for) {
          // dict comprehension
          t_eyo.lastConnect(this.dict_comprehension2Block(t_eyo.workspace))
          return t_eyo
        }
      }
    }
  }
  // no comprehension
  while (true) {
    if (n0.n_type === eYo.TKN.DOUBLESTAR) {
      var b0 = eYo.DelegateSvg.newBlockComplete(t_eyo.workspace, eYo.T3.Expr.expression_star_star)
      t_eyo.lastConnect(b0)
      if ((n1 = n0.sibling)) {
        b0.eyo.modified_s.connect(n1.toBlock(t_eyo.workspace))
        if ((n1 = n1.sibling) && (n0 = n1.sibling)) {
          continue
        }
      }
    } else {
      b0 = n0.toBlock(t_eyo.workspace)
      if ((n1 = n0.sibling)) {
        if (n1.n_type === eYo.TKN.COLON) {
          var b1 = eYo.DelegateSvg.newBlockComplete(t_eyo.workspace, eYo.T3.Expr.key_datum)
          t_eyo.lastConnect(b1)
          b1.eyo.target_t.lastConnect(b0)
          if ((n2 = n1.sibling)) {
            b1.eyo.annotated_s.connect(n2.toBlock(t_eyo.workspace))
            if ((n3 = n2.sibling) && (n0 = n3.sibling)) {
              continue
            }
          }
        } else {
          t_eyo.lastConnect(b0)
          if ((n0 = n1.sibling)) {
            continue
          }
        }
      } else {
        t_eyo.lastConnect(b0)
      }
    }
    return t_eyo
  }
}

/**
 * Partially converts the node `this` to a visual block.
 * `this.n_type === eo.TKN.comp_for`
 * @param {!t_eyo} a block delegate
 */
eYo.Node.prototype.comprehension2Dlgt = function (t_eyo) {
  this.comp_for2Dlgt(t_eyo)
  var for_if_t = t_eyo.for_if_t
  var eyo = t_eyo
  var b
  while ((b = eyo.comp_iter)) {
    eyo.comp_iter = undefined
    for_if_t.lastConnect(b)
    eyo = b.eyo
  }
}

/**
 * Converts the node `this` to a visual block.
 * @param {!Object} workspace  a workspace
 */
eYo.Node.prototype.comprehension2Block = function (workspace) {
  var b = eYo.DelegateSvg.newBlockComplete(workspace, eYo.T3.Expr.comprehension)
  b.eyo.expression_s.connect(this.n0.toBlock(workspace))
  this.n1.comprehension2Dlgt(b.eyo)
  return b
}

/**
 * Converts the node `this` to a visual block.
 * `this.type === eYo.TKN.dictorsetaker`
 * @param {!Object} a block delegate
 */
eYo.Node.prototype.dict_comprehension2Block = function (workspace) {
  /*dictorsetmaker: (test ':' test | '**' expr) comp_for
    */
  var b = eYo.DelegateSvg.newBlockComplete(workspace, eYo.T3.Expr.dict_comprehension)
  var bb = eYo.DelegateSvg.newBlockComplete(workspace, eYo.T3.Expr.key_datum)
  bb.eyo.target_t.lastConnect(this.n0.toBlock(workspace))
  bb.eyo.annotated_s.connect(this.n2.toBlock(workspace))
  b.eyo.expression_s.connect(bb)
  this.n3.comp_for2Dlgt(b.eyo)
  var t = b.eyo.for_if_t
  var b0 = b
  var b1
  while ((b1 = b0.eyo.comp_iter)) {
    b0.eyo.comp_iter = undefined
    t.lastConnect((b0 = b1))
  }
  return b
}

/**
 * Converts the node `n` to a visual block.
 * `this.type === eYo.TKN.testlist_comp`
 * @param {!Object} a block delegate
 */
eYo.Node.prototype.testlist_comp2Dlgt = function (t_eyo) {
  // (namedexpr_test|star_expr) ( comp_for | (',' (namedexpr_test|star_expr))* [','] )
  var n = this.n1
  if (n && n.n_type === eYo.TKN.comp_for) {
    t_eyo.lastConnect(this.comprehension2Block(t_eyo.workspace))
  } else {
    this.testlist2Dlgt(t_eyo)
  }
}

/**
 * Converts the node `n` to a visual block.
 * @param {!Object} workspace A workspace.
 * @param {!Object} a block or an array of blocks
 */
eYo.Node.prototype.toBlock = function (workspace) {
  var root, b0
  if (this.comments) {
    var blocks = this.comments.map(n => n.comment2Block(workspace))
    if ((root = blocks.shift())) {
      b0 = root
      blocks.forEach(bb => {
        if (bb) {
          b0.eyo.next = bb.eyo
          b0 = bb
        }
      })
    }
  }
  var other = this.toBlock_(workspace)
  if (b0) {
    b0.eyo.next = other
  } else {
    root = other
  }
  return root
}

/**
 * Converts the node `n` to a visual block.
 * @param {!Object} workspace A workspace.
 * @param {!Object} a block or an array of blocks
 */
eYo.Node.prototype.toBlock_ = function (workspace) {
  // console.log(`node type: ${this.name}`)
  var root, b, b0, b1, b2, n, n0, n1, n2, i, s, t
  switch (this.n_type) {
    case eYo.TKN.file_input: // (NEWLINE | stmt)* ENDMARKER
      var bs = this.n_child.map(child => child.n_type === eYo.TKN.stmt ? child.toBlock(workspace) : null)
      if ((root = bs.shift())) {
        b0 = root
        bs.forEach(bb => {
          if (bb) {
            b0.eyo.next = bb.eyo
            b0 = bb
          }
        })
      }
      return root
    case eYo.TKN.simple_stmt:
      return this.simple_stmt2Block(workspace)
    case eYo.TKN.expr_stmt: // testlist_star_expr (annassign | augassign (yield_expr|testlist) | [('=' (yield_expr|testlist_star_expr))+ [TYPE_COMMENT]] )
      n0 = this.n0
      if (!(n1 = this.n1)) {
        // simple expression statement: only a testlist_star_expr
        root = eYo.DelegateSvg.newBlockComplete(workspace, eYo.T3.Stmt.expression_stmt)
        n0.testlist_star_expr2Dlgt(root.eyo.value_t)
        return root
      }
      if (n1.n_type === eYo.TKN.EQUAL) {
        // assignment,
        root = b1 = eYo.DelegateSvg.newBlockComplete(workspace, eYo.T3.Stmt.assignment_stmt)
        while (true) {
          // targets
          (n0.type === eYo.TKN.yield_expr ? n0.yield_expr2ListDelegate : n0.testlist_star_expr2Dlgt).call(n0, b1.eyo.target_t) // .call is necessary !
          // values
          n0 = n1.sibling
          if ((n1 = n0.sibling)) {
            if (n1.n_type === eYo.TKN.EQUAL) {
              b2 = eYo.DelegateSvg.newBlockComplete(workspace, eYo.T3.Expr.assignment_chain)
              if ((b = b1.eyo.value_b)) {
                b.eyo.lastConnect(b2)
                b1.eyo.variant_p = eYo.Key.TARGET_VALUED // necessary ?
              } else if ((b = b1.eyo.value_b)) {
                b.eyo.lastConnect(b2)
                b1.eyo.variant_p = eYo.Key.TARGET_VALUED // necessary ?
              } else {
                console.error('ERROR')
              }
              b1 = b2
              continue
            } else {
              root.eyo.type_comment_node = n1
            }
          }
          (n0.type === eYo.TKN.yield_expr ? n0.yield_expr2ListDelegate : n0.testlist_star_expr2Dlgt).call(n0, b1.eyo.value_t)
          break
        }
      } else if (n1.type === eYo.TKN.augassign) { // augassign: ('+=' | '-=' | '*=' | '@=' | '/=' | '%=' | '&=' | '|=' | '^=' | '<<=' | '>>=' | '**=' | '//=')
        root = eYo.DelegateSvg.newBlockComplete(workspace, {
          type: eYo.T3.Stmt.augmented_assignment_stmt,
          operator_p: n1.n0.n_str
        })
        n0.testlist_star_expr2Dlgt(root.eyo.target_t)
        n2 = n1.sibling
        ;(n2.type === eYo.TKN.yield_expr ? n2.yield_expr2ListDelegate : n2.testlist2Dlgt).call(n2, root.eyo.value_t)
      } else if (n1.type === eYo.TKN.annassign) { // ':' test ['=' (yield_expr|testlist)]
        if ((s = n1.n3)) {
          root = eYo.DelegateSvg.newBlockComplete(workspace, eYo.T3.Stmt.annotated_assignment_stmt)
          n0.testlist_star_expr2Dlgt(root.eyo.target_t)
          b1 = n1.n1.toBlock(workspace)
          root.eyo.annotated_s.connect(b1)
          ;(s.type === eYo.TKN.yield_expr ? s.yield_expr2ListDelegate : s.testlist2Dlgt).call(s, root.eyo.value_t)
        } else {
          root = eYo.DelegateSvg.newBlockComplete(workspace, eYo.T3.Stmt.annotated_stmt)
          n0.testlist_star_expr2Dlgt(root.eyo.target_t)
          b1 = n1.n1.toBlock(workspace)
          if (b1.eyo.toString === 'str') {
            console.error('STOP HERE')
          }
          root.eyo.annotated_s.connect(b1)
        }
      }
      return root
    case eYo.TKN.atom_expr: // ['await'] atom trailer*
      i = 0
      n0 = this.n0
      if (n0.n_type === eYo.TKN.NAME && n0.n_str === 'await') {
        n1 = this.n1
        root = n1.toBlock(workspace)
        root.eyo.await = true
        n0 = n1
      } else {
        root = n0.toBlock(workspace)
      }
      b0 = root
      // root is an atom
      // trailers ?
      while ((n0 = n0.sibling)) {
        // n0 is a trailer: '(' [arglist] ')' | '[' subscriptlist ']' | '.' NAME
        if (n0.n0.n_type === eYo.TKN.LPAR) {
          b = b0.eyo.n_ary_b
          if (b && b0.eyo.variant_p === eYo.Key.NONE) {
            b0.eyo.variant_p = eYo.Key.CALL_EXPR            
          } else {
            root = eYo.DelegateSvg.newBlockComplete(workspace, eYo.T3.Expr.call_expr)
            root.eyo.target_t.lastConnect(b0)
            b0 = root
            b = b0.eyo.n_ary_b
          }
          n1 = n0.n1
          if (n1.n_type !== eYo.TKN.RPAR) {
            n1.arglist2Dlgt(b.eyo)
          }
        } else if (n0.n0.n_type === eYo.TKN.LSQB) {
          b = b0.eyo.slicing_b
          if (b && b0.eyo.variant_p === eYo.Key.NONE) {
            b0.eyo.variant_p = eYo.Key.SLICING
          } else {
            root = eYo.DelegateSvg.newBlockComplete(workspace, eYo.T3.Expr.slicing)
            root.eyo.target_t.lastConnect(b0)
            b0 = root
            b = b0.eyo.slicing_b
          }
          n1 = n0.n1
          if (n1.n_type !== eYo.TKN.RSQB) {
            n1.subscriptlist2Dlgt(b.eyo)
          }
        } else /* if (n0.n0.n_type === eYo.TKN.DOT) */ {
          if (!b0.eyo.dotted_d || b0.eyo.variant_p !== eYo.Key.NONE || b0.eyo.dotted_p !== 0) {
            root = n0.n1.NAME2Block(workspace)
            root.eyo.holder_s.connect(b0)
            b0 = root
            b0.eyo.dotted_p = 1
          } else {
            b0.eyo.changeWrap(() => {
              if ((b = b0.eyo.target_s.unwrappedTarget)) {
                b0.eyo.holder_s.connect(b)
              } else {
                b0.eyo.holder_p = b0.eyo.target_p
                b0.eyo.target_p = ''
              }
              b0.eyo.dotted_p = 1
              b0.eyo.target_t.lastConnect(n0.n1.NAME2Block(workspace))  
            })
          }
        }
      }
      return root
    case eYo.TKN.subscript: // test | [test] ':' [test] [sliceop] // sliceop: ':' [test]
      n0 = this.n0
      if (n0.type === eYo.TKN.test) {
        b0 = n0.toBlock(workspace)
        if (!(n0 = n0.sibling)) {
          return b0
        }
      }
      root = eYo.DelegateSvg.newBlockComplete(workspace, eYo.T3.Expr.proper_slice)
      b0 && root.eyo.lower_bound_s.connect(b0)
      // n0.type === eYo.TKN.COLON
      if ((n0 = n0.sibling)) {
        if (n0.type === eYo.TKN.test) {
          root.eyo.upper_bound_s.connect(n0.toBlock(workspace))
          if (!(n0 = n0.sibling)) {
            return root
          }
        }
        root.eyo.variant_p = eYo.Key.STRIDE
        n0.n1 && root.eyo.stride_s.connect(n0.n1.toBlock(workspace))
      }
      return root
    case eYo.TKN.atom: //atom: ('(' [yield_expr|testlist_comp] ')' | '[' [testlist_comp] ']' | '{' [dictorsetmaker] '}') | NAME | NUMBER | STRING+ | '...' | 'None' | 'True' | 'False')
      n0 = this.n0
      if (n0.type === eYo.TKN.STRING) {
        var s = n0.n_str
        while ((n0 = n0.sibling)) {
          s += n0.n_str
        }
        return eYo.DelegateSvg.newBlockComplete(workspace, s) // THIS IS NOT COMPLETE
      }
      if ((n1 = n0.sibling)) {
        root = eYo.DelegateSvg.newBlockComplete(workspace, eYo.T3.Expr.enclosure)
        switch(n0.n_str) {
          case '(':
            t = eYo.Key.PAR
            s = n1.type === eYo.TKN.yield_expr
            ? n1.yield_expr2ListDelegate
            : n1.type === eYo.TKN.testlist_comp
              ? n1.testlist_comp2Dlgt
              : null
            break
          case '[':
            t = eYo.Key.SQB
            s = n1.type === eYo.TKN.testlist_comp
            ? n1.testlist_comp2Dlgt
            : null
            break
          case '{':
            t = eYo.Key.BRACE
            s = n1.type === eYo.TKN.dictorsetmaker
            ? n1.dictorsetmaker2Dlgt
            : null
            break
        }
        root.eyo.variant_p = t
        s && s.call(n1, root.eyo)
        return root
      } else if (['...', 'None', 'True', 'False'].indexOf((s = n0.n_str)) < 0) {
        if (n0.type === eYo.TKN.NAME) {
          return n0.NAME2Block(workspace)
        } else if (n0.type === eYo.TKN.NUMBER) {
          return eYo.DelegateSvg.newBlockComplete(workspace, {
            type: eYo.T3.Expr.numberliteral,
            value_p: s
          })
        } else /* STRING+ */ {
          b0 = root = eYo.DelegateSvg.newBlockComplete(workspace, {
            type: s.endsWith('"""') || s.endsWith("'''") ? eYo.T3.Expr.longliteral : eYo.T3.Expr.shortliteral,
            value_p: s
          })
          while ((n0 = n0.sibling)) {
            b0 = b0.eyo.next_string_block = eYo.DelegateSvg.newBlockComplete(workspace, {
              type: s.endsWith('"""') || s.endsWith("'''") ? eYo.T3.Expr.longliteral : eYo.T3.Expr.shortliteral,
              value_p: n0.n_str
            })
          }
        }
        return root
      } else {
        return eYo.DelegateSvg.newBlockComplete(workspace, {
          type: eYo.T3.Expr.builtin__object,
          value_p: s
        })
      }
    case eYo.TKN.star_expr: // star_expr: '*' expr
      root = eYo.DelegateSvg.newBlockComplete(workspace, eYo.T3.Expr.expression_star)
      root.eyo.modified_s.connect(this.n1.toBlock(workspace))
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
      root = n0.toBlock(workspace)
      while ((n1 = n0.sibling) && (n2 = n1.sibling)) {
        b0 = eYo.DelegateSvg.newBlockComplete(workspace, eYo.T3.Expr.m_expr)
        b0.eyo.operator_p = n1.n_str
        b0.eyo.lhs_s.connect(root)
        root = b0
        b0.eyo.rhs_s.connect(n2.toBlock(workspace))
        n0 = n2
      }
      return root
    case eYo.TKN.factor: // ('+'|'-'|'~') factor | power
      if ((n1 = this.n1)) {
        root = eYo.DelegateSvg.newBlockComplete(workspace, eYo.T3.Expr.unary)
        root.eyo.operator_p = this.n0.n_str
        root.eyo.rhs_s.connect(n1.toBlock(workspace))
      } else {
        return this.n0.toBlock(workspace)
      }
      return root
    case eYo.TKN.power: // atom_expr ['**' factor]
      b0 = this.n0.toBlock(workspace)
      if ((n2 = this.n2)) {
        root = eYo.DelegateSvg.newBlockComplete(workspace, eYo.T3.Expr.power)
        root.eyo.lhs_s.connect(b0)
        root.eyo.rhs_s.connect(n2.toBlock(workspace))
        return root
      } else {
        return b0
      }
    case eYo.TKN.argument: /*argument: ( test [comp_for] |
      test ':=' test |
      test '=' test |
      '**' test |
      '*' test )*/
      n0 = this.n0
      if (n0.n_type === eYo.TKN.STAR) {
        root = eYo.DelegateSvg.newBlockComplete(workspace, eYo.T3.Expr.expression_star)
        root.eyo.modified_s.connect(n0.sibling.toBlock(workspace))
      } else if (n0.n_type === eYo.TKN.DOUBLESTAR) {
        root = eYo.DelegateSvg.newBlockComplete(workspace, eYo.T3.Expr.expression_star_star)
        root.eyo.modified_s.connect(n0.sibling.toBlock(workspace))
      } else if ((n1 = n0.sibling)) {
        if (n1.n_type === eYo.TKN.COLONEQUAL) {
          root = eYo.DelegateSvg.newBlockComplete(workspace, eYo.T3.Expr.assignment_expr)
          root.eyo.target_t.lastConnect(n0.toBlock(workspace))
          root.eyo.value_t.lastConnect(n1.sibling.toBlock(workspace))
        } else if (n1.n_type === eYo.TKN.EQUAL) {
          root = eYo.DelegateSvg.newBlockComplete(workspace, eYo.T3.Expr.identifier_valued)
          root.eyo.target_t.lastConnect(n0.toBlock(workspace))
          root.eyo.value_t.lastConnect(n1.sibling.toBlock(workspace))
        } else {
          root = this.comprehension2Block(workspace)
        }
      } else {
        root = n0.toBlock(workspace)
      }
      return root
    case eYo.TKN.NAME: // test [':=' test]
      return this.NAME2Block(workspace)
    case eYo.TKN.namedexpr_test: // test [':=' test]
      b0 = this.n0.toBlock(workspace)
      if ((n2 = this.n2)) {
        root = eYo.DelegateSvg.newBlockComplete(workspace, eYo.T3.Expr.assignment_expr)
        root.eyo.target_t.lastConnect(b0)
        root.eyo.value_t.lastConnect(n2.toBlock(workspace))
      } else {
        root = b0
      }
      return root
    case eYo.TKN.lambdef: // 'lambda' [varargslist] ':' test
      root = eYo.DelegateSvg.newBlockComplete(workspace, eYo.T3.Expr.lambda_expr)
      n1 = this.n1
      if (n1.type !== eYo.TKN.COLON) {
        n1.varargslist2Dlgt(root.eyo.parameters_t)
        n1 = n1.sibling
      }
      n1 = n1.sibling
      root.eyo.expression_s.connect(n1.toBlock(workspace))
      return root
    case eYo.TKN.lambdef_nocond: // 'lambda' [varargslist] ':' test_nocond
      root = eYo.DelegateSvg.newBlockComplete(workspace, eYo.T3.Expr.lambda_expr_nocond)
      n1 = this.n1
      if (n1.type !== eYo.TKN.COLON) {
        n1.varargslist2Dlgt(root.eyo.parameters_t)
        n1 = n1.sibling
      }
      n1 = n1.sibling
      root.eyo.expression_s.connect(n1.toBlock(workspace))
      return root
    case eYo.TKN.async_funcdef: // 'async' funcdef
      root = this.n1.funcdef2Block(workspace)
      root.eyo.async = true
      return root
    case eYo.TKN.pass_stmt: // 'pass'
      return eYo.DelegateSvg.newBlockComplete(workspace, eYo.T3.Stmt.pass_stmt)
    case eYo.TKN.break_stmt: // 'break'
      return eYo.DelegateSvg.newBlockComplete(workspace, eYo.T3.Stmt.break_stmt)
    case eYo.TKN.continue_stmt: // 'break'
      return eYo.DelegateSvg.newBlockComplete(workspace, eYo.T3.Stmt.continue_stmt)
    case eYo.TKN.compound_stmt: //
      /* compound_stmt: if_stmt | while_stmt | for_stmt | try_stmt | with_stmt | funcdef | classdef | decorated | async_stmt */
      n0 = this.n0
      switch(n0.type) {
        case eYo.TKN.if_stmt: return n0.if_stmt2Block(workspace)
        case eYo.TKN.while_stmt: return n0.while_stmt2Block(workspace)
        case eYo.TKN.for_stmt: return n0.for_stmt2Block(workspace)
        case eYo.TKN.try_stmt: return n0.try_stmt2Block(workspace)
        case eYo.TKN.with_stmt: return n0.with_stmt2Block(workspace)
        case eYo.TKN.funcdef: return n0.funcdef2Block(workspace)
        case eYo.TKN.classdef: return n0.classdef2Block(workspace)
        case eYo.TKN.decorated: return n0.decorated2Block(workspace)
        case eYo.TKN.async_stmt:
          // async_stmt: 'async' (funcdef | with_stmt | for_stmt)
          n1 = n0.n1
          switch(n1.type) {
            case eYo.TKN.funcdef: root = n1.funcdef2Block(workspace); break
            case eYo.TKN.with_stmt: root = n1.with_stmt2Block(workspace); break
            case eYo.TKN.for_stmt: root = n1.for_stmt2Block(workspace); break
          }
          root.eyo.async = true
          return root  
        default: console.error(n0.name)
        throw 'ERROR'
      }
    case eYo.TKN.yield_expr:
      return this.yield_expr2Block(workspace)
    case eYo.TKN.yield_stmt:
      root = eYo.DelegateSvg.newBlockComplete(workspace, eYo.T3.Stmt.yield_stmt)
      this.n0.yield_expr2Dlgt(root.eyo)
      return root
    case eYo.TKN.break_stmt:
      return eYo.DelegateSvg.newBlockComplete(Blockly.mainWorkspace, eYo.T3.Stmt.break_stmt)
    case eYo.TKN.continue_stmt:
      return eYo.DelegateSvg.newBlockComplete(Blockly.mainWorkspace, eYo.T3.Stmt.continue_stmt)
    case eYo.TKN.pass_stmt:
      return eYo.DelegateSvg.newBlockComplete(Blockly.mainWorkspace, eYo.T3.Stmt.pass_stmt)
    case eYo.TKN.return_stmt: // 'return' [testlist_star_expr]
      root = eYo.DelegateSvg.newBlockComplete(Blockly.mainWorkspace, eYo.T3.Stmt.return_stmt)
      if ((n1 = this.n1)) {
        n1.testlist_star_expr2Dlgt(root.eyo.return_t)
      }
      return root
    case eYo.TKN.import_stmt: // import_stmt: import_name | import_from
      n0 = this.n0
      if (n0.type === eYo.TKN.import_name) {
        //import_name: 'import' dotted_as_names
        root = eYo.DelegateSvg.newBlockComplete(workspace, eYo.T3.Stmt.import_stmt)
        var eyo = root.eyo.import_module_t
        n0.n1.knownList2Dlgt(eyo, function () {
          // dotted_as_name: dotted_name ['as' NAME]
          // dotted_name: NAME ('.' NAME)*
          if ((n2 = this.n2)) {
            var b = eYo.DelegateSvg.newBlockComplete(workspace, eYo.T3.Expr.identifier_as)
            b.eyo.alias_p = n2.n_str
          } else {
            b = eYo.DelegateSvg.newBlockComplete(workspace, eYo.T3.Expr.identifier)
          }
          var s = this.n0.n_child.map(child => child.type === eYo.TKN.NAME ? child.n_str : '.').join('')
          b.eyo.target_p = s
          return b
        })
        return root
      } else {
      /*
      ('from' (('.' | '...')* dotted_name | ('.' | '...')+)
                'import' ('*' | '(' import_as_names ')' | import_as_names))
        import_as_name: NAME ['as' NAME]*/
        root = eYo.DelegateSvg.newBlockComplete(workspace, eYo.T3.Stmt.import_stmt)
        s = ''
        n = n0.n1
        do {
          if (n.type === eYo.TKN.dotted_name) {
            s += n.n_child.map(child => child.type === eYo.TKN.NAME ? child.n_str : '.').join('')
            root.eyo.from_p = s
            s = ''
            // b = n.dotted_name2Block(workspace)
            // if (i) {
            //   // find the topmost holder
            //   var h
            //   var hh = b
            //   do {
            //     h = hh
            //   } while ((hh = h.eyo.holder_b))
            //   h.eyo.dotted_p = i
            // }
            // root.eyo.from_s.connect(b)
          } else if (n.type === eYo.TKN.DOT) {
            s += '.'
          } else if (n.type === eYo.TKN.ELLIPSIS) {
            s += '...'
          } else if (n.n_str.length === 6) {
            // found the 'import'
            if (s.length) {
              root.eyo.from_p = s
            }
            break
          }
        } while ((n = n.sibling))
        n = n.sibling
        if (n.type === eYo.TKN.STAR) {
          root.eyo.star_p = true
        } else {
          var eyo = root.eyo.import_t
          if (n.type === eYo.TKN.LPAR) {
            n = n.sibling
            root.eyo.import_t.parenth_p = true
          }
          n.knownList2Dlgt(eyo, function () {
            // import_as_name: NAME ['as' NAME]
            var n = this.n2
            if (n) {
              var b = eYo.DelegateSvg.newBlockComplete(workspace, eYo.T3.Expr.identifier_as)
              b.eyo.alias_p = n.n_str
            } else {
              b = eYo.DelegateSvg.newBlockComplete(workspace, eYo.T3.Expr.identifier)
            }
            b.eyo.target_p = this.n0.n_str
            return b
          })
        }
        return root
      }
    case eYo.TKN.raise_stmt: // raise_stmt: 'raise' [test ['from' test]]
      root = eYo.DelegateSvg.newBlockComplete(workspace, eYo.T3.Stmt.raise_stmt)
      if ((n1 = this.n0.sibling)) {
        root.eyo.expression_s.connect(n1.toBlock(workspace))
        root.eyo.variant_p = eYo.Key.EXPRESSION
        if ((n1 = n1.sibling) && (n1 = n1.sibling)) {
          root.eyo.from_s.connect(n1.toBlock(workspace))
          root.eyo.variant_p = eYo.Key.FROM
        }
      }
      return root
    break
    case eYo.TKN.or_test: // or_test: and_test ('or' and_test)*
      return this.binary2Block(workspace, eYo.T3.Expr.or_test)
    break
    case eYo.TKN.and_test: // and_expr: shift_expr ('&' shift_expr)*
      return this.binary2Block(workspace, eYo.T3.Expr.and_test)
    break
    case eYo.TKN.xor_expr: // xor_expr: and_expr ('^' and_expr)*
      return this.binary2Block(workspace, eYo.T3.Expr.xor_expr)
    break
    case eYo.TKN.and_expr:
      return this.binary2Block(workspace, eYo.T3.Expr.and_expr)
    break
    case eYo.TKN.shift_expr: // shift_expr: arith_expr (('<<'|'>>') arith_expr)*
      return this.binary2Block(workspace, eYo.T3.Expr.shift_expr)
    break
    case eYo.TKN.arith_expr: // arith_expr: term (('+'|'-') term)*
      return this.binary2Block(workspace, eYo.T3.Expr.a_expr)
    break
    case eYo.TKN.term: // term: factor (('*'|'@'|'/'|'%'|'//') factor)*
      return this.binary2Block(workspace, eYo.T3.Expr.m_expr)
    break
    case eYo.TKN.comparison: // expr (comp_op expr)*
      return this.binary2Block(workspace, eYo.T3.Expr.comparison, n => n.n0.n_str)
    break
    case eYo.TKN.namedexpr_test:
      return this.namedexpr_test2Block(workspace)
    break
    case eYo.TKN.global_stmt:
      // global_stmt: 'global' NAME (',' NAME)*
      root = eYo.DelegateSvg.newBlockComplete(workspace, eYo.T3.Stmt.global_stmt)
      t = root.eyo.identifiers_t
      n = this.n1
      do {
        t.lastConnect(n.toBlock(workspace))
      } while ((n = n.sibling) && (n = n.sibling))
      return root
    case eYo.TKN.nonlocal_stmt:
      // nonlocal_stmt: 'nonlocal' NAME (',' NAME)*
      root = eYo.DelegateSvg.newBlockComplete(workspace, eYo.T3.Stmt.nonlocal_stmt)
      t = root.eyo.identifiers_t
      n = this.n1
      do {
        t.lastConnect(n.toBlock(workspace))
      } while ((n = n.sibling) && (n = n.sibling))
      return root
    // case eYo.TKN.ENDMARKER: break
    // case eYo.TKN.NUMBER: break
    // case eYo.TKN.STRING: break
    // case eYo.TKN.NEWLINE: break
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
        return this.n0.toBlock(workspace)
      } else {
        // eYo.GMR.showtree(eYo.GMR._PyParser_Grammar, this)
        console.error('BREAK HERE TO DEBUG', this.name, this.n_child)
        throw `3) NOTHING TO DO WITH ${this.name}`
      }
  }
}
