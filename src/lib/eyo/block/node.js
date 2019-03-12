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
eYo.Node.prototype.intoDelegate = function (target) {
  // console.log(`node type: ${this.name}`)
  var b0, b1, b2, n0, n1, n2, i, j, t
  switch (this.n_type) {
    case eYo.TKN.exprlist:
    case eYo.TKN.arglist:
    case eYo.TKN.subscriptlist:
    case eYo.TKN.testlist_star_expr:
      n0 = this.n0
      do {
        target.lastConnect(n0.toBlock(target.workspace))
      } while ((n0 = n0.sibling) && (n0 = n0.sibling)) // gobble comma
      return
    case eYo.TKN.comp_for: // ['async'] sync_comp_for
      this.last_child.intoDelegate(target)
      if (this.n1) {
        target.async = true
        console.error('async is not supported')
      }
      return
    case eYo.TKN.sync_comp_for: // 'for' exprlist 'in' or_test [comp_iter]
    /* comp_iter: comp_for | comp_if
    sync_comp_for: 'for' exprlist 'in' or_test [comp_iter]
    comp_for: ['async'] sync_comp_for
    comp_if: 'if' test_nocond [comp_iter] */
      this.n1.intoDelegate(target.for_t.eyo)
      target.in_s.connect(this.n3.toBlock(target.workspace))
      if ((n0 = this.n4)) {
        target.comp_iter = n0.toBlock(target.workspace)
      }
      return
    case eYo.TKN.varargslist: /* (vfpdef ['=' test] (',' vfpdef ['=' test])* [',' [
        '*' [vfpdef] (',' vfpdef ['=' test])* [',' ['**' vfpdef [',']]]
      | '**' vfpdef [',']]]
  | '*' [vfpdef] (',' vfpdef ['=' test])* [',' ['**' vfpdef [',']]]
  | '**' vfpdef [',']*/
      // We do not check any consistency here
      n0 = this.n0
      while (n0) {
        if (n0.type === eYo.TKN.STAR) {
          b0 = eYo.DelegateSvg.newBlockReady(target.workspace, eYo.T3.Expr.parameter_star)
          target.lastConnect(b0)
          if ((n0 = n0.sibling)) {
            b0.eyo.modified_s.connect(n0.toBlock(target.workspace))
            if ((n0 = n0.sibling)) { // comma
              n0 = n0.sibling
              continue
            }
          }
        } else if (n0.type === eYo.TKN.DOUBLESTAR) {
          b0 = eYo.DelegateSvg.newBlockReady(target.workspace, eYo.T3.Expr.parameter_star_star)
          target.lastConnect(b0)
          n0 = n0.sibling
          b0.eyo.modified_s.connect(n0.toBlock(target.workspace))
          if ((n0 = n0.sibling)) { // comma
            n0 = n0.sibling
            continue
          }
        } else {
          b0 = n0.toBlock(target.workspace)
          target.lastConnect(b0)
          if ((n0 = n0.sibling)) {
            if (n0.type === eYo.TKN.EQUAL) {
              b0.eyo.variant_p = eYo.Key.DEFINED
              n0 = n0.sibling
              b0.eyo.definition_t.eyo.lastConnect(n0.toBlock(target.workspace))
              if (!(n0 = n0.sibling)) {
                break
              }
            }
            n0 = n0.sibling
            continue
          }
        }
        break
      }
      return
    default:
      throw `NOTHING TO DO WITH ${this.name}`
  }
}

/**
 * Converts the node `n` to a visual block.
 * @param {!Object} workspace A workspace.
 * @param {!Object} a block or an array of blocks
 */
eYo.Node.prototype.toBlock = function (workspace) {
  // console.log(`node type: ${this.name}`)
  var root, b0, b1, b2, n0, n1, n2, i, j, t
  switch (this.n_type) {
    case eYo.TKN.file_input: // (NEWLINE | stmt)* ENDMARKER
      var blocks = this.n_child.map(child => child.n_type === eYo.TKN.stmt ? child.toBlock(workspace) : null)
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
      var blocks = this.n_child.map(child => child.n_type === eYo.TKN.small_stmt ? child.toBlock(workspace) : null)
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
      n0 = this.n0
      if (!(n1 = this.n1)) {
        // simple expression statement: only a testlist_star_expr
        root = eYo.DelegateSvg.newBlockReady(workspace, eYo.T3.Stmt.expression_stmt)
        if (n0.n_nchildren > 1) {
          n0.intoDelegate(root.eyo.list_t.eyo)
          root.eyo.variant_p = eYo.Key.LIST
        } else {
          root.eyo.expression_s.connect(this.n0.toBlock(workspace))
          root.eyo.variant_p = eYo.Key.EXPRESSION
        }
        root.eyo.comment_variant_p = eYo.Key.NONE
        return root
      }
      if (n1.n_type === eYo.TKN.EQUAL) {
        // assignment,
        root = b1 = eYo.DelegateSvg.newBlockReady(workspace, eYo.T3.Stmt.assignment_stmt)
        while (true) {
          // targets
          if (n0.n_nchildren > 1) {
            b1.eyo.variant_p = eYo.Key.TARGETS
            n0.intoDelegate(b1.eyo.targets_t.eyo)
          } else {
            b1.eyo.name_s.connect(n0.toBlock(workspace))
          }
          // values
          n0 = n1.sibling
          if ((n1 = n0.sibling)) {
            if (n1.n_type === eYo.TKN.EQUAL) {
              b2 = eYo.DelegateSvg.newBlockReady(workspace, eYo.T3.Expr.assignment_chain)
              if ((t = b1.eyo.value_t)) {
                t.eyo.lastConnect(b2)
              } else if ((t = b1.eyo.definition_t)) {
                t.eyo.lastConnect(b2)
              } else {
                console.error('ERROR')
              }
              b1 = b2
              continue
            } else {
              root.eyo.type_comment_node = n1
            }
          }
          n0.intoDelegate((b1.eyo.value_t || b1.eyo.definition_t).eyo)
          break
        }
      } else if (n1.type === eYo.TKN.augassign) { // augassign: ('+=' | '-=' | '*=' | '@=' | '/=' | '%=' | '&=' | '|=' | '^=' | '<<=' | '>>=' | '**=' | '//=')
        root = eYo.DelegateSvg.newBlockReady(workspace, eYo.T3.Expr.augmented_assignment_stmt)
        root.eyo.operator_p = n1.n_str
        n2 = n1.sibling
        t = root.eyo.value_t.eyo
        if (n2.type === eYo.TKN.yield_expr) {
          b2 = n2.toBlock(workspace)
          t.lastConnect(b2)
        } else {
          n2.intoDelegate(t)
        }
      } else if (n1.type === eYo.TKN.anassign) { // ':' test ['=' (yield_expr|testlist)]
        
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
      // trailers ?
      while ((n0 = n0.sibling)) {
        // trailer: '(' [arglist] ')' | '[' subscriptlist ']' | '.' NAME
        if (n0.n0.n_type === eYo.TKN.LPAR) {
          if (b0.eyo.variant_p === eYo.Key.NONE) {
            b0.eyo.variant_p = eYo.Key.CALL_EXPR
          } else {
            root = eYo.DelegateSvg.newBlockReady(workspace, eYo.T3.Expr.call_expr)
            root.eyo.name_s.connect(b0)
            b0 = root
          }
          n1 = n0.n1
          if (n1.n_type !== eYo.TKN.RPAR) {
            n1.intoDelegate(root.eyo.n_ary_t.eyo)
          }
        } else if (n0.n0.n_type === eYo.TKN.LSQB) {
          if (b0.eyo.variant_p === eYo.Key.NONE) {
            b0.eyo.variant_p = eYo.Key.SLICING
          } else {
            root = eYo.DelegateSvg.newBlockReady(workspace, eYo.T3.Expr.slicing)
            root.eyo.name_s.connect(b0)
            b0 = root
          }
          n1 = n0.n1
          if (n1.n_type !== eYo.TKN.RSQB) {
            n1.intoDelegate(root.eyo.slicing_t.eyo)
          }
        } else /* if (n2.n_type === eYo.TKN.DOT) */ {
          if (b0.eyo.variant_p !== eYo.Key.NONE || b0.dotted_p !== 0) {
            root = eYo.DelegateSvg.newBlockReady(workspace, eYo.T3.Expr.identifier)
            root.dotted_p = 1
            root.holder_s.connect(b0)
            b0 = root
          } else {
            b0.dotted_p = 1
            b0.holder_s.connection.connect(b0.name_s.target)
          }
          b1 = n1.n1.toBlock(workspace)
          b0.name_s.connect(b1)
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
      root = eYo.DelegateSvg.newBlockReady(workspace, eYo.T3.Expr.proper_slice)
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
    case eYo.TKN.sync_comp_for: // 'for' exprlist 'in' or_test [comp_iter]
      /* comp_iter: comp_for | comp_if
      sync_comp_for: 'for' exprlist 'in' or_test [comp_iter]
      comp_for: ['async'] sync_comp_for
      comp_if: 'if' test_nocond [comp_iter] */
        root = eYo.DelegateSvg.newBlockReady(workspace, eYo.T3.Expr.comp_for)
        this.intoDelegate(root.eyo)
        root.eyo.comp_iter = (n0 = this.n4) && n0.toBlock(workspace)
        return root
    // case eYo.TKN.comp_iter: 
    case eYo.TKN.comp_if: // 'if' test_nocond [comp_iter]
      root = eYo.DelegateSvg.newBlockReady(workspace, eYo.T3.Expr.comp_if)
      root.eyo.if_s.connect(this.n1.toBlock(workspace))
      root.eyo.comp_iter = (n2 = this.n2) && n2.toBlock(workspace)
      return root
    case eYo.TKN.testlist_comp: // (namedexpr_test|star_expr) ( comp_for | (',' (namedexpr_test|star_expr))* [','] )
      n0 = this.n0
      if ((n1 = this.n1)) {
        if (n1.n_type === eYo.TKN.comp_for) {
          // this is a comprehension
          root = eYo.DelegateSvg.newBlockReady(workspace, eYo.T3.Expr.comprehension)
          root.eyo.expression_s.connect(n0.toBlock(workspace))
          n1.intoDelegate(root.eyo)
          t = root.eyo.for_if_t.eyo
          b0 = root
          while ((b1 = b0.eyo.comp_iter)) {
            b0.eyo.comp_iter = undefined
            t.lastConnect((b0 = b1))
          }
        } else /* if (this.n_nchildren > 1) */ { // this is a tuple with no delimiter
          root = eYo.DelegateSvg.newBlockReady(workspace, eYo.T3.Expr.enclosure)
          do {
            root.eyo.lastConnect(n0.toBlock(workspace))
          } while ((n0 = n0.sibling) /* skip COMMA */ && (n0 = n0.sibling))
        }
      } else {
        root = n0.toBlock(workspace)
      }
      return root
    case eYo.TKN.dictorsetmaker: // ...
        /*dictorsetmaker: ( ((test ':' test | '**' expr)
                   (comp_for | (',' (test ':' test | '**' expr))* [','])) |
                  ((test | star_expr)
                   (comp_for | (',' (test | star_expr))* [','])) )
                   */
      root = eYo.DelegateSvg.newBlockReady(workspace, eYo.T3.Expr.enclosure)
      n0 = this.n0
      if ((n1 = n0.sibling)) {
        if (n1.n_type === eYo.TKN.comp_for) {
          // set comprehension
          b1 = eYo.DelegateSvg.newBlockReady(workspace, eYo.T3.Expr.comprehension)
          b1.eyo.expression_s.connect(n0.toBlock(workspace))
          n1.toBlock(b1)
          root.eyo.lastConnect(b1)
          return root
        } else if ((n2 = n1.sibling)) {
          if (n2.n_type === eYo.TKN.comp_for) {
            // set comprehension with '**'
            // this is a syntax error but I still consider it to be valid
            b2 = eYo.DelegateSvg.newBlockReady(workspace, eYo.T3.Expr.comprehension)
            b0 = eYo.DelegateSvg.newBlockReady(workspace, eYo.T3.Expr.expression_star_star)
            b2.eyo.expression_s.connect(b0)
            b0.eyo.modified_s.connect(n1.toBlock(workspace))
            n2.toBlock(b2)
            root.eyo.lastConnect(b2)
            return root
          } else if ((n3 = n2.sibling)) {
            if (n3.n_type === eYo.TKN.comp_for) {
              b3 = eYo.DelegateSvg.newBlockReady(workspace, eYo.T3.Expr.dict_comprehension)
              b1 = eYo.DelegateSvg.newBlockReady(workspace, eYo.T3.Expr.key_datum)
              b3.eyo.expression_s.connect(b1)
              b1.eyo.key_s.connect(n0.toBlock(workspace))
              b1.eyo.datum_s.connect(n2.toBlock(workspace))
              n3.toBlock(b3)
              root.eyo.lastConnect(b3)
              return root
            }
          }
        }
      }
      // no comprehension
      while (true) {
        if (n0.n_type === eYo.TKN.DOUBLESTAR) {
          b0 = eYo.DelegateSvg.newBlockReady(workspace, eYo.T3.Expr.expression_star_star)
          root.eyo.lastConnect(b0)
          if ((n1 = n0.sibling)) {
            b0.eyo.modified_s.connect(n1.toBlock(workspace))
            if ((n1 = n1.sibling) && (n0 = n1.sibling)) {
              continue
            }
          }
        } else {
          b0 = n0.toBlock(workspace)
          if ((n1 = n0.sibling)) {
            if (n1.n_type === eYo.TKN.COLON) {
              b1 = eYo.DelegateSvg.newBlockReady(workspace, eYo.T3.Expr.key_datum)
              root.eyo.lastConnect(b1)
              b1.eyo.key_s.connect(b0)
              if ((n2 = n1.sibling)) {
                b1.eyo.datum_s.connect(n2.toBlock(workspace))
                if ((n3 = n2.sibling) && (n0 = n3.sibling)) {
                  continue
                }
              }
            } else {
              root.eyo.lastConnect(b0)
              if ((n0 = n1.sibling)) {
                continue
              }
            }
          } else {
            root.eyo.lastConnect(b0)
          }
        }
        return root
      }
    case eYo.TKN.atom: //atom: ('(' [yield_expr|testlist_comp] ')' | '[' [testlist_comp] ']' | '{' [dictorsetmaker] '}') | NAME | NUMBER | STRING+ | '...' | 'None' | 'True' | 'False')
      if (this.n_nchildren === 1) {
        return this.n0.toBlock(workspace)
      } else if (this.n_nchildren === 2) {
        root = eYo.DelegateSvg.newBlockReady(workspace, eYo.T3.Expr.enclosure)
      } else /* if (this.n_nchildren === 3) */ {
        b1 = this.n1.toBlock(workspace)
        if (b1.type === eYo.T3.Expr.enclosure) {
          root = b1
        } else {
          root = eYo.DelegateSvg.newBlockReady(workspace, eYo.T3.Expr.enclosure)
          root.eyo.lastConnect(b1)
        }
      }
      root.eyo.variant_p = {
        '(': eYo.Key.PAR,
        '[': eYo.Key.SQB,
        '{': eYo.Key.BRACE}[this.n0.n_str]
      return root
    case eYo.TKN.NAME:
      return eYo.DelegateSvg.newBlockReady(workspace, {
        type: eYo.T3.Expr.identifier,
        name_d: this.n_str
      })
    case eYo.TKN.NUMBER:
      return eYo.DelegateSvg.newBlockReady(workspace, {
        type: eYo.T3.Expr.numberliteral,
        value_d: this.n_str
      })
    case eYo.TKN.ELLIPSIS:
      root = eYo.DelegateSvg.newBlockReady(workspace, {
        type: eYo.T3.Expr.builtin__object,
        value_d: this.n_str
      })
      return root
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
      root = n0.toBlock(workspace)
      while ((n1 = n0.sibling) && (n2 = n1.sibling)) {
        b0 = eYo.DelegateSvg.newBlockReady(workspace, eYo.T3.Expr.m_expr)
        b0.eyo.operator_p = n1.n_str
        b0.eyo.lhs_s.connect(root)
        root = b0
        b0.eyo.rhs_s.connect(n2.toBlock(workspace))
        n0 = n2
      }
      return root
    case eYo.TKN.factor: // ('+'|'-'|'~') factor | power
      if ((n1 = this.n1)) {
        root = eYo.DelegateSvg.newBlockReady(workspace, eYo.T3.Expr.unary)
        root.eyo.operator_p = this.n0.n_str
        root.eyo.rhs_s.connect(n1.toBlock(workspace))
      } else {
        return this.n0.toBlock(workspace)
      }
      return root
    case eYo.TKN.power: // atom_expr ['**' factor]
      b0 = this.n0.toBlock(workspace)
      if ((n2 = this.n2)) {
        root = eYo.DelegateSvg.newBlockReady(workspace, eYo.T3.Expr.power)
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
        root = eYo.DelegateSvg.newBlockReady(workspace, eYo.T3.Expr.expression_star)
        root.eyo.modifier_p = '*'
        root.eyo.modified_s.connect(n0.sibling.toBlock(workspace))
      } else if (n0.n_type === eYo.TKN.DOUBLESTAR) {
        root = eYo.DelegateSvg.newBlockReady(workspace, eYo.T3.Expr.expression_star_star)
        root.eyo.modifier_p = '**'
        root.eyo.modified_s.connect(n0.sibling.toBlock(workspace))
      } else if ((n1 = n0.sibling)) {
        if (n1.n_type === eYo.TKN.COLONEQUAL) {
          root = eYo.DelegateSvg.newBlockReady(workspace, eYo.T3.Expr.assignment_expr)
          root.eyo.name_s.connect(n0.toBlock(workspace))
          root.eyo.definition_t.eyo.lastConnect(n1.sibling.toBlock(workspace))
        } else if (n1.n_type === eYo.TKN.EQUAL) {
          root = eYo.DelegateSvg.newBlockReady(workspace, eYo.T3.Expr.keyword_item)
          root.eyo.name_s.connect(n0.toBlock(workspace))
          root.eyo.definition_t.eyo.lastConnect(n1.sibling.toBlock(workspace))
        } else {
          // code duplicate (see above)
          root = eYo.DelegateSvg.newBlockReady(workspace, eYo.T3.Expr.comprehension)
          root.eyo.expression_s.connect(n0.toBlock(workspace))
          n1.intoDelegate(root.eyo)
          t = root.eyo.for_if_t.eyo
          b0 = root
          while ((b1 = b0.eyo.comp_iter)) {
            b0.eyo.comp_iter = undefined
            t.lastConnect((b0 = b1))
          }
        }
      } else {
        root = n0.toBlock(workspace)
      }
      return root
    case eYo.TKN.namedexpr_test: // test [':=' test]
      b0 = this.n0.toBlock(workspace)
      if ((n2 = this.n2)) {
        root = eYo.DelegateSvg.newBlockReady(workspace, eYo.T3.Expr.assignment_expr)
        root.eyo.name_s.connect(b0)
        root.eyo.definition_t.eyo.lastConnect(n2.toBlock(workspace))
      } else {
        root = b0
      }
      return root
    case eYo.TKN.lambdef: // 'lambda' [varargslist] ':' test
      root = eYo.DelegateSvg.newBlockReady(workspace, eYo.T3.Expr.lambda_expr)
      n1 = this.n1
      if (n1.type !== eYo.TKN.COLON) {
        n1.intoDelegate(root.eyo.parameters_t.eyo)
        n1 = n1.sibling
      }
      n1 = n1.sibling
      root.eyo.expression_s.connect(n1.toBlock(workspace))
      return root
    case eYo.TKN.lambdef_nocond: // 'lambda' [varargslist] ':' test_nocond
      root = eYo.DelegateSvg.newBlockReady(workspace, eYo.T3.Expr.lambda_expr_nocond)
      n1 = this.n1
      if (n1.type !== eYo.TKN.COLON) {
        n1.intoDelegate(root.eyo.parameters_t.eyo)
        n1 = n1.sibling
      }
      n1 = n1.sibling
      root.eyo.expression_s.connect(n1.toBlock(workspace))
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
      if (!this.n0) {
        throw `NOTHING TO DO WITH ${this.name}`
      } else if (!this.n0.sibling) {
        return this.n0.toBlock(workspace)
      } else {
        // eYo.GMR.dumptree(eYo.GMR._PyParser_Grammar, this)
        console.error(this.n_child)
        throw `NOTHING TO DO WITH ${this.name}`
      }
  }
}
