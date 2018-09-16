// This file was generated by "python types.py" on 2018-09-16 07:31:00.356426

/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview Type constants for edython, used as blocks prototypes.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

/**
 * @name eYo.T3.All
 * @namespace
 **/

goog.provide('eYo.T3.All')

goog.require('eYo.T3')


eYo.T3.All = {}
eYo.T3.All.core_expressions = [ // count 87
    eYo.T3.Expr.a_expr,
    eYo.T3.Expr.and_expr,
    eYo.T3.Expr.and_test,
    eYo.T3.Expr.any,
    eYo.T3.Expr.argument_list,
    eYo.T3.Expr.attributeref,
    eYo.T3.Expr.augop,
    eYo.T3.Expr.bracket_target_list,
    eYo.T3.Expr.builtin__object,
    eYo.T3.Expr.builtin__print_expr,
    eYo.T3.Expr.call_expr,
    eYo.T3.Expr.cmath__call_expr,
    eYo.T3.Expr.cmath__const,
    eYo.T3.Expr.comp_for,
    eYo.T3.Expr.comp_if,
    eYo.T3.Expr.comprehension,
    eYo.T3.Expr.conditional_expression,
    eYo.T3.Expr.dict_comprehension,
    eYo.T3.Expr.dict_display,
    eYo.T3.Expr.dotted_name_as,
    eYo.T3.Expr.expression_as,
    eYo.T3.Expr.expression_star,
    eYo.T3.Expr.expression_star_star,
    eYo.T3.Expr.floatnumber,
    eYo.T3.Expr.identifier,
    eYo.T3.Expr.identifier_annotated,
    eYo.T3.Expr.identifier_annotated_defined,
    eYo.T3.Expr.identifier_as,
    eYo.T3.Expr.identifier_defined,
    eYo.T3.Expr.imagnumber,
    eYo.T3.Expr.inheritance,
    eYo.T3.Expr.integer,
    eYo.T3.Expr.key_datum,
    eYo.T3.Expr.keyword_item,
    eYo.T3.Expr.lambda,
    eYo.T3.Expr.lambda_expr,
    eYo.T3.Expr.lambda_expr_nocond,
    eYo.T3.Expr.list_display,
    eYo.T3.Expr.longbytesliteral,
    eYo.T3.Expr.longformattedliteral,
    eYo.T3.Expr.longstringliteral,
    eYo.T3.Expr.m_expr,
    eYo.T3.Expr.math__call_expr,
    eYo.T3.Expr.math__const,
    eYo.T3.Expr.module__call_expr,
    eYo.T3.Expr.name,
    eYo.T3.Expr.named_attributeref,
    eYo.T3.Expr.named_call_expr,
    eYo.T3.Expr.named_slicing,
    eYo.T3.Expr.named_subscription,
    eYo.T3.Expr.non_void_expression_list,
    eYo.T3.Expr.not_test,
    eYo.T3.Expr.number_comparison,
    eYo.T3.Expr.object_comparison,
    eYo.T3.Expr.optional_expression_list,
    eYo.T3.Expr.or_expr,
    eYo.T3.Expr.or_expr_star_star,
    eYo.T3.Expr.or_test,
    eYo.T3.Expr.parameter_list,
    eYo.T3.Expr.parameter_list_starargs,
    eYo.T3.Expr.parameter_star,
    eYo.T3.Expr.parameter_star_star,
    eYo.T3.Expr.parent_module,
    eYo.T3.Expr.parenth_form,
    eYo.T3.Expr.parenth_target_list,
    eYo.T3.Expr.power,
    eYo.T3.Expr.print_argument_list_comprehensive,
    eYo.T3.Expr.proper_slice,
    eYo.T3.Expr.random__call_expr,
    eYo.T3.Expr.random__randrange,
    eYo.T3.Expr.set_display,
    eYo.T3.Expr.shift_expr,
    eYo.T3.Expr.shortbytesliteral,
    eYo.T3.Expr.shortformattedliteral,
    eYo.T3.Expr.shortstringliteral,
    eYo.T3.Expr.slicing,
    eYo.T3.Expr.star,
    eYo.T3.Expr.star_expr,
    eYo.T3.Expr.starred_item_list,
    eYo.T3.Expr.subscription,
    eYo.T3.Expr.target_list_list,
    eYo.T3.Expr.target_star,
    eYo.T3.Expr.turtle__call_expr,
    eYo.T3.Expr.u_expr,
    eYo.T3.Expr.void_target_list,
    eYo.T3.Expr.xor_expr,
    eYo.T3.Expr.yield_expression,
]
eYo.T3.All.lists = [ // count 10
    eYo.T3.Expr.comp_iter_list,
    eYo.T3.Expr.dotted_name,
    eYo.T3.Expr.key_datum_list,
    eYo.T3.Expr.non_void_identifier_list,
    eYo.T3.Expr.non_void_import_identifier_as_list,
    eYo.T3.Expr.non_void_module_as_list,
    eYo.T3.Expr.non_void_starred_item_list,
    eYo.T3.Expr.slice_list,
    eYo.T3.Expr.target_list,
    eYo.T3.Expr.with_item_list,
]
eYo.T3.All.wrappers = [ // count 47
    eYo.T3.Expr.a_expr_all,
    eYo.T3.Expr.and_expr_all,
    eYo.T3.Expr.and_test_all,
    eYo.T3.Expr.argument_any,
    eYo.T3.Expr.argument_list_comprehensive,
    eYo.T3.Expr.assigned_list,
    eYo.T3.Expr.atom,
    eYo.T3.Expr.augassigned_list,
    eYo.T3.Expr.augtarget,
    eYo.T3.Expr.binary,
    eYo.T3.Expr.bytesliteral,
    eYo.T3.Expr.comp_iter,
    eYo.T3.Expr.comparison,
    eYo.T3.Expr.defparameter,
    eYo.T3.Expr.enclosure,
    eYo.T3.Expr.expression,
    eYo.T3.Expr.expression_nocond,
    eYo.T3.Expr.import_identifier_as,
    eYo.T3.Expr.key_datum_all,
    eYo.T3.Expr.key_datum_list_comprehensive,
    eYo.T3.Expr.literal,
    eYo.T3.Expr.longliteral,
    eYo.T3.Expr.m_expr_all,
    eYo.T3.Expr.module,
    eYo.T3.Expr.module_as,
    eYo.T3.Expr.named_primary,
    eYo.T3.Expr.non_void_starred_item_list_comprehensive,
    eYo.T3.Expr.not_test_all,
    eYo.T3.Expr.numberliteral,
    eYo.T3.Expr.or_expr_all,
    eYo.T3.Expr.or_test_all,
    eYo.T3.Expr.parameter,
    eYo.T3.Expr.parameter_any,
    eYo.T3.Expr.power_all,
    eYo.T3.Expr.primary,
    eYo.T3.Expr.relative_module,
    eYo.T3.Expr.shift_expr_all,
    eYo.T3.Expr.shortliteral,
    eYo.T3.Expr.slice_item,
    eYo.T3.Expr.starred_item,
    eYo.T3.Expr.starred_item_list_comprehensive,
    eYo.T3.Expr.stringliteral,
    eYo.T3.Expr.target,
    eYo.T3.Expr.target_unstar,
    eYo.T3.Expr.u_expr_all,
    eYo.T3.Expr.with_item,
    eYo.T3.Expr.xor_expr_all,
]
eYo.T3.All.part_statements = [ // count 14
    eYo.T3.Stmt.classdef_part,
    eYo.T3.Stmt.elif_part,
    eYo.T3.Stmt.else_part,
    eYo.T3.Stmt.except_part,
    eYo.T3.Stmt.finally_part,
    eYo.T3.Stmt.for_part,
    eYo.T3.Stmt.funcdef_part,
    eYo.T3.Stmt.if_part,
    eYo.T3.Stmt.last_else_part,
    eYo.T3.Stmt.try_else_part,
    eYo.T3.Stmt.try_part,
    eYo.T3.Stmt.void_except_part,
    eYo.T3.Stmt.while_part,
    eYo.T3.Stmt.with_part,
]
eYo.T3.All.simple_statements = [ // count 14
    eYo.T3.Stmt.classdef_part,
    eYo.T3.Stmt.elif_part,
    eYo.T3.Stmt.else_part,
    eYo.T3.Stmt.except_part,
    eYo.T3.Stmt.finally_part,
    eYo.T3.Stmt.for_part,
    eYo.T3.Stmt.funcdef_part,
    eYo.T3.Stmt.if_part,
    eYo.T3.Stmt.last_else_part,
    eYo.T3.Stmt.try_else_part,
    eYo.T3.Stmt.try_part,
    eYo.T3.Stmt.void_except_part,
    eYo.T3.Stmt.while_part,
    eYo.T3.Stmt.with_part,
]
eYo.T3.All.compound_statements = [ // count 0
]

eYo.T3.All.containsStatement = function(type) {
  return eYo.T3.All.part_statements.indexOf(type)>=0
  || eYo.T3.All.simple_statements.indexOf(type)>=0
  || eYo.T3.All.compound_statements.indexOf(type)>=0
}

eYo.T3.All.containsExpression = function(type) {
  return eYo.T3.All.core_expressions.indexOf(type)>=0
  || eYo.T3.All.lists.indexOf(type)>=0
  || eYo.T3.All.wrappers.indexOf(type)>=0
}

eYo.T3.All.contains = function(type) {
  return eYo.T3.All.containsStatement(type)
  || eYo.T3.All.containsExpression(type)
}

