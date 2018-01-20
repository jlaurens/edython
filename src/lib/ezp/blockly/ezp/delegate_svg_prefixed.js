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

goog.provide('ezP.DelegateSvg.Xpr.Prefixed')

goog.require('ezP.DelegateSvg.Xpr')

/**
 * Class for a DelegateSvg, '**...' block.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Xpr.Prefixed = function (prototypeName) {
  ezP.DelegateSvg.Xpr.Prefixed.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.Xpr.Prefixed, ezP.DelegateSvg.Xpr)

ezP.DelegateSvg.Xpr.Prefixed.prototype.prefix = undefined
ezP.DelegateSvg.Xpr.Prefixed.prototype.checkTypes = undefined
ezP.DelegateSvg.Xpr.Prefixed.prototype.outputType = undefined

/**
 * Initialize the block.
 * Called by the block's init method.
 * For ezPython.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Xpr.Prefixed.prototype.initBlock = function(block) {
  ezP.DelegateSvg.Xpr.Delimited.superClass_.initBlock.call(this, block)
  block.appendValueInput(ezP.Const.Input.XPR)
    .setCheck(this.checkTypes)
    .appendField(new ezP.FieldLabel(this.prefix))
  block.setOutput(true, this.outputType)
}

/**
 * Class for a DelegateSvg, '*...' block.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Xpr.starred_or_expr = function (prototypeName) {
  ezP.DelegateSvg.Xpr.double_starred_or_expr.superClass_.constructor.call(this, prototypeName)
  this.prefix = '*'
  this.checkTypes = ezP.T3.Require.expression
  this.outputType = ezP.T3.starred_or_expr
}
goog.inherits(ezP.DelegateSvg.Xpr.starred_or_expr, ezP.DelegateSvg.Xpr.Prefixed)

ezP.DelegateSvg.Manager.register(ezP.Const.Xpr.starred_or_expr, ezP.DelegateSvg.Xpr.starred_or_expr)

/**
 * Class for a DelegateSvg, '**...' block.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Xpr.double_starred_or_expr = function (prototypeName) {
  ezP.DelegateSvg.Xpr.double_starred_or_expr.superClass_.constructor.call(this, prototypeName)
  this.prefix = '**'
  this.checkTypes = ezP.T3.Require.expression
  this.outputType = ezP.T3.double_starred_or_expr
}
goog.inherits(ezP.DelegateSvg.Xpr.double_starred_or_expr, ezP.DelegateSvg.Xpr.Prefixed)

ezP.DelegateSvg.Manager.register(ezP.Const.Xpr.double_starred_or_expr, ezP.DelegateSvg.Xpr.double_starred_or_expr)

/**
 * Class for a DelegateSvg, yield_from.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Xpr.yield_from = function (prototypeName) {
  ezP.DelegateSvg.Xpr.yield_from.superClass_.constructor.call(this, prototypeName)
  this.prefix = 'from'
  this.checkTypes = ezP.T3.Require.expression
  this.outputType = ezP.T3.yield_from
}
goog.inherits(ezP.DelegateSvg.Xpr.yield_from, ezP.DelegateSvg.Xpr.Prefixed)

ezP.DelegateSvg.Manager.register(ezP.Const.Xpr.yield_from, ezP.DelegateSvg.Xpr.yield_from)

/**
* Class for a DelegateSvg, dot_identifier.
* For ezPython.
* @param {?string} prototypeName Name of the language object containing
*     type-specific functions for this block.
* @constructor
*/
ezP.DelegateSvg.Xpr.dot_identifier = function (prototypeName) {
 ezP.DelegateSvg.Xpr.dot_identifier.superClass_.constructor.call(this, prototypeName)
 this.prefix = '.'
 this.checkTypes = ezP.T3.identifier
 this.outputType = ezP.T3.dot_identifier
}
goog.inherits(ezP.DelegateSvg.Xpr.dot_identifier, ezP.DelegateSvg.Xpr.Prefixed)

ezP.DelegateSvg.Manager.register(ezP.Const.Xpr.dot_identifier, ezP.DelegateSvg.Xpr.dot_identifier)
