/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview BlockSvg delegates for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.MenuManager')

goog.require('eYo.Msg')
goog.require('eYo.T3')
goog.require('eYo.DelegateSvg')
goog.require('eYo.MenuItem')
goog.require('eYo.Separator')
goog.require('goog.dom');
goog.require('eYo.PythonExporter')

/**
 * The block that handles the context menu is not always the one
 * which has received the messages.
 * The default handler is the block itself.
 * For wrapper blocks, the handler may be the wrapped block.
 * @param {!Blockly.Block} block The block.
 * @private
 */
eYo.DelegateSvg.prototype.getContextMenuHandler = function (block) {
  return block
}

/**
 * Shared context menu manager.
 * One shared menu.
 * @constructor
 */
eYo.MenuManager = function () {
  this.menu = new eYo.PopupMenu(/* undefined, ContextMenuRenderer */)
  this.insertSubmenu = new eYo.SubMenu(eYo.Msg.ADD)
  this.insertBeforeSubmenu = new eYo.SubMenu(eYo.Msg.ADD_BEFORE)
  this.insertAfterSubmenu = new eYo.SubMenu(eYo.Msg.ADD_AFTER)
  this.removeSubmenu = new eYo.SubMenu(eYo.Msg.REMOVE)
  this.didSeparate_ = false
  this.shouldSeparate_ = false
  this.didSeparateInsert_ = false
  this.shouldSeparateInsert_ = false
  this.didSeparateInsertBefore_ = false
  this.shouldSeparateInsertBefore_ = false
  this.didSeparateInsertAfter_ = false
  this.shouldSeparateInsertAfter_ = false
  this.didSeparateRemove_ = false
  this.shouldSeparateRemove_ = false
}

eYo.MenuManager.shared = (function () {
  var out
  return function () {
    return out || (out = new eYo.MenuManager())
  }
}())

/**
 * Get the menu, in case clients may want to populate it directly.
 * Each manager has its own menu.
 */
eYo.MenuManager.prototype.menu = undefined

/**
 * Create a new menu item.
 * @param {!Object} content The title of the menu item.
 * @param {!Function} action The action of the menu item.
 */
eYo.MenuManager.prototype.newMenuItem = function (content, action) {
  return new /* */ eYo.MenuItem(content, action)
}

/**
 * Add a separator.
 */
eYo.MenuManager.prototype.separate = function (render = true) {
  this.shouldSeparate_ = false
  if (this.menu.getChildCount()) {
    this.menu.addChild(new eYo.Separator(), render)
  }
  this.didSeparate_ = true
}

/**
 * Add a separator.
 */
eYo.MenuManager.prototype.separateInsert = function (render = true) {
  this.shouldSeparateInsert_ = false
  if (this.insertSubmenu.getItemCount()) {
    this.addInsertChild(new eYo.Separator(), render)
  }
  this.didSeparateInsert_ = true
}

/**
 * Add a separator.
 */
eYo.MenuManager.prototype.separateInsertBefore = function (render = true) {
  this.shouldSeparateInsertBefore_ = false
  if (this.insertBeforeSubmenu.getItemCount()) {
    this.addInsertBeforeChild(new eYo.Separator(), render)
  }
  this.didSeparateInsertBefore_ = true
}

/**
 * Add a separator.
 */
eYo.MenuManager.prototype.separateInsertAfter = function (render = true) {
  this.shouldSeparateInsertAfter_ = false
  if (this.insertAfterSubmenu.getItemCount()) {
    this.addInsertAfterChild(new eYo.Separator(), render)
  }
  this.didSeparateInsertAfter_ = true
}

/**
 * Add a separator.
 */
eYo.MenuManager.prototype.separateRemove = function (render = true) {
  this.shouldSeparateRemove_ = false
  if (this.removeSubmenu.getItemCount()) {
    this.addRemoveChild(new eYo.Separator(), render)
  }
  this.didSeparateRemove_ = true
}

/**
 * Whether a separator should be inserted before any forthcoming menu item.
 */
eYo.MenuManager.prototype.shouldSeparate = function (yorn = true) {
  this.shouldSeparate_ = !this.didSeparate_ && (this.shouldSeparate_ || yorn)
  // console.log('shouldSeparate_', yorn, this.shouldSeparate_)
}

/**
 * Whether a separator should be inserted before any forthcoming menu item.
 */
eYo.MenuManager.prototype.shouldSeparateInsert = function (yorn = true) {
  this.shouldSeparateInsert_ = !this.didSeparateInsert_ && (this.shouldSeparateInsert_ || yorn)
  // console.log('shouldSeparate_', yorn, this.shouldSeparate_)
}

/**
 * Whether a separator should be inserted before any forthcoming menu item.
 */
eYo.MenuManager.prototype.shouldSeparateRemove = function (yorn = true) {
  this.shouldSeparateRemove_ = !this.didSeparateRemove_ && (this.shouldSeparateRemove_ || yorn)
}

/**
 * Whether a separator should be inserted before any forthcoming menu item.
 */
eYo.MenuManager.prototype.shouldSeparateInsertBefore = function (yorn = true) {
  this.shouldSeparateInsertBefore_ = !this.didSeparateInsertBefore_ && (this.shouldSeparateInsertBefore_ || yorn)
  // console.log('shouldSeparateBefore_', yorn, this.shouldSeparateBefore_)
}

/**
 * Whether a separator should be inserted before any forthcoming menu item.
 */
eYo.MenuManager.prototype.shouldSeparateInsertAfter = function (yorn = true) {
  this.shouldSeparateInsertAfter_ = !this.didSeparateInsertAfter_ && (this.shouldSeparateInsertAfter_ || yorn)
  // console.log('shouldSeparateAfter_', yorn, this.shouldSeparateAfter_)
}

/**
 * Add a menu item.
 */
eYo.MenuManager.prototype.addChild = function (menuItem, render = true) {
  if (this.shouldSeparate_) {
    // console.log('Did separate')
    this.separate(render)
  }
  this.menu.addChild(menuItem, render)
  this.didSeparate_ = false
}

/**
 * Add a menu item to the insert submenu.
 */
eYo.MenuManager.prototype.addInsertChild = function (menuItem, render = true) {
  if (this.shouldSeparateInsert_) {
    // console.log('Did separate')
    this.separateInsert(render)
  }
  this.insertSubmenu.addItem(menuItem)
  this.didSeparateInsert_ = false
}

/**
 * Add a menu item to the insert submenu.
 */
eYo.MenuManager.prototype.addInsertBeforeChild = function (menuItem, render = true) {
  if (this.shouldSeparateInsertBefore_) {
    // console.log('Did separate')
    this.separateInsertBefore(render)
  }
  this.insertBeforeSubmenu.addItem(menuItem)
  this.didSeparateInsertBefore_ = false
}

/**
 * Add a menu item to the insert submenu.
 */
eYo.MenuManager.prototype.addInsertAfterChild = function (menuItem, render = true) {
  if (this.shouldSeparateInsertAfter_) {
    // console.log('Did separate')
    this.separateInsertAfter(render)
  }
  this.insertAfterSubmenu.addItem(menuItem)
  this.didSeparateInsertAfter_ = false
}

/**
 * Add a menu item to the remove submenu.
 */
eYo.MenuManager.prototype.addRemoveChild = function (menuItem, render = true) {
  this.removeSubmenu.addItem(menuItem)
}

/**
 * Records the block and the event.
 * Removes all the previous menu items.
 * @param {!Blockly.Block=} block The block.
 * @param {!Event=} e Mouse event.
 * @private
 */
eYo.MenuManager.prototype.init = function (block = undefined, e = undefined) {
  if (!this.menu.inDocument_) {
    this.menu.render()
  }
  this.menu.removeChildren(true)
  this.e = e
  this.insertSubmenu.getMenu().removeChildren(true)
  this.insertBeforeSubmenu.getMenu().removeChildren(true)
  this.insertAfterSubmenu.getMenu().removeChildren(true)
  this.removeSubmenu.getMenu().removeChildren(true)
}

/**
 * Show the context menu for the given block.
 * This is not for subclassers.
 * @param {!Blockly.Block} block The block.
 * @param {!Event} e Mouse event.
 * @private
 */
eYo.MenuManager.prototype.showMenu = function (block, e) {
  if (this.menu.isVisible()) {
    this.menu.hide()
    return
  }
  var ee = block.eyo.lastMouseDownEvent
  if (ee) {
    // this block was selected when the mouse down event was sent
    if (ee.clientX === e.clientX && ee.clientY === e.clientY) {
      if (block === Blockly.selected) {
        // if the block was already selected,
        // try to select an input connection
        eYo.SelectedConnection = block.eyo.lastSelectedConnection
      }
    }
  }
  var target = block.eyo.getMenuTarget()
  this.init(target, e)
  var me = this
  me.alreadyListened = false
  var parent, sep
  parent = target
  this.populate_before_after(block)
  sep = parent.eyo.populateContextMenuFirst_(this)
  while (parent !== block) {
    parent = parent.getParent()
    sep = parent.eyo.populateContextMenuFirst_(this) || sep
  }
  this.shouldSeparate(sep) // this algorithm needs more thinking
  if (this.insertSubmenu.getItemCount()) {
    this.addChild(this.insertSubmenu, true)
    sep = true
  }
  if (this.removeSubmenu.getItemCount()) {
    this.addChild(this.removeSubmenu, true)
    sep = true
  }
  this.shouldSeparate(sep)
  sep = block.eyo.populateContextMenuComment && block.eyo.populateContextMenuComment(this)
  if (this.insertAfterSubmenu.getItemCount()) {
    this.addChild(this.insertAfterSubmenu, true)
    sep = true
  }
  if (this.insertBeforeSubmenu.getItemCount()) {
    this.addChild(this.insertBeforeSubmenu, true)
    sep = true
  }
  this.shouldSeparate(sep) // this algorithm needs more thinking
  parent = target
  sep = parent.eyo.populateContextMenuMiddle_(parent, this)
  while (parent !== block) {
    parent = parent.getParent()
    sep = parent.eyo.populateContextMenuMiddle_(parent, this) || sep
  }
  this.shouldSeparate(sep) // this algorithm needs more thinking
  block.eyo.populateContextMenuLast_(block, this)
  this.insertSubmenu.setEnabled(this.insertSubmenu.getMenu().getChildCount() > 0)
  this.removeSubmenu.setEnabled(this.removeSubmenu.getMenu().getChildCount() > 0)
  goog.events.listenOnce(this.menu, 'action', function (event) {
    setTimeout(function () { // try/finally?
      if (me.alreadyListened) {
        console.log('************* I have already listened!')
        return
      }
      me.alreadyListened = true
      var model = event.target && event.target.model_
      if (goog.isFunction(model)) {
        model(event)
      } else {
        target.eyo.handleMenuItemActionFirst(target, me, event) ||
        target.eyo.handleMenuItemActionMiddle(target, me, event) ||
        target.eyo.handleMenuItemActionLast(target, me, event)
      }
      me.init()
    }, 10)// TODO be sure that this 100 is suffisant
  })
  var bBox = block.eyo.svgPathShape_.getBBox()
  var scaledHeight = bBox.height * block.workspace.scale
  var xy = goog.style.getPageOffset(block.svgGroup_)
  this.menu.showMenu(block.svgGroup_, xy.x, xy.y + scaledHeight + 2)
}

eYo.ID.DUPLICATE_BLOCK = 'DUPLICATE_BLOCK'
eYo.ID.REMOVE_COMMENT = 'REMOVE_COMMENT'
eYo.ID.ADD_COMMENT = 'ADD_COMMENT'
eYo.ID.EXPAND_BLOCK = 'EXPAND_BLOCK'
eYo.ID.COLLAPSE_BLOCK = 'COLLAPSE_BLOCK'
eYo.ID.TOGGLE_ENABLE_BLOCK = 'TOGGLE_ENABLE_BLOCK'
eYo.ID.DELETE_BLOCK = 'DELETE_BLOCK'
eYo.ID.HELP = 'HELP'

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr The context menu manager.
 * @private
 */
eYo.Delegate.prototype.populateContextMenuFirst_ = function (mgr) {
  mgr.shouldSeparate()
  mgr.populate_movable_parent(this.block_)
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr The context menu manager.
 * @private
 */
eYo.Delegate.prototype.populateContextMenuMiddle_ = function (block, mgr) {
  return false
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr The context menu manager.
 * @private
 */
eYo.Delegate.prototype.populateContextMenuLast_ = function (block, mgr) {
  return mgr.populateLast(block)
}

/**
 * Populate the context menu.
 */
eYo.MenuManager.prototype.populateLast = function (block) {
  var c8n = eYo.SelectedConnection
  var holes = eYo.HoleFiller.getDeepHoles(c8n || block)
  var menuItem = this.newMenuItem(
    eYo.Msg.FILL_DEEP_HOLES, function () {
      eYo.Events.setGroup(true)
      try {
        eYo.HoleFiller.fillDeepHoles(block.workspace, holes)
      } catch (err) {
        console.error(err)
        throw err
      } finally {
        eYo.Events.setGroup(false)
      }
    })
  menuItem.setEnabled(holes.length > 0)
  this.addChild(menuItem, true)
  if (block.isMovable() && !block.isInFlyout) {
    if (block.eyo.canUnlock()) {
      menuItem = this.newMenuItem(eYo.Msg.UNLOCK_BLOCK,
        function (event) {
          eYo.Events.setGroup(true)
          try {
            block.eyo.unlock()
          } catch (err) {
            console.error(err)
            throw err
          } finally {
            eYo.Events.setGroup(false)
          }
        }
      )
      this.addChild(menuItem, true)
    }
    if (block.eyo.canLock()) {
      menuItem = this.newMenuItem(eYo.Msg.LOCK_BLOCK,
        function (event) {
          eYo.Events.setGroup(true)
          try {
            block.eyo.lock()
          } catch (err) {
            console.error(err)
            throw err
          } finally {
            eYo.Events.setGroup(false)
          }
        }
      )
      this.addChild(menuItem, true)
    }
  }
  if (block.isDeletable() && block.isMovable() && !block.isInFlyout) {
    // Option to duplicate this block.
    menuItem = this.newMenuItem(
      eYo.Msg.DUPLICATE_BLOCK,
      {action: eYo.ID.DUPLICATE_BLOCK,
        target: block})
    this.addChild(menuItem, true)
    if (block.getDescendants().length > block.workspace.remainingCapacity()) {
      menuItem.setEnabled(false)
    }
  }
  if (block.isEditable() && !block.collapsed_ &&
    block.workspace.options.comments) {
    // Option to add/remove a comment.
    if (block.comment) { // .comment is never set
      menuItem = this.newMenuItem(
        eYo.Msg.REMOVE_COMMENT,
        {action: eYo.ID.REMOVE_COMMENT,
          target: block})
    } else {
      menuItem = this.newMenuItem(
        eYo.Msg.ADD_COMMENT,
        {action: eYo.ID.ADD_COMMENT,
          target: block})
    }
    menuItem.setEnabled(false && !goog.userAgent.IE && !block.outputConnection)
    this.addChild(menuItem, true)
  }
  if (block.workspace.options.collapse) {
    if (block.collapsed_) {
      menuItem = this.newMenuItem(
        eYo.Msg.EXPAND_BLOCK,
        {action: eYo.ID.EXPAND_BLOCK,
          target: block})
      menuItem.setEnabled(true)
    } else {
      menuItem = this.newMenuItem(
        eYo.Msg.COLLAPSE_BLOCK,
        {action: eYo.ID.COLLAPSE_BLOCK,
          target: block})
      menuItem.setEnabled(block.eyo.getStatementCount() > 2)
    }
    this.addChild(menuItem, true)
  }
  if (block.workspace.options.disable) {
    menuItem = this.newMenuItem(
      block.disabled
        ? eYo.Msg.ENABLE_BLOCK : eYo.Msg.DISABLE_BLOCK,
      {action: eYo.ID.TOGGLE_ENABLE_BLOCK,
        target: block})
    menuItem.setEnabled(!block.outputConnection)
    this.addChild(menuItem, true)
  }
  if (block.isDeletable() && block.isMovable() && !block.isInFlyout) {
    // Count the number of blocks that are nested in this block.
    var unwrapped = block
    var parent
    while (unwrapped.eyo.wrapped_ && (parent = unwrapped.getParent())) {
      // parent is not '', it may be undefined
      unwrapped = parent
      // replace the parent test with an assertion
    }
    // unwrapped is the topmost block or the first unwrapped parent
    var descendantCount = unwrapped.eyo.getWrappedDescendants(unwrapped).length
    if (parent === null) {
      // the topmost is itself sealed, this should not occur
      ++descendantCount
    }
    var nextBlock = unwrapped.getNextBlock()
    if (nextBlock) {
      // Blocks in the current stack would survive this block's deletion.
      descendantCount -= nextBlock.eyo.getWrappedDescendants(nextBlock).length
    }
    menuItem = this.newMenuItem(
      descendantCount === 1 ? eYo.Msg.DELETE_BLOCK
        : eYo.Msg.DELETE_X_BLOCKS.replace('{0}', String(descendantCount)),
      {action: eYo.ID.DELETE_BLOCK,
        target: block})
    menuItem.setEnabled(true)
    this.addChild(menuItem, true)
  }
  // help
  var url = goog.isFunction(block.helpUrl) ? block.helpUrl() : block.helpUrl
  menuItem = this.newMenuItem(
    eYo.Msg.HELP,
    {action: eYo.ID.HELP,
      target: block})
  menuItem.setEnabled(!!url)
  this.addChild(menuItem, true)
  this.separate()

  menuItem = this.newMenuItem(
    block.eyo.getPythonType(), function (event) {
      var xmlDom = Blockly.Xml.blockToDom(block, true)
      var xmlText = Blockly.Xml.domToText(xmlDom)
      console.log(xmlText)
    }
  )
  menuItem.setEnabled(true)
  this.addChild(menuItem, true)

  menuItem = this.newMenuItem(
    block.eyo.getPythonType() + ' python code',
    function (b, e) {
      console.log('Python code for', block.type)
      var p = new eYo.PythonExporter()
      console.log(p.export(block))
    })
  menuItem.setEnabled(true)
  this.addChild(menuItem, true)

  menuItem = this.newMenuItem(
    block.eyo.getPythonType() + ' python code (deep)',
    function (b, e) {
      console.log('Python code for', block.type)
      var p = new eYo.PythonExporter()
      console.log(p.export(block, true))
      block.eyo.runScript()
    })
  menuItem.setEnabled(true)
  this.addChild(menuItem, true)

  menuItem = this.newMenuItem(
    'workspace',
    function (b, e) {
      console.log(block.workspace.eyo.toString())
    })
  menuItem.setEnabled(true)
  this.addChild(menuItem, true)

  if (block.eyo.plugged_) {
    menuItem = this.newMenuItem(
      block.eyo.plugged_.substring(4)
    )
    menuItem.setEnabled(false)
    this.addChild(menuItem, true)
  }
}

/**
 * Handle the selection of an item in the context dropdown menu.
 * Intended to be overriden.
 * @param {!Blockly.Block} block
 * @param {!eYo.MenuManager} mgr
 * @param {!goog.events.Event} event The event containing as target
 */
eYo.DelegateSvg.prototype.handleMenuItemActionFirst = function (block, mgr, event) {
  return mgr.handleAction_movable_parent(block, event)
}

/**
 * Handle the selection of an item in the context dropdown menu.
 * Intended to be overriden.
 * @param {!Blockly.Block} block
 * @param {!eYo.MenuManager} mgr
 * @param {!goog.events.Event} event The event containing as target
 */
eYo.DelegateSvg.prototype.handleMenuItemActionMiddle = function (block, mgr, event) {
  return false
}

/**
 * Handle the selection of an item in the context dropdown menu.
 * Intended to be overriden.
 * @param {!Blockly.Block} block
 * @param {!eYo.MenuManager} mgr
 * @param {!goog.events.Event} event The event containing as target
 */
eYo.DelegateSvg.prototype.handleMenuItemActionLast = function (block, mgr, event) {
  return mgr.handleActionLast(block, event)
}

/**
 * Handle the selection of an item in the context dropdown menu.
 * Default implementation mimics Blockly behaviour.
 * Unlikely to be overriden.
 * @param {!goog.events.Event} event The event containing as target
 * the MenuItem selected within menu.
 */
eYo.MenuManager.prototype.handleActionLast = function (block, event) {
  var model = event.target.model_
  if (goog.isFunction(model)) {
    setTimeout(function () {
      model(block, event)
    }, 100)
    return true
  }
  var target = model.target || block
  switch (model.action) {
  case eYo.ID.DUPLICATE_BLOCK:
    Blockly.duplicate_(target)
    return true
  case eYo.ID.REMOVE_COMMENT:
    target.setCommentText(null)
    return true
  case eYo.ID.ADD_COMMENT:
    target.setCommentText('')
    return true
  case eYo.ID.EXPAND_BLOCK:
    target.setCollapsed(false)
    return true
  case eYo.ID.COLLAPSE_BLOCK:
    target.setCollapsed(true)
    return true
  case eYo.ID.TOGGLE_ENABLE_BLOCK:
    target.eyo.setDisabled(!target.disabled)
    return true
  case eYo.ID.DELETE_BLOCK:
    var unwrapped = target
    var parent
    while (unwrapped.eyo.wrapped_ && (parent = unwrapped.getSurroundParent())) {
      unwrapped = parent
    }
    // unwrapped is the topmost block or the first unwrapped parent
    eYo.Events.setGroup(true)
    var returnState = false
    try {
      if (target === Blockly.selected && target !== unwrapped) {
        // this block was selected, select the block below or above before deletion
        var c8n
        if (((c8n = unwrapped.nextConnection) && (target = c8n.targetBlock())) || ((c8n = unwrapped.previousConnection) && (target = c8n.targetBlock()))) {
          target.select()
        } else if ((c8n = unwrapped.outputConnection) && (c8n = c8n.targetConnection)) {
          target = c8n.sourceBlock_
          target.select()
          eYo.SelectedConnection = c8n
        }
      }
      unwrapped.dispose(true, true)
      returnState = true
    } catch (err) {
      console.error(err)
      throw err
    } finally {
      eYo.Events.setGroup(false)
    }
    return returnState
  case eYo.ID.HELP:
    target.showHelp_()
    return true
  }
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.MenuManager.prototype.populateVariable_ = function (block) {
  return false
}

/**
 * Handle the selection of an item in the first part of the context dropdown menu.
 * Default implementation returns false.
 * @param {!Blockly.Block} block The Menu component clicked.
 * @param {!goog....} event The event containing as target
 * the MenuItem selected within menu.
 */
eYo.MenuManager.prototype.handleAction_movable_parent = function (block, event) {
  var model = event.target.model_
  if (goog.isFunction(model)) {
    setTimeout(function () {
      model(block, event)
    }, 100)
    return true
  }
  return false
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @private
 */
eYo.MenuManager.prototype.handleAction_movable_parent_module = eYo.MenuManager.prototype.handleAction_movable_parent

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @private
 */
eYo.MenuManager.prototype.get_menuitem_content = function (type, subtype) {
  var Stmt1 = function (key) {
    return goog.dom.createDom(goog.dom.TagName.SPAN, null,
      eYo.Do.createSPAN(key, 'eyo-code-reserved'),
      eYo.Do.createSPAN(' … ', 'eyo-code-placeholder'),
      eYo.Do.createSPAN(':', 'eyo-code-reserved')
    )
  }
  var Stmt2 = function (key) {
    return goog.dom.createDom(goog.dom.TagName.SPAN, null,
      eYo.Do.createSPAN(key + ':', 'eyo-code-reserved')
    )
  }
  switch (type) {
  case eYo.T3.Expr.parent_module:
    return goog.dom.createDom(goog.dom.TagName.SPAN, null,
      eYo.Do.createSPAN('.', 'eyo-code'),
      goog.dom.createTextNode(' ' + eYo.Msg.AT_THE_LEFT)
    )
  case eYo.T3.Expr.attributeref:
    switch (subtype) {
    case eYo.Key.ROOT:
      return goog.dom.createDom(goog.dom.TagName.SPAN, null,
        eYo.Do.createSPAN('.', 'eyo-code'),
        eYo.Do.createSPAN('attribute', 'eyo-code-placeholder'),
        goog.dom.createTextNode(' ' + eYo.Msg.AT_THE_RIGHT)
      )
      // case eYo.Key.ATTRIBUTE:
    default:
      return goog.dom.createDom(goog.dom.TagName.SPAN, null,
        eYo.Do.createSPAN('primary', 'eyo-code-placeholder'),
        eYo.Do.createSPAN('.', 'eyo-code'),
        goog.dom.createTextNode(' ' + eYo.Msg.AT_THE_LEFT)
      )
    }
  case eYo.T3.Expr.key_datum:
    return goog.dom.createDom(goog.dom.TagName.SPAN, null,
      eYo.Do.createSPAN(': ', 'eyo-code'),
      eYo.Do.createSPAN('…', 'eyo-code-placeholder'),
      goog.dom.createTextNode(' ' + eYo.Msg.AT_THE_RIGHT)
    )
  case eYo.T3.Expr.identifier_defined:
    return goog.dom.createDom(goog.dom.TagName.SPAN, null,
      eYo.Do.createSPAN('= ', 'eyo-code'),
      eYo.Do.createSPAN('…', 'eyo-code-placeholder'),
      goog.dom.createTextNode(' ' + eYo.Msg.AT_THE_RIGHT)
    )
  case eYo.T3.Expr.proper_slice:
    switch (subtype) {
    case eYo.Key.LOWER_BOUND:
      return goog.dom.createDom(goog.dom.TagName.SPAN, null,
        eYo.Do.createSPAN(':', 'eyo-code'),
        eYo.Do.createSPAN('…', 'eyo-code-placeholder'),
        eYo.Do.createSPAN(':', 'eyo-code'),
        eYo.Do.createSPAN('…', 'eyo-code-placeholder'),
        goog.dom.createTextNode(' ' + eYo.Msg.AT_THE_RIGHT)
      )
    case eYo.Key.UPPER_BOUND:
      return goog.dom.createDom(goog.dom.TagName.SPAN, null,
        eYo.Do.createSPAN('…', 'eyo-code-placeholder'),
        eYo.Do.createSPAN(':', 'eyo-code'),
        goog.dom.createTextNode(' ' + eYo.Msg.AND + ' '),
        eYo.Do.createSPAN(':', 'eyo-code'),
        eYo.Do.createSPAN('…', 'eyo-code-placeholder'),
        goog.dom.createTextNode(' ' + eYo.Msg.AROUND)
      )
    case eYo.Key.STRIDE:
    default:
      return goog.dom.createDom(goog.dom.TagName.SPAN, null,
        eYo.Do.createSPAN('…', 'eyo-code-placeholder'),
        eYo.Do.createSPAN(':', 'eyo-code'),
        eYo.Do.createSPAN('…', 'eyo-code-placeholder'),
        eYo.Do.createSPAN(':', 'eyo-code'),
        goog.dom.createTextNode(' ' + eYo.Msg.AT_THE_LEFT)
      )
    }
  case eYo.T3.Expr.expression_as_name:
    switch (subtype) {
    case eYo.Key.AS:
      return goog.dom.createDom(goog.dom.TagName.SPAN, null,
        eYo.Do.createSPAN('expression ', 'eyo-code-placeholder'),
        eYo.Do.createSPAN('as', 'eyo-code-reserved'),
        goog.dom.createTextNode(' ' + eYo.Msg.AT_THE_LEFT)
      )
    case eYo.Key.EXPRESSION:
    default:
      return goog.dom.createDom(goog.dom.TagName.SPAN, null,
        eYo.Do.createSPAN('as', 'eyo-code-reserved'),
        eYo.Do.createSPAN(' name', 'eyo-code-placeholder'),
        goog.dom.createTextNode(' ' + eYo.Msg.AT_THE_RIGHT)
      )
    }
  case eYo.T3.Expr.slicing:
    return goog.dom.createDom(goog.dom.TagName.SPAN, null,
      eYo.Do.createSPAN('[', 'eyo-code'),
      eYo.Do.createSPAN('…', 'eyo-code-placeholder'),
      eYo.Do.createSPAN(']', 'eyo-code'),
      goog.dom.createTextNode(' ' + eYo.Msg.AT_THE_RIGHT)
    )
  case eYo.T3.Expr.call_expr:
  case eYo.T3.Expr.decorator_call_expr:
    return goog.dom.createDom(goog.dom.TagName.SPAN, null,
      eYo.Do.createSPAN('(', 'eyo-code'),
      eYo.Do.createSPAN('…', 'eyo-code-placeholder'),
      eYo.Do.createSPAN(')', 'eyo-code'),
      goog.dom.createTextNode(' ' + eYo.Msg.AT_THE_RIGHT)
    )
  case eYo.T3.Expr.funcdef_typed:
    return goog.dom.createDom(goog.dom.TagName.SPAN, null,
      eYo.Do.createSPAN('->', 'eyo-code'),
      eYo.Do.createSPAN(' …', 'eyo-code-placeholder'),
      goog.dom.createTextNode(' ' + eYo.Msg.AT_THE_RIGHT)
    )
  case eYo.T3.Expr.dotted_name_as:
  case eYo.T3.Expr.identifier_as:
    return goog.dom.createDom(goog.dom.TagName.SPAN, null,
      eYo.Do.createSPAN('as', 'eyo-code-reserved'),
      eYo.Do.createSPAN(' alias', 'eyo-code-placeholder')
    )
  case eYo.T3.Expr.u_expr:
    return goog.dom.createDom(goog.dom.TagName.SPAN, null,
      eYo.Do.createSPAN('-', 'eyo-code'),
      goog.dom.createTextNode(' ' + eYo.Msg.AT_THE_LEFT)
    )
  case eYo.T3.Expr.imagnumber:
    return goog.dom.createDom(goog.dom.TagName.SPAN, null,
      eYo.Do.createSPAN('j', 'eyo-code'),
      goog.dom.createTextNode(' ' + eYo.Msg.AT_THE_RIGHT)
    )
  case eYo.T3.Expr.parenth_form:
    return goog.dom.createDom(goog.dom.TagName.SPAN, null,
      eYo.Do.createSPAN('(', 'eyo-code'),
      goog.dom.createTextNode(' ' + eYo.Msg.AND + ' '),
      eYo.Do.createSPAN(')', 'eyo-code'),
      goog.dom.createTextNode(' ' + eYo.Msg.AROUND)
    )
  case eYo.T3.Expr.list_display:
    return goog.dom.createDom(goog.dom.TagName.SPAN, null,
      eYo.Do.createSPAN('[', 'eyo-code'),
      goog.dom.createTextNode(' ' + eYo.Msg.AND + ' '),
      eYo.Do.createSPAN(']', 'eyo-code'),
      goog.dom.createTextNode(' ' + eYo.Msg.AROUND)
    )
  case eYo.T3.Expr.set_display:
  case eYo.T3.Expr.dict_display:
    return goog.dom.createDom(goog.dom.TagName.SPAN, null,
      eYo.Do.createSPAN('{', 'eyo-code'),
      goog.dom.createTextNode(' ' + eYo.Msg.AND + ' '),
      eYo.Do.createSPAN('}', 'eyo-code'),
      goog.dom.createTextNode(' ' + eYo.Msg.AROUND)
    )
  case eYo.T3.Stmt.if_part: return Stmt1('if')
  case eYo.T3.Stmt.elif_part: return Stmt1('elif')
  case eYo.T3.Stmt.for_part: return Stmt1('for')
  case eYo.T3.Stmt.while_part: return Stmt1('while')
  case eYo.T3.Stmt.try_part: return Stmt2('try')
  case eYo.T3.Stmt.except_part: return Stmt1('except')
  case eYo.T3.Stmt.void_except_part:return Stmt2('except')
  case eYo.T3.Stmt.else_part:return Stmt2('else')
  case eYo.T3.Stmt.finally_part:return Stmt2('finally')
  case eYo.T3.Stmt.with_part: return Stmt1('with')
  case eYo.T3.Stmt.expression_stmt:
    return goog.dom.createDom(goog.dom.TagName.SPAN, null,
      eYo.Do.createSPAN('#', 'eyo-code-reserved'),
      eYo.Do.createSPAN(' comment', 'eyo-code-placeholder')
    )
  case eYo.T3.Stmt.assignment_stmt:
    return goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code-placeholder',
      goog.dom.createTextNode('name'),
      eYo.Do.createSPAN(' = ', 'eyo-code-reserved'),
      goog.dom.createTextNode('value')
    )
  case eYo.T3.Stmt.print_stmt:
    return goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
      eYo.Do.createSPAN('print', 'eyo-code-reserved'),
      goog.dom.createTextNode('(…)')
    )
  case eYo.T3.Stmt.builtin__input_stmt:
    return goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
      eYo.Do.createSPAN('input', 'eyo-code-reserved'),
      goog.dom.createTextNode('(…)')
    )
  default:
    return 'Parent ' + type
  }
}

/**
 * Populate the context menu for the given block and model.
 * Only for expressions.
 * `model.type` is the type of the to be inserted parent block.
 * `model.input` is the slot where the actual block should be connected.
 * @param {!Blockly.Block} block The block.
 * @param {!Object} model the type of the parent to be and target input.
 * @private
 */
eYo.MenuManager.prototype.populate_insert_as_top_parent = function (block, model) {
  // THIS IS BROKEN SINCE THE SLOT KEYS ARE NO LONGER INTEGERS
  var c8n = block.outputConnection
  if (!c8n) {
    // this is a statement block
    return false
  }
  /** @suppress {accessControls} */
  var outCheck = c8n.check_
  var D = eYo.Delegate.Manager.getModel(model.type).slots
  // if the block which type is model.type has no slot
  // no chance to insert anything, pass away
  if (D) {
  var self = this
    var F = function (K) {
      var d = D[K]
      // d is a slotModel for a block with type model.type
      if ((d && d.key && ((!model.input && !d.wrap) || d.key === model.input))) {
        if (outCheck) {
          var check = d.check && d.check(model.type)
          if (check) {
            var found = false
            var _ = 0
            var c
            while ((c = check[_++])) {
              if (outCheck.indexOf(c) >= 0) {
                found = true
                break
              }
            }
            if (!found) {
              return false
            }
          }
        }
        var key = d.key
        var content = self.get_menuitem_content(model.type, key)
        var MI = self.newMenuItem(content, function () {
          block.eyo.insertParentWithModel(model, key)
        })
        self.addInsertChild(MI)
        return true
      } else if (d && d.wrap && !parent_subtype) {
        var list = eYo.Delegate.Manager.getModel(d.wrap).list
        if (!list) {
          if (!outCheck || goog.array.contains(outCheck, d.wrap)) {
            key = d.key || K
            content = self.get_menuitem_content(parent_type, key)
            MI = self.newMenuItem(content, function () {
              block.eyo.insertParentWithModel(model, key)
            })
            self.addInsertChild(MI)
            return true
          }
          return false
        }
        // the wrapped block is a list
        var listCheck = list.all || list.check || (list.consolidator && list.consolidator.data && list.consolidator.data.check)
        check = goog.isFunction(listCheck)
          ? listCheck.call(model.type)
          : listCheck
        if (outCheck && check) {
          found = false
          _ = 0
          while ((c = check[_++])) {
            if (outCheck.indexOf(c) >= 0) {
              found = true
              break
            }
          }
          if (!found) {
            return false
          }
        }
        content = self.get_menuitem_content(model.type)
        MI = self.newMenuItem(content, function () {
          block.eyo.insertParentWithModel(model)
        })
        self.addInsertChild(MI)
        return true
      }
      return false
    }
    return F(1) || F(2) || F(3) || F(4)
  }
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
eYo.MenuManager.prototype.populate_insert_parent = function (block, model, top) {
  // can we insert a block typed type between the block and
  // the target of its output connection
  var outputC8n = block.outputConnection
  if (outputC8n) {
    var inputC8n = outputC8n.targetConnection
    if (!inputC8n) {
      if (top) {
        this.populate_insert_as_top_parent(block, model)
      }
      return
    }
    var check = inputC8n.check_
    if (check && check.indexOf(model.type) < 0) {
      // the target connection won't accept block
      return
    }
    this.populate_insert_as_top_parent(block, model)
  }
}

/**
 * Populate the context menu for the given block.
 * Only for expressions.
 * @param {!Blockly.Block} block The block.
 * @param {!string|Object} model the subtype is for example the input name through which parent and children are connected.
 * @private
 * @return true if an item were added to the remove menu
 */
eYo.MenuManager.prototype.populate_replace_parent = function (block, model) {
  var parent = block.getParent()
  if (parent && parent.type === model.type) {
    var eyo = block.eyo
    var input = eyo.getParentInput()
    if (model.input && input.name !== model.input) {
      return false
    }
    if (!eyo.wrapped_ || eyo.canUnwrap()) {
      if (eyo.canReplaceBlock(parent)) {
        var content = this.get_menuitem_content(model.type, input && input.name)
        if (content) {
          var MI = this.newMenuItem(content, function () {
            eyo.replaceBlock(parent)
          })
          this.addRemoveChild(MI)
          console.log(block.type, ' replace ', parent.type)
          return true
        }
      }
    }
  }
  return false
}

/**
 * Populate the context menu for the given block.
 * Only for statements.
 * @param {!Blockly.Block} block The block.
 * @private
 */
eYo.MenuManager.prototype.populate_before_after = function (block) {
  // Disable undo registration for a while
  var Ts = [
    eYo.T3.Stmt.if_part,
    eYo.T3.Stmt.elif_part,
    eYo.T3.Stmt.for_part,
    eYo.T3.Stmt.while_part,
    eYo.T3.Stmt.try_part,
    eYo.T3.Stmt.except_part,
    eYo.T3.Stmt.void_except_part,
    eYo.T3.Stmt.else_part,
    eYo.T3.Stmt.finally_part,
    eYo.T3.Stmt.with_part
    // eYo.T3.Stmt.decorator_stmt,
    // eYo.T3.Stmt.funcdef_part,
    // eYo.T3.Stmt.classdef_part,
    // eYo.T3.Stmt.import_stmt,
  ]
  var Us = [
    eYo.T3.Stmt.comment_any, // defined
    eYo.T3.Stmt.assignment_stmt,
    eYo.T3.Stmt.print_stmt, // JL defined?
    eYo.T3.Stmt.builtin__input_stmt// JL defined?
  ]
  var F = function (action, self, type) {
    return (function () {
      // create a closure that catches the value of the loop variable
      return function () {
        action.call(self, type)
      }
    }) ()
  }
  var /** !eYo.Connection */ c8n, sep
  var F_after = /** @suppress{accessControls} */ (targetC8n, type) => {
    var B = block.workspace.newBlock(type)
    var yorn = B.previousConnection &&
    B.previousConnection.checkType_(c8n) &&
    (!targetC8n || (B.nextConnection && targetC8n.checkType_(B.nextConnection)))
    B.dispose(true)
    if (yorn) {
      var content = this.get_menuitem_content(type)
      var MI = this.newMenuItem(content, F(block.eyo.insertBlockAfter, block.eyo, type))
      this.addInsertAfterChild(MI)
      return true
    }
    return false
  }
  var F_before = /** @suppress{accessControls} */ (targetC8n, type) => {
    var B = block.workspace.newBlock(type)
    var yorn = B.nextConnection &&
    B.nextConnection.checkType_(c8n) &&
    (!targetC8n || (B.previousConnection && targetC8n.checkType_(B.previousConnection)))
    B.dispose(true)
    if (yorn) {
      var content = this.get_menuitem_content(type)
      var MI = this.newMenuItem(content, F(block.eyo.insertParentWithModel, block.eyo, type))
      this.addInsertBeforeChild(MI)
      return true
    }
    return false
  }
  eYo.Events.disableWrap(() => {
    if ((c8n = block.nextConnection)) {
      var targetC8n = c8n.targetConnection
      for (var _ = 0, type; (type = Us[_++]);) {
        sep = F_after(targetC8n, type) || sep
      }
      this.shouldSeparateInsertAfter(sep)
      for (_ = 0; (type = Ts[_++]);) {
        sep = F_after(targetC8n, type) || sep
      }
      this.shouldSeparateInsertAfter(sep)
    }
    if ((c8n = block.previousConnection)) {
      targetC8n = c8n.targetConnection
      for (_ = 0; (type = Us[_++]);) {
        sep = F_before(targetC8n, type) || sep
      }
      this.shouldSeparateInsertBefore(sep)
      for (_ = 0; (type = Ts[_++]);) {
        sep = F_before(targetC8n, type) || sep
      }
      this.shouldSeparateInsertBefore(sep)
    }
  })
}

/**
 * Populate the context menu for the given block.
 * Only for expressions.
 * @param {!Blockly.Block} block The block.
 * @private
 */
eYo.MenuManager.prototype.populate_movable_parent = function (block) {
  var F = function (movable, yorn = false) {
    for (var _ = 0, type; (type = movable[_++]);) {
      var model = {}
      if (goog.isArray(type)) {
        model.type = type[0]
        model.input = type[1]
      } else {
        model.type = type
      }
      this.populate_insert_parent(block, model, yorn)
      this.populate_replace_parent(block, model)
    }
  }
  F.call(this, [
    eYo.T3.Expr.u_expr,
    [eYo.T3.Expr.call_expr, eYo.Key.ROOT],
    eYo.T3.Expr.slicing,
    [eYo.T3.Expr.attributeref, eYo.Key.ATTRIBUTE],
    [eYo.T3.Expr.attributeref, eYo.Key.ROOT],
    [eYo.T3.Expr.decorator_call_expr, eYo.Key.NAME],
    eYo.T3.Expr.imagnumber
  ], true)
  F.call(this, [
    [eYo.T3.Expr.expression_as_name, eYo.Key.AS],
    [eYo.T3.Expr.expression_as_name, eYo.Key.EXPRESSION]
  ])
  this.shouldSeparateInsert()
  this.shouldSeparateRemove()
  F.call(this, [
    eYo.T3.Expr.parenth_form,
    eYo.T3.Expr.list_display,
    eYo.T3.Expr.set_display,
    eYo.T3.Expr.dict_display,
    [eYo.T3.Expr.funcdef_part, eYo.Key.DEFINITION]
  ], true)
  F.call(this, [
    eYo.T3.Expr.parent_module,
    eYo.T3.Expr.dotted_name_as,
    eYo.T3.Expr.identifier_as,
    [eYo.T3.Expr.key_datum, eYo.Key.NAME],
    [eYo.T3.Expr.identifier, eYo.Key.NAME],
    [eYo.T3.Expr.proper_slice, eYo.Key.UPPER_BOUND],
    [eYo.T3.Expr.proper_slice, eYo.Key.STRIDE],
    [eYo.T3.Expr.proper_slice, eYo.Key.LOWER_BOUND]
  ])
}

/// //////////// SUBTYPES

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @private
 */
eYo.MenuManager.prototype.populateProperties = function (block, key) {
  var eyo = block.eyo
  var data = eyo.data[key]
  var properties = data.getAll()
  if (properties && properties.length > 1) {
    var current = data.get()
    var F = function (property) {
      var menuItem = this.newMenuItem(eyo.makeTitle(property, key), function () {
        data.set(property)
      })
      menuItem.setEnabled(current !== property)
      this.addChild(menuItem, true)
      goog.dom.classlist.add(/** Element */(menuItem.getElement().firstChild), 'eyo-code')
    }
    for (var i = 0; i < properties.length; i++) {
      F.call(this, properties[i])
    }
    return true
  }
  return false
}
