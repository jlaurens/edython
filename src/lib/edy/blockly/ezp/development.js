/**
 * ezPython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License CeCILL-B
 */

/**
 * @fileoverview helper for ezPython.
 * This file is for development only.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('edY.Development')

goog.require('edY.DelegateSvg')
goog.require('edY.DelegateSvg.Import')

edY.Do.arraysMerged = function(/* list of arrays */) {
  var RA = []
  for (var i = 0, Xs; Xs = arguments[i++];) {
    goog.array.extend(RA,Xs)
  }
  goog.array.removeDuplicates(RA)
  return RA
}

/**
 * Useful for development purposes only.
 * This is a series of arrays of block prototypes
 * related to the given delegate.
 * in order to load the corresponding blocks in the workspace,
 * issue the following command in your main html file
 * edY.DelegateSvg.(Expr|Stmt).(prototype).workspaceBlocks, 5, offset, step)
 */
edY.DelegateSvg.workspaceBlocks = []

edY.DelegateSvg.Expr.workspaceBlocks = [
  edY.T3.Expr.floatnumber,
/*  edY.T3.Expr.integer,
  edY.T3.Expr.imagnumber,
  edY.T3.Expr.shortstringliteral,
  edY.T3.Expr.shortbytesliteral,
  edY.T3.Expr.longstringliteral,
  edY.T3.Expr.longbytesliteral,
  edY.T3.Expr.u_expr_s3d,
  edY.T3.Expr.not_test_s3d,
  edY.T3.Expr.power_s3d,
  edY.T3.Expr.m_expr_s3d,
  edY.T3.Expr.a_expr_s3d,
  edY.T3.Expr.shift_expr_s3d,
  edY.T3.Expr.and_expr_s3d,
  edY.T3.Expr.xor_expr_s3d,
  edY.T3.Expr.or_expr_s3d,
  edY.T3.Expr.or_test_s3d,
  edY.T3.Expr.and_test_s3d,
  edY.T3.Expr.comprehension,
  edY.T3.Expr.comp_for,
  edY.T3.Expr.comp_if,
  */
  edY.T3.Expr.non_void_expression_list,
  edY.T3.Expr.parenth_form,
  edY.T3.Expr.list_display,
  edY.T3.Expr.set_display,
  edY.T3.Expr.dict_display,
  edY.T3.Expr.dict_comprehension,
  edY.T3.Expr.yield_expression,
  edY.T3.Expr.yield_from_expression,
]

/**
 * Useful for development purposes only.
 * This is an array of block prototypes
 * related to the given delegate.
 */

edY.DelegateSvg.Expr.delimitedWorkspaceBlocks = [
  edY.T3.Expr.parenth_form,
  edY.T3.Expr.list_display,
  edY.T3.Expr.set_display,
  edY.T3.Expr.dict_display,
  edY.T3.Expr.starred_item_list,
  edY.T3.Expr.parenth_target_list,
  edY.T3.Expr.bracket_target_list,
]

edY.DelegateSvg.Expr.argument_list_comprehensive.workspaceBlocks = edY.DelegateSvg.Expr.argument_list.workspaceBlocks = edY.Do.arraysMerged([
  edY.T3.Expr.argument_list,
  edY.T3.Expr.keyword_item,
  edY.T3.Expr.term,
  edY.T3.Expr.argument_list_comprehensive,
  edY.T3.Expr.comprehension,
] , null/*edY.T3.Expr.Check.expression*/)


edY.DelegateSvg.Stmt.import_stmt.workspaceBlocks = [
  edY.T3.Expr.non_void_module_as_list,
  edY.T3.Expr.import_module,
  edY.T3.Expr.module_as_s3d,
  edY.T3.Expr.term,
]


edY.DelegateSvg.Expr.dict_comprehension.workspaceBlocks =
edY.DelegateSvg.Expr.comprehension.workspaceBlocks = [
  edY.T3.Expr.term,
  edY.T3.Expr.comp_for,
  edY.T3.Expr.comp_if,
  edY.T3.Expr.target_list,
  edY.T3.Expr.comp_iter_list,
  edY.T3.Expr.comprehension,
  edY.T3.Expr.key_datum_s3d,
  edY.T3.Expr.dict_comprehension,
]

edY.DelegateSvg.Expr.dict_comprehension.workspaceBlocks = [
  edY.T3.Expr.comprehension,
  edY.T3.Expr.term,
  edY.T3.Expr.comp_for,
  edY.T3.Expr.comp_if,
  edY.T3.Expr.target_list,
  edY.T3.Expr.comp_iter_list,
]

edY.DelegateSvg.Expr.a_expr_s3d.workspaceBlocks = 
edY.DelegateSvg.Expr.m_expr_s3d.workspaceBlocks = 
edY.DelegateSvg.Expr.u_expr_s3d.workspaceBlocks = [
  edY.T3.Expr.term,
  edY.T3.Expr.a_expr_s3d,
  edY.T3.Expr.m_expr_s3d,
  edY.T3.Expr.u_expr_s3d,
]

edY.DelegateSvg.Expr.shift_expr_s3d.workspaceBlocks = 
edY.DelegateSvg.Expr.and_expr_s3d.workspaceBlocks = 
edY.DelegateSvg.Expr.xor_expr_s3d.workspaceBlocks = 
edY.DelegateSvg.Expr.or_expr_s3d.workspaceBlocks = [
  edY.T3.Expr.term,
  edY.T3.Expr.shift_expr_s3d,
  edY.T3.Expr.and_expr_s3d,
  edY.T3.Expr.xor_expr_s3d,
  edY.T3.Expr.or_expr_s3d,
]

edY.DelegateSvg.Expr.number_comparison.workspaceBlocks = 
edY.DelegateSvg.Expr.object_comparison.workspaceBlocks = [
  edY.T3.Expr.term,
  edY.T3.Expr.number_comparison,
  edY.T3.Expr.object_comparison,
]

edY.DelegateSvg.Expr.and_test_s3d.workspaceBlocks = 
edY.DelegateSvg.Expr.or_test_s3d.workspaceBlocks = [
  edY.T3.Expr.term,
  edY.T3.Expr.and_test_s3d,
  edY.T3.Expr.or_test_s3d,
]

edY.DelegateSvg.Expr.optional_expression_list.workspaceBlocks = [
  edY.T3.Expr.term,
  edY.T3.Expr.term,
  edY.T3.Expr.optional_expression_list,
]

edY.DelegateSvg.Expr.key_datum_list_comprehensive.workspaceBlocks = [
  edY.T3.Expr.key_datum_s3d,
  edY.T3.Expr.dict_comprehension,
  edY.T3.Expr.key_datum_list_comprehensive,
]

edY.DelegateSvg.Stmt.yield_stmt.workspaceBlocks =
edY.DelegateSvg.Expr.yield_expression.workspaceBlocks = [
  edY.T3.Expr.term,
  edY.T3.Expr.yield_expression,
  edY.T3.Stmt.yield_stmt,
  edY.T3.Expr.yield_expression_list,
  edY.T3.Expr.yield_from_expression,
]

edY.DelegateSvg.Stmt.import_stmt.workspaceBlocks = [
  edY.T3.Expr.term,
  edY.T3.Expr.module_as_s3d,
  edY.T3.Expr.non_void_module_as_list,
  edY.T3.Expr.import_module,
  edY.T3.Expr.non_void_import_identifier_as_list,
  edY.T3.Expr.parent_module,
  edY.T3.Expr.from_relative_module_import,
  edY.T3.Stmt.import_stmt,
  edY.T3.Expr.from_module_import,
  edY.T3.Expr.import_module,
  edY.T3.Stmt.future_statement,
]

edY.DelegateSvg.Stmt.if_part.workspaceBlocks =
edY.DelegateSvg.Stmt.while_part.workspaceBlocks =
edY.DelegateSvg.Stmt.for_part.workspaceBlocks =
edY.DelegateSvg.Stmt.with_part.workspaceBlocks = edY.Do.arraysMerged([
  edY.T3.Stmt.if_part,
  edY.T3.Stmt.elif_part,
  edY.T3.Stmt.else_part,
  edY.T3.Stmt.while_part,
  edY.T3.Stmt.for_part,
  edY.T3.Stmt.with_part,
  edY.T3.Expr.term,
  edY.T3.Expr.target_list,
  edY.T3.Expr.expression_list,
  edY.T3.Expr.with_item_list,
],
edY.T3.Expr.Check.expression)

edY.DelegateSvg.Expr.lambda.workspaceBlocks = edY.Do.arraysMerged([
  edY.T3.Expr.parameter_list,
  edY.T3.Expr.lambda,
  edY.T3.Expr.term,
],
edY.T3.Expr.Check.expression,
edY.T3.Expr.Check.expression_nocond,
)

edY.DelegateSvg.Expr.parameter_list.workspaceBlocks = edY.Do.arraysMerged([
  edY.T3.Expr.parameter_list,
  edY.T3.Expr.term,
],
)

edY.DelegateSvg.Stmt.expression_stmt.workspaceBlocks = edY.Do.arraysMerged([
  edY.T3.Stmt.expression_stmt,
],
edY.T3.Expr.Check.expression,
)

edY.DelegateSvg.Expr.argument_list_comprehensive.workspaceBlocks = edY.DelegateSvg.Expr.argument_list.workspaceBlocks = edY.Do.arraysMerged([
  edY.T3.Expr.argument_list,
  edY.T3.Expr.starred_expression,
  edY.T3.Expr.keyword_item,
  edY.T3.Expr.term,
  edY.T3.Expr.argument_list_comprehensive,
  edY.T3.Expr.comprehension,
] , null/*edY.T3.Expr.Check.expression*/)

edY.DelegateSvg.Expr.builtin_input_expr.workspaceBlocks = 
edY.DelegateSvg.Stmt.builtin_print_stmt.workspaceBlocks = edY.Do.arraysMerged([
  edY.T3.Expr.builtin_input_expr,
  edY.T3.Expr.builtin_input_stmt,
  edY.T3.Expr.builtin_print_expr,
  edY.T3.Stmt.builtin_print_stmt,
],
edY.DelegateSvg.Expr.argument_list_comprehensive.workspaceBlocks,
)

edY.DelegateSvg.Stmt.global_nonlocal_stmt.workspaceBlocks =
[
  edY.T3.Stmt.global_nonlocal_stmt,
  edY.T3.Expr.non_void_identifier_list,
  edY.T3.Expr.term,
]

edY.DelegateSvg.Expr.shortliteral.workspaceBlocks = 
edY.DelegateSvg.Expr.numberliteral.workspaceBlocks = [
  edY.T3.Expr.shortstringliteral,
  edY.T3.Expr.integer,
  edY.T3.Expr.floatnumber,
  edY.T3.Expr.imagnumber,
]

edY.DelegateSvg.Expr.starred_item_list_comprehensive.workspaceBlocks = [
  edY.T3.Expr.starred_item_list_comprehensive,
  edY.T3.Expr.term,
  edY.T3.Expr.comprehension,
]

edY.DelegateSvg.Expr.list_display.workspaceBlocks = edY.Do.arraysMerged([
  edY.T3.Expr.starred_item_list_comprehensive,
  edY.T3.Expr.list_display,
  edY.T3.Expr.term,
  edY.T3.Expr.star_expr,
  edY.T3.Expr.comprehension,
], edY.T3.Expr.Check.starred_item)

edY.DelegateSvg.Stmt.decorator.workspaceBlocks =
edY.DelegateSvg.Stmt.funcdef_part.workspaceBlocks = edY.Do.arraysMerged([
  edY.T3.Stmt.decorator,
  edY.T3.Expr.term,
  edY.T3.Expr.dotted_name,
  edY.T3.Stmt.funcdef_part,
  edY.T3.Stmt.classdef_part,
],
edY.DelegateSvg.Expr.parameter_list.workspaceBlocks)

edY.DelegateSvg.Stmt.classdef_part.workspaceBlocks = edY.Do.arraysMerged([
  edY.T3.Stmt.decorator,
  edY.T3.Stmt.classdef_part,
  edY.T3.Stmt.assignment_stmt,
],
edY.DelegateSvg.Expr.argument_list.workspaceBlocks)

edY.DelegateSvg.Stmt.assignment_stmt.workspaceBlocks =
edY.DelegateSvg.Expr.target_list.workspaceBlocks = edY.Do.arraysMerged([
  edY.T3.Stmt.assignment_stmt,
  edY.T3.Expr.target_list,
  edY.T3.Expr.void_target_list,
  edY.T3.Expr.term,
  edY.T3.Expr.yield_expression,
],
edY.T3.Expr.Check.assigned_list,
edY.T3.Expr.Check.target_unstar,
edY.T3.Expr.Check.target,
edY.T3.Expr.Check.slice_item,
edY.T3.Expr.Check.assigned_expression)

edY.DelegateSvg.Stmt.augmented_assignment_stmt.workspaceBlocks = edY.Do.arraysMerged([
  edY.T3.Stmt.augmented_assignment_stmt,
  edY.T3.Expr.term,
  edY.T3.Expr.yield_expression_list,
  edY.T3.Expr.yield_from_expression,
  edY.T3.Expr.augassign_list,
],
edY.T3.Expr.Check.augassign_list)

edY.DelegateSvg.Expr.longliteral.workspaceBlocks = edY.Do.arraysMerged([
  edY.T3.Expr.longstringliteral,
  edY.T3.Stmt.docstring_top_stmt,
  edY.T3.Stmt.docstring_def_stmt,
  edY.T3.Stmt.funcdef_part,
  edY.T3.Stmt.classdef_part,
  edY.T3.Stmt.import_stmt,
  edY.T3.Stmt.pass_stmt,
  edY.T3.Stmt.break_stmt,
  edY.T3.Stmt.continue_stmt,
  edY.T3.Stmt.any_stmt,
])

edY.DelegateSvg.Stmt.try_part.workspaceBlocks =
edY.DelegateSvg.Stmt.raise_stmt.workspaceBlocks = edY.Do.arraysMerged([
  edY.T3.Expr.term,
  edY.T3.Expr.expression_from,
  edY.T3.Stmt.raise_stmt,
  edY.T3.Expr.longstringliteral,
  edY.T3.Expr.term,
  edY.T3.Stmt.try_part,
  edY.T3.Stmt.except_part,
  edY.T3.Expr.expression_as_name,
  edY.T3.Stmt.void_except_part,
  edY.T3.Stmt.else_part,
  edY.T3.Stmt.finally_part,
  edY.T3.Stmt.pass_stmt,
  edY.T3.Stmt.any_stmt,
])


// in progress

edY.DelegateSvg.Expr.power_s3d.workspaceBlocks = edY.Do.arraysMerged([
  edY.T3.Expr.power_s3d,
], edY.T3.Expr.Check.await_or_primary, edY.T3.Expr.Check.u_expr)

edY.DelegateSvg.Expr.conditional_expression_s3d.workspaceBlocks = [
  edY.T3.Expr.conditional_expression_s3d,
].concat(edY.T3.Expr.Check.or_test).concat(edY.T3.Expr.Check.expression)

edY.DelegateSvg.Expr.starred_item_list.workspaceBlocks = [
  edY.T3.Expr.starred_item_list,
] .concat(edY.T3.Expr.Check.starred_item)

edY.DelegateSvg.Expr.dict_display.workspaceBlocks =
edY.DelegateSvg.Expr.set_display.workspaceBlocks =
edY.DelegateSvg.Expr.parenth_form.workspaceBlocks =
edY.Do.arraysMerged(
[
  edY.T3.Expr.term,
  edY.T3.Expr.starred_item_list,
  edY.T3.Expr.parenth_form,
  edY.T3.Expr.non_void_starred_item_list_comprehensive,
  edY.T3.Expr.set_display,
  edY.T3.Expr.key_datum_s3d,
  edY.T3.Expr.key_datum_list_comprehensive,
  edY.T3.Expr.dict_display,
],
edY.DelegateSvg.Expr.comprehension.workspaceBlocks,
[
  edY.T3.Expr.slice_list,
],
)

goog.require('edY.DelegateSvg.Expr'),
goog.require('edY.DelegateSvg.Term'),
goog.require('edY.DelegateSvg.Literal'),
goog.require('edY.DelegateSvg.Operator'),
goog.require('edY.DelegateSvg.Argument'),
goog.require('edY.DelegateSvg.Assignment'),
goog.require('edY.DelegateSvg.Comprehension'),
goog.require('edY.DelegateSvg.Control'),
goog.require('edY.DelegateSvg.List'),
goog.require('edY.DelegateSvg.Group'),
goog.require('edY.DelegateSvg.Import'),
goog.require('edY.DelegateSvg.Lambda'),
goog.require('edY.DelegateSvg.Primary'),
goog.require('edY.DelegateSvg.Print'),
goog.require('edY.DelegateSvg.Proc'),
goog.require('edY.DelegateSvg.Stmt'),
goog.require('edY.DelegateSvg.Try'),
goog.require('edY.DelegateSvg.Yield'),

edY.DelegateSvg.T3s = edY.Do.arraysMerged(
  edY.DelegateSvg.Expr.T3s,
  edY.DelegateSvg.Term.T3s,
  edY.DelegateSvg.Literal.T3s,
  edY.DelegateSvg.Operator.T3s,
  edY.DelegateSvg.Argument.T3s,
  edY.DelegateSvg.Assignment.T3s,
  edY.DelegateSvg.Comprehension.T3s,
  edY.DelegateSvg.Control.T3s,
  edY.DelegateSvg.List.T3s,
  edY.DelegateSvg.Group.T3s,
  edY.DelegateSvg.Import.T3s,
  edY.DelegateSvg.Lambda.T3s,
  edY.DelegateSvg.Primary.T3s,
  edY.DelegateSvg.Print.T3s,
  edY.DelegateSvg.Proc.T3s,
  edY.DelegateSvg.Stmt.T3s,
  edY.DelegateSvg.Try.T3s,
  edY.DelegateSvg.Yield.T3s,
)