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

goog.provide('ezP.DelegateSvg.Expr.Delimited')

goog.require('ezP.DelegateSvg.Expr')

/**
 * Abstract class for a DelegateSvg, delimited value block like
 * '(...)','[...]', '{...}'.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.Delimited = function (prototypeName) {
  ezP.DelegateSvg.Expr.Delimited.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.Expr.Delimited, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Expr.Delimited.prototype.leftDelimiter = '('
ezP.DelegateSvg.Expr.Delimited.prototype.rightDelimiter = ')'
ezP.DelegateSvg.Expr.Delimited.prototype.outputCheck = undefined
ezP.DelegateSvg.Expr.Delimited.prototype.sealedPrototypeName = undefined

/**
 * Initialize the block.
 * Called by the block's init method.
 * For ezPython.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Expr.Delimited.prototype.initBlock = function(block) {
  ezP.DelegateSvg.Expr.Delimited.superClass_.initBlock.call(this, block)
  this.leftField = new ezP.FieldLabel(this.leftDelimiter)
  this.leftField.ezpFieldData = {x_shift: -ezP.Font.space/6}
  this.inputITEM = block.appendSealedValueInput(ezP.Const.Input.ITEM)
    .appendField(this.leftField)
  this.rightField = new ezP.FieldLabel(this.rightDelimiter)
  this.rightField.ezpFieldData = {x_shift: +ezP.Font.space/6}
  block.appendDummyInput().appendField(this.rightField)
}

/**
 * Create a sealed node for the Expr.Delimited if necessary.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Expr.Delimited.prototype.completeSealed = function (block) {
  ezP.DelegateSvg.Expr.Delimited.superClass_.completeSealed.call(this, block)
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
ezP.DelegateSvg.Expr.parenth_form = function (prototypeName) {
  ezP.DelegateSvg.Expr.parenth_form.superClass_.constructor.call(this, prototypeName)
  this.outputCheck = ezP.T3.parenth_form
  this.sealedPrototypeName = ezP.Const.Expr.starred_item_list
}
goog.inherits(ezP.DelegateSvg.Expr.parenth_form, ezP.DelegateSvg.Expr.Delimited)

ezP.DelegateSvg.Manager.register(ezP.Const.Expr.parenth_form, ezP.DelegateSvg.Expr.parenth_form)

/**
 * Class for a DelegateSvg, list_display block.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.list_display = function (prototypeName) {
  ezP.DelegateSvg.Expr.list_display.superClass_.constructor.call(this, prototypeName)
  this.leftDelimiter = '['
  this.rightDelimiter = ']'
  this.outputCheck = ezP.T3.list_display
  this.sealedPrototypeName = ezP.Const.Expr.starred_list_comprehensive
}
goog.inherits(ezP.DelegateSvg.Expr.list_display, ezP.DelegateSvg.Expr.Delimited)

ezP.DelegateSvg.Manager.register(ezP.Const.Expr.list_display, ezP.DelegateSvg.Expr.list_display)

/**
 * Class for a DelegateSvg, set_display block.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.set_display = function (prototypeName) {
  ezP.DelegateSvg.Expr.set_display.superClass_.constructor.call(this, prototypeName)
  this.leftDelimiter = '{'
  this.rightDelimiter = '}'
  this.outputCheck = ezP.T3.set_display
  this.sealedPrototypeName = ezP.Const.Expr.non_void_starred_list_comprehensive
}
goog.inherits(ezP.DelegateSvg.Expr.set_display, ezP.DelegateSvg.Expr.Delimited)

ezP.DelegateSvg.Manager.register(ezP.Const.Expr.set_display, ezP.DelegateSvg.Expr.set_display)

/**
 * Class for a DelegateSvg, dict_display block.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.dict_display = function (prototypeName) {
  ezP.DelegateSvg.Expr.dict_display.superClass_.constructor.call(this, prototypeName)
  this.outputCheck = ezP.T3.dict_display
  this.sealedPrototypeName = ezP.Const.Expr.key_datum_list_comprehensive
}
goog.inherits(ezP.DelegateSvg.Expr.dict_display, ezP.DelegateSvg.Expr.Delimited)

ezP.DelegateSvg.Manager.register(ezP.Const.Expr.dict_display, ezP.DelegateSvg.Expr.dict_display)

/**
 * Class for a DelegateSvg, generator expression block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.generator_expression = function (prototypeName) {
  ezP.DelegateSvg.Expr.generator_expression.superClass_.constructor.call(this, prototypeName)
  this.outputCheck = ezP.T3.generator_expression
  this.sealedPrototypeName = ezP.Const.Expr.comprehension
}
goog.inherits(ezP.DelegateSvg.Expr.generator_expression, ezP.DelegateSvg.Expr.Delimited)

ezP.DelegateSvg.Manager.register(ezP.Const.Expr.generator_expression, ezP.DelegateSvg.Expr.generator_expression)


/**
 * Class for a DelegateSvg, '(yield ..., ..., ...)'.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.yield_atom = function (prototypeName) {
  ezP.DelegateSvg.Expr.yield_atom.superClass_.constructor.call(this, prototypeName)
  this.outputCheck = ezP.T3.yield_atom
  this.sealedPrototypeName = ezP.Const.Expr.yield_expression
}
goog.inherits(ezP.DelegateSvg.Expr.yield_atom, ezP.DelegateSvg.Expr.Delimited)

ezP.DelegateSvg.Manager.register(ezP.Const.Expr.yield_atom, ezP.DelegateSvg.Expr.yield_atom)

/**
 * Initialize the block.
 * Called by the block's init method.
 * For ezPython.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Expr.yield_atom.prototype.initBlock = function(block) {
  ezP.DelegateSvg.Expr.yield_atom.superClass_.initBlock.call(this, block)
  this.leftField.ezpFieldData = {x_shift: -ezP.Font.space/4}
  this.rightField.ezpFieldData = {x_shift: ezP.Font.space/4}
}

/**
 * Class for a DelegateSvg, 'yield ...' block.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.yield_expression = function (prototypeName) {
  ezP.DelegateSvg.Expr.yield_expression.superClass_.constructor.call(this, prototypeName)
  this.leftDelimiter = 'yield'
  this.rightDelimiter = ''
  this.outputCheck = ezP.T3.yield_expression
  this.sealedPrototypeName = ezP.Const.Expr.expression_or_from_list
}
goog.inherits(ezP.DelegateSvg.Expr.yield_expression, ezP.DelegateSvg.Expr.Delimited)

ezP.DelegateSvg.Manager.register(ezP.Const.Expr.yield_expression, ezP.DelegateSvg.Expr.yield_expression)

/**
 * Initialize the block.
 * Called by the block's init method.
 * For ezPython.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Expr.yield_expression.prototype.initBlock = function(block) {
  ezP.DelegateSvg.Expr.yield_expression.superClass_.initBlock.call(this, block)
  this.leftField.ezpFieldData = {x_shift: 0}
  this.rightField.ezpFieldData = {x_shift: 0}
}

/**
 * Class for a DelegateSvg, 'yield ...' block.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.display_slice_list = function (prototypeName) {
  ezP.DelegateSvg.Expr.display_slice_list.superClass_.constructor.call(this, prototypeName)
  this.leftDelimiter = '['
  this.rightDelimiter = ']'
  this.outputCheck = ezP.T3.display_slice_list
  this.sealedPrototypeName = ezP.Const.Expr.slice_list
}
goog.inherits(ezP.DelegateSvg.Expr.display_slice_list, ezP.DelegateSvg.Expr.Delimited)

ezP.DelegateSvg.Manager.register(ezP.Const.Expr.display_slice_list, ezP.DelegateSvg.Expr.display_slice_list)

