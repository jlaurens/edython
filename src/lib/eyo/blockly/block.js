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
 * Class for a block.
 * Not normally called directly, workspace.newBlock() is preferred.
 * For edython.
 * @param {!Blockly.Workspace} workspace The block's workspace.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @param {string=} optId Optional ID.  Use this ID if provided, otherwise
 *     create a new id.
 * @extends {Blockly.Block}
 * @constructor
 */
eYo.Block = function (workspace, prototypeName, opt_id) {
//  eYo.Block.superClass_.constructor.call(this, workspace, prototypeName, optId)
  if (typeof Blockly.Generator.prototype[prototypeName] !== 'undefined') {
    console.warn('FUTURE ERROR: Block prototypeName "' + prototypeName
        + '" conflicts with Blockly.Generator members. Registering Generators '
        + 'for this block type will incur errors.'
        + '\nThis name will be DISALLOWED (throwing an error) in future '
        + 'versions of Blockly.')
  }
  this.eyo = eYo.Delegate.Manager.create(workspace, prototypeName, opt_id, this)

  // /** @type {string} */
  // this.id = (opt_id && !workspace.getBlockById(opt_id)) ?
  //     opt_id : Blockly.utils.genUid()
  workspace.blockDB_[this.id] = this
  // /** @type {Blockly.Connection} */
  // this.outputConnection = null
  // /** @type {Blockly.Connection} */
  // this.nextConnection = null
  // /** @type {Blockly.Connection} */
  // this.previousConnection = null
  // /** @type {!Array.<!Blockly.Input>} */
  // this.inputList = []
  /** @type {boolean|undefined} */
  this.inputsInline = undefined
  /** @type {boolean} */
  this.disabled = false
  /** @type {string|!Function} */
  this.tooltip = ''
  /** @type {boolean} */
  this.contextMenu = true

  /**
   * @type {Blockly.Block}
   * @private
   */
  this.parentBlock_ = null

  // /**
  //  * @type {!Array.<!Blockly.Block>}
  //  * @private
  //  */
  // this.childBlocks_ = []

  /**
   * @type {boolean}
   * @private
   */
  this.deletable_ = true

  /**
   * @type {boolean}
   * @private
   */
  this.movable_ = true

  /**
   * @type {boolean}
   * @private
   */
  this.editable_ = true

  /**
   * @type {boolean}
   * @private
   */
  this.isShadow_ = false

  /**
   * @type {boolean}
   * @private
   */
  this.collapsed_ = false

  /** @type {string|Blockly.Comment} */
  this.comment = null

  /**
   * The block's position in workspace units.  (0, 0) is at the workspace's
   * origin scale does not change this value.
   * @type {!goog.math.Coordinate}
   * @private
   */
  this.xy_ = new goog.math.Coordinate(0, 0)

  // /** @type {!Blockly.Workspace} */
  // this.workspace = workspace
  /** @type {boolean} */
  this.isInFlyout = workspace.isFlyout
  /** @type {boolean} */
  this.isInMutator = workspace.isMutator

  /** @type {boolean} */
  this.RTL = workspace.RTL

  // Copy the type-specific functions and data from the prototype.
  if (prototypeName) {
    // /** @type {string} */
    // this.type = prototypeName
    var prototype = Blockly.Blocks[prototypeName]
    goog.asserts.assertObject(prototype,
        'Error: Unknown block type "%s".', prototypeName)
    goog.mixin(this, prototype)
  }
  
  // workspace.addTopBlock(this)

  // Call an initialization function, if it exists.
  if (goog.isFunction(this.init)) {
    this.init()
  }

  // Record initial inline state.
  /** @type {boolean|undefined} */
  this.inputsInlineDefault = this.inputsInline

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
  // Bind an onchange function, if it exists.
  if (goog.isFunction(this.onchange)) {
    this.setOnChange(this.onchange)
  }
  // JL
  workspace.addTopBlock(this)
}

goog.inherits(eYo.Block, Blockly.Block)

Object.defineProperties(eYo.Block.prototype, {
  workspace: {
    get () {
      return this.eyo.workspace
    },
    set (newValue) {
      // do nothing
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
  parentBlock_: {
    get () {
      var p = this.eyo.parent
      return p && p.block_
    },
    set (newValue) {
      this.eyo.parent = newValue && newValue.eyo
    }
  },
  inputList: {
    get () {
      return this.eyo.inputList
    }
  },
  childBlocks_: {
    get () {
      return this.eyo.childBlocks_
    }
  },
  outputConnection: {
    get () {
      var m = this.eyo.magnets.output
      return m && m.connection
    },
    set (newValue) {
      console.error("INCONSISTENCY: BREAK HERE")
      throw "FORBIDDEN"
    }
  },
  previousConnection: {
    get () {
      var m = this.eyo.magnets.top
      return m && m.connection
    },
    set (newValue) {
      console.error("INCONSISTENCY: BREAK HERE")
      throw "FORBIDDEN"
    }
  },
  nextConnection: {
    get () {
      var m = this.eyo.magnets.bottom
      return m && m.connection
    },
    set (newValue) {
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
  isInFlyout: {
    get () {
      return this.eyo.isInFlyout
    },
    set (newValue) {
      this.eyo.isInFlyout = newValue
    }
  },
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
      this.forEachChild(b => b.dispose(false))
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
 * Add a value input, statement input or local variable to this block.
 * @param {number} type Either Blockly.INPUT_VALUE or Blockly.NEXT_STATEMENT or
 *     Blockly.DUMMY_INPUT.
 * @param {string} name Language-neutral identifier which may used to find this
 *     input again.  Should be unique to this block.
 * @return {!Blockly.Input} The input object created.
 * @private
 * @override
 */
eYo.Block.prototype.appendInput_ = function (type, name) {
  var input = eYo.Block.superClass_.appendInput_.call(this, type, name)
  eYo.Input.setupEyO(input)
  return input
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
    this.forEachChild(b => {
      // disable auto creation of wrapped targets
      var c8n = b.eyo.outputConnection
      c8n = c8n && c8n.targetConnection
      c8n && (c8n.eyo.wrapped_ = false)
      b.dispose(false)
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

/**
 * Execute the helper for each child.
 * Works on a shallow copy of `childBlocks_`.
 */
Blockly.Block.prototype.forEachChild = function (helper) {
  this.eyo.forEachChild(helper)
}
