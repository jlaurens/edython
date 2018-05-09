/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview BlockSvg delegates for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('edY.MenuManager')
goog.require('edY.T3')
goog.require('edY.DelegateSvg')
goog.require('edY.MenuItem')

/**
 * The block that handles the context menu is not always the one
 * which has received the messages.
 * The default handler is the block itself.
 * For wrapper blocks, the handler may be the wrapped block.
 * @param {!Blockly.Block} block The block.
 * @private
 */
edY.DelegateSvg.prototype.getContextMenuHandler = function (block) {
  return block
}

/**
 * Shared context menu manager.
 * One shared menu.
 */
edY.MenuManager = function () {
  this.menu = new edY.PopupMenu(/*undefined, ContextMenuRenderer*/)
  this.insertSubmenu = new edY.SubMenu(edY.Msg.ADD)
  this.insertBeforeSubmenu = new edY.SubMenu(edY.Msg.ADD_BEFORE)
  this.insertAfterSubmenu = new edY.SubMenu(edY.Msg.ADD_AFTER)
  this.removeSubmenu = new edY.SubMenu(edY.Msg.REMOVE)
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

edY.MenuManager.shared = function() {
  var out = undefined
  return function() {
    return out ? out: (out = new edY.MenuManager())
  }
} ()

/**
 * Get the menu, in case clients may want to populate it directly.
 * Each manager has its own menu.
 */
edY.MenuManager.prototype.menu = undefined

/**
 * Add a separator.
 */
edY.MenuManager.prototype.separate = function (render = true) {
  this.shouldSeparate_ = false
  if (this.menu.getChildCount()) {
    this.menu.addChild(new edY.Separator(), render)
  }
  this.didSeparate_ = true
}

/**
 * Add a separator.
 */
edY.MenuManager.prototype.separateInsert = function (render = true) {
  this.shouldSeparateInsert_ = false
  if (this.insertSubmenu.getItemCount()) {
    this.addInsertChild(new edY.Separator(), render)
  }
  this.didSeparateInsert_ = true
}

/**
 * Add a separator.
 */
edY.MenuManager.prototype.separateInsertBefore = function (render = true) {
  this.shouldSeparateInsertBefore_ = false
  if (this.insertBeforeSubmenu.getItemCount()) {
    this.addInsertBeforeChild(new edY.Separator(), render)
  }
  this.didSeparateInsertBefore_ = true
}

/**
 * Add a separator.
 */
edY.MenuManager.prototype.separateInsertAfter = function (render = true) {
  this.shouldSeparateInsertAfter_ = false
  if (this.insertAfterSubmenu.getItemCount()) {
    this.addInsertAfterChild(new edY.Separator(), render)
  }
  this.didSeparateInsertAfter_ = true
}

/**
 * Add a separator.
 */
edY.MenuManager.prototype.separateRemove = function (render = true) {
  this.shouldSeparateRemove_ = false
  if (this.removeSubmenu.getItemCount()) {
    this.addRemoveChild(new edY.Separator(), render)
  }
  this.didSeparateRemove_ = true
}

/**
 * Whether a separator should be inserted before any forthcoming menu item.
 */
edY.MenuManager.prototype.shouldSeparate = function(yorn = true) {
  this.shouldSeparate_  = !this.didSeparate_ && (this.shouldSeparate_ || yorn)
  // console.log('shouldSeparate_', yorn, this.shouldSeparate_)
}

/**
 * Whether a separator should be inserted before any forthcoming menu item.
 */
edY.MenuManager.prototype.shouldSeparateInsert = function(yorn = true) {
  this.shouldSeparateInsert_  = !this.didSeparateInsert_ && (this.shouldSeparateInsert_ || yorn)
  // console.log('shouldSeparate_', yorn, this.shouldSeparate_)
}

/**
 * Whether a separator should be inserted before any forthcoming menu item.
 */
edY.MenuManager.prototype.shouldSeparateRemove = function(yorn = true) {
  this.shouldSeparateRemove_  = !this.didSeparateRemove_ && (this.shouldSeparateRemove_ || yorn)
}

/**
 * Whether a separator should be inserted before any forthcoming menu item.
 */
edY.MenuManager.prototype.shouldSeparateInsertBefore = function(yorn = true) {
  this.shouldSeparateInsertBefore_  = !this.didSeparateInsertBefore_ && (this.shouldSeparateInsertBefore_ || yorn)
  // console.log('shouldSeparateBefore_', yorn, this.shouldSeparateBefore_)
}

/**
 * Whether a separator should be inserted before any forthcoming menu item.
 */
edY.MenuManager.prototype.shouldSeparateInsertAfter = function(yorn = true) {
  this.shouldSeparateInsertAfter_  = !this.didSeparateInsertAfter_ && (this.shouldSeparateInsertAfter_ || yorn)
  // console.log('shouldSeparateAfter_', yorn, this.shouldSeparateAfter_)
}

/**
 * Add a menu item.
 */
edY.MenuManager.prototype.addChild = function (menuItem, render = true) {
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
edY.MenuManager.prototype.addInsertChild = function (menuItem, render = true) {
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
edY.MenuManager.prototype.addInsertBeforeChild = function (menuItem, render = true) {
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
edY.MenuManager.prototype.addInsertAfterChild = function (menuItem, render = true) {
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
edY.MenuManager.prototype.addRemoveChild = function (menuItem, render = true) {
  this.removeSubmenu.addItem(menuItem)
}

/**
 * Records the block and the event.
 * Removes all the previous menu items.
 * @param {!Blockly.Block} block The block.
 * @param {!Event} e Mouse event.
 * @private
 */
edY.MenuManager.prototype.init = function (block, e) {
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
edY.MenuManager.prototype.showMenu = function (block, e) {
  if (this.menu.isVisible()) {
    this.menu.hide()
    return
  }
  var ee = block.edy.lastMouseDownEvent
  if (ee) {
    // this block was selected when the mouse down event was sent
    if (ee.clientX === e.clientX && ee.clientY === e.clientY) {
      if (block === Blockly.selected) {
        // if the block was already selected,
        // try to select an input connection
        edY.SelectedConnection.set(block.edy.lastSelectedConnection)
      }
    }
  }
  var target = block.edy.getMenuTarget(block)
  this.init(target, e)
  var me = this
  me.alreadyListened = false
  var parent, sep
  parent = target
  this.populate_before_after(block)
  sep = parent.edy.populateContextMenuFirst_(parent, this)
  while (parent !== block) {
    parent = parent.getParent()
    sep = parent.edy.populateContextMenuFirst_(parent, this) || sep
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
  sep = block.edy.populateContextMenuComment && block.edy.populateContextMenuComment(block, this)
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
  sep = parent.edy.populateContextMenuMiddle_(parent, this)
  while (parent !== block) {
    parent = parent.getParent()
    sep = parent.edy.populateContextMenuMiddle_(parent, this) || sep
  }
  this.shouldSeparate(sep) // this algorithm needs more thinking
  block.edy.populateContextMenuLast_(block, this)
  this.insertSubmenu.setEnabled(this.insertSubmenu.getMenu().getChildCount() > 0)
  this.removeSubmenu.setEnabled(this.removeSubmenu.getMenu().getChildCount() > 0)
  goog.events.listenOnce(this.menu, 'action', function (event) {
    setTimeout(function () {// try/finally?
      if (me.alreadyListened) {
        console.log('************* I have already listened!')
        return
      }
      me.alreadyListened = true
      var model = event.target && event.target.getModel()
      if (goog.isFunction(model)) {
        model(event)
      } else {
        target.edy.handleMenuItemActionFirst(target, me, event)
        || target.edy.handleMenuItemActionMiddle(target, me, event)
        || target.edy.handleMenuItemActionLast(target, me, event)
      }
      me.init()
    }, 10)// TODO be sure that this 100 is suffisant
  })
  var bBox = block.edy.svgPathShape_.getBBox()
  var scaledHeight = bBox.height * block.workspace.scale
  var xy = goog.style.getPageOffset(block.svgGroup_)
  this.menu.showMenu(block.svgGroup_, xy.x, xy.y + scaledHeight+2)
}

edY.ID.DUPLICATE_BLOCK = 'DUPLICATE_BLOCK'
edY.ID.REMOVE_COMMENT = 'REMOVE_COMMENT'
edY.ID.ADD_COMMENT = 'ADD_COMMENT'
edY.ID.EXPAND_BLOCK = 'EXPAND_BLOCK'
edY.ID.COLLAPSE_BLOCK = 'COLLAPSE_BLOCK'
edY.ID.TOGGLE_ENABLE_BLOCK = 'TOGGLE_ENABLE_BLOCK'
edY.ID.DELETE_BLOCK = 'DELETE_BLOCK'
edY.ID.HELP = 'HELP'

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!edY.MenuManager} mgr The context menu manager.
 * @private
 */
edY.Delegate.prototype.populateContextMenuFirst_ = function (block, mgr) {
  mgr.shouldSeparate()
  mgr.populate_movable_parent(block)
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!edY.MenuManager} mgr The context menu manager.
 * @private
 */
edY.Delegate.prototype.populateContextMenuMiddle_ = function (block, mgr) {
  return false
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!edY.MenuManager} mgr The context menu manager.
 * @private
 */
edY.Delegate.prototype.populateContextMenuLast_ = function (block, mgr) {
  return mgr.populateLast(block)
}

/**
 * Populate the context menu.
 */
edY.MenuManager.prototype.populateLast = function (block) {
  var menuItem
  var c8n = edY.SelectedConnection.get()
  var holes = edY.HoleFiller.getDeepHoles(c8n || block)
  menuItem = new edY.MenuItem(
    edY.Msg.FILL_DEEP_HOLES, function() {
      Blockly.Events.setGroup(true)
      try {
        edY.HoleFiller.fillDeepHoles(block.workspace, holes)
      } finally {
        Blockly.Events.setGroup(false)
      }
    })
    menuItem.setEnabled(holes.length > 0);
  this.addChild(menuItem, true)
  if (block.isMovable() && !block.isInFlyout) {
    if (block.edy.canUnlock(block)) {
      menuItem = new edY.MenuItem(edY.Msg.UNLOCK_BLOCK,
        function(event) {
          Blockly.Events.setGroup(true)
          try {
            block.edy.unlock(block)
          } finally {
            Blockly.Events.setGroup(false)
          }
        }
      )
      this.addChild(menuItem, true)
    }
    if (block.edy.canLock(block)) {
      menuItem = new edY.MenuItem(edY.Msg.LOCK_BLOCK,
        function(event) {
          Blockly.Events.setGroup(true)
          try {
            block.edy.lock(block)
          } finally {
            Blockly.Events.setGroup(false)
          }
        }
      )
      this.addChild(menuItem, true)
    }
  }
  if (block.isDeletable() && block.isMovable() && !block.isInFlyout) {
    // Option to duplicate this block.
    menuItem = new edY.MenuItem(
      Blockly.Msg.DUPLICATE_BLOCK,
      {action: edY.ID.DUPLICATE_BLOCK,
      target: block,})
    this.addChild(menuItem, true)
    if (block.getDescendants().length > block.workspace.remainingCapacity()) {
      menuItem.setEnabled(false);
    }
  }
  if (block.isEditable() && !block.collapsed_ &&
    block.workspace.options.comments) {
    // Option to add/remove a comment.
    if (block.comment) {
      menuItem = new edY.MenuItem(
        Blockly.Msg.REMOVE_COMMENT,
        {action: edY.ID.REMOVE_COMMENT,
        target: block,})
    } else {
      menuItem = new edY.MenuItem(
        Blockly.Msg.ADD_COMMENT,
        {action: edY.ID.ADD_COMMENT,
          target: block,})
    }
    menuItem.setEnabled(false && !goog.userAgent.IE && !block.outputConnection)
    this.addChild(menuItem, true)
  }
  if (block.workspace.options.collapse) {
    if (block.collapsed_) {
      menuItem = new edY.MenuItem(
        Blockly.Msg.EXPAND_BLOCK,
        {action: edY.ID.EXPAND_BLOCK,
          target: block,})
      menuItem.setEnabled(true)
    } else {
      menuItem = new edY.MenuItem(
        Blockly.Msg.COLLAPSE_BLOCK,
        {action: edY.ID.COLLAPSE_BLOCK,
          target: block,})
      menuItem.setEnabled(block.edy.getStatementCount(block) > 2)
    }
    this.addChild(menuItem, true)
  }
  if (block.workspace.options.disable) {
    menuItem = new edY.MenuItem(
      block.disabled
        ? Blockly.Msg.ENABLE_BLOCK : Blockly.Msg.DISABLE_BLOCK,
      {action: edY.ID.TOGGLE_ENABLE_BLOCK,
        target: block,})
    menuItem.setEnabled(!block.outputConnection)
    this.addChild(menuItem, true)
  }
  if (block.isDeletable() && block.isMovable() && !block.isInFlyout) {
    // Count the number of blocks that are nested in this block.
    var unwrapped = block
    var parent = undefined
    while (unwrapped.edy.wrapped_ && (parent = unwrapped.getParent())) {
      // parent is not '', it may be undefined
      unwrapped = parent
      // replace the parent test with an assertion
    }
    // unwrapped is the topmost block or the first unwrapped parent
    var descendantCount = unwrapped.edy.getWrappedDescendants(unwrapped).length
    if (parent === null) {
      // the topmost is itself sealed, this should not occur
      ++descendantCount
    }
    var nextBlock = unwrapped.getNextBlock()
    if (nextBlock) {
      // Blocks in the current stack would survive this block's deletion.
      descendantCount -= nextBlock.edy.getWrappedDescendants(nextBlock).length
    }
    menuItem = new edY.MenuItem(
      descendantCount === 1 ? Blockly.Msg.DELETE_BLOCK
        : Blockly.Msg.DELETE_X_BLOCKS.replace('%1', String(descendantCount)),
      {action: edY.ID.DELETE_BLOCK,
        target: block,})
    menuItem.setEnabled(true)
    this.addChild(menuItem, true)
  }
  // help
  var url = goog.isFunction(block.helpUrl) ? block.helpUrl() : block.helpUrl
  menuItem = new edY.MenuItem(
    Blockly.Msg.HELP,
    {action: edY.ID.HELP,
      target: block,})
  menuItem.setEnabled(!!url)
  this.addChild(menuItem, true)
  this.separate()
  
  menuItem = new edY.MenuItem(
    block.edy.getPythonType(block), function(event) {
      var xmlDom = Blockly.Xml.blockToDom(block, true)
      var xmlText = Blockly.Xml.domToText(xmlDom)
      console.log(xmlText)
    }
  )
  menuItem.setEnabled(true)
  this.addChild(menuItem, true)

  menuItem = new edY.MenuItem(
    block.edy.getPythonType(block)+' python code',
    function(b, e) {
      console.log('Python code for', block.type)
      console.log(block.edy.toPython(block))  
    })
  menuItem.setEnabled(true)
  this.addChild(menuItem, true)

  menuItem = new edY.MenuItem(
    block.edy.getPythonType(block)+' python code (deep)',
    function(b, e) {
      console.log('Python code for', block.type)
      console.log(block.edy.toPython(block, true))  
    })
  menuItem.setEnabled(true)
  this.addChild(menuItem, true)

  menuItem = new edY.MenuItem(
    'workspace',
    function(b, e) {
      var xmlDom = Blockly.Xml.workspaceToDom(block.workspace)
      var xmlText = Blockly.Xml.domToText(xmlDom)
      console.log(xmlText)
    })
  menuItem.setEnabled(true)
  this.addChild(menuItem, true)

  if (block.edy.plugged_) {
    menuItem = new edY.MenuItem(
      block.edy.plugged_.substring(4)
    )
    menuItem.setEnabled(false)
    this.addChild(menuItem, true)
  }
}

/**
 * Handle the selection of an item in the context dropdown menu.
 * Intended to be overriden.
 * @param {!Blockly.Block} block
 * @param {!edY.MenuManager} mgr
 * @param {!goog....} event The event containing as target
 */
edY.DelegateSvg.prototype.handleMenuItemActionFirst = function (block, mgr, event) {
  return mgr.handleAction_movable_parent(block, event)
}

/**
 * Handle the selection of an item in the context dropdown menu.
 * Intended to be overriden.
 * @param {!Blockly.Block} block
 * @param {!edY.MenuManager} mgr
 * @param {!goog....} event The event containing as target
 */
edY.DelegateSvg.prototype.handleMenuItemActionMiddle = function (block, mgr, event) {
  return false
}

/**
 * Handle the selection of an item in the context dropdown menu.
 * Intended to be overriden.
 * @param {!Blockly.Block} block
 * @param {!edY.MenuManager} mgr
 * @param {!goog....} event The event containing as target
 */
edY.DelegateSvg.prototype.handleMenuItemActionLast = function (block, mgr, event) {
  return mgr.handleActionLast(block, event)
}

/**
 * Handle the selection of an item in the context dropdown menu.
 * Default implementation mimics Blockly behaviour.
 * Unlikely to be overriden.
 * @param {!goog....} event The event containing as target
 * the MenuItem selected within menu.
 */
edY.MenuManager.prototype.handleActionLast = function (block, event) {
  var workspace = block.workspace
  var model = event.target.getModel()
  if (goog.isFunction(model)) {
    setTimeout(function() {
      model(block, event)
    }, 100)
    return true
  }
  var target = model.target || block
  switch(model.action) {
    case edY.ID.DUPLICATE_BLOCK:
      Blockly.duplicate_(target)
      return true
    case edY.ID.REMOVE_COMMENT:
    target.setCommentText(null)
      return true
    case edY.ID.ADD_COMMENT:
    target.setCommentText('')
      return true
    case edY.ID.EXPAND_BLOCK:
    target.setCollapsed(false)
      return true
    case edY.ID.COLLAPSE_BLOCK:
    target.setCollapsed(true)
      return true
    case edY.ID.TOGGLE_ENABLE_BLOCK:
    target.edy.setDisabled(target, !target.disabled)  
      return true
    case edY.ID.DELETE_BLOCK:
      var unwrapped = target
      var parent
      while (unwrapped.edy.wrapped_ && (parent = unwrapped.getSurroundParent())) {
        unwrapped = parent
      }
      // unwrapped is the topmost block or the first unwrapped parent
      Blockly.Events.setGroup(true)
      var returnState = false
      try {
        if (target === Blockly.selected && target != unwrapped) {
          // this block was selected, select the block below or above before deletion
          var c8n, target
          if (((c8n = unwrapped.nextConnection) && (target = c8n.targetBlock())) || ((c8n = unwrapped.previousConnection) && (target = c8n.targetBlock()))) {
            target.select()
          } else if ((c8n = unwrapped.outputConnection) && (c8n = c8n.targetConnection)) {
            target = c8n.sourceBlock_
            target.select()
            edY.SelectedConnection.set(c8n)
          }
        }
        unwrapped.dispose(true, true)
        returnState = true
      } finally {
        Blockly.Events.setGroup(false)
      }
      return returnState
    case edY.ID.HELP:
    target.showHelp_()
      return true
  }
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!edY.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
edY.MenuManager.prototype.populateVariable_ = function (block) {
  return false
}

/**
 * Handle the selection of an item in the first part of the context dropdown menu.
 * Default implementation returns false.
 * @param {!Blockly.Block} block The Menu component clicked.
 * @param {!goog....} event The event containing as target
 * the MenuItem selected within menu.
 */
edY.MenuManager.prototype.handleAction_movable_parent = function (block, event) {
  var model = event.target.getModel()
  if (goog.isFunction(model)) {
    setTimeout(function() {
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
edY.MenuManager.prototype.handleAction_movable_parent_module = edY.MenuManager.prototype.handleAction_movable_parent

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @private
 */
edY.MenuManager.prototype.get_menuitem_content = function (type, subtype) {
  var Stmt1 = function(key) {
    return goog.dom.createDom(goog.dom.TagName.SPAN, null,
      edY.Do.createSPAN(key, 'edy-code-reserved'),
      edY.Do.createSPAN(' … ', 'edy-code-placeholder'),
      edY.Do.createSPAN(':', 'edy-code-reserved'),
    )
  }
  var Stmt2 = function(key) {
    return goog.dom.createDom(goog.dom.TagName.SPAN, null,
      edY.Do.createSPAN(key+':', 'edy-code-reserved'),
    )
  }
  switch(type) {
    case edY.T3.Expr.parent_module: 
    return goog.dom.createDom(goog.dom.TagName.SPAN, null,
      edY.Do.createSPAN('.', 'edy-code'),
      goog.dom.createTextNode(' '+edY.Msg.AT_THE_LEFT),
    )
    case edY.T3.Expr.attributeref:
    switch(subtype) {
      case edY.Key.PRIMARY:
      return goog.dom.createDom(goog.dom.TagName.SPAN, null,
        edY.Do.createSPAN('.', 'edy-code'),
        edY.Do.createSPAN('attribute', 'edy-code-placeholder'),
        goog.dom.createTextNode(' '+edY.Msg.AT_THE_RIGHT),
      )
      // case edY.Key.ATTRIBUTE:
      default:
      return goog.dom.createDom(goog.dom.TagName.SPAN, null,
        edY.Do.createSPAN('primary', 'edy-code-placeholder'),
        edY.Do.createSPAN('.', 'edy-code'),
        goog.dom.createTextNode(' '+edY.Msg.AT_THE_LEFT),
      )
    }
    case edY.T3.Expr.key_datum_s3d:
    return goog.dom.createDom(goog.dom.TagName.SPAN, null,
      edY.Do.createSPAN(': ', 'edy-code'),
      edY.Do.createSPAN('…', 'edy-code-placeholder'),
      goog.dom.createTextNode(' '+edY.Msg.AT_THE_RIGHT),
    )
    case edY.T3.Expr.defparameter_s3d:
    return goog.dom.createDom(goog.dom.TagName.SPAN, null,
      edY.Do.createSPAN('= ', 'edy-code'),
      edY.Do.createSPAN('…', 'edy-code-placeholder'),
      goog.dom.createTextNode(' '+edY.Msg.AT_THE_RIGHT),
    )
    case edY.T3.Expr.proper_slice:
    switch(subtype) {
      case edY.Key.LOWER_BOUND:
      return goog.dom.createDom(goog.dom.TagName.SPAN, null,
        edY.Do.createSPAN(':', 'edy-code'),
        edY.Do.createSPAN('…', 'edy-code-placeholder'),
        edY.Do.createSPAN(':', 'edy-code'),
        edY.Do.createSPAN('…', 'edy-code-placeholder'),
        goog.dom.createTextNode(' '+edY.Msg.AT_THE_RIGHT),
      )
      case edY.Key.UPPER_BOUND:
      return goog.dom.createDom(goog.dom.TagName.SPAN, null,
        edY.Do.createSPAN('…', 'edy-code-placeholder'),
        edY.Do.createSPAN(':', 'edy-code'),
        goog.dom.createTextNode(' '+edY.Msg.AND+' '),
        edY.Do.createSPAN(':', 'edy-code'),
        edY.Do.createSPAN('…', 'edy-code-placeholder'),
        goog.dom.createTextNode(' '+edY.Msg.AROUND),
      )
      case edY.Key.STRIDE:
      default:
      return goog.dom.createDom(goog.dom.TagName.SPAN, null,
        edY.Do.createSPAN('…', 'edy-code-placeholder'),
        edY.Do.createSPAN(':', 'edy-code'),
        edY.Do.createSPAN('…', 'edy-code-placeholder'),
        edY.Do.createSPAN(':', 'edy-code'),
        goog.dom.createTextNode(' '+edY.Msg.AT_THE_LEFT),
      )
    }
    case edY.T3.Expr.expression_as_name:
    switch(subtype) {
      case edY.Key.AS:
      return goog.dom.createDom(goog.dom.TagName.SPAN, null,
        edY.Do.createSPAN('expression ', 'edy-code-placeholder'),
        edY.Do.createSPAN('as', 'edy-code-reserved'),
        goog.dom.createTextNode(' '+edY.Msg.AT_THE_LEFT),
      )
      case edY.Key.EXPRESSION:
      default:
      return goog.dom.createDom(goog.dom.TagName.SPAN, null,
        edY.Do.createSPAN('as', 'edy-code-reserved'),
        edY.Do.createSPAN(' name', 'edy-code-placeholder'),
        goog.dom.createTextNode(' '+edY.Msg.AT_THE_RIGHT),
      )
    }
    return goog.dom.createDom(goog.dom.TagName.SPAN, null,
      edY.Do.createSPAN('as', 'edy-code-reserved'),
      edY.Do.createSPAN(' name', 'edy-code-placeholder'),
      goog.dom.createTextNode(' '+edY.Msg.AT_THE_RIGHT),
    )
    case edY.T3.Expr.expression_from:
    switch(subtype) {
      case edY.Key.FROM:
      return goog.dom.createDom(goog.dom.TagName.SPAN, null,
        edY.Do.createSPAN('expression ', 'edy-code-placeholder'),
        edY.Do.createSPAN('from', 'edy-code-reserved'),
        goog.dom.createTextNode(' '+edY.Msg.AT_THE_LEFT),
      )
      case edY.Key.EXPRESSION:
      default:
      return goog.dom.createDom(goog.dom.TagName.SPAN, null,
        edY.Do.createSPAN('from', 'edy-code-reserved'),
        edY.Do.createSPAN(' expression', 'edy-code-placeholder'),
        goog.dom.createTextNode(' '+edY.Msg.AT_THE_RIGHT),
      )
    }
    case edY.T3.Expr.slicing:
    return goog.dom.createDom(goog.dom.TagName.SPAN, null,
      edY.Do.createSPAN('[', 'edy-code'),
      edY.Do.createSPAN('…', 'edy-code-placeholder'),
      edY.Do.createSPAN(']', 'edy-code'),
      goog.dom.createTextNode(' '+edY.Msg.AT_THE_RIGHT),
    )
    case edY.T3.Expr.call_expr:
    case edY.T3.Expr.decorator_call_expr:
    return goog.dom.createDom(goog.dom.TagName.SPAN, null,
      edY.Do.createSPAN('(', 'edy-code'),
      edY.Do.createSPAN('…', 'edy-code-placeholder'),
      edY.Do.createSPAN(')', 'edy-code'),
      goog.dom.createTextNode(' '+edY.Msg.AT_THE_RIGHT),
    )
    case edY.T3.Expr.funcdef_typed:
    return goog.dom.createDom(goog.dom.TagName.SPAN, null,
      edY.Do.createSPAN('->', 'edy-code'),
      edY.Do.createSPAN(' …', 'edy-code-placeholder'),
      goog.dom.createTextNode(' '+edY.Msg.AT_THE_RIGHT),
    )
    case edY.T3.Expr.module_as_s3d:
    case edY.T3.Expr.import_identifier_as_s3d:
    return goog.dom.createDom(goog.dom.TagName.SPAN, null,
      edY.Do.createSPAN('as', 'edy-code-reserved'),
      edY.Do.createSPAN(' alias', 'edy-code-placeholder'),
    )
    case edY.T3.Expr.u_expr_s3d:
    return goog.dom.createDom(goog.dom.TagName.SPAN, null,
      edY.Do.createSPAN('-', 'edy-code'),
      goog.dom.createTextNode(' '+edY.Msg.AT_THE_LEFT),
    ) 
    case edY.T3.Expr.imagnumber:
    return goog.dom.createDom(goog.dom.TagName.SPAN, null,
      edY.Do.createSPAN('j', 'edy-code'),
      goog.dom.createTextNode(' '+edY.Msg.AT_THE_RIGHT),
    ) 
    case edY.T3.Expr.parenth_form:
    return goog.dom.createDom(goog.dom.TagName.SPAN, null,
      edY.Do.createSPAN('(', 'edy-code'),
      goog.dom.createTextNode(' '+edY.Msg.AND+' '),
      edY.Do.createSPAN(')', 'edy-code'),
      goog.dom.createTextNode(' '+edY.Msg.AROUND),
    )
    case edY.T3.Expr.list_display:
    return goog.dom.createDom(goog.dom.TagName.SPAN, null,
      edY.Do.createSPAN('[', 'edy-code'),
      goog.dom.createTextNode(' '+edY.Msg.AND+' '),
      edY.Do.createSPAN(']', 'edy-code'),
      goog.dom.createTextNode(' '+edY.Msg.AROUND),
    )
    case edY.T3.Expr.set_display:
    case edY.T3.Expr.dict_display:
    return goog.dom.createDom(goog.dom.TagName.SPAN, null,
      edY.Do.createSPAN('{', 'edy-code'),
      goog.dom.createTextNode(' '+edY.Msg.AND+' '),
      edY.Do.createSPAN('}', 'edy-code'),
      goog.dom.createTextNode(' '+edY.Msg.AROUND),
    )
    case edY.T3.Stmt.if_part: return Stmt1('if')
    case edY.T3.Stmt.elif_part: return Stmt1('elif')
    case edY.T3.Stmt.for_part: return Stmt1('for')
    case edY.T3.Stmt.while_part: return Stmt1('while')
    case edY.T3.Stmt.try_part: return Stmt2('try')
    case edY.T3.Stmt.except_part: return Stmt1('except')
    case edY.T3.Stmt.void_except_part:return Stmt2('except')
    case edY.T3.Stmt.else_part:return Stmt2('else')
    case edY.T3.Stmt.finally_part:return Stmt2('finally')
    case edY.T3.Stmt.with_part: return Stmt1('with')
    case edY.T3.Stmt.any_stmt:
    return goog.dom.createDom(goog.dom.TagName.SPAN, null,
      edY.Do.createSPAN('#', 'edy-code-reserved'),
      edY.Do.createSPAN(' comment', 'edy-code-placeholder'),
    )
    case edY.T3.Stmt.assignment_stmt:
    return goog.dom.createDom(goog.dom.TagName.SPAN, 'edy-code-placeholder',
      goog.dom.createTextNode('name'),
      edY.Do.createSPAN(' = ', 'edy-code-reserved'),
      goog.dom.createTextNode('value'),
    )
    case edY.T3.Stmt.print_stmt:
    return goog.dom.createDom(goog.dom.TagName.SPAN, 'edy-code',
      edY.Do.createSPAN('print', 'edy-code-reserved'),
      goog.dom.createTextNode('(…)'),
    )
    case edY.T3.Stmt.builtin_input_stmt:
    return goog.dom.createDom(goog.dom.TagName.SPAN, 'edy-code',
      edY.Do.createSPAN('input', 'edy-code-reserved'),
      goog.dom.createTextNode('(…)'),
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
edY.MenuManager.prototype.populate_insert_as_top_parent = function (block, parent_type, parent_subtype) {
  var c8n = block.outputConnection
  if (!c8n) {
    // this is a statement block
    return false
  }
  var outCheck = c8n.check_
  var D = edY.Delegate.Manager.getModel(parent_type).tiles
  if (D) {
  var mgr = this
    var F = function(K) {
      var d = D[K]
      if (d && d.key && (!parent_subtype && !d.wrap || d.key === parent_subtype)) {
        if (outCheck && d.check) {
          var found = false, _ = 0, c
          while ((c = d.check[_++])) {
            if (outCheck.indexOf(c) >= 0) {
              found = true
              break
            }
          }
          if (!found) {
            return false
          }
        }
        var key = d.key
        var content = mgr.get_menuitem_content(parent_type, key)
        var MI = new edY.MenuItem(content, function() {
          block.edy.insertParent(block, parent_type, parent_subtype, key)
        })
        mgr.addInsertChild(MI)
        return true
      } else if (d && d.wrap && !parent_subtype) {
        var list = edY.Delegate.Manager.getModel(d.wrap).list
        if (!list) {
          if (!outCheck || goog.array.contains(outCheck, d.wrap)) {
            var key = d.key || K
            var content = mgr.get_menuitem_content(parent_type, key)
            var MI = new edY.MenuItem(content, function() {
              block.edy.insertParent(block, parent_type, parent_subtype, key)
            })
            mgr.addInsertChild(MI)
            return true
          }
          return false
        }
        var listCheck = list.all || list.check || (list.consolidator && list.consolidator.data && list.consolidator.data.check)
        if (outCheck && listCheck) {
          var found = false, _ = 0, c
          while ((c = listCheck[_++])) {
            if (outCheck.indexOf(c) >= 0) {
              found = true
              break
            }
          }
          if (!found) {
            return false
          }
        }
        var content = mgr.get_menuitem_content(parent_type)
        var MI = new edY.MenuItem(content, function() {
          block.edy.insertParent(block, parent_type, parent_subtype)
        })
        mgr.addInsertChild(MI)
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
edY.MenuManager.prototype.populate_insert_parent = function (block, type, subtype, top) {
  // can we insert a block typed type between the block and
  // the target of its output connection
  var outputC8n = block.outputConnection
  if (outputC8n) {
    var inputC8n = outputC8n.targetConnection
    if (!inputC8n) {
      if (top) {
        this.populate_insert_as_top_parent(block, type, subtype)
      }
      return
    }
    var check = inputC8n.check_
    if (check && check.indexOf(type) < 0) {
      // the target connection won't accept block
      return
    }
    this.populate_insert_as_top_parent(block, type, subtype)
  }
}

/**
 * Populate the context menu for the given block.
 * Only for expressions.
 * @param {!Blockly.Block} block The block.
 * @param {!string} type the type of the parent to be.
 * @param {!string} subtype the subtype is for example the input name through which parent and children are connected.
 * @private
 * @return true if an item were added to the remove menu
 */
edY.MenuManager.prototype.populate_replace_parent = function (block, type, subtype) {
  var parent = block.getParent()
  if (parent && parent.type === type) {
    var edy = block.edy
    var input = edy.getParentInput(block)
    if (subtype && input.name != subtype) {
      return false
    }
    if (!edy.wrapped_ || edy.canUnwrap(block)) {
      if (edy.canReplaceBlock(block, parent)) {
        var content = this.get_menuitem_content(type, input? input.name: undefined)
        var MI = new edY.MenuItem(content, function() {
          edy.replaceBlock(block, parent)
        })
        this.addRemoveChild(MI)
        console.log(block.type, ' replace ', parent.type)
        return true
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
edY.MenuManager.prototype.populate_before_after = function (block) {
  // Disable undo registration for a while
  var Ts = [
    edY.T3.Stmt.if_part,
    edY.T3.Stmt.elif_part,
    edY.T3.Stmt.for_part,
    edY.T3.Stmt.while_part,
    edY.T3.Stmt.try_part,
    edY.T3.Stmt.except_part,
    edY.T3.Stmt.void_except_part,
    edY.T3.Stmt.else_part,
    edY.T3.Stmt.finally_part,
    edY.T3.Stmt.with_part,
    // edY.T3.Stmt.decorator,
    // edY.T3.Stmt.funcdef_part,
    // edY.T3.Stmt.classdef_part,
    // edY.T3.Stmt.import_stmt,
  ]
  var Us = [
    edY.T3.Stmt.comment_any,
    edY.T3.Stmt.assignment_stmt,
    edY.T3.Stmt.print_stmt,
    edY.T3.Stmt.builtin_input_stmt,
  ]
  var F = function(action, type) {
    return function() {
      // create a closure that catches the value of the loop variable
      var T = type
      return function() {
        action(block, T)
      }
    }()
  }
  var c8n, sep
  var F_after = function(targetC8n, type) {
    var B = block.workspace.newBlock(type)
    var yorn = B.previousConnection && B.previousConnection.checkType_(c8n)
    && (!targetC8n || (B.nextConnection && targetC8n.checkType_(B.nextConnection)))
    B.dispose()
    if (yorn) {
      var content = this.get_menuitem_content(type)
      var MI = new edY.MenuItem(content, F(block.edy.insertBlockAfter, type))
      this.addInsertAfterChild(MI)
      return true
    }
    return false
  }
  var F_before = function(targetC8n, type) {
    var B = block.workspace.newBlock(type)
    var yorn = B.nextConnection && B.nextConnection.checkType_(c8n)
    && (!targetC8n || (B.previousConnection && targetC8n.checkType_(B.previousConnection)))
    B.dispose()
    if (yorn) {
      var content = this.get_menuitem_content(type)
      var MI = new edY.MenuItem(content, F(block.edy.insertParent, type))
      this.addInsertBeforeChild(MI)
      return true
    }
    return false
  }
  Blockly.Events.disable()
  try {
    if ((c8n = block.nextConnection)) {
      var targetC8n = c8n.targetConnection
      for (var _ = 0, type; (type = Us[_++]);) {
        sep = F_after.call(this, targetC8n, type) || sep
      }
      this.shouldSeparateInsertAfter(sep)
      for (var _ = 0, type; (type = Ts[_++]);) {
        sep = F_after.call(this, targetC8n, type) || sep
      }
      this.shouldSeparateInsertAfter(sep)
    }
    if ((c8n = block.previousConnection)) {
      var targetC8n = c8n.targetConnection
      for (var _ = 0, type; (type = Us[_++]);) {
        sep = F_before.call(this, targetC8n, type) || sep
      }
      this.shouldSeparateInsertBefore(sep)
      for (var _ = 0, type; (type = Ts[_++]);) {
        sep = F_before.call(this, targetC8n, type) || sep
      }
      this.shouldSeparateInsertBefore(sep)
    }
  } finally {
    Blockly.Events.enable()
  }
}

/**
 * Populate the context menu for the given block.
 * Only for expressions.
 * @param {!Blockly.Block} block The block.
 * @private
 */
edY.MenuManager.prototype.populate_movable_parent = function (block) {
  var F = function(movable, yorn) {
    for (var _ = 0, type; (type = movable[_++]);) {
      var subtype = undefined
      if (goog.isArray(type)) {
        subtype = type[1]
        type = type[0]
      }
      this.populate_insert_parent(block, type, subtype, yorn)
      this.populate_replace_parent(block, type, subtype)
    }
  }
  F.call(this, [
    edY.T3.Expr.u_expr_s3d,
    [edY.T3.Expr.call_expr, edY.Key.PRIMARY],
    edY.T3.Expr.slicing,
    [edY.T3.Expr.attributeref, edY.Key.ATTRIBUTE],
    [edY.T3.Expr.attributeref, edY.Key.PRIMARY],
    [edY.T3.Expr.decorator_call_expr, edY.Key.NAME],
    edY.T3.Expr.imagnumber,
  ], true)
  F.call(this, [
    [edY.T3.Expr.expression_as_name, edY.Key.AS],
    [edY.T3.Expr.expression_as_name, edY.Key.EXPRESSION],
    [edY.T3.Expr.expression_from, edY.Key.FROM],
    [edY.T3.Expr.expression_from, edY.Key.EXPRESSION],
  ])
  this.shouldSeparateInsert()
  this.shouldSeparateRemove()
  F.call(this, [
    edY.T3.Expr.parenth_form,
    edY.T3.Expr.list_display,
    edY.T3.Expr.set_display,
    edY.T3.Expr.dict_display,
    [edY.T3.Expr.funcdef_typed, edY.Key.DEFINITION],
  ], true)
  F.call(this, [
    edY.T3.Expr.parent_module,
    edY.T3.Expr.module_as_s3d,
    edY.T3.Expr.import_identifier_as_s3d,
    [edY.T3.Expr.key_datum_s3d, edY.Key.NAME],
    [edY.T3.Expr.defparameter_s3d, edY.Key.NAME],
    [edY.T3.Expr.proper_slice, edY.Key.UPPER_BOUND],
    [edY.T3.Expr.proper_slice, edY.Key.STRIDE],
    [edY.T3.Expr.proper_slice, edY.Key.LOWER_BOUND],
  ])
}

/**
 * Populate the context menu for the given block.
 * Only for expressions.
 * @param {!Blockly.Block} block The block.
 * @private
 */
edY.MenuManager.prototype.populate_wrap_alternate = function (block, key) {
  var edy = block.edy
  if (edy.menuData && edy.data.menu.length > 1) {
    var menu = this.menu
    var input = block.getInput(key)
    if (input && input.connection) {
      var target = input.connection.targetBlock()
      goog.asserts.assert(target, 'No wrapper in '+ block.type)
      var F = function(data) {
        var content = goog.isFunction(data.content)? data.content(block): data.content
        goog.asserts.assert(content, 'content is missing '+block.type+' '+key)
        var menuItem = new edY.MenuItem(content, function() {
          block.edy.useWrapType(block, key, data.type) // useWrapType
          block.render() // maybe useless ?
        })
        menuItem.setEnabled(data.type != target.type)
        this.addChild(menuItem, true)
        if (data.css_class) {
          goog.dom.classlist.add( menuItem.getElement().firstChild, data.css_class) 
        }
      }
      for (var _ = 0, d; (d = edy.menuData[_++]);) {
        F.call(this, d)
      }
      return true
    }
  }
  return false
}

/////////////// SUBTYPES

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @private
 */
edY.MenuManager.prototype.populateProperties = function (block, key) {
  var edy = block.edy
  var data = edy.data[key]
  var properties = data.getAll()
  if (properties && properties.length > 1) {
    var current = data.get()
    var F = function(property) {
      var menuItem = new edY.MenuItem(edy.makeTitle(block, property, key), function() {
        data.set(property)
      })
      menuItem.setEnabled(current != property)
      this.addChild(menuItem, true)
      goog.dom.classlist.add(menuItem.getElement().firstChild, 'edy-code')
    }
    for (var i = 0; i<properties.length; i++) {
      F.call(this, properties[i])
    }
    return true
  }
  return false
}
