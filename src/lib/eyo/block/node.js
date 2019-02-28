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
 * Converts the node `n` to a visual block.
 * @param {!Object} workspace A tree node.
 * @param {!Object} a block delegate or an array of block delegates
 */
eYo.Node.prototype.toBlock = function (workspace) {
  console.log(`node type: ${this.name}`)
  var root, b1, b2, n1, n2, n3, i, t, tt
  switch (this.n_type) {
    case eYo.TKN.file_input: // (NEWLINE | stmt)* ENDMARKER
      var blocks = this.n_child.map(child => child.n_type === eYo.TKN.stmt ? child.toBlock(workspace) : null)
      while (blocks.length) {
        if ((root = blocks.shift())) {
          b1 = root
          blocks.forEach(bb => {
            if (bb) {
              b1.eyo.next = bb.eyo
              b1 = bb
            }
          })
          break
        }
      }
      return root
    case eYo.TKN.simple_stmt: // small_stmt (';' small_stmt)* [';'] NEWLINE
      var blocks = this.n_child.map(child => child.n_type === eYo.TKN.small_stmt ? child.toBlock(workspace) : null)
      while (blocks.length) {
        if ((root = blocks.shift())) {
          b1 = root
          blocks.forEach(bb => {
            if (bb) {
              b1.eyo.next = bb.eyo
              b1 = bb
            }
          })
          break
        }
      }
      return root
    case eYo.TKN.expr_stmt: // testlist_star_expr (annassign | augassign (yield_expr|testlist) | [('=' (yield_expr|testlist_star_expr))+ [TYPE_COMMENT]] )
      b1 = this.n_child[0].toBlock(workspace)
      if (this.n_child.length === 1) {
        // simple expression statement
        root = eYo.DelegateSvg.newBlockReady(workspace, eYo.T3.Stmt.expression_stmt)
        if (b1.length) {
          // tuple
          root.eyo.variant_p = eYo.Key.TUPLE
          t = root.eyo.tuple_s.target
          b1.forEach(bb => {
            t.lastInput.connection.connect(bb.outputConnection)
          })
          return root
        }
        root.eyo.variant_p = eYo.Key.EXPRESSION
        root.eyo.expression_s.connection.connect(b1.outputConnection)
        return root
      }
      if (this.n_child[1].n_type === eYo.TKN.EQUAL) {
        // assignment,
        root = eYo.DelegateSvg.newBlockReady(workspace, eYo.T3.Stmt.assignment_stmt)
        // what is the rhs ?
        t = root.eyo.value_s.target
        b2 = this.n_child[this.n_child.length - 1].toBlock(workspace)
        if (b2.length) {
          b2.forEach(bb => {
            t.lastInput.connection.connect(bb.outputConnection)
          })
        } else {
          t.lastInput.connection.connect(b2.outputConnection)
        }
        // and now the lhs
        if (this.n_child.length > 3) {
          // this is a multiple assignment
          root.eyo.variant_p = eYo.Key.TARGETS
          t = root.eyo.targets_s.target
          t.lastInput.connection.connect(b1.outputConnection)
          for (i = 3 ; i < this.n_child.length - 2 ; i += 2) {
            b1 = this.n_child[i].toBlock(workspace)
            t.lastInput.connection.connect(b1.outputConnection)
          }
          return root
        }
        root.eyo.name_s.connection.connect(b1.outputConnection)
        b1 = this.n_child[2].toBlock(workspace)
        // is it a tuple ?
        t.lastInput.connection.connect(b1.outputConnection)
        return root
      }
      // 1) 
      return root
    case eYo.TKN.testlist_star_expr: // (test|star_expr) (',' (test|star_expr))* [',']
      var ra = []
      for (i = 0 ; i < this.n_child.length ; i += 2) {
        ra.push(this.n_child[i].toBlock(workspace))
      }
      return ra
    case eYo.TKN.NAME:
      return eYo.DelegateSvg.newBlockReady(workspace, {
        type: eYo.T3.Expr.identifier,
        name_d: this.n_str
      })
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
    // case eYo.TKN.raise_stmt: break
    // case eYo.TKN.import_stmt: break
    // case eYo.TKN.import_name: break
    // case eYo.TKN.import_from: break
    // case eYo.TKN.import_as_name: break
    // case eYo.TKN.dotted_as_name: break
    // case eYo.TKN.import_as_names: break
    // case eYo.TKN.dotted_as_names: break
    // case eYo.TKN.dotted_name: break
    // case eYo.TKN.global_stmt: break
    // case eYo.TKN.nonlocal_stmt: break
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
    // case eYo.TKN.namedexpr_test: break
    // case eYo.TKN.test: break
    // case eYo.TKN.test_nocond: break
    // case eYo.TKN.lambdef: break
    // case eYo.TKN.lambdef_nocond: break
    // case eYo.TKN.or_test: break
    // case eYo.TKN.and_test: break
    // case eYo.TKN.not_test: break
    // case eYo.TKN.comparison: break
    // case eYo.TKN.comp_op: break
    // case eYo.TKN.star_expr: break
    // case eYo.TKN.expr: break
    // case eYo.TKN.xor_expr: break
    // case eYo.TKN.and_expr: break
    // case eYo.TKN.shift_expr: break
    // case eYo.TKN.arith_expr: break
    // case eYo.TKN.term: break
    // case eYo.TKN.factor: break
    // case eYo.TKN.power: break
    // case eYo.TKN.atom_expr: break
    // case eYo.TKN.atom: break
    // case eYo.TKN.testlist_comp: break
    // case eYo.TKN.trailer: break
    // case eYo.TKN.subscriptlist: break
    // case eYo.TKN.subscript: break
    // case eYo.TKN.sliceop: break
    // case eYo.TKN.exprlist: break
    // case eYo.TKN.testlist: break
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
      if (this.n_nchildren === 1) {
        return this.n_child[0].toBlock(workspace)
      } else {
        console.error(`NOTHING TO DO WITH ${this.name}`)
        eYo.GMR.dumptree(eYo.GMR._PyParser_Grammar, this)
        console.error(this.n_child)
      }
  }
}
