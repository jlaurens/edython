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
  this.didSeparateInsert_ = false
  this.shouldSeparateInsert_ = false
  this.didSeparateRemove_ = false
  this.shouldSeparateRemove_ = false
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
  if (this.menu.getChildCount()) {
    this.menu.addChild(new ezP.Separator(), render)
  }
  this.didSeparate_ = true
}

/**
 * Add a separator.
 */
ezP.MenuManager.prototype.separateInsert = function (render = true) {
  this.shouldSeparateInsert_ = false
  if (this.insertSubmenu.getItemCount()) {
    this.addInsertChild(new ezP.Separator(), render)
  }
  this.didSeparateInsert_ = true
}

/**
 * Add a separator.
 */
ezP.MenuManager.prototype.separateRemove = function (render = true) {
  this.shouldSeparateRemove_ = false
  if (this.removeSubmenu.getItemCount()) {
    this.addRemoveChild(new ezP.Separator(), render)
  }
  this.didSeparateRemove_ = true
}

/**
 * Whether a separator should be inserted before any forthcoming menu item.
 */
ezP.MenuManager.prototype.shouldSeparate = function(yorn = true) {
  this.shouldSeparate_  = !this.didSeparate_ && (this.shouldSeparate_ || yorn)
  // console.log('shouldSeparate_', yorn, this.shouldSeparate_)
}

/**
 * Whether a separator should be inserted before any forthcoming menu item.
 */
ezP.MenuManager.prototype.shouldSeparateInsert = function(yorn = true) {
  this.shouldSeparateInsert_  = !this.didSeparateInsert_ && (this.shouldSeparateInsert_ || yorn)
  // console.log('shouldSeparate_', yorn, this.shouldSeparate_)
}

/**
 * Whether a separator should be inserted before any forthcoming menu item.
 */
ezP.MenuManager.prototype.shouldSeparateRemove = function(yorn = true) {
  this.shouldSeparateRemove_  = !this.didSeparateRemove_ && (this.shouldSeparateRemove_ || yorn)
}

/**
 * Add a menu item.
 */
ezP.MenuManager.prototype.addChild = function (menuItem, render = true) {
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
ezP.MenuManager.prototype.addInsertChild = function (menuItem, render = true) {
  if (this.shouldSeparateInsert_) {
    // console.log('Did separate')
    this.separateInsert(render)
  }
  this.insertSubmenu.addItem(menuItem)
  this.didSeparateInsert_ = false
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
  var target = block.ezp.getMenuTarget(block)
  this.init(target, e)
  var me = this
  me.alreadyListened = false
  var parent, sep
  parent = target
  sep = parent.ezp.populateContextMenuFirst_(parent, this)
  while (parent !== block) {
    parent = parent.getParent()
    sep = parent.ezp.populateContextMenuFirst_(parent, this) || sep
  }
  this.shouldSeparate(sep) // this algorithm needs more thinking
  this.addChild(this.insertSubmenu, true)
  this.addChild(this.removeSubmenu, true)
  this.shouldSeparate(true) // this algorithm needs more thinking
  parent = target
  sep = parent.ezp.populateContextMenuMiddle_(parent, this)
  while (parent !== block) {
    parent = parent.getParent()
    sep = parent.ezp.populateContextMenuMiddle_(parent, this) || sep
  }
  this.shouldSeparate(sep) // this algorithm needs more thinking
  block.ezp.populateContextMenuLast_(block, this)
  this.insertSubmenu.setEnabled(this.insertSubmenu.getMenu().getChildCount() > 0)
  this.removeSubmenu.setEnabled(this.removeSubmenu.getMenu().getChildCount() > 0)
  goog.events.listenOnce(this.menu, 'action', function (event) {
    setTimeout(function () {// try/finally?
      if (me.alreadyListened) {
        console.log('************* I have already listened!')
        return
      }
      me.alreadyListened = true
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

ezP.ID.DUPLICATE_BLOCK = 'DUPLICATE_BLOCK'
ezP.ID.REMOVE_COMMENT = 'REMOVE_COMMENT'
ezP.ID.ADD_COMMENT = 'ADD_COMMENT'
ezP.ID.EXPAND_BLOCK = 'EXPAND_BLOCK'
ezP.ID.COLLAPSE_BLOCK = 'COLLAPSE_BLOCK'
ezP.ID.TOGGLE_ENABLE_BLOCK = 'TOGGLE_ENABLE_BLOCK'
ezP.ID.DELETE_BLOCK = 'DELETE_BLOCK'
ezP.ID.HELP = 'HELP'
ezP.ID.LOG_BLOCK_XML = 'LOG_BLOCK_XML'
ezP.ID.FILL_DEEP_HOLES = 'FILL_DEEP_HOLES'

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr The context menu manager.
 * @private
 */
ezP.Delegate.prototype.populateContextMenuFirst_ = function (block, mgr) {
  mgr.shouldSeparate()
  mgr.populate_movable_parent(block)
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
ezP.MenuManager.prototype.populateLast = function (block) {
  var menuItem
  var holes = ezP.HoleFiller.getDeepHoles(block)
  menuItem = new ezP.MenuItem(
    ezP.Msg.FILL_DEEP_HOLES,
    {action: ezP.ID.FILL_DEEP_HOLES, holes: holes})
    menuItem.setEnabled(holes.length > 0);
  this.addChild(menuItem, true)

  if (block.isDeletable() && block.isMovable() && !block.isInFlyout) {
    // Option to duplicate this block.
    menuItem = new ezP.MenuItem(
      Blockly.Msg.DUPLICATE_BLOCK,
      {action: ezP.ID.DUPLICATE_BLOCK,
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
      menuItem = new ezP.MenuItem(
        Blockly.Msg.REMOVE_COMMENT,
        {action: ezP.ID.REMOVE_COMMENT,
        target: block,})
    } else {
      menuItem = new ezP.MenuItem(
        Blockly.Msg.ADD_COMMENT,
        {action: ezP.ID.ADD_COMMENT,
          target: block,})
    }
    menuItem.setEnabled(false && !goog.userAgent.IE && !block.outputConnection)
    this.addChild(menuItem, true)
  }
  if (block.workspace.options.collapse) {
    if (block.collapsed_) {
      menuItem = new ezP.MenuItem(
        Blockly.Msg.EXPAND_BLOCK,
        {action: ezP.ID.EXPAND_BLOCK,
          target: block,})
      menuItem.setEnabled(true)
    } else {
      menuItem = new ezP.MenuItem(
        Blockly.Msg.COLLAPSE_BLOCK,
        {action: ezP.ID.COLLAPSE_BLOCK,
          target: block,})
      menuItem.setEnabled(block.ezp.getStatementCount(block) > 2)
    }
    this.addChild(menuItem, true)
  }
  if (block.workspace.options.disable) {
    menuItem = new ezP.MenuItem(
      block.disabled
        ? Blockly.Msg.ENABLE_BLOCK : Blockly.Msg.DISABLE_BLOCK,
      {action: ezP.ID.TOGGLE_ENABLE_BLOCK,
        target: block,})
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
    var descendantCount = unwrapped.ezp.getWrappedDescendants(unwrapped).length
    if (parent === null) {
      // the topmost is itself sealed, this should not occur
      ++descendantCount
    }
    var nextBlock = unwrapped.getNextBlock()
    if (nextBlock) {
      // Blocks in the current stack would survive this block's deletion.
      descendantCount -= nextBlock.ezp.getWrappedDescendants(nextBlock).length
    }
    menuItem = new ezP.MenuItem(
      descendantCount === 1 ? Blockly.Msg.DELETE_BLOCK
        : Blockly.Msg.DELETE_X_BLOCKS.replace('%1', String(descendantCount)),
      {action: ezP.ID.DELETE_BLOCK,
        target: block,})
    menuItem.setEnabled(true)
    this.addChild(menuItem, true)
  }
  // help
  var url = goog.isFunction(block.helpUrl) ? block.helpUrl() : block.helpUrl
  menuItem = new ezP.MenuItem(
    Blockly.Msg.HELP,
    {action: ezP.ID.HELP,
      target: block,})
  menuItem.setEnabled(!!url)
  this.addChild(menuItem, true)
  this.separate()
  
  menuItem = new ezP.MenuItem(
    block.ezp.getPythonType(block),
    {action: ezP.ID.LOG_BLOCK_XML,
      target: block,})
  menuItem.setEnabled(true)
  this.addChild(menuItem, true)

  menuItem = new ezP.MenuItem(
    block.ezp.getPythonType(block)+' python code',
    function(b, e) {
      console.log('Python code for', block.type)
      console.log(block.ezp.toPython(block))  
    })
  menuItem.setEnabled(true)
  this.addChild(menuItem, true)

  menuItem = new ezP.MenuItem(
    block.ezp.getPythonType(block)+' python code (deep)',
    function(b, e) {
      console.log('Python code for', block.type)
      console.log(block.ezp.toPython(block, true))  
    })
  menuItem.setEnabled(true)
  this.addChild(menuItem, true)

  if (block.ezp.plugged_) {
    menuItem = new ezP.MenuItem(
      block.ezp.plugged_.substring(4),
      {action: ezP.ID.LOG_BLOCK_XML,
        target: block,})
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
  if (goog.isFunction(model)) {
    setTimeout(function() {
      model(block, event)
    }, 100)
    return true
  }
  var target = model.target || block
  switch(model.action) {
    case ezP.ID.DUPLICATE_BLOCK:
      Blockly.duplicate_(target)
      return true
    case ezP.ID.FILL_DEEP_HOLES:
      Blockly.Events.setGroup(true)
      ezP.HoleFiller.fillDeepHoles(block.workspace, model.holes)
      Blockly.Events.setGroup(false)
      return true
    case ezP.ID.REMOVE_COMMENT:
    target.setCommentText(null)
      return true
    case ezP.ID.ADD_COMMENT:
    target.setCommentText('')
      return true
    case ezP.ID.EXPAND_BLOCK:
    target.setCollapsed(false)
      return true
    case ezP.ID.COLLAPSE_BLOCK:
    target.setCollapsed(true)
      return true
    case ezP.ID.TOGGLE_ENABLE_BLOCK:
    target.ezp.setDisabled(block, !block.disabled)  
      return true
    case ezP.ID.DELETE_BLOCK:
      var unwrapped = target
      var parent
      while (unwrapped.ezp.wrapped_ && (parent = unwrapped.getParent())) {
        unwrapped = parent
      }
      // unwrapped is the topmost block or the first unwrapped parent
      Blockly.Events.setGroup(true)
      unwrapped.dispose(true, true)
      Blockly.Events.setGroup(false)
      return true
    case ezP.ID.HELP:
    target.showHelp_()
      return true
    case ezP.ID.LOG_BLOCK_XML:
      var xmlDom = Blockly.Xml.blockToDom(target);
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
  return false
}

/**
 * Handle the selection of an item in the first part of the context dropdown menu.
 * Default implementation returns false.
 * @param {!Blockly.Block} block The Menu component clicked.
 * @param {!goog....} event The event containing as target
 * the MenuItem selected within menu.
 */
ezP.MenuManager.prototype.handleAction_movable_parent = function (block, event) {
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
ezP.MenuManager.prototype.handleAction_movable_parent_module = ezP.MenuManager.prototype.handleAction_movable_parent

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @private
 */
ezP.MenuManager.prototype.get_movable_parent_menuitem_content = function (type, subtype) {
  switch(type) {
    case ezP.T3.Expr.parent_module: 
    return goog.dom.createDom(goog.dom.TagName.SPAN, null,
      ezP.Do.createSPAN('.', 'ezp-code'),
      goog.dom.createTextNode(' '+ezP.Msg.AT_THE_LEFT),
    )
    case ezP.T3.Expr.module_concrete:
    return goog.dom.createDom(goog.dom.TagName.SPAN, null,
      ezP.Do.createSPAN('module', 'ezp-code-placeholder'),
      ezP.Do.createSPAN('.', 'ezp-code'),
    )
    case ezP.T3.Expr.attributeref:
    switch(subtype) {
      case ezP.Key.PRIMARY:
      return goog.dom.createDom(goog.dom.TagName.SPAN, null,
        ezP.Do.createSPAN('.', 'ezp-code'),
        ezP.Do.createSPAN('attribute', 'ezp-code-placeholder'),
        goog.dom.createTextNode(' '+ezP.Msg.AT_THE_RIGHT),
      )
      // case ezP.Key.ATTRIBUTE:
      default:
      return goog.dom.createDom(goog.dom.TagName.SPAN, null,
        ezP.Do.createSPAN('primary', 'ezp-code-placeholder'),
        ezP.Do.createSPAN('.', 'ezp-code'),
        goog.dom.createTextNode(' '+ezP.Msg.AT_THE_LEFT),
      )
    }
    case ezP.T3.Expr.parameter_concrete:
    return goog.dom.createDom(goog.dom.TagName.SPAN, null,
      ezP.Do.createSPAN(': ', 'ezp-code'),
      ezP.Do.createSPAN('…', 'ezp-code-placeholder'),
      goog.dom.createTextNode(' '+ezP.Msg.AT_THE_RIGHT),
    )
    case ezP.T3.Expr.defparameter_concrete:
    return goog.dom.createDom(goog.dom.TagName.SPAN, null,
      ezP.Do.createSPAN('= ', 'ezp-code'),
      ezP.Do.createSPAN('…', 'ezp-code-placeholder'),
      goog.dom.createTextNode(' '+ezP.Msg.AT_THE_RIGHT),
    )
    case ezP.T3.Expr.proper_slice:
    switch(subtype) {
      case ezP.Key.LOWER_BOUND:
      return goog.dom.createDom(goog.dom.TagName.SPAN, null,
        ezP.Do.createSPAN(':', 'ezp-code'),
        ezP.Do.createSPAN('…', 'ezp-code-placeholder'),
        ezP.Do.createSPAN(':', 'ezp-code'),
        ezP.Do.createSPAN('…', 'ezp-code-placeholder'),
        goog.dom.createTextNode(' '+ezP.Msg.AT_THE_RIGHT),
      )
      case ezP.Key.UPPER_BOUND:
      return goog.dom.createDom(goog.dom.TagName.SPAN, null,
        ezP.Do.createSPAN('…', 'ezp-code-placeholder'),
        ezP.Do.createSPAN(':', 'ezp-code'),
        goog.dom.createTextNode(' '+ezP.Msg.AND+' '),
        ezP.Do.createSPAN(':', 'ezp-code'),
        ezP.Do.createSPAN('…', 'ezp-code-placeholder'),
        goog.dom.createTextNode(' '+ezP.Msg.AROUND),
      )
      case ezP.Key.STRIDE:
      default:
      return goog.dom.createDom(goog.dom.TagName.SPAN, null,
        ezP.Do.createSPAN('…', 'ezp-code-placeholder'),
        ezP.Do.createSPAN(':', 'ezp-code'),
        ezP.Do.createSPAN('…', 'ezp-code-placeholder'),
        ezP.Do.createSPAN(':', 'ezp-code'),
        goog.dom.createTextNode(' '+ezP.Msg.AT_THE_LEFT),
      )
    }
    case ezP.T3.Expr.dotted_funcname_concrete:
    switch(subtype) {
      case ezP.Key.NAME:
      return goog.dom.createDom(goog.dom.TagName.SPAN, null,
        ezP.Do.createSPAN('parent', 'ezp-code-placeholder'),
        ezP.Do.createSPAN('.', 'ezp-code'),
        goog.dom.createTextNode(' '+ezP.Msg.AT_THE_LEFT),
      )
      case ezP.Key.PARENT:
      default:
      return goog.dom.createDom(goog.dom.TagName.SPAN, null,
        ezP.Do.createSPAN('.', 'ezp-code'),
        ezP.Do.createSPAN('name', 'ezp-code-placeholder'),
        goog.dom.createTextNode(' '+ezP.Msg.AT_THE_RIGHT),
      )
    }
    case ezP.T3.Expr.expression_as_name:
    switch(subtype) {
      case ezP.Key.AS:
      return goog.dom.createDom(goog.dom.TagName.SPAN, null,
        ezP.Do.createSPAN('expression ', 'ezp-code-placeholder'),
        ezP.Do.createSPAN('as', 'ezp-code-reserved'),
        goog.dom.createTextNode(' '+ezP.Msg.AT_THE_LEFT),
      )
      case ezP.Key.EXPRESSION:
      default:
      return goog.dom.createDom(goog.dom.TagName.SPAN, null,
        ezP.Do.createSPAN('as', 'ezp-code-reserved'),
        ezP.Do.createSPAN(' name', 'ezp-code-placeholder'),
        goog.dom.createTextNode(' '+ezP.Msg.AT_THE_RIGHT),
      )
    }
    return goog.dom.createDom(goog.dom.TagName.SPAN, null,
      ezP.Do.createSPAN('as', 'ezp-code-reserved'),
      ezP.Do.createSPAN(' name', 'ezp-code-placeholder'),
      goog.dom.createTextNode(' '+ezP.Msg.AT_THE_RIGHT),
    )
    case ezP.T3.Expr.expression_from:
    switch(subtype) {
      case ezP.Key.FROM:
      return goog.dom.createDom(goog.dom.TagName.SPAN, null,
        ezP.Do.createSPAN('expression ', 'ezp-code-placeholder'),
        ezP.Do.createSPAN('from', 'ezp-code-reserved'),
        goog.dom.createTextNode(' '+ezP.Msg.AT_THE_LEFT),
      )
      case ezP.Key.EXPRESSION:
      default:
      return goog.dom.createDom(goog.dom.TagName.SPAN, null,
        ezP.Do.createSPAN('from', 'ezp-code-reserved'),
        ezP.Do.createSPAN(' expression', 'ezp-code-placeholder'),
        goog.dom.createTextNode(' '+ezP.Msg.AT_THE_RIGHT),
      )
    }
    case ezP.T3.Expr.slicing:
    return goog.dom.createDom(goog.dom.TagName.SPAN, null,
      ezP.Do.createSPAN('[', 'ezp-code'),
      ezP.Do.createSPAN('…', 'ezp-code-placeholder'),
      ezP.Do.createSPAN(']', 'ezp-code'),
      goog.dom.createTextNode(' '+ezP.Msg.AT_THE_RIGHT),
    )
    case ezP.T3.Expr.call_expr:
    case ezP.T3.Expr.decorator_call_expr:
    return goog.dom.createDom(goog.dom.TagName.SPAN, null,
      ezP.Do.createSPAN('(', 'ezp-code'),
      ezP.Do.createSPAN('…', 'ezp-code-placeholder'),
      ezP.Do.createSPAN(')', 'ezp-code'),
      goog.dom.createTextNode(' '+ezP.Msg.AT_THE_RIGHT),
    )
    case ezP.T3.Expr.funcdef_typed:
    return goog.dom.createDom(goog.dom.TagName.SPAN, null,
      ezP.Do.createSPAN('->', 'ezp-code'),
      ezP.Do.createSPAN(' …', 'ezp-code-placeholder'),
      goog.dom.createTextNode(' '+ezP.Msg.AT_THE_RIGHT),
    )
    case ezP.T3.Expr.module_as_concrete:
    case ezP.T3.Expr.import_identifier_as_concrete:
    return goog.dom.createDom(goog.dom.TagName.SPAN, null,
      ezP.Do.createSPAN('as', 'ezp-code-reserved'),
      ezP.Do.createSPAN(' alias', 'ezp-code-placeholder'),
    )
    case ezP.T3.Expr.u_expr_concrete:
    return goog.dom.createDom(goog.dom.TagName.SPAN, null,
      ezP.Do.createSPAN('-', 'ezp-code'),
      goog.dom.createTextNode(' '+ezP.Msg.AT_THE_LEFT),
    ) 
    case ezP.T3.Expr.parenth_form:
    return goog.dom.createDom(goog.dom.TagName.SPAN, null,
      ezP.Do.createSPAN('(', 'ezp-code'),
      goog.dom.createTextNode(' '+ezP.Msg.AND+' '),
      ezP.Do.createSPAN(')', 'ezp-code'),
      goog.dom.createTextNode(' '+ezP.Msg.AROUND),
    )
    case ezP.T3.Expr.list_display:
    return goog.dom.createDom(goog.dom.TagName.SPAN, null,
      ezP.Do.createSPAN('[', 'ezp-code'),
      goog.dom.createTextNode(' '+ezP.Msg.AND+' '),
      ezP.Do.createSPAN(']', 'ezp-code'),
      goog.dom.createTextNode(' '+ezP.Msg.AROUND),
    )
    case ezP.T3.Expr.set_display:
    case ezP.T3.Expr.dict_display:
    return goog.dom.createDom(goog.dom.TagName.SPAN, null,
      ezP.Do.createSPAN('{', 'ezp-code'),
      goog.dom.createTextNode(' '+ezP.Msg.AND+' '),
      ezP.Do.createSPAN('}', 'ezp-code'),
      goog.dom.createTextNode(' '+ezP.Msg.AROUND),
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
ezP.MenuManager.prototype.populate_insert_as_top_parent = function (block, parent_type, parent_subtype) {
  var c8n = block.outputConnection
  if (!c8n) {
    // this is a statement block
    return false
  }
  var outCheck = c8n.check_
  var D = ezP.Delegate.Manager.getInputModel(parent_type)
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
      var content = mgr.get_movable_parent_menuitem_content(parent_type, key)
      var MI = new ezP.MenuItem(content, function() {
        block.ezp.insertBlockAbove(block, parent_type, key)
      })
      mgr.addInsertChild(MI)
      return true
    } else if (d && d.wrap && !parent_subtype) {
      var list = ezP.Delegate.Manager.getInputModel(d.wrap).list
      if (!list) {
        if (goog.array.contains(outCheck, d.wrap)) {
          var key = d.key || K
          var content = mgr.get_movable_parent_menuitem_content(parent_type, key)
          var MI = new ezP.MenuItem(content, function() {
            block.ezp.insertBlockAbove(block, parent_type, key)
          })
          mgr.addInsertChild(MI)
          return true
        }
        return false
      }
      var listCheck = list.all || list.check || (list.consolidator && list.consolidator.data && list.consolidator.data.check)
      if (listCheck) {
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
      var content = mgr.get_movable_parent_menuitem_content(parent_type)
      var MI = new ezP.MenuItem(content, function() {
        block.ezp.insertBlockAbove(block, parent_type)
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
ezP.MenuManager.prototype.populate_insert_parent = function (block, type, subtype, top) {
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
ezP.MenuManager.prototype.populate_replace_parent = function (block, type, subtype) {
  var parent = block.getParent()
  if (parent && parent.type === type) {
    var ezp = block.ezp
    var input = ezp.getParentInput(block)
    if (subtype && input.name != subtype) {
      return false
    }
    if (!ezp.wrapped_ || ezp.canUnwrap(block)) {
      if (ezp.canReplaceBlock(block, parent)) {
        var content = this.get_movable_parent_menuitem_content(type, input? input.name: undefined)
        var MI = new ezP.MenuItem(content, function() {
          ezp.replaceBlock(block, parent)
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
 * Only for expressions.
 * @param {!Blockly.Block} block The block.
 * @private
 */
ezP.MenuManager.prototype.populate_movable_parent = function (block) {
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
    ezP.T3.Expr.u_expr_concrete,
    [ezP.T3.Expr.call_expr, ezP.Key.PRIMARY],
    ezP.T3.Expr.slicing,
    [ezP.T3.Expr.attributeref, ezP.Key.ATTRIBUTE],
    [ezP.T3.Expr.attributeref, ezP.Key.PRIMARY],
    [ezP.T3.Expr.decorator_call_expr, ezP.Key.NAME],
  ], true)
  F.call(this, [
    [ezP.T3.Expr.expression_as_name, ezP.Key.AS],
    [ezP.T3.Expr.expression_as_name, ezP.Key.EXPRESSION],
    [ezP.T3.Expr.expression_from, ezP.Key.FROM],
    [ezP.T3.Expr.expression_from, ezP.Key.EXPRESSION],
  ])
  this.shouldSeparateInsert()
  this.shouldSeparateRemove()
  F.call(this, [
    ezP.T3.Expr.parenth_form,
    ezP.T3.Expr.list_display,
    ezP.T3.Expr.set_display,
    ezP.T3.Expr.dict_display,
    [ezP.T3.Expr.funcdef_typed, ezP.Key.DEFINITION],
  ], true)
  F.call(this, [
    ezP.T3.Expr.parent_module,
    ezP.T3.Expr.module_concrete,
    ezP.T3.Expr.module_as_concrete,
    ezP.T3.Expr.import_identifier_as_concrete,
    ezP.T3.Expr.dotted_funcname_concrete,
    [ezP.T3.Expr.parameter_concrete, ezP.Key.NAME],
    [ezP.T3.Expr.defparameter_concrete, ezP.Key.NAME],
    [ezP.T3.Expr.proper_slice, ezP.Key.UPPER_BOUND],
    [ezP.T3.Expr.proper_slice, ezP.Key.STRIDE],
    [ezP.T3.Expr.proper_slice, ezP.Key.LOWER_BOUND],
  ])
}

/**
 * Populate the context menu for the given block.
 * Only for expressions.
 * @param {!Blockly.Block} block The block.
 * @private
 */
ezP.MenuManager.prototype.populate_wrap_alternate = function (block, key) {
  var ezp = block.ezp
  if (ezp.menuData && ezp.menuData.length > 1) {
    var menu = this.menu
    var input = block.getInput(key)
    if (input && input.connection) {
      var target = input.connection.targetBlock()
      goog.asserts.assert(target, 'No wrapper in augassign_list?')
      var F = function(data) {
        var content = goog.isFunction(data.content)? data.content(block): data.content
        goog.asserts.assert(content, 'content is missing '+block.type+' '+key)
        var menuItem = new ezP.MenuItem(content, function() {
          block.ezp.useWrapType(block, key, data.type) // useWrapType
          block.render() // maybe useless ?
        })
        menuItem.setEnabled(data.type != target.type)
        this.addChild(menuItem, true)
        if (data.css_class) {
          goog.dom.classlist.add( menuItem.getElement().firstChild, data.css_class) 
        }
      }
      for (var _ = 0, d; (d = ezp.menuData[_++]);) {
        F.call(this, d)
      }
      return true
    }
  }
  return false
}

/////////////// OPERATORS

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @private
 */
ezP.MenuManager.prototype.populateOperator = function (block) {
  var ezp = block.ezp
  if (ezp.operators && ezp.operators.length > 1) {
    var value = ezp.inputs.last.fieldLabel.getValue()
    var F = function(op) {
      var menuItem = new ezP.MenuItem(ezp.getContent(block, op), function() {
        ezp.inputs.last.fieldLabel.setValue(op)
        return
      })
      menuItem.setEnabled(value != op)
      this.addChild(menuItem, true)
      goog.dom.classlist.add(menuItem.getElement().firstChild, 'ezp-code')
    }
    for (var i = 0; i<ezp.operators.length; i++) {
      F.call(this, ezp.operators[i])
    }
    return true
  }
  return false
}
