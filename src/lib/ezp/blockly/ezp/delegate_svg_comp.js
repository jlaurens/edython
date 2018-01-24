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

goog.provide('ezP.DelegateSvg.Xpr.Comprehension')

goog.require('ezP.DelegateSvg.Xpr')

/**
 * Class for a DelegateSvg, comprehension value block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Xpr.Comprehension = function (prototypeName) {
  ezP.DelegateSvg.Xpr.Comprehension.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.Xpr.Comprehension, ezP.DelegateSvg.Xpr)

ezP.DelegateSvg.Manager.register(ezP.Const.Xpr.comprehension, ezP.DelegateSvg.Xpr.Comprehension)

/**
 * Initialize the block.
 * Called by the block's init method.
 * For ezPython.
 * The FOR value is a connection to a sealed block
 * This connection will be sent far away to prevent block (dis)connection.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Xpr.Comprehension.prototype.initBlock = function(block) {
  ezP.DelegateSvg.Xpr.Comprehension.superClass_.initBlock.call(this, block)
  block.appendValueInput(ezP.Const.Input.XPR)
    .setCheck(ezP.T3.Require.expression)
  this.inputFORIN = block.appendSealedValueInput(ezP.Const.Input.FORIN)
    .setCheck(ezP.T3.comp_for)
  this.inputITER = block.appendSealedValueInput(ezP.Const.Input.ITER)
    .setCheck(ezP.T3.comp_iter_list)
  block.setOutput(true, ezP.T3.comprehension)
}

/**
 * Create a sealed node for the comprehension if necessary.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Xpr.Comprehension.prototype.completeSealed = function (block) {
  this.completeSealedInput(block,
    this.inputFORIN,
    ezP.Const.Xpr.comp_for)
  this.completeSealedInput(block,
    this.inputITER,
    ezP.Const.Xpr.comp_iter_list)
}


/**
 * Class for a DelegateSvg, comp_for block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Xpr.comp_for = function (prototypeName) {
  ezP.DelegateSvg.Xpr.comp_for.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.Xpr.comp_for, ezP.DelegateSvg.Xpr)

ezP.DelegateSvg.Manager.register(ezP.Const.Xpr.comp_for, ezP.DelegateSvg.Xpr.comp_for)

/**
 * Initialize the block.
 * Called by the block's init method.
 * For ezPython.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Xpr.comp_for.prototype.initBlock = function(block) {
  ezP.DelegateSvg.Xpr.comp_for.superClass_.initBlock.call(this, block)
  block.appendValueInput(ezP.Const.Input.FOR)
    .setCheck(ezP.T3.Require.target_list)
    .appendField(new ezP.FieldLabel('for'))
  block.appendValueInput(ezP.Const.Input.IN)
    .setCheck(ezP.T3.Require.or_test)
    .appendField(new ezP.FieldLabel('in'))
  block.setOutput(true, ezP.T3.comp_for)
}

/**
 * Class for a DelegateSvg, comp_if block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Xpr.comp_if = function (prototypeName) {
  ezP.DelegateSvg.Xpr.comp_if.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.Xpr.comp_if, ezP.DelegateSvg.Xpr)

ezP.DelegateSvg.Manager.register(ezP.Const.Xpr.comp_if, ezP.DelegateSvg.Xpr.comp_if)

/**
 * Initialize the block.
 * Called by the block's init method.
 * For ezPython.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Xpr.comp_if.prototype.initBlock = function(block) {
  ezP.DelegateSvg.Xpr.comp_if.superClass_.initBlock.call(this, block)
  block.appendValueInput(ezP.Const.Input.IF)
    .setCheck(ezP.T3.Require.expression_nocond)
    .appendField(new ezP.FieldLabel('if'))
  block.setOutput(true, ezP.T3.comp_if)
}
