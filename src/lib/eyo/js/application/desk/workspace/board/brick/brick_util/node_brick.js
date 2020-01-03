/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Create bricks from a tree node obtained by parsing some python code.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.require('Node')

eYo.require('TKN')

eYo.require('GMR')

eYo.require('Expr.Primary')

eYo.provide('Node_Brick')

/**
 * Converts the receiver to a visual brick.
 * `this.type === eYo.TKN.suite`.
 * @param {Object} a brick
 */
eYo.Node_p.suiteInBrick = function (brick) {
  // simple_stmt | NEWLINE INDENT stmt+ DEDENT
  var n = this.n0
  // suite: simple_stmt | NEWLINE INDENT stmt+ DEDENT
  if (n.n_type === eYo.TKN.NEWLINE) {
    var m4t = brick.suite_m
    var comments = n.comments
    if (comments.length) {
      comments.forEach(n => {
        m4t = m4t.connectSmart(n.toBrick(brick))
      })
    }
    n = n.sibling.sibling // skip NEWLINE INDENT
    do {
      m4t = m4t.connectSmart(n.toBrick(brick))
    } while ((n = n.sibling) && n.n_type !== eYo.TKN.DEDENT)
  } else {
    var d = n.simple_stmt2Brick(brick)
    brick.right_mMost.connectSmart(d)// what if we cannot connect?
  }
}

/**
 * `this` is the function body node.
 * `this.type === eYo.TKN.func_body_suite`.
 * @param {Object} a brick
 */
eYo.Node_p.func_body_suiteInBrick = function (brick) {
  var n = this.n0
  // func_body_suite: simple_stmt | NEWLINE [TYPE_COMMENT NEWLINE] INDENT stmt+ DEDENT
  if (n.n_type === eYo.TKN.NEWLINE) {
    var m4t = brick.suite_m
    var comments = n.comments
    if (comments.length) {
      comments.forEach(n => {
        m4t = m4t.connectSmart(n.toBrick(brick))
      })
    }
    n = n.sibling // skip NEWLINE
    if (n.n_type === eYo.TKN.TYPE_COMMENT) {
      m4t = m4t.connectSmart(n.typeComment2Brick(brick))
      n = n.sibling // advance to NEWLINE
      comments = n.comments // manage comments
      if (comments.length) {
        comments.forEach(n => {
          m4t = m4t.connectSmart(n.toBrick(brick))
        })
      }
      n = n.sibling // skip NEWLINE
    }
    n = n.sibling // skip INDENT
    do {
      m4t = m4t.connectSmart(n.toBrick(brick))
    } while ((n = n.sibling) && n.n_type !== eYo.TKN.DEDENT)
  } else {
    var d = n.simple_stmt2Brick(brick)
    brick.right_mMost.connectSmart(d)// what if we cannot connect?
  }
}

/**
 * `this` is the comment node.
 * `this.type === eYo.TKN.COMMENT`
 * @param {Object} a brick
 */
eYo.Node_p.comment2Brick = function (owner) {
  var brick = eYo.Brick.newReady(owner, eYo.T3.Stmt.comment_stmt)
  brick.comment_p = this.n_comment
  console.log('ONE COMMENT', this.n_comment)
  return brick
}

/**
 * `this` is the comment node.
 * `this.type === eYo.TKN.TYPE_COMMENT`
 * @param {Object} a brick
 */
eYo.Node_p.typeComment2Brick = function (owner) {
  var slgt = eYo.Brick.newReady(owner, eYo.T3.Stmt.comment_stmt)
  brick.comment_p = this.n0.n_str
  return slgt
}

/**
 * `this` is the simple statement node.
 * `this.type === eYo.TKN.simple_stmt`
 * @param {Object} a brick
 */
eYo.Node_p.simple_stmt2Brick = function (owner) {
  // simple_stmt: small_stmt (';' small_stmt)* [';'] NEWLINE
  var n = this.n0
  var brick = n.toBrick(owner)
  var d = brick
  var m4t = d.right_mMost
  while ((n = n.sibling)) {
    if (n.type === eYo.TKN.SEMI) {
      n = n.sibling
      if (n.type === eYo.TKN.simple_stmt) {
        var dd = n.toBrick(owner)
        if (dd) {
          m4t.connect(dd.left_m)
          m4t = dd.right_mMost
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
      brick.pendingComments = comments.map(n => n.toBrick(owner))
    }
    break
  }
  return brick
}

/**
 * `this` is the NAME node.
 * `this.type === eYo.TKN.NAME`
 * @param {Object} a brick
 */
eYo.Node_p.NAME2Brick = function (owner) {
  var brick = eYo.Brick.newReady(owner, {
    type: eYo.T3.Expr.identifier,
    target_p: this.n_str
  })
  brick.variant_p = eYo.Key.NONE
  return brick
}

/**
 * `this` is the dotted_name node.
 * `this.type === eYo.TKN.dotted_name`
 * @param {Object} a brick
 */
eYo.Node_p.dotted_name2Brick = function (owner) {
  // dotted_name: NAME ('.' NAME)*
  var n = this.n0
  var brick = eYo.Brick.newReady(owner, {
    type: eYo.T3.Expr.identifier,
    target_p: n.n_str
  })
  while ((n = n.sibling) && (n = n.sibling)) {
    var dd = eYo.Brick.newReady(owner, {
      type: eYo.T3.Expr.identifier,
      target_p: n.n_str
    })
    dd.holder_s.connect(brick)
    brick = dd
  }
  return brick
}

/**
 * `this` is the comp_iter node.
 * `this.type === eYo.TKN.comp_iter`
 * @param {Object} a brick
 */
eYo.Node_p.comp_iter2Brick = function (board) {
  // comp_iter: comp_for | comp_if
  var n = this.n0
  if (n.type === eYo.TKN.comp_if) {
    return n.comp_if2Brick(board)
  } else if (n.type === eYo.TKN.comp_for) {
    if (n.n1) {
      var b = n.n1.sync_comp_for2Brick(board)
      brick.async_ = true
      return b
    } else {
      return n.n0.sync_comp_for2Brick(board)
    }
  } else {
    console.error(`UNEXPECTED brick type: ${n.type}`)
    return n.toBrick(board)
  }
}

/**
 * Converts the node `n` to a visual brick.
 * `this.type === eYo.TKN.comp_for`
 * @param {eYo.Brick.Dflt} brick  a brick with a 'for' slot.
 */
eYo.Node_p.comp_forInBrick = function (brick) {
  // comp_for: ['async'] sync_comp_for
  this.last_child.sync_comp_forInBrick(brick)
  if (this.n1) {
    brick.async_ = true
    console.error('async is not supported')
  }
}

/**
 * Converts the node `n` to a visual brick.
 * `this.type === eYo.TKN.sync_comp_for`
 * @param {eYo.Brick.Dflt} brick  a brick with a 'for' slot.
 */
eYo.Node_p.sync_comp_forInBrick = function (brick) {
  // 'for' exprlist 'in' or_test [comp_iter]
  this.n1.exprlistInBrick(brick.for_b)
  brick.in_s.connect(this.n3.toBrick(brick))
  var n = this.n4
  n && (brick.comp_iter = n.comp_iter2Brick(brick))
}

/**
 * `this` is the sync_comp_for node.
 * `this.type === eYo.TKN.sync_comp_for`
 * @param {Object} a brick
 */
eYo.Node_p.sync_comp_for2Brick = function (board) {
  // 'for' exprlist 'in' or_test [comp_iter]
  var brick = eYo.Brick.newReady(board, eYo.T3.Expr.comp_for)
  this.sync_comp_forInBrick(brick)
  return brick
}

/**
 * `this` is the comp_if node.
 * `this.type === eYo.TKN.comp_if`
 * @param {Object} a brick
 */
eYo.Node_p.comp_if2Brick = function (board) {
  // 'if' test_nocond [comp_iter]
  var brick = eYo.Brick.newReady(board, eYo.T3.Expr.comp_if)
  brick.if_s.connect(this.n1.toBrick(board))
  var n = this.n2
  n && (brick.comp_iter = n.comp_iter2Brick(board))
  return brick
}

/**
 * `this` is the for_stmt node.
 * `this.type === eYo.TKN.for_stmt`
 * @param {Object} a brick
 */
eYo.Node_p.for_stmt2Brick = function (board) {
  // 'for' exprlist 'in' testlist ':' suite ['else' ':' suite]
  var brick = eYo.Brick.newReady(board, eYo.T3.Stmt.for_part)
  var n = this.n1
  n.exprlistInBrick(brick.for_b)
  n = n.sibling.sibling
  n.testlistInBrick(brick.in_b)
  n = n.sibling.sibling
  n.suiteInBrick(brick)
  if ((n = n.sibling.sibling.sibling)) {
    var dd = eYo.Brick.newReady(board, eYo.T3.Stmt.else_part)
    n.suiteInBrick(dd)
    brick.footConnect(dd)
  }
  return b
}

/**
 * `this` is the namedexpr_test node.
 * `this.type === eYo.TKN.namedexpr_test`
 * @param {Object} a brick
 */
eYo.Node_p.namedexpr_test2Brick = function (board) {
  // test [':=' test]
  var brick = this.n0.toBrick(board)
  var n = this.n2
  if (n) {
    // if this is already an identifier
    if (brick.type !== eYo.T3.Expr.identifier) {
      var dd = eYo.Brick.newReady(board, eYo.T3.Expr.identifier)
      if (dd.target_b.connectLast(brick)) {
        brick = dd
      } else {
        console.error('IMPOSSIBLE CONNECTION:', dd, brick)
      }
    }
    // b is an identifier, turn it into an identifier_valued
    // before any connection
    brick.variant_p = eYo.Key.COL_VALUED
    dd = n.toBrick(board)
    if (!brick.value_b.connectLast(dd)) {
      console.error('IMPOSSIBLE CONNECTION:', brick, dd)
    }
  }
  return brick
}

/**
 * `this` is the if_stmt node.
 * `this.type === eYo.TKN.if_stmt`
 * @param {Object} a brick
 */
eYo.Node_p.if_stmt2Brick = function (board) {
  // 'if' namedexpr_test ':' suite ('elif' namedexpr_test ':' suite)* ['else' ':' suite]
  var brick = eYo.Brick.newReady(board, eYo.T3.Stmt.if_part)
  var n = this.n1
  brick.if_s.connect(n.namedexpr_test2Brick(board))
  n = n.sibling.sibling
  n.suiteInBrick(brick)
  var dd = brick
  while ((n = n.sibling)) {
    var m4t = dd.foot_m
    if ((n.n_str === 'elif')) {
      dd = eYo.Brick.newReady(board, eYo.T3.Stmt.elif_part)
      n = n.sibling
      dd.if_s.connect(n.namedexpr_test2Brick(board))
    } else /* n.n_str === 'else' */ {
      dd = eYo.Brick.newReady(board, eYo.T3.Stmt.else_part)
    }
    n = n.sibling.sibling
    n.suiteInBrick(dd)
    m4t.connectSmart(dd)
  }
  return brick
}

/**
 * `this` is the while_stmt node.
 * We coud have merged with the if_stmt2Brick above.
 * `this.type === eYo.TKN.while_stmt`
 * @param {Object} a brick
 */
eYo.Node_p.while_stmt2Brick = function (board) {
  // 'while' namedexpr_test ':' suite ['else' ':' suite]
  var brick = eYo.Brick.newReady(board, eYo.T3.Stmt.while_part)
  var n = this.n1
  brick.if_s.connect(n.namedexpr_test2Brick(board))
  n = n.sibling.sibling
  n.suiteInBrick(brick)
  var dd = brick
  if ((n = n.sibling)) {
    var m4t = dd.foot_m
    dd = eYo.Brick.newReady(board, eYo.T3.Stmt.else_part)
    n.sibling.sibling.suiteInBrick(dd)
    m4t.connectSmart(dd)
  }
  return brick
}

/**
 * `this` is the try_stmt node.
 * `this.type === eYo.TKN.try_stmt`
 * @param {Object} a brick
 */
eYo.Node_p.try_stmt2Brick = function (board) {
  /*try_stmt: ('try' ':' suite
           ((except_clause ':' suite)+
            ['else' ':' suite]
            ['finally' ':' suite] |
           'finally' ':' suite))*/
  // NO consistency test
  var root = eYo.Brick.newReady(board, eYo.T3.Stmt.try_part)
  var n = this.n2
  n.suiteInBrick(root)
  var brick = root
  while ((n = n.sibling)) {
    if (n.type === eYo.TKN.except_clause) {
      // 'except' [test ['as' NAME]]
      var dd = eYo.Brick.newReady(board, eYo.T3.Stmt.except_part)
      var nn = n.n1
      if (nn) {
        dd.expression_s.connect(nn.toBrick(board))
      }
      if ((nn = n.n3)) {
        dd.alias_s.connect(nn.NAME2Brick(board))
      }
    } else if (n.n_str === 'else') {
      dd = eYo.Brick.newReady(board, eYo.T3.Stmt.else_part)
    } else if (n.n_str === 'finally') {
      dd = eYo.Brick.newReady(board, eYo.T3.Stmt.finally_part)
    } else {
      console.error(`Unknown node type: {n.name}`)
      break
    }
    n = n.sibling.sibling
    n.suiteInBrick(dd)
    brick = brick.footConnect(dd)
  }
  return root
}

/**
 * `this` is the with_stmt node.
 * `this.type === eYo.TKN.with_stmt`
 * @param {Object} a brick
 */
eYo.Node_p.with_stmt2Brick = function (board) {
  // 'with' with_item (',' with_item)*  ':' suite
  var root = eYo.Brick.newReady(board, eYo.T3.Stmt.with_part)
  var with_b = root.with_b
  var n = this.n1
  do {
    // with_item: test ['as' expr]
    var nn = n.n2
    if (nn) {
      var dd = eYo.Brick.newReady(board, eYo.T3.Expr.identifier)
      dd.alias_s.connect(nn.toBrick(board))
      dd.target_b.connectLast(n.n0.toBrick(board))
    } else {
      dd = n.n0.toBrick(board)
    }
    with_b.connectLast(dd)
  } while ((n = n.sibling) && n.type === eYo.TKN.COMMA && (n = n.sibling))
  // n.type === eYo.TKN.COLON
  n.sibling.suiteInBrick(root)
  return root
}

/**
 * `this` is the funcdef node.
 * `this.type === eYo.TKN.funcdef`
 * @param {Object} a brick
 */
eYo.Node_p.funcdef2Brick = function (board) {
  // 'def' NAME parameters ['->' test] ':' [TYPE_COMMENT] func_body_suite
  var root = eYo.Brick.newReady(board, eYo.T3.Stmt.funcdef_part)
  root.name_p = this.n1.n_str
  // parameters: '(' [typedargslist] ')'
  var n = this.n2.n1
  if (n.type !== eYo.TKN.RPAR) {
    n.typedargslistInBrick(root.parameters_b)
  }
  n = this.n4
  if (this.n3.type === eYo.TKN.RARROW) {
    root.type_s.connect(n.toBrick(board))
    root.variant_p = eYo.Key.TYPE
    n = n.sibling.sibling
  }
  if (n.type === eYo.TKN.TYPE_COMMENT) {
    root.right_m.connectSmart(n.typeComment2Brick(board))
    n = n.sibling
  }
  n.func_body_suiteInBrick(root)
  return root
}

/**
 * `this` is the classdef node.
 * `this.type === eYo.TKN.classdef`
 * @param {Object} a brick
 */
eYo.Node_p.classdef2Brick = function (board) {
  // 'class' NAME ['(' [arglist] ')'] ':' suite
  var root = eYo.Brick.newReady(board, eYo.T3.Stmt.classdef_part)
  var n = this.n1
  root.name_p = n.n_str
  n = n.sibling
  if (n.type === eYo.TKN.LPAR) {
    root.variant_p = eYo.Key.N_ARY
    n = n.sibling
    if (n.type !== eYo.TKN.RPAR) {
      n.arglistInBrick(root.n_ary_b)
      n = n.sibling
    }
    n = n.sibling // skip the ')'
  }
  n.sibling.suiteInBrick(root)
  return root
}

/**
 * `this` is the decorated node.
 * `this.type === eYo.TKN.decorated`
 * @param {Object} a brick
 */
eYo.Node_p.decorated2Brick = function (board) {
  /*
decorators: decorator+
decorated: decorators (classdef | funcdef | async_funcdef)
*/
  // all the decorators:
  var n = this.n0.n0
  var root = n.decorator2Brick(board)
  var brick = root
  while ((n = n.sibling)) {
    brick = brick.footConnect(n.decorator2Brick(board))
  }
  n = this.n1
  if (n.type === eYo.TKN.classdef) {
    brick.footConnect(n.classdef2Brick(board))
  } else if (n.type === eYo.TKN.funcdef) {
    brick.footConnect(n.funcdef2Brick(board))
  } else if (n.type === eYo.TKN.async_funcdef) {
    brick.footConnect(n.n1.funcdef2Brick(board)).async_ = true
  } else {
    console.error(`UNEXPECTED node type: ${n.type}`)
  }
  return root
}

/**
 * `this` is the decorator node.
 * `this.type === eYo.TKN.decorator`
 * @param {Object} a brick
 */
eYo.Node_p.decorator2Brick = function (board) {
  // decorator: '@' dotted_name [ '(' [arglist] ')' ] NEWLINE
  var brick = eYo.Brick.newReady(board, eYo.T3.Stmt.decorator_stmt)
  var n = this.n1
  brick.name_p = n.n_child.map(child => child.type === eYo.TKN.NAME ? child.n_str : '.').join('')
  n = n.sibling
  if (n.n_type === eYo.TKN.LPAR) {
    brick.variant_p = eYo.Key.N_ARY
    n = n.sibling
    if (n.n_type !== eYo.TKN.RPAR) {
      n.arglistInBrick(brick.n_ary_b)
      n = n.sibling
    }
    n = n.sibling
  }
  var comments = n.comments
  if (comments.length) {
    var m4t = brick.foot_mMost
    comments.forEach(n => {
      var m = m4t.connectSmart(n.toBrick(board))
      m && (m = m4t)
    })
  }
  return brick
}

/**
 * `this` is the tfpdef2Brick node.
 * `this.type === eYo.TKN.tfpdef`
 * @param {Object} a brick
 */
eYo.Node_p.tfpdef2Brick = function (board) {
  /* tfpdef: NAME [':' test] */
  var brick = eYo.Brick.newReady(board, eYo.T3.Expr.identifier)
  var n = this.n0
  brick.target_p = n.n_str
  if ((n = this.n2)) {
    brick.annotated_s.connect(n.toBrick(board))
    brick.variant_p = eYo.Key.ANNOTATED
  }
  return brick
}

/**
 * `this` is the first node of a typedargslist.
 * `this.type === eYo.TKN.typedargslist`
 * @param {eYo.Brick.Dflt} brick  a brick
 */
eYo.Node_p.typedargslistInBrick = function (brick) {
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
          var d = brick.connectLast(eYo.T3.Expr.parameter_star)
          d.modified_s.connect(n.tfpdef2Brick(brick.board))
          if (!(n = n.sibling)) {
            return
          }
        } else {
          brick.connectLast(eYo.T3.Expr.star)
        }
        // n is the comma
        if ((n = n.sibling)) { // skip the comma
          continue
        }
      } else {
        brick.connectLast(eYo.T3.Expr.star)
      }
    } else if (n.type === eYo.TKN.DOUBLESTAR) {
      d = brick.connectLast(eYo.T3.Expr.parameter_star_star)
      n = n.sibling
      d.modified_s.connect(n.tfpdef2Brick(brick.board))
      if ((n = n.sibling)) { // comma
        n = n.sibling
        continue
      }
    } else {
      d = brick.connectLast(n.tfpdef2Brick(brick))
      if ((n = n.sibling)) {
        if (n.type === eYo.TKN.EQUAL) {
          d.variant_p = d.variant_p === eYo.Key.ANNOTATED
          ? eYo.Key.ANNOTATED_VALUED
          : eYo.Key.TARGET_VALUED
          n = n.sibling
          d.value_b.connectLast(n.toBrick(brick))
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
 * @param {Object} a brick
 */
eYo.Node_p.knownListInBrick = function (brick, toBrick) {
  var n = this.n0
  while (true) {
    var d = toBrick.call(n, brick)
    if (!d) {
      console.error('MISSING BLOCK', toBrick.call(n, brick))
    }
    brick.connectLast(d)
    if ((n = n.sibling)) {
      if ((n = n.sibling)) {
        continue
      }
      brick.orphan_comma_p = true
    } // goddle comma
    break
  }
}

/**
 * `this` is the first node of a typedargslist.
 * @param {Object} a brick
 */
eYo.Node_p.do_list = function (brick) {
  var n = this.n0
  do {
    var d = n.toBrick(brick)
    if (!d) {
      console.error('MISSING BLOCK', n.toBrick(brick))
    }
    if (!brick.connectLast(d)) {
      console.error('NO CONNECTION, BREAK HERE', n.toBrick(brick), brick.connectLast(d))
    }
  } while ((n = n.sibling) && (n = n.sibling)) // goddle comma
}

eYo.Node_p.exprlistInBrick =
eYo.Node_p.arglistInBrick =
eYo.Node_p.testlistInBrick =
eYo.Node_p.testlist_star_exprInBrick =
eYo.Node_p.subscriptlistInBrick = eYo.Node_p.do_list

/**
 * `this` is binary expression.
 * @param {eYo.Board|eYo.Brick} owner
 * @param {String} type
 * @param {String} op
 */
eYo.Node_p.binary2Brick = function (owner, type, op) {
  var n0 = this.n0
  var n1
  var root = n0.toBrick(owner)
  while ((n1 = n0.sibling) && (n0 = n1.sibling)) {
    var brick = eYo.Brick.newReady(owner, type)
    brick.lhs_s.connect(root)
    brick.operator_p = (op && op(n1)) || n1.n_str
    brick.rhs_s.connect(n0.toBrick(owner))
    root = brick
  }
  return root
}

/**
 * `this` is yield expression.
 * `this.type === eYo.TKN.yield_expr`
 * @param {Object} owner
 */
eYo.Node_p.yield_expr2Brick = function (owner) {
  /*yield_expr: 'yield' [yield_arg]
yield_arg: 'from' test | testlist_star_expr */
  var brick = eYo.Brick.newReady(owner, eYo.T3.Expr.yield_expr)
  this.yield_exprInBrick(brick)
  return brick
}

/**
 * `this` is a yield_expr.
 * `this.type === eYo.TKN.yield_expr`
 * @param {Object} a brick
 */
eYo.Node_p.yield_exprInBrick = function (brick) {
  var n = this.n1
  if (n) {
    if (n.n1) {
      brick.from_s.connect(n.n1.toBrick(brick))
    } else {
      n.n0.testlist_star_exprInBrick(brick.expression_b)
    }
  }
}

/**
 * `this` is a yield_expr.
 * `this.type === eYo.TKN.yield_expr`
 * @param {Object} brick  a delegate
 */
eYo.Node_p.yield_exprInListBrick = function (brick) {
  brick.connectLast(this.yield_expr2Brick(brick))
}

/**
 * `this` is the first node of a typedargslist.
 * `this.type === eYo.TKN.varargslist`
 * @param {Object} a brick
 */
eYo.Node_p.varargslistInBrick = function (brick) {
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
          var d = brick.connectLast(eYo.T3.Expr.parameter_star)
          d.modified_s.connect(n.n0.NAME2Brick(brick))
          if (!(n = n.sibling)) {
            return
          }
        } else {
          brick.connectLast(eYo.T3.Expr.star)
        }
        if ((n = n.sibling)) { // skip the comma
          continue
        }
      } else {
        brick.connectLast(eYo.T3.Expr.star)
      }
    } else if (n.type === eYo.TKN.DOUBLESTAR) {
      d = brick.connectLast(eYo.T3.Expr.parameter_star_star)
      n = n.sibling
      d.modified_s.connect(n.n0.NAME2Brick(brick))
      if ((n = n.sibling)) { // comma
        n = n.sibling
        continue
      }
    } else {
      d = brick.connectLast(n.n0.NAME2Brick(brick))
      if ((n = n.sibling)) {
        if (n.type === eYo.TKN.EQUAL) {
          d.variant_p = eYo.Key.TARGET_VALUED
          n = n.sibling
          d.value_b.connectLast(n.toBrick(brick))
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
 * @param {eYo.Brick.Dflt} brick  a brick
 */
eYo.Node_p.dictorsetmakerInBrick = function (brick) {
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
      brick.connectLast(this.comprehension2Brick(brick))
      brick.variant_p = eYo.Key.BRACE
      return brick
    } else if ((n2 = n1.sibling)) {
      if (n2.n_type === eYo.TKN.comp_for) {
        // set comprehension with '**'
        // this is a syntax error but I still consider it to be valid
        var root = eYo.Brick.newReady(brick, eYo.T3.Expr.comprehension)
        var dd = eYo.Brick.newReady(brick, eYo.T3.Expr.expression_star_star)
        root.expression_s.connect(dd)
        brick.modified_s.connect(n1.toBrick(brick))
        n2.comprehensionInBrick(brick)
        return brick
      } else if ((n3 = n2.sibling)) {
        if (n3.n_type === eYo.TKN.comp_for) {
          // dict comprehension
          brick.connectLast(this.dict_comprehension2Brick(brick))
          return brick
        }
      }
    }
  }
  // no comprehension
  while (true) {
    if (n.n_type === eYo.TKN.DOUBLESTAR) {
      var dd = eYo.Brick.newReady(brick, eYo.T3.Expr.expression_star_star)
      brick.connectLast(dd)
      if ((n1 = n.sibling)) {
        dd.modified_s.connect(n1.toBrick(brick))
        if ((n1 = n1.sibling) && (n = n1.sibling)) {
          continue
        }
      }
    } else {
      dd = n.toBrick(brick)
      if ((n1 = n.sibling)) {
        if (n1.n_type === eYo.TKN.COLON) {
          var ddd = eYo.Brick.newReady(brick, eYo.T3.Expr.key_datum)
          brick.connectLast(ddd)
          ddd.target_b.connectLast(dd)
          if ((n2 = n1.sibling)) {
            ddd.annotated_s.connect(n2.toBrick(brick))
            if ((n3 = n2.sibling) && (n = n3.sibling)) {
              continue
            }
          }
        } else {
          brick.connectLast(dd)
          if ((n = n1.sibling)) {
            continue
          }
        }
      } else {
        brick.connectLast(dd)
      }
    }
    return brick
  }
}

/**
 * Partially converts the node `this` to a visual brick.
 * `this.n_type === eo.TKN.comp_for`
 * @param {eYo.Brick.Dflt} brick a brick
 */
eYo.Node_p.comprehensionInBrick = function (brick) {
  this.comp_forInBrick(brick)
  var for_if_b = brick.for_if_b
  var d = brick
  var dd
  while ((dd = d.comp_iter)) {
    d.comp_iter = eYo.NA
    for_if_b.connectLast((d = dd))
  }
}

/**
 * Converts the node `this` to a visual brick.
 * @param {Object} board  a board
 */
eYo.Node_p.comprehension2Brick = function (owner) {
  var brick = eYo.Brick.newReady(owner, eYo.T3.Expr.comprehension)
  brick.expression_s.connect(this.n0.toBrick(owner))
  this.n1.comprehensionInBrick(brick)
  return brick
}

/**
 * Converts the node `this` to a visual brick.
 * `this.type === eYo.TKN.dictorsetaker`
 * @param {Object} a brick
 */
eYo.Node_p.dict_comprehension2Brick = function (owner) {
  /*dictorsetmaker: (test ':' test | '**' expr) comp_for
    */
  var brick = eYo.Brick.newReady(owner, eYo.T3.Expr.dict_comprehension)
  var dd = eYo.Brick.newReady(owner, eYo.T3.Expr.key_datum)
  dd.target_b.connectLast(this.n0.toBrick(owner))
  dd.annotated_s.connect(this.n2.toBrick(owner))
  brick.expression_s.connect(dd)
  this.n3.comp_forInBrick(brick)
  var t = brick.for_if_b
  var d0 = brick
  var d1
  while ((d1 = d0.comp_iter)) {
    d0.comp_iter = eYo.NA
    t.connectLast((d0 = d1))
  }
  return brick
}

/**
 * Converts the node `n` to a visual brick.
 * `this.type === eYo.TKN.testlist_comp`
 * @param {Object} a brick
 */
eYo.Node_p.testlist_compInBrick = function (brick) {
  // (namedexpr_test|star_expr) ( comp_for | (',' (namedexpr_test|star_expr))* [','] )
  var n = this.n1
  if (n && n.n_type === eYo.TKN.comp_for) {
    brick.connectLast(this.comprehension2Brick(brick))
  } else {
    this.testlistInBrick(brick)
  }
}

/**
 * Converts the node `n` to a visual brick.
 * @param {Object} board A board.
 * @param {Object} a brick or an array of bricks
 */
eYo.Node_p.toBrick = function (board) {
  var root = this.toBrick_(board)
  if (this.comments) {
    var ds = this.comments.map(n => n.comment2Brick(board))
    if (root) {
      if (this.type === eYo.TKN.file_input) {
        ds.reverse().forEach(d => {
          if (d) {
            root.head = d
            root = d
          }
        })
      } else if (root.isBlank) {
        // connect all the bricks below root.
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
        root.commentBricks = ds
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
      root = eYo.Brick.newReady(board, eYo.T3.Stmt.blank_stmt)
    } else {
      console.error('BREAK HERE', this.toBrick_(board))
    }
  }
  return root
}

/**
 * Converts the node `n` to a visual brick.
 * @param {Object} board A board.
 * @param {Object} a brick or an array of bricks
 */
eYo.Node_p.toBrick_ = function (board) {
  // console.log(`node type: ${this.name}`)
  var root, d, d0, d1, d2, n, n0, n1, n2, i, s, t, m4t
  switch (this.n_type) {
    case eYo.TKN.file_input: // (NEWLINE | stmt)* ENDMARKER
      var bs = this.n_child.map(n => n.toBrick(board))
      if ((root = bs.shift())) {
        m4t = root.foot_mMost
        bs.forEach(dd => {
          var m = m4t.connectSmart(dd)
          m && (m4t = m)
        })
      }
      return root
    case eYo.TKN.simple_stmt:
      return this.simple_stmt2Brick(board)
    case eYo.TKN.expr_stmt: // testlist_star_expr (annassign | augassign (yield_expr|testlist) | [('=' (yield_expr|testlist_star_expr))+ [TYPE_COMMENT]] )
      n0 = this.n0
      if (!(n1 = n0.sibling)) {
        // simple expression statement: only a testlist_star_expr
        root = eYo.Brick.newReady(board, eYo.T3.Stmt.expression_stmt)
        n0.testlist_star_exprInBrick(root.value_b)
        // manage comments

        return root
      }
      if (n1.n_type === eYo.TKN.EQUAL) {
        // assignment,
        root = d1 = eYo.Brick.newReady(board, eYo.T3.Stmt.assignment_stmt)
        while (true) {
          // targets
          ;(n0.type === eYo.TKN.yield_expr ? n0.yield_exprInListBrick : n0.testlist_star_exprInBrick).call(n0, d1.target_b) // .call is necessary !
          // values
          n0 = n1.sibling
          if ((n1 = n0.sibling)) {
            if (n1.n_type === eYo.TKN.EQUAL) {
              d2 = eYo.Brick.newReady(board, eYo.T3.Expr.assignment_chain)
              if ((d = d1.value_b)) {
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
          ;(n0.type === eYo.TKN.yield_expr
            ? n0.yield_exprInListBrick
            : n0.testlist_star_exprInBrick).call(n0, d1.value_b)
          break
        }
      } else if (n1.type === eYo.TKN.augassign) { // augassign: ('+=' | '-=' | '*=' | '@=' | '/=' | '%=' | '&=' | '|=' | '^=' | '<<=' | '>>=' | '**=' | '//=')
        root = eYo.Brick.newReady(board, {
          type: eYo.T3.Stmt.augmented_assignment_stmt,
          operator_p: n1.n0.n_str
        })
        n0.testlist_star_exprInBrick(root.target_b)
        n2 = n1.sibling
        ;(n2.type === eYo.TKN.yield_expr
            ? n2.yield_exprInListBrick
            : n2.testlistInBrick).call(n2, root.value_b)
      } else if (n1.type === eYo.TKN.annassign) { // ':' test ['=' (yield_expr|testlist)]
        if ((s = n1.n3)) {
          root = eYo.Brick.newReady(board, eYo.T3.Stmt.annotated_assignment_stmt)
          n0.testlist_star_exprInBrick(root.target_b)
          d1 = n1.n1.toBrick(board)
          root.annotated_s.connect(d1)
          ;(s.type === eYo.TKN.yield_expr
            ? s.yield_exprInListBrick
            : s.testlistInBrick).call(s, root.value_b)
        } else {
          root = eYo.Brick.newReady(board, eYo.T3.Stmt.annotated_stmt)
          n0.testlist_star_exprInBrick(root.target_b)
          d1 = n1.n1.toBrick(board)
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
        root = n1.toBrick(board)
        root.await = true
        n0 = n1
      } else {
        root = n0.toBrick(board)
      }
      d0 = root
      // root is an atom
      // trailers ?
      while ((n0 = n0.sibling)) {
        // n0 is a trailer: '(' [arglist] ')' | '[' subscriptlist ']' | '.' NAME
        if (n0.n0.n_type === eYo.TKN.LPAR) {
          d = d0.n_ary_b
          if (d && d0.variant_p === eYo.Key.NONE) {
            d0.variant_p = eYo.Key.CALL_EXPR
          } else {
            root = eYo.Brick.newReady(board, eYo.T3.Expr.call_expr)
            root.target_b.connectLast(d0)
            d0 = root
            d = d0.n_ary_b
          }
          n1 = n0.n1
          if (n1.n_type !== eYo.TKN.RPAR) {
            n1.arglistInBrick(brick)
          }
        } else if (n0.n0.n_type === eYo.TKN.LSQB) {
          d = d0.slicing_b
          if (d && d0.variant_p === eYo.Key.NONE) {
            d0.variant_p = eYo.Key.SLICING
          } else {
            root = eYo.Brick.newReady(board, eYo.T3.Expr.slicing)
            root.target_b.connectLast(d0)
            d0 = root
            d = d0.slicing_b
          }
          n1 = n0.n1
          if (n1.n_type !== eYo.TKN.RSQB) {
            n1.subscriptlistInBrick(brick)
          }
        } else /* if (n0.n0.n_type === eYo.TKN.DOT) */ {
          if (!d0.dotted_d || d0.variant_p !== eYo.Key.NONE || d0.dotted_p !== 0) {
            root = n0.n1.NAME2Brick(board)
            root.holder_s.connect(d0)
            d0 = root
            d0.dotted_p = 1
          } else {
            d0.change.wrap(() => {
              if ((d = d0.target_s.unwrappedTarget)) {
                d0.holder_s.connect(d)
              } else {
                d0.holder_p = d0.target_p
                d0.target_p = ''
              }
              d0.dotted_p = 1
              d0.target_b.connectLast(n0.n1.NAME2Brick(board))
            })
          }
        }
      }
      return root
    case eYo.TKN.subscript: // test | [test] ':' [test] [sliceop] // sliceop: ':' [test]
      n0 = this.n0
      if (n0.type === eYo.TKN.test) {
        d0 = n0.toBrick(board)
        if (!(n0 = n0.sibling)) {
          return d0
        }
      }
      root = eYo.Brick.newReady(board, eYo.T3.Expr.proper_slice)
      d0 && (root.lower_bound_s.connect(d0))
      // n0.type === eYo.TKN.COLON
      if ((n0 = n0.sibling)) {
        if (n0.type === eYo.TKN.test) {
          root.upper_bound_s.connect(n0.toBrick(board))
          if (!(n0 = n0.sibling)) {
            return root
          }
        }
        root.variant_p = eYo.Key.STRIDE
        n0.n1 && (root.stride_s.connect(n0.n1.toBrick(board)))
      }
      return root
    case eYo.TKN.atom: //atom: ('(' [yield_expr|testlist_comp] ')' | '[' [testlist_comp] ']' | '{' [dictorsetmaker] '}') | NAME | NUMBER | STRING+ | '...' | 'None' | 'True' | 'False')
      n0 = this.n0
      if (n0.type === eYo.TKN.STRING) {
        var s = n0.n_str
        while ((n0 = n0.sibling)) {
          s += n0.n_str
        }
        return eYo.Brick.newReady(board, s) // THIS IS NOT COMPLETE
      }
      if ((n1 = n0.sibling)) {
        root = eYo.Brick.newReady(board, eYo.T3.Expr.enclosure)
        switch(n0.n_str) {
          case '(':
            t = eYo.Key.PAR
            s = n1.type === eYo.TKN.yield_expr
            ? n1.yield_exprInListBrick
            : n1.type === eYo.TKN.testlist_comp
              ? n1.testlist_compInBrick
              : null
            break
          case '[':
            t = eYo.Key.SQB
            s = n1.type === eYo.TKN.testlist_comp
            ? n1.testlist_compInBrick
            : null
            break
          case '{':
            t = eYo.Key.BRACE
            s = n1.type === eYo.TKN.dictorsetmaker
            ? n1.dictorsetmakerInBrick
            : null
            break
        }
        root.variant_p = t
        s && (s.call(n1, root))
        return root
      } else if (['...', 'None', 'True', 'False'].indexOf((s = n0.n_str)) < 0) {
        if (n0.type === eYo.TKN.NAME) {
          return n0.NAME2Brick(board)
        } else if (n0.type === eYo.TKN.NUMBER) {
          return eYo.Brick.newReady(board, {
            type: eYo.T3.Expr.numberliteral,
            value_p: s
          })
        } else /* STRING+ */ {
          d0 = root = eYo.Brick.newReady(board, {
            type: s.endsWith('"""') || s.endsWith("'''") ? eYo.T3.Expr.longliteral : eYo.T3.Expr.shortliteral,
            value_p: s
          })
          while ((n0 = n0.sibling)) {
            d0 = d0.next_string_block = eYo.Brick.newReady(board, {
              type: s.endsWith('"""') || s.endsWith("'''") ? eYo.T3.Expr.longliteral : eYo.T3.Expr.shortliteral,
              value_p: n0.n_str
            })
          }
        }
        return root
      } else {
        return eYo.Brick.newReady(board, {
          type: eYo.T3.Expr.builtin__object,
          value_p: s
        })
      }
    case eYo.TKN.star_expr: // star_expr: '*' expr
      root = eYo.Brick.newReady(board, eYo.T3.Expr.expression_star)
      root.modified_s.connect(this.n1.toBrick(board))
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
      root = n0.toBrick(board)
      while ((n1 = n0.sibling) && (n2 = n1.sibling)) {
        d0 = eYo.Brick.newReady(board, eYo.T3.Expr.m_expr)
        d0.operator_p = n1.n_str
        d0.lhs_s.connect(root)
        root = d0
        d0.rhs_s.connect(n2.toBrick(board))
        n0 = n2
      }
      return root
    case eYo.TKN.factor: // ('+'|'-'|'~') factor | power
      if ((n1 = this.n1)) {
        root = eYo.Brick.newReady(board, eYo.T3.Expr.unary)
        root.operator_p = this.n0.n_str
        root.rhs_s.connect(n1.toBrick(board))
      } else {
        return this.n0.toBrick(board)
      }
      return root
    case eYo.TKN.power: // atom_expr ['**' factor]
      d0 = this.n0.toBrick(board)
      if (d0.type === eYo.T3.Stmt.comment_stmt) {
        console.error("BREAK HERE", d0 = this.n0.toBrick(board))
      }
      if ((n2 = this.n2)) {
        root = eYo.Brick.newReady(board, eYo.T3.Expr.power)
        root.lhs_s.connect(d0)
        root.rhs_s.connect(n2.toBrick(board))
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
        root = eYo.Brick.newReady(board, eYo.T3.Expr.expression_star)
        root.modified_s.connect(n0.sibling.toBrick(board))
      } else if (n0.n_type === eYo.TKN.DOUBLESTAR) {
        root = eYo.Brick.newReady(board, eYo.T3.Expr.expression_star_star)
        root.modified_s.connect(n0.sibling.toBrick(board))
      } else if ((n1 = n0.sibling)) {
        if (n1.n_type === eYo.TKN.COLONEQUAL) {
          root = eYo.Brick.newReady(board, eYo.T3.Expr.named_expr)
          root.target_b.connectLast(n0.toBrick(board))
          root.value_b.connectLast(n1.sibling.toBrick(board))
        } else if (n1.n_type === eYo.TKN.EQUAL) {
          root = eYo.Brick.newReady(board, eYo.T3.Expr.identifier_valued)
          root.target_b.connectLast(n0.toBrick(board))
          root.value_b.connectLast(n1.sibling.toBrick(board))
        } else {
          root = this.comprehension2Brick(board)
        }
      } else {
        root = n0.toBrick(board)
      }
      return root
    case eYo.TKN.NAME: // test [':=' test]
      return this.NAME2Brick(board)
    case eYo.TKN.namedexpr_test: // test [':=' test]
      d0 = this.n0.toBrick(board)
      if ((n2 = this.n2)) {
        root = eYo.Brick.newReady(board, eYo.T3.Expr.named_expr)
        root.target_b.connectLast(d0)
        root.value_b.connectLast(n2.toBrick(board))
      } else {
        root = d0
      }
      return root
    case eYo.TKN.lambdef: // 'lambda' [varargslist] ':' test
      root = eYo.Brick.newReady(board, eYo.T3.Expr.lambda_expr)
      n = this.n
      if (n.type !== eYo.TKN.COLON) {
        n.varargslistInBrick(root.parameters_b)
        n = n.sibling
      }
      n = n.sibling
      root.expression_s.connect(n.toBrick(board))
      return root
    case eYo.TKN.lambdef_nocond: // 'lambda' [varargslist] ':' test_nocond
      root = eYo.Brick.newReady(board, eYo.T3.Expr.lambda_expr_nocond)
      n = this.n
      if (n.type !== eYo.TKN.COLON) {
        n.varargslistInBrick(root.parameters_b)
        n = n.sibling
      }
      n = n.sibling
      root.expression_s.connect(n.toBrick(board))
      return root
    case eYo.TKN.async_funcdef: // 'async' funcdef
      root = this.n1.funcdef2Brick(board)
      root.async_ = true
      return root
    case eYo.TKN.pass_stmt: // 'pass'
      return eYo.Brick.newReady(board, eYo.T3.Stmt.pass_stmt)
    case eYo.TKN.break_stmt: // 'break'
      return eYo.Brick.newReady(board, eYo.T3.Stmt.break_stmt)
    case eYo.TKN.continue_stmt: // 'continue'
      return eYo.Brick.newReady(board, eYo.T3.Stmt.continue_stmt)
    case eYo.TKN.compound_stmt: //
      /* compound_stmt: if_stmt | while_stmt | for_stmt | try_stmt | with_stmt | funcdef | classdef | decorated | async_stmt */
      n = this.n0
      switch(n.type) {
        case eYo.TKN.if_stmt: return n.if_stmt2Brick(board)
        case eYo.TKN.while_stmt: return n.while_stmt2Brick(board)
        case eYo.TKN.for_stmt: return n.for_stmt2Brick(board)
        case eYo.TKN.try_stmt: return n.try_stmt2Brick(board)
        case eYo.TKN.with_stmt: return n.with_stmt2Brick(board)
        case eYo.TKN.funcdef: return n.funcdef2Brick(board)
        case eYo.TKN.classdef: return n.classdef2Brick(board)
        case eYo.TKN.decorated: return n.decorated2Brick(board)
        case eYo.TKN.async_stmt:
          // async_stmt: 'async' (funcdef | with_stmt | for_stmt)
          n = n.n1
          switch(n.type) {
            case eYo.TKN.funcdef: root = n.funcdef2Brick(board); break
            case eYo.TKN.with_stmt: root = n.with_stmt2Brick(board); break
            case eYo.TKN.for_stmt: root = n.for_stmt2Brick(board); break
          }
          root.async_ = true
          return root
        default: console.error("BREAK HERE, UNEXPECTED NAME", n.name)
        throw 'ERROR'
      }
    case eYo.TKN.yield_expr:
      return this.yield_expr2Brick(board)
    case eYo.TKN.yield_stmt:
      root = eYo.Brick.newReady(board, eYo.T3.Stmt.yield_stmt)
      this.n0.yield_exprInBrick(root)
      return root
    case eYo.TKN.break_stmt:
      return eYo.Brick.newReady(board, eYo.T3.Stmt.break_stmt)
    case eYo.TKN.continue_stmt:
      return eYo.Brick.newReady(board, eYo.T3.Stmt.continue_stmt)
    case eYo.TKN.pass_stmt:
      return eYo.Brick.newReady(board, eYo.T3.Stmt.pass_stmt)
    case eYo.TKN.return_stmt: // 'return' [testlist_star_expr]
      root = eYo.Brick.newReady(board, eYo.T3.Stmt.return_stmt)
      ;(n = this.n1) && (n.testlist_star_exprInBrick(root.return_b))
      return root
    case eYo.TKN.import_stmt: // import_stmt: import_name | import_from
      n0 = this.n0
      if (n0.type === eYo.TKN.import_name) {
        //import_name: 'import' dotted_as_names
        root = eYo.Brick.newReady(board, eYo.T3.Stmt.import_stmt)
        var t = root.import_module_b
        n0.n1.knownListInBrick(t, function () {
          // dotted_as_name: dotted_name ['as' NAME]
          // dotted_name: NAME ('.' NAME)*
          if ((n2 = this.n2)) {
            var ddd = eYo.Brick.newReady(board, eYo.T3.Expr.identifier_as)
            brick.alias_p = n2.n_str
          } else {
            ddd = eYo.Brick.newReady(board, eYo.T3.Expr.identifier)
          }
          var s = this.n0.n_child.map(child => child.type === eYo.TKN.NAME ? child.n_str : '.').join('')
          brick.target_p = s
          return ddd
        })
        return root
      } else {
      /*
      ('from' (('.' | '...')* dotted_name | ('.' | '...')+)
                'import' ('*' | '(' import_as_names ')' | import_as_names))
        import_as_name: NAME ['as' NAME]*/
        root = eYo.Brick.newReady(board, eYo.T3.Stmt.import_stmt)
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
          var t = root.import_b
          if (n.type === eYo.TKN.LPAR) {
            n = n.sibling
            root.import_b.parenth_p = true
          }
          n.knownListInBrick(t, function () {
            // import_as_name: NAME ['as' NAME]
            var n = this.n2
            if (n) {
              var ddd = eYo.Brick.newReady(board, eYo.T3.Expr.identifier_as)
              brick.alias_p = n.n_str
            } else {
              ddd = eYo.Brick.newReady(board, eYo.T3.Expr.identifier)
            }
            brick.target_p = this.n0.n_str
            return ddd
          })
        }
        return root
      }
    case eYo.TKN.raise_stmt: // raise_stmt: 'raise' [test ['from' test]]
      root = eYo.Brick.newReady(board, eYo.T3.Stmt.raise_stmt)
      if ((n = this.n0.sibling)) {
        root.expression_s.connect(n.toBrick(board))
        root.variant_p = eYo.Key.EXPRESSION
        if ((n = n.sibling) && (n = n.sibling)) {
          root.from_s.connect(n.toBrick(board))
          root.variant_p = eYo.Key.FROM
        }
      }
      return root
    case eYo.TKN.or_test: // or_test: and_test ('or' and_test)*
      return this.binary2Brick(board, eYo.T3.Expr.or_test)
    case eYo.TKN.and_test: // and_expr: shift_expr ('&' shift_expr)*
      return this.binary2Brick(board, eYo.T3.Expr.and_test)
    case eYo.TKN.xor_expr: // xor_expr: and_expr ('^' and_expr)*
      return this.binary2Brick(board, eYo.T3.Expr.xor_expr)
    case eYo.TKN.and_expr:
      return this.binary2Brick(board, eYo.T3.Expr.and_expr)
    case eYo.TKN.shift_expr: // shift_expr: arith_expr (('<<'|'>>') arith_expr)*
      return this.binary2Brick(board, eYo.T3.Expr.shift_expr)
    case eYo.TKN.arith_expr: // arith_expr: term (('+'|'-') term)*
      return this.binary2Brick(board, eYo.T3.Expr.a_expr)
    case eYo.TKN.term: // term: factor (('*'|'@'|'/'|'%'|'//') factor)*
      return this.binary2Brick(board, eYo.T3.Expr.m_expr)
    case eYo.TKN.comparison: // expr (comp_op expr)*
      return this.binary2Brick(board, eYo.T3.Expr.comparison, n => n.n0.n_str)
    case eYo.TKN.namedexpr_test:
      return this.namedexpr_test2Brick(board)
    case eYo.TKN.global_stmt:
      // global_stmt: 'global' NAME (',' NAME)*
      root = eYo.Brick.newReady(board, eYo.T3.Stmt.global_stmt)
      t = root.identifiers_b
      n = this.n1
      do {
        t.connectLast(n.toBrick(board))
      } while ((n = n.sibling) && (n = n.sibling))
      return root
    case eYo.TKN.nonlocal_stmt:
      // nonlocal_stmt: 'nonlocal' NAME (',' NAME)*
      root = eYo.Brick.newReady(board, eYo.T3.Stmt.nonlocal_stmt)
      t = root.identifiers_b
      n = this.n1
      do {
        t.connectLast(n.toBrick(board))
      } while ((n = n.sibling) && (n = n.sibling))
      return root
    case eYo.TKN.NEWLINE:
      return eYo.Brick.newReady(board, eYo.T3.Stmt.blank_stmt)
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
        return this.n0.toBrick(board)
      } else {
        // eYo.GMR.showtree(eYo.GMR._PyParser_Grammar, this)
        console.error('BREAK HERE TO DEBUG', this.name, this.n_child)
        throw `3) NOTHING TO DO WITH ${this.name}`
      }
  }
}
