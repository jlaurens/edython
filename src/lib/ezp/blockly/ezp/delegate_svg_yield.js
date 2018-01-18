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

goog.provide('ezP.DelegateSvg.Yield')

goog.require('ezP.DelegateSvg.Xpr')

/**
 * Class for a DelegateSvg, yield_atom.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Xpr.yield_atom = function (prototypeName) {
  ezP.DelegateSvg.Xpr.yield_atom.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.Xpr.yield_atom, ezP.DelegateSvg.Xpr)

ezP.DelegateSvg.Manager.register(ezP.Const.Xpr.yield_atom, ezP.DelegateSvg.Xpr.yield_atom)

/**
 * Initialize the block.
 * Called by the block's init method.
 * For ezPython.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Xpr.yield_atom.prototype.initBlock = function(block) {
  ezP.DelegateSvg.Xpr.yield_atom.superClass_.initBlock.call(this, block)
  var field = new ezP.FieldLabel('(')
  field.ezpFieldData = {x_shift: ezP.Font.space/4}
  block.appendValueInput(ezP.Const.Input.XPR)
    .setCheck(ezP.T3.Require.yield_expression)
    .appendField(field)
  field = new ezP.FieldLabel(')')
  field.ezpFieldData = {x_shift: -ezP.Font.space/4}
  block.appendDummyInput()
    .appendField(field)
  block.setOutput(true, ezP.T3.Provide.yield_atom)
}

/**
 * The right padding of a block.
 * @param {!Blockly.Block} block.
 * @private
 */
ezP.DelegateSvg.Xpr.yield_atom.prototype.paddingRight = function (block) {
  return 0 
}

/**
 * The left padding of a block.
 * @param {!Blockly.Block} block.
 * @private
 */
ezP.DelegateSvg.Xpr.yield_atom.prototype.paddingLeft = function (block) {
  return 0 
}


/**
 * Class for a DelegateSvg, yield_expression_list.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Xpr.yield_expression_list = function (prototypeName) {
  ezP.DelegateSvg.Xpr.yield_expression_list.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.Xpr.yield_expression_list, ezP.DelegateSvg.Xpr)

ezP.DelegateSvg.Manager.register(ezP.Const.Xpr.yield_expression_list, ezP.DelegateSvg.Xpr.yield_expression_list)

/**
 * Initialize the block.
 * Called by the block's init method.
 * For ezPython.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Xpr.yield_expression_list.prototype.initBlock = function(block) {
  ezP.DelegateSvg.Xpr.yield_expression_list.superClass_.initBlock.call(this, block)
  this.inputXPR = block.appendSealedValueInput(ezP.Const.Input.XPR)
    .setCheck([ezP.T3.expression_list])
    .appendField(new ezP.FieldLabel('yield'))
  block.setOutput(true, ezP.T3.Provide.yield_atom)
}

/**
 * Create a sealed node for the comprehension if necessary.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Xpr.yield_expression_list.prototype.completeSealed = function (block) {
  this.completeSealedInput(block,
    this.inputXPR,
    ezP.Const.Xpr.expression_list)
}

/**
 * Class for a DelegateSvg, yield_expression_from.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Xpr.yield_expression_from = function (prototypeName) {
  ezP.DelegateSvg.Xpr.yield_expression_from.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.Xpr.yield_expression_from, ezP.DelegateSvg.Xpr)

ezP.DelegateSvg.Manager.register(ezP.Const.Xpr.yield_expression_from, ezP.DelegateSvg.Xpr.yield_expression_from)

/**
 * Initialize the block.
 * Called by the block's init method.
 * For ezPython.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Xpr.yield_expression_from.prototype.initBlock = function(block) {
  ezP.DelegateSvg.Xpr.yield_expression_from.superClass_.initBlock.call(this, block)
  block.appendValueInput(ezP.Const.Input.XPR)
    .setCheck(ezP.T3.Require.expression)
    .appendField(new ezP.FieldLabel('yield from'))
  block.setOutput(true, ezP.T3.Provide.yield_expression_from)
}
