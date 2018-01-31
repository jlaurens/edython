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

goog.provide('ezP.DelegateSvg.ContextMenu')
goog.require('ezP.DelegateSvg')

/**
 * The block that handles the context menu is not always the one
 * which has received the messages.
 * The default handler is the block itself.
 * For wrapper blocks, the handler may be the wrapped block.
 * @param {!Blockly.Block} block The block.
 * @private
 */
ezP.DelegateSvg.prototype.getContextMenuHandler = function (block) {
  return block
}

/**
 * Show the context menu for the given block.
 * Only blocks with a svgShape_ have a context menu.
 * Wrapped blocks won't have a context menu,
 * only the parent block will have.
 * @param {!Blockly.Block} block The block.
 * @param {!Event} e Mouse event.
 * @private
 */
ezP.DelegateSvg.prototype.showContextMenu_ = function (block, e) {
  if (this.svgPathShape_) {
    var handler = this.getContextMenuHandler(block)
    handler.ezp.showContextMenu__(handler, e)
  }
}

ezP.DelegateSvg.sharedContextMenu_ = new ezP.PopupMenu(/*undefined, ContextMenuRenderer*/)

/**
 * Get the fresh context menu for the given block.
 * This is a shared PopupMenu instance with no items.
 * @param {!Blockly.Block} block The block.
 * @private
 */
ezP.DelegateSvg.prototype.getFreshContextMenu_ = function (block, e) {
  if (!ezP.DelegateSvg.sharedContextMenu_.inDocument_) {
    ezP.DelegateSvg.sharedContextMenu_.render()
  }
  ezP.DelegateSvg.sharedContextMenu_.removeChildren(true)
  return ezP.DelegateSvg.sharedContextMenu_
}

/**
 * Show the context menu for the given block.
 * This is not for subclassers.
 * @param {!Blockly.Block} block The block.
 * @param {!Event} e Mouse event.
 * @private
 */
ezP.DelegateSvg.prototype.showContextMenu__ = function (block, e) {
  var menu = this.getFreshContextMenu_()
  this.populateContextMenu_(block, menu)
  var bBox = this.svgPathShape_.getBBox()
  var scaledHeight = bBox.height * block.workspace.scale
  var xy = goog.style.getPageOffset(block.svgGroup_)
  menu.showMenu(block.svgGroup_, xy.x, xy.y + scaledHeight+2)
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!goo.ui.Menu} menu The menu to populate.
 * @private
 */
ezP.DelegateSvg.prototype.populateContextMenu_ = function (block, menu) {
  if (this.populateContextMenuFirst_(block, menu)) {
    menu.addChild(new ezP.Separator(), true)
  }
  if (this.populateContextMenuMiddle_(block, menu)) {
    menu.addChild(new ezP.Separator(), true)
  }
  this.populateContextMenuLast_(block, menu)

  goog.events.listenOnce(menu, 'action', function (event) {
    setTimeout(function () {
      block.ezp.onActionMenuEvent(block, menu, event)
    }, 100)// TODO be sure that this 100 is suffisant
  })
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!goo.ui.Menu} menu The menu to populate.
 * @private
 */
ezP.DelegateSvg.prototype.populateContextMenuFirst_ = function (block, menu) {
  var target = this.getWrappedTargetBlock(block)
  if (target) {
    return target.ezp.populateContextMenuFirst_(target, menu)
  }
  return false
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!goo.ui.Menu} menu The menu to populate.
 * @private
 */
ezP.DelegateSvg.prototype.populateContextMenuMiddle_ = function (block, menu) {
  var target = this.getWrappedTargetBlock(block)
  if (target) {
    return target.ezp.populateContextMenuMiddle_(target, menu)
  }
  return false
}

ezP.DUPLICATE_BLOCK_ID = 'DUPLICATE_BLOCK'
ezP.REMOVE_COMMENT_ID = 'REMOVE_COMMENT'
ezP.ADD_COMMENT_ID = 'ADD_COMMENT'
ezP.EXPAND_BLOCK_ID = 'EXPAND_BLOCK'
ezP.COLLAPSE_BLOCK_ID = 'COLLAPSE_BLOCK'
ezP.TOGGLE_ENABLE_BLOCK_ID = 'TOGGLE_ENABLE_BLOCK'
ezP.DELETE_BLOCK_ID = 'DELETE_BLOCK'
ezP.HELP_ID = 'HELP'
ezP.LOG_BLOCK_XML_ID = 'LOG_BLOCK_XML'

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!goo.ui.Menu} menu The menu to populate.
 * @private
 */
ezP.DelegateSvg.prototype.populateContextMenuLast_ = function (block, menu) {
  var target = this.getWrappedTargetBlock(block)
  if (target) {
    target.ezp.populateContextMenuLast_(target, menu)
    return
}
  var menuItem
  if (block.isDeletable() && block.isMovable() && !block.isInFlyout) {
    // Option to duplicate this block.
    menuItem = new ezP.MenuItem(
      Blockly.Msg.DUPLICATE_BLOCK,
      [ezP.DUPLICATE_BLOCK_ID])
    menu.addChild(menuItem, true)
    if (block.getDescendants().length > block.workspace.remainingCapacity()) {
      menuItem.setEnabled(false);
    }
  }
  if (block.isEditable() && !block.collapsed_ &&
    block.workspace.options.comments) {
    // Option to add/remove a comment.
    if (block.comment) {
      menuItem = new ezP.MenuItem(
        Blockly.Msg.REMOVE_COMMENT,
        [ezP.REMOVE_COMMENT_ID])
    } else {
      menuItem = new ezP.MenuItem(
        Blockly.Msg.ADD_COMMENT,
        [ezP.ADD_COMMENT_ID])
    }
    menuItem.setEnabled(false && !goog.userAgent.IE && !block.outputConnection)
    menu.addChild(menuItem, true)
  }
  if (block.workspace.options.collapse) {
    if (block.collapsed_) {
      menuItem = new ezP.MenuItem(
        Blockly.Msg.EXPAND_BLOCK,
        [ezP.EXPAND_BLOCK_ID])
      menuItem.setEnabled(true)
    } else {
      menuItem = new ezP.MenuItem(
        Blockly.Msg.COLLAPSE_BLOCK,
        [ezP.COLLAPSE_BLOCK_ID])
      menuItem.setEnabled(block.getStatementCount() > 2)
    }
    menu.addChild(menuItem, true)
  }
  if (block.workspace.options.disable) {
    menuItem = new ezP.MenuItem(
      block.disabled
        ? Blockly.Msg.ENABLE_BLOCK : Blockly.Msg.DISABLE_BLOCK,
      [ezP.TOGGLE_ENABLE_BLOCK_ID])
    menuItem.setEnabled(!block.outputConnection)
    menu.addChild(menuItem, true)
  }
  if (block.isDeletable() && block.isMovable() && !block.isInFlyout) {
    // Count the number of blocks that are nested in this block.
    var unwrapped = block
    var parent = undefined
    while (unwrapped.ezp.wrapped_ && (parent = unwrapped.getParent())) {
      // parent is not '', it may be undefined
      unwrapped = parent
      // replace the parent test with an assertion
    }
    // unwrapped is the topmost block or the first unwrapped parent
    var descendantCount = unwrapped.ezp.getUnsealedDescendants(unwrapped).length
    if (parent === null) {
      // the topmost is itself sealed, this should not occur
      ++descendantCount
    }
    var nextBlock = unwrapped.getNextBlock()
    if (nextBlock) {
      // Blocks in the current stack would survive this block's deletion.
      descendantCount -= nextBlock.ezp.getUnsealedDescendants(nextBlock).length
    }
    menuItem = new ezP.MenuItem(
      descendantCount === 1 ? Blockly.Msg.DELETE_BLOCK
        : Blockly.Msg.DELETE_X_BLOCKS.replace('%1', String(descendantCount)),
      [ezP.DELETE_BLOCK_ID])
    menuItem.setEnabled(true)
    menu.addChild(menuItem, true)
  }
  // help
  var url = goog.isFunction(block.helpUrl) ? block.helpUrl() : block.helpUrl
  menuItem = new ezP.MenuItem(
    Blockly.Msg.HELP,
    [ezP.HELP_ID])
  menuItem.setEnabled(!!url)
  menu.addChild(menuItem, true)
  menu.addChild(new ezP.Separator(), true)
  
  menuItem = new ezP.MenuItem(
    this.getPythonType(block),
    [ezP.LOG_BLOCK_XML_ID])
  menuItem.setEnabled(true)
  menu.addChild(menuItem, true)
}

/**
 * Returns the python type of the block.
 * This information may be displayed as the last item in the contextual menu.
 * Wrapped blocks will return the parent's answer.
 * @param {!Blockly.Block} block The block.
 */
ezP.DelegateSvg.prototype.getPythonType = function (block) {
  if (this.wrapped_) {
    var parent = block.getParent()
    return parent.ezp.getPythonType(parent)
  }
  return this.pythonType_
}

/**
 * Handle the selection of an item in the context dropdown menu.
 * @param {!goog.ui.Menu} menu The Menu component clicked.
 * @param {!Blockly.Block} block The Menu component clicked.
 * @param {!goog....} event The event containing as target
 * @param {Boolean} wrapped, whether block is wrapped in its parent.
 */
ezP.DelegateSvg.prototype.onActionMenuEvent = function (block, menu, event, wrapped) {
  var target = this.getWrappedTargetBlock(block)
  if (target && target.ezp.onActionMenuEvent(target, menu, event, true)) {
    return true
  }
  var model = event.target.getModel()
  var action = model[0]
  if (this.handleActionMenuEventFirst(block, menu, event)
  || this.handleActionMenuEventMiddle(block, menu, event)
  || this.handleActionMenuEventLast(block, menu, event)) {
    return true
  }
  if(!wrapped) {
    console.log('Unknown action ', action, block.type)
  }
  return false
}

/**
 * Handle the selection of an item in the first part of the context dropdown menu.
 * Default implementation returns false.
 * @param {!goog.ui.Menu} menu The Menu component clicked.
 * @param {!Blockly.Block} block The Menu component clicked.
 * @param {!goog....} event The event containing as target
 * the MenuItem selected within menu.
 */
ezP.DelegateSvg.prototype.handleActionMenuEventFirst = function (block, menu, event) {
  return false
}

/**
 * Handle the selection of an item in the middle part of the context dropdown menu.
 * Default implementation returns false.
 * @param {!goog.ui.Menu} menu The Menu component clicked.
 * @param {!Blockly.Block} block The Menu component clicked.
 * @param {!goog....} event The event containing as target
 * the MenuItem selected within menu.
 */
ezP.DelegateSvg.prototype.handleActionMenuEventMiddle = function (block, menu, event) {
  return false
}

/**
 * Handle the selection of an item in the context dropdown menu.
 * Default implementation mimics Blockly behaviour.
 * Unlikely to be overriden.
 * @param {!goog.ui.Menu} menu The Menu component clicked.
 * @param {!Blockly.Block} block The Menu component clicked.
 * @param {!goog....} event The event containing as target
 * the MenuItem selected within menu.
 */
ezP.DelegateSvg.prototype.handleActionMenuEventLast = function (block, menu, event) {
  var workspace = block.workspace
  var model = event.target.getModel()
  var action = model[0]
  switch(action) {
    case ezP.DUPLICATE_BLOCK_ID:
      Blockly.duplicate_(block);
      return true
    case ezP.REMOVE_COMMENT_ID:
    block.setCommentText(null)
      return true
    case ezP.ADD_COMMENT_ID:
      block.setCommentText('')
      return true
    case ezP.EXPAND_BLOCK_ID:
      block.setCollapsed(false)
      return true
    case ezP.COLLAPSE_BLOCK_ID:
      block.setCollapsed(true)
      return true
      case ezP.TOGGLE_ENABLE_BLOCK_ID:
      block.setDisabled(!block.disabled)  
      return true
      case ezP.DELETE_BLOCK_ID:
      var unwrapped = block
      var parent
      while (unwrapped.ezp.wrapped_ && (parent = unwrapped.getParent())) {
        unwrapped = parent
      }
      // unwrapped is the topmost block or the first unwrapped parent
      Blockly.Events.setGroup(true)
      unwrapped.dispose(true, true)
      Blockly.Events.setGroup(false)
      return true
    case ezP.HELP_ID:
      block.showHelp_()
      return true
    case ezP.LOG_BLOCK_XML_ID:
      var xmlDom = Blockly.Xml.blockToDom(block);
      var xmlText = Blockly.Xml.domToText(xmlDom)
      console.log(xmlText)
      return true
  }
}
