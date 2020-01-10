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

eYo.require('tkn')

eYo.require('gmr')

eYo.require('expr.Primary')

eYo.provide('node_Brick')

/**
 * Converts the receiver to a visual brick.
 * `this.type === eYo.tkn.Suite`.
 * @param {Object} a brick
 */
eYo.Node_p.suiteInBrick = function (brick) {
  // simple_stmt | NEWLINE INDENT stmt+ DEDENT
  var n = this.n0
  // suite: simple_stmt | NEWLINE INDENT stmt+ DEDENT
  if (n.n_type === eYo.tkn.NEWLINE) {
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
    } while ((n = n.sibling) && n.n_type !== eYo.tkn.DEDENT)
  } else {
    var d = n.simple_stmt2Brick(brick)
    brick.right_mMost.connectSmart(d)// what if we cannot connect?
  }
}

/**
 * `this` is the function body node.
 * `this.type === eYo.tkn.func_body_suite`.
 * @param {Object} a brick
 */
eYo.Node_p.func_body_suiteInBrick = function (brick) {
  var n = this.n0
  // func_body_suite: simple_stmt | NEWLINE [TYPE_COMMENT NEWLINE] INDENT stmt+ DEDENT
  if (n.n_type === eYo.tkn.NEWLINE) {
    var m4t = brick.suite_m
    var comments = n.comments
    if (comments.length) {
      comments.forEach(n => {
        m4t = m4t.connectSmart(n.toBrick(brick))
      })
    }
    n = n.sibling // skip NEWLINE
    if (n.n_type === eYo.tkn.TYPE_COMMENT) {
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
    } while ((n = n.sibling) && n.n_type !== eYo.tkn.DEDENT)
  } else {
    var d = n.simple_stmt2Brick(brick)
    brick.right_mMost.connectSmart(d)// what if we cannot connect?
  }
}

/**
 * `this` is the comment node.
 * `this.type === eYo.tkn.COMMENT`
 * @param {Object} a brick
 */
eYo.Node_p.comment2Brick = function (owner) {
  var brick = eYo.brick.newReady(owner, eYo.t3.stmt.comment_stmt)
  brick.Comment_p = this.n_comment
  console.log('ONE COMMENT', this.n_comment)
  return brick
}

/**
 * `this` is the comment node.
 * `this.type === eYo.tkn.TYPE_COMMENT`
 * @param {Object} a brick
 */
eYo.Node_p.typeComment2Brick = function (owner) {
  var slgt = eYo.brick.newReady(owner, eYo.t3.stmt.comment_stmt)
  brick.Comment_p = this.n0.n_str
  return slgt
}

/**
 * `this` is the simple statement node.
 * `this.type === eYo.tkn.Simple_stmt`
 * @param {Object} a brick
 */
eYo.Node_p.simple_stmt2Brick = function (owner) {
  // simple_stmt: small_stmt (';' small_stmt)* [';'] NEWLINE
  var n = this.n0
  var brick = n.toBrick(owner)
  var d = brick
  var m4t = d.right_mMost
  while ((n = n.sibling)) {
    if (n.type === eYo.tkn.SEMI) {
      n = n.sibling
      if (n.type === eYo.tkn.Simple_stmt) {
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
    // n.type === eYo.tkn.NEWLINE
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
 * `this.type === eYo.tkn.NAME`
 * @param {Object} a brick
 */
eYo.Node_p.nAME2Brick = function (owner) {
  var brick = eYo.brick.newReady(owner, {
    type: eYo.t3.expr.identifier,
    target_p: this.n_str
  })
  brick.Variant_p = eYo.key.NONE
  return brick
}

/**
 * `this` is the dotted_name node.
 * `this.type === eYo.tkn.Dotted_name`
 * @param {Object} a brick
 */
eYo.Node_p.dotted_name2Brick = function (owner) {
  // dotted_name: NAME ('.' NAME)*
  var n = this.n0
  var brick = eYo.brick.newReady(owner, {
    type: eYo.t3.expr.identifier,
    target_p: n.n_str
  })
  while ((n = n.sibling) && (n = n.sibling)) {
    var dd = eYo.brick.newReady(owner, {
      type: eYo.t3.expr.identifier,
      target_p: n.n_str
    })
    dd.holder_s.connect(brick)
    brick = dd
  }
  return brick
}

/**
 * `this` is the comp_iter node.
 * `this.type === eYo.tkn.Comp_iter`
 * @param {Object} a brick
 */
eYo.Node_p.comp_iter2Brick = function (board) {
  // comp_iter: comp_for | comp_if
  var n = this.n0
  if (n.type === eYo.tkn.Comp_if) {
    return n.comp_if2Brick(board)
  } else if (n.type === eYo.tkn.Comp_for) {
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
 * `this.type === eYo.tkn.Comp_for`
 * @param {eYo.brick.Dflt} brick  a brick with a 'for' slot.
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
 * `this.type === eYo.tkn.Sync_comp_for`
 * @param {eYo.brick.Dflt} brick  a brick with a 'for' slot.
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
 * `this.type === eYo.tkn.Sync_comp_for`
 * @param {Object} a brick
 */
eYo.Node_p.sync_comp_for2Brick = function (board) {
  // 'for' exprlist 'in' or_test [comp_iter]
  var brick = eYo.brick.newReady(board, eYo.t3.expr.comp_for)
  this.sync_comp_forInBrick(brick)
  return brick
}

/**
 * `this` is the comp_if node.
 * `this.type === eYo.tkn.Comp_if`
 * @param {Object} a brick
 */
eYo.Node_p.comp_if2Brick = function (board) {
  // 'if' test_nocond [comp_iter]
  var brick = eYo.brick.newReady(board, eYo.t3.expr.comp_if)
  brick.if_s.connect(this.n1.toBrick(board))
  var n = this.n2
  n && (brick.comp_iter = n.comp_iter2Brick(board))
  return brick
}

/**
 * `this` is the for_stmt node.
 * `this.type === eYo.tkn.for_stmt`
 * @param {Object} a brick
 */
eYo.Node_p.for_stmt2Brick = function (board) {
  // 'for' exprlist 'in' testlist ':' suite ['else' ':' suite]
  var brick = eYo.brick.newReady(board, eYo.t3.stmt.for_part)
  var n = this.n1
  n.exprlistInBrick(brick.for_b)
  n = n.sibling.sibling
  n.testlistInBrick(brick.in_b)
  n = n.sibling.sibling
  n.suiteInBrick(brick)
  if ((n = n.sibling.sibling.sibling)) {
    var dd = eYo.brick.newReady(board, eYo.t3.stmt.else_part)
    n.suiteInBrick(dd)
    brick.footConnect(dd)
  }
  return b
}

/**
 * `this` is the namedexpr_test node.
 * `this.type === eYo.tkn.namedexpr_test`
 * @param {Object} a brick
 */
eYo.Node_p.namedexpr_test2Brick = function (board) {
  // test [':=' test]
  var brick = this.n0.toBrick(board)
  var n = this.n2
  if (n) {
    // if this is already an identifier
    if (brick.type !== eYo.t3.expr.identifier) {
      var dd = eYo.brick.newReady(board, eYo.t3.expr.identifier)
      if (dd.target_b.connectLast(brick)) {
        brick = dd
      } else {
        console.error('IMPOSSIBLE CONNECTION:', dd, brick)
      }
    }
    // b is an identifier, turn it into an identifier_valued
    // before any connection
    brick.Variant_p = eYo.key.COL_VALUED
    dd = n.toBrick(board)
    if (!brick.value_b.connectLast(dd)) {
      console.error('IMPOSSIBLE CONNECTION:', brick, dd)
    }
  }
  return brick
}

/**
 * `this` is the if_stmt node.
 * `this.type === eYo.tkn.if_stmt`
 * @param {Object} a brick
 */
eYo.Node_p.if_stmt2Brick = function (board) {
  // 'if' namedexpr_test ':' suite ('elif' namedexpr_test ':' suite)* ['else' ':' suite]
  var brick = eYo.brick.newReady(board, eYo.t3.stmt.if_part)
  var n = this.n1
  brick.if_s.connect(n.namedexpr_test2Brick(board))
  n = n.sibling.sibling
  n.suiteInBrick(brick)
  var dd = brick
  while ((n = n.sibling)) {
    var m4t = dd.foot_m
    if ((n.n_str === 'elif')) {
      dd = eYo.brick.newReady(board, eYo.t3.stmt.elif_part)
      n = n.sibling
      dd.if_s.connect(n.namedexpr_test2Brick(board))
    } else /* n.n_str === 'else' */ {
      dd = eYo.brick.newReady(board, eYo.t3.stmt.else_part)
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
 * `this.type === eYo.tkn.while_stmt`
 * @param {Object} a brick
 */
eYo.Node_p.while_stmt2Brick = function (board) {
  // 'while' namedexpr_test ':' suite ['else' ':' suite]
  var brick = eYo.brick.newReady(board, eYo.t3.stmt.while_part)
  var n = this.n1
  brick.if_s.connect(n.namedexpr_test2Brick(board))
  n = n.sibling.sibling
  n.suiteInBrick(brick)
  var dd = brick
  if ((n = n.sibling)) {
    var m4t = dd.foot_m
    dd = eYo.brick.newReady(board, eYo.t3.stmt.else_part)
    n.sibling.sibling.suiteInBrick(dd)
    m4t.connectSmart(dd)
  }
  return brick
}

/**
 * `this` is the try_stmt node.
 * `this.type === eYo.tkn.try_stmt`
 * @param {Object} a brick
 */
eYo.Node_p.try_stmt2Brick = function (board) {
  /*try_stmt: ('try' ':' suite
           ((except_clause ':' suite)+
            ['else' ':' suite]
            ['finally' ':' suite] |
           'finally' ':' suite))*/
  // NO consistency test
  var root = eYo.brick.newReady(board, eYo.t3.stmt.try_part)
  var n = this.n2
  n.suiteInBrick(root)
  var brick = root
  while ((n = n.sibling)) {
    if (n.type === eYo.tkn.except_clause) {
      // 'except' [test ['as' NAME]]
      var dd = eYo.brick.newReady(board, eYo.t3.stmt.except_part)
      var nn = n.n1
      if (nn) {
        dd.expression_s.connect(nn.toBrick(board))
      }
      if ((nn = n.n3)) {
        dd.alias_s.connect(nn.NAME2Brick(board))
      }
    } else if (n.n_str === 'else') {
      dd = eYo.brick.newReady(board, eYo.t3.stmt.else_part)
    } else if (n.n_str === 'finally') {
      dd = eYo.brick.newReady(board, eYo.t3.stmt.finally_part)
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
 * `this.type === eYo.tkn.with_stmt`
 * @param {Object} a brick
 */
eYo.Node_p.with_stmt2Brick = function (board) {
  // 'with' with_item (',' with_item)*  ':' suite
  var root = eYo.brick.newReady(board, eYo.t3.stmt.with_part)
  var with_b = root.with_b
  var n = this.n1
  do {
    // with_item: test ['as' expr]
    var nn = n.n2
    if (nn) {
      var dd = eYo.brick.newReady(board, eYo.t3.expr.identifier)
      dd.alias_s.connect(nn.toBrick(board))
      dd.target_b.connectLast(n.n0.toBrick(board))
    } else {
      dd = n.n0.toBrick(board)
    }
    with_b.connectLast(dd)
  } while ((n = n.sibling) && n.type === eYo.tkn.COMMA && (n = n.sibling))
  // n.type === eYo.tkn.COLON
  n.sibling.suiteInBrick(root)
  return root
}

/**
 * `this` is the funcdef node.
 * `this.type === eYo.tkn.funcdef`
 * @param {Object} a brick
 */
eYo.Node_p.funcdef2Brick = function (board) {
  // 'def' NAME parameters ['->' test] ':' [TYPE_COMMENT] func_body_suite
  var root = eYo.brick.newReady(board, eYo.t3.stmt.funcdef_part)
  root.Name_p = this.n1.n_str
  // parameters: '(' [typedargslist] ')'
  var n = this.n2.n1
  if (n.type !== eYo.tkn.RPAR) {
    n.typedargslistInBrick(root.parameters_b)
  }
  n = this.n4
  if (this.n3.type === eYo.tkn.RARROW) {
    root.type_s.connect(n.toBrick(board))
    root.Variant_p = eYo.key.TYPE
    n = n.sibling.sibling
  }
  if (n.type === eYo.tkn.TYPE_COMMENT) {
    root.right_m.connectSmart(n.typeComment2Brick(board))
    n = n.sibling
  }
  n.func_body_suiteInBrick(root)
  return root
}

/**
 * `this` is the classdef node.
 * `this.type === eYo.tkn.Classdef`
 * @param {Object} a brick
 */
eYo.Node_p.classdef2Brick = function (board) {
  // 'class' NAME ['(' [arglist] ')'] ':' suite
  var root = eYo.brick.newReady(board, eYo.t3.stmt.classdef_part)
  var n = this.n1
  root.Name_p = n.n_str
  n = n.sibling
  if (n.type === eYo.tkn.LPAR) {
    root.Variant_p = eYo.key.N_ARY
    n = n.sibling
    if (n.type !== eYo.tkn.RPAR) {
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
 * `this.type === eYo.tkn.decorated`
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
  if (n.type === eYo.tkn.Classdef) {
    brick.footConnect(n.classdef2Brick(board))
  } else if (n.type === eYo.tkn.funcdef) {
    brick.footConnect(n.funcdef2Brick(board))
  } else if (n.type === eYo.tkn.Async_funcdef) {
    brick.footConnect(n.n1.funcdef2Brick(board)).async_ = true
  } else {
    console.error(`UNEXPECTED node type: ${n.type}`)
  }
  return root
}

/**
 * `this` is the decorator node.
 * `this.type === eYo.tkn.decorator`
 * @param {Object} a brick
 */
eYo.Node_p.decorator2Brick = function (board) {
  // decorator: '@' dotted_name [ '(' [arglist] ')' ] NEWLINE
  var brick = eYo.brick.newReady(board, eYo.t3.stmt.decorator_stmt)
  var n = this.n1
  brick.Name_p = n.n_child.map(child => child.type === eYo.tkn.NAME ? child.n_str : '.').join('')
  n = n.sibling
  if (n.n_type === eYo.tkn.LPAR) {
    brick.Variant_p = eYo.key.N_ARY
    n = n.sibling
    if (n.n_type !== eYo.tkn.RPAR) {
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
 * `this.type === eYo.tkn.tfpdef`
 * @param {Object} a brick
 */
eYo.Node_p.tfpdef2Brick = function (board) {
  /* tfpdef: NAME [':' test] */
  var brick = eYo.brick.newReady(board, eYo.t3.expr.identifier)
  var n = this.n0
  brick.Target_p = n.n_str
  if ((n = this.n2)) {
    brick.annotated_s.connect(n.toBrick(board))
    brick.Variant_p = eYo.key.ANNOTATED
  }
  return brick
}

/**
 * `this` is the first node of a typedargslist.
 * `this.type === eYo.tkn.typedargslist`
 * @param {eYo.brick.Dflt} brick  a brick
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
    if (n.type === eYo.tkn.STAR) {
      if ((n = n.sibling)) {
        if (n.type === eYo.tkn.tfpdef) {
          var d = brick.connectLast(eYo.t3.expr.parameter_star)
          d.modified_s.connect(n.tfpdef2Brick(brick.board))
          if (!(n = n.sibling)) {
            return
          }
        } else {
          brick.connectLast(eYo.t3.expr.star)
        }
        // n is the comma
        if ((n = n.sibling)) { // skip the comma
          continue
        }
      } else {
        brick.connectLast(eYo.t3.expr.star)
      }
    } else if (n.type === eYo.tkn.DOUBLESTAR) {
      d = brick.connectLast(eYo.t3.expr.parameter_star_star)
      n = n.sibling
      d.modified_s.connect(n.tfpdef2Brick(brick.board))
      if ((n = n.sibling)) { // comma
        n = n.sibling
        continue
      }
    } else {
      d = brick.connectLast(n.tfpdef2Brick(brick))
      if ((n = n.sibling)) {
        if (n.type === eYo.tkn.EQUAL) {
          d.Variant_p = d.Variant_p === eYo.key.ANNOTATED
          ? eYo.key.ANNOTATED_VALUED
          : eYo.key.TARGET_VALUED
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
      brick.Orphan_comma_p = true
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
 * @param {eYo.board|eYo.brick.Dflt} owner
 * @param {String} type
 * @param {String} op
 */
eYo.Node_p.binary2Brick = function (owner, type, op) {
  var n0 = this.n0
  var n1
  var root = n0.toBrick(owner)
  while ((n1 = n0.sibling) && (n0 = n1.sibling)) {
    var brick = eYo.brick.newReady(owner, type)
    brick.lhs_s.connect(root)
    brick.Operator_p = (op && op(n1)) || n1.n_str
    brick.rhs_s.connect(n0.toBrick(owner))
    root = brick
  }
  return root
}

/**
 * `this` is yield expression.
 * `this.type === eYo.tkn.yield_expr`
 * @param {Object} owner
 */
eYo.Node_p.yield_expr2Brick = function (owner) {
  /*yield_expr: 'yield' [yield_arg]
yield_arg: 'from' test | testlist_star_expr */
  var brick = eYo.brick.newReady(owner, eYo.t3.expr.yield_expr)
  this.yield_exprInBrick(brick)
  return brick
}

/**
 * `this` is a yield_expr.
 * `this.type === eYo.tkn.yield_expr`
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
 * `this.type === eYo.tkn.yield_expr`
 * @param {Object} brick  a delegate
 */
eYo.Node_p.yield_exprInListBrick = function (brick) {
  brick.connectLast(this.yield_expr2Brick(brick))
}

/**
 * `this` is the first node of a typedargslist.
 * `this.type === eYo.tkn.varargslist`
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
    if (n.type === eYo.tkn.STAR) {
      if ((n = n.sibling)) {
        if (n.type !== eYo.tkn.COMMA) {
          var d = brick.connectLast(eYo.t3.expr.parameter_star)
          d.modified_s.connect(n.n0.NAME2Brick(brick))
          if (!(n = n.sibling)) {
            return
          }
        } else {
          brick.connectLast(eYo.t3.expr.star)
        }
        if ((n = n.sibling)) { // skip the comma
          continue
        }
      } else {
        brick.connectLast(eYo.t3.expr.star)
      }
    } else if (n.type === eYo.tkn.DOUBLESTAR) {
      d = brick.connectLast(eYo.t3.expr.parameter_star_star)
      n = n.sibling
      d.modified_s.connect(n.n0.NAME2Brick(brick))
      if ((n = n.sibling)) { // comma
        n = n.sibling
        continue
      }
    } else {
      d = brick.connectLast(n.n0.NAME2Brick(brick))
      if ((n = n.sibling)) {
        if (n.type === eYo.tkn.EQUAL) {
          d.Variant_p = eYo.key.TARGET_VALUED
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
 * `this.type === eYo.tkn.dictorsetmaker`
 * @param {eYo.brick.Dflt} brick  a brick
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
    if (n1.n_type === eYo.tkn.Comp_for) {
      // set comprehension
      brick.connectLast(this.comprehension2Brick(brick))
      brick.Variant_p = eYo.key.BRACE
      return brick
    } else if ((n2 = n1.sibling)) {
      if (n2.n_type === eYo.tkn.Comp_for) {
        // set comprehension with '**'
        // this is a syntax error but I still consider it to be valid
        var root = eYo.brick.newReady(brick, eYo.t3.expr.comprehension)
        var dd = eYo.brick.newReady(brick, eYo.t3.expr.expression_star_star)
        root.expression_s.connect(dd)
        brick.modified_s.connect(n1.toBrick(brick))
        n2.comprehensionInBrick(brick)
        return brick
      } else if ((n3 = n2.sibling)) {
        if (n3.n_type === eYo.tkn.Comp_for) {
          // dict comprehension
          brick.connectLast(this.dict_comprehension2Brick(brick))
          return brick
        }
      }
    }
  }
  // no comprehension
  while (true) {
    if (n.n_type === eYo.tkn.DOUBLESTAR) {
      var dd = eYo.brick.newReady(brick, eYo.t3.expr.expression_star_star)
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
        if (n1.n_type === eYo.tkn.COLON) {
          var ddd = eYo.brick.newReady(brick, eYo.t3.expr.key_datum)
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
 * @param {eYo.brick.Dflt} brick a brick
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
  var brick = eYo.brick.newReady(owner, eYo.t3.expr.comprehension)
  brick.expression_s.connect(this.n0.toBrick(owner))
  this.n1.comprehensionInBrick(brick)
  return brick
}

/**
 * Converts the node `this` to a visual brick.
 * `this.type === eYo.tkn.dictorsetaker`
 * @param {Object} a brick
 */
eYo.Node_p.dict_comprehension2Brick = function (owner) {
  /*dictorsetmaker: (test ':' test | '**' expr) comp_for
    */
  var brick = eYo.brick.newReady(owner, eYo.t3.expr.dict_comprehension)
  var dd = eYo.brick.newReady(owner, eYo.t3.expr.key_datum)
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
 * `this.type === eYo.tkn.testlist_comp`
 * @param {Object} a brick
 */
eYo.Node_p.testlist_compInBrick = function (brick) {
  // (namedexpr_test|star_expr) ( comp_for | (',' (namedexpr_test|star_expr))* [','] )
  var n = this.n1
  if (n && n.n_type === eYo.tkn.Comp_for) {
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
      if (this.type === eYo.tkn.file_input) {
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
    if (this.type === eYo.tkn.file_input) {
      root = eYo.brick.newReady(board, eYo.t3.stmt.blank_stmt)
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
    case eYo.tkn.file_input: // (NEWLINE | stmt)* ENDMARKER
      var bs = this.n_child.map(n => n.toBrick(board))
      if ((root = bs.shift())) {
        m4t = root.foot_mMost
        bs.forEach(dd => {
          var m = m4t.connectSmart(dd)
          m && (m4t = m)
        })
      }
      return root
    case eYo.tkn.Simple_stmt:
      return this.simple_stmt2Brick(board)
    case eYo.tkn.expr_stmt: // testlist_star_expr (annassign | augassign (yield_expr|testlist) | [('=' (yield_expr|testlist_star_expr))+ [TYPE_COMMENT]] )
      n0 = this.n0
      if (!(n1 = n0.sibling)) {
        // simple expression statement: only a testlist_star_expr
        root = eYo.brick.newReady(board, eYo.t3.stmt.expression_stmt)
        n0.testlist_star_exprInBrick(root.value_b)
        // manage comments

        return root
      }
      if (n1.n_type === eYo.tkn.EQUAL) {
        // assignment,
        root = d1 = eYo.brick.newReady(board, eYo.t3.stmt.assignment_stmt)
        while (true) {
          // targets
          ;(n0.type === eYo.tkn.yield_expr ? n0.yield_exprInListBrick : n0.testlist_star_exprInBrick).call(n0, d1.target_b) // .call is necessary !
          // values
          n0 = n1.sibling
          if ((n1 = n0.sibling)) {
            if (n1.n_type === eYo.tkn.EQUAL) {
              d2 = eYo.brick.newReady(board, eYo.t3.expr.assignment_chain)
              if ((d = d1.value_b)) {
                d.connectLast(d2)
                d1.Variant_p = eYo.key.TARGET_VALUED // necessary ?
              } else {
                console.error('ERROR')
              }
              d1 = d2
              continue
            } else {
              root.type_comment_node = n1
            }
          }
          ;(n0.type === eYo.tkn.yield_expr
            ? n0.yield_exprInListBrick
            : n0.testlist_star_exprInBrick).call(n0, d1.value_b)
          break
        }
      } else if (n1.type === eYo.tkn.Augassign) { // augassign: ('+=' | '-=' | '*=' | '@=' | '/=' | '%=' | '&=' | '|=' | '^=' | '<<=' | '>>=' | '**=' | '//=')
        root = eYo.brick.newReady(board, {
          type: eYo.t3.stmt.augmented_assignment_stmt,
          operator_p: n1.n0.n_str
        })
        n0.testlist_star_exprInBrick(root.target_b)
        n2 = n1.sibling
        ;(n2.type === eYo.tkn.yield_expr
            ? n2.yield_exprInListBrick
            : n2.testlistInBrick).call(n2, root.value_b)
      } else if (n1.type === eYo.tkn.Annassign) { // ':' test ['=' (yield_expr|testlist)]
        if ((s = n1.n3)) {
          root = eYo.brick.newReady(board, eYo.t3.stmt.annotated_assignment_stmt)
          n0.testlist_star_exprInBrick(root.target_b)
          d1 = n1.n1.toBrick(board)
          root.annotated_s.connect(d1)
          ;(s.type === eYo.tkn.yield_expr
            ? s.yield_exprInListBrick
            : s.testlistInBrick).call(s, root.value_b)
        } else {
          root = eYo.brick.newReady(board, eYo.t3.stmt.annotated_stmt)
          n0.testlist_star_exprInBrick(root.target_b)
          d1 = n1.n1.toBrick(board)
          if (d1.toString === 'str') {
            console.error('STOP HERE')
          }
          root.annotated_s.connect(d1)
        }
      }
      return root
    case eYo.tkn.Atom_expr: // ['await'] atom trailer*
      i = 0
      n0 = this.n0
      if (n0.n_type === eYo.tkn.NAME && n0.n_str === 'await') {
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
        if (n0.n0.n_type === eYo.tkn.LPAR) {
          d = d0.n_ary_b
          if (d && d0.Variant_p === eYo.key.NONE) {
            d0.Variant_p = eYo.key.CALL_EXPR
          } else {
            root = eYo.brick.newReady(board, eYo.t3.expr.call_expr)
            root.target_b.connectLast(d0)
            d0 = root
            d = d0.n_ary_b
          }
          n1 = n0.n1
          if (n1.n_type !== eYo.tkn.RPAR) {
            n1.arglistInBrick(brick)
          }
        } else if (n0.n0.n_type === eYo.tkn.LSQB) {
          d = d0.slicing_b
          if (d && d0.Variant_p === eYo.key.NONE) {
            d0.Variant_p = eYo.key.SLICING
          } else {
            root = eYo.brick.newReady(board, eYo.t3.expr.slicing)
            root.target_b.connectLast(d0)
            d0 = root
            d = d0.slicing_b
          }
          n1 = n0.n1
          if (n1.n_type !== eYo.tkn.RSQB) {
            n1.subscriptlistInBrick(brick)
          }
        } else /* if (n0.n0.n_type === eYo.tkn.DOT) */ {
          if (!d0.dotted_d || d0.Variant_p !== eYo.key.NONE || d0.Dotted_p !== 0) {
            root = n0.n1.NAME2Brick(board)
            root.holder_s.connect(d0)
            d0 = root
            d0.Dotted_p = 1
          } else {
            d0.change.wrap(() => {
              if ((d = d0.target_s.unwrappedTarget)) {
                d0.holder_s.connect(d)
              } else {
                d0.Holder_p = d0.Target_p
                d0.Target_p = ''
              }
              d0.Dotted_p = 1
              d0.target_b.connectLast(n0.n1.NAME2Brick(board))
            })
          }
        }
      }
      return root
    case eYo.tkn.Subscript: // test | [test] ':' [test] [sliceop] // sliceop: ':' [test]
      n0 = this.n0
      if (n0.type === eYo.tkn.test) {
        d0 = n0.toBrick(board)
        if (!(n0 = n0.sibling)) {
          return d0
        }
      }
      root = eYo.brick.newReady(board, eYo.t3.expr.proper_slice)
      d0 && (root.lower_bound_s.connect(d0))
      // n0.type === eYo.tkn.COLON
      if ((n0 = n0.sibling)) {
        if (n0.type === eYo.tkn.test) {
          root.upper_bound_s.connect(n0.toBrick(board))
          if (!(n0 = n0.sibling)) {
            return root
          }
        }
        root.Variant_p = eYo.key.STRIDE
        n0.n1 && (root.stride_s.connect(n0.n1.toBrick(board)))
      }
      return root
    case eYo.tkn.Atom: //atom: ('(' [yield_expr|testlist_comp] ')' | '[' [testlist_comp] ']' | '{' [dictorsetmaker] '}') | NAME | NUMBER | STRING+ | '...' | 'None' | 'True' | 'False')
      n0 = this.n0
      if (n0.type === eYo.tkn.STRING) {
        var s = n0.n_str
        while ((n0 = n0.sibling)) {
          s += n0.n_str
        }
        return eYo.brick.newReady(board, s) // THIS IS NOT COMPLETE
      }
      if ((n1 = n0.sibling)) {
        root = eYo.brick.newReady(board, eYo.t3.expr.enclosure)
        switch(n0.n_str) {
          case '(':
            t = eYo.key.PAR
            s = n1.type === eYo.tkn.yield_expr
            ? n1.yield_exprInListBrick
            : n1.type === eYo.tkn.testlist_comp
              ? n1.testlist_compInBrick
              : null
            break
          case '[':
            t = eYo.key.SQB
            s = n1.type === eYo.tkn.testlist_comp
            ? n1.testlist_compInBrick
            : null
            break
          case '{':
            t = eYo.key.BRACE
            s = n1.type === eYo.tkn.dictorsetmaker
            ? n1.dictorsetmakerInBrick
            : null
            break
        }
        root.Variant_p = t
        s && (s.call(n1, root))
        return root
      } else if (['...', 'None', 'True', 'False'].indexOf((s = n0.n_str)) < 0) {
        if (n0.type === eYo.tkn.NAME) {
          return n0.NAME2Brick(board)
        } else if (n0.type === eYo.tkn.NUMBER) {
          return eYo.brick.newReady(board, {
            type: eYo.t3.expr.numberliteral,
            value_p: s
          })
        } else /* STRING+ */ {
          d0 = root = eYo.brick.newReady(board, {
            type: s.endsWith('"""') || s.endsWith("'''") ? eYo.t3.expr.longliteral : eYo.t3.expr.shortliteral,
            value_p: s
          })
          while ((n0 = n0.sibling)) {
            d0 = d0.next_string_block = eYo.brick.newReady(board, {
              type: s.endsWith('"""') || s.endsWith("'''") ? eYo.t3.expr.longliteral : eYo.t3.expr.shortliteral,
              value_p: n0.n_str
            })
          }
        }
        return root
      } else {
        return eYo.brick.newReady(board, {
          type: eYo.t3.expr.builtin__object,
          value_p: s
        })
      }
    case eYo.tkn.Star_expr: // star_expr: '*' expr
      root = eYo.brick.newReady(board, eYo.t3.expr.expression_star)
      root.modified_s.connect(this.n1.toBrick(board))
    return root
    /*
term: factor (('*'|'@'|'/'|'%'|'//') factor)*
factor: ('+'|'-'|'~') factor | power
*/
    case eYo.tkn.xor_expr: // and_expr ('^' and_expr)*
    case eYo.tkn.And_expr: // shift_expr ('&' shift_expr)*
    case eYo.tkn.Shift_expr: // arith_expr (('<<'|'>>') arith_expr)*
    case eYo.tkn.Arith_expr: // term (('+'|'-') term)*
    case eYo.tkn.term: // factor (('*'|'@'|'/'|'%'|'//') factor)*
    case eYo.tkn.expr: // xor_expr ('|' xor_expr)*
      n0 = this.n0
      root = n0.toBrick(board)
      while ((n1 = n0.sibling) && (n2 = n1.sibling)) {
        d0 = eYo.brick.newReady(board, eYo.t3.expr.m_expr)
        d0.Operator_p = n1.n_str
        d0.lhs_s.connect(root)
        root = d0
        d0.rhs_s.connect(n2.toBrick(board))
        n0 = n2
      }
      return root
    case eYo.tkn.factor: // ('+'|'-'|'~') factor | power
      if ((n1 = this.n1)) {
        root = eYo.brick.newReady(board, eYo.t3.expr.unary)
        root.Operator_p = this.n0.n_str
        root.rhs_s.connect(n1.toBrick(board))
      } else {
        return this.n0.toBrick(board)
      }
      return root
    case eYo.tkn.power: // atom_expr ['**' factor]
      d0 = this.n0.toBrick(board)
      if (d0.type === eYo.t3.stmt.comment_stmt) {
        console.error("BREAK HERE", d0 = this.n0.toBrick(board))
      }
      if ((n2 = this.n2)) {
        root = eYo.brick.newReady(board, eYo.t3.expr.power)
        root.lhs_s.connect(d0)
        root.rhs_s.connect(n2.toBrick(board))
        return root
      } else {
        return d0
      }
    case eYo.tkn.Argument: /*argument: ( test [comp_for] |
      test ':=' test |
      test '=' test |
      '**' test |
      '*' test )*/
      n0 = this.n0
      if (n0.n_type === eYo.tkn.STAR) {
        root = eYo.brick.newReady(board, eYo.t3.expr.expression_star)
        root.modified_s.connect(n0.sibling.toBrick(board))
      } else if (n0.n_type === eYo.tkn.DOUBLESTAR) {
        root = eYo.brick.newReady(board, eYo.t3.expr.expression_star_star)
        root.modified_s.connect(n0.sibling.toBrick(board))
      } else if ((n1 = n0.sibling)) {
        if (n1.n_type === eYo.tkn.COLONEQUAL) {
          root = eYo.brick.newReady(board, eYo.t3.expr.named_expr)
          root.target_b.connectLast(n0.toBrick(board))
          root.value_b.connectLast(n1.sibling.toBrick(board))
        } else if (n1.n_type === eYo.tkn.EQUAL) {
          root = eYo.brick.newReady(board, eYo.t3.expr.identifier_valued)
          root.target_b.connectLast(n0.toBrick(board))
          root.value_b.connectLast(n1.sibling.toBrick(board))
        } else {
          root = this.comprehension2Brick(board)
        }
      } else {
        root = n0.toBrick(board)
      }
      return root
    case eYo.tkn.NAME: // test [':=' test]
      return this.NAME2Brick(board)
    case eYo.tkn.namedexpr_test: // test [':=' test]
      d0 = this.n0.toBrick(board)
      if ((n2 = this.n2)) {
        root = eYo.brick.newReady(board, eYo.t3.expr.named_expr)
        root.target_b.connectLast(d0)
        root.value_b.connectLast(n2.toBrick(board))
      } else {
        root = d0
      }
      return root
    case eYo.tkn.lambdef: // 'lambda' [varargslist] ':' test
      root = eYo.brick.newReady(board, eYo.t3.expr.lambda_expr)
      n = this.n
      if (n.type !== eYo.tkn.COLON) {
        n.varargslistInBrick(root.parameters_b)
        n = n.sibling
      }
      n = n.sibling
      root.expression_s.connect(n.toBrick(board))
      return root
    case eYo.tkn.lambdef_nocond: // 'lambda' [varargslist] ':' test_nocond
      root = eYo.brick.newReady(board, eYo.t3.expr.lambda_expr_nocond)
      n = this.n
      if (n.type !== eYo.tkn.COLON) {
        n.varargslistInBrick(root.parameters_b)
        n = n.sibling
      }
      n = n.sibling
      root.expression_s.connect(n.toBrick(board))
      return root
    case eYo.tkn.Async_funcdef: // 'async' funcdef
      root = this.n1.funcdef2Brick(board)
      root.async_ = true
      return root
    case eYo.tkn.pass_stmt: // 'pass'
      return eYo.brick.newReady(board, eYo.t3.stmt.pass_stmt)
    case eYo.tkn.Break_stmt: // 'break'
      return eYo.brick.newReady(board, eYo.t3.stmt.break_stmt)
    case eYo.tkn.Continue_stmt: // 'continue'
      return eYo.brick.newReady(board, eYo.t3.stmt.continue_stmt)
    case eYo.tkn.Compound_stmt: //
      /* compound_stmt: if_stmt | while_stmt | for_stmt | try_stmt | with_stmt | funcdef | classdef | decorated | async_stmt */
      n = this.n0
      switch(n.type) {
        case eYo.tkn.if_stmt: return n.if_stmt2Brick(board)
        case eYo.tkn.while_stmt: return n.while_stmt2Brick(board)
        case eYo.tkn.for_stmt: return n.for_stmt2Brick(board)
        case eYo.tkn.try_stmt: return n.try_stmt2Brick(board)
        case eYo.tkn.with_stmt: return n.with_stmt2Brick(board)
        case eYo.tkn.funcdef: return n.funcdef2Brick(board)
        case eYo.tkn.Classdef: return n.classdef2Brick(board)
        case eYo.tkn.decorated: return n.decorated2Brick(board)
        case eYo.tkn.Async_stmt:
          // async_stmt: 'async' (funcdef | with_stmt | for_stmt)
          n = n.n1
          switch(n.type) {
            case eYo.tkn.funcdef: root = n.funcdef2Brick(board); break
            case eYo.tkn.with_stmt: root = n.with_stmt2Brick(board); break
            case eYo.tkn.for_stmt: root = n.for_stmt2Brick(board); break
          }
          root.async_ = true
          return root
        default: console.error("BREAK HERE, UNEXPECTED NAME", n.name)
        throw 'ERROR'
      }
    case eYo.tkn.yield_expr:
      return this.yield_expr2Brick(board)
    case eYo.tkn.yield_stmt:
      root = eYo.brick.newReady(board, eYo.t3.stmt.yield_stmt)
      this.n0.yield_exprInBrick(root)
      return root
    case eYo.tkn.Break_stmt:
      return eYo.brick.newReady(board, eYo.t3.stmt.break_stmt)
    case eYo.tkn.Continue_stmt:
      return eYo.brick.newReady(board, eYo.t3.stmt.continue_stmt)
    case eYo.tkn.pass_stmt:
      return eYo.brick.newReady(board, eYo.t3.stmt.pass_stmt)
    case eYo.tkn.return_stmt: // 'return' [testlist_star_expr]
      root = eYo.brick.newReady(board, eYo.t3.stmt.return_stmt)
      ;(n = this.n1) && (n.testlist_star_exprInBrick(root.return_b))
      return root
    case eYo.tkn.import_stmt: // import_stmt: import_name | import_from
      n0 = this.n0
      if (n0.type === eYo.tkn.import_name) {
        //import_name: 'import' dotted_as_names
        root = eYo.brick.newReady(board, eYo.t3.stmt.import_stmt)
        var t = root.import_module_b
        n0.n1.knownListInBrick(t, function () {
          // dotted_as_name: dotted_name ['as' NAME]
          // dotted_name: NAME ('.' NAME)*
          if ((n2 = this.n2)) {
            var ddd = eYo.brick.newReady(board, eYo.t3.expr.identifier_as)
            brick.Alias_p = n2.n_str
          } else {
            ddd = eYo.brick.newReady(board, eYo.t3.expr.identifier)
          }
          var s = this.n0.n_child.map(child => child.type === eYo.tkn.NAME ? child.n_str : '.').join('')
          brick.Target_p = s
          return ddd
        })
        return root
      } else {
      /*
      ('from' (('.' | '...')* dotted_name | ('.' | '...')+)
                'import' ('*' | '(' import_as_names ')' | import_as_names))
        import_as_name: NAME ['as' NAME]*/
        root = eYo.brick.newReady(board, eYo.t3.stmt.import_stmt)
        s = ''
        n = n0.n1
        do {
          if (n.type === eYo.tkn.Dotted_name) {
            s += n.n_child.map(child => child.type === eYo.tkn.NAME ? child.n_str : '.').join('')
            root.From_p = s
            s = ''
          } else if (n.type === eYo.tkn.DOT) {
            s += '.'
          } else if (n.type === eYo.tkn.ELLIPSIS) {
            s += '...'
          } else if (n.n_str.length === 6) {
            // found the 'import'
            if (s.length) {
              root.From_p = s
            }
            break
          }
        } while ((n = n.sibling))
        n = n.sibling
        if (n.type === eYo.tkn.STAR) {
          root.Star_p = true
        } else {
          var t = root.import_b
          if (n.type === eYo.tkn.LPAR) {
            n = n.sibling
            root.import_b.Parenth_p = true
          }
          n.knownListInBrick(t, function () {
            // import_as_name: NAME ['as' NAME]
            var n = this.n2
            if (n) {
              var ddd = eYo.brick.newReady(board, eYo.t3.expr.identifier_as)
              brick.Alias_p = n.n_str
            } else {
              ddd = eYo.brick.newReady(board, eYo.t3.expr.identifier)
            }
            brick.Target_p = this.n0.n_str
            return ddd
          })
        }
        return root
      }
    case eYo.tkn.raise_stmt: // raise_stmt: 'raise' [test ['from' test]]
      root = eYo.brick.newReady(board, eYo.t3.stmt.raise_stmt)
      if ((n = this.n0.sibling)) {
        root.expression_s.connect(n.toBrick(board))
        root.Variant_p = eYo.key.EXPRESSION
        if ((n = n.sibling) && (n = n.sibling)) {
          root.from_s.connect(n.toBrick(board))
          root.Variant_p = eYo.key.FROM
        }
      }
      return root
    case eYo.tkn.or_test: // or_test: and_test ('or' and_test)*
      return this.binary2Brick(board, eYo.t3.expr.or_test)
    case eYo.tkn.And_test: // and_expr: shift_expr ('&' shift_expr)*
      return this.binary2Brick(board, eYo.t3.expr.and_test)
    case eYo.tkn.xor_expr: // xor_expr: and_expr ('^' and_expr)*
      return this.binary2Brick(board, eYo.t3.expr.xor_expr)
    case eYo.tkn.And_expr:
      return this.binary2Brick(board, eYo.t3.expr.and_expr)
    case eYo.tkn.Shift_expr: // shift_expr: arith_expr (('<<'|'>>') arith_expr)*
      return this.binary2Brick(board, eYo.t3.expr.shift_expr)
    case eYo.tkn.Arith_expr: // arith_expr: term (('+'|'-') term)*
      return this.binary2Brick(board, eYo.t3.expr.a_expr)
    case eYo.tkn.term: // term: factor (('*'|'@'|'/'|'%'|'//') factor)*
      return this.binary2Brick(board, eYo.t3.expr.m_expr)
    case eYo.tkn.Comparison: // expr (comp_op expr)*
      return this.binary2Brick(board, eYo.t3.expr.comparison, n => n.n0.n_str)
    case eYo.tkn.namedexpr_test:
      return this.namedexpr_test2Brick(board)
    case eYo.tkn.global_stmt:
      // global_stmt: 'global' NAME (',' NAME)*
      root = eYo.brick.newReady(board, eYo.t3.stmt.global_stmt)
      t = root.identifiers_b
      n = this.n1
      do {
        t.connectLast(n.toBrick(board))
      } while ((n = n.sibling) && (n = n.sibling))
      return root
    case eYo.tkn.nonlocal_stmt:
      // nonlocal_stmt: 'nonlocal' NAME (',' NAME)*
      root = eYo.brick.newReady(board, eYo.t3.stmt.nonlocal_stmt)
      t = root.identifiers_b
      n = this.n1
      do {
        t.connectLast(n.toBrick(board))
      } while ((n = n.sibling) && (n = n.sibling))
      return root
    case eYo.tkn.NEWLINE:
      return eYo.brick.newReady(board, eYo.t3.stmt.blank_stmt)
    case eYo.tkn.ENDMARKER:
      return  null
    // case eYo.tkn.NUMBER: break
    // case eYo.tkn.STRING: break
    // case eYo.tkn.INDENT: break
    // case eYo.tkn.DEDENT: break
    // case eYo.tkn.LPAR: break
    // case eYo.tkn.RPAR: break
    // case eYo.tkn.LSQB: break
    // case eYo.tkn.RSQB: break
    // case eYo.tkn.COLON: break
    // case eYo.tkn.COMMA: break
    // case eYo.tkn.SEMI: break
    // case eYo.tkn.PLUS: break
    // case eYo.tkn.MINUS: break
    // case eYo.tkn.STAR: break
    // case eYo.tkn.SLASH: break
    // case eYo.tkn.VBAR: break
    // case eYo.tkn.AMPER: break
    // case eYo.tkn.LESS: break
    // case eYo.tkn.GREATER: break
    // case eYo.tkn.EQUAL: break
    // case eYo.tkn.DOT: break
    // case eYo.tkn.PERCENT: break
    // case eYo.tkn.LBRACE: break
    // case eYo.tkn.RBRACE: break
    // case eYo.tkn.EQEQUAL: break
    // case eYo.tkn.NOTEQUAL: break
    // case eYo.tkn.LESSEQUAL: break
    // case eYo.tkn.GREATEREQUAL: break
    // case eYo.tkn.TILDE: break
    // case eYo.tkn.CIRCUMFLEX: break
    // case eYo.tkn.LEFTSHIFT: break
    // case eYo.tkn.RIGHTSHIFT: break
    // case eYo.tkn.DOUBLESTAR: break
    // case eYo.tkn.PLUSEQUAL: break
    // case eYo.tkn.MINEQUAL: break
    // case eYo.tkn.STAREQUAL: break
    // case eYo.tkn.SLASHEQUAL: break
    // case eYo.tkn.PERCENTEQUAL: break
    // case eYo.tkn.AMPEREQUAL: break
    // case eYo.tkn.VBAREQUAL: break
    // case eYo.tkn.CIRCUMFLEXEQUAL: break
    // case eYo.tkn.LEFTSHIFTEQUAL: break
    // case eYo.tkn.RIGHTSHIFTEQUAL: break
    // case eYo.tkn.DOUBLESTAREQUAL: break
    // case eYo.tkn.DOUBLESLASH: break
    // case eYo.tkn.DOUBLESLASHEQUAL: break
    // case eYo.tkn.AT: break
    // case eYo.tkn.ATEQUAL: break
    // case eYo.tkn.RARROW: break
    // case eYo.tkn.ELLIPSIS: break
    // case eYo.tkn.COLONEQUAL: break
    // case eYo.tkn.OP: break
    // case eYo.tkn.TYPE_IGNORE: break
    // case eYo.tkn.TYPE_COMMENT: break
    // case eYo.tkn.ERRORTOKEN: break
    // case eYo.tkn.N_TOKENS: break
    // case eYo.tkn.Single_input: break
    // // case eYo.tkn.file_input: break
    // case eYo.tkn.eval_input: break
    // case eYo.tkn.decorator: break
    // case eYo.tkn.decorators: break
    // case eYo.tkn.decorated: break
    // case eYo.tkn.Async_funcdef: break
    // case eYo.tkn.funcdef: break
    // case eYo.tkn.Parameters: break
    // case eYo.tkn.typedargslist: break
    // case eYo.tkn.tfpdef: break
    // case eYo.tkn.varargslist: break
    // case eYo.tkn.vfpdef: break
    // case eYo.tkn.Stmt: break
    // case eYo.tkn.Simple_stmt: break
    // case eYo.tkn.Small_stmt: break
    // case eYo.tkn.expr_stmt: break
    // case eYo.tkn.Annassign: break
    // case eYo.tkn.testlist_star_expr: break
    // case eYo.tkn.Augassign: break
    // case eYo.tkn.del_stmt: break
    // case eYo.tkn.pass_stmt: break
    // case eYo.tkn.flow_stmt: break
    // case eYo.tkn.Break_stmt: break
    // case eYo.tkn.Continue_stmt: break
    // case eYo.tkn.return_stmt: break
    // case eYo.tkn.yield_stmt: break
    // case eYo.tkn.import_name: break
    // case eYo.tkn.import_from: break
    // case eYo.tkn.import_as_name: break
    // case eYo.tkn.Dotted_as_name: break
    // case eYo.tkn.import_as_names: break
    // case eYo.tkn.Dotted_as_names: break
    // case eYo.tkn.Dotted_name: break
    // case eYo.tkn.Assert_stmt: break
    // case eYo.tkn.Compound_stmt: break
    // case eYo.tkn.Async_stmt: break
    // case eYo.tkn.if_stmt: break
    // case eYo.tkn.while_stmt: break
    // case eYo.tkn.for_stmt: break
    // case eYo.tkn.try_stmt: break
    // case eYo.tkn.with_stmt: break
    // case eYo.tkn.with_item: break
    // case eYo.tkn.except_clause: break
    // case eYo.tkn.Suite: break
    // case eYo.tkn.test: break
    // case eYo.tkn.test_nocond: break
    // case eYo.tkn.lambdef: break
    // case eYo.tkn.lambdef_nocond: break
    // case eYo.tkn.not_test: break
    // case eYo.tkn.Comp_op: break
    // case eYo.tkn.Star_expr: break
    // case eYo.tkn.expr: break
    // case eYo.tkn.factor: break
    // case eYo.tkn.power: break
    // case eYo.tkn.Atom_expr: break
    // case eYo.tkn.testlist: break
    // case eYo.tkn.trailer: break
    // case eYo.tkn.Subscriptlist: break
    // case eYo.tkn.Subscript: break
    // case eYo.tkn.Sliceop: break
    // case eYo.tkn.exprlist: break
    // case eYo.tkn.dictorsetmaker: break
    // case eYo.tkn.Classdef: break
    // case eYo.tkn.Arglist: break
    // case eYo.tkn.Argument: break
    // case eYo.tkn.Comp_iter: break
    // case eYo.tkn.Sync_comp_for: break
    // case eYo.tkn.Comp_for: break
    // case eYo.tkn.Comp_if: break
    // case eYo.tkn.encoding_decl: break
    // case eYo.tkn.yield_expr: break
    // case eYo.tkn.yield_arg: break
    // case eYo.tkn.func_body_suite: break
    // case eYo.tkn.func_type_input: break
    // case eYo.tkn.func_type: break
    // case eYo.tkn.typelist: break
    default:
      if (!this.n0) {
        throw `2) NOTHING TO DO WITH ${this.name}`
      } else if (!this.n1) {
        // console.log(`PASSED ${this.name} to ${this.n0.name}`, )
        return this.n0.toBrick(board)
      } else {
        // eYo.gmr.Showtree(eYo.gmr._PyParser_Grammar, this)
        console.error('BREAK HERE TO DEBUG', this.name, this.n_child)
        throw `3) NOTHING TO DO WITH ${this.name}`
      }
  }
}
