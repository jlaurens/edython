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
  TOP: {
    value: Blockly.PREVIOUS_STATEMENT
  },
  BOTTOM: {
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
        [eYo.Magnet.TOP]: 'top',
        [eYo.Magnet.BOTTOM]: 'bottom',
        [eYo.Magnet.LEFT]: 'left',
        [eYo.Magnet.RIGHT]: 'right'
      } [this.type]
    }
  },
  isSuperior: {
    get () { // the source 'owns' the target
      return this.type === eYo.Magnet.INPUT ||
       this.type === eYo.Magnet.BOTTOM ||
       this.type === eYo.Magnet.RIGHT
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
  unwrappedConnection: {
    get () {
      // scheme:
      // this = output <- input <- wrapped source block <- output <- input
      var ans = this.connection
      var t
      while ((t = ans.eyo.t_eyo) && t.wrapped_) {
        var c8n = t.outputConnection
        if (c8n) {
          ans = c8n
        } else {
          break
        }
      }
      return ans
    }
  },
  parent: {
    get () {
      var c8n = this.sourceBlock_.outputConnection
      if (c8n && (c8n = c8n.targetConnection)) {
        return c8n.sourceBlock_.eyo
      }
    }
  },
  bindField: {
    get () {
      if (this.slot) {
        return this.slot.bindField
      }
      // in a void wrapped list
      var b = this.sourceBlock_
      var input = b.inputList[0]
      if (input && (input.connection === this.connection)) {
        var c8n = b.outputConnection
        if (c8n) {
          if (c8n = c8n.targetConnection) {
            return c8n.eyo.bindField
          }
        }
      }
    },
    check_: {
      writable: true
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
  isTop: {
    get () {
      return this.connection.type === eYo.Magnet.TOP
    }
  },
  /**
   * Is it a bottom connection.
   * @return {boolean} True if the connection is the block's next one.
   */
  isBottom: {
    get () {
      return this.connection.type === eYo.Magnet.BOTTOM
    }
  },
  /**
   * Is it a next connection.
   * @return {boolean} True if the connection is the block's next one.
   */
  isNext: {
    get () {
      throw "FORBIDDEN"
    }
  },
  /**
   * Is it a next or suite connection.
   * @return {boolean} True if the connection is the block's next or suite one.
   */
  isBottomLike: {
    get () {
      return this.connection.type === eYo.Magnet.NEXT
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
  unwrappedTargetBlock: {
    get () {
      var t = this.connection.targetBlock()
      var f = b => {
        return b && (!b.eyo.wrapped_ || b.inputList.some(i => {
          if (f(t = i.connection && i.connection.targetBlock())) {
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
  //       var x = b_eyo.outputConnection.targetConnection
  //       return x && (x = x.eyo.slot) && slot.model
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
      if (t4t.isTop) {
        var F = x => x.magnets.low
      } else if (t4t.isBottom) {
        F = x => x.magnets.high
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
      if (this.isTop) {
        var other = eyo => eyo.magnets.low
      } else if (this.isBottom) {
        other = eyo => eyo.magnets.high
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

/**
 * Get the incognito state.
 */
eYo.Magnet.prototype.isIncog = function () {
  return this.incog_
}

/**
 * Set the incognito state.
 * Hide/show the connection from/to the databass and disable/enable the target's connections.
 * @param {boolean} incog
 * @return {boolean} whether changes have been made
 */
eYo.Magnet.prototype.setIncog = function (incog) {
  if (this.incog_ && incog) {
    // things were unlikely to change since
    // the last time the connections have been disabled
    return false
  }
  incog = !!incog
  var change = this.incog_ !== incog
  if (change) {
    this.b_eyo.incrementChangeCount()
  }
  if (!incog && this.promised_) {
    this.completePromise()
  }
  if (incog || !this.wrapped_) {
    // We cannot disable wrapped connections
    this.incog_ = incog
    var c8n = this.connection
    if (c8n.hidden_ !== incog) {
      c8n.setHidden(incog)
      change = true
    }
  }
  var t_eyo = this.t_eyo
  if (t_eyo) {
    if (!this.isIncog()) {
      t_eyo.setIncog(false)
    }
    if (t_eyo.setIncog(incog)) {
      change = true
    }
  }
  return change
}

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
 * @param {Blockly.Connection} connection the connection owning the delegate
 * @param {Blockly.Connection} targetC8n
 */
eYo.Magnet.prototype.willConnect = function (targetC8n) {
  this.model && goog.isFunction(this.model.willConnect) && this.model.willConnect.call(this, targetC8n)
}

/**
 * Did connect.
 * Increment the block step.
 * @param {Blockly.Connection} oldTargetC8n
 *     what was previously connected to connection
 * @param {Blockly.Connection} targetOldConnection
 *     what was previously connected to the actual connection.targetConnection
 */
eYo.Magnet.prototype.didConnect = function (oldTargetC8n, targetOldC8n) {
  if (this.isReady) {
    this.t_eyo.beReady()
  }
  this.targetIsMissing = false
  // No need to increment step for the old connections because
  // if any, they were already disconnected and
  // the step has already been incremented then.
  if (!this.reentrant_.didConnect) {
    var f = this.model.didConnect
    if (goog.isFunction(f)) {
      this.reentrant_.didConnect = true
      f.call(this, oldTargetC8n, targetOldC8n)
      this.reentrant_.didConnect = false
      return
    }
  }
  if (this.isRight) {
    this.fields.label.setVisible(this.b_eyo.isGroup || !this.t_eyo.isComment)
  }
  var b_eyo = this.b_eyo
  b_eyo.incrementChangeCount()
  b_eyo.consolidate()
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
 * @param {Blockly.Connection} oldTargetC8n
 *     what was previously connected to connection
 * @param {Blockly.Connection} targetOldConnection
 *     what was previously connected to the actual connection.targetConnection
 */
eYo.Magnet.prototype.didDisconnect = function (oldTargetC8n, targetOldC8n) {
  // No need to increment step for the old connections because
  // if any, they were already disconnected and
  // the step has already been incremented then.
  if (!this.reentrant_.didDisconnect) {
    var f = this.model && this.model.didDisconnect
    if (goog.isFunction(f)) {
      this.reentrant_.didDisconnect = true
      f.call(this, oldTargetC8n, targetOldC8n)
      this.reentrant_.didDisconnect = false
      return
    }
  }
  var b_eyo = this.b_eyo
  b_eyo.incrementChangeCount()
  b_eyo.consolidate()
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
    this.connection.setCheck(this.model.check.call(this, eyo.type, eyo.subtype))
  }
}

/**
 * get the check_ array. This is a dynamic method.
 * The default implementation just returns the connection's check_.
 * @return the connection's check_ array.
 * @suppress {accessControls}
 */
eYo.Magnet.prototype.getCheck = function () {
  return this.connection.check_
}

/**
 * Get the magnet of the same kind on the block above.
 * If the magnet is named (Why should it be?), returns the connection,
 * whatever its source block status may be.
 * @return a connection, possibly undefined
 */
eYo.Magnet.prototype.getMagnetAbove = function () {
  var ans = this.b_eyo.high
  if (ans) {
    var m4ts = ans.magnets
    if (this.isBottom) {
      return m4ts.low
    } else if (this.isTop) {
      return m4ts.high
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
  var ans = this.b_eyo.low
  if (ans) {
    var m4ts = ans.magnets
    if (this.isBottom) {
      return m4ts.low
    } else if (this.isTop) {
      return m4ts.high
    } else if (this.isRight) {
      return m4ts.right
    } else if (this.isLeft) {
      return m4ts.left
    }
  }
}

/**
 * Connection.
 * @param {!Blockly.Connection} c8n
 */
eYo.Magnet.prototype.connect = function(c8n) {
  if (c8n) {
    this.setIncog(false)
    this.connection.connect(c8n)
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
    var m = eyo.magnets.high
    this.connect(m.connection)
    return eyo.lowMost.magnets.high
  }

  /**
   * Establish a connection with a block.
   * @param {!eYo.Delegate} eyo
   * @return {!eYo.Magnet}
   */
  var connectToLeft = function (eyo) {
    var m = eyo.magnets.left
    this.connect(m.connection)
    return eyo.rightMost.magnets.high
  }

  /**
   * Establish a connection with a block.
   * @param {!Blockly.Connection} c8n
   */
  var connectToRight = function (eyo) {
    var m = eyo.magnets.right
    this.connect(m.connection)
    return eyo.leftMost.magnets.high
  }

  /**
   * Establish a connection with a block.
   * @param {!eYo.Delegate} eyo
   * @return {!eYo.Magnet}
   */
  var connectToBottom = function (eyo) {
    var m = eyo.magnets.low
    this.connect(m.connection)
    return eyo.highMost.magnets.high
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
    if (this.isBottom || this.isSuite) {
      this.connectSmart = connectToTop
      return this.connectSmart(b)
    }
    if (this.isTop) {
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
eYo.Magnet.prototype.consolidateSource = function () {
  this.b_eyo.consolidate()
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
  } else if (this.isTop) {
    msg = 'Top Connection of '
  } else if (this.isBottom) {
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
    if (D.high && goog.isDefAndNotNull(D.high.check)) {
      this.high_ = new eYo.Magnet(eyo, eYo.Magnet.TOP, D.high)
    }
    if (D.low && goog.isDefAndNotNull(D.low.check)) {
      this.low_ = new eYo.Magnet(eyo, eYo.Magnet.isBottom, D.low)
    }
    if (D.suite && goog.isDefAndNotNull(D.suite.check)) {
      this.suite_ = new eYo.Magnet(eyo, eYo.Magnet.BOTTOM, D.suite)
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
  top: {
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
  bottom: {
    get () {
      return this.low_
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
  this.low_ && this.low_.dispose()
  this.low_ = undefined
  this.output_ && this.suite_.dispose()
  this.output_ = undefined
}
