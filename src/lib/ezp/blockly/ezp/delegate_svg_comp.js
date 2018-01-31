/**
 * ezPython
 *
 * Copyright 2017 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview BlockSvg delegates for ezPython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('ezP.DelegateSvg.Expr.Comprehension')

goog.require('ezP.DelegateSvg.Expr')

/**
 * Class for a DelegateSvg, comprehension value block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.Comprehension = function (prototypeName) {
  ezP.DelegateSvg.Expr.Comprehension.superClass_.constructor.call(this, prototypeName)
  this.inputData = {
    first: {
      key: ezP.Const.Input.EXPR,
      check: ezP.T3.Require.expression
    },
    middle: {
      key: ezP.Const.Input.FORIN,
      check: ezP.T3.comp_for,
      wrap: ezP.Const.Expr.comp_for
    },
    last: {
      key: ezP.Const.Input.ITER,
      check: ezP.T3.comp_iter_list,
      wrap: ezP.Const.Expr.comp_iter_list
    }
  }
  this.outputCheck = ezP.T3.comprehension
}
goog.inherits(ezP.DelegateSvg.Expr.Comprehension, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Manager.register(ezP.Const.Expr.comprehension, ezP.DelegateSvg.Expr.Comprehension)

/**
 * Class for a DelegateSvg, comp_for block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.comp_for = function (prototypeName) {
  ezP.DelegateSvg.Expr.comp_for.superClass_.constructor.call(this, prototypeName)
  this.inputData = {
    first: {
      key: ezP.Const.Input.FOR,
      label: 'for',
      check: ezP.T3.Require.target_list
    },
    last: {
      key: ezP.Const.Input.IN,
      label: 'in',
      check: ezP.T3.Require.or_test,
    }
  }
  this.outputCheck = ezP.T3.comp_for
}
goog.inherits(ezP.DelegateSvg.Expr.comp_for, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Manager.register(ezP.Const.Expr.comp_for, ezP.DelegateSvg.Expr.comp_for)

/**
 * Class for a DelegateSvg, comp_if block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.comp_if = function (prototypeName) {
  ezP.DelegateSvg.Expr.comp_if.superClass_.constructor.call(this, prototypeName)
  this.inputData = {
    first: {
      key: ezP.Const.Input.IF,
      label: 'if',
      check: ezP.T3.Require.expression_nocond
    }
  }
  this.outputCheck = ezP.T3.comp_if
}
goog.inherits(ezP.DelegateSvg.Expr.comp_if, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Manager.register(ezP.Const.Expr.comp_if, ezP.DelegateSvg.Expr.comp_if)
