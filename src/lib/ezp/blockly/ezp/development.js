/**
 * ezPython
 *
 * Copyright 2017 Jérôme LAURENS.
 *
 * License CeCILL-B
 */

/**
 * @fileoverview helper for ezPython.
 * This file is for development only.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('ezP.Development')

goog.require('ezP.DelegateSvg')
goog.require('ezP.DelegateSvg.Import')

ezP.Do.arraysMerged = function(/* list of arrays */) {
  var RA = []
  for (var i = 0; i < arguments.length; i++) {
    var Xs = arguments[i]
    var j = 0
    for (; j < Xs.length; ++j) {
      var x = Xs[j]
      if (RA.indexOf(x) < 0) {
        RA.push(x)
      }
    }
  }
  return RA
}

/**
 * Useful for development purposes only.
 * This is a series of arrays of block prototypes
 * related to the given delegate.
 * in order to load the corresponding blocks in the workspace,
 * issue the following command in your main html file
 * ezP.DelegateSvg.(Expr|Stmt).(prototype).workspaceBlocks, 5, offset, step)
 */
ezP.DelegateSvg.workspaceBlocks = []

/**
 * Useful for development purposes only.
 * This is an array of block prototypes
 * related to the given delegate.
 */
ezP.DelegateSvg.Expr.import_module.workspaceBlocks = [
  ezP.T3.Expr.non_void_module_as_list,
  ezP.T3.Expr.import_module,
  ezP.T3.Expr.module_as_concrete,
  ezP.T3.Expr.identifier,
  ezP.T3.Expr.module_concrete,
]

ezP.DelegateSvg.Expr.from_relative_module_import.workspaceBlocks = [
  ezP.T3.Expr.non_void_import_identifier_as_list,
  ezP.T3.Expr.from_relative_module_import,
  ezP.T3.Expr.import_identifier_as_concrete,
  ezP.T3.Expr.identifier,
  ezP.T3.Expr.parent_module,
  ezP.T3.Expr.module_concrete,
]

ezP.DelegateSvg.Expr.from_module_import.workspaceBlocks = [ezP.T3.Expr.from_module_import].concat(ezP.T3.Expr.Check.module)

ezP.DelegateSvg.Stmt.import_part.workspaceBlocks = [ezP.T3.Stmt.import_part].concat(ezP.DelegateSvg.Expr.import_module.workspaceBlocks).concat(ezP.DelegateSvg.Expr.from_relative_module_import.workspaceBlocks).concat(ezP.DelegateSvg.Expr.from_module_import.workspaceBlocks)

ezP.DelegateSvg.Expr.comprehension.workspaceBlocks = [
  ezP.T3.Expr.comprehension,
  ezP.T3.Expr.identifier,
  ezP.T3.Expr.comp_for,
  ezP.T3.Expr.comp_if,
  ezP.T3.Expr.target_list,
  ezP.T3.Expr.comp_iter_list,
]

ezP.DelegateSvg.Expr.a_expr_concrete.workspaceBlocks = 
ezP.DelegateSvg.Expr.m_expr_concrete.workspaceBlocks = 
ezP.DelegateSvg.Expr.u_expr_concrete.workspaceBlocks = [
  ezP.T3.Expr.identifier,
  ezP.T3.Expr.a_expr_concrete,
  ezP.T3.Expr.m_expr_concrete,
  ezP.T3.Expr.u_expr_concrete,
]

ezP.DelegateSvg.Expr.shift_expr_concrete.workspaceBlocks = 
ezP.DelegateSvg.Expr.and_expr_concrete.workspaceBlocks = 
ezP.DelegateSvg.Expr.xor_expr_concrete.workspaceBlocks = 
ezP.DelegateSvg.Expr.or_expr_concrete.workspaceBlocks = [
  ezP.T3.Expr.identifier,
  ezP.T3.Expr.shift_expr_concrete,
  ezP.T3.Expr.and_expr_concrete,
  ezP.T3.Expr.xor_expr_concrete,
  ezP.T3.Expr.or_expr_concrete,
]

// in progress

ezP.DelegateSvg.Expr.power_concrete.workspaceBlocks = ezP.Do.arraysMerged([
  ezP.T3.Expr.power_concrete,
], ezP.T3.Expr.Check.await_or_primary, ezP.T3.Expr.Check.u_expr)

ezP.DelegateSvg.Expr.conditional_expression_concrete.workspaceBlocks = [
  ezP.T3.Expr.conditional_expression_concrete,
].concat(ezP.T3.Expr.Check.or_test).concat(ezP.T3.Expr.Check.expression)

ezP.DelegateSvg.Expr.starred_item_list.workspaceBlocks = [
  ezP.T3.Expr.starred_item_list,
] .concat(ezP.T3.Expr.Check.starred_item)

ezP.DelegateSvg.Expr.parenth_form.workspaceBlocks = [
  ezP.T3.Expr.parenth_form,
  ezP.T3.Expr.identifier,
  ezP.T3.Expr.starred_item_list,
]

