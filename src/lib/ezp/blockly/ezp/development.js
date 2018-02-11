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
