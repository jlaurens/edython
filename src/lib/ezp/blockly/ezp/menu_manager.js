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

goog.provide('ezP.MenuManager')
goog.require('ezP.T3')
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
ezP.MenuManager = function () {
  this.menu = new ezP.PopupMenu(/*undefined, ContextMenuRenderer*/)
  this.insertSubmenu = new ezP.SubMenu(ezP.Msg.ADD)
  this.removeSubmenu = new ezP.SubMenu(ezP.Msg.REMOVE)
  this.didSeparate_ = false
  this.shouldSeparate_ = false
}

ezP.MenuManager.shared = function() {
  var out = undefined
  return function() {
    return out ? out: (out = new ezP.MenuManager())
  }
} ()

/**
 * Get the menu, in case clients may want to populate it directly.
 * Each manager has its own menu.
 */
ezP.MenuManager.prototype.menu = undefined

/**
 * Add a separator.
 */
ezP.MenuManager.prototype.separate = function (render = true) {
  this.shouldSeparate_ = false
  this.menu.addChild(new ezP.Separator(), render)
  this.didSeparate_ = true
}

/**
 * Whether a separator should be inserted before any forthcoming menu item.
 */
ezP.MenuManager.prototype.shouldSeparate = function(yorn = true) {
  this.shouldSeparate_  = !this.didSeparate_ && (this.shouldSeparate_ || yorn)
  console.log('shouldSeparate_', yorn, this.shouldSeparate_)
}

/**
 * Add a menu item.
 */
ezP.MenuManager.prototype.addChild = function (menuItem, render = true) {
  if (this.shouldSeparate_) {
    console.log('Did separate')
    this.separate(render)
  }
  this.menu.addChild(menuItem, render)
  this.didSeparate_ = false
}

/**
 * Add a menu item to the insert submenu.
 */
ezP.MenuManager.prototype.addInsertChild = function (menuItem, render = true) {
  this.insertSubmenu.addItem(menuItem)
}

/**
 * Add a menu item to the remove submenu.
 */
ezP.MenuManager.prototype.addRemoveChild = function (menuItem, render = true) {
  this.removeSubmenu.addItem(menuItem)
}

/**
 * Records the block and the event.
 * Removes all the previous menu items.
 * @param {!Blockly.Block} block The block.
 * @param {!Event} e Mouse event.
 * @private
 */
ezP.MenuManager.prototype.init = function (block, e) {
  if (!this.menu.inDocument_) {
    this.menu.render()
  }
  this.menu.removeChildren(true)
  this.e = e
  this.insertSubmenu.getMenu().removeChildren(true)
  this.removeSubmenu.getMenu().removeChildren(true)
}

/**
 * Show the context menu for the given block.
 * This is not for subclassers.
 * @param {!Blockly.Block} block The block.
 * @param {!Event} e Mouse event.
 * @private
 */
ezP.MenuManager.prototype.showMenu = function (block, e) {
  this.init(block, e)
  var target = block && block.ezp.getWrappedTargetBlock(block) || block
  this.shouldSeparate(target.ezp.populateContextMenuFirst_(target, this))
  this.shouldSeparate(target.ezp.populateContextMenuMiddle_(target, this))
  target.ezp.populateContextMenuLast_(target, this)
  this.insertSubmenu.setEnabled(this.insertSubmenu.getMenu().getChildCount() > 0)
  this.removeSubmenu.setEnabled(this.removeSubmenu.getMenu().getChildCount() > 0)
  var me = this
  goog.events.listenOnce(this.menu, 'action', function (event) {
    setTimeout(function () {// try/finally?
      target.ezp.handleMenuItemActionFirst(target, me, event)
          || target.ezp.handleMenuItemActionMiddle(target, me, event)
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
ezP.FILL_HOLES_ID = 'FILL_HOLES'

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr The context menu manager.
 * @private
 */
ezP.Delegate.prototype.populateContextMenuFirst_ = function (block, mgr) {
  return mgr.populate_insert_remove(block)
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr The context menu manager.
 * @private
 */
ezP.Delegate.prototype.populateContextMenuMiddle_ = function (block, mgr) {
  return false
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr The context menu manager.
 * @private
 */
ezP.Delegate.prototype.populateContextMenuLast_ = function (block, mgr) {
  return mgr.populateLast(block)
}
/**
 * Populate the context menu.
 */
ezP.MenuManager.prototype.populate_insert_remove = function (block) {
  this.shouldSeparate()
  this.populate_movable_parent(block)
  this.addChild(this.insertSubmenu, true)
  this.addChild(this.removeSubmenu, true)
  return true
}

/**
 * Populate the context menu.
 */
ezP.MenuManager.prototype.populateLast = function (block) {
  var menuItem
  if (block.ezp.can_fill_holes) {
    // Option to fill the holes.
    menuItem = new ezP.MenuItem(
      ezP.Msg.FILL_HOLES,
      {action: ezP.FILL_HOLES_ID})
    this.addChild(menuItem, true)
  }
  if (block.isDeletable() && block.isMovable() && !block.isInFlyout) {
    // Option to duplicate this block.
    menuItem = new ezP.MenuItem(
      Blockly.Msg.DUPLICATE_BLOCK,
      {action: ezP.DUPLICATE_BLOCK_ID})
    this.addChild(menuItem, true)
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
        {action: ezP.REMOVE_COMMENT_ID})
    } else {
      menuItem = new ezP.MenuItem(
        Blockly.Msg.ADD_COMMENT,
        {action: ezP.ADD_COMMENT_ID})
    }
    menuItem.setEnabled(false && !goog.userAgent.IE && !block.outputConnection)
    this.addChild(menuItem, true)
  }
  if (block.workspace.options.collapse) {
    if (block.collapsed_) {
      menuItem = new ezP.MenuItem(
        Blockly.Msg.EXPAND_BLOCK,
        {action: ezP.EXPAND_BLOCK_ID})
      menuItem.setEnabled(true)
    } else {
      menuItem = new ezP.MenuItem(
        Blockly.Msg.COLLAPSE_BLOCK,
        {action: ezP.COLLAPSE_BLOCK_ID})
      menuItem.setEnabled(block.getStatementCount() > 2)
    }
    this.addChild(menuItem, true)
  }
  if (block.workspace.options.disable) {
    menuItem = new ezP.MenuItem(
      block.disabled
        ? Blockly.Msg.ENABLE_BLOCK : Blockly.Msg.DISABLE_BLOCK,
      {action: ezP.TOGGLE_ENABLE_BLOCK_ID})
    menuItem.setEnabled(!block.outputConnection)
    this.addChild(menuItem, true)
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
      {action: ezP.DELETE_BLOCK_ID})
    menuItem.setEnabled(true)
    this.addChild(menuItem, true)
  }
  // help
  var url = goog.isFunction(block.helpUrl) ? block.helpUrl() : block.helpUrl
  menuItem = new ezP.MenuItem(
    Blockly.Msg.HELP,
    {action: ezP.HELP_ID})
  menuItem.setEnabled(!!url)
  this.addChild(menuItem, true)
  this.separate()
  
  menuItem = new ezP.MenuItem(
    block.ezp.getPythonType(block),
    {action: ezP.LOG_BLOCK_XML_ID})
  menuItem.setEnabled(true)
  this.addChild(menuItem, true)

  if (block.ezp.plugged_) {
    menuItem = new ezP.MenuItem(
      block.ezp.plugged_.substring(4),
      {action: ezP.LOG_BLOCK_XML_ID})
    menuItem.setEnabled(false)
    this.addChild(menuItem, true)
  }
}

/**
 * Handle the selection of an item in the context dropdown menu.
 * Intended to be overriden.
 * @param {!Blockly.Block} block
 * @param {!ezP.MenuManager} mgr
 * @param {!goog....} event The event containing as target
 */
ezP.DelegateSvg.prototype.handleMenuItemActionFirst = function (block, mgr, event) {
  return mgr.handleAction_movable_parent(block, event)
}

/**
 * Handle the selection of an item in the context dropdown menu.
 * Intended to be overriden.
 * @param {!Blockly.Block} block
 * @param {!ezP.MenuManager} mgr
 * @param {!goog....} event The event containing as target
 */
ezP.DelegateSvg.prototype.handleMenuItemActionMiddle = function (block, mgr, event) {
  return false
}

/**
 * Handle the selection of an item in the context dropdown menu.
 * Intended to be overriden.
 * @param {!Blockly.Block} block
 * @param {!ezP.MenuManager} mgr
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
ezP.MenuManager.prototype.handleActionLast = function (block, event) {
  var workspace = block.workspace
  var model = event.target.getModel()
  switch(model.action) {
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

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.MenuManager.prototype.populateVariable_ = function (block) {
  if (ezP.T3.Expr.Check.not_a_variable.indexOf(block.ezp.plugged_)>=0) {
    return false
  }
  var answer = false
  var listener = block.ezp.inputs.first.fieldIdentifier
  goog.asserts.assert(listener && listener.getText, 'Bad listener in ...Get...populateContextMenuFirst_.')
  var name = listener.getText()
  var allVs = [].concat(block.workspace.getAllVariables())
  allVs.sort(Blockly.VariableModel.compareByName)
  var visible = allVs.length > 1
  var j = 0
  var v
  var menuItem
  var subMenu = new ezP.SubMenu(ezP.Msg.REPLACE_VARIABLE)
  for (var i = 0; v = allVs[i++];) {
    menuItem = new ezP.MenuItemVar(v.name, [ezP.CHANGE_VARIABLE_ID, v])
    this.addChild(menuItem, true)
    menuItem.enableClassName('ezp-hidden', !visible || v.name === name)
    menuItem = new ezP.MenuItemVar(v.name, [ezP.REPLACE_VARIABLE_ID, v])
    subMenu.addItem(menuItem)
    menuItem.enableClassName('ezp-hidden', !visible || v.name === name)
  }
  if (visible) {
    this.separate()
  }
  subMenu.setEnabled(visible)  
  this.addChild(subMenu, true)
  menuItem = new ezP.MenuItem(
    ezP.Msg.NEW_VARIABLE,
    {action: ezP.NEW_VARIABLE_ID})
  this.addChild(menuItem, true)
  menuItem = new ezP.MenuItem(
    ezP.Msg.DELETE_UNUSED_VARIABLES,
    {action: ezP.DELETE_UNUSED_VARIABLES_ID})
  menuItem.setEnabled(ezP.Variables.isThereAnUnusedVariable(block.workspace))
  this.addChild(menuItem, true)
  Blockly.utils.addClass(subMenu.getMenu().getElement(), 'ezp-nosubmenu')
  return true
}

ezP.PARENT_INSERT_ID = 'PARENT_INSERT'
ezP.PARENT_REMOVE_ID = 'PARENT_REMOVE'

/**
 * Handle the selection of an item in the first part of the context dropdown menu.
 * Default implementation returns false.
 * @param {!Blockly.Block} block The Menu component clicked.
 * @param {!goog....} event The event containing as target
 * the MenuItem selected within menu.
 */
ezP.MenuManager.prototype.handleAction_movable_parent = function (block, event) {
  var model = event.target.getModel()
  var action = model.action
  var type = model.type
  var actor = model.actor || block
  if (action === ezP.PARENT_INSERT_ID) {
    console.log('ezP.MenuManager.prototype.handleAction_movable_parent')
    actor.ezp.insertParent(actor, type, model.key)
    return true
  } else if (action === ezP.PARENT_REMOVE_ID) {
    actor.ezp.bypassAndRemoveParent(actor)
  }
  return false
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @private
 */
ezP.MenuManager.prototype.handleAction_movable_parent_module = ezP.MenuManager.prototype.handleAction_movable_parent

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @private
 */
ezP.MenuManager.prototype.get_movable_parent_menuitem_content = function (type) {
  switch(type) {
    case ezP.T3.Expr.parent_module: 
    return goog.dom.createDom(goog.dom.TagName.SPAN, null,
      goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
        goog.dom.createTextNode('.'),
      ),
      goog.dom.createTextNode(' '+ezP.Msg.BEFORE),
    )
    case ezP.T3.Expr.module_concrete:
    return goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
      goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code-placeholder',
        goog.dom.createTextNode('module'),
      ),
      goog.dom.createTextNode('.'),
    )
    case ezP.T3.Expr.attributeref:
    return goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
      goog.dom.createTextNode('.attribute'),
    )
    case ezP.T3.Expr.slicing:
    return goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
      goog.dom.createTextNode('[...]'),
    )
    case ezP.T3.Expr.call_expr:
    return goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
      goog.dom.createTextNode('(...)'),
    )
    case ezP.T3.Expr.module_as_concrete:
    case ezP.T3.Expr.import_identifier_as_concrete:
    return goog.dom.createDom(goog.dom.TagName.SPAN, null,
      goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code-reserved',
        goog.dom.createTextNode('as'),
      ),
      goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code-placeholder',
        goog.dom.createTextNode(' alias'),
      )
    )
    default:
    return 'Parent '+type
  }
}

/**
 * Populate the context menu for the given block.
 * Only for expressions.
 * type is the type of the to be inserted parent block
 * @param {!Blockly.Block} block The block.
 * @param {!string} type the type of the parent to be.
 * @private
 */
ezP.MenuManager.prototype.populate_insert_as_top_parent = function (block, type) {
  var c8n = block.outputConnection
  if (!c8n) {
    // this is a statement block
    return false
  }
  var check = c8n.check_
  var D = ezP.Delegate.Manager.get(type).prototype.inputData
  var mgr = this
  var F = function(K) {
    var d = D[K]
    if (d) {
      if (check && d.check) {
        var found = false
        for (var _ = 0; _ < d.check.length; ++_) {
          if (check.indexOf(d.check[_]) >= 0) {
            found = true
            break
          }
        }
        if (!found) {
          return false
        }
      }
      var content = mgr.get_movable_parent_menuitem_content(type)
      var MI = new ezP.MenuItem(content, {
        action: ezP.PARENT_INSERT_ID,
        type: type,
        key: d.key || K,
        actor: block,
      })
      mgr.addInsertChild(MI)
      return true
    }
    return false
  }
  return F('first') || F('middle') || F('last')
}

/**
 * Populate the context menu for the given block.
 * Only for expressions.
 * type is the type of the to be inserted parent block.
 * This parent might be inserted up to the top.
 * @param {!Blockly.Block} block The block.
 * @param {!string} type the type of the parent to be.
 * @private
 */
ezP.MenuManager.prototype.populate_insert_parent = function (block, type, top) {
  // can we insert a block typed type between the block and
  // the target of its output connection
  var child = block
  do {
    var c8n = child.outputConnection
    if (!c8n) {
      // this is a statement block
      break
    }
    var targetC8n = c8n.targetConnection
    if (!targetC8n) {
      if (top) {
        this.populate_insert_as_top_parent(child, type)
      }
      break
    }
    var check = targetC8n.check_
    if (check && check.indexOf(type) < 0) {
      // the target connection won't accept block
      break
    }

    if (this.populate_insert_as_top_parent(child, type)) {
      break
    }
  } while ((child = child.getParent()))
}

/**
 * Populate the context menu for the given block.
 * Only for expressions.
 * @param {!Blockly.Block} block The block.
 * @param {!string} type the type of the parent to be.
 * @private
 */
ezP.MenuManager.prototype.populate_remove_parent = function (block, type) {
  var child = block
  var parent
  while((parent = child.getParent())) {
    if (parent.type === type) {
      if (child.ezp.canBypassAndRemoveParent(child)) {
        var content = this.get_movable_parent_menuitem_content(parent.type)
        var MI = new ezP.MenuItem(content, {
          action: ezP.PARENT_REMOVE_ID,
          actor: child,
        })
        this.addRemoveChild(MI)
      }
      return
    }
    child = parent
  }
}

/**
 * Populate the context menu for the given block.
 * Only for expressions.
 * @param {!Blockly.Block} block The block.
 * @private
 */
ezP.MenuManager.prototype.populate_movable_parent = function (block) {
  var movableParents = [
    ezP.T3.Expr.call_expr,
    ezP.T3.Expr.slicing,
    ezP.T3.Expr.attributeref,
  ]  
  for (var _ = 0, type; (type = movableParents[_]); ++_) {
    this.populate_insert_parent(block, type, true)
    this.populate_remove_parent(block, type)
  }
  var movableParents = [
    ezP.T3.Expr.parent_module,
    ezP.T3.Expr.module_concrete,
    ezP.T3.Expr.module_as_concrete,
    ezP.T3.Expr.import_identifier_as_concrete,
  ]  
  for (var _ = 0, type; (type = movableParents[_]); ++_) {
    this.populate_insert_parent(block, type, false)
    this.populate_remove_parent(block, type)
  }
}
