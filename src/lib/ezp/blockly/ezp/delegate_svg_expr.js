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

goog.provide('ezP.DelegateSvg.Expr')

goog.require('ezP.DelegateSvg')
goog.require('ezP.T3.All')

/**
 * Class for a DelegateSvg, value block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr = function (prototypeName) {
  ezP.DelegateSvg.Expr.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.Expr, ezP.DelegateSvg)

// Default delegate for all expression blocks
ezP.Delegate.Manager.registerAll(ezP.T3.Expr, ezP.DelegateSvg.Expr, true)

ezP.DelegateSvg.Expr.prototype.shapePathDef_ =
  ezP.DelegateSvg.Expr.prototype.contourPathDef_ =
    ezP.DelegateSvg.Expr.prototype.highlightedPathDef_ =
      ezP.DelegateSvg.Expr.prototype.valuePathDef_

/**
 * Render one input of value block.
 * @param io.
 * @private
 */
ezP.DelegateSvg.Expr.prototype.renderDrawInput_ = function (io) {
  this.renderDrawDummyInput_(io) ||
    this.renderDrawValueInput_(io)
}

/**
 * Render the leading # character for collapsed statement blocks.
 * Statement subclasses must override it.
 * @param io.
 * @private
 */
ezP.DelegateSvg.Expr.prototype.renderDrawSharp_ = function (io) {
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
ezP.DelegateSvg.Expr.key_datum_concrete = function (prototypeName) {
  ezP.DelegateSvg.Expr.key_datum_concrete.superClass_.constructor.call(this, prototypeName)
  this.outputCheck = ezP.T3.Expr.key_datum_concrete
  this.inputData = {
    first: {
      key: ezP.Const.Input.KEY,
      check: ezP.T3.Expr.Check.expression
    },
    last: {
      key: ezP.Const.Input.DATUM,
      check: ezP.T3.Expr.Check.expression,
      label: ':'
    }
  }
}
goog.inherits(ezP.DelegateSvg.Expr.key_datum_concrete, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Manager.register('key_datum_concrete')


/**
 * Class for a DelegateSvg, proper_slice block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.proper_slice = function (prototypeName) {
  ezP.DelegateSvg.Expr.proper_slice.superClass_.constructor.call(this, prototypeName)
  this.outputCheck = ezP.T3.Expr.proper_slice
  this.inputData = {
    first: {
      key: ezP.Const.Input.LOWER_BOUND,
      check: ezP.T3.Expr.Check.expression,
      optional: true
    },
    middle: {
      label: ':',
      key: ezP.Const.Input.UPPER_BOUND,
      check: ezP.T3.Expr.Check.expression,
      optional: true
    },
    last: {
      label: ':',
      key: ezP.Const.Input.STRIDE,
      check: ezP.T3.Expr.Check.expression,
      optional: true
    }
  }
}
goog.inherits(ezP.DelegateSvg.Expr.proper_slice, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Manager.register('proper_slice')

ezP.USE_PROPER_SLICING_STRIDE_ID = 'USE_PROPER_SLICING_STRIDE'

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!goo.ui.Menu} menu The menu to populate.
 * @private
 */
ezP.DelegateSvg.Expr.proper_slice.prototype.populateContextMenuFirst_ = function (block, menu) {
  var last = this.inputs.last.input
  var unused = last.ezpData.disabled_
  var menuItem = new ezP.MenuItem(
    unused? ezP.Msg.USE_PROPER_SLICING_STRIDE: ezP.Msg.UNUSE_PROPER_SLICING_STRIDE,
    [ezP.USE_PROPER_SLICING_STRIDE_ID])
  menuItem.setEnabled(!last.connection.isConnected())
  menu.addChild(menuItem, true)
  menu.addChild(new ezP.Separator(), true)
  ezP.DelegateSvg.Expr.proper_slice.superClass_.populateContextMenuFirst_.call(this,block, menu)
  return true
}

/**
 * Handle the selection of an item in the context dropdown menu.
 * @param {!Blockly.Block} block, owner of the delegate.
 * @param {!goog.ui.Menu} menu The Menu clicked.
 * @param {!goog....} event The event containing as target
 * the MenuItem selected within menu.
 */
ezP.DelegateSvg.Expr.proper_slice.prototype.handleActionMenuEventFirst = function (block, menu, event) {
  var action = event.target.getModel()
  if (action == ezP.USE_PROPER_SLICING_STRIDE_ID) {
    var input = this.inputs.last.input
    this.setNamedInputDisabled(block, input.name, !input.ezpData.disabled_)
    return true
  }
  return ezP.DelegateSvg.Expr.proper_slice.superClass_.handleActionMenuEventFirst.call(this, block, menu, event)
}

/**
 * Class for a DelegateSvg, conditional_expression_concrete block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.conditional_expression_concrete = function (prototypeName) {
  ezP.DelegateSvg.Expr.conditional_expression_concrete.superClass_.constructor.call(this, prototypeName)
  this.outputCheck = ezP.T3.Expr.conditional_expression_concrete
  this.inputData = {
    first: {
      key: ezP.Const.Input.EXPR,
      check: ezP.T3.Expr.Check.or_test
    },
    middle: {
      label: 'if',
      key: ezP.Const.Input.IF,
      check: ezP.T3.Expr.Check.or_test
    },
    last: {
      label: 'else',
      key: ezP.Const.Input.ELSE,
      check: ezP.T3.Expr.Check.expression
    }
  }
}
goog.inherits(ezP.DelegateSvg.Expr.conditional_expression_concrete, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Manager.register('conditional_expression_concrete')
