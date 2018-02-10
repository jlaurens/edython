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

goog.provide('ezP.DelegateSvg.Primary')

goog.require('ezP.DelegateSvg.ContextMenu')
goog.require('ezP.DelegateSvg.Expr')

/**
 * Class for a DelegateSvg, attributeref.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Primary = function (prototypeName) {
  ezP.DelegateSvg.Primary.superClass_.constructor.call(this, prototypeName)
  this.inputData.first = {
    key: ezP.Const.Input.PRIMARY,
    check: ezP.T3.Expr.Check.primary
  }
}
goog.inherits(ezP.DelegateSvg.Primary, ezP.DelegateSvg.Expr)

/**
 * The primary connection if any.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.prototype.getPrimaryConnection = function (block) {
  return undefined
}

/**
 * The primary connection if any.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Primary.prototype.getPrimaryConnection = function (block) {
  // var input = block.getInput(ezP.Const.Input.PRIMARY)
  return this.inputs.first.input.connection
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
  this.inputData.last = {
    key: ezP.Const.Input.SECONDARY,
    check: ezP.T3.Expr.dotted_identifier,
    wrap: ezP.T3.Expr.dotted_identifier
  }
  this.outputCheck = ezP.T3.Expr.attributeref 
}
goog.inherits(ezP.DelegateSvg.Expr.attributeref, ezP.DelegateSvg.Primary)
ezP.DelegateSvg.Manager.register('attributeref')

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
  this.inputData.last = {
    key: ezP.Const.Input.SLICE,
    check: ezP.T3.Expr.display_slice_list,
    wrap: ezP.T3.Expr.display_slice_list
  }
  this.outputCheck = ezP.T3.Expr.slicing
}
goog.inherits(ezP.DelegateSvg.Expr.slicing, ezP.DelegateSvg.Primary)
ezP.DelegateSvg.Manager.register('slicing')

/**
 * Class for a DelegateSvg, call block.
 * As call is already a reserved message in javascript,
 * we use call_expr instead.
 * Due to the ambibuity, it is implemented only once for both.
 * Slicing is richer.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.call_expr =  function (prototypeName) {
  ezP.DelegateSvg.Expr.call_expr.superClass_.constructor.call(this, prototypeName)
  this.inputData.last = {
    key: ezP.Const.Input.ARGS,
    label: '(',
    check: ezP.T3.Expr.argument_list,
    wrap: ezP.T3.Expr.argument_list
  }
  this.labelEnd.value = ')'
  this.outputCheck = ezP.T3.Expr.call_expr
}
goog.inherits(ezP.DelegateSvg.Expr.call_expr, ezP.DelegateSvg.Primary)
ezP.DelegateSvg.Manager.register('call_expr')

ezP.ADD_PRIMARY_ATTRIBUTE_ID = 'ADD_PRIMARY_ATTRIBUTE'
ezP.REMOVE_PRIMARY_ATTRIBUTE_ID = 'REMOVE_PRIMARY_ATTRIBUTE'
ezP.ADD_PRIMARY_SLICING_ID = 'ADD_PRIMARY_SLICING'
ezP.REMOVE_PRIMARY_SLICING_ID = 'REMOVE_PRIMARY_SLICING'
ezP.ADD_PRIMARY_CALL_ID = 'ADD_PRIMARY_CALL'
ezP.REMOVE_PRIMARY_CALL_ID = 'REMOVE_PRIMARY_CALL'

/**
 * Populate the context menu for the given block.
 * The primary part concerns only primary expression blocks.
 * See the primary delegate for the details.
 * @param {!Blockly.Block} block The block.
 * @param {!goo.ui.Menu} menu The menu to populate.
 * @private
 */
ezP.DelegateSvg.Expr.prototype.populateContextMenuPrimary_ = function (block, menu) {
  if (ezP.T3.Expr.Check.primary.indexOf(this.type_)>=0) {
    var more_blocks = block.getDescendants().length < block.workspace.remainingCapacity() // can I add an attributeref
    var subMenu = new ezP.SubMenu(ezP.Msg.ADD)
    var menuItem = new ezP.MenuItemVar(
      ezP.Msg.ADD_PRIMARY_ATTRIBUTE,
      [ezP.ADD_PRIMARY_ATTRIBUTE_ID])
    subMenu.addItem(menuItem)
    menuItem.setEnabled(more_blocks)
    menuItem = new ezP.MenuItemVar(
      ezP.Msg.ADD_PRIMARY_SLICING,
      [ezP.ADD_PRIMARY_SLICING_ID])
    subMenu.addItem(menuItem)
    menuItem.setEnabled(more_blocks)
    menuItem = new ezP.MenuItemVar(
      ezP.Msg.ADD_PRIMARY_CALL,
      [ezP.ADD_PRIMARY_CALL_ID])
    subMenu.addItem(menuItem)
    menuItem.setEnabled(more_blocks)
    menu.addChild(subMenu, true)

    var parent = block.getParent();
    if (parent) {
      var c8n = parent.ezp.getPrimaryConnection(parent)
      if (c8n && c8n.targetBlock() == block) {
        var c8n = parent.outputConnection
        if (c8n) {
          var targetC8n = c8n.targetConnection
          if (!targetC8n || targetC8n.checkType_(block.outputConnection)) {
            if (parent.type == ezP.T3.Expr.attributeref) {
              menuItem = new ezP.MenuItem(
                ezP.Msg.REMOVE_PRIMARY_ATTRIBUTE,
                [ezP.REMOVE_PRIMARY_ATTRIBUTE_ID])
              menu.addChild(menuItem, true)
              menuItem.setEnabled(true)
            }
            if (parent.type == ezP.T3.Expr.slicing) {
              menuItem = new ezP.MenuItem(
                ezP.Msg.REMOVE_PRIMARY_SLICING,
                [ezP.REMOVE_PRIMARY_SLICING_ID])
              menu.addChild(menuItem, true)
              menuItem.setEnabled(true)
            }
            if (parent.type == ezP.T3.Expr.call_expr) {
              menuItem = new ezP.MenuItem(
                ezP.Msg.REMOVE_PRIMARY_CALL,
                [ezP.REMOVE_PRIMARY_CALL_ID])
              menu.addChild(menuItem, true)
              menuItem.setEnabled(true)
            }
          }
        }
      }
    }
    return true
  }
  return false
}

/**
 * Handle the selection of an item in the primary part of the context dropdown menu.
 * Default implementation returns false.
 * @param {!goog.ui.Menu} menu The Menu component clicked.
 * @param {!Blockly.Block} block The Menu component clicked.
 * @param {!goog....} event The event containing as target
 * the MenuItem selected within menu.
 */
ezP.DelegateSvg.Expr.prototype.handleActionMenuEventPrimary = function (block, menu, event) {
  var workspace = block.workspace
  var model = event.target.getModel()
  var action = model[0]
  var makeNewBlock = function(prototypeName) {
    Blockly.Events.setGroup(true)
    var B = ezP.DelegateSvg.newBlockComplete(block.workspace, prototypeName)
    var xy = block.getRelativeToSurfaceXY();
    B.moveBy(xy.x, xy.y)
    var targetC8n = block.outputConnection.targetConnection
    if (targetC8n) {
      block.outputConnection.disconnect()
      targetC8n.connect(B.outputConnection)
    }
    B.ezp.getPrimaryConnection().connect(block.outputConnection)
    B.render()
    Blockly.Events.setGroup(false)

    /*
            var blockX = parseInt(xmlChild.getAttribute('x'), 10);
        var blockY = parseInt(xmlChild.getAttribute('y'), 10);
        if (!isNaN(blockX) && !isNaN(blockY)) {
          block.moveBy(workspace.RTL ? width - blockX : blockX, blockY);
        }
var xy = block.getRelativeToSurfaceXY();
  element.setAttribute('x',
      Math.round(block.workspace.RTL ? width - xy.x : xy.x));
  
    */

  }
  var newBlock
  switch(action) {
    case ezP.REMOVE_PRIMARY_ATTRIBUTE_ID:
    case ezP.REMOVE_PRIMARY_SLICING_ID:
    case ezP.REMOVE_PRIMARY_CALL_ID:
      var parent = block.outputConnection.targetBlock()
      if (parent) {
        Blockly.Events.setGroup(true)
        var c8n = parent.outputConnection
        var its_xy = parent.getRelativeToSurfaceXY();
        var my_xy = block.getRelativeToSurfaceXY();
        if (c8n) {
          var targetC8n = c8n.targetConnection
          if (targetC8n) {
            if (targetC8n.checkType_(block.outputConnection)) {
              // The parent block is connected
              // and the target connection is compatible with the block
              c8n.disconnect()
              block.outputConnection.disconnect()
              parent.dispose()
              targetC8n.connect(block.outputConnection)
            } else {
              // logically unreachable code
              goog.asserts.assert(false, 'Unreachable code...')
            }
          } else {
            // no problem with an outer connection
            block.outputConnection.disconnect()
            parent.dispose()
            block.moveBy(its_xy.x-my_xy.x, its_xy.y-my_xy.y)    
          }
        } else {
          block.outputConnection.disconnect()
          parent.dispose()
          block.moveBy(xy.x, xy.y)    
        }
        Blockly.Events.setGroup(false)
      }
      return true
    case ezP.ADD_PRIMARY_ATTRIBUTE_ID:
      makeNewBlock(ezP.T3.Expr.attributeref)
      return true
    case ezP.ADD_PRIMARY_SLICING_ID:
      makeNewBlock(ezP.T3.Expr.slicing)
      return true
    case ezP.ADD_PRIMARY_CALL_ID:
      makeNewBlock(ezP.T3.Expr.call_expr)
      return true
  }
  return false
}
