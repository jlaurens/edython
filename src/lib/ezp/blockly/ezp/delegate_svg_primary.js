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

goog.provide('ezP.DelegateSvg.Xpr.Primary')

goog.require('ezP.DelegateSvg.Xpr')

/**
 * Class for a DelegateSvg, value+sealed pair.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Xpr.VSPair = function (prototypeName) {
  ezP.DelegateSvg.Xpr.VSPair.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.Xpr.VSPair, ezP.DelegateSvg.Xpr)

ezP.DelegateSvg.Xpr.VSPair.prototype.primaryCheck = undefined
ezP.DelegateSvg.Xpr.VSPair.prototype.secondaryCheck = undefined
ezP.DelegateSvg.Xpr.VSPair.prototype.outputType = undefined
ezP.DelegateSvg.Xpr.VSPair.prototype.secondaryPrototypeName = undefined

/**
 * Initialize the block.
 * Called by the block's init method.
 * For ezPython.
 * The FOR value is a connection to a sealed block
 * This connection will be sent far away to prevent block (dis)connection.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Xpr.VSPair.prototype.initBlock = function(block) {
  ezP.DelegateSvg.Xpr.VSPair.superClass_.initBlock.call(this, block)
  block.appendValueInput(ezP.Const.Input.PRIMARY)
    .setCheck(this.primaryCheck)
  this.inputSECONDARY = block.appendSealedValueInput(ezP.Const.Input.SECONDARY)
    .setCheck(this.secondaryCheck)
  block.setOutput(true, this.outputType)
}

/**
 * Create a sealed node for the comprehension if necessary.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Xpr.VSPair.prototype.completeSealed = function (block) {
  this.completeSealedInput(block,
    this.inputSECONDARY,
    this.secondaryPrototypeName)
}

/**
 * Class for a DelegateSvg, attributeref.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Xpr.attributeref = function (prototypeName) {
  ezP.DelegateSvg.Xpr.attributeref.superClass_.constructor.call(this, prototypeName)
  this.primaryCheck = ezP.T3.Require.primary
  this.secondaryCheck = ezP.T3.dot_identifier
  this.outputType = ezP.T3.attributeref
  this.secondaryPrototypeName = ezP.Const.Xpr.dot_identifier
}
goog.inherits(ezP.DelegateSvg.Xpr.attributeref, ezP.DelegateSvg.Xpr.VSPair)

ezP.DelegateSvg.Manager.register(ezP.Const.Xpr.attributeref, ezP.DelegateSvg.Xpr.attributeref)

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
ezP.DelegateSvg.Xpr.subscription = ezP.DelegateSvg.Xpr.slicing = function (prototypeName) {
  ezP.DelegateSvg.Xpr.slicing.superClass_.constructor.call(this, prototypeName)
  this.primaryCheck = ezP.T3.Require.primary
  this.secondaryCheck = ezP.T3.display_slice_list
  this.outputType = ezP.T3.slicing
  this.secondaryPrototypeName = ezP.Const.Xpr.display_slice_list
}
goog.inherits(ezP.DelegateSvg.Xpr.slicing, ezP.DelegateSvg.Xpr.VSPair)

ezP.DelegateSvg.Manager.register(ezP.Const.Xpr.slicing, ezP.DelegateSvg.Xpr.slicing)

/**
 * Class for a DelegateSvg, value+'('sealed')' pair.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Xpr.VSDelimitedPair = function (prototypeName) {
  ezP.DelegateSvg.Xpr.VSDelimitedPair.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.Xpr.VSDelimitedPair, ezP.DelegateSvg.Xpr.VSPair)

ezP.DelegateSvg.Xpr.VSDelimitedPair.prototype.leftDelimiter = undefined
ezP.DelegateSvg.Xpr.VSDelimitedPair.prototype.rightDelimiter = undefined

/**
 * Initialize the block.
 * Called by the block's init method.
 * For ezPython.
 * The FOR value is a connection to a sealed block
 * This connection will be sent far away to prevent block (dis)connection.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Xpr.VSDelimitedPair.prototype.initBlock = function(block) {
  ezP.DelegateSvg.Xpr.VSDelimitedPair.superClass_.initBlock.call(this, block)
  this.leftField = new ezP.FieldLabel(this.leftDelimiter)
  this.leftField.ezpFieldData = {x_shift: -ezP.Font.space/6}
  this.inputSECONDARY.appendField(this.leftField)
  this.rightField = new ezP.FieldLabel(this.rightDelimiter)
  this.rightField.ezpFieldData = {x_shift: +ezP.Font.space/6}
  block.appendDummyInput().appendField(this.rightField)
}

/**
 * Class for a DelegateSvg, call block.
 * As call is already a reserved message in javascript,
 * we use call_block instead.
 * Due to the ambibuity, it is implemented only once for both.
 * Slicing is richer.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Xpr.call_block =  function (prototypeName) {
  ezP.DelegateSvg.Xpr.call_block.superClass_.constructor.call(this, prototypeName)
  this.primaryCheck = ezP.T3.Require.primary
  this.secondaryCheck = ezP.T3.argument_list
  this.outputType = ezP.T3.call
  this.secondaryPrototypeName = ezP.Const.Xpr.argument_list
  this.leftDelimiter = '('
  this.rightDelimiter = ')'
}
goog.inherits(ezP.DelegateSvg.Xpr.call_block, ezP.DelegateSvg.Xpr.VSDelimitedPair)

ezP.DelegateSvg.Manager.register(ezP.Const.Xpr.call, ezP.DelegateSvg.Xpr.call_block)
