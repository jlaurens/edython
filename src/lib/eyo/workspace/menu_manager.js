/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview Block delegates for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.MenuManager')

goog.require('eYo.Msg')
goog.require('eYo.T3')
goog.require('eYo.Brick')
goog.require('eYo.MenuItem')
goog.require('eYo.Separator')
goog.require('goog.dom');
goog.require('eYo.Py.Exporter')

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

eYo.MenuManager.shared = (() => {
  var out
  return function () {
    return out || (out = new eYo.MenuManager())
  }
})()

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
 * Records the brick and the event.
 * Removes all the previous menu items.
 * @param {!Blockly.Block=} brick The brick.
 * @param {!Event=} e Mouse event.
 * @private
 */
eYo.MenuManager.prototype.init = function (brick = undefined, e = undefined) {
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
 * Show the context menu for the given brick.
 * This is not for subclassers.
 * @param {!Blockly.Block} brick The brick.
 * @param {!Event} e Mouse event.
 * @private
 */
eYo.MenuManager.prototype.showMenu = function (brick, e) {
  if (this.menu.isVisible()) {
    this.menu.hide()
    return
  }
  var ee = brick.lastMouseDownEvent
  if (ee) {
    // this brick was selected when the mouse down event was sent
    if (ee.clientX === e.clientX && ee.clientY === e.clientY) {
      if (brick.isSelected) {
        // if the brick was already selected,
        // try to select an input connection
        eYo.Selected.magnet = brick.lastSelectedMagnet__
      }
    }
  }
  var target = eyo.getMenuTarget()
  this.init(target, e)
  var me = this
  me.alreadyListened = false
  var parent, sep
  parent = target.eyo
  this.populate_before_after(brick)
  sep = parent.populateContextMenuFirst_(this)
  while (parent !== eyo) {
    parent = parent.parent
    sep = parent.populateContextMenuFirst_(this) || sep
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
  sep = eyo.populateContextMenuComment && eyo.populateContextMenuComment(this)
  if (this.insertAfterSubmenu.getItemCount()) {
    this.addChild(this.insertAfterSubmenu, true)
    sep = true
  }
  if (this.insertBeforeSubmenu.getItemCount()) {
    this.addChild(this.insertBeforeSubmenu, true)
    sep = true
  }
  this.shouldSeparate(sep) // this algorithm needs more thinking
  parent = target.eyo
  sep = parent.populateContextMenuMiddle_(this)
  while (parent !== eyo) {
    parent = parent.parent
    sep = parent.populateContextMenuMiddle_(this) || sep
  }
  this.shouldSeparate(sep) // this algorithm needs more thinking
  brick.eyo.populateContextMenuLast_(this)
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
        target.eyo.handleMenuItemActionFirst(me, event) ||
        target.eyo.handleMenuItemActionMiddle(me, event) ||
        target.eyo.handleMenuItemActionLast(me, event)
      }
      me.init()
    }, 10)// TODO be sure that this 10 is suffisant
  })
  eyo.ui.showMenu(this.menu)
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
 * Populate the context menu for the given brick.
 * @param {!Blockly.Block} brick The brick.
 * @param {!eYo.MenuManager} mgr The context menu manager.
 * @private
 */
eYo.Brick.prototype.populateContextMenuFirst_ = function (mgr) {
  mgr.shouldSeparate()
  mgr.populate_movable_parent(this)
}

/**
 * Populate the context menu for the given brick.
 * @param {!eYo.MenuManager} mgr The context menu manager.
 * @private
 */
eYo.Brick.prototype.populateContextMenuMiddle_ = function (mgr) {
  return false
}

/**
 * Populate the context menu for the given brick.
 * @param {!Blockly.Block} brick The brick.
 * @param {!eYo.MenuManager} mgr The context menu manager.
 * @private
 */
eYo.Brick.prototype.populateContextMenuLast_ = function (mgr) {
  return mgr.populateLast(this)
}

/**
 * Populate the context menu.
 */
eYo.MenuManager.prototype.populateLast = function (brick) {
  var menuItem
  if (brick.isMovable() && !brick.isInFlyout) {
    if (brick.eyo.canUnlock()) {
      menuItem = this.newMenuItem(eYo.Msg.UNLOCK_BLOCK,
        function (event) {
          eYo.Events.setGroup(true)
          try {
            brick.eyo.unlock()
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
    if (brick.eyo.canLock()) {
      menuItem = this.newMenuItem(eYo.Msg.LOCK_BLOCK,
        function (event) {
          eYo.Events.setGroup(true)
          try {
            brick.eyo.lock()
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
  if (brick.isDeletable() && brick.isMovable() && !brick.isInFlyout) {
    // Option to duplicate this brick.
    menuItem = this.newMenuItem(
      eYo.Msg.DUPLICATE_BLOCK,
      {action: eYo.ID.DUPLICATE_BLOCK,
        target: brick})
    this.addChild(menuItem, true)
    if (brick.getDescendants().length > brick.workspace.remainingCapacity()) {
      menuItem.setEnabled(false)
    }
  }
  if (brick.isEditable() && !brick.collapsed_ &&
    brick.workspace.options.comments) {
    // Option to add/remove a comment.
    if (brick.comment) { // .comment is never set
      menuItem = this.newMenuItem(
        eYo.Msg.REMOVE_COMMENT,
        {action: eYo.ID.REMOVE_COMMENT,
          target: brick})
    } else {
      menuItem = this.newMenuItem(
        eYo.Msg.ADD_COMMENT,
        {action: eYo.ID.ADD_COMMENT,
          target: brick})
    }
    menuItem.setEnabled(false && !goog.userAgent.IE && !brick.eyo.out_m)
    this.addChild(menuItem, true)
  }
  if (brick.workspace.options.collapse) {
    if (brick.collapsed_) {
      menuItem = this.newMenuItem(
        eYo.Msg.EXPAND_BLOCK,
        {action: eYo.ID.EXPAND_BLOCK,
          target: brick})
      menuItem.setEnabled(true)
    } else {
      menuItem = this.newMenuItem(
        eYo.Msg.COLLAPSE_BLOCK,
        {action: eYo.ID.COLLAPSE_BLOCK,
          target: brick})
      menuItem.setEnabled(brick.eyo.getStatementCount() > 2)
    }
    this.addChild(menuItem, true)
  }
  if (brick.workspace.options.disable) {
    menuItem = this.newMenuItem(
      brick.disabled
        ? eYo.Msg.ENABLE_BLOCK : eYo.Msg.DISABLE_BLOCK,
      {action: eYo.ID.TOGGLE_ENABLE_BLOCK,
        target: brick})
    menuItem.setEnabled(!brick.eyo.out_m)
    this.addChild(menuItem, true)
  }
  if (brick.isDeletable() && brick.isMovable() && !brick.isInFlyout) {
    // Count the number of bricks that are nested in this brick.

    var wrapper = brick.eyo.wrapper
    var descendantCount = wrapper.getWrappedDescendants().length
    if (parent === null) {
      // the topmost is itself sealed, this should never occur
      ++descendantCount
    }
    var foot = wrapper.foot
    if (foot) {
      // Blocks in the current stack would survive this brick's deletion.
      descendantCount -= foot.getWrappedDescendants().length
    }
    menuItem = this.newMenuItem(
      descendantCount === 1 ? eYo.Msg.DELETE_BLOCK
        : eYo.Msg.DELETE_X_BLOCKS.replace('{0}', String(descendantCount)),
      {action: eYo.ID.DELETE_BLOCK,
        target: brick})
    menuItem.setEnabled(true)
    this.addChild(menuItem, true)
  }
  // help
  var url = goog.isFunction(brick.helpUrl) ? brick.helpUrl() : brick.helpUrl
  menuItem = this.newMenuItem(
    eYo.Msg.HELP,
    {action: eYo.ID.HELP,
      target: brick})
  menuItem.setEnabled(!!url)
  this.addChild(menuItem, true)
  this.separate()

  menuItem = this.newMenuItem(
    brick.eyo.getPythonType(), (event) => {
      var xmlDom = eYo.Xml.brickToDom(brick.eyo, true)
      var xmlText = Blockly.Xml.domToText(xmlDom)
      console.log(xmlText)
    }
  )
  menuItem.setEnabled(true)
  this.addChild(menuItem, true)

  menuItem = this.newMenuItem(
    brick.eyo.getPythonType() + ' python code',
    function (b, e) {
      console.log('Python code for', brick.type)
      var p = new eYo.Py.Exporter()
      console.log(p.export(brick.eyo))
    })
  menuItem.setEnabled(true)
  this.addChild(menuItem, true)

  menuItem = this.newMenuItem(
    brick.eyo.getPythonType() + ' python code (deep)',
    function (b, e) {
      console.log('Python code for', brick.type)
      var p = new eYo.Py.Exporter()
      console.log(p.export(brick.eyo, {is_deep: true}))
      brick.eyo.runScript()
    })
  menuItem.setEnabled(true)
  this.addChild(menuItem, true)

  menuItem = this.newMenuItem(
    'workspace',
    function (b, e) {
      console.log(brick.workspace.eyo.toString())
    })
  menuItem.setEnabled(true)
  this.addChild(menuItem, true)
}

/**
 * Handle the selection of an item in the context dropdown menu.
 * Intended to be overriden.
 * @param {!eYo.MenuManager} mgr
 * @param {!goog.events.Event} event The event containing as target
 */
eYo.Brick.prototype.handleMenuItemActionFirst = function (mgr, event) {
  return mgr.handleAction_movable_parent(this, event)
}

/**
 * Handle the selection of an item in the context dropdown menu.
 * Intended to be overriden.
 * @param {!eYo.MenuManager} mgr
 * @param {!goog.events.Event} event The event containing as target
 */
eYo.Brick.prototype.handleMenuItemActionMiddle = function (mgr, event) {
  return false
}

/**
 * Handle the selection of an item in the context dropdown menu.
 * Intended to be overriden.
 * @param {!Blockly.Block} brick
 * @param {!eYo.MenuManager} mgr
 * @param {!goog.events.Event} event The event containing as target
 */
eYo.Brick.prototype.handleMenuItemActionLast = function (mgr, event) {
  return mgr.handleActionLast(this, event)
}

/**
 * Handle the selection of an item in the context dropdown menu.
 * Default implementation mimics Blockly behaviour.
 * Unlikely to be overriden.
 * @param {!eYo.Brick} brick
 * @param {!goog.events.Event} event The event containing as target
 * the MenuItem selected within menu.
 */
eYo.MenuManager.prototype.handleActionLast = function (brick, event) {
  var model = event.target.model_
  if (goog.isFunction(model)) {
    setTimeout(function () {
      model(brick, event)
    }, 100)
    return true
  }
  var target = model.target || brick
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
    target.eyo.disabled = !target.eyo.disabled
    return true
  case eYo.ID.DELETE_BLOCK:
    var unwrapped = target
    var parent
    while (unwrapped.wrapped_ && (parent = unwrapped.surround)) {
      unwrapped = parent
    }
    // unwrapped is the topmost brick or the first unwrapped parent
    eYo.Events.setGroup(true)
    var returnState = false
    try {
      if (target.isSelected && target !== unwrapped) {
        // this brick was selected, select the brick below or above before deletion
        var m4t
        if (((m4t = unwrapped.foot_m) && (target = m4t.targetBrick)) || ((m4t = unwrapped.head_m) && (target = m4t.targetBrick))) {
          target.select()
        } else if ((m4t = unwrapped.out_m) && (m4t = m4t.target)) {
          m4t.select()
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
 * Populate the context menu for the given brick.
 * @param {!Blockly.Block} brick The brick.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.MenuManager.prototype.populateVariable_ = function (brick) {
  return false
}

/**
 * Handle the selection of an item in the first part of the context dropdown menu.
 * Default implementation returns false.
 * @param {!Blockly.Block} brick The Menu component clicked.
 * @param {!goog....} event The event containing as target
 * the MenuItem selected within menu.
 */
eYo.MenuManager.prototype.handleAction_movable_parent = function (brick, event) {
  var model = event.target.model_
  if (goog.isFunction(model)) {
    setTimeout(function () {
      model(brick, event)
    }, 100)
    return true
  }
  return false
}

/**
 * Populate the context menu for the given brick.
 * @param {!Blockly.Block} brick The brick.
 * @private
 */
eYo.MenuManager.prototype.handleAction_movable_parent_module = eYo.MenuManager.prototype.handleAction_movable_parent

/**
 * Populate the context menu for the given brick.
 * @param {!Blockly.Block} brick The brick.
 * @private
 */
eYo.MenuManager.prototype.get_menuitem_content = function (type, subtype) {
  var Stmt1 = (key) => {
    return goog.dom.createDom(goog.dom.TagName.SPAN, null,
      eYo.Do.createSPAN(key, 'eyo-code-reserved'),
      eYo.Do.createSPAN(' … ', 'eyo-code-placeholder'),
      eYo.Do.createSPAN(':', 'eyo-code-reserved')
    )
  }
  var Stmt2 = (key) => {
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
  case eYo.T3.Expr.identifier_valued:
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
  default:
    return 'Parent ' + type
  }
}

/**
 * Populate the context menu for the given brick and model.
 * Only for expressions.
 * `model.type` is the type of the to be inserted parent brick.
 * `model.input` is the slot where the actual brick should be connected.
 * @param {!Blockly.Block} brick The brick.
 * @param {!Object} model the type of the parent to be and target input.
 * @private
 */
eYo.MenuManager.prototype.populate_insert_as_top_parent = function (brick, model) {
  // THIS IS BROKEN SINCE THE SLOT KEYS ARE NO LONGER INTEGERS
  var m4t = brick.eyo.out_m
  if (!m4t) {
    // this is a statement brick
    return false
  }
  /** @suppress {accessControls} */
  var outCheck = m4t.check_
  var D = eYo.Brick.Manager.getModel(model.type).slots
  // if the brick which type is model.type has no slot
  // no chance to insert anything, pass away
  if (D) {
    var F = K => {
      var d = D[K]
      // d is a slotModel for a brick with type model.type
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
        var content = this.get_menuitem_content(model.type, key)
        var MI = this.newMenuItem(content, () => {
          this.insertParentWithModel(model)
        })
        this.addInsertChild(MI)
        return true
      } else if (d && d.wrap && !parent_subtype) {
        var list = eYo.Brick.Manager.getModel(d.wrap).list
        if (!list) {
          if (!outCheck || goog.array.contains(outCheck, d.wrap)) {
            key = d.key || K
            content = this.get_menuitem_content(parent_type, key)
            MI = this.newMenuItem(content, () => {
              this.insertParentWithModel(model)
            })
            this.addInsertChild(MI)
            return true
          }
          return false
        }
        // the wrapped brick is a list
        var listCheck = list.all || list.check || (list.consolidator && list.consolidator.model && list.consolidator.model.check)
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
        content = this.get_menuitem_content(model.type)
        MI = this.newMenuItem(content, () => {
          this.insertParentWithModel(model)
        })
        this.addInsertChild(MI)
        return true
      }
      return false
    }
    return F(1) || F(2) || F(3) || F(4)
  }
}

/**
 * Populate the context menu for the given brick.
 * Only for expressions.
 * type is the type of the to be inserted parent brick.
 * This parent might be inserted up to the top.
 * @param {!Blockly.Block} brick The brick.
 * @param {!string} type the type of the parent to be.
 * @private
 */
eYo.MenuManager.prototype.populate_insert_parent = function (brick, model, top) {
  // can we insert a brick typed type between the brick and
  // the target of its output connection
  var m4tOut = brick.eyo.out_m
  if (m4tOut) {
    var m4tIn = m4tOut.target
    if (!m4tIn) {
      if (top) {
        this.populate_insert_as_top_parent(brick, model)
      }
      return
    }
    var check = m4tIn.check_
    if (check && check.indexOf(model.type) < 0) {
      // the target connection won't accept brick
      return
    }
    this.populate_insert_as_top_parent(brick, model)
  }
}

/**
 * Populate the context menu for the given brick.
 * Only for expressions.
 * @param {!Blockly.Block} brick The brick.
 * @param {!string|Object} model the subtype is for example the input name through which parent and children are connected.
 * @private
 * @return true if an item were added to the remove menu
 */
eYo.MenuManager.prototype.populate_replace_parent = function (brick, model) {
    var eyo = brick.eyo
  var parent = eyo.parent
  if (parent && parent.type === model.type) {
    var input = eyo.out_m.input
    if (model.input && input.name !== model.input) {
      return false
    }
    if (!eyo.wrapped_ || eyo.canUnwrap()) {
      if (eyo.canReplaceDlgt(parent)) {
        var content = this.get_menuitem_content(model.type, input && input.name)
        if (content) {
          var MI = this.newMenuItem(content, function () {
            eyo.replaceDlgt(parent)
          })
          this.addRemoveChild(MI)
          console.log(brick.type, ' replace ', parent.type)
          return true
        }
      }
    }
  }
  return false
}

/**
 * Populate the context menu for the given brick.
 * Only for statements.
 * @param {!Blockly.Block} brick The brick.
 * @private
 */
eYo.MenuManager.prototype.populate_before_after = function (brick) {
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
  var /** !eYo.Magnet */ m4t, sep
  var F_after = /** @suppress{accessControls} */ (targetM4t, type) => {
    var eyo = eYo.Brick.newComplete(brick, type)
    var yorn = eyo.head_m &&
    eyo.head_m.checkType_(m4t) &&
    (!targetM4t || (eyo.foot_m && targetM4t.checkType_(eyo.foot_m)))
    eyo.dispose(true)
    if (yorn) {
      var content = this.get_menuitem_content(type)
      var MI = this.newMenuItem(content, () => {
        this.insertBlockAfter(type)
      })
      this.addInsertAfterChild(MI)
      return true
    }
    return false
  }
  var F_before = /** @suppress{accessControls} */ (target, type) => {
    var eyo = eYo.Brick.newComplete(brick, type)
    var yorn = eyo.foot_m &&
    eyo.foot_m.checkType_(m4t) &&
    (!target || (eyo.head_m && target.checkType_(eyo.head_m)))
    eyo.dispose(true)
    if (yorn) {
      var content = this.get_menuitem_content(type)
      var MI = this.newMenuItem(content, () => {
        this.insertParentWithModel(type)
      })
      this.addInsertBeforeChild(MI)
      return true
    }
    return false
  }
  eYo.Events.disableWrap(() => {
    if ((m4t = brick.eyo.foot_m)) {
      var target = m4t.target
      for (var _ = 0, type; (type = Us[_++]);) {
        sep = F_after(target, type) || sep
      }
      this.shouldSeparateInsertAfter(sep)
      for (_ = 0; (type = Ts[_++]);) {
        sep = F_after(target, type) || sep
      }
      this.shouldSeparateInsertAfter(sep)
    }
    if ((m4t = brick.eyo.head_m)) {
      target = m4t.target
      for (_ = 0; (type = Us[_++]);) {
        sep = F_before(target, type) || sep
      }
      this.shouldSeparateInsertBefore(sep)
      for (_ = 0; (type = Ts[_++]);) {
        sep = F_before(target, type) || sep
      }
      this.shouldSeparateInsertBefore(sep)
    }
  })
}

/**
 * Populate the context menu for the given brick.
 * Only for expressions.
 * @param {!Blockly.Block} brick The brick.
 * @private
 */
eYo.MenuManager.prototype.populate_movable_parent = function (brick) {
  var F = (movable, yorn = false) => {
    for (var _ = 0, type; (type = movable[_++]);) {
      var model = {}
      if (goog.isArray(type)) {
        model.type = type[0]
        model.input = type[1]
      } else {
        model.type = type
      }
      this.populate_insert_parent(brick, model, yorn)
      this.populate_replace_parent(brick, model)
    }
  }
  F([
    eYo.T3.Expr.u_expr,
    [eYo.T3.Expr.call_expr, eYo.Key.ROOT],
    eYo.T3.Expr.slicing,
    [eYo.T3.Expr.attributeref, eYo.Key.ATTRIBUTE],
    [eYo.T3.Expr.attributeref, eYo.Key.ROOT],
    [eYo.T3.Expr.decorator_call_expr, eYo.Key.NAME],
    eYo.T3.Expr.imagnumber
  ], true)
  F([
    [eYo.T3.Expr.expression_as_name, eYo.Key.AS],
    [eYo.T3.Expr.expression_as_name, eYo.Key.EXPRESSION]
  ])
  this.shouldSeparateInsert()
  this.shouldSeparateRemove()
  F([
    eYo.T3.Expr.parenth_form,
    eYo.T3.Expr.list_display,
    eYo.T3.Expr.set_display,
    eYo.T3.Expr.dict_display,
    [eYo.T3.Expr.funcdef_part, eYo.Key.DEFINITION]
  ], true)
  F([
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
 * Populate the context menu for the given brick.
 * @param {!Blockly.Block} brick The brick.
 * @private
 */
eYo.MenuManager.prototype.populateProperties = function (brick, key) {
  var eyo = brick.eyo
  var data = eyo.data[key]
  var properties = data.getAll()
  if (properties && properties.length > 1) {
    var current = data.get()
    var F = (property) => {
      var menuItem = this.newMenuItem(eyo.makeTitle(property, key), function () {
        data.set(property)
      })
      menuItem.setEnabled(current !== property)
      this.addChild(menuItem, true)
      goog.dom.classlist.add(/** Element */(menuItem.getElement().firstChild), 'eyo-code')
    }
    for (var i = 0; i < properties.length; i++) {
      F(properties[i])
    }
    return true
  }
  return false
}
