/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview Block for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Block')
goog.require('Blockly.Block')
goog.forwardDeclare('eYo.Delegate')
goog.forwardDeclare('eYo.T3.All')

/**
 * Class for a block, this will be removed.
 * Not normally called directly, workspace.newDlgt() is preferred.
 * For edython.
 * @param {!eYo.Delegate} dlgt The block's owner.
 * @constructor
 */
eYo.Block = function (dlgt) {
  this.eyo = dlgt
  var workspace =  dlgt.workspace

  // /** @type {string} */
  // this.id = (opt_id && !workspace.getBlockById(opt_id)) ?
  //     opt_id : Blockly.utils.genUid()
  workspace.blockDB_[this.id] = this

  // workspace.addTopBlock(this)

  // Call an initialization function, if it exists.
  if (goog.isFunction(this.init)) {
    this.init()
  }

  // Fire a create event.
  if (Blockly.Events.isEnabled()) {
    var existingGroup = Blockly.Events.getGroup()
    if (!existingGroup) {
      Blockly.Events.setGroup(true)
    }
    try {
      Blockly.Events.fire(new Blockly.Events.BlockCreate(this))
    } finally {
      if (!existingGroup) {
        Blockly.Events.setGroup(false)
      }
    }
  }
  workspace.addTopBlock(this)
}

goog.inherits(eYo.Block, Blockly.Block)

Object.defineProperties(eYo.Block.prototype, {
  workspace: {
    get () {
      return this.eyo.workspace
    }
  },
  type: {
    get () {
      return this.eyo.type
    }
  },
  id: {
    get () {
      return this.eyo.id
    }
  },
  inputList: {
    get () {
      return this.eyo.inputList
    }
  },
  /**
   * @readonly
   * @type {boolean}
   * @private
   */
  deletable_: {
    get () {
      return this.eyo.deletable_
    }
  },
  /**
   * @readonly
   * @type {boolean}
   * @private
   */
  movable_: {
    get () {
      return this.eyo.movable_
    }
  },
  /**
   * @readonly
   * @type {boolean}
   * @private
   */
  editable_: {
    get () {
      return this.eyo.editable_
    }
  },
  /**
   * @readonly
   * @type {boolean}
   * @private
   */
  collapsed_: {
    get () {
      return this.eyo.collapsed_
    }
  },
  /**
   * The block's position in workspace units.
   * (0, 0) is at the workspace's
   * origin scale does not change this value.
   * @readonly
   * @type {!goog.math.Coordinate}
   * @private
   */
  collapsed_: {
    get () {
      return this.eyo.xy_
    }
  },
  parentBlock_: {
    get () {
      var p = this.eyo.parent
      return p && p.block_
    },
    set (newValue) {
      this.eyo.parent = newValue && newValue.eyo
    }
  },
  /**
   * Returns a bounding box describing the dimensions of this block
   * and any blocks stacked below it.
   * @return {!{height: number, width: number}} Object with height and width
   *    properties in workspace units.
   */
  getHeightWidth: {
    get () {
      return () => {
        this.eyo.ui.size
      }
    }
  },
  /**
   * Play some UI effects (sound, ripple) after a connection has been established.
   */
  connectionUiEffect: {
    get () {
      var ui = this.eyo.ui
      ui && ui.connectionUIEffect
    }
  },
  /**
   * Fetches the named input object.
   * @param {string} name The name of the input.
   * @return {eYo.Input} The input object, or null if input does not exist.
   */
  getInput: {
    get () {
      return this.eyo.getInput
    }
  },
  /**
   * Render the block.
   * Lays out and reflows a block based on its contents and settings.
   * @param {boolean=} optBubble If false, just render this block.
   * @param {?Object} io  rendering state recorder.
   *   If true, also render block's parent, grandparent, etc.  Defaults to true.
   */
  render: {
    get () {
      return this.eyo.render
    }
  },
  /**
   * Returns the named field from a block.
   * When not found using the inherited method,
   * ask the delegate.
   * NB: not all fields belong to an input.
   * @param {string} name The name of the field.
   * @return {Blockly.Field} Named field, or null if field does not exist.
   */
  getField: {
    get () {
      return this.eyo.getField
    }
  },
  /**
   * Move this block during a drag, taking into account whether we are using a
   * drag surface to translate blocks.
   * This block must be a top-level block.
   * @param {!goog.math.Coordinate} newLoc The location to translate to, in
   *     workspace coordinates.
   * @package
   */
  moveDuringDrag: {
    get () {
      return this.eyo.ui && this.eyo.ui.moveDuringDrag
    }
  },
  /**
   * Recursively adds or removes the dragging class to this node and its children.
   * Store `adding` in a property of the delegate.
   * @param {boolean} adding True if adding, false if removing.
   * @package
   */
  setDragging: {
    get () {
      return this.eyo.ui.setDragging
    }
  },
  /**
   * Update the visual effect for disabled/enabled blocks.
   */
  updateDisabled: {
    get () {
      return this.eyo.ui && this.eyo.ui.updateDisabled
    }
  },
  /**
   * Translates the block, forwards to the ui driver.
   * @param {number} x The x coordinate of the translation in workspace units.
   * @param {number} y The y coordinate of the translation in workspace units.
   */
  translate = {
    get() {
      return this.eyo.ui && this.eyo.ui.translate
    }
  },
  childBlocks_: {
    get () {
      return this.eyo.childBlocks_
    }
  },
  getConnections: {
    get () {
      return this.eyo.getConnections
    }
  },  
  setCollapsed: {
    get () {
      return this.eyo.setCollapsed
    }
  },  
  isMovable: {
    get () {
      return this.eyo.isMovable
    }
  },
  /**
   * Return the coordinates of the top-left corner of this block relative to the
   * drawing surface's origin (0,0), in workspace units.
   * If the block is on the workspace, (0, 0) is the origin of the workspace
   * coordinate system.
   * This does not change with workspace scale.
   * @return {!goog.math.Coordinate} Object with .x and .y properties in
   *     workspace coordinates.
   */
  getRelativeToSurfaceXY: {
    get () {
      throw "INCONSISTENCY: BREAK HERE"
    }
  },
  getSvgRoot: {
    get () {
      throw "INCONSISTENCY: BREAK HERE"
    }
  },
  outputConnection: {
    get () {
      console.error("INCONSISTENCY: BREAK HERE")
      throw "FORBIDDEN"
    }
  },
  previousConnection: {
    get () {
      console.error("INCONSISTENCY: BREAK HERE")
      throw "FORBIDDEN"
    }
  },
  nextConnection: {
    get () {
      console.error("INCONSISTENCY: BREAK HERE")
      throw "FORBIDDEN"
    }
  },
  width: {
    get () {
      return this.eyo.span && this.eyo.span.width || this.width__
    },
    set (newValue) {
      if (isNaN(newValue)) {
        console.error('NAN FAILED')
      }
      if (this.eyo.span) {
        console.error('DO NOT SET THE WIDTH DIRECTLY, break here.')
        this.eyo.span.width = newValue
      } else {
        this.width__ = newValue
      }
    }
  },
  rendered: {
    get () {
      var ui = this.eyo && this.eyo.ui
      return ui && ui.rendered
    },
    set (newValue) {
      var ui = this.eyo && this.eyo.ui
      ui && (ui.rendered = newValue)
    }
  },
  disabled: {
    get () {
      return this.eyo.disabled
    },
    set (newValue) {
      this.eyo.disabled = newValue
    }
  },
  collapsed_: {
    get () {
      return this.eyo.collapsed
    },
    set (newValue) {
      this.eyo.collapsed = newValue
    }
  },
  isInFlyout: {
    get () {
      return this.workspace.isFlyout
    }
  },
  svgGroup_: {
    get () {
      throw "INCONSISTANT, BREAK HERE"
    }
  }
})

/**
 * Initialize the block.
 * Let the delegate do the job.
 * No rendering of that block is done during that process,
 * linked blocks may render though.
 */
eYo.Block.prototype.init = function () {
  this.eyo.init()
}

/**
 * Dispose the delegate too.
 * @param {Boolean} healStack.
 */
eYo.Block.prototype.dispose = function (healStack) {
  if (!this.workspace) {
    return
  }
  this.unplug(healStack)
  if (this.eyo.wrapped_) {
    var t4t = this.magnets.output.target
    if (t4t) {
      t4t.wrapped_ = false
      t4t.slot && (t4t.slot.wrapped_ = false)
    }
    // dispose of child blocks before calling super
    Blockly.Events.disable()
    try {
      // First, dispose of all my children.
      // This must be done before unplug
      this.eyo.forEachChild(d => d.block_.dispose(false))
    } finally {
      Blockly.Events.enable()
    }
  } else {
    if (Blockly.Events.isEnabled()) {
      Blockly.Events.fire(new Blockly.Events.BlockDelete(this))
    }
  }
  Blockly.Events.disable()
  try {
    eYo.Block.superClass_.dispose.call(this, healStack)
    this.eyo.dispose()
  } finally {
    Blockly.Events.enable()
  }
}

/**
 * The default implementation forwards to super then
 * lets the delegate handle special cases.
 * @param {boolean} hidden True if connections are hidden.
 * @override
 */
eYo.Block.prototype.setConnectionsHidden = function (hidden) {
  eYo.Block.superClass_.setConnectionsHidden.call(this, hidden)
  this.eyo.setConnectionsHidden(hidden)
}

/**
 * Return all variables referenced by this block.
 * This is not exactly Blockly's implementation,
 * only FieldInput's are considered.
 * @return {!Array.<string>} List of variable names.
 */
eYo.Block.prototype.getVars = function () {
  var vars = []
  for (var i = 0, input; (input = this.inputList[i]); i++) {
    for (var j = 0, field; (field = input.fieldRow[j]); j++) {
      if (field instanceof eYo.FieldInput) {
        vars.push(field.getText())
      }
    }
  }
  return vars
}

/**
 * Notification that a variable is renaming.
 * If the name matches one of this block's variables, rename it.
 * @param {string} oldName Previous name of variable.
 * @param {string} newName Renamed variable.
 */
eYo.Block.prototype.renameVar = function (oldName, newName) {
  for (var i = 0, input; (input = this.inputList[i]); i++) {
    for (var j = 0, field; (field = input.fieldRow[j]); j++) {
      if (field instanceof eYo.FieldInput &&
          Blockly.Names.equals(oldName, field.getText())) {
        field.setText(newName)
      }
    }
  }
}

/**
 * Notification of a variable replacement.
 * If the id matches one of this block's variables, replace it.
 * @param {string} oldVarId Previous variable.
 * @param {string} newVarId Replacement variable.
 */
eYo.Block.prototype.replaceVarId = function (oldVarId, newVarId) {
  for (var i = 0, input; (input = this.inputList[i]); i++) {
    for (var j = 0, field; (field = input.fieldRow[j]); j++) {
      if (field instanceof eYo.FieldInput &&
          Blockly.Names.equals(oldVarId, field.getValue())) {
        field.setValue(newVarId)
      }
    }
  }
}

/**
 * Unplug this block from its superior block.
 * If this block is a *next* statement,
 * optionally reconnect the block underneath with the block on top.
 * @param {boolean=} opt_healStack Disconnect child statement and reconnect
 *   stack.  Defaults to false.
 */
Blockly.Block.prototype.unplug = (() => {
  var unplug = Blockly.Block.prototype.unplug
  return function(opt_healStack) {
    if (this.eyo.magnets.left.target) {
      this.eyo.magnets.left.disconnect()
    } else {
      unplug.call(this, opt_healStack)
    }
  }
})()

/**
 * Set parent of this block to be a new block or null.
 * @param {Blockly.Block} newParent New parent block or null.
 */
Blockly.Block.prototype.setParent = (() => {
  var setParent = Blockly.Block.prototype.setParent
  return function(newParent) {
    if (newParent !== this.parentBlock_) {
      var ui = this.ui
      ui && ui.parentWillChange(newParent)
      var oldParent = this.parentBlock_
      setParent.call(this, newParent)
      ui && ui.parentDidChange(oldParent)
    }
  }
})()

/**
 * Disconnect the workspace very lately.
 * It was not a LIFO design.
 * Dispose of this block.
 * @param {boolean} healStack If true, then try to heal any gap by connecting
 *     the next statement with the previous statement.  Otherwise, dispose of
 *     all children of this block.
 */
Blockly.Block.prototype.dispose = function(healStack) {
  if (!this.workspace) {
    // Already deleted.
    return
  }
  // Terminate onchange event calls.
  if (this.onchangeWrapper_) {
    this.workspace.removeChangeListener(this.onchangeWrapper_)
  }
  this.unplug(healStack)
  if (Blockly.Events.isEnabled()) {
    Blockly.Events.fire(new Blockly.Events.BlockDelete(this))
  }
  Blockly.Events.disable()

  try {
    // Just deleting this block from the DOM would result in a memory leak as
    // well as corruption of the connection database.  Therefore we must
    // methodically step through the blocks and carefully disassemble them.

    // First, dispose of all my children.
    this.eyo.forEachChild(d => {
      // disable auto creation of wrapped targets
      var m4t = d.magnets.output
      m4t = m4t && m4t.target
      m4t && (m4t.wrapped_ = false)
      d.block_.dispose(false)
    })
    // Then dispose of myself.
    // Dispose of all inputs and their fields.
    this.inputList.forEach(i => i.dispose())
    this.inputList.length = 0
    // Dispose of any remaining connections (next/previous/output).
    this.getConnections_(true).forEach(c8n => {
      if (c8n.isConnected()) {
        c8n.disconnect()
      }
      c8n.dispose()
    })
    // Remove this block from the workspace's list of top-most blocks.
    this.workspace.removeTopBlock(this)
    // Remove from block database.
    delete this.workspace.blockDB_[this.id]
    this.workspace = null
  } finally {
    Blockly.Events.enable()
  }
}
