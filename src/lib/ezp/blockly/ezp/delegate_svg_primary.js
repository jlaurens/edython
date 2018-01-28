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

goog.provide('ezP.DelegateSvg.Expr.Primary')

goog.require('ezP.DelegateSvg.Expr')

/**
 * Class for a DelegateSvg, value+sealed pair.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.VSPair = function (prototypeName) {
  ezP.DelegateSvg.Expr.VSPair.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.Expr.VSPair, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Expr.VSPair.prototype.primaryCheck = undefined
ezP.DelegateSvg.Expr.VSPair.prototype.secondaryCheck = undefined
ezP.DelegateSvg.Expr.VSPair.prototype.outputCheck = undefined
ezP.DelegateSvg.Expr.VSPair.prototype.secondaryPrototypeName = undefined

/**
 * Initialize the block.
 * Called by the block's init method.
 * For ezPython.
 * The FOR value is a connection to a sealed block
 * This connection will be sent far away to prevent block (dis)connection.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Expr.VSPair.prototype.initBlock = function(block) {
  ezP.DelegateSvg.Expr.VSPair.superClass_.initBlock.call(this, block)
  block.appendValueInput(ezP.Const.Input.PRIMARY)
    .setCheck(this.primaryCheck)
  this.inputSECONDARY = block.appendSealedValueInput(ezP.Const.Input.SECONDARY, this.secondaryPrototypeName)
    .setCheck(this.secondaryCheck)
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
  this.primaryCheck = ezP.T3.Require.primary
  this.secondaryCheck = ezP.T3.identifier_dotted
  this.outputCheck = ezP.T3.attributeref
  this.secondaryPrototypeName = ezP.Const.Expr.identifier_dotted
}
goog.inherits(ezP.DelegateSvg.Expr.attributeref, ezP.DelegateSvg.Expr.VSPair)

ezP.DelegateSvg.Manager.register(ezP.Const.Expr.attributeref, ezP.DelegateSvg.Expr.attributeref)

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
  this.primaryCheck = ezP.T3.Require.primary
  this.secondaryCheck = ezP.T3.display_slice_list
  this.outputCheck = ezP.T3.slicing
  this.secondaryPrototypeName = ezP.Const.Expr.display_slice_list
}
goog.inherits(ezP.DelegateSvg.Expr.slicing, ezP.DelegateSvg.Expr.VSPair)

ezP.DelegateSvg.Manager.register(ezP.Const.Expr.slicing, ezP.DelegateSvg.Expr.slicing)

/**
 * Class for a DelegateSvg, value+'('sealed')' pair.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.VSDelimitedPair = function (prototypeName) {
  ezP.DelegateSvg.Expr.VSDelimitedPair.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.Expr.VSDelimitedPair, ezP.DelegateSvg.Expr.VSPair)

ezP.DelegateSvg.Expr.VSDelimitedPair.prototype.leftDelimiter = undefined
ezP.DelegateSvg.Expr.VSDelimitedPair.prototype.rightDelimiter = undefined

/**
 * Initialize the block.
 * Called by the block's init method.
 * For ezPython.
 * The FOR value is a connection to a sealed block
 * This connection will be sent far away to prevent block (dis)connection.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Expr.VSDelimitedPair.prototype.initBlock = function(block) {
  ezP.DelegateSvg.Expr.VSDelimitedPair.superClass_.initBlock.call(this, block)
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
ezP.DelegateSvg.Expr.call_block =  function (prototypeName) {
  ezP.DelegateSvg.Expr.call_block.superClass_.constructor.call(this, prototypeName)
  this.primaryCheck = ezP.T3.Require.primary
  this.secondaryCheck = ezP.T3.argument_list
  this.outputCheck = ezP.T3.call
  this.secondaryPrototypeName = ezP.Const.Expr.argument_list
  this.leftDelimiter = '('
  this.rightDelimiter = ')'
}
goog.inherits(ezP.DelegateSvg.Expr.call_block, ezP.DelegateSvg.Expr.VSDelimitedPair)

ezP.DelegateSvg.Manager.register(ezP.Const.Expr.call, ezP.DelegateSvg.Expr.call_block)
