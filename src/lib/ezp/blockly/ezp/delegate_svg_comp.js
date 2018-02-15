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
ezP.DelegateSvg.Expr.comprehension = function (prototypeName) {
  ezP.DelegateSvg.Expr.comprehension.superClass_.constructor.call(this, prototypeName)
  this.inputData_ = {
    first: {
      key: ezP.Const.Input.EXPR,
      check: ezP.T3.Expr.Check.expression,
      hole_value: 'name',
    },
    middle: {
      key: ezP.Const.Input.FOR,
      check: ezP.T3.Expr.comp_for,
      wrap: ezP.T3.Expr.comp_for,
    },
    last: {
      key: ezP.Const.Input.ITER,
      check: ezP.T3.Expr.comp_iter_list,
      wrap: ezP.T3.Expr.comp_iter_list,
    }
  }
  this.outputCheck = ezP.T3.Expr.comprehension
}
goog.inherits(ezP.DelegateSvg.Expr.comprehension, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Manager.register('comprehension')

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
  this.inputData_ = {
    first: {
      key: ezP.Const.Input.FOR,
      label: 'for',
      check: ezP.T3.Expr.target_list,
      wrap: ezP.T3.Expr.target_list,
    },
    last: {
      key: ezP.Const.Input.IN,
      label: 'in',
      check: ezP.T3.Expr.Check.or_test,
      hole_value: 'name',
    }
  }
  this.outputCheck = ezP.T3.Expr.comp_for
}
goog.inherits(ezP.DelegateSvg.Expr.comp_for, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Manager.register('comp_for')

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
  this.inputData_ = {
    first: {
      key: ezP.Const.Input.IF,
      label: 'if',
      check: ezP.T3.Expr.Check.expression_nocond
    }
  }
  this.outputCheck = ezP.T3.Expr.comp_if
}
goog.inherits(ezP.DelegateSvg.Expr.comp_if, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Manager.register('comp_if')

/**
 * Class for a DelegateSvg, comp_iter_list block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.comp_iter_list = function (prototypeName) {
  ezP.DelegateSvg.Expr.comp_iter_list.superClass_.constructor.call(this, prototypeName)
  this.consolidator = new ezP.Consolidator.List(ezP.T3.Expr.Check.comp_iter,true,'')
  this.outputCheck = ezP.T3.Expr.comp_iter_list
}
goog.inherits(ezP.DelegateSvg.Expr.comp_iter_list, ezP.DelegateSvg.List)

ezP.DelegateSvg.Manager.register('comp_iter_list')
