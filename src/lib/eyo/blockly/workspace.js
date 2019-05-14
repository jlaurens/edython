/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview Workspace override.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Workspace')
goog.provide('eYo.WorkspaceDelegate')

goog.require('Blockly.Workspace')
goog.require('eYo.XRE')
goog.require('eYo.Helper')
goog.require('eYo.Brick')
goog.require('eYo.Navigate')
goog.require('eYo.App')
goog.require('eYo.Xml')
goog.require('eYo.Xml.Recover')
goog.require('eYo.Protocol.ChangeCount')
goog.require('goog.crypt')

/**
 * Class for a workspace delegate.
 * Extends the workspace with minimum interference.
 * @param {Blockly.Workspace} workspace
 * @readonly
 * @property {eYo.Driver} driver
 * @constructor
 */
eYo.WorkspaceDelegate = function (workspace) {
  eYo.WorkspaceDelegate.superClass_.constructor.call(this)
  this.workspace_ = workspace
  this.resetChangeCount()
}
goog.inherits(eYo.WorkspaceDelegate, eYo.Helper)

eYo.Do.addProtocol(eYo.WorkspaceDelegate.prototype, 'ChangeCount')

/**
 *
 */
eYo.WorkspaceDelegate.prototype.getRecover = (() => {
  var get = function () {
    return this.recover_
  }
  return function () {
    goog.asserts.assert(!this.recover_, 'Collision: this.recover_')
    this.recover_ = new eYo.Xml.Recover(this.workspace_)
    this.getRecover = get
    return this.recover_
  }
}) ()

Object.defineProperties(eYo.WorkspaceDelegate.prototype, {
  recover: {
    get () {
      return this.getRecover()
    }
  },
  driver: {
    get () {
      return this.driver_ || (this.driver_ = this.driverCreate())
    },
    set (newValue) {
      this.driver_ = newValue
    }
  }
})

/**
 * Create a driver for rendering.
 * @return {eYo.Driver}
*/
eYo.WorkspaceDelegate.prototype.driverCreate = eYo.Do.nothing

// Dependency ordering?
/**
 * Add the nodes from string to the workspace.
 * UNUSED.
 * @param {!String} str
 * @return {Array.<string>} An array containing new block IDs.
*/
eYo.WorkspaceDelegate.prototype.fromDom = function (dom) {
  return dom && eYo.Xml.domToWorkspace(dom, this.workspace_)
}

/**
 * Add the nodes from string to the workspace.
 * @param {!String} str
 * @return {Array.<string>} An array containing new block IDs.
*/
eYo.WorkspaceDelegate.prototype.fromString = function (str) {
  var parser = new DOMParser()
  var dom = parser.parseFromString(str, 'application/xml')
  return this.fromDom(dom)
}

/**
 * Convert the workspace to string.
 * @param {?Object} opt  See eponym parameter in `eYo.Xml.brickToDom`.
 */
eYo.WorkspaceDelegate.prototype.toDom = function (opt) {
  return eYo.Xml.workspaceToDom(this.workspace_, opt)
}

/**
 * Convert the workspace to string.
 * @param {?Boolean} opt_noId
 */
eYo.WorkspaceDelegate.prototype.toString = function (opt_noId) {
  let oSerializer = new XMLSerializer()
  return oSerializer.serializeToString(this.toDom())
}

/**
 * Convert the workspace to UTF8 byte array.
 * @param {?Boolean} opt_noId
 */
eYo.WorkspaceDelegate.prototype.toUTF8ByteArray = function (opt_noId) {
  var s = '<?xml version="1.0" encoding="utf-8"?>\n' + this.toString(optNoId)
  return goog.crypt.toUTF8ByteArray(s)
}

/**
 * Add the nodes from UTF8 string representation to the workspace. UNUSED.
 * @param {!Array} bytes
 * @return {Array.<string>} An array containing new block IDs.
*/
eYo.WorkspaceDelegate.prototype.fromUTF8ByteArray = function (bytes) {
  var str = goog.crypt.utf8ByteArrayToString(bytes)
  return str && this.fromString(str)
}

/**
 * Add a brick to the workspace.
 * @param {eYo.Brick} brick
 */
eYo.WorkspaceDelegate.prototype.addBrick = function (brick) {
  this.rendered && brick.beReady()
  this.workspace.addTopBlock(brick)
}

/**
 * Add a brick to the workspace.
 * @param {eYo.Brick} brick
 */
eYo.WorkspaceDelegate.prototype.removeBrick = function (brick) {
  this.workspace.removeTopBlock(brick)
  // Remove from workspace
  delete this.workspace.blockDB_[brick.id]
}

/**
 * Class for a workspace.  This is a data structure that contains bricks.
 * There is no UI, and can be created headlessly.
 * @param {Blockly.Options} optOptions Dictionary of options.
 * @constructor
 */
eYo.Workspace = function (optOptions) {
  eYo.Workspace.superClass_.constructor.call(this, optOptions)
  this.eyo = new eYo.WorkspaceDelegate(this)
}
goog.inherits(eYo.Workspace, Blockly.Workspace)

/**
 * Dispose of this workspace.
 * Unlink from all DOM elements to prevent memory leaks.
 * @suppress{accessControls}
 */
Blockly.Workspace.prototype.dispose = function () {
  this.listeners_.length = 0
  this.clear()
  this.eyo.dispose()
  this.eyo = null
  // Remove from workspace database.
  delete Blockly.Workspace.WorkspaceDB_[this.id]
}

/**
 * Clear the undo/redo stacks.
 */
eYo.Workspace.prototype.clearUndo = function() {
  eYo.Workspace.superClass_.clearUndo.call(this)
  eYo.App.didClearUndo && eYo.App.didClearUndo()
}

/**
 * Clear of this workspace.
 * Unlink from all DOM elements to prevent memory leaks.
 * @suppress{accessControls}
 */
eYo.Workspace.prototype.clear = function () {
  eYo.Workspace.superClass_.clear.call(this)
  this.eyo.error = undefined
}

/**
 * Dispose of this workspace.
 * Unlink from all DOM elements to prevent memory leaks.
 * @suppress{accessControls}
 */
Blockly.Workspace.prototype.dispose = function () {
  this.listeners_.length = 0
  this.clear()
  this.eyo.dispose()
  this.eyo = null
  // Remove from workspace database.
  delete Blockly.Workspace.WorkspaceDB_[this.id]
}

/**
 * Returns a block subclass for eYo bricks.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @param {string=} opt_id Optional ID.  Use this ID if provided, otherwise
 *     create a new id.
 * @return {!eYo.Brick} The created block.
 */
eYo.Workspace.prototype.newDlgt = function (prototypeName, opt_id) {
  return eYo.Brick.Manager.create(this, prototypeName, opt_id)
}

/**
 * Obtain a newly created block.
 * Returns a block subclass for eYo bricks.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @param {string=} optId Optional ID.  Use this ID if provided, otherwise
 *     create a new id.
 * @return {!Blockly.Block} The created block.
 */
eYo.Workspace.prototype.newBlock = function (prototypeName, optId) {
  return new eYo.Brick(/** Blockly.Workspace */ this, prototypeName, optId)
}

eYo.Workspace.prototype.logAllConnections = function (comment) {
  comment = comment || ''
  ;[
    'INPUT',
    'OUTPUT',
    'FOOT',
    'HEAD',
    'LEFT',
    'RIGHT'
  ].forEach(k => {
    var dbList = this.connectionDBList
    console.log(`${comment} > ${k} magnet`)
    var db = dbList[eYo.Magnet[k]]
    dbList[eYo.Magnet[k]].forEach(m4t => {
      console.log(m4t.x_, m4t.y_, m4t.offsetInBlock_, m4t.brick.type)
    })
  })
}

/**
 * Find the brick on this workspace with the specified ID.
 * Wrapped bricks have a complex id.
 * @param {string} id ID of block to find.
 * @return {?Blockly.Block} The sought after block or null if not found.
 */
Blockly.Workspace.prototype.getBlockById = (() => {
  var getBrickById = Blockly.Workspace.prototype.getBlockById
  return function (id) {
    var brick = getBrickById.call(this, id)
    if (brick) {
      return brick
    }
    var m = XRegExp.exec(id, eYo.XRE.id_wrapped)
    if (m && (brick = getBlockById.call(this, m.id))) {
      return brick.someInputMagnet(m4t => {
          var brick = m4t.targetBrick
          if (brick && brick.id === id) {
            return brick
          }
      })
    }
  }
}) ()

/**
 * Undo or redo the previous action.
 * @param {boolean} redo False if undo, true if redo.
 */
eYo.Workspace.prototype.undo = function(redo) {
  var inputStack = redo ? this.redoStack_ : this.undoStack_
  var outputStack = redo ? this.undoStack_ : this.redoStack_
  while (true) {
    var inputEvent = inputStack.pop()
    if (!inputEvent) {
      return
    }
    var events = [inputEvent]
    // Do another undo/redo if the next one is of the same group.
    while (inputStack.length && inputEvent.group &&
        inputEvent.group == inputStack[inputStack.length - 1].group) {
      events.push(inputStack.pop())
      // update the change count
    }
    events = Blockly.Events.filter(events, redo)
    if (events.length) {
      // Push these popped events on the opposite stack.
      events.forEach((event) => {
        outputStack.push(event)
      })
      eYo.Events.recordUndo = false
      var Bs = []
      eYo.Do.tryFinally(() => { // try
        if (this.rendered) {
          events.forEach(event => {
            var B = this.getBlockById(event.blockId)
            if (B) {
              B.changeBegin()
              Bs.push(B)
            }
          })
        }
        events.forEach(event => {
          event.run(redo)
          this.eyo.updateChangeCount(event, redo)
        })
      }, () => { // finally
        eYo.Events.recordUndo = true
        Bs.forEach(B => B.changeEnd())
        eYo.App.didProcessUndo && eYo.App.didProcessUndo(redo)
      })
      return
    }
  }
}

/**
 * Fire a change event.
 * Some code is added to manage the 'edited' document status.
 * @param {!Blockly.Events.Abstract} event Event to fire.
 */
eYo.Workspace.prototype.fireChangeListener = function(event) {
  var before = this.undoStack_.length
  eYo.Workspace.superClass_.fireChangeListener.call(this, event)
  // For newly created events, update the change count
  if (event.recordUndo) {
    this.eyo.updateChangeCount(event, true)
    if (before === this.undoStack_.length) {
      eYo.App.didUnshiftUndo && eYo.App.didUnshiftUndo()
    } else {
      eYo.App.didPushUndo && eYo.App.didPushUndo()
    }
  }
}

/**
 * Handle a key-down on SVG drawing surface.
 * The delete block code is modified
 * @param {!Event} e Key down event.
 * @private
 */
Blockly.onKeyDown_ = function(e) {
  if (Blockly.mainWorkspace.options.readOnly || Blockly.utils.isTargetInput(e)) {
    // No key actions on readonly workspaces.
    // When focused on an HTML text input widget, don't trap any keys.
    return;
  }
  // var deleteBlock = false;
  if (e.keyCode == 9) {
    if (eYo.Navigate.doTab(eYo.Selected.brick, {
        left: e.shiftKey,
        fast: e.altKey || e.ctrlKey || e.metaKey
      })) {
      e.preventDefault()
      e.stopPropagation()
    }
  } else if (e.keyCode == 27) {
    // Pressing esc closes the context menu.
    Blockly.hideChaff();
  } else if (e.keyCode == 8 || e.keyCode == 46) {
    // Delete or backspace.
    // Stop the browser from going back to the previous page.
    // Do this first to prevent an error in the delete code from resulting in
    // data loss.
    e.preventDefault();
    // Don't delete while dragging.  Jeez.
    if (Blockly.mainWorkspace.isDragging()) {
      return;
    }
    if (eYo.Selected.brick && eYo.Selected.brick.isDeletable()) {
      eYo.deleteBlock(eYo.Selected.brick, e.altKey || e.ctrlKey || e.metaKey);
    }
  } else if (e.altKey || e.ctrlKey || e.metaKey) {
    // Don't use meta keys during drags.
    if (Blockly.mainWorkspace.isDragging()) {
      return;
    }
    if (eYo.Selected.brick &&
        eYo.Selected.brick.isDeletable() && eYo.Selected.brick.isMovable()) {
      // Eyo: 1 meta key for shallow copy, more for deep copy
      var deep = (e.altKey ? 1 : 0) + (e.ctrlKey ? 1 : 0) + (e.metaKey ? 1 : 0) > 1
      // Don't allow copying immovable or undeletable bricks. The next step
      // would be to paste, which would create additional undeletable/immovable
      // bricks on the workspace.
      if (e.keyCode == 67) {
        // 'c' for copy.
        Blockly.hideChaff();
        eYo.copyBlock(eYo.Selected.brick, deep);
      } else if (e.keyCode == 88 && !eYo.Selected.brick.workspace.isFlyout) {
        // 'x' for cut, but not in a flyout.
        // Don't even copy the selected item in the flyout.
        eYo.copyBlock(eYo.Selected.brick, deep);
        eYo.deleteBlock(eYo.Selected.brick, deep);
      }
    }
    if (e.keyCode == 86) {
      // 'v' for paste.
      if (Blockly.clipboardXml_) {
        Blockly.Events.setGroup(true);
        // Pasting always pastes to the main workspace, even if the copy started
        // in a flyout workspace.
        var workspace = Blockly.clipboardSource_;
        if (workspace.isFlyout) {
          workspace = workspace.targetWorkspace;
        }
        workspace.paste(Blockly.clipboardXml_);
        Blockly.Events.setGroup(false);
      }
    } else if (e.keyCode == 90) {
      // 'z' for undo 'Z' is for redo.
      Blockly.hideChaff();
      eYo.App.workspace.undo(e.shiftKey);
    }
  }
  // Common code for delete and cut.
  // Don't delete in the flyout.
  // if (deleteBlock && !eYo.Selected.brick.workspace.isFlyout) {
  //   Blockly.Events.setGroup(true);
  //   Blockly.hideChaff();
  //   eYo.Selected.brick.dispose(/* heal */ true, true);
  //   Blockly.Events.setGroup(false);
  // }
};

/**
 * Delete this block and the next ones if requested.
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {!boolean} shallow
 */
eYo.deleteBlock = function (block, deep) {
  if (block && block.isDeletable() && !block.workspace.isFlyout) {
    var eyo = block.eyo
    if (eyo.selected) {
      // prepare a connection or a block to be selected
      var m4t
      if ((m4t = eyo.magnets.output)) {
        m4t = m4t.target
      } else if ((m4t = eyo.magnets.foot)) {
        var t9k = m4t.targetBrick
      }
    }
    eYo.Events.groupWrap(() => {
      Blockly.hideChaff()
      if (deep) {
        do {
          var low = eyo.foot
          eyo.dispose(false, true)
        } while ((eyo = low))
      } else {
        eyo.dispose(true, true)
      }
    })
    if (m4t && m4t.brick.workspace) {
      m4t.select()
    } else if (t9k) {
      eYo.Selected.brick = t9k
    }
  }
}

/**
 * Copy a block onto the local clipboard.
 * @param {!Blockly.Block} block Block to be copied.
 * @private
 */
eYo.copyBlock = function(block, deep) {
  var xml = eYo.Xml.brickToDom(block.eyo, {noId: true, noNext: !deep});
  // Copy only the selected block and internal bricks.
  // Encode start position in XML.
  var xy = block.eyo.ui.xyInSurface;
  xml.setAttribute('x', block.RTL ? -xy.x : xy.x);
  xml.setAttribute('y', xy.y);
  Blockly.clipboardXml_ = xml;
  Blockly.clipboardSource_ = block.workspace;
  eYo.App.didCopyBlock && eYo.App.didCopyBlock(block, xml)
};

/**
 * Record the block that a gesture started on, and set the target block
 * appropriately.
 * Addendum: there is a switch to only start from a statement
 * @param {eYo.Brick} block The block the gesture started on.
 * @package
 */
Blockly.Gesture.prototype.setStartBlock = (() => {
  var setStartBlock = Blockly.Gesture.prototype.setStartBlock
  return function(brick) {
    var candidate = brick
    var selected = eYo.Selected.brick
    do {
      if (brick.isStmt || selected === brick) {
        candidate = brick
        break
      } else {
        candidate = brick
      }
    } while ((brick = brick.parent))
    setStartBlock.call(this, candidate)
  }
}) ()

