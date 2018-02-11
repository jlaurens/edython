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

goog.provide('ezP.ContextMenuManager')
goog.require('ezP.DelegateSvg')
goog.require('ezP.MenuItem')

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
 * Shared context menu manager.
 * One shared menu.
 */
ezP.ContextMenuManager = function () {
  this.menu = new ezP.PopupMenu(/*undefined, ContextMenuRenderer*/)
}

ezP.ContextMenuManager.shared = function() {
  var out = undefined
  return function() {
    return out ? out: (out = new ezP.ContextMenuManager())
  }
} ()

/**
 * Get the menu, in case clients may want to populate it directly.
 * Each manager has its own menu.
 */
ezP.ContextMenuManager.prototype.menu = undefined

/**
 * Add a separator.
 */
ezP.ContextMenuManager.prototype.separate = function () {
  this.menu.addChild(new ezP.Separator(), true)
}

/**
 * Records the block and the event.
 * Removes all the previous menu items.
 * @param {!Blockly.Block} block The block.
 * @param {!Event} e Mouse event.
 * @private
 */
ezP.ContextMenuManager.prototype.init = function (block, e) {
  if (!this.menu.inDocument_) {
    this.menu.render()
  }
  this.menu.removeChildren(true)
  this.e = e
}

/**
 * Show the context menu for the given block.
 * This is not for subclassers.
 * @param {!Blockly.Block} block The block.
 * @param {!Event} e Mouse event.
 * @private
 */
ezP.ContextMenuManager.prototype.showMenu = function (block, e) {
  this.init(block, e)
  var target = block && block.ezp.getWrappedTargetBlock(block) || block
  target.ezp.populateContextMenuFirst_(target, this) && this.separate()
  target.ezp.populateContextMenuMiddle_(target, this) && this.separate()
  target.ezp.populateContextMenuPrimary_(target, this) && this.separate()
  target.ezp.populateContextMenuLast_(target, this)
  var me = this
  goog.events.listenOnce(this.menu, 'action', function (event) {
    setTimeout(function () {// try/finally?
      target.ezp.handleMenuItemActionFirst(target, me, event)
          || target.ezp.handleMenuItemActionMiddle(target, me, event)
          || target.ezp.handleMenuItemActionPrimary(target, me, event)
          || target.ezp.handleMenuItemActionLast(target, me, event)
      me.init()
    }, 100)// TODO be sure that this 100 is suffisant
  })
  var bBox = block.ezp.svgPathShape_.getBBox()
  var scaledHeight = bBox.height * block.workspace.scale
  var xy = goog.style.getPageOffset(block.svgGroup_)
  this.menu.showMenu(block.svgGroup_, xy.x, xy.y + scaledHeight+2)
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
 * @param {!ezP.ContextMenuManager} mgr The context menu manager.
 * @private
 */
ezP.Delegate.prototype.populateContextMenuFirst_ = function (block, mgr) {
  return false
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.ContextMenuManager} mgr The context menu manager.
 * @private
 */
ezP.Delegate.prototype.populateContextMenuMiddle_ = function (block, mgr) {
  return false
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.ContextMenuManager} mgr The context menu manager.
 * @private
 */
ezP.Delegate.prototype.populateContextMenuPrimary_ = function (block, mgr) {
  return false
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.ContextMenuManager} mgr The context menu manager.
 * @private
 */
ezP.Delegate.prototype.populateContextMenuLast_ = function (block, mgr) {
  return mgr.populateLast(block)
}

/**
 * Populate the context menu.
 */
ezP.ContextMenuManager.prototype.populateLast = function (block) {
  var menu = this.menu
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
    block.ezp.getPythonType(block),
    [ezP.LOG_BLOCK_XML_ID])
  menuItem.setEnabled(true)
  menu.addChild(menuItem, true)
}

/**
 * Handle the selection of an item in the context dropdown menu.
 * Intended to be overriden.
 * @param {!Blockly.Block} block
 * @param {!ezP.ContextMenuManager} mgr
 * @param {!goog....} event The event containing as target
 */
ezP.DelegateSvg.prototype.handleMenuItemActionFirst = function (block, mgr, event) {
  false
}

/**
 * Handle the selection of an item in the context dropdown menu.
 * Intended to be overriden.
 * @param {!Blockly.Block} block
 * @param {!ezP.ContextMenuManager} mgr
 * @param {!goog....} event The event containing as target
 */
ezP.DelegateSvg.prototype.handleMenuItemActionMiddle = function (block, mgr, event) {
  false
}

/**
 * Handle the selection of an item in the context dropdown menu.
 * Intended to be overriden.
 * @param {!Blockly.Block} block
 * @param {!ezP.ContextMenuManager} mgr
 * @param {!goog....} event The event containing as target
 */
ezP.DelegateSvg.prototype.handleMenuItemActionPrimary = function (block, mgr, event) {
  return false
}

/**
 * Handle the selection of an item in the context dropdown menu.
 * Intended to be overriden.
 * @param {!Blockly.Block} block
 * @param {!ezP.ContextMenuManager} mgr
 * @param {!goog....} event The event containing as target
 */
ezP.DelegateSvg.prototype.handleMenuItemActionLast = function (block, mgr, event) {
  return mgr.handleActionLast(block, event)
}

/**
 * Handle the selection of an item in the context dropdown menu.
 * Default implementation mimics Blockly behaviour.
 * Unlikely to be overriden.
 * @param {!goog....} event The event containing as target
 * the MenuItem selected within menu.
 */
ezP.ContextMenuManager.prototype.handleActionLast = function (block, event) {
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

ezP.PARENT_BYPASS_AND_REMOVE_ID = 'PARENT_BYPASS_AND_REMOVE'

/**
 * Populate the context menu for the given block.
 * The primary part concerns only primary expression blocks.
 * See the primary delegate for the details.
 * @param {!Blockly.Block} block The block.
 * @param {!goo.ui.Menu} menu The menu to populate.
 * @private
 */
ezP.ContextMenuManager.prototype.populatePrimary_ = function (block, in_menu) {
  var menu = this.menu
  var ezp = block.ezp
  if (ezP.T3.Expr.Check.primary.indexOf(block.type)>=0) {
    // block is a possible primary
    // is it possible to add an attributeref, 
    var more_blocks = block.getDescendants().length < block.workspace.remainingCapacity()
    // can I add an attributeref, a call or a slicing ?
    // We do not assume that only one of them stands for both
    var un_attributeref, un_slicing, un_call_expr
    var can_attributeref = ezp.canInsertParent(block, ezP.T3.Expr.attributeref, ezP.Const.Input.PRIMARY)
    var can_slicing = ezp.canInsertParent(block, ezP.T3.Expr.slicing, ezP.Const.Input.PRIMARY)
    var can_call_expr = ezp.canInsertParent(block, ezP.T3.Expr.call_expr, ezP.Const.Input.PRIMARY)
    if (ezp.canBypassAndRemoveParent(block)) {
      // block is the 'primary' of target
      // then we can add both attributeref, slicing or call_expr
      // all of them are acceptable according to python grammar.
      // But we prefer to tmake explicit testing
      if (target.type === ezP.T3.Expr.attributeref) {
        var un_attributeref = true
      } else if (target.type === ezP.T3.Expr.slicing) {
        var un_slicing = true
      } else if (target.type === ezP.T3.Expr.call_expr) {
        var un_call_expr = true
      }
    }
    if (can_attributeref || can_slicing || can_call_expr || un_attributeref || un_slicing || un_call_expr) {
      var F = function(msg, css) {
        var content = goog.dom.createDom(goog.dom.TagName.SPAN, null,
          goog.dom.createTextNode(ezP.Msg.REMOVE+' '),
          goog.dom.createDom(goog.dom.TagName.SPAN, css || 'ezp-code',
            goog.dom.createTextNode(msg),
          )
        )
        var menuItem = new ezP.MenuItem(content,[ezP.PARENT_BYPASS_AND_REMOVE_ID])
        menu.addChild(menuItem, true)
        menuItem.setEnabled(true)
      }
      if (un_attributeref) {
        F('.attribute', 'ezp-code-placeholder')
      }
      if (un_slicing) {
        F('[...]')
      }
      if (un_call_expr) {
        F('(...)')
      }
      var subMenu = new ezP.SubMenu(ezP.Msg.ADD)
      var F = function(msg, action, css) {
        var content = goog.dom.createDom(goog.dom.TagName.SPAN, css || 'ezp-code',
          goog.dom.createTextNode(msg),
        )
        var menuItem = new ezP.MenuItem(content,[action])
        subMenu.addItem(menuItem)
        menuItem.setEnabled(more_blocks)
      }
      F('.attribute', ezP.PRIMARY_ATTRIBUTE_ADD_ID, 'ezp-code-placeholder')
      F('[...]', ezP.PRIMARY_SLICING_ADD_ID)
      F('(...)', ezP.PRIMARY_CALL_ADD_ID)
      menu.addChild(subMenu, true)  
      return true
    }
  }
  return false
}

/**
 * Handle the selection of an item in the primary part of the context dropdown menu.
 * Default implementation returns false.
 * @param {!Blockly.Block} block The Menu component clicked.
 * @param {!goog....} event The event containing as target
 * the MenuItem selected within menu.
 */
ezP.ContextMenuManager.prototype.handleActionPrimary = function (block, event) {
  var workspace = block.workspace
  var model = event.target.getModel()
  var action = model[0]
  switch(action) {
    case ezP.PARENT_BYPASS_AND_REMOVE_ID:
      block.ezp.bypassAndRemoveParent(block)
      return true
    case ezP.PRIMARY_ATTRIBUTE_ADD_ID:
      block.ezp.insertParent(block, ezP.T3.Expr.attributeref, ezP.Const.Input.PRIMARY)
      return true
    case ezP.PRIMARY_SLICING_ADD_ID:
    block.ezp.insertParent(block, ezP.T3.Expr.slicing, ezP.Const.Input.PRIMARY)
    return true
    case ezP.PRIMARY_CALL_ADD_ID:
    block.ezp.insertParent(block, ezP.T3.Expr.call_expr, ezP.Const.Input.PRIMARY)
    return true
  }
  return false
}
