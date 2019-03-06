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
 * @param {!Object} worb A workspace or a block.
 * @param {!Object} a block delegate or an array of block delegates
 */
eYo.Node.prototype.toBlock = function (worb) {
  // console.log(`node type: ${this.name}`)
  var root, b0, b1, b2, n0, n1, n2, i, j, t
  switch (this.n_type) {
    case eYo.TKN.file_input: // (NEWLINE | stmt)* ENDMARKER
      var blocks = this.n_child.map(child => child.n_type === eYo.TKN.stmt ? child.toBlock(worb) : null)
      while (blocks.length) {
        if ((root = blocks.shift())) {
          b0 = root
          blocks.forEach(bb => {
            if (bb) {
              b0.eyo.next = bb.eyo
              b0 = bb
            }
          })
          break
        }
      }
      return root
    case eYo.TKN.simple_stmt: // small_stmt (';' small_stmt)* [';'] NEWLINE
      var blocks = this.n_child.map(child => child.n_type === eYo.TKN.small_stmt ? child.toBlock(worb) : null)
      while (blocks.length) {
        if ((root = blocks.shift())) {
          b0 = root
          blocks.forEach(bb => {
            if (bb) {
              b0.eyo.next = bb.eyo
              b0 = bb
            }
          })
          break
        }
      }
      return root
    case eYo.TKN.expr_stmt: // testlist_star_expr (annassign | augassign (yield_expr|testlist) | [('=' (yield_expr|testlist_star_expr))+ [TYPE_COMMENT]] )
      b0 = this.n0.toBlock(worb)
      if (this.n_child.length === 1) {
        // simple expression statement
        root = eYo.DelegateSvg.newBlockReady(worb, eYo.T3.Stmt.expression_stmt)
        if (b0.length) {
          // tuple
          t = root.eyo.tuple_s.target
          b0.forEach(bb => {
            t.lastConnection.connect(bb.outputConnection)
          })
          root.eyo.comment_variant_p = eYo.Key.NONE
          root.eyo.variant_p = eYo.Key.TUPLE
          return root
        }
        root.eyo.expression_s.connect(b0)
        root.eyo.comment_variant_p = eYo.Key.NONE
        root.eyo.variant_p = eYo.Key.EXPRESSION
        return root
      }
      if (this.n1.n_type === eYo.TKN.EQUAL) {
        // assignment,
        root = b1 = eYo.DelegateSvg.newBlockReady(worb, eYo.T3.Stmt.assignment_stmt)
        i = 0
        while (true) {
          t = b1.eyo.targets_s.target
          b0 = this.n_child[i].toBlock(worb)
          if (b0.length) {
            // tuple
            if (b0.length > 1) {
              b1.eyo.variant_p = eYo.Key.TARGETS
              b0.forEach(bb => {
                t.lastConnection.connect(bb.outputConnection)
              })
            } else {
              b1.eyo.name_s.connect(b0[0])
            }
          } else {
            b1.eyo.name_s.connect(b0)
          }
          i += 2
          if (i < this.n_child.length - 2) {
            b0 = eYo.DelegateSvg.newBlockReady(worb, eYo.T3.Expr.assignment_expr)
            b1.eyo.value_s.target.lastConnection.connect(b0.outputConnection)
            b1 = b0  
            continue
          }
          break
        }
        // and now the rhs
        b0 = this.n_child[i].toBlock(worb)
        t = b1.eyo.value_s.target // change here
        if (b0.length) {
          b0.forEach(bb => {
            t.lastConnection.connect(bb.outputConnection)
          })
        } else {
          t.lastConnection.connect(b0.outputConnection)
        }
        return root
      }
      return root
    case eYo.TKN.testlist_star_expr: // (test|star_expr) (',' (test|star_expr))* [',']
      var ans = []
      for (i = 0 ; i < this.n_child.length ; i += 2) {
        ans.push(this.n_child[i].toBlock(worb))
      }
      return ans
    case eYo.TKN.atom_expr: // ['await'] atom trailer*
      i = 0
      n0 = this.n_child[i]
      if (n0.n_type === eYo.TKN.NAME && n0.n_str === 'await') {
        i = 1
        b0 = this.n_child[i].toBlock(worb)
        b0.eyo.await = true
      } else {
        b0 = n0.toBlock(worb)
      }
      root = b0
      // trailers ?
      while (++i < this.n_nchildren) {
        n1 = this.n_child[i]
        // trailer: '(' [arglist] ')' | '[' subscriptlist ']' | '.' NAME
        n2 = n1.n0
        if (n2.n_type === eYo.TKN.LPAR) {
          if (b0.eyo.variant_p === eYo.Key.NONE) {
            b0.eyo.variant_p = eYo.Key.CALL_EXPR
          } else {
            root = eYo.DelegateSvg.newBlockReady(worb, eYo.T3.Expr.call_expr)
            root.eyo.name_s.connection.connect(b0.outputConnetion)
            b0 = root
          }
          t = b0.eyo.n_ary_s.target
          j = 0
          while (++j < n1.n_nchildren - 1) { // except the last token, a delimiter
            b1 = n1.n_child[j].toBlock(worb)
            t.lastConnection.connect(b1.outputConnection)
            ++j // skip the COMMA
          }
        } else if (n2.n_type === eYo.TKN.LSQB) {
          if (b0.eyo.variant_p === eYo.Key.NONE) {
            b0.eyo.variant_p = eYo.Key.SLICING
          } else {
            root = eYo.DelegateSvg.newBlockReady(worb, eYo.T3.Expr.slicing)
            root.eyo.name_s.connection.connect(b0.outputConnetion)
            b0 = root
          }
          t = b0.eyo.slicing_s.target
          j = 0
          while (++j < n1.n_nchildren - 1) { // except the last token, a delimiter
            b1 = n1.n_child[j].toBlock(worb)
            t.lastConnection.connect(b1.outputConnection)
            ++j // skip the COMMA
          }
        } else /* if (n2.n_type === eYo.TKN.DOT) */ {
          if (b0.eyo.variant_p !== eYo.Key.NONE || b0.dotted_p !== 0) {
            root = eYo.DelegateSvg.newBlockReady(worb, eYo.T3.Expr.identifier)
            root.dotted_p = 1
            root.holder_s.connect(b0)
            b0 = root
          } else {
            b0.dotted_p = 1
            b0.holder_s.connection.connect(b0.name_s.target)
          }
          b1 = n1.n1.toBlock()
          b0.name_s.connect(b1)
        }
      }
      return root
    // case eYo.TKN.comp_iter: 
    case eYo.TKN.comp_if: // 'if' test_nocond [comp_iter]
      // worb is a block
      root = eYo.DelegateSvg.newBlockReady(worb, eYo.T3.Expr.comp_if)
      root.eyo.if_s.connect(this.n1.toBlock(worb.workspace))
      root.eyo.comp_iter = (n0 = this.n2) && n0.toBlock(worb)
      return root
    case eYo.TKN.comp_for: // ['async'] sync_comp_for
      // worb is a block
      root = this.last_child.toBlock(worb)
      if (this.n0.sibling) {
        root.async = true
      }
      return root
    case eYo.TKN.sync_comp_for: // 'for' exprlist 'in' or_test [comp_iter]
    /* comp_iter: comp_for | comp_if
    sync_comp_for: 'for' exprlist 'in' or_test [comp_iter]
    comp_for: ['async'] sync_comp_for
    comp_if: 'if' test_nocond [comp_iter] */
      // if worb is in fact a block, we must feed if
      if (worb.workspace) {
        // worb is a block
        // this is the first for in the comprehension
        t = worb.eyo.for_s.target
        this.n1.toBlock(worb.workspace).forEach(b => t.lastConnect(b))
        worb.eyo.in_s.connect(this.n3.toBlock(worb.workspace))
        if ((n0 = this.n4)) {
          b0 = n0.toBlock(worb.workspace)
          t = worb.eyo.for_if_s.target
          do {
            t.lastConnect(b0)
          } while ((b0 = b0.comp_iter))
        }
      } else {
        n0 = this.parent
        if (n0.n3 === this) {
          // dictionary comprehension
          root = eYo.DelegateSvg.newBlockReady(worb, eYo.T3.Expr.dict_comprehension)
          n1 = n0.n0
          root.eyo.key_s.connect(n1.toBlock(worb))
          n1 = n1.sibling.sibling
          root.eyo.datum_s.connect(n1.toBlock(worb))
        } else {
          // set comprehension

        }
      }
      return root
    case eYo.TKN.exprlist: // (expr|star_expr) (',' (expr|star_expr))* [',']
      ans = []
      n0 = this.n0
      do {
        ans.push(n0.toBlock(worb))
      } while ((n0 = n0.sibling) /* skip COMMA */ && (n0 = n0.sibling))
      return ans
    case eYo.TKN.testlist_comp: // (namedexpr_test|star_expr) ( comp_for | (',' (namedexpr_test|star_expr))* [','] )
      if (this.last_child.n_type === eYo.TKN.comp_for) {
        // this is a comprehension
        root = eYo.DelegateSvg.newBlockReady(worb, eYo.T3.Expr.comprehension)
        root.eyo.expression_s.connect(this.n0.toBlock(worb))
        this.last_child.toBlock(root)
        return root
      } else { // this is a tuple
        ans = []
        n0 = this.n0
        do {
          ans.push(n0.toBlock(worb))
        } while ((n0 = n0.sibling) /* skip COMMA */ && (n0 = n0.sibling))
        return ans
      }
    case eYo.TKN.dictorsetmaker: // ...
        /*dictorsetmaker: ( ((test ':' test | '**' expr)
                   (comp_for | (',' (test ':' test | '**' expr))* [','])) |
                  ((test | star_expr)
                   (comp_for | (',' (test | star_expr))* [','])) )
                   */
      n0 = this.n0
      if ((n1 = n0.sibling)) {
        if (n1.n_type === eYo.TKN.comp_for) {
          // set comprehension
          root = eYo.DelegateSvg.newBlockReady(worb, eYo.T3.Expr.comprehension)
          root.eyo.expression_s.connect(n0.toBlock(worb))
          n1.toBlock(root)
          root.eyo.is_set_ = true
          return root
        } else if ((n2 = n1.sibling)) {
          if (n2.n_type === eYo.TKN.comp_for) {
            // set comprehension with '**'
            root = eYo.DelegateSvg.newBlockReady(worb, eYo.T3.Expr.comprehension)
            b0 = eYo.DelegateSvg.newBlockReady(worb, eYo.T3.Expr.expression_star_star)
            root.eyo.expression_s.connect(b0)
            b0.eyo.modified_s.connect(n1.toBlock(worb))
            n2.toBlock(root)
            root.eyo.is_set_ = true
            return root
          } else if ((n1 = n2.sibling)) {
            if (n1.n_type === eYo.TKN.comp_for) {
              root = eYo.DelegateSvg.newBlockReady(worb, eYo.T3.Expr.dict_comprehension)
              root.eyo.key_s.connect(n0.toBlock(worb))
              root.eyo.datum_s.connect(n2.toBlock(worb))
              n1.toBlock(root)
              return root
            }
          }
        }
      } else {
        root = n0.toBlock(worb)
        root.eyo.is_set_ = true
        return root
      }
      ra = []
      do {
        if (n0.n_type === eYo.TKN.DOUBLESTAR) {
          n1 = n0.sibling
          b0 = eYo.DelegateSvg.newBlockReady(worb, eYo.T3.Expr.expression_star_star)
          ra.push(b0)
          b0.eyo.modified_s.connect(n1.toBlock(worb))
          if ((n1 = n1.sibling) && (n0 = n1.sibling)) {
            continue
          }
        } else if ((n1 = n0.sibling)) {
          if (n1.n_type === eYo.TKN.COMMA) {
            ra.push(n0.toBlock(worb))
            ra.eyo = {is_set_: true}
            if ((n0 = n1.sibling)) {
              continue
            }
          } else if (n1.n_type === eYo.TKN.COLON) {
            b0 = eYo.DelegateSvg.newBlockReady(worb, eYo.T3.Expr.key_datum)
            b0.eyo.key_s.connect(n0.toBlock(worb))
            if ((n2 = n1.sibling)) {
              b0.eyo.datum_s.connect(n2.toBlock(worb))
            }
            ra.push(b0)
            if ((n0 = (n2 && n2.sibling)) && (n0 = n0.sibling)) {
              continue
            }
          }
        } else {
          ra.push(n0.toBlock(worb))
          ra.eyo = {is_set_: true}
        }
        return ra
      } while (true)
    case eYo.TKN.atom: //atom: ('(' [yield_expr|testlist_comp] ')' | '[' [testlist_comp] ']' | '{' [dictorsetmaker] '}')
      if (this.n_nchildren === 1) {
        return this.n0.toBlock(worb)
      }
      n0 = this.n0
      if (n0.n_type === eYo.TKN.LPAR) {
        root = eYo.DelegateSvg.newBlockReady(worb, eYo.T3.Expr.parent_form)
        n0 = n0.sibling
        if (n0.sibling) {
          b0 = n0.toBlock(worb)
          t = root.eyo
          if (b0.length) { 
            b0.forEach(b => t.lastConnect(b))
          } else {
            t.lastConnect(b0)
          }
        }
      } else if (n0.n_type === eYo.TKN.LSQB) {
        root = eYo.DelegateSvg.newBlockReady(worb, eYo.T3.Expr.list_display)
        n0 = n0.sibling
        if (n0.sibling) {
          b0 = n0.toBlock(worb)
          t = root.eyo
          if (b0.length) { 
            b0.forEach(b => t.lastConnect(b))
          } else {
            t.lastConnect(b0)
          }
        }
      } else if (n0.n_type === eYo.TKN.LBRACE) {
        n0 = n0.sibling
        if (n0.sibling) {

        } else {
          root = eYo.DelegateSvg.newBlockReady(worb, eyo.T3.Expr.set_display)
        }
        n0 = n0.sibling
        if (n0.sibling) {
          b0 = n0.toBlock(worb)
          t = root.eyo
          if (b0.length) { 
            b0.forEach(b => t.lastConnect(b))
          } else {
            t.lastConnect(b0)
          }
        }
      }
      return root
    case eYo.TKN.NAME:
      return eYo.DelegateSvg.newBlockReady(worb, {
        type: eYo.T3.Expr.identifier,
        name_d: this.n_str
      })
    case eYo.TKN.NUMBER:
      return eYo.DelegateSvg.newBlockReady(worb, {
        type: eYo.T3.Expr.numberliteral,
        value_d: this.n_str
      })
    /*
    star_expr: '*' expr
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
      root = n0.toBlock(worb)
      while ((n1 = n0.sibling) && (n2 = n1.sibling)) {
        b0 = eYo.DelegateSvg.newBlockReady(worb, eYo.T3.Expr.m_expr)
        b0.eyo.operator_p = n1.n_str
        b0.eyo.lhs_s.connect(root)
        root = b0
        b0.eyo.rhs_s.connect(n2.toBlock(worb))
        n0 = n2
      }
      return root
    case eYo.TKN.factor: // ('+'|'-'|'~') factor | power
      if ((n1 = this.n0.sibling)) {
        root = eYo.DelegateSvg.newBlockReady(worb, eYo.T3.Expr.unary)
        root.eyo.operator_p = this.n0.n_str
        root.eyo.rhs_s.connect(n1.toBlock(worb))
      } else {
        return this.n0.toBlock(worb)
      }
    case eYo.TKN.power: // atom_expr ['**' factor]
      if ((n0 = this.n0.sibling)) {
        root = eYo.DelegateSvg.newBlockReady(worb, eYo.T3.Expr.power)
        root.eyo.lhs_s.connect(this.n0.toBlock(worb))
        root.eyo.rhs_s.connect(this.last_child.toBlock(worb))
      } else {
        return this.n0.toBlock(worb)
      }
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
        return this.n0.toBlock(worb)
      } else {
        console.error(`NOTHING TO DO WITH ${this.name}`)
        // eYo.GMR.dumptree(eYo.GMR._PyParser_Grammar, this)
        console.error(this.n_child)
      }
  }
}
