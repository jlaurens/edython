/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */

/**
 * @fileoverview helper for edython.
 * This file is for development only.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Development')

goog.require('eYo.DelegateSvg')
goog.require('eYo.DelegateSvg.Import')
goog.require('eYo.DelegateSvg.Expr')
goog.require('eYo.DelegateSvg.Primary')
goog.require('eYo.DelegateSvg.Literal')
goog.require('eYo.DelegateSvg.Operator')
goog.require('eYo.DelegateSvg.Argument')
goog.require('eYo.DelegateSvg.Assignment')
goog.require('eYo.DelegateSvg.Comprehension')
goog.require('eYo.DelegateSvg.Control')
goog.require('eYo.DelegateSvg.List')
goog.require('eYo.DelegateSvg.Group')
goog.require('eYo.DelegateSvg.Import')
goog.require('eYo.DelegateSvg.Lambda')
goog.require('eYo.DelegateSvg.Primary')
goog.require('eYo.DelegateSvg.Print')
goog.require('eYo.DelegateSvg.Range')
goog.require('eYo.DelegateSvg.Proc')
goog.require('eYo.DelegateSvg.Stmt')
goog.require('eYo.DelegateSvg.Try')
goog.require('eYo.DelegateSvg.Yield')

eYo.Do.arraysMerged = function (/* list of arrays */) {
  var RA = []
  for (var i = 0, Xs; (Xs = arguments[i++]);) {
    goog.array.extend(RA, Xs)
  }
  goog.array.removeDuplicates(RA)
  return RA
}

eYo.DelegateSvg.T3s = eYo.Do.arraysMerged(
  eYo.DelegateSvg.Expr.T3s,
  eYo.DelegateSvg.Literal.T3s,
  eYo.DelegateSvg.Operator.T3s,
  eYo.DelegateSvg.Argument.T3s,
  eYo.DelegateSvg.Assignment.T3s,
  eYo.DelegateSvg.Comprehension.T3s,
  eYo.DelegateSvg.Control.T3s,
  eYo.DelegateSvg.List.T3s,
  eYo.DelegateSvg.Group.T3s,
  eYo.DelegateSvg.Import.T3s,
  eYo.DelegateSvg.Lambda.T3s,
  eYo.DelegateSvg.Primary.T3s,
  eYo.DelegateSvg.Print.T3s,
  eYo.DelegateSvg.Proc.T3s,
  eYo.DelegateSvg.Stmt.T3s,
  eYo.DelegateSvg.Try.T3s,
  eYo.DelegateSvg.Yield.T3s
)

/**
 * Useful for development purposes only.
 * This is a series of arrays of block prototypes
 * related to the given delegate.
 * in order to load the corresponding blocks in the workspace,
 * issue the following command in your main html file
 * eYo.DelegateSvg.(Expr|Stmt).(prototype).workspaceBlocks, 5, offset, step)
 */
eYo.DelegateSvg.workspaceBlocks = []

eYo.DelegateSvg.Expr.workspaceBlocks = [
  eYo.T3.Expr.floatnumber,
  /*  eYo.T3.Expr.integer,
  eYo.T3.Expr.imagnumber,
  eYo.T3.Expr.shortstringliteral,
  eYo.T3.Expr.shortbytesliteral,
  eYo.T3.Expr.longstringliteral,
  eYo.T3.Expr.longbytesliteral,
  eYo.T3.Expr.u_expr,
  eYo.T3.Expr.not_test,
  eYo.T3.Expr.power,
  eYo.T3.Expr.m_expr,
  eYo.T3.Expr.a_expr,
  eYo.T3.Expr.shift_expr,
  eYo.T3.Expr.and_expr,
  eYo.T3.Expr.xor_expr,
  eYo.T3.Expr.or_expr,
  eYo.T3.Expr.or_test,
  eYo.T3.Expr.and_test,
  eYo.T3.Expr.comprehension,
  eYo.T3.Expr.comp_for,
  eYo.T3.Expr.comp_if,
  */
  eYo.T3.Expr.non_void_expression_list,
  eYo.T3.Expr.parenth_form,
  eYo.T3.Expr.list_display,
  eYo.T3.Expr.set_display,
  eYo.T3.Expr.dict_display,
  eYo.T3.Expr.dict_comprehension,
  eYo.T3.Expr.yield_expression
]

/**
 * Useful for development purposes only.
 * This is an array of block prototypes
 * related to the given delegate.
 */

eYo.DelegateSvg.Expr.delimitedWorkspaceBlocks = [
  eYo.T3.Expr.parenth_form,
  eYo.T3.Expr.list_display,
  eYo.T3.Expr.set_display,
  eYo.T3.Expr.dict_display,
  eYo.T3.Expr.starred_item_list,
  eYo.T3.Expr.parenth_target_list,
  eYo.T3.Expr.bracket_target_list
]

eYo.DelegateSvg.Expr.argument_list_comprehensive.workspaceBlocks = eYo.DelegateSvg.Expr.argument_list.workspaceBlocks = eYo.Do.arraysMerged([
  eYo.T3.Expr.argument_list,
  eYo.T3.Expr.keyword_item,
  eYo.T3.Expr.identifier,
  eYo.T3.Expr.argument_list_comprehensive,
  eYo.T3.Expr.comprehension
], null/* eYo.T3.Expr.Check.expression */)

eYo.DelegateSvg.Stmt.import_stmt.workspaceBlocks = [
  eYo.T3.Expr.non_void_module_as_list,
  eYo.T3.Expr.import_module,
  eYo.T3.Expr.dotted_name_as,
  eYo.T3.Expr.identifier
]

eYo.DelegateSvg.Expr.dict_comprehension.workspaceBlocks =
eYo.DelegateSvg.Expr.comprehension.workspaceBlocks = [
  eYo.T3.Expr.identifier,
  eYo.T3.Expr.comp_for,
  eYo.T3.Expr.comp_if,
  eYo.T3.Expr.target_list,
  eYo.T3.Expr.comp_iter_list,
  eYo.T3.Expr.comprehension,
  eYo.T3.Expr.key_datum,
  eYo.T3.Expr.dict_comprehension
]

eYo.DelegateSvg.Expr.dict_comprehension.workspaceBlocks = [
  eYo.T3.Expr.comprehension,
  eYo.T3.Expr.identifier,
  eYo.T3.Expr.comp_for,
  eYo.T3.Expr.comp_if,
  eYo.T3.Expr.target_list,
  eYo.T3.Expr.comp_iter_list
]

// eYo.DelegateSvg.Expr.a_expr.workspaceBlocks =
// eYo.DelegateSvg.Expr.m_expr.workspaceBlocks =
// eYo.DelegateSvg.Expr.u_expr.workspaceBlocks = [
//   eYo.T3.Expr.identifier,
//   eYo.T3.Expr.a_expr,
//   eYo.T3.Expr.m_expr,
//   eYo.T3.Expr.u_expr
// ]

eYo.DelegateSvg.Expr.shift_expr.workspaceBlocks =
eYo.DelegateSvg.Expr.and_expr.workspaceBlocks =
eYo.DelegateSvg.Expr.xor_expr.workspaceBlocks =
eYo.DelegateSvg.Expr.or_expr.workspaceBlocks = [
  eYo.T3.Expr.identifier,
  eYo.T3.Expr.shift_expr,
  eYo.T3.Expr.and_expr,
  eYo.T3.Expr.xor_expr,
  eYo.T3.Expr.or_expr
]

eYo.DelegateSvg.Expr.number_comparison.workspaceBlocks =
eYo.DelegateSvg.Expr.object_comparison.workspaceBlocks = [
  eYo.T3.Expr.identifier,
  eYo.T3.Expr.number_comparison,
  eYo.T3.Expr.object_comparison
]

eYo.DelegateSvg.Expr.and_test.workspaceBlocks =
eYo.DelegateSvg.Expr.or_test.workspaceBlocks = [
  eYo.T3.Expr.identifier,
  eYo.T3.Expr.and_test,
  eYo.T3.Expr.or_test
]

eYo.DelegateSvg.Expr.optional_expression_list.workspaceBlocks = [
  eYo.T3.Expr.identifier,
  eYo.T3.Expr.identifier,
  eYo.T3.Expr.optional_expression_list
]

eYo.DelegateSvg.Expr.key_datum_list_comprehensive.workspaceBlocks = [
  eYo.T3.Expr.key_datum,
  eYo.T3.Expr.dict_comprehension,
  eYo.T3.Expr.key_datum_list_comprehensive
]

eYo.DelegateSvg.Stmt.yield_stmt.workspaceBlocks =
eYo.DelegateSvg.Expr.yield_expression.workspaceBlocks = [
  eYo.T3.Expr.identifier,
  eYo.T3.Expr.yield_expression,
  eYo.T3.Stmt.yield_stmt,
  eYo.T3.Expr.yield_expression_list
]

eYo.DelegateSvg.Stmt.import_stmt.workspaceBlocks = [
  eYo.T3.Expr.identifier,
  eYo.T3.Expr.dotted_name_as,
  eYo.T3.Expr.non_void_module_as_list,
  eYo.T3.Expr.import_module,
  eYo.T3.Expr.non_void_import_identifier_as_list,
  eYo.T3.Expr.parent_module,
  eYo.T3.Stmt.import_stmt,
  eYo.T3.Expr.import_module,
  eYo.T3.Stmt.future_statement
]

eYo.DelegateSvg.Stmt.if_part.workspaceBlocks =
eYo.DelegateSvg.Stmt.while_part.workspaceBlocks =
eYo.DelegateSvg.Stmt.for_part.workspaceBlocks =
eYo.DelegateSvg.Stmt.with_part.workspaceBlocks = eYo.Do.arraysMerged([
  eYo.T3.Stmt.if_part,
  eYo.T3.Stmt.elif_part,
  eYo.T3.Stmt.else_part,
  eYo.T3.Stmt.while_part,
  eYo.T3.Stmt.for_part,
  eYo.T3.Stmt.with_part,
  eYo.T3.Expr.identifier,
  eYo.T3.Expr.target_list,
  eYo.T3.Expr.expression_list,
  eYo.T3.Expr.with_item_list
],
eYo.T3.Expr.Check.expression)

eYo.DelegateSvg.Expr.lambda.workspaceBlocks = eYo.Do.arraysMerged([
  eYo.T3.Expr.parameter_list,
  eYo.T3.Expr.lambda,
  eYo.T3.Expr.identifier
],
eYo.T3.Expr.Check.expression,
eYo.T3.Expr.Check.expression_nocond
)

eYo.DelegateSvg.Expr.parameter_list.workspaceBlocks = eYo.Do.arraysMerged([
  eYo.T3.Expr.parameter_list,
  eYo.T3.Expr.identifier
]
)

eYo.DelegateSvg.Stmt.expression_stmt.workspaceBlocks = eYo.Do.arraysMerged([
  eYo.T3.Stmt.expression_stmt
],
eYo.T3.Expr.Check.expression
)

eYo.DelegateSvg.Expr.argument_list_comprehensive.workspaceBlocks = eYo.DelegateSvg.Expr.argument_list.workspaceBlocks = eYo.Do.arraysMerged([
  eYo.T3.Expr.argument_list,
  eYo.T3.Expr.starred_expression,
  eYo.T3.Expr.keyword_item,
  eYo.T3.Expr.identifier,
  eYo.T3.Expr.argument_list_comprehensive,
  eYo.T3.Expr.comprehension
], null/* eYo.T3.Expr.Check.expression */)

eYo.DelegateSvg.Stmt.builtin__print_stmt.workspaceBlocks = eYo.Do.arraysMerged([
  eYo.T3.Expr.builtin__input_stmt,
  eYo.T3.Expr.builtin__print_expr,
  eYo.T3.Stmt.builtin__print_stmt
],
eYo.DelegateSvg.Expr.argument_list_comprehensive.workspaceBlocks
)

eYo.DelegateSvg.Stmt.global_nonlocal_stmt.workspaceBlocks =
[
  eYo.T3.Stmt.global_nonlocal_stmt,
  eYo.T3.Expr.non_void_identifier_list,
  eYo.T3.Expr.identifier
]

eYo.DelegateSvg.Expr.shortliteral.workspaceBlocks =
eYo.DelegateSvg.Expr.numberliteral.workspaceBlocks = [
  eYo.T3.Expr.shortstringliteral,
  eYo.T3.Expr.integer,
  eYo.T3.Expr.floatnumber,
  eYo.T3.Expr.imagnumber
]

eYo.DelegateSvg.Expr.starred_item_list_comprehensive.workspaceBlocks = [
  eYo.T3.Expr.starred_item_list_comprehensive,
  eYo.T3.Expr.identifier,
  eYo.T3.Expr.comprehension
]

eYo.DelegateSvg.Expr.list_display.workspaceBlocks = eYo.Do.arraysMerged([
  eYo.T3.Expr.starred_item_list_comprehensive,
  eYo.T3.Expr.list_display,
  eYo.T3.Expr.identifier,
  eYo.T3.Expr.star_expr,
  eYo.T3.Expr.comprehension
], eYo.T3.Expr.Check.starred_item)

eYo.DelegateSvg.Stmt.decorator.workspaceBlocks =
eYo.DelegateSvg.Stmt.funcdef_part.workspaceBlocks = eYo.Do.arraysMerged([
  eYo.T3.Stmt.decorator,
  eYo.T3.Expr.identifier,
  eYo.T3.Expr.dotted_name,
  eYo.T3.Stmt.funcdef_part,
  eYo.T3.Stmt.classdef_part
],
eYo.DelegateSvg.Expr.parameter_list.workspaceBlocks)

eYo.DelegateSvg.Stmt.classdef_part.workspaceBlocks = eYo.Do.arraysMerged([
  eYo.T3.Stmt.decorator,
  eYo.T3.Stmt.classdef_part,
  eYo.T3.Stmt.assignment_stmt
],
eYo.DelegateSvg.Expr.argument_list.workspaceBlocks)

eYo.DelegateSvg.Stmt.assignment_stmt.workspaceBlocks =
eYo.DelegateSvg.Expr.target_list.workspaceBlocks = eYo.Do.arraysMerged([
  eYo.T3.Stmt.assignment_stmt,
  eYo.T3.Expr.target_list,
  eYo.T3.Expr.void_target_list,
  eYo.T3.Expr.identifier,
  eYo.T3.Expr.yield_expression
],
eYo.T3.Expr.Check.assigned_list,
eYo.T3.Expr.Check.target_unstar,
eYo.T3.Expr.Check.target,
eYo.T3.Expr.Check.slice_item,
eYo.T3.Expr.Check.assigned_expression)

eYo.DelegateSvg.Stmt.augmented_assignment_stmt.workspaceBlocks = eYo.Do.arraysMerged([
  eYo.T3.Stmt.augmented_assignment_stmt,
  eYo.T3.Expr.identifier,
  eYo.T3.Expr.yield_expression_list,
  eYo.T3.Expr.augassign_list
],
eYo.T3.Expr.Check.augassign_list)

eYo.DelegateSvg.Expr.longliteral.workspaceBlocks = eYo.Do.arraysMerged([
  eYo.T3.Expr.longstringliteral,
  eYo.T3.Stmt.docstring_stmt,
  eYo.T3.Stmt.funcdef_part,
  eYo.T3.Stmt.classdef_part,
  eYo.T3.Stmt.import_stmt,
  eYo.T3.Stmt.pass_stmt,
  eYo.T3.Stmt.break_stmt,
  eYo.T3.Stmt.continue_stmt,
  eYo.T3.Stmt.expression_stmt
])

eYo.DelegateSvg.Stmt.try_part.workspaceBlocks =
eYo.DelegateSvg.Stmt.raise_stmt.workspaceBlocks = eYo.Do.arraysMerged([
  eYo.T3.Expr.identifier,
  eYo.T3.Stmt.raise_stmt,
  eYo.T3.Expr.longstringliteral,
  eYo.T3.Expr.identifier,
  eYo.T3.Stmt.try_part,
  eYo.T3.Stmt.except_part,
  eYo.T3.Expr.expression_as_name,
  eYo.T3.Stmt.void_except_part,
  eYo.T3.Stmt.else_part,
  eYo.T3.Stmt.finally_part,
  eYo.T3.Stmt.pass_stmt,
  eYo.T3.Stmt.expression_stmt
])

// in progress

eYo.DelegateSvg.Expr.power.workspaceBlocks = eYo.Do.arraysMerged([
  eYo.T3.Expr.power
], eYo.T3.Expr.Check.await_or_primary, eYo.T3.Expr.Check.u_expr_all)

eYo.DelegateSvg.Expr.conditional_expression.workspaceBlocks = [
  eYo.T3.Expr.conditional_expression
].concat(eYo.T3.Expr.Check.or_test_all).concat(eYo.T3.Expr.Check.expression)

eYo.DelegateSvg.Expr.starred_item_list.workspaceBlocks = [
  eYo.T3.Expr.starred_item_list
].concat(eYo.T3.Expr.Check.starred_item)

eYo.DelegateSvg.Expr.dict_display.workspaceBlocks =
eYo.DelegateSvg.Expr.set_display.workspaceBlocks =
eYo.DelegateSvg.Expr.parenth_form.workspaceBlocks =
eYo.Do.arraysMerged(
  [
    eYo.T3.Expr.identifier,
    eYo.T3.Expr.starred_item_list,
    eYo.T3.Expr.parenth_form,
    eYo.T3.Expr.non_void_starred_item_list_comprehensive,
    eYo.T3.Expr.set_display,
    eYo.T3.Expr.key_datum,
    eYo.T3.Expr.key_datum_list_comprehensive,
    eYo.T3.Expr.dict_display
  ],
  eYo.DelegateSvg.Expr.comprehension.workspaceBlocks,
  [
    eYo.T3.Expr.slice_list
  ]
)
