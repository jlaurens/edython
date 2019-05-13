/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview Magnets manager.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Magnet')
goog.provide('eYo.Magnets')

goog.require('eYo.Brick')
goog.require('eYo.Const')
goog.require('eYo.Do')
goog.require('eYo.Where')
goog.require('eYo.T3')


/**
 * Class for a Dlgt.
 * 
 * @param {!eYo.Brick|eYo.Input|eYo.Slot} owner  the immediate source of this magnet. When not a Dlgt, it is directly owned by a Dlgt.
 * @param {!String} type  the type of this magnet
 * @param {!Object} model  the model of this magnet
 * @readonly
 * @property {*} node  the node if any
 * @property {boolean} startOfLine  whether the connection is an input connection starting a line.
 * @property {boolean} startOfStatement  whether the connection is an input connection starting a brick.
 * @readonly
 * @property {string} type  the type of the connection
 * @readonly
 * @property {boolean} targetIsMissing  whether a target is missing
 * @readonly
 * @property {boolean} isSuperior  whether the connection is superior, true if connection faces down or right, false otherwise.
 * @constructor
 */
eYo.Magnet = function (bsi, type, model) {
  this.owner_ = bsi
  this.type = type
  this.model_ = model
  this.hidden_ = model.hidden
  eYo.FieldHelper.makeFields(this, model.fields)
  this.where_ = new eYo.Where()
  this.reentrant_ = {}
  this.targetIsMissing = false
  var DB = this.magnetDBList_
  if (DB) {
    this.db_ = DB[this.type]
    this.dbOpposite_ = DB[this.opposite_type]
    this.hidden_ = !this.db_
  }
}

Object.defineProperties(eYo.Magnet, {
  INPUT: { value: 1 },
  OUTPUT: { value: 2 },
  HEAD: { value: 3 },
  FOOT: { value: 4  },
  LEFT: { value: 5 },
  RIGHT: { value: 6 }
})
eYo.Magnet.OPPOSITE_TYPE = {
  [eYo.Magnet.INPUT]: eYo.Magnet.OUTPUT,
  [eYo.Magnet.OUTPUT]: eYo.Magnet.INPUT,
  [eYo.Magnet.FOOT]: eYo.Magnet.HEAD,
  [eYo.Magnet.HEAD]: eYo.Magnet.FOOT,
  [eYo.Magnet.RIGHT]: eYo.Magnet.LEFT,
  [eYo.Magnet.LEFT]: eYo.Magnet.RIGHT
}

// deprecated
Object.defineProperty(Blockly, 'OPPOSITE', {
  get () {
    throw "FORBIDDEN"
  }
})

/**
 * Constants for checking whether two connections are compatible.
 */
Object.defineProperties(eYo.Magnet, {
  CAN_CONNECT: { value: 0},
  REASON_SELF_CONNECTION: { value: 1},
  REASON_WRONG_TYPE: { value: 2},
  REASON_TARGET_NULL: { value: 3},
  REASON_CHECKS_FAILED: { value: 4},
  REASON_DIFFERENT_WORKSPACES: { value: 5}
})

/**
 * Dispose of the ressources.
 */
eYo.Magnet.prototype.dispose = function () {
  eYo.FieldHelper.disposeFields(this)
  this.slot = this.where_ = this.model_ = undefined
  if (this.target) {
    throw 'Disconnect connection before disposing of it.';
  }
  if (this.inDB_) {
    this.db_.removeConnection_(this);
  }
  this.db_ = null;
  this.dbOpposite_ = null;
}

// private properties
Object.defineProperties(eYo.Magnet.prototype, {
  owner_: { value: undefined },
  brick_: { value: undefined },
  slot_: { value: undefined },
  input_: { value: undefined },
  model_: { value: undefined },
  hidden_: { value: undefined },
  wrapped_: { value: undefined },
  promised_: { value: undefined },
  check_: {value: undefined },
  name_: { value: undefined },
  visible_: { value: undefined },
})

// computed private properties
Object.defineProperties(eYo.Magnet.prototype, {
  optional_: {
    get () {
      return this.model__.optional
    }
  },
})

Object.defineProperties(eYo.Magnet.prototype, {
  wrapped: {
    get () {
      return this.wrapped_
    },
    set (newValue) {
      if (this.target) {
        throw "ALREADY A WRAPPED BLOCK"
      }
      this.wrapped_ = newValue
      this.promised_ = null
      newValue && this.brick.addWrappedMagnet(this)
    }
  },
  promised: {
    get () {
      return this.promised_
    },
    set (newValue) {
      if (this.target) {
        throw "ALREADY A WRAPPED BLOCK"
      }
      this.promised_ = newValue
      this.wrapped_ && this.brick.removeWrappedMagnet(this)
      this.wrapped_ = null
    }
  },
  owner: {
    set (newValue) {
      this.owner_ = newValue
      if (owner_ instanceof eYo.Input) {
        this.input_ = owner_
        this.slot_ = null
        this.brick_ = owner_.brick
      } else if (owner_ instanceof eYo.Slot) {
        this.input_ = null
        this.slot_ = owner_
        this.brick_ = owner_.brick
      } else {
        this.input_ = this.slot_ = null
        this.brick_ = owner_
      }
    }
  },
  /**
   * @readonly
   * @property {eYo.Brick} brick  each magnet belongs to a brick
   */
  brick: {
    get () {
      return this.brick_
    }
  },
  /**
   * @readonly
   * @property {eYo.Input} input  The eventual input containing the magnet
   */
  input: {
    get () {
      return this.input_
    }
  },
  /**
   * @readonly
   * @property {eYo.Slot} slot  The eventual slot containing the magnet
   */
  slot: {
    get () {
      return this.slot_
    }
  },
  model: {
    get () {
      return this.model_
    }
  },
  where: {
    get () {
      return this.where_
    }
  },
  workspace: {
    get () {
      return this.brick.workspace
    }
  },
  magnetDB_: {
    get () {
      return this.workspace.connectionDBList
    }
  },
  type: {
    get () {
      return this.type_
    }
  },
  opposite_type: {
    get () {
      return eYo.Magnet.OPPOSITE_TYPE[this.type_]
    }
  },
  visible: {
    get () {
      return this.visible_
    },
    set (newValue) {
      if (this.visible_ !== newValue) {
        newValue ? this.unhideAll() : this.hideAll()
        var targetBrick = this.targetBrick
        targetBrick && (targetBrick.ui.visible = newValue)
      }
    }
  },
  typeName: {
    get () {
      return {
        [eYo.Magnet.INPUT]: 'input',
        [eYo.Magnet.OUTPUT]: 'output',
        [eYo.Magnet.HEAD]: 'high',
        [eYo.Magnet.FOOT]: 'low',
        [eYo.Magnet.LEFT]: 'left',
        [eYo.Magnet.RIGHT]: 'right'
      } [this.type]
    }
  },
  isSuperior: {
    get () { // the source 'owns' the target
      return this.type === eYo.Magnet.INPUT ||
       this.type === eYo.Magnet.FOOT ||
       this.type === eYo.Magnet.RIGHT
    }
  },
  hidden_: {
    get () {
      return this.hidden__
    },
    set(hidden) {
      if (!hidden && this.incog_) {
        // Incog magnets must stay hidden
        return
      }
      this.hidden__ = hidden
      if (hidden && this.inDB_) {
        this.db_.removeConnection_(this)
      } else if (!hidden && !this.inDB_) {
        this.db_.addConnection(this)
      }
    }
  },
  c: { // in text units
    get () {
      return this.slot ? this.where.c + this.slot.where.c : this.where.c
    }
  },
  l: { // in text units
    get () {
      return this.slot ? this.where.l + this.slot.where.l : this.where.l
    }
  },
  x_: {
    get () {
      throw "FORBIDDEN, BREAK HERE"
    }
  },
  y_: {
    get () {
      throw "FORBIDDEN, BREAK HERE"
    }
  },
  x: { // in workspace coordinates
    get () {
      return this.slot ? this.where.x + this.slot.where.x : this.where.x
    }
  },
  y: { // in workspace coordinates
    get () {
      return this.slot ? this.where.y + this.slot.where.y : this.where.y
    }
  },
  w: {
    get () {
      return this.bindField
        ? this.bindField.eyo.size.w + 1
        : this.optional_ || this.s7r_
          ? 1
          : 3
    }
  },
  ui: {
    get () {
      return this.brick.ui
    }
  },
  target: {
    get () {
      return this.target_
    }
  },
  targetBrick: { // === this.target.brick
    get () {
      var t = this.target
      return t && t.brick
    },
    set (newValue) {
      if (newValue !== this.targetBrick && newValue !== this.brick) {
        this.disconnect()
      }
      if (newValue) {
        this.connectSmart(newValue)
      }
    }
  },
  ui: {
    get () {
      return this.brick.ui
    }
  },
  unwrappedMagnet: {
    get () {
      // scheme:
      // this = output <- input <- wrapped source brick <- output <- input
      var ans = this
      var targetBrick
      while ((targetBrick = ans.targetBrick) && targetBrick.wrapped_) {
        var m4t = targetBrick.magnets.output
        if (m4t) {
          ans = m4t
        } else {
          break
        }
      }
      return ans
    }
  },
  parent: {
    get () {
      throw "FORBIDDEN"
    }
  },
  bindField: {
    get () {
      if (this.slot) {
        return this.slot.bindField
      }
      // in a void wrapped list
      var brick = this.brick
      var input = brick.inputList[0]
      if (input && (input.magnet === this)) {
        var m4t = brick.magnets.output
        if (m4t && (m4t = m4t.target)) {
          return m4t.bindField
        }
      }
    },
  },
  check: {
    get () {
      return this.check_
    },
    set (check) {
      if (check) {
        // Ensure that check is in an array.
        if (!goog.isArray(check)) {
          check = [check];
        }
        this.check_ = check;
      } else {
        this.check_ = null;
      }
      var brick = this.brick
      var targetBrick = this.targetBrick
      if (targetBrick && !this.checkType_(this.target)) {
        (this.isSuperior ? targetBrick : brick).unplug()
        // Bump away.
        brick.bumpNeighbours_()
      }
      brick.incrementChangeCount()
      targetBrick && targetBrick.incrementChangeCount() // there was once a `consolidate(false, true)` here.
    }
  },
  /**
   * Is it an output connection.
   * @return {boolean} True if the connection is the brick's output one.
   */
  isOutput: {
    get () {
      return this.connection.type === eYo.Magnet.OUTPUT
    }
  },
  /**
   * Is it a top connector.
   * @return {boolean} True if the connection is the brick's previous one.
   */
  isHead: {
    get () {
      return this.connection.type === eYo.Magnet.HEAD
    }
  },
  /**
   * Is it a low connection.
   * @return {boolean} True if the connection is the brick's next one.
   */
  isFoot: {
    get () {
      return this.connection.type === eYo.Magnet.FOOT
    }
  },
  /**
   * Is it a suite connection.
   * @return {boolean} True if the connection is the brick's suite one.
   */
  isSuite: {
    get () {
      return this === this.brick.magnets.suite
    }
  },
  /**
   * Is it a left connection.
   * @return {boolean} True if the connection is the brick's left one.
   */
  isLeft: {
    get () {
      return this.connection.type === eYo.Magnet.LEFT
    }
  },
  /**
   * Is it a right connection.
   * @return {boolean} True if the connection is the brick's right one.
   */
  isRight: {
    get () {
      return this.connection.type === eYo.Magnet.RIGHT
    }
  },
  /**
   * Is it an input connection.
   * @return {boolean} True if the connection is one of the brick's input connections.
   */
  isInput: {
    get () {
      return this.connection.type === eYo.Magnet.INPUT
    }
  },
  /**
   * Returns an unwrapped target brick
   */
  unwrappedTarget: {
    get () {
      var t = this.targetBrick
      var f = t => {
        return t && (!t.wrapped_ || t.inputList.some(i => {
          var m4t = i.eyo.magnet
          if (f(t = m4t && m4t.targetBrick)) {
            return true
          }
        }))
      }
      return f(t) && t
    }
  },
  /**
   * Return the black target.
   * Traverses the white blocks
   * @return {?eYo.Magnet}
   * @private
   */
  blackTarget: {
    get () {
      var t4t = this.target
      if (!t4t) {
        return undefined
      }
      var brick = t4t.brick
      if (!brick.isWhite) {
        return t4t
      }
      if (t4t.isHead) {
        var F = x => x.magnets.foot
      } else if (t4t.isFoot) {
        F = x => x.magnets.head
      } else {
        return undefined
      }
      do {
        if (!(t4t = F(brick)) || !(t4t = t4t.target) || !(brick = t4t.brick)) {
          return undefined
        }
        if (!brick.isWhite) {
          return t4t
        }
      } while (true)
    }
  },
  /**
   * Return the black connection.
   * Traverses the white blocks.
   * If the source brick is black, returns the connection.
   * If the source brick is white, check for the target brick's other connection,
   * and so on.
   * If the connection is named, returns the connection, whatever its source brick
   * status may be.
   * @param F optional function defaults to !argument.isWhite
   * @return a connection, possibly undefined
   */
  blackMagnet: {
    get () {
      var eyo = this.brick
      if (!eyo.isWhite) {
        return this
      }
      if (this.isHead) {
        var other = eyo => eyo.magnets.foot
      } else if (this.isFoot) {
        other = eyo => eyo.magnets.head
      } else {
        // this is a 'do' statement input connection
        // whether the surrounding brick is disabled or not has no importance
        return this
      }
      var magnet
      while ((magnet = other(eyo)) && (magnet = magnet.target) && !magnet.name_ && (!(eyo = magnet.brick) || eyo.isWhite)) {}
      return magnet
    }
  }
})

/**
 * Whether the connection is a separator.
 * Used in lists.
 */
eYo.Magnet.prototype.s7r_ = false

/**
 * name of the connection.
 * See identifier
 */
eYo.Magnet.prototype.name_ = undefined// must change to wrapper

/**
 * execute the given function for the fields.
 * For edython.
 * @param {!function} helper
 */
eYo.Magnet.prototype.forEachField = function (helper) {
  this.fields && Object.values(this.fields).forEach(f => helper(f))
}

/**
 * `beReady` the target brick.
 */
eYo.Magnet.prototype.beReady = function () {
  this.beReady = eYo.Do.nothing // one shot function
  var targetBrick = this.targetBrick
  targetBrick && targetBrick.beReady()
  this.forEachField(f => f.eyo.beReady())
}

/**
 * `consolidate` the target brick.
 */
eYo.Magnet.prototype.consolidate = function (deep, force) {
  var targetBrick = this.targetBrick
  targetBrick && targetBrick.consolidate(deep, force)
}

Object.defineProperty(eYo.Magnet.prototype, 'incog', {
  /**
   * Get the incognito state.
   */
  get () {
    return this.incog_
  },
  /**
   * Set the incognito state.
   * Hide/show the connection from/to the database and disable/enable the target's connections.
   * @param {boolean} incog
   * @return {boolean} whether changes have been made
   */
  set (newValue) {
    if (this.incog_ && newValue) {
      // things were unlikely to change since
      // the last time the connections have been disabled
      return
    }
    newValue = !!newValue
    var change = this.incog_ !== newValue
    if (change) {
      this.brick.incrementChangeCount()
    }
    if (!newValue && this.promised_) {
      this.completePromise()
    }
    if (newValue || !this.wrapped_) {
      // We cannot disable wrapped connections
      this.incog_ = this.hidden_ = newValue
    }
    var targetBrick = this.targetBrick
    if (targetBrick) {
      targetBrick.incog = newValue
    }  
  }
})

/**
 * Complete with a wrapped brick.
 * Reentrant method.
 * @param {String} prototypeName
 * @return {Object} Object with an `ans` property.
 */
eYo.Magnet.prototype.completeWrap = eYo.Decorate.reentrant_method(
  'completeWrap',
  function () {
    if (!this.wrapped_) {
      return
    }
    var targetBrick = this.targetBrick
    if (!targetBrick) {
      var ans
      eYo.Events.disableWrap(
        () => {
          var brick = this.brick
          targetBrick = eYo.Brick.newComplete(brick, this.wrapped_, brick.id + '.wrapped:' + this.name_)
          goog.asserts.assert(targetBrick, 'completeWrap failed: ' + this.wrapped_)
          goog.asserts.assert(targetBrick.magnets.output, 'Did you declare an Expr brick typed ' + targetBrick.type)
          ans = this.connect(targetBrick.magnets.output)
        }
      )
      return ans // true when connected
    }
  }
)

/**
 * Complete with a promised brick.
 */
eYo.Magnet.prototype.completePromise = function () {
  if (this.promised_) {
    // console.error('PROMISE CLOSED')
    this.wrapped_ = this.promised_
    var ans = this.completeWrap()
    return ans && ans.ans
  }
}

/**
 * Break the connection by unplugging a source brick.
 */
eYo.Magnet.prototype.break = function () {
  var eyo = this.isSuperior ? this.targetBrick : this.brick
  eyo && eyo.unplug()
}

/**
 * Will connect.
 * Forwards to the model.
 * @param {eYo.Magnet} m4t the connection owning the delegate
 * @param {eYo.Magnet} targetM4t
 */
eYo.Magnet.prototype.willConnect = function (targetM4t) {
  this.model && goog.isFunction(this.model.willConnect) && this.model.willConnect.call(this, targetM4t)
}

/**
 * Did connect.
 * Increment the brick step.
 * @param {eYo.Magnet} oldTargetM4t
 *     what was previously connected to the receiver
 * @param {eYo.Magnet} targetOldM4t
 *     what was previously connected to the actual receiver's target
 */
eYo.Magnet.prototype.didConnect = function (oldTargetM4t, targetOldM4t) {
  this.targetIsMissing = false
  // No need to increment step for the old connections because
  // if any, they were already disconnected and
  // the step has already been incremented then.
  var f = this.model.didConnect
  if (goog.isFunction(f)) {
    eYo.Decorate.reentrant_method('didConnect',f).apply(this, arguments)
    return
  }
  if (this.isRight) {
    this.fields.label.setVisible(this.brick.isGroup || !this.targetBrick.isComment)
  }
}

/**
 * Will disconnect.
 * Default implementation forwards to the model.
 * The model should call back.
 * This can be overriden at brick creation time.
 */
eYo.Magnet.prototype.willDisconnect = function () {
  var f = this.model.willDisconnect
  if (goog.isFunction(f)) {
    eYo.Decorate.reentrant_method('willDisconnect',f).apply(this, arguments)
    return
  }
  if (this.isRight) {
    this.fields.label.setVisible(this.brick.isGroup)
  }
}

/**
 * Did disconnect.
 * Increment the brick step.
 * @param {eYo.Magnet} oldTargetM4t
 *     what was previously connected to the receiver
 * @param {eYo.Magnet} targetOldM4t
 *     what was previously connected to the old receiver's target
 */
eYo.Magnet.prototype.didDisconnect = function (oldTargetM4t, targetOldM4t) {
  // No need to increment step for the old connections because
  // if any, they were already disconnected and
  // the step has already been incremented then.
  if (!this.reentrant_.didDisconnect) {
    var f = this.model && this.model.didDisconnect
    if (goog.isFunction(f)) {
      this.reentrant_.didDisconnect = true
      f.call(this, oldTargetM4t, targetOldM4t)
      this.reentrant_.didDisconnect = false
      return
    }
  }
}

/**
 * Set the receiver's connection's check_ array according to the given type.
 * The defaults implements asks the model then sets the check_ property.
 * Called by `consolidateMagnets`.
 */
eYo.Magnet.prototype.updateCheck = function () {
  var b = this.brick
  if(b.change.level > 1 || this.changeCount_ === b.change.count) {
    return
  }
  this.changeCount_ = b.change.count
  if (this.model.check) {
    this.check = this.model.check.call(this, b.type, b.subtype)
  }
}

/**
 * Get the magnet of the same kind on the brick above.
 * If the magnet is named (Why should it be?), returns the connection,
 * whatever its source brick status may be.
 * @return a connection, possibly undefined
 */
eYo.Magnet.prototype.getMagnetAbove = function () {
  var ans = this.brick.head
  if (ans) {
    var m4ts = ans.magnets
    if (this.isFoot) {
      return m4ts.foot
    } else if (this.isHead) {
      return m4ts.head
    } else if (this.isRight) {
      return m4ts.right
    } else if (this.isLeft) {
      return m4ts.left
    }
  }
}

/**
 * Get the connection of the same kind on the brick below.
 * @return a magnet, possibly undefined
 */
eYo.Magnet.prototype.getMagnetBelow = function () {
  var ans = this.brick.foot
  if (ans) {
    var m4ts = ans.magnets
    if (this.isFoot) {
      return m4ts.foot
    } else if (this.isHead) {
      return m4ts.head
    } else if (this.isRight) {
      return m4ts.right
    } else if (this.isLeft) {
      return m4ts.left
    }
  }
}

/**
 * Establish a connection with a brick.
 *
 * @param {!eYo.Brick} eyo
 */
eYo.Magnet.prototype.connectSmart = (() => {

  /**
   * Establish a connection with a brick.
   * @param {!eYo.Brick} eyo
   * @return {!eYo.Magnet}
   */
  var connectToTop = function (eyo) {
    var m = eyo.magnets.head
    this.connect(m.connection)
    return eyo.footMost.magnets.head
  }

  /**
   * Establish a connection with a brick.
   * @param {!eYo.Brick} eyo
   * @return {!eYo.Magnet}
   */
  var connectToLeft = function (eyo) {
    var m = eyo.magnets.left
    this.connect(m.connection)
    return eyo.rightMost.magnets.head
  }

  /**
   * Establish a connection with a brick.
   * @param {!eYo.Magnet} c8n
   */
  var connectToRight = function (eyo) {
    var m = eyo.magnets.right
    this.connect(m.connection)
    return eyo.leftMost.magnets.head
  }

  /**
   * Establish a connection with a brick.
   * @param {!eYo.Brick} eyo
   * @return {!eYo.Magnet}
   */
  var connectToBottom = function (eyo) {
    var m = eyo.magnets.foot
    this.connect(m.connection)
    return eyo.headMost.magnets.head
  }

  /**
   * Establish a connection with a brick.
   * @param {!eYo.Brick} eyo
   * @return {!eYo.Magnet}
   */
  var connectToOutput = function (eyo) {
    var m = eyo.magnets.output
    this.connect(m.connection)
    return undefined
  }

  return function (b) {
    if (this.isFoot || this.isSuite) {
      this.connectSmart = connectToTop
      return this.connectSmart(b)
    }
    if (this.isHead) {
      this.connectSmart = connectToBottom
      return this.connectSmart(b)
    }
    if (this.isLeft) {
      this.connectSmart = connectToRight
      return this.connectSmart(b)
    }
    if (this.isRight) {
      this.connectSmart = connectToLeft
      return this.connectSmart(b)
    }
    if (this.isInput) {
      this.connectSmart = connectToOutput
      return this.connectSmart(b)
    }
  }
}) ()

/**
 * Set the origin of the connection.
 * When the connection is in a slot, the origin is the top left point
 * of the slot otherwise it is `(0, 0)`.
 * @param {number} c The column index.
 * @param {number} l The line index.
 */
eYo.Magnet.prototype.setOffset = function(c = 0, l = 0) {
  if (goog.isDef(c.c) && goog.isDef(c.l)) {
    l = c.l
    c = c.c
  }
  this.where.set(c, l)
  if (isNaN(this.x)) {
    this.where.set(c, l)
    console.error(this.x)
  }
}

/**
 * The type checking mechanism is fine grained compared to blockly's.
 * The check_ is used more precisely.
 * For example, elif blocks cannot connect to the suite connection, only the next connection.
 * @param {!eYo.Magnet} other Magnet to compare against.
 * @param {?Boolean} force  checks even if a connection is hidden or incog.
 * @return {boolean} True if the connections share a type.
 * @private
 * @suppress {accessControls}
 */
eYo.Magnet.prototype.checkType_ = function (other, force) {
  if (!eYo.Events.recordUndo) {
    // we are undoing or redoing
    // we will most certainly reach a state that was valid
    // some time ago
    return true
  }
  if (this.check_ && !this.check_.length) {
    return false
  }
  if (other.check_ && !other.check_.length) {
    return false
  }
  var m4tA = this.blackMagnet
  var m4tB = other.blackMagnet
  if (!m4tA || !m4tB) {
    return true
  }
  var dlgtA = m4tA.brick
  var dlgtB = m4tB.brick
  // short stop if one of the connection is hidden or disabled
  // except when we try to establish a connection with a wrapped brick.
  // in either case, returns true iff the connetion is aready established
  if (m4tA.wrapped_) {
    if (m4tA.target) {
      return m4tB === m4tA.target
    }
  } else if (m4tB.wrapped_) {
    if (m4tB.target) {
      return m4tA === m4tB.target
    }
  } else if (!force && dlgtA.isready && dlgtB.isready && (m4tA.incog_ || m4tB.incog_ || m4tA.hidden_ || m4tB.hidden_)) { // the `force` argument may be useless now that there is a readiness test.
    return m4tA === m4tB.target
  }
  var typeA = dlgtA.type // the brick type is not up to date
  var typeB = dlgtB.type // the brick type is not up to date
  var checkA = m4tA.check_
  var checkB = m4tB.check_
  if (m4tA.isInput) {
    if (dlgtA.locked_) {
      return m4tA.target === m4tB
    }
    if (checkA) {
      if (checkB) {
        if (checkA.some(t => checkB.indexOf(t) >= 0)) {
          return true
        }
      } else {
        return checkA.indexOf(typeB) >= 0
      }
    }
    return true
  }
  if (m4tB.isInput) {
    if (dlgtB.locked_) {
      return m4tA === m4tB.target
    }
    if (checkB) {
      if (checkA) {
        if (checkB.some(t => checkA.indexOf(t) >= 0)) {
          return true
        }
      } else if (checkB.indexOf(typeA) < 0) {
        return false
      } else {
        return true
      }
    }
    return true
  }
  if (checkA && checkA.indexOf(typeB) < 0) {
    return false
  }
  if (checkB && checkB.indexOf(typeA) < 0) {
    return false
  }
  return true
}

/**
 * This method returns a string describing this Magnet in developer terms
 * (English only). Intended to on be used in console logs and errors.
 * @return {string} The description.
 */
eYo.Magnet.prototype.toString = function() {
  var msg
  var eyo = this.brick
  if (!eyo) {
    return 'Orphan Magnet'
  } else if (this.isOutput) {
    msg = 'Output Magnet of '
  } else if (this.isHead) {
    msg = 'Top Magnet of '
  } else if (this.isFoot) {
    msg = 'Bottom Magnet of '
  } else if (this.isSuite) {
    msg = 'Suite Magnet of '
  } else if (this.isLeft) {
    msg = 'Left statement Magnet of '
  } else if (this.isRight) {
    msg = 'Right statement Magnet of '
  } else {
    var parentInput = this.input || this.slot
    if (parentInput) {
      msg = 'Input "' + parentInput.name + '" connection on '
    } else {
      console.warn('Magnet not actually connected to source')
      return 'Orphan Magnet'
    }
  }
  return msg + eyo.toDevString()
}

/**
 *
 * @param {!Object} eyo  eyo is the owner
 */
eYo.Magnets = function (eyo) {
  // configure the connections
  var model = eyo.model
  var D
  if ((D = model.output) && Object.keys(D).length) {
    this.output_ = new eYo.Magnet(eyo, eYo.Magnet.OUTPUT, D)
  } else if ((D = model.statement) && Object.keys(D).length) {
    if (D.head && goog.isDefAndNotNull(D.head.check)) {
      this.high_ = new eYo.Magnet(eyo, eYo.Magnet.HEAD, D.head)
    }
    if (D.foot && goog.isDefAndNotNull(D.foot.check)) {
      this.foot_ = new eYo.Magnet(eyo, eYo.Magnet.FOOT, D.foot)
    }
    if (D.suite && goog.isDefAndNotNull(D.suite.check)) {
      this.suite_ = new eYo.Magnet(eyo, eYo.Magnet.FOOT, D.suite)
    }
    if (D.left && goog.isDefAndNotNull(D.left.check)) {
      this.left_ = new eYo.Magnet(eyo, eYo.Magnet.LEFT, D.left)
    }
    if (D.right && goog.isDefAndNotNull(D.right.check)) {
      this.right_ = new eYo.Magnet(eyo, eYo.Magnet.RIGHT, D.right)
    }
  }
}

Object.defineProperties(eYo.Magnets.prototype, {
  output: {
    get () {
      return this.output_
    }
  },
  head: {
    get () {
      return this.high_
    }
  },
  left: {
    get () {
      return this.left_
    }
  },
  right: {
    get () {
      return this.right_
    }
  },
  suite: {
    get () {
      return this.suite_
    }
  },
  foot: {
    get () {
      return this.foot_
    }
  }
})

/**
 * Dispose of all the ressources that blockly does not have.
 * This is an intermediate design.
 */
eYo.Magnets.prototype.dispose = function () {
  if (this.left_) {
    this.left_.dispose()
    this.left_ = undefined
    this.right_.dispose()
    this.right_ = undefined
    this.suite_ && this.suite_.dispose()
    this.suite_ = undefined
  }
  this.high_ && this.high_.dispose()
  this.high_ = undefined
  this.foot_ && this.foot_.dispose()
  this.foot_ = undefined
  this.output_ && this.suite_.dispose()
  this.output_ = undefined
}

/**
 * Connect two magnets together.  `This` is the magnet on the superior
 * brick.
 * Add hooks to allow customization.
 * This is a critical piece of code.
 * There are 3 different kinds of problems:
 * 1) the orphan management
 * 2) the check management
 * 3) the undo management
 * All this must fit together well.
 * Undo management must occur at a higher level.
 * Then orphan management at a middle level
 * Finally the check management once the state is modified.
 * We assume that breaking one connection does not cascade into another
 * connection break.
 * @param {!eYo.Magnets.prototype} childM4t  A magnet on an inferior brick.
 * @private
 * @suppress {accessControls}
 */
eYo.Magnet.prototype.connect_ = function (childM4t) {
  // `this` is actually the parentM4t
  var parentM4t = this
  var parent = parentM4t.brick
  var child = childM4t.brick
  var orphan = parentM4t.targetBrick
  var orphanM4t = parentM4t.target
  var oldParentM4t = childM4t.target
  var oldChildM4t = parentM4t.target
  var unwrappedM4t = parentM4t.unwrappedMagnet
  var m4t
  var child_event

  /*
   * Find the first free magnet in the given brick
   * that positively checks type with the given potential target magnet.
   * @param {!eYo.Brick} brick The brick.
   * @param {!eYo.Magnet} child The inferior brick.
   * @private
   * @suppress {accessControls}
   */
  var freeMagnet = (brick, magnet) => {
    return brick.someSlot(slot => {
      var ans = slot.magnet
      if (ans) {
        if (brick = ans.targetBrick) {
          return freeMagnet(brick, magnet)
        } else if (ans.checkType_(magnet)) {
          return ans
        }
      }
    })
  }
  var attach_orphan = () => {
    if (orphanM4t) {
      // Other connection is already connected to something.
      // Disconnect it and reattach it or bump it as needed.
      if (orphanM4t.isOutput) {
        // Attempt to reattach the orphan at the end of the newly inserted
        // brick.  Since this brick may be a row, walk down to the end
        // or to the first (and only) shadow brick.
        if ((m4t = freeMagnet(child, orphanM4t))) {
          orphanM4t.connect(m4t)
          orphan = orphanM4t = null
        }
      } else if (orphanM4t.isHead) {
        var dlgt = child.footMost
        if ((m4t = dlgt.magnets.foot) && orphanM4t.checkType_(m4t)) {
          m4t.connect(orphanM4t)
          orphan = orphanM4t = null
        }
      } else if (orphanM4t.isLeft) {
        var dlgt = child.rightMost
        if ((m4t = dlgt.magnets.right) && orphanM4t.checkType_(m4t)) {
          m4t.connect(orphanM4t)
          orphan = otherM4t = null
        }
      }
    }
  }
  var attach_orphan_end = () => {
    orphanM4t && orphanM4t.bumpAwayFrom_(parentM4t)
  }
  var raw_connect = () => {
    // Establish the connections.
    parentM4t.target_ = childM4t
    childM4t.target_ = parentM4t
    if (Blockly.Events.isEnabled()) {
      child_event = new Blockly.Events.BlockMove(child)
    }
    // Demote the inferior brick so that one is a child of the superior one.
    child.parent = parent
    if (child_event) {
      child_event.recordNew();
      Blockly.Events.fire(child_event);
    }
  }
  var connect3 = () => {
    // Disconnect any existing parent on the child connection.
    childM4t.disconnect()
    attach_orphan()
    raw_connect()
  }

  var connect2 = () => {
    connect3()
  
    if (parent.rendered) {
      parent.updateDisabled()
    }
    if (child.rendered) {
      child.updateDisabled()
    }
    if (parent.rendered && child.rendered) {
      if (parentM4t.isFoot ||
          parentM4t.isHead) {
        // Child brick may need to square off its corners if it is in a stack.
        // Rendering a child will render its parent.
        child.render();
      } else {
        // Child brick does not change shape.  Rendering the parent node will
        // move its connected children into position.
        parent.render();
      }
    }
  }
  if (parent.workspace !== child.workspace) {
    return
  }
  var connect1 = () => {
    connect2()
    if (parentM4t.wrapped_) {
      child.selected && parent.select()
      child.wrapped_ = true
    } else {
      // if this connection was selected, the newly connected brick should be selected too
      if (parentM4t.selected) {
        var P = parent
        do {
          if (P.selected) {
            child.select()
            break
          }
        } while ((P = P.group))
      }
    }
    if (oldChildM4t && childM4t !== oldChildM4t) {
      var oldChild = oldChildM4t.brick
      if (oldChild) {
        if (oldChild.wrapped_) {
          eYo.Events.recordUndo && oldChild.dispose(true)
        } else if (!oldChildM4t.targetBrick) {
          // another chance to reconnect the orphan
          // just in case the check_ has changed in between
          // which might be the case for the else_part blocks
          if (oldChildM4t.isOutput) {
            (child instanceof eYo.Brick.List
              ? child.someInput
              : child.someSlot)(x => { // a slot or an input
              if (!x.incog) {
                var m4t, targetBrick
                if ((m4t = x.magnet || x.eyo.magnet)) {
                  if (m4t.hidden_ && !m4t.wrapped_) {
                    return
                  }
                  if ((targetBrick = m4t.targetBrick)) {
                    if (plug(targetBrick)) {
                      return true
                    }
                  } else if (m4t.checkType_(oldChildM4t)) {
                    m4t.connect(oldChildM4t)
                    return true
                  }
                }
              }
            })
          } else {
            P = child.footMost
            var m4t
            if ((m4t = P.magnets.foot) && m4t.checkType_(oldChildM4t)) {
              m4t.connect(oldChildM4t)
            }
          }
        }
      }
    }
    childM4t.selected && childM4t.unselect()
    parentM4t.selected && parentM4t.unselect()
    child.incog = parentM4t.incog
  }
  parent.changeWrap(() => { // Disable rendering until changes are made
    child.changeWrap(() => { parent
      parent.beReady(child.isReady)
      child.beReady(parent.isReady)
      parentM4t.willConnect(childM4t)
      (unwrappedM4t !== parentM4t) && unwrappedM4t.willConnect(childM4t)
      eYo.Do.tryFinally(() => {
        childM4t.willConnect(parentM4t)
        eYo.Do.tryFinally(() => {
          parent.willConnect(parentM4t, childM4t)
          eYo.Do.tryFinally(() => {
            child.willConnect(childM4t, parentM4t)
            eYo.Do.tryFinally(connect1, () => { // finally
              parentM4t.startOfStatement && child.incrementChangeCount()
              eYo.Magnet.connectedParent = parentM4t
              // next must absolutely run because of possible undo management
              child.didConnect(childM4t, oldParentM4t, oldChildM4t)
            })
          }, () => { // finally
            // next must absolutely run because of possible undo management
            parent.didConnect(parentM4t, oldChildM4t, oldParentM4t)
          })
        }, () => { // finally
          unwrappedM4t.bindField && unwrappedM4t.bindField.setVisible(false)
          // next must absolutely run because of possible undo management
          parentM4t.didConnect(oldParentM4t, oldChildM4t)
          (unwrappedM4t !== parentM4t) && unwrappedM4t.didConnect(oldParentM4t, oldChildM4t)
        })
      }, () => { // finally
        childM4t.didConnect(oldChildM4t, oldParentM4t)
        eYo.Magnet.connectedParent = undefined
        childM4t.bindField && childM4t.bindField.setVisible(false) // unreachable ?
      })
    })
  })
  
  var ui
  (ui = child.ui) && ui.didConnect(childM4t, oldChildM4t, oldParentM4t)
  (ui = parent.ui) && ui.didConnect(parentM4t, oldParentM4t, oldChildM4t)
  (unwrappedM4t !== parentM4t) && (ui = unwrappedM4t.ui) && ui.didConnect(parentM4t, oldParentM4t, oldChildM4t)
}


/**
 * Disconnect two blocks that are connected by this connection.
 * Add hooks to allow customization.
 * @param {!eYo.Brick} parent The superior brick.
 * @param {!eYo.Brick} child The inferior brick.
 * @private
 * @suppress {accessControls}
 */
eYo.Magnet.prototype.disconnectInternal_ = (() => {
  // Closure
  return function (parent, child) {
    if (this.brick === parent) {
      var parentM4t = this
      var childM4t = this.target
    } else {
      parentM4t = this.target
      childM4t = this
    }
    var unwrappedM4t = parentM4t.unwrappedMagnet
    if (Blockly.Events.isEnabled()) {
      var event = new Blockly.Events.BlockMove(child)
    }
    child.changeWrap(() => { // `this` is catched
      parent.changeWrap(() => { // `this` is catched
        eYo.Do.tryFinally(() => {
          parentM4t.willDisconnect()
          (unwrappedM4t !== parentM4t) && unwrappedM4t.willDisconnect()
          eYo.Do.tryFinally(() => {
            childM4t.willDisconnect()
            eYo.Do.tryFinally(() => {
              parent.willDisconnect(parentM4t)
              eYo.Do.tryFinally(() => {
                child.willDisconnect(childM4t)
                eYo.Do.tryFinally(() => {
                  // the work starts here
                  if (parentM4t.wrapped_) {
                    // currently unwrapping a brick,
                    // this occurs while removing the parent
                    // if the parent was selected, select the child
                    child.wrapped_ = false
                    parent.selected && child.select()
                  }
                  // Now do the job
                  parentM4t.target_ = null
                  childM4t.target_ = null
                  child.parent = null
                }, () => { // finally
                  // next is not strong enough to save rendering
                  // eYo.Magnet.disconnectedParent = parentM4t
                  // eYo.Magnet.disconnectedChild = childM4t
                  // eYo.Magnet.disconnectedParent = undefined
                  // eYo.Magnet.disconnectedChild = undefined
                  parent.incrementInputChangeCount && parent.incrementInputChangeCount() // list are special
                  parentM4t.bindField && parentM4t.bindField.setVisible(true) // no wrapped test
                  childM4t.bindField && childM4t.bindField.setVisible(true) // unreachable ?
                })
              }, () => { // finally
                child.didDisconnect(childM4t, parentM4t)
              })
            }, () => { // finally
              parent.didDisconnect(parentM4t, childM4t)
            })
          }, () => { // finally
            childM4t.didDisconnect(parentM4t)
          })
        }, () => { // finally
          parentM4t.didDisconnect(childM4t)
          (unwrappedM4t !== parentM4t) && unwrappedM4t.didDisconnect(childM4t)
        })
      })
    })
    child.incrementChangeCount()
    child.consolidate()
    parent.incrementChangeCount()
    parent.consolidate()
    var ui
    (ui = child.ui) && ui.didDisconnect(parentM4t)
    (ui = parent.ui) && ui.didDisconnect(childM4t)
    (unwrappedM4t !== parentM4t) && (ui = unwrappedM4t.ui) && ui.didDisconnect(childM4t)
    // Rerender the parent so that it may reflow.
    // this will be done later
    if (event) {
      event.recordNew();
      Blockly.Events.fire(event);
    }
    if (parent.rendered) {
      parent.render()
    }
    if (child.rendered) {
      child.updateDisabled()
      child.render()
    }
  }
}) ()

/**
 * Tighten_ the magnet and its target.
 */
eYo.Magnet.prototype.tighten_ = function() {
  var m4t = this.target
  if (this.target) {
    var dx = m4t.x_ - this.x_
    var dy = m4t.y_ - this.y_
    if (dx != 0 || dy != 0) {
      var targetBrick = this.targetBrick
      targetBrick.ui.setOffset(-dx, -dy)
    }
  }
}

/**
 * Scrolls the receiver to the top left part of the workspace.
 * Does nothing if the dlgt is already in the visible are,
 * and is not forced.
 * @param {!Boolean} force  flag
 */
eYo.Magnet.prototype.scrollToVisible = function (force) {
  this.brick.scrollToVisible(force)
}

/**
 * Move the brick(s) belonging to the connection to a point where they don't
 * visually interfere with the specified connection.
 * @param {!eYo.Magnet} m4t The connection to move away
 *     from.
 * @private
 * @suppress {accessControls}
 */
eYo.Magnet.prototype.bumpAwayFrom_ = function (m4t) {
  var brick = this.brick
  if (!brick.workspace || brick.workspace.isDragging()) {
    return
  }
  // Move the root brick.
  var root = brick.root
  if (root.isInFlyout) {
    // Don't move blocks around in a flyout.
    return
  }
  if (!root.workspace) {
    return
  }
  var reverse = false
  if (!root.isMovable()) {
    // Can't bump an uneditable brick away.
    // Check to see if the other brick is movable.
    root = m4t.brick.root
    if (!root.workspace || !root.isMovable()) {
      return
    }
    // Swap the connections and move the 'static' connection instead.
    m4t = this
    reverse = true
  }
  // Raise it to the top for extra visibility.
  var selected = root.selected
  selected || root.ui.addDlgtSelect_()
  var dx = (m4t.x_ + Blockly.SNAP_RADIUS) - this.x_
  var dy = (m4t.y_ + Blockly.SNAP_RADIUS) - this.y_
  if (reverse) {
    // When reversing a bump due to an uneditable brick, bump up.
    dy = -dy
  }
  // Added by JL, I don't remember exactly why...
  if (m4t.target) {
    dx += m4t.targetBrick.width
  }
  root.moveByXY(dx, dy)
  selected || root.ui.brickRemoveSelect_()
}

/**
 * Hide this connection, as well as all down-stream connections on any brick
 * attached to this connection.  This happens when a brick is collapsed.
 * Also hides down-stream comments.
 */
eYo.Magnet.prototype.hideAll = function() {
  this.hidden_ = true
  var targetBrick = this.targetBrick
  if (targetBrick) {
    targetBrick.descendants.forEach(dlgt => {
      dlgt.getMagnets_(true).forEach(m4t => m4t.hidden_ = true)
    })
  }
}

/**
 * Find all nearby compatible magnets to the receiver.
 * Type checking does not apply, since this function is used for bumping.
 * @param {number} maxLimit The maximum radius to another connection, in
 *     workspace units.
 * @return {!Array.<!eYo.Magnet>} List of magnets.
 * @private
 */
eYo.Magnet.prototype.neighbours_ = function(maxLimit) {
  return this.dbOpposite_.getNeighbours(this, maxLimit);
};

/**
 * Unhide the receiver, as well as all down-stream magnets on any brick
 * attached to it.  This happens when a brick is expanded.
 */
eYo.Magnet.prototype.unhideAll = function() {
  this.hidden_ = false
  if (this.isSuperior) {
    var targetBrick = this.targetBrick
    targetBrick && (targetBrick.collapsed
        ? Object.values(targetBrick.magnets)
        : targetBrick.getMagnets_(true)).forEach(m4t => m4t.unhideAll())
  }
}

/**
 * Find the closest compatible connection to this connection.
 * All parameters are in workspace units.
 * @param {goog.math.Coordinate} maxLimit The maximum radius to another connection.
 * @param {goog.math.Coordinate} dx Horizontal offset between this connection's location
 *     in the database and the current location (as a result of dragging).
 * @param {goog.math.Coordinate} dy Vertical offset between this connection's location
 *     in the database and the current location (as a result of dragging).
 * @return {!{connection: ?eYo.Magnet, radius: number}} Contains two
 *     properties: 'connection' which is either another connection or null,
 *     and 'radius' which is the distance.
 * @suppress{accessControls}
 */
eYo.Magnet.prototype.closest = function (maxLimit, dxy, dy) {
  if (this.hidden_) {
    return {}
  }
  return this.dbOpposite_.searchForClosest(this, maxLimit, dxy)
}


/**
 * Move this connection to the location given by its offset within the brick and
 * the location of the brick's top left corner.
 * @param {!goog.math.Coordinate} blockTL The location of the top left corner
 *     of the brick, in workspace coordinates.
 */
eYo.Magnet.prototype.moveToOffset = function(blockTL) {
  this.moveTo(blockTL.x + this.where.x,
      blockTL.y + this.where.y);
}

/**
 * Change the connection's coordinates.
 * @param {number} x New absolute x coordinate, in workspace coordinates.
 * @param {number} y New absolute y coordinate, in workspace coordinates.
 */
eYo.Magnet.prototype.moveTo = function(x, y) {
  if (this.x_ !== x || this.y_ !== y || (!x && !y)) {
    // Remove it from its old location in the database (if already present)
    if (this.inDB_) {
      this.db_.removeConnection_(this)
    }
    this.where.x = x;
    this.where.y = y;
    // Insert it into its new location in the database.
    this.hidden_ || this.db_.addConnection(this)
  }
}

/**
 * Returns the distance between this magnet and another magnet in
 * workspace units.
 * The computation takes into account the width of statement blocks.
 * @param {!eYo.Magnet} other The other connection to measure
 *     the distance to.
 * @return {number} The distance between connections, in workspace units.
 */
eYo.Magnet.prototype.distanceFrom = function(other) {
  var dx = this.where.x_ - other.where.x_
  var dy = this.where.y_ - other.where.y_
  if (this.isInput) {
    dy += eYo.Padding.h
  } else if (other.isInput) {
    dy -= eYo.Padding.h
  }
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * Disconnect this connection.
 */
eYo.Magnet.prototype.disconnect = function() {
  var other = this.target
  goog.asserts.assert(other, 'Source connection not connected.');
  goog.asserts.assert(other.target === this,
      'Target magnet not connected to source connection.');
  var sup_brick, inf_brick
  if (this.isSuperior) {
    // Superior brick.
    sup_brick = this.brick
    inf_brick = other.brick
  } else {
    // Inferior brick.
    sup_brick = other.brick
    inf_brick = this.brick
  }
  eYo.Events.groupWrap(() => this.disconnectInternal_(sup_brick, inf_brick))
  
}

/**
 * Connect the receiver to another magnet.
 * @param {!eYo.Magnet} other  The magnet to connect to.
 */
eYo.Magnet.prototype.connect = function(other) {
  if (this.target === other) {
    return;
  }
  switch (this.canConnectWithReason_(other)) {
    case eYo.Magnet.CAN_CONNECT:
      break;
    case eYo.Magnet.REASON_SELF_CONNECTION:
      throw 'Attempted to connect a brick to itself.';
    case eYo.Magnet.REASON_DIFFERENT_WORKSPACES:
      // Usually this means one brick has been deleted.
      throw 'Blocks not on same workspace.';
    case eYo.Magnet.REASON_WRONG_TYPE:
      throw 'Attempt to connect incompatible types.';
    case eYo.Magnet.REASON_TARGET_NULL:
      throw 'Target connection is null.';
    case eYo.Magnet.REASON_CHECKS_FAILED:
      var msg = 'Connection checks failed. ';
      msg += this + ' expected '  + this.check_ + ', found ' + target.check_;
      throw msg;
    default:
      throw 'Unknown connection failure: this should never happen!';
  }
  // Determine which brick is superior (higher in the source stack).
  if (this.isSuperior) {
    this.connect_(other);
  } else {
    other.connect_(this);
  }
}


/**
 * Checks whether the current connection can connect with the target
 * connection.
 * @param {eYo.Magnet} target Magnet to check compatibility with.
 * @return {number} eYo.Magnet.CAN_CONNECT if the connection is legal,
 *    an error code otherwise.
 * @private
 */
eYo.Magnet.prototype.canConnectWithReason_ = function(target) {
  if (!target) {
    return eYo.Magnet.REASON_TARGET_NULL
  }
  if (this.isSuperior) {
    var dlgt_A = this.brick
    var dlgt_B = target.brick
  } else {
    var dlgt_B = this.brick
    var dlgt_A = target.brick
  }
  if (dlgt_A && dlgt_A === dlgt_B) {
    return eYo.Magnet.REASON_SELF_CONNECTION
  } else if (target.type !== this.opposite_type) {
    return eYo.Magnet.REASON_WRONG_TYPE
  } else if (dlgt_A && dlgt_B && dlgt_A.workspace !== dlgt_B.workspace) {
    return eYo.Magnet.REASON_DIFFERENT_WORKSPACES
  } else if (!this.checkType_(target)) {
    return eYo.Magnet.REASON_CHECKS_FAILED
  }
  return eYo.Magnet.CAN_CONNECT
}

/**
 * Check if the two connections can be dragged to connect to each other.
 * A sealed connection is never allowed.
 * @param {!eYo.Magnet} candidate A nearby connection to check.
 * @return {boolean} True if the connection is allowed, false otherwise.
 */
eYo.Magnet.prototype.isConnectionAllowed = function (candidate) {
  if (this.wrapped_ || candidate.wrapped_) {
    return false
  }
  if (this.distanceFrom(candidate) > maxRadius) {
    return false;
  }
  // Type checking.
  if (this.canConnectWithReason_(candidate) !== eYo.Magnet.CAN_CONNECT) {
    return false
  }
  if (!candidate.isSuperior) {
    if (candidate.target || this.target) {
      return false;
    }
  }
  var its_brick = candidate.targetBrick

  if (candidate.type === eYo.Magnet.INPUT && candidate.target &&
      !its_brick.isMovable) {
    return false;
  }

  // Don't let a brick with no next connection bump other blocks out of the
  // stack.  Similarly, replacing a terminal statement with another terminal statement
  // is allowed.
  if (this.type === eYo.Magnet.HEAD &&
      candidate.target &&
      !this.owner.magnets.foot &&
      its_brick.magnets.foot) {
    return false;
  }

  do {
    if (this.brick === its_brick) {
      return false // candidate is contained in `this` owner
    }
  } while ((its_brick = its_brick.parent))

  return true
}

Object.defineProperty(eYo.Magnet.prototype, 'right', {
  /**
   * The right connection is just at the right... Not used.
   * @private
   */
  get () {
    var slot = this.slot
    if (slot) {
      if ((slot = slot.next) && (slot = slot.some (slot => !slot.incog && slot.magnet && !slot.input.connection.hidden_))) {
        return slot.magnet
      }
      var brick = this.brick
    } else if ((brick = this.brick)) {
      var e8r = brick.inputEnumerator()
      if (e8r) {
        while (e8r.next()) {
          if (this === e8r.here.magnet) {
            // found it
            while (e8r.next()) {
              var m4t
              if ((m4t = e8r.here.magnet)) {
                return m4t
              }
            }
          }
        }
      }
    }
    if (brick && (m4t = brick.magnets.output) && (m4t = m4t.target)) {
      return m4t.right
    }
  }
})
