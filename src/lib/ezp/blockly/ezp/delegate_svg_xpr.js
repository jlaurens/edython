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

goog.provide('ezP.DelegateSvg.Xpr')

goog.require('ezP.DelegateSvg')

/**
 * Class for a DelegateSvg, value block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Xpr = function (prototypeName) {
  ezP.DelegateSvg.Xpr.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.Xpr, ezP.DelegateSvg)

ezP.DelegateSvg.Manager.register(ezP.Const.Xpr.DEFAULT, ezP.DelegateSvg.Xpr)

ezP.DelegateSvg.Xpr.prototype.shapePathDef_ =
  ezP.DelegateSvg.Xpr.prototype.contourPathDef_ =
    ezP.DelegateSvg.Xpr.prototype.highlightedPathDef_ =
      ezP.DelegateSvg.Xpr.prototype.valuePathDef_

/**
 * Render one input of value block.
 * @param io.
 * @private
 */
ezP.DelegateSvg.Xpr.prototype.renderDrawInput_ = function (io) {
  this.renderDrawDummyInput_(io) ||
    this.renderDrawValueInput_(io)
}

/**
 * Render the leading # character for collapsed statement blocks.
 * Statement subclasses must override it.
 * @param io.
 * @private
 */
ezP.DelegateSvg.Xpr.prototype.renderDrawSharp_ = function (io) {
  return
}

/**
 * Class for a DelegateSvg, key_datum_concrete block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Xpr.key_datum_concrete = function (prototypeName) {
  ezP.DelegateSvg.Xpr.key_datum_concrete.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.Xpr.key_datum_concrete, ezP.DelegateSvg.Xpr)

ezP.DelegateSvg.Manager.register(ezP.Const.Xpr.key_datum_concrete, ezP.DelegateSvg.Xpr.key_datum_concrete)

/**
 * Initialize the block.
 * Called by the block's init method.
 * For ezPython.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Xpr.key_datum_concrete.prototype.initBlock = function(block) {
  ezP.DelegateSvg.Xpr.key_datum_concrete.superClass_.initBlock.call(this, block)
  block.appendValueInput(ezP.Const.Input.KEY)
    .setCheck(ezP.T3.Require.expression)
  block.appendValueInput(ezP.Const.Input.DATUM)
    .setCheck(ezP.T3.Require.expression)
    .appendField(new ezP.FieldLabel(':'))
  block.setOutput(true, ezP.T3.key_datum_concrete)
}

/**
 * Class for a DelegateSvg, proper_slice block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Xpr.proper_slice = function (prototypeName) {
  ezP.DelegateSvg.Xpr.proper_slice.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.Xpr.proper_slice, ezP.DelegateSvg.Xpr)

ezP.DelegateSvg.Manager.register(ezP.Const.Xpr.proper_slice, ezP.DelegateSvg.Xpr.proper_slice)

/**
 * Initialize the block.
 * Called by the block's init method.
 * For ezPython.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Xpr.proper_slice.prototype.initBlock = function(block) {
  ezP.DelegateSvg.Xpr.Delimited.superClass_.initBlock.call(this, block)
  var input = block.appendValueInput(ezP.Const.Input.LOWER_BOUND)
    .setCheck(ezP.T3.Require.expression)
  // mark the connection as optional
  // it means that an unconnected placeholder is short
  input.connection.ezpData.optional_ = true
  input = block.appendValueInput(ezP.Const.Input.UPPER_BOUND)
    .setCheck(ezP.T3.Require.expression)
    .appendField(new ezP.FieldLabel(':'))
  input.connection.ezpData.optional_ = true
  this.inputSTRIDE = input = block.appendValueInput(ezP.Const.Input.STRIDE)
    .setCheck(ezP.T3.Require.expression)
    .appendField(new ezP.FieldLabel(':'))
  input.connection.ezpData.optional_ = true
  input.ezpData.disabled_ = true
  block.setOutput(true, ezP.T3.proper_slice)
}

ezP.USE_PROPER_SLICING_STRIDE_ID = 'USE_PROPER_SLICING_STRIDE'

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!goo.ui.Menu} menu The menu to populate.
 * @private
 */
ezP.DelegateSvg.Xpr.proper_slice.prototype.populateContextMenu_ = function (block, menu) {
  var unused = this.inputSTRIDE.ezpData.disabled_
  var menuItem = new ezP.MenuItem(
    unused? ezP.Msg.USE_PROPER_SLICING_STRIDE: ezP.Msg.UNUSE_PROPER_SLICING_STRIDE,
    [ezP.USE_PROPER_SLICING_STRIDE_ID])
  menuItem.setEnabled(!this.inputSTRIDE.connection.isConnected())
  menu.addChild(menuItem, true)
  menu.addChild(new ezP.Separator(), true)
  ezP.DelegateSvg.Xpr.proper_slice.superClass_.populateContextMenu_.call(this,block, menu)
}

/**
 * Handle the selection of an item in the context dropdown menu.
 * @param {!Blockly.Block} block, owner of the delegate.
 * @param {!goog.ui.Menu} menu The Menu clicked.
 * @param {!goog....} event The event containing as target
 * the MenuItem selected within menu.
 */
ezP.DelegateSvg.Xpr.proper_slice.prototype.onActionMenuEvent = function (block, menu, event) {
  var action = event.target.getModel()
  if (action == ezP.USE_PROPER_SLICING_STRIDE_ID) {
    var input = this.inputSTRIDE
    this.setInputDisabled(block, input.name, !input.ezpData.disabled_)
    return
  }
  ezP.DelegateSvg.Statement.Print.superClass_.onActionMenuEvent.call(this, block, menu, event)
  return
}





/**
 * Class for a DelegateSvg, quoted string value block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Xpr.Text = function (prototypeName) {
  ezP.DelegateSvg.Xpr.Text.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.Xpr.Text, ezP.DelegateSvg.Xpr)

/**
 * Render one input of value block.
 * Default implementation just renders a dummy input.
 * @param io.
 * @private
 */
ezP.DelegateSvg.Xpr.Text.prototype.renderDrawInput_ = function (io) {
  this.renderDrawDummyInput_(io)
}

ezP.DelegateSvg.Manager.register(ezP.Const.Xpr.TEXT, ezP.DelegateSvg.Xpr.Text)
ezP.DelegateSvg.Manager.register(ezP.Const.Xpr.ANY, ezP.DelegateSvg.Xpr.Text)

/**
 * Render one input of value block.
 * Default implementation just renders a dummy input.
 * @param io.
 * @private
 */
ezP.DelegateSvg.Xpr.Text.prototype.renderDrawInput_ = function (io) {
  this.renderDrawDummyInput_(io)
}

/**
 * Class for a DelegateSvg, one input value block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Xpr.Input = function (prototypeName) {
  ezP.DelegateSvg.Xpr.Input.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.Xpr.Input, ezP.DelegateSvg.Xpr)

ezP.DelegateSvg.Manager.register(ezP.Const.Xpr.MINUS, ezP.DelegateSvg.Xpr.Input)

/**
 * Class for a DelegateSvg, tuple value block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Xpr.Tuple = function (prototypeName) {
  ezP.DelegateSvg.Xpr.Tuple.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.Xpr.Tuple, ezP.DelegateSvg.Xpr)

ezP.DelegateSvg.Manager.register(ezP.Const.Xpr.TUPLE, ezP.DelegateSvg.Xpr.Tuple)

/**
 * Will render the block.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Xpr.Tuple.prototype.willRender_ = function (block) {
  ezP.DelegateSvg.Xpr.Tuple.superClass_.willRender_.call(this, block)
  this.tupleConsolidate(block)
}

/**
 * Render tuple inputs only.
 * @param io.
 * @private
 */
ezP.DelegateSvg.Xpr.Tuple.prototype.renderDrawInput_ = function (io) {
  this.renderDrawDummyInput_(io) ||
  this.renderDrawTupleInput_(io)
}

/**
 * Fetches the named input object, forwards to getInputTuple_.
 * @param {!Block} block.
 * @param {string} name The name of the input.
 * @return {Blockly.Input} The input object, or null if input does not exist or undefined for the default block implementation.
 */
ezP.DelegateSvg.Xpr.Tuple.prototype.getInput = function (block, name) {
  return this.getInputTuple_(block, name)
}

/**
 * Class for a DelegateSvg, tuple value block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Xpr.Range = function (prototypeName) {
  ezP.DelegateSvg.Xpr.Range.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.Xpr.Range, ezP.DelegateSvg.Xpr.Tuple)

ezP.DelegateSvg.Manager.register(ezP.Const.Xpr.RANGE, ezP.DelegateSvg.Xpr.Range)

/**
 * @param {!Block} block.
 * @param {Number} the group of tuples.
 * @return {Number} The max number of inputs. null for unlimited.
 * @private
 */
ezP.DelegateSvg.Xpr.Range.prototype.getInputTupleMax = function (block, grp) {
  return grp ? 0 : 3
}
