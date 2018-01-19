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

goog.provide('ezP.DelegateSvg.Xpr.Delimited')

goog.require('ezP.DelegateSvg.Xpr')

/**
 * Abstract class for a DelegateSvg, delimited value block like
 * '(...)','[...]', '{...}'.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Xpr.Delimited = function (prototypeName) {
  ezP.DelegateSvg.Xpr.Delimited.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.Xpr.Delimited, ezP.DelegateSvg.Xpr)

ezP.DelegateSvg.Xpr.Delimited.prototype.leftDelimiter = undefined
ezP.DelegateSvg.Xpr.Delimited.prototype.rightDelimiter = undefined
ezP.DelegateSvg.Xpr.Delimited.prototype.outputType = undefined
ezP.DelegateSvg.Xpr.Delimited.prototype.sealedPrototypeName = undefined

/**
 * Initialize the block.
 * Called by the block's init method.
 * For ezPython.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Xpr.Delimited.prototype.initBlock = function(block) {
  ezP.DelegateSvg.Xpr.Delimited.superClass_.initBlock.call(this, block)
  var field = new ezP.FieldLabel(this.leftDelimiter)
  field.ezpFieldData = {x_shift: ezP.Font.space/4}
  this.inputITEM = block.appendSealedValueInput(ezP.Const.Input.ITEM)
    .appendField(field)
  field = new ezP.FieldLabel(this.rightDelimiter)
  field.ezpFieldData = {x_shift: -ezP.Font.space/4}
  block.appendDummyInput().appendField(field)
  block.setOutput(true, this.outputType)
}

/**
 * The left padding of a block.
 * @param {!Blockly.Block} block.
 * @private
 */
ezP.DelegateSvg.Xpr.Delimited.prototype.paddingLeft = function (block) {
  return 0 
}

/**
 * The right padding of a block.
 * @param {!Blockly.Block} block.
 * @private
 */
ezP.DelegateSvg.Xpr.Delimited.prototype.paddingRight = function (block) {
  return 0 
}

/**
 * Create a sealed node for the Xpr.Delimited if necessary.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Xpr.Delimited.prototype.completeSealed = function (block) {
  this.completeSealedInput(block,
    this.inputITEM,
    this.sealedPrototypeName)
}

/**
 * Class for a DelegateSvg, parenth_form.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Xpr.parenth_form = function (prototypeName) {
  ezP.DelegateSvg.Xpr.parenth_form.superClass_.constructor.call(this, prototypeName)
  this.leftDelimiter = '('
  this.rightDelimiter = ')'
  this.outputType = ezP.T3.parenth_form
  this.sealedPrototypeName = ezP.Const.Xpr.starred_list
}
goog.inherits(ezP.DelegateSvg.Xpr.parenth_form, ezP.DelegateSvg.Xpr.Delimited)

ezP.DelegateSvg.Manager.register(ezP.Const.Xpr.parenth_form, ezP.DelegateSvg.Xpr.parenth_form)

/**
 * Class for a DelegateSvg, list_display block.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Xpr.list_display = function (prototypeName) {
  ezP.DelegateSvg.Xpr.list_display.superClass_.constructor.call(this, prototypeName)
  this.leftDelimiter = '['
  this.rightDelimiter = ']'
  this.outputType = ezP.T3.list_display
  this.sealedPrototypeName = ezP.Const.Xpr.starred_list_comprehensive
}
goog.inherits(ezP.DelegateSvg.Xpr.list_display, ezP.DelegateSvg.Xpr.Delimited)

ezP.DelegateSvg.Manager.register(ezP.Const.Xpr.list_display, ezP.DelegateSvg.Xpr.list_display)

/**
 * Class for a DelegateSvg, set_display block.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Xpr.set_display = function (prototypeName) {
  ezP.DelegateSvg.Xpr.set_display.superClass_.constructor.call(this, prototypeName)
  this.leftDelimiter = '{'
  this.rightDelimiter = '}'
  this.outputType = ezP.T3.set_display
  this.sealedPrototypeName = ezP.Const.Xpr.non_void_starred_list_comprehensive
}
goog.inherits(ezP.DelegateSvg.Xpr.set_display, ezP.DelegateSvg.Xpr.Delimited)

ezP.DelegateSvg.Manager.register(ezP.Const.Xpr.set_display, ezP.DelegateSvg.Xpr.set_display)

/**
 * Class for a DelegateSvg, dict_display block.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Xpr.dict_display = function (prototypeName) {
  ezP.DelegateSvg.Xpr.dict_display.superClass_.constructor.call(this, prototypeName)
  this.leftDelimiter = '{'
  this.rightDelimiter = '}'
  this.outputType = ezP.T3.dict_display
  this.sealedPrototypeName = ezP.Const.Xpr.key_datum_list_comprehensive
}
goog.inherits(ezP.DelegateSvg.Xpr.dict_display, ezP.DelegateSvg.Xpr.Delimited)

ezP.DelegateSvg.Manager.register(ezP.Const.Xpr.dict_display, ezP.DelegateSvg.Xpr.dict_display)

/**
 * Class for a DelegateSvg, generator expression block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Xpr.generator_expression = function (prototypeName) {
  ezP.DelegateSvg.Xpr.generator_expression.superClass_.constructor.call(this, prototypeName)
  this.leftDelimiter = '('
  this.rightDelimiter = ')'
  this.outputType = ezP.T3.generator_expression
  this.sealedPrototypeName = ezP.Const.Xpr.comprehension
}
goog.inherits(ezP.DelegateSvg.Xpr.generator_expression, ezP.DelegateSvg.Xpr.Delimited)

ezP.DelegateSvg.Manager.register(ezP.Const.Xpr.generator_expression, ezP.DelegateSvg.Xpr.generator_expression)
