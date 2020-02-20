/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Menu manager for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.require('msg')

eYo.require('t3')
eYo.require('brick')
eYo.require('menuItem')
eYo.require('separator')
goog.require('goog.dom');
eYo.require('py.Exporter')
eYo.provide('menuManager')

/**
 * Shared context menu manager.
 * One shared menu.
 * @constructor
 */
eYo.MenuManager = function () {
  this.menu = new eYo.popupMenu(/* eYo.NA, ContextMenuRenderer */)
  this.insertSubmenu = new eYo.SubMenu(eYo.msg.ADD)
  this.insertBeforeSubmenu = new eYo.SubMenu(eYo.msg.ADD_BEFORE)
  this.insertAfterSubmenu = new eYo.SubMenu(eYo.msg.ADD_AFTER)
  this.removeSubmenu = new eYo.SubMenu(eYo.msg.REMOVE)
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

eYo.MenuManager.Shared = (() => {
  var out
  return function () {
    return out || (out = new eYo.MenuManager())
  }
})()

/**
 * Get the menu, in case clients may want to populate it directly.
 * Each manager has its own menu.
 */
eYo.menuManager.prototype.menu = eYo.NA

/**
 * Create a new menu item.
 * @param {Object} content The title of the menu item.
 * @param {Function} action The action of the menu item.
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
 * @param {eYo.brick=} brick The brick.
 * @param {Event=} e Mouse event.
 * @private
 */
eYo.MenuManager.prototype.init = function (brick = eYo.NA, e = eYo.NA) {
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
 * @param {eYo.brick.Dflt} brick The brick.
 * @param {Event} e Mouse event.
 * @private
 */
eYo.MenuManager.prototype.showMenu = function (brick, e) {
  if (this.menu.isVisible()) {
    this.menu.hide()
    return
  }
  var ee = brick.ui.lastMouseDownEvent
  if (ee) {
    // this brick was selected when the mouse down event was sent
    if (ee.clientX === e.clientX && ee.clientY === e.clientY) {
      if (brick.hasFocus) {
        // if the brick was already selected,
        // try to select an input connection
        eYo.focus.magnet = brick.ui.lastSelectedMagnet__
      }
    }
  }
  var target = brick.getMenuTarget()
  this.init(target, e)
  var me = this
  me.alreadyListened = false
  var parent, sep
  parent = target
  this.populate_before_after(brick)
  sep = parent.populateContextMenuFirst_(this)
  while (parent !== brick) {
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
  sep = parent.populateContextMenuMiddle_(this)
  while (parent !== brick) {
    parent = parent.parent
    sep = parent.populateContextMenuMiddle_(this) || sep
  }
  this.shouldSeparate(sep) // this algorithm needs more thinking
  brick.populateContextMenuLast_(this)
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
      if (eYo.isF(model)) {
        model(event)
      } else {
        target.handleMenuItemActionFirst(me, event) ||
        target.handleMenuItemActionMiddle(me, event) ||
        target.handleMenuItemActionLast(me, event)
      }
      me.init()
    }, 10)// TODO be sure that this 10 is suffisant
  })
  eyo.ui.showMenu(this.menu)
}

eYo.id.DUPLICATE_BLOCK = 'DUPLICATE_BLOCK'
eYo.id.REMOVE_COMMENT = 'REMOVE_COMMENT'
eYo.id.ADD_COMMENT = 'ADD_COMMENT'
eYo.id.EXPAND_BLOCK = 'EXPAND_BLOCK'
eYo.id.COLLAPSE_BLOCK = 'COLLAPSE_BLOCK'
eYo.id.TOGGLE_ENABLE_BLOCK = 'TOGGLE_ENABLE_BLOCK'
eYo.id.DELETE_BLOCK = 'DELETE_BLOCK'
eYo.id.HELP = 'HELP'

/**
 * Populate the context menu for the given brick.
 * @param {eYo.brick.Dflt} brick The brick.
 * @param {eYo.MenuManager} mngr The context menu manager.
 * @private
 */
eYo.brick.Dflt_p.populateContextMenuFirst_ = function (mngr) {
  mngr.shouldSeparate()
  mngr.populate_movable_parent(this)
}

/**
 * Populate the context menu for the given brick.
 * @param {eYo.MenuManager} mngr The context menu manager.
 * @private
 */
eYo.brick.Dflt_p.populateContextMenuMiddle_ = function (mngr) {
  return false
}

/**
 * Populate the context menu for the given brick.
 * @param {eYo.brick.Dflt} brick The brick.
 * @param {eYo.MenuManager} mngr The context menu manager.
 * @private
 */
eYo.brick.Dflt_p.populateContextMenuLast_ = function (mngr) {
  return mngr.populateLast(this)
}

/**
 * Populate the context menu.
 */
eYo.MenuManager.prototype.populateLast = function (brick) {
  var menuItem
  if (brick.movable && !brick.isInFlyout) {
    if (brick.canUnlock()) {
      menuItem = this.newMenuItem(eYo.msg.UNLOCK_BLOCK,
        function (event) {
          eYo.event.group = true
          try {
            brick.unlock()
          } catch (err) {
            console.error(err)
            throw err
          } finally {
            eYo.event.group = false
          }
        }
      )
      this.addChild(menuItem, true)
    }
    if (brick.canLock()) {
      menuItem = this.newMenuItem(eYo.msg.LOCK_BLOCK,
        function (event) {
          eYo.event.group = true
          try {
            brick.lock()
          } catch (err) {
            console.error(err)
            throw err
          } finally {
            eYo.event.group = false
          }
        }
      )
      this.addChild(menuItem, true)
    }
  }
  if (brick.deletable && brick.movable && !brick.isInFlyout) {
    // Option to duplicate this brick.
    menuItem = this.newMenuItem(
      eYo.msg.DUPLICATE_BLOCK,
      {action: eYo.id.DUPLICATE_BLOCK,
        target: brick})
    this.addChild(menuItem, true)
    if (brick.descendants.length > brick.board.remainingCapacity) {
      menuItem.setEnabled(false)
    }
  }
  if (brick.editable && !brick.collapsed_ &&
    brick.board.options.comments) {
    // Option to add/remove a comment.
    if (brick.comment) { // .comment is never set
      menuItem = this.newMenuItem(
        eYo.msg.REMOVE_COMMENT,
        {action: eYo.id.REMOVE_COMMENT,
          target: brick})
    } else {
      menuItem = this.newMenuItem(
        eYo.msg.ADD_COMMENT,
        {action: eYo.id.ADD_COMMENT,
          target: brick})
    }
    menuItem.setEnabled(false && !goog.userAgent.IE && !brick.out_m)
    this.addChild(menuItem, true)
  }
  if (brick.board.options.collapse) {
    if (brick.collapsed_) {
      menuItem = this.newMenuItem(
        eYo.msg.EXPAND_BLOCK,
        {action: eYo.id.EXPAND_BLOCK,
          target: brick})
      menuItem.setEnabled(true)
    } else {
      menuItem = this.newMenuItem(
        eYo.msg.COLLAPSE_BLOCK,
        {action: eYo.id.COLLAPSE_BLOCK,
          target: brick})
      menuItem.setEnabled(brick.getStatementCount() > 2)
    }
    this.addChild(menuItem, true)
  }
  if (brick.board.options.disable) {
    menuItem = this.newMenuItem(
      brick.disabled
        ? eYo.msg.ENABLE_BLOCK : eYo.msg.DISABLE_BLOCK,
      {action: eYo.id.TOGGLE_ENABLE_BLOCK,
        target: brick})
    menuItem.setEnabled(!brick.out_m)
    this.addChild(menuItem, true)
  }
  if (brick.deletable && brick.movable && !brick.isInFlyout) {
    // Count the number of bricks that are nested in this brick.

    var wrapper = brick.wrapper
    var descendantCount = wrapper.getWrappedDescendants().length
    if (parent === null) {
      // the topmost is itself sealed, this should never occur
      ++descendantCount
    }
    var foot = wrapper.foot
    if (foot) {
      // Bricks in the current stack would survive this brick's deletion.
      descendantCount -= foot.getWrappedDescendants().length
    }
    menuItem = this.newMenuItem(
      descendantCount === 1 ? eYo.msg.DELETE_BLOCK
        : eYo.msg.DELETE_X_BLOCKS.replace('{0}', String(descendantCount)),
      {action: eYo.id.DELETE_BLOCK,
        target: brick})
    menuItem.setEnabled(true)
    this.addChild(menuItem, true)
  }
  // help
  var url = eYo.isF(brick.helpUrl) ? brick.helpUrl() : brick.helpUrl
  menuItem = this.newMenuItem(
    eYo.msg.HELP,
    {action: eYo.id.HELP,
      target: brick})
  menuItem.setEnabled(!!url)
  this.addChild(menuItem, true)
  this.separate()

  menuItem = this.newMenuItem(
    brick.getPythonType(), (event) => {
      var xmlDom = eYo.xml.brickToDom(brick, true)
      var xmlText = eYo.xml.domToText(xmlDom)
      console.log(xmlText)
    }
  )
  menuItem.setEnabled(true)
  this.addChild(menuItem, true)

  menuItem = this.newMenuItem(
    brick.getPythonType() + ' python code',
    function (b, e) {
      console.log('Python code for', brick.type)
      var p = new eYo.py.Exporter()
      console.log(p.export(brick))
    })
  menuItem.setEnabled(true)
  this.addChild(menuItem, true)

  menuItem = this.newMenuItem(
    brick.getPythonType() + ' python code (deep)',
    function (b, e) {
      console.log('Python code for', brick.type)
      var p = new eYo.py.Exporter()
      console.log(p.export(brick, {is_deep: true}))
      brick.runScript()
    })
  menuItem.setEnabled(true)
  this.addChild(menuItem, true)

  menuItem = this.newMenuItem(
    'board',
    function (b, e) {
      console.log(brick.board.toString())
    })
  menuItem.setEnabled(true)
  this.addChild(menuItem, true)
}

/**
 * Handle the selection of an item in the context dropdown menu.
 * Intended to be overriden.
 * @param {eYo.MenuManager} mngr
 * @param {goog.events.Event} event The event containing as target
 */
eYo.brick.Dflt_p.handleMenuItemActionFirst = function (mngr, event) {
  return mngr.handleAction_movable_parent(this, event)
}

/**
 * Handle the selection of an item in the context dropdown menu.
 * Intended to be overriden.
 * @param {eYo.MenuManager} mngr
 * @param {goog.events.Event} event The event containing as target
 */
eYo.brick.Dflt_p.handleMenuItemActionMiddle = function (mngr, event) {
  return false
}

/**
 * Handle the selection of an item in the context dropdown menu.
 * Intended to be overriden.
 * @param {eYo.brick.Dflt} brick
 * @param {eYo.MenuManager} mngr
 * @param {goog.events.Event} event The event containing as target
 */
eYo.brick.Dflt_p.handleMenuItemActionLast = function (mngr, event) {
  return mngr.handleActionLast(this, event)
}

/**
 * Handle the selection of an item in the context dropdown menu.
 * Default implementation mimics Blockly behaviour.
 * Unlikely to be overriden.
 * @param {eYo.brick.Dflt} brick
 * @param {goog.events.Event} event The event containing as target
 * the MenuItem selected within menu.
 */
eYo.MenuManager.prototype.handleActionLast = function (brick, event) {
  var model = event.target.model_
  if (eYo.isF(model)) {
    setTimeout(function () {
      model(brick, event)
    }, 100)
    return true
  }
  var target = model.target || brick
  switch (model.action) {
  case eYo.id.DUPLICATE_BLOCK:
    Blockly.duplicate_(target)
    return true
  case eYo.id.REMOVE_COMMENT:
    target.setCommentText(null)
    return true
  case eYo.id.ADD_COMMENT:
    target.setCommentText('')
    return true
  case eYo.id.EXPAND_BLOCK:
    target.setCollapsed(false)
    return true
  case eYo.id.COLLAPSE_BLOCK:
    target.setCollapsed(true)
    return true
  case eYo.id.TOGGLE_ENABLE_BLOCK:
    target.disabled = !target.disabled
    return true
  case eYo.id.DELETE_BLOCK:
    var unwrapped = target
    var parent
    while (unwrapped.wrapped_ && (parent = unwrapped.surround)) {
      unwrapped = parent
    }
    // unwrapped is the topmost brick or the first unwrapped parent
    eYo.event.group = true
    var returnState = false
    try {
      if (target.hasFocus && target !== unwrapped) {
        // this brick was selected, select the brick below or above before deletion
        var m4t
        if (((m4t = unwrapped.foot_m) && (target = m4t.targetBrick)) || ((m4t = unwrapped.head_m) && (target = m4t.targetBrick))) {
          target.focusOn()
        } else if ((m4t = unwrapped.out_m) && (m4t = m4t.target)) {
          m4t.focusOn()
        }
      }
      unwrapped.dispose(true, true)
      returnState = true
    } catch (err) {
      console.error(err)
      throw err
    } finally {
      eYo.event.group = false
    }
    return returnState
  case eYo.id.HELP:
    target.showHelp_()
    return true
  }
}

/**
 * Populate the context menu for the given brick.
 * @param {eYo.brick.Dflt} brick The brick.
 * @param {eYo.MenuManager} mngr mngr.menu is the menu to populate.
 * @private
 */
eYo.MenuManager.prototype.populateVariable_ = function (brick) {
  return false
}

/**
 * Handle the selection of an item in the first part of the context dropdown menu.
 * Default implementation returns false.
 * @param {eYo.brick.Dflt} brick The Menu component clicked.
 * @param {goog....} event The event containing as target
 * the MenuItem selected within menu.
 */
eYo.MenuManager.prototype.handleAction_movable_parent = function (brick, event) {
  var model = event.target.model_
  if (eYo.isF(model)) {
    setTimeout(function () {
      model(brick, event)
    }, 100)
    return true
  }
  return false
}

/**
 * Populate the context menu for the given brick.
 * @param {eYo.brick.Dflt} brick The brick.
 * @private
 */
eYo.MenuManager.prototype.handleAction_movable_parent_module = eYo.menuManager.prototype.handleAction_movable_parent

/**
 * Populate the context menu for the given brick.
 * @param {eYo.brick.Dflt} brick The brick.
 * @private
 */
eYo.MenuManager.prototype.get_menuitem_content = function (type, subtype) {
  var Stmt1 = (key) => {
    return goog.dom.createDom(goog.dom.TagName.SPAN, null,
      eYo.do.CreateSPAN(key, 'eyo-code-reserved'),
      eYo.do.CreateSPAN(' … ', 'eyo-code-placeholder'),
      eYo.do.CreateSPAN(':', 'eyo-code-reserved')
    )
  }
  var Stmt2 = (key) => {
    return goog.dom.createDom(goog.dom.TagName.SPAN, null,
      eYo.do.CreateSPAN(key + ':', 'eyo-code-reserved')
    )
  }
  switch (type) {
  case eYo.t3.expr.parent_module:
    return goog.dom.createDom(goog.dom.TagName.SPAN, null,
      eYo.do.CreateSPAN('.', 'eyo-code'),
      goog.dom.createTextNode(' ' + eYo.msg.AT_THE_LEFT)
    )
  case eYo.t3.expr.attributeref:
    switch (subtype) {
    case eYo.key.ROOT:
      return goog.dom.createDom(goog.dom.TagName.SPAN, null,
        eYo.do.CreateSPAN('.', 'eyo-code'),
        eYo.do.CreateSPAN('attribute', 'eyo-code-placeholder'),
        goog.dom.createTextNode(' ' + eYo.msg.AT_THE_RIGHT)
      )
      // case eYo.key.ATTRIBUTE:
    default:
      return goog.dom.createDom(goog.dom.TagName.SPAN, null,
        eYo.do.CreateSPAN('primary', 'eyo-code-placeholder'),
        eYo.do.CreateSPAN('.', 'eyo-code'),
        goog.dom.createTextNode(' ' + eYo.msg.AT_THE_LEFT)
      )
    }
  case eYo.t3.expr.key_datum:
    return goog.dom.createDom(goog.dom.TagName.SPAN, null,
      eYo.do.CreateSPAN(': ', 'eyo-code'),
      eYo.do.CreateSPAN('…', 'eyo-code-placeholder'),
      goog.dom.createTextNode(' ' + eYo.msg.AT_THE_RIGHT)
    )
  case eYo.t3.expr.identifier_valued:
    return goog.dom.createDom(goog.dom.TagName.SPAN, null,
      eYo.do.CreateSPAN('= ', 'eyo-code'),
      eYo.do.CreateSPAN('…', 'eyo-code-placeholder'),
      goog.dom.createTextNode(' ' + eYo.msg.AT_THE_RIGHT)
    )
  case eYo.t3.expr.proper_slice:
    switch (subtype) {
    case eYo.key.LOWER_BOUND:
      return goog.dom.createDom(goog.dom.TagName.SPAN, null,
        eYo.do.CreateSPAN(':', 'eyo-code'),
        eYo.do.CreateSPAN('…', 'eyo-code-placeholder'),
        eYo.do.CreateSPAN(':', 'eyo-code'),
        eYo.do.CreateSPAN('…', 'eyo-code-placeholder'),
        goog.dom.createTextNode(' ' + eYo.msg.AT_THE_RIGHT)
      )
    case eYo.key.UPPER_BOUND:
      return goog.dom.createDom(goog.dom.TagName.SPAN, null,
        eYo.do.CreateSPAN('…', 'eyo-code-placeholder'),
        eYo.do.CreateSPAN(':', 'eyo-code'),
        goog.dom.createTextNode(' ' + eYo.msg.AND + ' '),
        eYo.do.CreateSPAN(':', 'eyo-code'),
        eYo.do.CreateSPAN('…', 'eyo-code-placeholder'),
        goog.dom.createTextNode(' ' + eYo.msg.AROUND)
      )
    case eYo.key.STRIDE:
    default:
      return goog.dom.createDom(goog.dom.TagName.SPAN, null,
        eYo.do.CreateSPAN('…', 'eyo-code-placeholder'),
        eYo.do.CreateSPAN(':', 'eyo-code'),
        eYo.do.CreateSPAN('…', 'eyo-code-placeholder'),
        eYo.do.CreateSPAN(':', 'eyo-code'),
        goog.dom.createTextNode(' ' + eYo.msg.AT_THE_LEFT)
      )
    }
  case eYo.t3.expr.expression_as_name:
    switch (subtype) {
    case eYo.key.AS:
      return goog.dom.createDom(goog.dom.TagName.SPAN, null,
        eYo.do.CreateSPAN('expression ', 'eyo-code-placeholder'),
        eYo.do.CreateSPAN('as', 'eyo-code-reserved'),
        goog.dom.createTextNode(' ' + eYo.msg.AT_THE_LEFT)
      )
    case eYo.key.EXPRESSION:
    default:
      return goog.dom.createDom(goog.dom.TagName.SPAN, null,
        eYo.do.CreateSPAN('as', 'eyo-code-reserved'),
        eYo.do.CreateSPAN(' name', 'eyo-code-placeholder'),
        goog.dom.createTextNode(' ' + eYo.msg.AT_THE_RIGHT)
      )
    }
  case eYo.t3.expr.slicing:
    return goog.dom.createDom(goog.dom.TagName.SPAN, null,
      eYo.do.CreateSPAN('[', 'eyo-code'),
      eYo.do.CreateSPAN('…', 'eyo-code-placeholder'),
      eYo.do.CreateSPAN(']', 'eyo-code'),
      goog.dom.createTextNode(' ' + eYo.msg.AT_THE_RIGHT)
    )
  case eYo.t3.expr.call_expr:
  case eYo.t3.expr.decorator_call_expr:
    return goog.dom.createDom(goog.dom.TagName.SPAN, null,
      eYo.do.CreateSPAN('(', 'eyo-code'),
      eYo.do.CreateSPAN('…', 'eyo-code-placeholder'),
      eYo.do.CreateSPAN(')', 'eyo-code'),
      goog.dom.createTextNode(' ' + eYo.msg.AT_THE_RIGHT)
    )
  case eYo.t3.expr.funcdef_typed:
    return goog.dom.createDom(goog.dom.TagName.SPAN, null,
      eYo.do.CreateSPAN('->', 'eyo-code'),
      eYo.do.CreateSPAN(' …', 'eyo-code-placeholder'),
      goog.dom.createTextNode(' ' + eYo.msg.AT_THE_RIGHT)
    )
  case eYo.t3.expr.dotted_name_as:
  case eYo.t3.expr.identifier_as:
    return goog.dom.createDom(goog.dom.TagName.SPAN, null,
      eYo.do.CreateSPAN('as', 'eyo-code-reserved'),
      eYo.do.CreateSPAN(' alias', 'eyo-code-placeholder')
    )
  case eYo.t3.expr.u_expr:
    return goog.dom.createDom(goog.dom.TagName.SPAN, null,
      eYo.do.CreateSPAN('-', 'eyo-code'),
      goog.dom.createTextNode(' ' + eYo.msg.AT_THE_LEFT)
    )
  case eYo.t3.expr.imagnumber:
    return goog.dom.createDom(goog.dom.TagName.SPAN, null,
      eYo.do.CreateSPAN('j', 'eyo-code'),
      goog.dom.createTextNode(' ' + eYo.msg.AT_THE_RIGHT)
    )
  case eYo.t3.expr.parenth_form:
    return goog.dom.createDom(goog.dom.TagName.SPAN, null,
      eYo.do.CreateSPAN('(', 'eyo-code'),
      goog.dom.createTextNode(' ' + eYo.msg.AND + ' '),
      eYo.do.CreateSPAN(')', 'eyo-code'),
      goog.dom.createTextNode(' ' + eYo.msg.AROUND)
    )
  case eYo.t3.expr.list_display:
    return goog.dom.createDom(goog.dom.TagName.SPAN, null,
      eYo.do.CreateSPAN('[', 'eyo-code'),
      goog.dom.createTextNode(' ' + eYo.msg.AND + ' '),
      eYo.do.CreateSPAN(']', 'eyo-code'),
      goog.dom.createTextNode(' ' + eYo.msg.AROUND)
    )
  case eYo.t3.expr.set_display:
  case eYo.t3.expr.dict_display:
    return goog.dom.createDom(goog.dom.TagName.SPAN, null,
      eYo.do.CreateSPAN('{', 'eyo-code'),
      goog.dom.createTextNode(' ' + eYo.msg.AND + ' '),
      eYo.do.CreateSPAN('}', 'eyo-code'),
      goog.dom.createTextNode(' ' + eYo.msg.AROUND)
    )
  case eYo.t3.stmt.if_part: return Stmt1('if')
  case eYo.t3.stmt.elif_part: return Stmt1('elif')
  case eYo.t3.stmt.for_part: return Stmt1('for')
  case eYo.t3.stmt.while_part: return Stmt1('while')
  case eYo.t3.stmt.try_part: return Stmt2('try')
  case eYo.t3.stmt.except_part: return Stmt1('except')
  case eYo.t3.stmt.void_except_part:return Stmt2('except')
  case eYo.t3.stmt.else_part:return Stmt2('else')
  case eYo.t3.stmt.finally_part:return Stmt2('finally')
  case eYo.t3.stmt.with_part: return Stmt1('with')
  case eYo.t3.stmt.expression_stmt:
    return goog.dom.createDom(goog.dom.TagName.SPAN, null,
      eYo.do.CreateSPAN('#', 'eyo-code-reserved'),
      eYo.do.CreateSPAN(' comment', 'eyo-code-placeholder')
    )
  case eYo.t3.stmt.assignment_stmt:
    return goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code-placeholder',
      goog.dom.createTextNode('name'),
      eYo.do.CreateSPAN(' = ', 'eyo-code-reserved'),
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
 * `model.slot` is the slot where the actual brick should be connected.
 * @param {eYo.brick.Dflt} brick The brick.
 * @param {Object} model the type of the parent to be and target slot.
 * @private
 */
eYo.MenuManager.prototype.populate_insert_as_top_parent = function (brick, model) {
  // THIS IS BROKEN SINCE THE SLOT KEYS ARE NO LONGER INTEGERS
  var m4t = brick.out_m
  if (!m4t) {
    // this is a statement brick
    return false
  }
  /** @suppress {accessControls} */
  var outCheck = m4t.check_
  var D = eYo.model.forKey(model.type).slots
  // if the brick which type is model.type has no slot
  // no chance to insert anything, pass away
  if (D) {
    var F = K => {
      var d = D[K]
      // d is a slotModel for a brick with type model.type
      if ((d && d.key && ((!model.input && !d.wrap) || d.key === model.input))) {
        if (outCheck) {
          var check = d.check && (d.check(model.type))
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
        var list = eYo.model.forKey(d.wrap).list
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
        check = eYo.isF(listCheck)
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
 * @param {eYo.brick.Dflt} brick The brick.
 * @param {string} type the type of the parent to be.
 * @private
 */
eYo.MenuManager.prototype.populate_insert_parent = function (brick, model, top) {
  // can we insert a brick typed type between the brick and
  // the target of its output connection
  var m4tOut = brick.out_m
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
 * @param {eYo.brick.Dflt} brick The brick.
 * @param {string|Object} model the subtype is for example the input name through which parent and children are connected.
 * @private
 * @return true if an item were added to the remove menu
 */
eYo.MenuManager.prototype.populate_replace_parent = function (brick, model) {
  var parent = brick.parent
  if (parent && parent.type === model.type) {
    var slot = brick.out_m.slot
    if (model.slot && slot.name !== model.slot) {
      return false
    }
    if (!brick.wrapped_ || brick.canUnwrap()) {
      if (brick.canReplaceBrick(parent)) {
        var content = this.get_menuitem_content(model.type, slot && slot.name)
        if (content) {
          var MI = this.newMenuItem(content, function () {
            brick.replaceBrick(parent)
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
 * @param {eYo.brick.Dflt} brick The brick.
 * @private
 */
eYo.MenuManager.prototype.populate_before_after = function (brick) {
  // Disable undo registration for a while
  var Ts = [
    eYo.t3.stmt.if_part,
    eYo.t3.stmt.elif_part,
    eYo.t3.stmt.for_part,
    eYo.t3.stmt.while_part,
    eYo.t3.stmt.try_part,
    eYo.t3.stmt.except_part,
    eYo.t3.stmt.void_except_part,
    eYo.t3.stmt.else_part,
    eYo.t3.stmt.finally_part,
    eYo.t3.stmt.with_part
    // eYo.t3.stmt.decorator_stmt,
    // eYo.t3.stmt.funcdef_part,
    // eYo.t3.stmt.classdef_part,
    // eYo.t3.stmt.import_stmt,
  ]
  var Us = [
    eYo.t3.stmt.comment_any, // defined
    eYo.t3.stmt.assignment_stmt,
    eYo.t3.stmt.print_stmt, // JL defined?
    eYo.t3.stmt.builtin__input_stmt// JL defined?
  ]
  var /** !eYo.magnet */ m4t, sep
  var F_after = /** @suppress{accessControls} */ (targetM4t, type) => {
    var b3k = eYo.brick.newReady(brick, type)
    var yorn = b3k.head_m &&
    b3k.head_m.checkType_(m4t) &&
    (!targetM4t || (b3k.foot_m && (targetM4t.checkType_(b3k.foot_m))))
    b3k.dispose(true)
    if (yorn) {
      var content = this.get_menuitem_content(type)
      var MI = this.newMenuItem(content, () => {
        this.insertBrickAfter(type)
      })
      this.addInsertAfterChild(MI)
      return true
    }
    return false
  }
  var F_before = /** @suppress{accessControls} */ (target, type) => {
    var b3k = eYo.brick.newReady(brick, type)
    var yorn = b3k.foot_m &&
    b3k.foot_m.checkType_(m4t) &&
    (!target || (b3k.head_m && (target.checkType_(b3k.head_m))))
    b3k.dispose(true)
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
  eYo.event.disableWrap(() => {
    if ((m4t = brick.foot_m)) {
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
    if ((m4t = brick.head_m)) {
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
 * @param {eYo.brick.Dflt} brick The brick.
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
    eYo.t3.expr.u_expr,
    [eYo.t3.expr.call_expr, eYo.key.ROOT],
    eYo.t3.expr.slicing,
    [eYo.t3.expr.attributeref, eYo.key.ATTRIBUTE],
    [eYo.t3.expr.attributeref, eYo.key.ROOT],
    [eYo.t3.expr.decorator_call_expr, eYo.key.NAME],
    eYo.t3.expr.imagnumber
  ], true)
  F([
    [eYo.t3.expr.expression_as_name, eYo.key.AS],
    [eYo.t3.expr.expression_as_name, eYo.key.EXPRESSION]
  ])
  this.shouldSeparateInsert()
  this.shouldSeparateRemove()
  F([
    eYo.t3.expr.parenth_form,
    eYo.t3.expr.list_display,
    eYo.t3.expr.set_display,
    eYo.t3.expr.dict_display,
    [eYo.t3.expr.funcdef_part, eYo.key.DEFINITION]
  ], true)
  F([
    eYo.t3.expr.parent_module,
    eYo.t3.expr.dotted_name_as,
    eYo.t3.expr.identifier_as,
    [eYo.t3.expr.key_datum, eYo.key.NAME],
    [eYo.t3.expr.identifier, eYo.key.NAME],
    [eYo.t3.expr.proper_slice, eYo.key.UPPER_BOUND],
    [eYo.t3.expr.proper_slice, eYo.key.STRIDE],
    [eYo.t3.expr.proper_slice, eYo.key.LOWER_BOUND]
  ])
}

/// //////////// SUBTYPES

/**
 * Populate the context menu for the given brick.
 * @param {eYo.brick.Dflt} brick The brick.
 * @private
 */
eYo.MenuManager.prototype.populateProperties = function (brick, key) {
  var eyo = brick
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
