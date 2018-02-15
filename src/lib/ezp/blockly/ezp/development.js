/**
 * ezPython
 *
 * Copyright 2017 Jérôme LAURENS.
 *
 * License CeCILL-B
 */

/**
 * @fileoverview helper for ezPython.
 * In order to avoid name collisions, every subclass of either a
 * closure object or a Blockly object has a minimum of extra properties.
 * All these properties and methods are gathered in the  helper.
 * Block helpers are called delegates.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('ezP.Development')

goog.require('ezP.DelegateSvg')
goog.require('ezP.DelegateSvg.Import')

/**
 * Useful for development purposes only.
 * This is an array of block prototypes
 * related to the given delegate.
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
