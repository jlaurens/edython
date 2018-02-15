/**
 * ezPython
 *
 * Copyright 2017 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview BlockSvg delegates for ezPython, primary blocks.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('ezP.DelegateSvg.Primary')

goog.require('ezP.DelegateSvg.Expr')

/**
 * Class for a DelegateSvg, attributeref.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Primary = function (prototypeName) {
  ezP.DelegateSvg.Primary.superClass_.constructor.call(this, prototypeName)
  this.inputData_.first = {
    key: ezP.Const.Input.PRIMARY,
    check: ezP.T3.Expr.Check.primary,
    plugged: ezP.T3.Expr.primary,
  }
}
goog.inherits(ezP.DelegateSvg.Primary, ezP.DelegateSvg.Expr)

/**
 * The primary connection if any.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.prototype.getPrimaryConnection = function (block) {
  return undefined
}

/**
 * The primary connection if any.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Primary.prototype.getPrimaryConnection = function (block) {
  // var input = block.getInput(ezP.Const.Input.PRIMARY)
  return this.inputs.first.input.connection
}

/**
 * Class for a DelegateSvg, attributeref.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.attributeref = function (prototypeName) {
  ezP.DelegateSvg.Expr.attributeref.superClass_.constructor.call(this, prototypeName)
  this.inputData_.last = {
    label: '.',
    key: ezP.Const.Input.ATTRIBUTE,
    check: ezP.T3.Expr.identifier,
    plugged: ezP.T3.Expr.attribute_identifier,
  }
  this.outputCheck = ezP.T3.Expr.attributeref 
}
goog.inherits(ezP.DelegateSvg.Expr.attributeref, ezP.DelegateSvg.Primary)
ezP.DelegateSvg.Manager.register('attributeref')

/**
 * Class for a DelegateSvg, subscription and slicing.
 * Due to the ambibuity, it is implemented only once for both.
 * Slicing is richer.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.subscription = ezP.DelegateSvg.Expr.slicing = function (prototypeName) {
  ezP.DelegateSvg.Expr.slicing.superClass_.constructor.call(this, prototypeName)
  this.inputData_.last = {
    key: ezP.Const.Input.SLICE,
    wrap: ezP.T3.Expr.display_slice_list,
  }
  this.outputCheck = ezP.T3.Expr.slicing
}
goog.inherits(ezP.DelegateSvg.Expr.slicing, ezP.DelegateSvg.Primary)
ezP.DelegateSvg.Manager.register('slicing')

/**
 * Class for a DelegateSvg, call block.
 * As call is already a reserved message in javascript,
 * we use call_expr instead.
 * Due to the ambibuity, it is implemented only once for both.
 * Slicing is richer.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.call_expr =  function (prototypeName) {
  ezP.DelegateSvg.Expr.call_expr.superClass_.constructor.call(this, prototypeName)
  this.inputData_.last = {
    key: ezP.Const.Input.ARGS,
    label: '(',
    wrap: ezP.T3.Expr.argument_list,
  }
  this.labelEnd.value = ')'
  this.outputCheck = ezP.T3.Expr.call_expr
}
goog.inherits(ezP.DelegateSvg.Expr.call_expr, ezP.DelegateSvg.Primary)
ezP.DelegateSvg.Manager.register('call_expr')
