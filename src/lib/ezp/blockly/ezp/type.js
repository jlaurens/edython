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

ezP.Type.Xpr = {
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

ezP.Type.Xpr.Provide = {
  any: [ezP.Type.Xpr.any_all],
  primary: [ezP.Type.Xpr.primary],
  star_or_expr: [ezP.Type.Xpr.star_or_xpr],
  comprehension: [ezP.Type.Xpr.comprehension],
  comp_for: [ezP.Type.Xpr.comp_for],
  comp_if: [ezP.Type.Xpr.comp_if],
  get: [ezP.Type.Xpr.identifier,
    ezP.Type.Xpr.parameter_positional,
    ezP.Type.Xpr.parameter_1_star,
    ezP.Type.Xpr.parameter_keyed,
    ezP.Type.Xpr.parameter_2_stars],
}

ezP.Type.Xpr.Require = {
  any: [ezP.Type.Xpr.any_all],
  expression: [ezP.Type.Xpr.any_all],
  forif: [ezP.Type.Xpr.expression, ezP.Type.Xpr.forif],
  starred_item: [ezP.Type.Xpr.expression, ezP.Type.Xpr.star_or_xpr],
  or_expr: [ezP.Type.Xpr.any_all],
  target_list: [ezP.Type.Xpr.any_all],
  or_test: [ezP.Type.Xpr.any_all],
  comp_iter: [ezP.Type.Xpr.any_all, ezP.Type.Xpr.comp_for, ezP.Type.Xpr.comp_if],
  expression_nocond: [ezP.Type.Xpr.any_all, ezP.Type.Xpr.or_test, ezP.Type.Xpr.lambda_expr_nocond]
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
ezP.Type.Stt = {
  any_all: 0,
  if_elif: 1,
  if_elif_bounded: 2,
  if_else: 3,
  loop_else: 4
}
ezP.Type.Stt.Check = {
  none: [-1],
  after_any: [ezP.Type.Stt.any_all],
  before_any: [ezP.Type.Stt.any_all],
  after_if: [ezP.Type.Stt.any_all,
    ezP.Type.Stt.if_elif,
    ezP.Type.Stt.if_else],
  before_if: [ezP.Type.Stt.any_all],
  after_elif: [ezP.Type.Stt.any_all,
    ezP.Type.Stt.if_elif,
    ezP.Type.Stt.if_else],
  before_elif: [ezP.Type.Stt.if_elif],
  after_else: [ezP.Type.Stt.any_all],
  before_else: [ezP.Type.Stt.if_else,
    ezP.Type.Stt.loop_else],
  before_if_else: [ezP.Type.Stt.if_else],
  before_loop_else: [ezP.Type.Stt.loop_else],
  after_loop: [ezP.Type.Stt.any_all,
    ezP.Type.Stt.loop_else],
  before_loop: [ezP.Type.Stt.any_all]
}

ezP.T3.Require.starred_list_comprehensive = ezP.T3.Require.starred_list.slice()
ezP.T3.Require.starred_list_comprehensive.push(ezP.T3.comprehension)

ezP.T3.Require.key_datum_list_comprehensive = ezP.T3.Require.key_datum_list.slice()
ezP.T3.Require.key_datum_list_comprehensive.push(ezP.T3.dict_comprehension)
