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

eYo.require('py.node')

eYo.require('py.tkn')

eYo.require('py.gmr')

/**
 * @name {eYo.py.node.brick}
 * @namespace
 */
eYo.py.node.makeNS('brick')

/**
 * Converts the receiver to a visual brick.
 * `this.type === eYo.py.tkn.suite`.
 * @param {Object} a brick
 */
eYo.py.node.BaseC9r_p.suiteInBrick = function (brick) {
  // simple_stmt | NEWLINE INDENT stmt+ DEDENT
  var n = this.n0
  // suite: simple_stmt | NEWLINE INDENT stmt+ DEDENT
  if (n.n_type === eYo.py.tkn.NEWLINE) {
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
    } while ((n = n.sibling) && n.n_type !== eYo.py.tkn.DEDENT)
  } else {
    var d = n.simple_stmt2Brick(brick)
    brick.right_mMost.connectSmart(d)// what if we cannot connect?
  }
}

/**
 * `this` is the function body node.
 * `this.type === eYo.py.func_body_suite`.
 * @param {Object} a brick
 */
eYo.py.node.BaseC9r_p.func_body_suiteInBrick = function (brick) {
  var n = this.n0
  // func_body_suite: simple_stmt | NEWLINE [TYPE_COMMENT NEWLINE] INDENT stmt+ DEDENT
  if (n.n_type === eYo.py.tkn.NEWLINE) {
    var m4t = brick.suite_m
    var comments = n.comments
    if (comments.length) {
      comments.forEach(n => {
        m4t = m4t.connectSmart(n.toBrick(brick))
      })
    }
    n = n.sibling // skip NEWLINE
    if (n.n_type === eYo.py.tkn.TYPE_COMMENT) {
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
    } while ((n = n.sibling) && n.n_type !== eYo.py.tkn.DEDENT)
  } else {
    var d = n.simple_stmt2Brick(brick)
    brick.right_mMost.connectSmart(d)// what if we cannot connect?
  }
}

/**
 * `this` is the comment node.
 * `this.type === eYo.py.tkn.COMMENT`
 * @param {Object} a brick
 */
eYo.py.node.BaseC9r_p.comment2Brick = function (owner) {
  var brick = eYo.brick.newReady(eYo.t3.stmt.comment_stmt, owner)
  brick.Comment_p = this.n_comment
  console.log('ONE COMMENT', this.n_comment)
  return brick
}

/**
 * `this` is the comment node.
 * `this.type === eYo.py.tkn.TYPE_COMMENT`
 * @param {Object} a brick
 */
eYo.py.node.BaseC9r_p.typeComment2Brick = function (owner) {
  var slgt = eYo.brick.newReady(eYo.t3.stmt.comment_stmt, owner)
  brick.Comment_p = this.n0.n_str
  return slgt
}

/**
 * `this` is the simple statement node.
 * `this.type === eYo.py.simple_stmt`
 * @param {Object} a brick
 */
eYo.py.node.BaseC9r_p.simple_stmt2Brick = function (owner) {
  // simple_stmt: small_stmt (';' small_stmt)* [';'] NEWLINE
  var n = this.n0
  var brick = n.toBrick(owner)
  var d = brick
  var m4t = d.right_mMost
  while ((n = n.sibling)) {
    if (n.type === eYo.py.tkn.SEMI) {
      n = n.sibling
      if (n.type === eYo.py.simple_stmt) {
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
    // n.type === eYo.py.tkn.NEWLINE
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
 * `this.type === eYo.py.tkn.NAME`
 * @param {Object} a brick
 */
eYo.py.node.BaseC9r_p.nAME2Brick = function (owner) {
  var brick = eYo.brick.newReady({
    type: eYo.t3.expr.identifier,
    target_p: this.n_str
  }, owner)
  brick.variant_ = eYo.key.NONE
  return brick
}

/**
 * `this` is the dotted_name node.
 * `this.type === eYo.py.dotted_name`
 * @param {Object} a brick
 */
eYo.py.node.BaseC9r_p.dotted_name2Brick = function (owner) {
  // dotted_name: NAME ('.' NAME)*
  var n = this.n0
  var brick = eYo.brick.newReady({
    type: eYo.t3.expr.identifier,
    target_p: n.n_str
  }, owner)
  while ((n = n.sibling) && (n = n.sibling)) {
    var dd = eYo.brick.newReady({
      type: eYo.t3.expr.identifier,
      target_p: n.n_str
    }, owner)
    dd.holder_s.connect(brick)
    brick = dd
  }
  return brick
}

/**
 * `this` is the comp_iter node.
 * `this.type === eYo.py.comp_iter`
 * @param {Object} a brick
 */
eYo.py.node.BaseC9r_p.comp_iter2Brick = function (board) {
  // comp_iter: comp_for | comp_if
  var n = this.n0
  if (n.type === eYo.py.comp_if) {
    return n.comp_if2Brick(board)
  } else if (n.type === eYo.py.comp_for) {
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
 * `this.type === eYo.py.comp_for`
 * @param {eYo.brick.BaseC9r} brick  a brick with a 'for' slot.
 */
eYo.py.node.BaseC9r_p.comp_forInBrick = function (brick) {
  // comp_for: ['async'] sync_comp_for
  this.last_child.sync_comp_forInBrick(brick)
  if (this.n1) {
    brick.async_ = true
    console.error('async is not supported')
  }
}

/**
 * Converts the node `n` to a visual brick.
 * `this.type === eYo.py.sync_comp_for`
 * @param {eYo.brick.BaseC9r} brick  a brick with a 'for' slot.
 */
eYo.py.node.BaseC9r_p.sync_comp_forInBrick = function (brick) {
  // 'for' exprlist 'in' or_test [comp_iter]
  this.n1.exprlistInBrick(brick.for_b)
  brick.in_s.connect(this.n3.toBrick(brick))
  var n = this.n4
  n && (brick.comp_iter = n.comp_iter2Brick(brick))
}

/**
 * `this` is the sync_comp_for node.
 * `this.type === eYo.py.sync_comp_for`
 * @param {Object} a brick
 */
eYo.py.node.BaseC9r_p.sync_comp_for2Brick = function (board) {
  // 'for' exprlist 'in' or_test [comp_iter]
  var brick = eYo.brick.newReady(eYo.t3.expr.comp_for, board)
  this.sync_comp_forInBrick(brick)
  return brick
}

/**
 * `this` is the comp_if node.
 * `this.type === eYo.py.comp_if`
 * @param {Object} a brick
 */
eYo.py.node.BaseC9r_p.comp_if2Brick = function (board) {
  // 'if' test_nocond [comp_iter]
  var brick = eYo.brick.newReady(eYo.t3.expr.comp_if, board)
  brick.if_s.connect(this.n1.toBrick(board))
  var n = this.n2
  n && (brick.comp_iter = n.comp_iter2Brick(board))
  return brick
}

/**
 * `this` is the for_stmt node.
 * `this.type === eYo.py.for_stmt`
 * @param {Object} a brick
 */
eYo.py.node.BaseC9r_p.for_stmt2Brick = function (board) {
  // 'for' exprlist 'in' testlist ':' suite ['else' ':' suite]
  var brick = eYo.brick.newReady(eYo.t3.stmt.for_part, board)
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
 * `this.type === eYo.py.namedexpr_test`
 * @param {Object} a brick
 */
eYo.py.node.BaseC9r_p.namedexpr_test2Brick = function (board) {
  // test [':=' test]
  var brick = this.n0.toBrick(board)
  var n = this.n2
  if (n) {
    // if this is already an identifier
    if (brick.type !== eYo.t3.expr.identifier) {
      var dd = eYo.brick.newReady(eYo.t3.expr.identifier, board)
      if (dd.target_b.connectLast(brick)) {
        brick = dd
      } else {
        console.error('IMPOSSIBLE CONNECTION:', dd, brick)
      }
    }
    // b is an identifier, turn it into an identifier_valued
    // before any connection
    brick.variant_ = eYo.key.COL_VALUED
    dd = n.toBrick(board)
    if (!brick.value_b.connectLast(dd)) {
      console.error('IMPOSSIBLE CONNECTION:', brick, dd)
    }
  }
  return brick
}

/**
 * `this` is the if_stmt node.
 * `this.type === eYo.py.if_stmt`
 * @param {Object} a brick
 */
eYo.py.node.BaseC9r_p.if_stmt2Brick = function (board) {
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
 * `this.type === eYo.py.while_stmt`
 * @param {Object} a brick
 */
eYo.py.node.BaseC9r_p.while_stmt2Brick = function (board) {
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
 * `this.type === eYo.py.try_stmt`
 * @param {Object} a brick
 */
eYo.py.node.BaseC9r_p.try_stmt2Brick = function (board) {
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
    if (n.type === eYo.py.except_clause) {
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
 * `this.type === eYo.py.with_stmt`
 * @param {Object} a brick
 */
eYo.py.node.BaseC9r_p.with_stmt2Brick = function (board) {
  // 'with' with_item (',' with_item)*  ':' suite
  var root = eYo.brick.newReady(board, eYo.t3.stmt.with_part)
  var with_b = root.with_b
  var n = this.n1
  do {
    // with_item: test ['as' expr]
    var nn = n.n2
    if (nn) {
      var dd = eYo.brick.newReady(eYo.t3.expr.identifier, board)
      dd.alias_s.connect(nn.toBrick(board))
      dd.target_b.connectLast(n.n0.toBrick(board))
    } else {
      dd = n.n0.toBrick(board)
    }
    with_b.connectLast(dd)
  } while ((n = n.sibling) && n.type === eYo.py.tkn.COMMA && (n = n.sibling))
  // n.type === eYo.py.tkn.COLON
  n.sibling.suiteInBrick(root)
  return root
}

/**
 * `this` is the funcdef node.
 * `this.type === eYo.py.funcdef`
 * @param {Object} a brick
 */
eYo.py.node.BaseC9r_p.funcdef2Brick = function (board) {
  // 'def' NAME parameters ['->' test] ':' [TYPE_COMMENT] func_body_suite
  var root = eYo.brick.newReady(board, eYo.t3.stmt.funcdef_part)
  root.name_ = this.n1.n_str
  // parameters: '(' [typedargslist] ')'
  var n = this.n2.n1
  if (n.type !== eYo.py.tkn.RPAR) {
    n.typedargslistInBrick(root.parameters_b)
  }
  n = this.n4
  if (this.n3.type === eYo.py.tkn.RARROW) {
    root.type_s.connect(n.toBrick(board))
    root.variant_ = eYo.key.TYPE
    n = n.sibling.sibling
  }
  if (n.type === eYo.py.tkn.TYPE_COMMENT) {
    root.right_m.connectSmart(n.typeComment2Brick(board))
    n = n.sibling
  }
  n.func_body_suiteInBrick(root)
  return root
}

/**
 * `this` is the classdef node.
 * `this.type === eYo.py.classdef`
 * @param {Object} a brick
 */
eYo.py.node.BaseC9r_p.classdef2Brick = function (board) {
  // 'class' NAME ['(' [arglist] ')'] ':' suite
  var root = eYo.brick.newReady(board, eYo.t3.stmt.classdef_part)
  var n = this.n1
  root.name_ = n.n_str
  n = n.sibling
  if (n.type === eYo.py.tkn.LPAR) {
    root.variant_ = eYo.key.N_ARY
    n = n.sibling
    if (n.type !== eYo.py.tkn.RPAR) {
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
 * `this.type === eYo.py.decorated`
 * @param {Object} a brick
 */
eYo.py.node.BaseC9r_p.decorated2Brick = function (board) {
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
  if (n.type === eYo.py.classdef) {
    brick.footConnect(n.classdef2Brick(board))
  } else if (n.type === eYo.py.funcdef) {
    brick.footConnect(n.funcdef2Brick(board))
  } else if (n.type === eYo.py.async_funcdef) {
    brick.footConnect(n.n1.funcdef2Brick(board)).async_ = true
  } else {
    console.error(`UNEXPECTED node type: ${n.type}`)
  }
  return root
}

/**
 * `this` is the decorator node.
 * `this.type === eYo.py.decorator`
 * @param {Object} a brick
 */
eYo.py.node.BaseC9r_p.decorator2Brick = function (board) {
  // decorator: '@' dotted_name [ '(' [arglist] ')' ] NEWLINE
  var brick = eYo.brick.newReady(board, eYo.t3.stmt.decorator_stmt)
  var n = this.n1
  brick.name_ = n.n_child.map(child => child.type === eYo.py.tkn.NAME ? child.n_str : '.').join('')
  n = n.sibling
  if (n.n_type === eYo.py.tkn.LPAR) {
    brick.variant_ = eYo.key.N_ARY
    n = n.sibling
    if (n.n_type !== eYo.py.tkn.RPAR) {
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
 * `this.type === eYo.py.tfpdef`
 * @param {Object} a brick
 */
eYo.py.node.BaseC9r_p.tfpdef2Brick = function (board) {
  /* tfpdef: NAME [':' test] */
  var brick = eYo.brick.newReady(eYo.t3.expr.identifier, board)
  var n = this.n0
  brick.Target_p = n.n_str
  if ((n = this.n2)) {
    brick.annotated_s.connect(n.toBrick(board))
    brick.variant_ = eYo.key.ANNOTATED
  }
  return brick
}

/**
 * `this` is the first node of a typedargslist.
 * `this.type === eYo.py.typedargslist`
 * @param {eYo.brick.BaseC9r} brick  a brick
 */
eYo.py.node.BaseC9r_p.typedargslistInBrick = function (brick) {
  var n = this.n0
  /* typedargslist:
  1) tfpdef ['=' test] (',' tfpdef ['=' test])* [',' [
          '*' [tfpdef] (',' tfpdef ['=' test])* [',' ['**' tfpdef [',']]]
        | '**' tfpdef [',']]]
  2) '*' [tfpdef] (',' tfpdef ['=' test])* [',' ['**' tfpdef [',']]]
  3) '**' tfpdef [',']*/
  // We do not look for consistency here, the consolidator does it for us
  while (n) {
    if (n.type === eYo.py.tkn.STAR) {
      if ((n = n.sibling)) {
        if (n.type === eYo.py.tfpdef) {
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
    } else if (n.type === eYo.py.tkn.DOUBLESTAR) {
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
        if (n.type === eYo.py.tkn.EQUAL) {
          d.variant_ = d.variant === eYo.key.ANNOTATED
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
eYo.py.node.BaseC9r_p.knownListInBrick = function (brick, toBrick) {
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
eYo.py.node.BaseC9r_p.do_list = function (brick) {
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

eYo.py.node.BaseC9r_p.exprlistInBrick =
eYo.py.node.BaseC9r_p.arglistInBrick =
eYo.py.node.BaseC9r_p.testlistInBrick =
eYo.py.node.BaseC9r_p.testlist_star_exprInBrick =
eYo.py.node.BaseC9r_p.subscriptlistInBrick = eYo.py.node.BaseC9r_p.do_list

/**
 * `this` is binary expression.
 * @param {eYo.board|eYo.brick.BaseC9r} owner
 * @param {String} type
 * @param {String} op
 */
eYo.py.node.BaseC9r_p.binary2Brick = function (owner, type, op) {
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
 * `this.type === eYo.py.yield_expr`
 * @param {Object} owner
 */
eYo.py.node.BaseC9r_p.yield_expr2Brick = function (owner) {
  /*yield_expr: 'yield' [yield_arg]
yield_arg: 'from' test | testlist_star_expr */
  var brick = eYo.brick.newReady(owner, eYo.t3.expr.yield_expr)
  this.yield_exprInBrick(brick)
  return brick
}

/**
 * `this` is a yield_expr.
 * `this.type === eYo.py.yield_expr`
 * @param {Object} a brick
 */
eYo.py.node.BaseC9r_p.yield_exprInBrick = function (brick) {
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
 * `this.type === eYo.py.yield_expr`
 * @param {Object} brick  a delegate
 */
eYo.py.node.BaseC9r_p.yield_exprInListBrick = function (brick) {
  brick.connectLast(this.yield_expr2Brick(brick))
}

/**
 * `this` is the first node of a typedargslist.
 * `this.type === eYo.py.varargslist`
 * @param {Object} a brick
 */
eYo.py.node.BaseC9r_p.varargslistInBrick = function (brick) {
/* (vfpdef ['=' test] (',' vfpdef ['=' test])* [',' [
        '*' [vfpdef] (',' vfpdef ['=' test])* [',' ['**' vfpdef [',']]]
      | '**' vfpdef [',']]]
  | '*' [vfpdef] (',' vfpdef ['=' test])* [',' ['**' vfpdef [',']]]
  | '**' vfpdef [',']*/
  // We do not check any consistency here
  var n = this.n0
  while (n) {
    if (n.type === eYo.py.tkn.STAR) {
      if ((n = n.sibling)) {
        if (n.type !== eYo.py.tkn.COMMA) {
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
    } else if (n.type === eYo.py.tkn.DOUBLESTAR) {
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
        if (n.type === eYo.py.tkn.EQUAL) {
          d.variant_ = eYo.key.TARGET_VALUED
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
 * `this.type === eYo.py.dictorsetmaker`
 * @param {eYo.brick.BaseC9r} brick  a brick
 */
eYo.py.node.BaseC9r_p.dictorsetmakerInBrick = function (brick) {
/*dictorsetmaker: ( ((test ':' test | '**' expr)
    (comp_for | (',' (test ':' test | '**' expr))* [','])) |
  ((test | star_expr)
    (comp_for | (',' (test | star_expr))* [','])) )
    */
  var n = this.n0
  var n1, n2, n3
  if ((n1 = n.sibling)) {
    if (n1.n_type === eYo.py.comp_for) {
      // set comprehension
      brick.connectLast(this.comprehension2Brick(brick))
      brick.variant_ = eYo.key.BRACE
      return brick
    } else if ((n2 = n1.sibling)) {
      if (n2.n_type === eYo.py.comp_for) {
        // set comprehension with '**'
        // this is a syntax error but I still consider it to be valid
        var root = eYo.brick.newReady(brick, eYo.t3.expr.comprehension)
        var dd = eYo.brick.newReady(brick, eYo.t3.expr.expression_star_star)
        root.expression_s.connect(dd)
        brick.modified_s.connect(n1.toBrick(brick))
        n2.comprehensionInBrick(brick)
        return brick
      } else if ((n3 = n2.sibling)) {
        if (n3.n_type === eYo.py.comp_for) {
          // dict comprehension
          brick.connectLast(this.dict_comprehension2Brick(brick))
          return brick
        }
      }
    }
  }
  // no comprehension
  while (true) {
    if (n.n_type === eYo.py.tkn.DOUBLESTAR) {
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
        if (n1.n_type === eYo.py.tkn.COLON) {
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
 * @param {eYo.brick.BaseC9r} brick a brick
 */
eYo.py.node.BaseC9r_p.comprehensionInBrick = function (brick) {
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
eYo.py.node.BaseC9r_p.comprehension2Brick = function (owner) {
  var brick = eYo.brick.newReady(owner, eYo.t3.expr.comprehension)
  brick.expression_s.connect(this.n0.toBrick(owner))
  this.n1.comprehensionInBrick(brick)
  return brick
}

/**
 * Converts the node `this` to a visual brick.
 * `this.type === eYo.py.dictorsetaker`
 * @param {Object} a brick
 */
eYo.py.node.BaseC9r_p.dict_comprehension2Brick = function (owner) {
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
 * `this.type === eYo.py.testlist_comp`
 * @param {Object} a brick
 */
eYo.py.node.BaseC9r_p.testlist_compInBrick = function (brick) {
  // (namedexpr_test|star_expr) ( comp_for | (',' (namedexpr_test|star_expr))* [','] )
  var n = this.n1
  if (n && n.n_type === eYo.py.comp_for) {
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
eYo.py.node.BaseC9r_p.toBrick = function (board) {
  var root = this.toBrick_(board)
  if (this.comments) {
    var ds = this.comments.map(n => n.comment2Brick(board))
    if (root) {
      if (this.type === eYo.py.file_input) {
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
    if (this.type === eYo.py.file_input) {
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
eYo.py.node.BaseC9r_p.toBrick_ = function (board) {
  // console.log(`node type: ${this.name}`)
  var root, d, d0, d1, d2, n, n0, n1, n2, i, s, t, m4t
  switch (this.n_type) {
    case eYo.py.file_input: // (NEWLINE | stmt)* ENDMARKER
      var bs = this.n_child.map(n => n.toBrick(board))
      if ((root = bs.shift())) {
        m4t = root.foot_mMost
        bs.forEach(dd => {
          var m = m4t.connectSmart(dd)
          m && (m4t = m)
        })
      }
      return root
    case eYo.py.simple_stmt:
      return this.simple_stmt2Brick(board)
    case eYo.py.expr_stmt: // testlist_star_expr (annassign | augassign (yield_expr|testlist) | [('=' (yield_expr|testlist_star_expr))+ [TYPE_COMMENT]] )
      n0 = this.n0
      if (!(n1 = n0.sibling)) {
        // simple expression statement: only a testlist_star_expr
        root = eYo.brick.newReady(board, eYo.t3.stmt.expression_stmt)
        n0.testlist_star_exprInBrick(root.value_b)
        // manage comments

        return root
      }
      if (n1.n_type === eYo.py.tkn.EQUAL) {
        // assignment,
        root = d1 = eYo.brick.newReady(board, eYo.t3.stmt.assignment_stmt)
        while (true) {
          // targets
          ;(n0.type === eYo.py.yield_expr ? n0.yield_exprInListBrick : n0.testlist_star_exprInBrick).call(n0, d1.target_b) // .call is necessary !
          // values
          n0 = n1.sibling
          if ((n1 = n0.sibling)) {
            if (n1.n_type === eYo.py.tkn.EQUAL) {
              d2 = eYo.brick.newReady(eYo.t3.expr.assignment_chain, board)
              if ((d = d1.value_b)) {
                d.connectLast(d2)
                d1.variant_ = eYo.key.TARGET_VALUED // necessary ?
              } else {
                console.error('ERROR')
              }
              d1 = d2
              continue
            } else {
              root.type_comment_node = n1
            }
          }
          ;(n0.type === eYo.py.yield_expr
            ? n0.yield_exprInListBrick
            : n0.testlist_star_exprInBrick).call(n0, d1.value_b)
          break
        }
      } else if (n1.type === eYo.py.augassign) { // augassign: ('+=' | '-=' | '*=' | '@=' | '/=' | '%=' | '&=' | '|=' | '^=' | '<<=' | '>>=' | '**=' | '//=')
        root = eYo.brick.newReady({
          type: eYo.t3.stmt.augmented_assignment_stmt,
          operator_p: n1.n0.n_str
        }, board)
        n0.testlist_star_exprInBrick(root.target_b)
        n2 = n1.sibling
        ;(n2.type === eYo.py.yield_expr
            ? n2.yield_exprInListBrick
            : n2.testlistInBrick).call(n2, root.value_b)
      } else if (n1.type === eYo.py.annassign) { // ':' test ['=' (yield_expr|testlist)]
        if ((s = n1.n3)) {
          root = eYo.brick.newReady(board, eYo.t3.stmt.annotated_assignment_stmt)
          n0.testlist_star_exprInBrick(root.target_b)
          d1 = n1.n1.toBrick(board)
          root.annotated_s.connect(d1)
          ;(s.type === eYo.py.yield_expr
            ? s.yield_exprInListBrick
            : s.testlistInBrick).call(s, root.value_b)
        } else {
          root = eYo.brick.newReady(board, eYo.t3.stmt.annotated_stmt)
          n0.testlist_star_exprInBrick(root.target_b)
          d1 = n1.n1.toBrick(board)
          if (d1.description === 'str') {
            console.error('STOP HERE')
          }
          root.annotated_s.connect(d1)
        }
      }
      return root
    case eYo.py.atom_expr: // ['await'] atom trailer*
      i = 0
      n0 = this.n0
      if (n0.n_type === eYo.py.tkn.NAME && n0.n_str === 'await') {
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
        if (n0.n0.n_type === eYo.py.tkn.LPAR) {
          d = d0.n_ary_b
          if (d && d0.variant === eYo.key.NONE) {
            d0.variant_ = eYo.key.CALL_EXPR
          } else {
            root = eYo.brick.newReady(eYo.t3.expr.call_expr, board)
            root.target_b.connectLast(d0)
            d0 = root
            d = d0.n_ary_b
          }
          n1 = n0.n1
          if (n1.n_type !== eYo.py.tkn.RPAR) {
            n1.arglistInBrick(brick)
          }
        } else if (n0.n0.n_type === eYo.py.tkn.LSQB) {
          d = d0.slicing_b
          if (d && d0.variant === eYo.key.NONE) {
            d0.variant_ = eYo.key.SLICING
          } else {
            root = eYo.brick.newReady(eYo.t3.expr.slicing, board)
            root.target_b.connectLast(d0)
            d0 = root
            d = d0.slicing_b
          }
          n1 = n0.n1
          if (n1.n_type !== eYo.py.tkn.RSQB) {
            n1.subscriptlistInBrick(brick)
          }
        } else /* if (n0.n0.n_type === eYo.py.tkn.DOT) */ {
          if (!d0.dotted_d || d0.variant !== eYo.key.NONE || d0.Dotted_p !== 0) {
            root = n0.n1.NAME2Brick(board)
            root.holder_s.connect(d0)
            d0 = root
            d0.Dotted_p = 1
          } else {
            d0.changer.wrap(() => {
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
    case eYo.py.subscript: // test | [test] ':' [test] [sliceop] // sliceop: ':' [test]
      n0 = this.n0
      if (n0.type === eYo.py.test) {
        d0 = n0.toBrick(board)
        if (!(n0 = n0.sibling)) {
          return d0
        }
      }
      root = eYo.brick.newReady(eYo.t3.expr.proper_slice, board)
      d0 && (root.lower_bound_s.connect(d0))
      // n0.type === eYo.py.tkn.COLON
      if ((n0 = n0.sibling)) {
        if (n0.type === eYo.py.test) {
          root.upper_bound_s.connect(n0.toBrick(board))
          if (!(n0 = n0.sibling)) {
            return root
          }
        }
        root.variant_ = eYo.key.STRIDE
        n0.n1 && (root.stride_s.connect(n0.n1.toBrick(board)))
      }
      return root
    case eYo.py.atom: //atom: ('(' [yield_expr|testlist_comp] ')' | '[' [testlist_comp] ']' | '{' [dictorsetmaker] '}') | NAME | NUMBER | STRING+ | '...' | 'None' | 'True' | 'False')
      n0 = this.n0
      if (n0.type === eYo.py.tkn.STRING) {
        var s = n0.n_str
        while ((n0 = n0.sibling)) {
          s += n0.n_str
        }
        return eYo.brick.newReady(board, s) // THIS IS NOT COMPLETE
      }
      if ((n1 = n0.sibling)) {
        root = eYo.brick.newReady(eYo.t3.expr.enclosure, board)
        switch(n0.n_str) {
          case '(':
            t = eYo.key.PAR
            s = n1.type === eYo.py.yield_expr
            ? n1.yield_exprInListBrick
            : n1.type === eYo.py.testlist_comp
              ? n1.testlist_compInBrick
              : null
            break
          case '[':
            t = eYo.key.SQB
            s = n1.type === eYo.py.testlist_comp
            ? n1.testlist_compInBrick
            : null
            break
          case '{':
            t = eYo.key.BRACE
            s = n1.type === eYo.py.dictorsetmaker
            ? n1.dictorsetmakerInBrick
            : null
            break
        }
        root.variant_ = t
        s && (s.call(n1, root))
        return root
      } else if (['...', 'None', 'True', 'False'].indexOf((s = n0.n_str)) < 0) {
        if (n0.type === eYo.py.tkn.NAME) {
          return n0.NAME2Brick(board)
        } else if (n0.type === eYo.py.tkn.NUMBER) {
          return eYo.brick.newReady({
            type: eYo.t3.expr.numberliteral,
            value_p: s
          }, board)
        } else /* STRING+ */ {
          d0 = root = eYo.brick.newReady({
            type: s.endsWith('"""') || s.endsWith("'''") ? eYo.t3.expr.longliteral : eYo.t3.expr.shortliteral,
            value_p: s
          }, board)
          while ((n0 = n0.sibling)) {
            d0 = d0.next_string_block = eYo.brick.newReady({
              type: s.endsWith('"""') || s.endsWith("'''") ? eYo.t3.expr.longliteral : eYo.t3.expr.shortliteral,
              value_p: n0.n_str
            }, board)
          }
        }
        return root
      } else {
        return eYo.brick.newReady({
          type: eYo.t3.expr.builtin__object,
          value_p: s
        }, board)
      }
    case eYo.py.star_expr: // star_expr: '*' expr
      root = eYo.brick.newReady(eYo.t3.expr.expression_star, board)
      root.modified_s.connect(this.n1.toBrick(board))
    return root
    /*
term: factor (('*'|'@'|'/'|'%'|'//') factor)*
factor: ('+'|'-'|'~') factor | power
*/
    case eYo.py.xor_expr: // and_expr ('^' and_expr)*
    case eYo.py.and_expr: // shift_expr ('&' shift_expr)*
    case eYo.py.shift_expr: // arith_expr (('<<'|'>>') arith_expr)*
    case eYo.py.arith_expr: // term (('+'|'-') term)*
    case eYo.py.term: // factor (('*'|'@'|'/'|'%'|'//') factor)*
    case eYo.py.expr: // xor_expr ('|' xor_expr)*
      n0 = this.n0
      root = n0.toBrick(board)
      while ((n1 = n0.sibling) && (n2 = n1.sibling)) {
        d0 = eYo.brick.newReady(eYo.t3.expr.m_expr, board)
        d0.Operator_p = n1.n_str
        d0.lhs_s.connect(root)
        root = d0
        d0.rhs_s.connect(n2.toBrick(board))
        n0 = n2
      }
      return root
    case eYo.py.factor: // ('+'|'-'|'~') factor | power
      if ((n1 = this.n1)) {
        root = eYo.brick.newReady(eYo.t3.expr.unary, board)
        root.Operator_p = this.n0.n_str
        root.rhs_s.connect(n1.toBrick(board))
      } else {
        return this.n0.toBrick(board)
      }
      return root
    case eYo.py.power: // atom_expr ['**' factor]
      d0 = this.n0.toBrick(board)
      if (d0.type === eYo.t3.stmt.comment_stmt) {
        console.error("BREAK HERE", d0 = this.n0.toBrick(board))
      }
      if ((n2 = this.n2)) {
        root = eYo.brick.newReady(eYo.t3.expr.power, board)
        root.lhs_s.connect(d0)
        root.rhs_s.connect(n2.toBrick(board))
        return root
      } else {
        return d0
      }
    case eYo.py.argument: /*argument: ( test [comp_for] |
      test ':=' test |
      test '=' test |
      '**' test |
      '*' test )*/
      n0 = this.n0
      if (n0.n_type === eYo.py.tkn.STAR) {
        root = eYo.brick.newReady(eYo.t3.expr.expression_star, board)
        root.modified_s.connect(n0.sibling.toBrick(board))
      } else if (n0.n_type === eYo.py.tkn.DOUBLESTAR) {
        root = eYo.brick.newReady(eYo.t3.expr.expression_star_star, board)
        root.modified_s.connect(n0.sibling.toBrick(board))
      } else if ((n1 = n0.sibling)) {
        if (n1.n_type === eYo.py.tkn.COLONEQUAL) {
          root = eYo.brick.newReady(eYo.t3.expr.named_expr, board)
          root.target_b.connectLast(n0.toBrick(board))
          root.value_b.connectLast(n1.sibling.toBrick(board))
        } else if (n1.n_type === eYo.py.tkn.EQUAL) {
          root = eYo.brick.newReady(eYo.t3.expr.identifier_valued, board)
          root.target_b.connectLast(n0.toBrick(board))
          root.value_b.connectLast(n1.sibling.toBrick(board))
        } else {
          root = this.comprehension2Brick(board)
        }
      } else {
        root = n0.toBrick(board)
      }
      return root
    case eYo.py.tkn.NAME: // test [':=' test]
      return this.NAME2Brick(board)
    case eYo.py.namedexpr_test: // test [':=' test]
      d0 = this.n0.toBrick(board)
      if ((n2 = this.n2)) {
        root = eYo.brick.newReady(eYo.t3.expr.named_expr, board)
        root.target_b.connectLast(d0)
        root.value_b.connectLast(n2.toBrick(board))
      } else {
        root = d0
      }
      return root
    case eYo.py.lambdef: // 'lambda' [varargslist] ':' test
      root = eYo.brick.newReady(eYo.t3.expr.lambda_expr, board)
      n = this.n
      if (n.type !== eYo.py.tkn.COLON) {
        n.varargslistInBrick(root.parameters_b)
        n = n.sibling
      }
      n = n.sibling
      root.expression_s.connect(n.toBrick(board))
      return root
    case eYo.py.lambdef_nocond: // 'lambda' [varargslist] ':' test_nocond
      root = eYo.brick.newReady(eYo.t3.expr.lambda_expr_nocond, board)
      n = this.n
      if (n.type !== eYo.py.tkn.COLON) {
        n.varargslistInBrick(root.parameters_b)
        n = n.sibling
      }
      n = n.sibling
      root.expression_s.connect(n.toBrick(board))
      return root
    case eYo.py.async_funcdef: // 'async' funcdef
      root = this.n1.funcdef2Brick(board)
      root.async_ = true
      return root
    case eYo.py.pass_stmt: // 'pass'
      return eYo.brick.newReady(board, eYo.t3.stmt.pass_stmt)
    case eYo.py.break_stmt: // 'break'
      return eYo.brick.newReady(board, eYo.t3.stmt.break_stmt)
    case eYo.py.continue_stmt: // 'continue'
      return eYo.brick.newReady(board, eYo.t3.stmt.continue_stmt)
    case eYo.py.compound_stmt: //
      /* compound_stmt: if_stmt | while_stmt | for_stmt | try_stmt | with_stmt | funcdef | classdef | decorated | async_stmt */
      n = this.n0
      switch(n.type) {
        case eYo.py.if_stmt: return n.if_stmt2Brick(board)
        case eYo.py.while_stmt: return n.while_stmt2Brick(board)
        case eYo.py.for_stmt: return n.for_stmt2Brick(board)
        case eYo.py.try_stmt: return n.try_stmt2Brick(board)
        case eYo.py.with_stmt: return n.with_stmt2Brick(board)
        case eYo.py.funcdef: return n.funcdef2Brick(board)
        case eYo.py.classdef: return n.classdef2Brick(board)
        case eYo.py.decorated: return n.decorated2Brick(board)
        case eYo.py.async_stmt:
          // async_stmt: 'async' (funcdef | with_stmt | for_stmt)
          n = n.n1
          switch(n.type) {
            case eYo.py.funcdef: root = n.funcdef2Brick(board); break
            case eYo.py.with_stmt: root = n.with_stmt2Brick(board); break
            case eYo.py.for_stmt: root = n.for_stmt2Brick(board); break
          }
          root.async_ = true
          return root
        default: console.error("BREAK HERE, UNEXPECTED NAME", n.name)
        throw 'ERROR'
      }
    case eYo.py.yield_expr:
      return this.yield_expr2Brick(board)
    case eYo.py.yield_stmt:
      root = eYo.brick.newReady(board, eYo.t3.stmt.yield_stmt)
      this.n0.yield_exprInBrick(root)
      return root
    case eYo.py.break_stmt:
      return eYo.brick.newReady(board, eYo.t3.stmt.break_stmt)
    case eYo.py.continue_stmt:
      return eYo.brick.newReady(board, eYo.t3.stmt.continue_stmt)
    case eYo.py.pass_stmt:
      return eYo.brick.newReady(board, eYo.t3.stmt.pass_stmt)
    case eYo.py.return_stmt: // 'return' [testlist_star_expr]
      root = eYo.brick.newReady(board, eYo.t3.stmt.return_stmt)
      ;(n = this.n1) && (n.testlist_star_exprInBrick(root.return_b))
      return root
    case eYo.py.import_stmt: // import_stmt: import_name | import_from
      n0 = this.n0
      if (n0.type === eYo.py.import_name) {
        //import_name: 'import' dotted_as_names
        root = eYo.brick.newReady(board, eYo.t3.stmt.import_stmt)
        var t = root.import_module_b
        n0.n1.knownListInBrick(t, function () {
          // dotted_as_name: dotted_name ['as' NAME]
          // dotted_name: NAME ('.' NAME)*
          if ((n2 = this.n2)) {
            var ddd = eYo.brick.newReady(eYo.t3.expr.identifier_as, board)
            brick.Alias_p = n2.n_str
          } else {
            ddd = eYo.brick.newReady(eYo.t3.expr.identifier, board)
          }
          var s = this.n0.n_child.map(child => child.type === eYo.py.tkn.NAME ? child.n_str : '.').join('')
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
          if (n.type === eYo.py.dotted_name) {
            s += n.n_child.map(child => child.type === eYo.py.tkn.NAME ? child.n_str : '.').join('')
            root.From_p = s
            s = ''
          } else if (n.type === eYo.py.tkn.DOT) {
            s += '.'
          } else if (n.type === eYo.py.tkn.ELLIPSIS) {
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
        if (n.type === eYo.py.tkn.STAR) {
          root.Star_p = true
        } else {
          var t = root.import_b
          if (n.type === eYo.py.tkn.LPAR) {
            n = n.sibling
            root.import_b.Parenth_p = true
          }
          n.knownListInBrick(t, function () {
            // import_as_name: NAME ['as' NAME]
            var n = this.n2
            if (n) {
              var ddd = eYo.brick.newReady(eYo.t3.expr.identifier_as, board)
              brick.Alias_p = n.n_str
            } else {
              ddd = eYo.brick.newReady(eYo.t3.expr.identifier, board)
            }
            brick.Target_p = this.n0.n_str
            return ddd
          })
        }
        return root
      }
    case eYo.py.raise_stmt: // raise_stmt: 'raise' [test ['from' test]]
      root = eYo.brick.newReady(board, eYo.t3.stmt.raise_stmt)
      if ((n = this.n0.sibling)) {
        root.expression_s.connect(n.toBrick(board))
        root.variant_ = eYo.key.EXPRESSION
        if ((n = n.sibling) && (n = n.sibling)) {
          root.from_s.connect(n.toBrick(board))
          root.variant_ = eYo.key.FROM
        }
      }
      return root
    case eYo.py.or_test: // or_test: and_test ('or' and_test)*
      return this.binary2Brick(eYo.t3.expr.or_test, board)
    case eYo.py.and_test: // and_expr: shift_expr ('&' shift_expr)*
      return this.binary2Brick(eYo.t3.expr.and_test, board)
    case eYo.py.xor_expr: // xor_expr: and_expr ('^' and_expr)*
      return this.binary2Brick(eYo.t3.expr.xor_expr, board)
    case eYo.py.and_expr:
      return this.binary2Brick(eYo.t3.expr.and_expr, board)
    case eYo.py.shift_expr: // shift_expr: arith_expr (('<<'|'>>') arith_expr)*
      return this.binary2Brick(eYo.t3.expr.shift_expr, board)
    case eYo.py.arith_expr: // arith_expr: term (('+'|'-') term)*
      return this.binary2Brick(eYo.t3.expr.a_expr, board)
    case eYo.py.term: // term: factor (('*'|'@'|'/'|'%'|'//') factor)*
      return this.binary2Brick(eYo.t3.expr.m_expr, board)
    case eYo.py.comparison: // expr (comp_op expr)*
      return this.binary2Brick(eYo.t3.expr.comparison,, board n => n.n0.n_str)
    case eYo.py.namedexpr_test:
      return this.namedexpr_test2Brick(board)
    case eYo.py.global_stmt:
      // global_stmt: 'global' NAME (',' NAME)*
      root = eYo.brick.newReady(board, eYo.t3.stmt.global_stmt)
      t = root.identifiers_b
      n = this.n1
      do {
        t.connectLast(n.toBrick(board))
      } while ((n = n.sibling) && (n = n.sibling))
      return root
    case eYo.py.nonlocal_stmt:
      // nonlocal_stmt: 'nonlocal' NAME (',' NAME)*
      root = eYo.brick.newReady(board, eYo.t3.stmt.nonlocal_stmt)
      t = root.identifiers_b
      n = this.n1
      do {
        t.connectLast(n.toBrick(board))
      } while ((n = n.sibling) && (n = n.sibling))
      return root
    case eYo.py.tkn.NEWLINE:
      return eYo.brick.newReady(board, eYo.t3.stmt.blank_stmt)
    case eYo.py.tkn.ENDMARKER:
      return  null
    // case eYo.py.tkn.NUMBER: break
    // case eYo.py.tkn.STRING: break
    // case eYo.py.tkn.INDENT: break
    // case eYo.py.tkn.DEDENT: break
    // case eYo.py.tkn.LPAR: break
    // case eYo.py.tkn.RPAR: break
    // case eYo.py.tkn.LSQB: break
    // case eYo.py.tkn.RSQB: break
    // case eYo.py.tkn.COLON: break
    // case eYo.py.tkn.COMMA: break
    // case eYo.py.tkn.SEMI: break
    // case eYo.py.tkn.PLUS: break
    // case eYo.py.tkn.MINUS: break
    // case eYo.py.tkn.STAR: break
    // case eYo.py.tkn.SLASH: break
    // case eYo.py.tkn.VBAR: break
    // case eYo.py.tkn.AMPER: break
    // case eYo.py.tkn.LESS: break
    // case eYo.py.tkn.GREATER: break
    // case eYo.py.tkn.EQUAL: break
    // case eYo.py.tkn.DOT: break
    // case eYo.py.tkn.PERCENT: break
    // case eYo.py.tkn.LBRACE: break
    // case eYo.py.tkn.RBRACE: break
    // case eYo.py.tkn.EQEQUAL: break
    // case eYo.py.tkn.NOTEQUAL: break
    // case eYo.py.tkn.LESSEQUAL: break
    // case eYo.py.tkn.GREATEREQUAL: break
    // case eYo.py.tkn.TILDE: break
    // case eYo.py.tkn.CIRCUMFLEX: break
    // case eYo.py.tkn.LEFTSHIFT: break
    // case eYo.py.tkn.RIGHTSHIFT: break
    // case eYo.py.tkn.DOUBLESTAR: break
    // case eYo.py.tkn.PLUSEQUAL: break
    // case eYo.py.tkn.MINEQUAL: break
    // case eYo.py.tkn.STAREQUAL: break
    // case eYo.py.tkn.SLASHEQUAL: break
    // case eYo.py.tkn.PERCENTEQUAL: break
    // case eYo.py.tkn.AMPEREQUAL: break
    // case eYo.py.tkn.VBAREQUAL: break
    // case eYo.py.tkn.CIRCUMFLEXEQUAL: break
    // case eYo.py.tkn.LEFTSHIFTEQUAL: break
    // case eYo.py.tkn.RIGHTSHIFTEQUAL: break
    // case eYo.py.tkn.DOUBLESTAREQUAL: break
    // case eYo.py.tkn.DOUBLESLASH: break
    // case eYo.py.tkn.DOUBLESLASHEQUAL: break
    // case eYo.py.tkn.AT: break
    // case eYo.py.tkn.ATEQUAL: break
    // case eYo.py.tkn.RARROW: break
    // case eYo.py.tkn.ELLIPSIS: break
    // case eYo.py.tkn.COLONEQUAL: break
    // case eYo.py.tkn.OP: break
    // case eYo.py.tkn.TYPE_IGNORE: break
    // case eYo.py.tkn.TYPE_COMMENT: break
    // case eYo.py.tkn.ERRORTOKEN: break
    // case eYo.py.tkn.N_TOKENS: break
    // case eYo.py.single_input: break
    // // case eYo.py.file_input: break
    // case eYo.py.eval_input: break
    // case eYo.py.decorator: break
    // case eYo.py.decorators: break
    // case eYo.py.decorated: break
    // case eYo.py.async_funcdef: break
    // case eYo.py.funcdef: break
    // case eYo.py.parameters: break
    // case eYo.py.typedargslist: break
    // case eYo.py.tfpdef: break
    // case eYo.py.varargslist: break
    // case eYo.py.vfpdef: break
    // case eYo.py.stmt: break
    // case eYo.py.simple_stmt: break
    // case eYo.py.small_stmt: break
    // case eYo.py.expr_stmt: break
    // case eYo.py.annassign: break
    // case eYo.py.testlist_star_expr: break
    // case eYo.py.augassign: break
    // case eYo.py.del_stmt: break
    // case eYo.py.pass_stmt: break
    // case eYo.py.flow_stmt: break
    // case eYo.py.break_stmt: break
    // case eYo.py.continue_stmt: break
    // case eYo.py.return_stmt: break
    // case eYo.py.yield_stmt: break
    // case eYo.py.import_name: break
    // case eYo.py.import_from: break
    // case eYo.py.import_as_name: break
    // case eYo.py.dotted_as_name: break
    // case eYo.py.import_as_names: break
    // case eYo.py.dotted_as_names: break
    // case eYo.py.dotted_name: break
    // case eYo.py.assert_stmt: break
    // case eYo.py.compound_stmt: break
    // case eYo.py.async_stmt: break
    // case eYo.py.if_stmt: break
    // case eYo.py.while_stmt: break
    // case eYo.py.for_stmt: break
    // case eYo.py.try_stmt: break
    // case eYo.py.with_stmt: break
    // case eYo.py.with_item: break
    // case eYo.py.except_clause: break
    // case eYo.py.suite: break
    // case eYo.py.test: break
    // case eYo.py.test_nocond: break
    // case eYo.py.lambdef: break
    // case eYo.py.lambdef_nocond: break
    // case eYo.py.not_test: break
    // case eYo.py.comp_op: break
    // case eYo.py.star_expr: break
    // case eYo.py.expr: break
    // case eYo.py.factor: break
    // case eYo.py.power: break
    // case eYo.py.atom_expr: break
    // case eYo.py.testlist: break
    // case eYo.py.trailer: break
    // case eYo.py.subscriptlist: break
    // case eYo.py.subscript: break
    // case eYo.py.sliceop: break
    // case eYo.py.exprlist: break
    // case eYo.py.dictorsetmaker: break
    // case eYo.py.classdef: break
    // case eYo.py.arglist: break
    // case eYo.py.argument: break
    // case eYo.py.comp_iter: break
    // case eYo.py.sync_comp_for: break
    // case eYo.py.comp_for: break
    // case eYo.py.comp_if: break
    // case eYo.py.encoding_decl: break
    // case eYo.py.yield_expr: break
    // case eYo.py.yield_arg: break
    // case eYo.py.func_body_suite: break
    // case eYo.py.func_type_input: break
    // case eYo.py.func_type: break
    // case eYo.py.typelist: break
    default:
      if (!this.n0) {
        throw `2) NOTHING TO DO WITH ${this.name}`
      } else if (!this.n1) {
        // console.log(`PASSED ${this.name} to ${this.n0.name}`, )
        return this.n0.toBrick(board)
      } else {
        // eYo.py.gmr.Showtree(eYo.py.gmr._pyParser_Grammar, this)
        console.error('BREAK HERE TO DEBUG', this.name, this.n_child)
        throw `3) NOTHING TO DO WITH ${this.name}`
      }
  }
}
