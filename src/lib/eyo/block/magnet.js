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

goog.require('eYo.Delegate')
goog.require('eYo.Const')
goog.require('eYo.Do')
goog.require('eYo.Where')
goog.require('eYo.T3')


/**
 * Class for a connection delegate.
 * @param {!Blockly.Block} block  the source block of this magnet
 * @param {!String} type  the type of this magnet
 * @param {!Object} model  the model this magnet
 * @readonly
 * @property {*} node  the node if any
 * @property {boolean} startOfLine  whether the connection is an input connection starting a line.
 * @property {boolean} startOfStatement  whether the connection is an input connection starting a block.
 * @readonly
 * @property {string} type  the type of the connection
 * @readonly
 * @property {boolean} targetIsMissing  whether a target is missing
 * @readonly
 * @property {boolean} isSuperior  whether the connection is superior, true if connection faces down or right, false otherwise.
 * @constructor
 */
eYo.Magnet = function (block, type, model) {
  this.connection_ = new Blockly.RenderedConnection(block, type)
  this.model_ = model
  this.where_ = new eYo.Where()
  this.slot = undefined // except when the connection belongs to a slot
  this.reentrant_ = {}
  this.targetIsMissing = false
  model.fields && eYo.FieldHelper.makeFields(this, model.fields)
}

Object.defineProperties(eYo.Magnet, {
  INPUT: {
    value: Blockly.INPUT_VALUE
  },
  OUTPUT: {
    value: Blockly.OUTPUT_VALUE
  },
  HEAD: {
    value: Blockly.PREVIOUS_STATEMENT
  },
  FOOT: {
    value: Blockly.NEXT_STATEMENT
  },
  LEFT: {
    value: 5
  },
  RIGHT: {
    value: 6
  }
})

Blockly.OPPOSITE_TYPE[eYo.Magnet.RIGHT] = eYo.Magnet.LEFT
Blockly.OPPOSITE_TYPE[eYo.Magnet.LEFT] = eYo.Magnet.RIGHT

/**
 * Dispose of the ressources.
 */
eYo.Magnet.prototype.dispose = function () {
  eYo.FieldHelper.disposeFields(this)
  this.reentrant_ = this.slot = this.where_ = this.model_ = undefined
  this.connection_.dispose()
  this.connection_ = undefined
}

Object.defineProperties(eYo.Magnet.prototype, {
  connection: {
    get () {
      return this.connection_
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
  node: {
    get () {
      var b = this.connection.sourceBlock_
      return b && b.eyo
    }
  },
  type: {
    get () {
      return this.connection.type
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
      this.hidden__ = hidden
      var c8n = this.connection
      if (hidden && c8n.inDB_) {
        c8n.db_.removeConnection_(c8n)
      } else if (!hidden && !c8n.inDB_) {
        c8n.db_.addConnection(c8n)
      }
    }
  },
  c: { // in block text coordinates
    get () {
      return this.slot ? this.where.c + this.slot.where.c : this.where.c
    }
  },
  l: { // in block text coordinates
    get () {
      return this.slot ? this.where.l + this.slot.where.l : this.where.l
    }
  },
  x: { // in block coordinates
    get () {
      return this.slot ? this.where.x + this.slot.where.x : this.where.x
    }
  },
  y: { // in block coordinates
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
  sourceBlock_: {
    get () {
      return this.connection.sourceBlock_
    }
  },
  b_eyo: {
    get () {
      return this.sourceBlock_.eyo
    }
  },
  ui: {
    get () {
      return this.b_eyo.ui
    }
  },
  target: {
    get () {
      var c8n = this.connection.targetConnection
      return c8n && c8n.eyo
    }
  },
  t_eyo: { // === this.target.b_eyo
    get () {
      var t = this.connection.targetBlock()
      return t && t.eyo
    },
    set (newValue) {
      if (newValue !== this.t_eyo && newValue !== this.b_eyo) {
        this.break()
      }
      if (newValue) {
        this.connectSmart(newValue)
      }
    }
  },
  ui: {
    get () {
      return this.b_eyo.ui
    }
  },
  unwrappedMagnet: {
    get () {
      // scheme:
      // this = output <- input <- wrapped source block <- output <- input
      var ans = this
      var t_eyo
      while ((t_eyo = ans.t_eyo) && t_eyo.wrapped_) {
        var m4t = t_eyo.magnets.output
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
      var b_eyo = this.b_eyo
      var input = b_eyo.inputList[0]
      if (input && (input.eyo.magnet === this)) {
        var m4t = b_eyo.magnets.output
        if (m4t && (m4t = m4t.target)) {
          return m4t.bindField
        }
      }
    },
  },
  check_: {
    writable: true
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
      var b_eyo = this.b_eyo
      var t_eyo = this.t_eyo
      if (t_eyo && !this.checkType_(this.target)) {
        (this.isSuperior ? t_eyo : b_eyo).unplug()
        // Bump away.
        b_eyo.block_.bumpNeighbours_()
      }
      b_eyo.incrementChangeCount()
      t_eyo && t_eyo.incrementChangeCount() // there was once a `consolidate(false, true)` here.
    }
  },
  /**
   * Is it an output connection.
   * @return {boolean} True if the connection is the block's output one.
   */
  isOutput: {
    get () {
      return this.connection.type === eYo.Magnet.OUTPUT
    }
  },
  /**
   * Is it a top connector.
   * @return {boolean} True if the connection is the block's previous one.
   */
  isHead: {
    get () {
      return this.connection.type === eYo.Magnet.HEAD
    }
  },
  /**
   * Is it a low connection.
   * @return {boolean} True if the connection is the block's next one.
   */
  isFoot: {
    get () {
      return this.connection.type === eYo.Magnet.FOOT
    }
  },
  /**
   * Is it a suite connection.
   * @return {boolean} True if the connection is the block's suite one.
   */
  isSuite: {
    get () {
      return this === this.b_eyo.magnets.suite
    }
  },
  /**
   * Is it a left connection.
   * @return {boolean} True if the connection is the block's left one.
   */
  isLeft: {
    get () {
      return this.connection.type === eYo.Magnet.LEFT
    }
  },
  /**
   * Is it a right connection.
   * @return {boolean} True if the connection is the block's right one.
   */
  isRight: {
    get () {
      return this.connection.type === eYo.Magnet.RIGHT
    }
  },
  /**
   * Is it an input connection.
   * @return {boolean} True if the connection is one of the block's input connections.
   */
  isInput: {
    get () {
      return this.connection.type === eYo.Magnet.INPUT
    }
  },
  /**
   * Returns an unwrapped target block
   */
  unwrappedTarget: {
    get () {
      var t = this.t_eyo
      var f = t => {
        return t && (!t.wrapped_ || t.inputList.some(i => {
          var m4t = i.eyo.magnet
          if (f(t = m4t && m4t.t_eyo)) {
            return true
          }
        }))
      }
      return f(t) && t
    }
  // },
  // model: {
  //   get () {
  //     if (this.model_) {
  //       return this.model_
  //     }
  //     // do not cache, unless you know what you do
  //     var b_eyo = this.b_eyo
  //     if (b_eyo.wrapped_ && b_eyo instanceof eYo.DelegateSvg.List) {
  //       var x = b_eyo.magnets.output.target
  //       return x && (x = x.slot) && slot.model
  //     }
  //   },
  //   set (newValue) {
  //     this.model_ = newValue
  //   }
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
      var b_eyo = t4t.b_eyo
      if (!b_eyo.isWhite) {
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
        if (!(t4t = F(b_eyo)) || !(t4t = t4t.target) || !(b_eyo = t4t.b_eyo)) {
          return undefined
        }
        if (!b_eyo.isWhite) {
          return t4t
        }
      } while (true)
    }
  },
  /**
   * Return the black connection.
   * Traverses the white blocks.
   * If the source block is black, returns the connection.
   * If the source block is white, check for the target block's other connection,
   * and so on.
   * If the connection is named, returns the connection, whatever its source block
   * status may be.
   * @param F optional function defaults to !argument.isWhite
   * @return a connection, possibly undefined
   */
  blackMagnet: {
    get () {
      var eyo = this.b_eyo
      if (!eyo.isWhite) {
        return this
      }
      if (this.isHead) {
        var other = eyo => eyo.magnets.foot
      } else if (this.isFoot) {
        other = eyo => eyo.magnets.head
      } else {
        // this is a 'do' statement input connection
        // whether the surrounding block is disabled or not has no importance
        return this
      }
      var magnet
      while ((magnet = other(eyo)) && (magnet = magnet.target) && !magnet.name_ && (!(eyo = magnet.b_eyo) || eyo.isWhite)) {}
      return magnet
    }
  }
})

/**
 * Whether the connection is a separator.
 * Used in lists.
 */
eYo.Magnet.prototype.plugged_ = undefined

/**
 * Whether the connection is a separator.
 * Used in lists.
 */
eYo.Magnet.prototype.s7r_ = false

/**
 * Whether the connection is disabled.
 * Separators are disabled for range arguments.
 * Used in lists.
 */
eYo.Magnet.prototype.disabled_ = false

/**
 * Whether the connection is a wrapper.
 */
eYo.Magnet.prototype.wrapped_ = false// must change to wrapper

/**
 * Whether the connection is optionally connected.
 */
eYo.Magnet.prototype.optional_ = false// must change to wrapper

/**
 * name of the connection.
 * See identifier
 */
eYo.Magnet.prototype.name_ = undefined// must change to wrapper

/**
 * execute the given function for the fields.
 * For edython.
 * @param {!function} helper
 * @return {boolean} whether there was a field to act upon or a valid helper
 */
eYo.Magnet.prototype.forEachField = function (helper) {
  this.fields && Object.values(this.fields).forEach(f => helper(f))
}

/**
 * `beReady` the target block.
 */
eYo.Magnet.prototype.beReady = function () {
  this.beReady = eYo.Do.nothing // one shot function
  var t_eyo = this.t_eyo
  t_eyo && t_eyo.beReady()
  this.forEachField(f => f.eyo.beReady())
}

/**
 * `consolidate` the target block.
 */
eYo.Magnet.prototype.consolidate = function (deep, force) {
  var target = this.connection.targetBlock()
  target && target.eyo.consolidate(deep, force)
}

/**
 * Convenient method to get the source block of the receiver's connection.
 */
eYo.Magnet.prototype.sourceBlock = function () {
  return this.connection.sourceBlock_
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
      this.b_eyo.incrementChangeCount()
    }
    if (!newValue && this.promised_) {
      this.completePromise()
    }
    if (newValue || !this.wrapped_) {
      // We cannot disable wrapped connections
      this.incog_ = this.hidden_ = newValue
    }
    var t_eyo = this.t_eyo
    if (t_eyo) {
      t_eyo.incog = newValue
    }  
  }
})

/**
 * Complete with a wrapped block.
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
    var t_eyo = this.t_eyo
    if (!t_eyo) {
      var ans
      eYo.Events.disableWrap(
        () => {
          var b_eyo = this.b_eyo
          t_eyo = eYo.DelegateSvg.newComplete(b_eyo, this.wrapped_, b_eyo.id + '.wrapped:' + this.name_)
          goog.asserts.assert(t_eyo, 'completeWrap failed: ' + this.wrapped_)
          goog.asserts.assert(t_eyo.magnets.output, 'Did you declare an Expr block typed ' + t_eyo.type)
          ans = this.connect(t_eyo.magnets.output)
        }
      )
      return ans // true when connected
    }
  }
)

/**
 * Complete with a promised block.
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
 * Break the connection by unplugging a source block.
 */
eYo.Magnet.prototype.break = function () {
  var eyo = this.isSuperior ? this.t_eyo : this.b_eyo
  eyo && eyo.block_.unplug()
}

/**
 * Break the connection.
 */
eYo.Magnet.prototype.disconnect = function () {
  this.connection.disconnect()
}

/**
 * Will connect.
 * Forwards to the model.
 * @param {eYo.Magnet} m4t the connection owning the delegate
 * @param {Blockly.Connection} targetM4t
 */
eYo.Magnet.prototype.willConnect = function (targetM4t) {
  this.model && goog.isFunction(this.model.willConnect) && this.model.willConnect.call(this, targetM4t)
}

/**
 * Did connect.
 * Increment the block step.
 * @param {Blockly.Connection} oldTargetM4t
 *     what was previously connected to connection
 * @param {Blockly.Connection} targetOldConnection
 *     what was previously connected to the actual connection.targetConnection
 */
eYo.Magnet.prototype.didConnect = function (oldTargetM4t, targetOldM4t) {
  this.targetIsMissing = false
  // No need to increment step for the old connections because
  // if any, they were already disconnected and
  // the step has already been incremented then.
  if (!this.reentrant_.didConnect) {
    var f = this.model.didConnect
    if (goog.isFunction(f)) {
      this.reentrant_.didConnect = true
      f.call(this, oldTargetM4t, targetOldM4t)
      this.reentrant_.didConnect = false
      return
    }
  }
  var b_eyo = this.b_eyo
  if (this.isRight) {
    this.fields.label.setVisible(b_eyo.isGroup || !this.t_eyo.isComment)
  }
}

/**
 * Will disconnect.
 * Default implementation does nothing.
 * This can be overriden at block creation time.
 */
eYo.Magnet.prototype.willDisconnect = function () {
  this.model && goog.isFunction(this.model.willDisconnect) && this.model.willDisconnect.call(this)
  if (this.isRight) {
    this.fields.label.setVisible(this.b_eyo.isGroup)
  }
}

/**
 * Did disconnect.
 * Increment the block step.
 * @param {Blockly.Connection} oldTargetM4t
 *     what was previously connected to connection
 * @param {Blockly.Connection} targetOldConnection
 *     what was previously connected to the actual connection.targetConnection
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
 * Called by `consolidateConnections`.
 */
eYo.Magnet.prototype.updateCheck = function () {
  var eyo = this.b_eyo
  if(eyo.change.level > 1 || this.changeCount === eyo.change.count) {
    return
  }
  this.changeCount = eyo.change.count
  if (this.model.check) {
    this.check = this.model.check.call(this, eyo.type, eyo.subtype)
  }
}

/**
 * Get the magnet of the same kind on the block above.
 * If the magnet is named (Why should it be?), returns the connection,
 * whatever its source block status may be.
 * @return a connection, possibly undefined
 */
eYo.Magnet.prototype.getMagnetAbove = function () {
  var ans = this.b_eyo.head
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
 * Get the connection of the same kind on the block below.
 * @return a magnet, possibly undefined
 */
eYo.Magnet.prototype.getMagnetBelow = function () {
  var ans = this.b_eyo.foot
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
 * Connection.
 * @param {!eYo.Magnet} magnet
 */
eYo.Magnet.prototype.connect = function(m4t) {
  if (m4t) {
    this.incog = false
    this.connection.connect(m4t.connection)
    return m4t
  }
}

/**
 * Establish a connection with a block.
 *
 * @param {!eYo.Delegate} eyo
 */
eYo.Magnet.prototype.connectSmart = (() => {

  /**
   * Establish a connection with a block.
   * @param {!eYo.Delegate} eyo
   * @return {!eYo.Magnet}
   */
  var connectToTop = function (eyo) {
    var m = eyo.magnets.head
    this.connect(m.connection)
    return eyo.footMost.magnets.head
  }

  /**
   * Establish a connection with a block.
   * @param {!eYo.Delegate} eyo
   * @return {!eYo.Magnet}
   */
  var connectToLeft = function (eyo) {
    var m = eyo.magnets.left
    this.connect(m.connection)
    return eyo.rightMost.magnets.head
  }

  /**
   * Establish a connection with a block.
   * @param {!Blockly.Connection} c8n
   */
  var connectToRight = function (eyo) {
    var m = eyo.magnets.right
    this.connect(m.connection)
    return eyo.leftMost.magnets.head
  }

  /**
   * Establish a connection with a block.
   * @param {!eYo.Delegate} eyo
   * @return {!eYo.Magnet}
   */
  var connectToBottom = function (eyo) {
    var m = eyo.magnets.foot
    this.connect(m.connection)
    return eyo.headMost.magnets.head
  }

  /**
   * Establish a connection with a block.
   * @param {!eYo.Delegate} eyo
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
  this.connection.setOffsetInBlock(this.x, this.y)
}

/**
 * May be useful for `didConnect` and `didDisconnect` in models.
 */
eYo.Magnet.prototype.getBlock = function () {
  return this.b_eyo.block_
}

/**
 * Check type.
 * @param {!eYo.Magnet} other
 */
eYo.Magnet.prototype.checkType_ = function (other, force) {
  return this.connection.checkType_(other.connection, force)
}

/**
 * This method returns a string describing this Connection in developer terms
 * (English only). Intended to on be used in console logs and errors.
 * @return {string} The description.
 */
eYo.Magnet.prototype.toString = function() {
  var msg
  var eyo = this.b_eyo
  if (!eyo) {
    return 'Orphan Connection'
  } else if (this.isOutput) {
    msg = 'Output Connection of '
  } else if (this.isHead) {
    msg = 'Top Connection of '
  } else if (this.isFoot) {
    msg = 'Bottom Connection of '
  } else if (this.isSuite) {
    msg = 'Suite Connection of '
  } else if (this.isLeft) {
    msg = 'Left statement Connection of '
  } else if (this.isRight) {
    msg = 'Right statement Connection of '
  } else {
    var parentInput = goog.array.find(eyo.inputList, input => input.connection === this.connection, this)
    if (parentInput) {
      msg = 'Input "' + parentInput.name + '" connection on '
    } else {
      console.warn('Connection not actually connected to sourceBlock_')
      return 'Orphan Connection'
    }
  }
  return msg + eyo.block_.toDevString()
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
eYo.Magnets.prototype.predispose = function () {
  if (this.left_) {
    this.left_.dispose()
    this.left_ = undefined
    this.right_.dispose()
    this.right_ = undefined
    this.suite_ && this.suite_.dispose()
    this.suite_ = undefined
  }
}

/**
 * Dispose of all the ressources that blockly does not have.
 * This is an intermediate design.
 */
eYo.Magnets.prototype.dispose = function () {
  this.predispose()
  this.high_ && this.high_.dispose()
  this.high_ = undefined
  this.foot_ && this.foot_.dispose()
  this.foot_ = undefined
  this.output_ && this.suite_.dispose()
  this.output_ = undefined
}

/**
 * Connect two magnets together.  `This` is the magnet on the superior
 * block.
 * Add hooks to allow customization.
 * @param {!eYo.Magnets.prototype} childM4t  A magnet on an inferior block.
 * @private
 * @suppress {accessControls}
 */
eYo.Magnet.prototype.prototype.connect_ = (() => {
  // We save a function that we replace below
  var connect_ = Blockly.RenderedConnection.prototype.connect_
  return function (childM4t) {
    // `this` is actually the parentM4t
    var parentM4t = this
    var parent = parentM4t.b_eyo
    var child = childM4t.b_eyo
    if (parent.workspace !== child.workspace) {
      return
    }
    var oldParentM4t = childM4t.target
    var oldChildM4t = parentM4t.target
    var unwrappedM4t = parentM4t.unwrappedMagnet
    parent.changeWrap(() => {
      child.changeWrap(() => { // the child will cascade changes to the parent
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
              eYo.Do.tryFinally(() => {
                connect_.call(parentM4t.connection, childM4t.connection)
                if (parentM4t.plugged_) {
                  child.plugged_ = parentM4t.plugged_
                }
                if (parentM4t.wrapped_) {
                  child.selected && parent.select()
                  child.wrapped_ = true
                } else {
                  // if this connection was selected, the newly connected block should be selected too
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
                  var oldChild = oldChildM4t.b_eyo
                  if (oldChild) {
                    if (oldChild.wrapped_) {
                      eYo.Events.recordUndo && oldChild.dispose(true)
                    } else if (!oldChildM4t.t_eyo) {
                      // another chance to reconnect the orphan
                      // just in case the check_ has changed in between
                      // which might be the case for the else_part blocks
                      if (oldChildM4t.isOutput) {
                        var do_it = x => { // a slot or an input
                          if (!x.incog) {
                            var m4t, t_eyo
                            if ((m4t = x.magnet || x.eyo.magnet)) {
                              if (m4t.hidden_ && !m4t.wrapped_) {
                                return
                              }
                              if ((t_eyo = m4t.t_eyo)) {
                                if (plug(t_eyo)) {
                                  return true
                                }
                              } else if (m4t.checkType_(oldChildM4t)) {
                                m4t.connect(oldChildM4t)
                                return true
                              }
                            }
                          }
                        }
                        var plug = eyo => {
                          return eyo instanceof eYo.DelegateSvg.List
                          ? eyo.someInput(do_it)
                          : eyo.someSlot(do_it)
                        }
                        plug(child)
                      } else {
                        P = child
                        var m4t
                        while ((m4t = P.magnets.foot)) {
                          if ((P = m4t.t_eyo)) {
                            continue
                          } else if (m4t.checkType_(oldChildM4t)) {
                            m4t.connect(oldChildM4t)
                          }
                          break
                        }
                      }
                    }
                  }
                }
                childM4t.selected && childM4t.unselect()
                parentM4t.selected && parentM4t.unselect()
                child.incog = parentM4t.incog
              }, () => { // finally
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
    child.incrementChangeCount()
    child.consolidate()
    parent.consolidate()
    var ui
    (ui = child.ui) && ui.didConnect(childM4t, oldChildM4t, oldParentM4t)
    (ui = parent.ui) && ui.didConnect(parentM4t, oldParentM4t, oldChildM4t)
    (unwrappedM4t !== parentM4t) && (ui = unwrappedM4t.ui) && ui.didConnect(parentM4t, oldParentM4t, oldChildM4t)
  }
}) ()

/**
 * Connect two connections together.  This is the connection on the superior
 * block.
 * Add hooks to allow customization.
 * @param {!eYo.Magnet} childM4t Connection on inferior block.
 * @private
 * @suppress {accessControls}
 */
Blockly.RenderedConnection.prototype.connect_ = function (childC8n) {
  childC8n && this.eyo.connect_(childC8n.eyo)
}

/**
 * Disconnect two blocks that are connected by this connection.
 * Add hooks to allow customization.
 * @param {!Blockly.Block} parentBlock The superior block.
 * @param {!Blockly.Block} childBlock The inferior block.
 * @private
 * @suppress {accessControls}
 */
eYo.Magnet.prototype.disconnectInternal_ = (() => {
  // Closure
  var disconnectInternal_ = Blockly.RenderedConnection.prototype.disconnectInternal_

  return function (parent, child) {
    if (this.b_eyo === parent) {
      var parentM4t = this
      var childM4t = this.target
    } else {
      parentM4t = this.target
      childM4t = this
    }
    var unwrappedM4t = parentM4t.unwrappedMagnet
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
                    // currently unwrapping a block,
                    // this occurs while removing the parent
                    // if the parent was selected, select the child
                    child.wrapped_ = false
                    parent.selected && child.select()
                  }
                  disconnectInternal_.call(this, parent.block_, child.block_)
                  child.plugged_ = undefined
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
  }
}) ()

/**
 * Disconnect two blocks that are connected by this connection.
 * Add hooks to allow customization.
 * @param {!Blockly.Block} parentBlock The superior block.
 * @param {!Blockly.Block} childBlock The inferior block.
 * @private
 * @suppress {accessControls}
 */
Blockly.RenderedConnection.prototype.disconnectInternal_ = function (parent, child) {
  this.eyo.disconnectInternal_(parent.eyo, child.eyo)
}

/**
 * Move the blocks on either side of this connection right next to each other.
 * Delegates the translate process to the block
 * @private
 */
Blockly.RenderedConnection.prototype.tighten_ = function() {
  var where = this.eyo.where
  var target_where = this.targetConnection.eyo.where
  var dc = target_where.c - where.c
  var dl = target_where.l - where.l
  if (dc != 0 || dl != 0) {
    var block = this.targetBlock();
    block.eyo.ui.setOffset(-dc, -dl);
  }
};

/**
 * Tighten_ the magnet and its target.
 */
eYo.Magnet.prototype.tighten_ = function() {
  var m4t = this.target
  if (this.target) {
    var dx = m4t.x_ - this.x_
    var dy = m4t.y_ - this.y_
    if (dx != 0 || dy != 0) {
      var t_eyo = this.t_eyo
      t_eyo.ui.setOffset(-dx, -dy)
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
  this.b_eyo.scrollToVisible(force)
}
