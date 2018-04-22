// This file was generated by "python types.py" on 2018-04-22 05:45:49.968608

/**
 * ezPython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview Type constants for ezPython, used as blocks prototypes.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

/**
 * @name ezP.T3.All
 * @namespace
 **/

goog.provide('ezP.T3.All')

goog.require('ezP.T3')


ezP.T3.All = {}
ezP.T3.All.core_expressions = [ // count 93
    ezP.T3.Expr.a_expr_concrete,
    ezP.T3.Expr.a_expr_solid,
    ezP.T3.Expr.and_expr_concrete,
    ezP.T3.Expr.and_expr_solid,
    ezP.T3.Expr.and_test_concrete,
    ezP.T3.Expr.and_test_solid,
    ezP.T3.Expr.any,
    ezP.T3.Expr.argument_list,
    ezP.T3.Expr.assignment_expression,
    ezP.T3.Expr.attributeref,
    ezP.T3.Expr.augassign_bitwise,
    ezP.T3.Expr.augassign_list_solid,
    ezP.T3.Expr.augassign_numeric,
    ezP.T3.Expr.augop,
    ezP.T3.Expr.bracket_target_list,
    ezP.T3.Expr.builtin_call_expr,
    ezP.T3.Expr.builtin_input_expr,
    ezP.T3.Expr.builtin_object,
    ezP.T3.Expr.builtin_print_expr,
    ezP.T3.Expr.call_expr,
    ezP.T3.Expr.call_expr,
    ezP.T3.Expr.comp_for,
    ezP.T3.Expr.comp_if,
    ezP.T3.Expr.comprehension,
    ezP.T3.Expr.conditional_expression_solid,
    ezP.T3.Expr.defparameter_solid,
    ezP.T3.Expr.dict_comprehension,
    ezP.T3.Expr.dict_display,
    ezP.T3.Expr.display_slice_list,
    ezP.T3.Expr.expression_star,
    ezP.T3.Expr.expression_star_star,
    ezP.T3.Expr.floatnumber,
    ezP.T3.Expr.from_module_import,
    ezP.T3.Expr.from_relative_module_import,
    ezP.T3.Expr.generator_expression,
    ezP.T3.Expr.identifier,
    ezP.T3.Expr.imagnumber,
    ezP.T3.Expr.import_identifier_as_solid,
    ezP.T3.Expr.import_module,
    ezP.T3.Expr.inheritance,
    ezP.T3.Expr.integer,
    ezP.T3.Expr.key_datum_solid,
    ezP.T3.Expr.keyword_item,
    ezP.T3.Expr.lambda_expr,
    ezP.T3.Expr.lambda_expr_nocond,
    ezP.T3.Expr.lambda_expression,
    ezP.T3.Expr.list_display,
    ezP.T3.Expr.longbytesliteral,
    ezP.T3.Expr.longformattedliteral,
    ezP.T3.Expr.longstringliteral,
    ezP.T3.Expr.m_expr_concrete,
    ezP.T3.Expr.m_expr_solid,
    ezP.T3.Expr.module_as_solid,
    ezP.T3.Expr.non_void_expression_list,
    ezP.T3.Expr.not_test_concrete,
    ezP.T3.Expr.not_test_solid,
    ezP.T3.Expr.number_comparison,
    ezP.T3.Expr.object_comparison,
    ezP.T3.Expr.optional_expression_list,
    ezP.T3.Expr.or_expr_concrete,
    ezP.T3.Expr.or_expr_solid,
    ezP.T3.Expr.or_expr_star_star,
    ezP.T3.Expr.or_test_concrete,
    ezP.T3.Expr.or_test_solid,
    ezP.T3.Expr.parameter_list,
    ezP.T3.Expr.parameter_list_starargs,
    ezP.T3.Expr.parameter_star,
    ezP.T3.Expr.parameter_star_star,
    ezP.T3.Expr.parent_module,
    ezP.T3.Expr.parenth_form,
    ezP.T3.Expr.parenth_target_list,
    ezP.T3.Expr.power_solid,
    ezP.T3.Expr.proper_slice,
    ezP.T3.Expr.set_display,
    ezP.T3.Expr.shift_expr_concrete,
    ezP.T3.Expr.shift_expr_solid,
    ezP.T3.Expr.shortbytesliteral,
    ezP.T3.Expr.shortformattedliteral,
    ezP.T3.Expr.shortstringliteral,
    ezP.T3.Expr.slicing,
    ezP.T3.Expr.star_expr,
    ezP.T3.Expr.starred_item_list,
    ezP.T3.Expr.subscription,
    ezP.T3.Expr.target_star,
    ezP.T3.Expr.term,
    ezP.T3.Expr.u_expr_concrete,
    ezP.T3.Expr.u_expr_solid,
    ezP.T3.Expr.void_target_list,
    ezP.T3.Expr.with_item_solid,
    ezP.T3.Expr.xor_expr_concrete,
    ezP.T3.Expr.xor_expr_solid,
    ezP.T3.Expr.yield_atom,
    ezP.T3.Expr.yield_expression,
]
ezP.T3.All.lists = [ // count 10
    ezP.T3.Expr.comp_iter_list,
    ezP.T3.Expr.dotted_name,
    ezP.T3.Expr.key_datum_list,
    ezP.T3.Expr.non_void_identifier_list,
    ezP.T3.Expr.non_void_import_identifier_as_list,
    ezP.T3.Expr.non_void_module_as_list,
    ezP.T3.Expr.non_void_starred_item_list,
    ezP.T3.Expr.slice_list,
    ezP.T3.Expr.target_list,
    ezP.T3.Expr.with_item_list,
]
ezP.T3.All.wrappers = [ // count 51
    ezP.T3.Expr.a_expr,
    ezP.T3.Expr.algebra_choice,
    ezP.T3.Expr.and_expr,
    ezP.T3.Expr.and_test,
    ezP.T3.Expr.argument_any,
    ezP.T3.Expr.argument_list_comprehensive,
    ezP.T3.Expr.assigned_list,
    ezP.T3.Expr.assigned_single,
    ezP.T3.Expr.atom,
    ezP.T3.Expr.augassign_list,
    ezP.T3.Expr.augassign_single,
    ezP.T3.Expr.augtarget,
    ezP.T3.Expr.bitwise_choice,
    ezP.T3.Expr.boolean_choice,
    ezP.T3.Expr.bytesliteral,
    ezP.T3.Expr.comp_iter,
    ezP.T3.Expr.comparison,
    ezP.T3.Expr.conditional_expression,
    ezP.T3.Expr.defparameter,
    ezP.T3.Expr.enclosure,
    ezP.T3.Expr.expression,
    ezP.T3.Expr.expression_nocond,
    ezP.T3.Expr.import_identifier_as,
    ezP.T3.Expr.key_datum,
    ezP.T3.Expr.key_datum_list_comprehensive,
    ezP.T3.Expr.literal,
    ezP.T3.Expr.longliteral,
    ezP.T3.Expr.m_expr,
    ezP.T3.Expr.module_as,
    ezP.T3.Expr.non_void_starred_item_list_comprehensive,
    ezP.T3.Expr.not_test,
    ezP.T3.Expr.numberliteral,
    ezP.T3.Expr.or_expr,
    ezP.T3.Expr.or_test,
    ezP.T3.Expr.parameter,
    ezP.T3.Expr.parameter_any,
    ezP.T3.Expr.power,
    ezP.T3.Expr.primary,
    ezP.T3.Expr.relative_module,
    ezP.T3.Expr.shift_expr,
    ezP.T3.Expr.shortliteral,
    ezP.T3.Expr.slice_item,
    ezP.T3.Expr.starred_item,
    ezP.T3.Expr.starred_item_list_comprehensive,
    ezP.T3.Expr.stringliteral,
    ezP.T3.Expr.target,
    ezP.T3.Expr.target_unstar,
    ezP.T3.Expr.u_expr,
    ezP.T3.Expr.unary_choice,
    ezP.T3.Expr.with_item,
    ezP.T3.Expr.xor_expr,
]
ezP.T3.All.part_statements = [ // count 14
    ezP.T3.Stmt.classdef_part,
    ezP.T3.Stmt.elif_part,
    ezP.T3.Stmt.else_part,
    ezP.T3.Stmt.except_part,
    ezP.T3.Stmt.finally_part,
    ezP.T3.Stmt.for_part,
    ezP.T3.Stmt.funcdef_part,
    ezP.T3.Stmt.if_part,
    ezP.T3.Stmt.last_else_part,
    ezP.T3.Stmt.try_else_part,
    ezP.T3.Stmt.try_part,
    ezP.T3.Stmt.void_except_part,
    ezP.T3.Stmt.while_part,
    ezP.T3.Stmt.with_part,
]
ezP.T3.All.simple_statements = [ // count 14
    ezP.T3.Stmt.classdef_part,
    ezP.T3.Stmt.elif_part,
    ezP.T3.Stmt.else_part,
    ezP.T3.Stmt.except_part,
    ezP.T3.Stmt.finally_part,
    ezP.T3.Stmt.for_part,
    ezP.T3.Stmt.funcdef_part,
    ezP.T3.Stmt.if_part,
    ezP.T3.Stmt.last_else_part,
    ezP.T3.Stmt.try_else_part,
    ezP.T3.Stmt.try_part,
    ezP.T3.Stmt.void_except_part,
    ezP.T3.Stmt.while_part,
    ezP.T3.Stmt.with_part,
]
ezP.T3.All.compound_statements = [ // count 0
]

ezP.T3.All.containsStatement = function(prototypeName) {
  return ezP.T3.All.part_statements.indexOf(prototypeName)>=0
  || ezP.T3.All.simple_statements.indexOf(prototypeName)>=0
  || ezP.T3.All.compound_statements.indexOf(prototypeName)>=0
}

ezP.T3.All.containsExpression = function(prototypeName) {
  return ezP.T3.All.core_expressions.indexOf(prototypeName)>=0
  || ezP.T3.All.lists.indexOf(prototypeName)>=0
  || ezP.T3.All.wrappers.indexOf(prototypeName)>=0
}

ezP.T3.All.contains = function(type) {
  return ezP.T3.All.containsStatement(prototypeName)
  || ezP.T3.All.containsExpression(prototypeName)
}

