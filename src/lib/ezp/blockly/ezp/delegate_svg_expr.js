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
 * Can remove and bypass the parent?
 * If the parent's output connection is connected,
 * can connect the block's output connection to it?
 * The connection cannot always establish.
 * @param {!Block} block.
 */
ezP.DelegateSvg.Expr.prototype.canBypassAndRemoveParent = function (block) {
  var parent = block.outputConnection.targetBlock()
  if (parent) {
    var c8n = parent.outputConnection
    if (!c8n) {
      return true
    }
    c8n = c8n.targetConnection
    if (!c8n || c8n.checkType_(block.outputConnection)) {
      // the parent block has an output connection that can connect to the block's one
      return true
    }
  }
  return false
}

/**
 * Remove and bypass the parent.
 * If the parent's output connection is connected,
 * connects the block's output connection to it.
 * The connection cannot always establish.
 * @param {!Block} block.
 */
ezP.DelegateSvg.Expr.prototype.bypassAndRemoveParent = function (block) {
  var parent = block.outputConnection.targetBlock()
  if (parent) {
    Blockly.Events.setGroup(true)
    var c8n = parent.outputConnection
    var its_xy = parent.getRelativeToSurfaceXY();
    var my_xy = block.getRelativeToSurfaceXY();
    block.outputConnection.disconnect()
    if (c8n && (c8n = c8n.targetConnection) && c8n.checkType_(block.outputConnection)) {
      // the parent block has an output connection that can connect to the block's one
      c8n.disconnect()
      c8n.connect(block.outputConnection)
    } else {
      block.moveBy(its_xy.x-my_xy.x, its_xy.y-my_xy.y)    
    }
    parent.dispose()
    Blockly.Events.setGroup(false)
  }
}

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
  this.inputData_ = {
    first: {
      key: ezP.Const.Input.LOWER_BOUND,
      check: ezP.T3.Expr.Check.expression,
      optional: true,
      hole_value: 'lower',
    },
    middle: {
      label: ':',
      key: ezP.Const.Input.UPPER_BOUND,
      check: ezP.T3.Expr.Check.expression,
      optional: true,
      hole_value: 'upper',
    },
    last: {
      label: ':',
      key: ezP.Const.Input.STRIDE,
      check: ezP.T3.Expr.Check.expression,
      optional: true,
      hole_value: 'stride',
    }
  }
}
goog.inherits(ezP.DelegateSvg.Expr.proper_slice, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Manager.register('proper_slice')

ezP.ID.TOGGLE_PROPER_SLICING_STRIDE = 'USE_PROPER_SLICING_STRIDE'

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Expr.proper_slice.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var menu = mgr.menu
  var last = this.inputs.last.input
  var unused = last.ezpData.disabled_
  var menuItem = new ezP.MenuItem(
    unused? ezP.Msg.USE_PROPER_SLICING_STRIDE: ezP.Msg.UNUSE_PROPER_SLICING_STRIDE,
    {action: ezP.ID.TOGGLE_PROPER_SLICING_STRIDE})
  menuItem.setEnabled(!last.connection.isConnected())
  menu.addChild(menuItem, true)
  menu.separate()
  ezP.DelegateSvg.Expr.proper_slice.superClass_.populateContextMenuFirst_.call(this,block, mgr)
  return true
}

/**
 * Handle the selection of an item in the context dropdown menu.
 * @param {!Blockly.Block} block, owner of the delegate.
 * @param {!goog.ui.Menu} menu The Menu clicked.
 * @param {!goog....} event The event containing as target
 * the MenuItem selected within menu.
 */
ezP.DelegateSvg.Expr.proper_slice.prototype.handleMenuItemActionFirst = function (block, mgr, event) {
  var action = event.target.getModel().action
  if (action == ezP.ID.TOGGLE_PROPER_SLICING_STRIDE) {
    var input = this.inputs.last.input
    this.setNamedInputDisabled(block, input.name, !input.ezpData.disabled_)
    return true
  }
  return ezP.DelegateSvg.Expr.proper_slice.superClass_.handleMenuItemActionFirst.call(this, block, mgr, event)
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
  this.inputData_ = {
    first: {
      key: ezP.Const.Input.EXPR,
      check: ezP.T3.Expr.Check.or_test,
      hole_value: 'name',
    },
    middle: {
      label: 'if',
      key: ezP.Const.Input.IF,
      css_class: 'ezp-code-reserved',
      check: ezP.T3.Expr.Check.or_test,
    },
    last: {
      label: 'else',
      key: ezP.Const.Input.ELSE,
      css_class: 'ezp-code-reserved',
      check: ezP.T3.Expr.Check.expression,
      hole_value: 'alternate',
    }
  }
}
goog.inherits(ezP.DelegateSvg.Expr.conditional_expression_concrete, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Manager.register('conditional_expression_concrete')
