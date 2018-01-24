/**
 * ezPython
 *
 * Copyright 2017 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview Constants for ezPython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

/**
 * @name ezP.Type
 * @namespace
 **/
goog.provide('ezP.Type')

goog.require('ezP.T3')

// Connection types
ezP.Type = ezP.Type || {}

ezP.Type.Expr = {
  any_all: '0',
  primary: '0.2',
  expression: '0',
  identifier: '0.1',
  forif: '1',
  star_or_xpr: '2', // “*” or_expr
  comprehension: '3',
  comp_for: '4',
  comp_if: '5',
  or_test: '6',
  lambda_expr_nocond: '7',
  parameter_positional: '8.1',
  parameter_1_star: '8.2',
  parameter_keyed: '8.3',
  parameter_2_stars: '8.4',
  TUPLE: '9',
}

ezP.Type.Expr.Provide = {
  any: [ezP.Type.Expr.any_all],
  primary: [ezP.Type.Expr.primary],
  star_or_expr: [ezP.Type.Expr.star_or_xpr],
  comprehension: [ezP.Type.Expr.comprehension],
  comp_for: [ezP.Type.Expr.comp_for],
  comp_if: [ezP.Type.Expr.comp_if],
  get: [ezP.Type.Expr.identifier,
    ezP.Type.Expr.parameter_positional,
    ezP.Type.Expr.parameter_1_star,
    ezP.Type.Expr.parameter_keyed,
    ezP.Type.Expr.parameter_2_stars],
}

ezP.Type.Expr.Require = {
  any: [ezP.Type.Expr.any_all],
  expression: [ezP.Type.Expr.any_all],
  forif: [ezP.Type.Expr.expression, ezP.Type.Expr.forif],
  starred_item: [ezP.Type.Expr.expression, ezP.Type.Expr.star_or_xpr],
  or_expr: [ezP.Type.Expr.any_all],
  target_list: [ezP.Type.Expr.any_all],
  or_test: [ezP.Type.Expr.any_all],
  comp_iter: [ezP.Type.Expr.any_all, ezP.Type.Expr.comp_for, ezP.Type.Expr.comp_if],
  expression_nocond: [ezP.Type.Expr.any_all, ezP.Type.Expr.or_test, ezP.Type.Expr.lambda_expr_nocond]
}

/*
In the first column the statement before.
X means that the statement is forbidden
for example, there must not be 2 consecutive else clauses.
        any   if    elif  else  loop
any     O     O     X     X     O
if      O     O     O     O     O
elif    O     O     O     O     O
else    O     O     X     X     O
loop    O     O     X     O     O
*/
/* any means everything else,
 * loop means for or while
 * all means everything.
 * See the rendered connection subclass
 **/
ezP.Type.Stmt = {
  any_all: 0,
  if_elif: 1,
  if_elif_bounded: 2,
  if_else: 3,
  loop_else: 4
}
ezP.Type.Stmt.Check = {
  none: [-1],
  after_any: [ezP.Type.Stmt.any_all],
  before_any: [ezP.Type.Stmt.any_all],
  after_if: [ezP.Type.Stmt.any_all,
    ezP.Type.Stmt.if_elif,
    ezP.Type.Stmt.if_else],
  before_if: [ezP.Type.Stmt.any_all],
  after_elif: [ezP.Type.Stmt.any_all,
    ezP.Type.Stmt.if_elif,
    ezP.Type.Stmt.if_else],
  before_elif: [ezP.Type.Stmt.if_elif],
  after_else: [ezP.Type.Stmt.any_all],
  before_else: [ezP.Type.Stmt.if_else,
    ezP.Type.Stmt.loop_else],
  before_if_else: [ezP.Type.Stmt.if_else],
  before_loop_else: [ezP.Type.Stmt.loop_else],
  after_loop: [ezP.Type.Stmt.any_all,
    ezP.Type.Stmt.loop_else],
  before_loop: [ezP.Type.Stmt.any_all]
}

ezP.T3.Require.starred_list_comprehensive = ezP.T3.Require.starred_list.slice()
ezP.T3.Require.starred_list_comprehensive.push(ezP.T3.comprehension)

ezP.T3.Require.key_datum_list_comprehensive = ezP.T3.Require.key_datum_list.slice()
ezP.T3.Require.key_datum_list_comprehensive.push(ezP.T3.dict_comprehension)
