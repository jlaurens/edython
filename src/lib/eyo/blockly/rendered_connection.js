/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview Extends connections.
 * Insert a class between Blockly.Connection and Blockly.RenderedConnection
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.RenderedConnection')
goog.provide('eYo.ConnectionDelegate')

goog.forwardDeclare('eYo.Selected')

goog.require('Blockly.RenderedConnection')
goog.require('Blockly.Connection')

goog.require('eYo.Const')
goog.require('eYo.Do')
goog.require('eYo.T3')
goog.require('eYo.Where')

/**
 * Class for a connection delegate.
 * @param {!Blockly.Connection} connection the connection owning the delegate
 * @constructor
 */
eYo.ConnectionDelegate = function (connection) {
  goog.asserts.assert(connection, 'A connection delegate MUST belong to a connection')
  this.connection = connection
  this.where = new eYo.Where()
  this.slot = undefined // except when the connection belongs to a slot
  this.reentrant = {}
  this.targetIsMissing = false
}

Object.defineProperties(eYo.ConnectionDelegate.prototype, {
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
    }
  },
  /**
   * Is it a next connection.
   * @return {boolean} True if the connection is the block's next one.
   */
  isNext: {
    get () {
      return this.connection === this.connection.sourceBlock_.nextConnection
    }
  },
  /**
   * Is it a next or suite connection.
   * @return {boolean} True if the connection is the block's next or suite one.
   */
  isNextLike: {
    get () {
      return this.connection.type === Blockly.NEXT_STATEMENT
    }
  },
  /**
   * Is it a previous connection.
   * @return {boolean} True if the connection is the block's previous one.
   */
  isPrevious: {
    get () {
      return this.connection === this.connection.sourceBlock_.previousConnection
    }
  },
  /**
   * Is it an output connection.
   * @return {boolean} True if the connection is the block's output one.
   */
  isOutput: {
    get () {
      return this.connection === this.connection.sourceBlock_.outputConnection
    }
  },
  /**
   * Is it a suite connection.
   * @return {boolean} True if the connection is the block's suite one.
   */
  isSuite: {
    get () {
      return this.connection === this.b_eyo.suiteConnection
    }
  },
  /**
   * Is it an input connection.
   * @return {boolean} True if the connection is one of the block's input connections.
   */
  isInput: {
    get () {
      return this.connection.type === Blockly.INPUT_VALUE
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
  //   }
  }
})

/**
 * Whether the connection is a separator.
 * Used in lists.
 */
eYo.ConnectionDelegate.prototype.plugged_ = undefined

/**
 * Whether the connection is a separator.
 * Used in lists.
 */
eYo.ConnectionDelegate.prototype.s7r_ = false

/**
 * Whether the connection is disabled.
 * Separators are disabled for range arguments.
 * Used in lists.
 */
eYo.ConnectionDelegate.prototype.disabled_ = false

/**
 * Whether the connection is a wrapper.
 */
eYo.ConnectionDelegate.prototype.wrapped_ = false// must change to wrapper

/**
 * Whether the connection is optionally connected.
 */
eYo.ConnectionDelegate.prototype.optional_ = false// must change to wrapper

/**
 * name of the connection.
 * See identifier
 */
eYo.ConnectionDelegate.prototype.name_ = undefined// must change to wrapper

/**
 * `beReady` the target block.
 */
eYo.ConnectionDelegate.prototype.beReady = function () {
  if (!this.connection.inDB_ &&!this.connection.hidden_) {

  }
  var target = this.connection.targetBlock()
  if (target) {
    target.eyo.beReady()
    target.eyo.parentDidChange(this.connection.getSourceBlock())
  }
  this.beReady = eYo.Do.nothing // one shot function
}

/**
 * `consolidate` the target block.
 */
eYo.ConnectionDelegate.prototype.consolidate = function (deep, force) {
  var target = this.connection.targetBlock()
  target && target.eyo.consolidate(deep, force)
}

/**
 * Convenient method to get the source block of the receiver's connection.
 */
eYo.ConnectionDelegate.prototype.sourceBlock = function () {
  return this.connection.sourceBlock_
}

/**
 * Get the incognito state.
 */
eYo.ConnectionDelegate.prototype.isIncog = function () {
  return this.incog_
}

/**
 * Set the incognito state.
 * Hide/show the connection from/to the databass and disable/enable the target's connections.
 * @param {boolean} incog
 * @return {boolean} whether changes have been made
 */
eYo.ConnectionDelegate.prototype.setIncog = function (incog) {
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
  var c8n = this.connection
  if (!incog && this.promised_) {
    this.completePromised()
  }
  if (incog || !this.wrapped_) {
    // We cannot disable wrapped connections
    this.incog_ = incog
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
eYo.ConnectionDelegate.prototype.completeWrapped = eYo.Decorate.reentrant_method(
  'completeWrapped',
  function () {
    if (!this.wrapped_) {
      return
    }
    var c8n = this.connection
    var target = c8n.targetBlock()
    if (!target) {
      var ans
      eYo.Events.disableWrap(
        () => {
          var block = c8n.sourceBlock_
          var makeNewBlock = block.eyo.beReady === eYo.Do.nothing
          ? eYo.DelegateSvg.newBlockReady
          : eYo.DelegateSvg.newBlockComplete
          target = makeNewBlock.call(eYo.DelegateSvg, block.workspace, this.wrapped_, block.id + '.wrapped:' + this.name_)
          goog.asserts.assert(target, 'completeWrapped failed: ' + this.wrapped_)
          goog.asserts.assert(target.outputConnection, 'Did you declare an Expr block typed ' + target.type)
          ans = this.connect(target.outputConnection)
        }
      )
      return ans // true when connected
    }
  }
)

/**
 * Complete with a promised block.
 */
eYo.ConnectionDelegate.prototype.completePromised = function () {
  if (this.promised_) {
    this.wrapped_ = this.promised_
    var ans = this.completeWrapped()
    return ans && ans.ans
  }
}

/**
 * Will connect.
 * Forwards to the model.
 * @param {Blockly.Connection} connection the connection owning the delegate
 * @param {Blockly.Connection} targetC8n
 */
eYo.ConnectionDelegate.prototype.willConnect = function (targetC8n) {
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
eYo.ConnectionDelegate.prototype.didConnect = function (oldTargetC8n, targetOldC8n) {
  if (this.beReady === eYo.Do.nothing) {
    this.t_eyo.beReady()
  }
  this.targetIsMissing = false
  // No need to increment step for the old connections because
  // if any, they were already disconnected and
  // the step has already been incremented then.
  if (!this.reentrant.didConnect) {
    var f = this.model.didConnect
    if (goog.isFunction(f)) {
      this.reentrant.didConnect = true
      f.call(this, oldTargetC8n, targetOldC8n)
      this.reentrant.didConnect = false
      return
    }
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
eYo.ConnectionDelegate.prototype.willDisconnect = function () {
  this.model && goog.isFunction(this.model.willDisconnect) && this.model.willDisconnect.call(this)
}

/**
 * Did disconnect.
 * Increment the block step.
 * @param {Blockly.Connection} oldTargetC8n
 *     what was previously connected to connection
 * @param {Blockly.Connection} targetOldConnection
 *     what was previously connected to the actual connection.targetConnection
 */
eYo.ConnectionDelegate.prototype.didDisconnect = function (oldTargetC8n, targetOldC8n) {
  // No need to increment step for the old connections because
  // if any, they were already disconnected and
  // the step has already been incremented then.
  if (!this.reentrant.didDisconnect) {
    var f = this.model && this.model.didDisconnect
    if (goog.isFunction(f)) {
      this.reentrant.didDisconnect = true
      f.call(this, oldTargetC8n, targetOldC8n)
      this.reentrant.didDisconnect = false
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
 * Called by consolidateConnections
 */
eYo.ConnectionDelegate.prototype.updateCheck = function () {
  var eyo = this.connection.sourceBlock_.eyo
  if(this.changeCount === eyo.change.count) {
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
eYo.ConnectionDelegate.prototype.getCheck = function () {
  return this.connection.check_
}

/**
 * Get the connection of the same kind on the block above.
 * If the connection is named, returns the connection,
 * whatever its source block status may be.
 * @return a connection, possibly undefined
 */
eYo.ConnectionDelegate.prototype.getConnectionAbove = function () {
  var previous = this.eyo.b_eyo.previous
  if (previous && !previous.name_ && (previous = previous.targetBlock())) {
    if (this.isNext) {
      return previous.nextConnection
    } else if (this.isPrevious) {
      return previous.previousConnection
    }
  }
  return undefined
}

/**
 * Get the connection of the same kind on the block below.
 * If the connection is named, returns the connection, whatever ist source block
 * status may be.
 * @return a connection, possibly undefined
 */
eYo.ConnectionDelegate.prototype.getConnectionBelow = function () {
  var next = this.connection.getSourceBlock().nextConnection
  if (next && (next = next.targetBlock())) {
    switch (this.connection.type) {
    case Blockly.NEXT_STATEMENT: return next.nextConnection
    case Blockly.PREVIOUS_STATEMENT: return next.previousConnection
    }
  }
  return undefined
}

/**
 * Return the black connection.
 * Traverses the white blocks.
 * If the source block is black, returns the connection.
 * If the source block is white, check for the target block's other connection,
 * and so on.
 * If the connection is named, returns the connection, whatever its source block
 * status may be.
 * @param F optional function defaults to !argument.eyo.isWhite()
 * @return a connection, possibly undefined
 */
eYo.ConnectionDelegate.prototype.getBlackConnection = function (F) {
  F = F || (B => !B.eyo.isWhite())
  var c8n = this.connection
  var block = c8n.getSourceBlock()
  if (F(block)) {
    return c8n
  }
  if (this.isPrevious) {
    var otherConnection = (B) => B.nextConnection
  } else if (this.isNext) {
    otherConnection = (B) => B.previousConnection
  } else {
    // this is a 'do' statement input connection
    // whether the surrounding block is disabled or not has no importance
    return c8n
  }
  while ((c8n = otherConnection(block)) && (c8n = c8n.targetConnection) && !(c8n.eyo.name_) && !((block = c8n.getSourceBlock()) && F(block))) {}
  return c8n
}

/**
 * Return the black target connection.
 * Traverses the white blocks
 * @return {?Blockly.Connection} True if the connection is the block's next one.
 * @private
 */
eYo.ConnectionDelegate.prototype.getBlackTargetConnection = function () {
  var c8n = this.connection.targetConnection
  if (!c8n) {
    return undefined
  }
  var block = c8n.getSourceBlock()
  if (!block.eyo.isWhite()) {
    return c8n
  }
  if (c8n.eyo.isPrevious) {
    var F = (B) => {
      return B.nextConnection
    }
  } else if (c8n.eyo.isNext) {
    F = (B) => {
      return B.previousConnection
    }
  } else {
    return undefined
  }
  do {
    if (!(c8n = F(block)) ||
    !(c8n = c8n.targetConnection) ||
    !(block = c8n.getSourceBlock())) {
      return undefined
    }
    if (!block.eyo.isWhite()) {
      return c8n
    }
  } while (true)
}

/**
 * Connection.
 * @param {!Blockly.Connection} c8n
 */
eYo.ConnectionDelegate.prototype.connect = function(c8n) {
  if (c8n) {
    this.setIncog(false)
    this.connection.connect(c8n)
  }
}

/**
 * Set the origin of the connection.
 * When the connection is in a slot, the origin is the top left point
 * of the slot otherwise it is `(0, 0)`.
 * @param {number} c The column index.
 * @param {number} l The line index.
 */
eYo.ConnectionDelegate.prototype.setOffset = function(c = 0, l = 0) {
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
 * Path definition for an hilighted connection
 */
eYo.ConnectionDelegate.prototype.highlightPathDef = function () {
  var c8n = this.connection
  var block = c8n.sourceBlock_
  if (!block.workspace) {
    return ''
  }
  var steps = ''
  var c_eyo = c8n.eyo
  if (c_eyo.isInput) {
    if (c8n.isConnected()) {
      steps = c_eyo.t_eyo.valuePathDef_()
    } else if (!this.disabled_) {
      steps = eYo.Shape.definitionWithConnection(this, {absolute: true})
    }
  } else if (c_eyo.isOutput) {
    steps = block.eyo.valuePathDef_(c8n.offsetInBlock_)
  } else { // statement connection
    var r = eYo.Style.Path.Hilighted.width / 2
    var a = ` a ${r},${r} 0 0 1 0,`
    var w = block.width - eYo.Unit.x / 2
    if (this.isPrevious) {
      steps = `m ${w},${-r}${a}${2 * r} h ${-w + eYo.Unit.x - eYo.Padding.l}${a}${-2 * r} z`
    } else if (this.isNext) {
      if (block.eyo.size.height > eYo.Unit.y) { // this is not clean design
        steps = `m ${eYo.Font.tabWidth + eYo.Style.Path.r},${block.eyo.size.height - r}${a}${2 * r} h ${-eYo.Font.tabWidth - eYo.Style.Path.r + eYo.Unit.x - eYo.Padding.l}${a}${-2 * r} z`
      } else {
        steps = `m ${w},${block.eyo.size.height - r}${a}${2 * r} h ${-w + eYo.Unit.x - eYo.Padding.l}${a}${-2 * r} z`
      }
    } else /* if (this.isSuite) */ {
      steps = `m ${w},${-r + eYo.Unit.y}${a}${2 * r} h ${eYo.Font.tabWidth - w + eYo.Unit.x / 2}${a}${-2 * r} z`
    }
  }
  return steps
}

/**
 * Highlight the receiver's connection
 */
eYo.ConnectionDelegate.prototype.highlight = function () {
  var c8n = this.connection
  var block = c8n.sourceBlock_
  if (!block.workspace) {
    return
  }
  if (block.eyo.higlightConnection) {
    block.eyo.higlightConnection(c8n)
    return
  }
  var steps
  if (c8n.eyo.isInput) {
    if (c8n.isConnected()) {
      steps = c8n.targetBlock().eyo.valuePathDef_()
    } else {
      steps = eYo.Shape.definitionWithConnection(this)
      Blockly.Connection.highlightedPath_ =
      Blockly.utils.createSvgElement('path',
        {
          class: 'blocklyHighlightedConnectionPath',
          d: steps
        },
        block.getSvgRoot()
      )
      return
    }
  } else if (c8n.type === Blockly.OUTPUT_VALUE) {
    steps = block.eyo.valuePathDef_()
  } else {
    // this is a statement connection
    var w = block.width - eYo.Unit.x / 2
    if (block.eyo.inputSuite) {
      // this is a group
      if (block.eyo.suiteConnection === c8n) {
        w -= eYo.Font.tabWidth
      } else if (block.nextConnection === c8n) {
        w = eYo.Font.tabWidth + 2 * eYo.Shape.shared.stmt_radius
      }
    }
    var r = eYo.Style.Path.Hilighted.width / 2
    var a = ' a ' + r + ',' + r + ' 0 0 1 0,'
    steps = 'm ' + w + ',' + (-r) + a + (2 * r) + ' h ' + (-w + eYo.Unit.x - eYo.Padding.l) + a + (-2 * r) + ' z'
  }
  Blockly.Connection.highlightedPath_ =
  Blockly.utils.createSvgElement('path',
    {'class': 'blocklyHighlightedConnectionPath',
      'd': steps,
      transform: `translate(${this.x || 0}, ${this.y || 0})`},
    block.getSvgRoot())
}

/**
 * Class for a connection between blocks that may be rendered on screen.
 * @param {!Blockly.Block} source The block establishing this connection.
 * @param {number} type The type of the connection.
 * @extends {Blockly.Connection}
 * @constructor
 */
eYo.Connection = function (source, type) {
  eYo.Connection.superClass_.constructor.call(this, source, type)
  this.eyo = new eYo.ConnectionDelegate(this)
}
goog.inherits(eYo.Connection, Blockly.Connection)
eYo.Do.inherits(Blockly.RenderedConnection, eYo.Connection)

/**
 * Every connection has a delegate.
 */
eYo.Connection.prototype.eyo = undefined

/**
 * Add highlighting around this connection.
 */
Blockly.RenderedConnection.prototype.highlight = (() => {
  var highlight = Blockly.RenderedConnection.prototype.highlight
  return function () {
    if (this.eyo) {
      this.eyo.highlight()
      return
    }
    highlight.call(this)
  }  
}) ()

/**
 * Move the block(s) belonging to the connection to a point where they don't
 * visually interfere with the specified connection.
 * @param {!Blockly.Connection} staticConnection The connection to move away
 *     from.
 * @private
 * @suppress {accessControls}
 */
Blockly.RenderedConnection.prototype.bumpAwayFrom_ = function (staticConnection) {
  if (this.sourceBlock_.workspace.isDragging()) {
    // Don't move blocks around while the user is doing the same.
    return
  }
  // Move the root block.
  var rootBlock = this.sourceBlock_.getRootBlock()
  if (rootBlock.isInFlyout) {
    // Don't move blocks around in a flyout.
    return
  }
  var reverse = false
  if (!rootBlock.isMovable()) {
    // Can't bump an uneditable block away.
    // Check to see if the other block is movable.
    rootBlock = staticConnection.getSourceBlock().getRootBlock()
    if (!rootBlock.isMovable()) {
      return
    }
    // Swap the connections and move the 'static' connection instead.
    staticConnection = this
    reverse = true
  }
  // Raise it to the top for extra visibility.
  var selected = eYo.Selected.block === rootBlock
  selected || rootBlock.addSelect()
  var dx = (staticConnection.x_ + Blockly.SNAP_RADIUS) - this.x_
  var dy = (staticConnection.y_ + Blockly.SNAP_RADIUS) - this.y_
  if (reverse) {
    // When reversing a bump due to an uneditable block, bump up.
    dy = -dy
  }
  // Added by JL, I don't remember why...
  if (staticConnection.isConnected()) {
    dx += staticConnection.targetBlock().width
  }
  if (rootBlock.RTL) {
    dx = -dx
  }
  rootBlock.moveBy(dx, dy)
  selected || rootBlock.removeSelect()
}

/**
 * Check if the two connections can be dragged to connect to each other.
 * A sealed connection is never allowed.
 * @param {!Blockly.Connection} candidate A nearby connection to check.
 * @return {boolean} True if the connection is allowed, false otherwise.
 */
eYo.Connection.prototype.isConnectionAllowed = function (candidate) {
  if (this.eyo.wrapped_ || candidate.eyo.wrapped_) {
    return false
  }
  var yorn = eYo.Connection.superClass_.isConnectionAllowed.call(this,
    candidate)
  return yorn
}

/**
 * Change a connection's compatibility.
 * Edython: always use `onCheckChanged_`
 * @param {*} check Compatible value type or list of value types.
 *     Null if all types are compatible.
 * @return {!Blockly.Connection} The connection being modified
 *     (to allow chaining).
 */
eYo.Connection.prototype.setCheck = function(check) {
  if (check === eYo.T3.Stmt.Previous.try_else_part) {
    console.error('ERROR!!!!')
  }
  eYo.Connection.superClass_.setCheck.call(this, check)
  if (!check) {
    // This was not called on original Blockly
    this.onCheckChanged_()
  }
  return this
}

/**
 * The type checking mechanism is fine grained compared to blockly's.
 * The check_ is used more precisely.
 * For example, elif blocks cannot connect to the suite connection, only the next connection.
 * @param {!Blockly.Connection} otherConnection Connection to compare against.
 * @param {?Boolean} force  checks even if a connection is hidden or incog.
 * @return {boolean} True if the connections share a type.
 * @private
 * @suppress {accessControls}
 */
eYo.Connection.prototype.checkType_ = function (otherConnection, force) {
  if (!Blockly.Events.recordUndo) {
    // we are undoing or redoing
    // we will most certainly reach a state that was valid
    // some time ago
    return true
  }
  var c8nA = this.eyo.getBlackConnection()
  var c8nB = otherConnection.eyo.getBlackConnection()
  if (!c8nA || !c8nB) {
    return true
  }
  var sourceA = c8nA.getSourceBlock()
  var sourceB = c8nB.getSourceBlock()
  // short stop if one of the connection is hidden or disabled
  // except when we try to establish a connection with a wrapped block.
  // in either case, returns true iff the connetion is aready established
  if (c8nA.eyo.wrapped_) {
    if (c8nA.targetConnection) {
      return c8nA === c8nB.targetConnection
    }
  } else if (c8nB.eyo.wrapped_) {
    if (c8nB.targetConnection) {
      return c8nB === c8nA.targetConnection
    }
  } else if (!force && sourceA.eyo.isready && sourceB.eyo.isready && (c8nA.eyo.incog_ || c8nB.eyo.incog_ || c8nA.eyo.hidden_ || c8nB.eyo.hidden_)) { // the `force` argument may be useless now that there is a readiness test.
    return c8nA === c8nB.targetConnection
  }
  var typeA = sourceA.eyo.type // the block type is not up to date
  var typeB = sourceB.eyo.type // the block type is not up to date
  if (typeA.indexOf('eyo:') === 0 && typeB.indexOf('eyo:') === 0) {
    var checkA = c8nA.check_
    var checkB = c8nB.check_
    if (c8nA.eyo.name_) {
      // c8nA is the connection of an input
      if (sourceA.eyo.locked_) {
        return c8nA.targetConnection === c8nB
      }
      // connections are inline
      if (c8nA.eyo.isNextLike) {
        if (c8nB.eyo.isPrevious) {
          if (checkB) {
            // B cannot be a root statement
            return false
          }
          if (checkA && checkA.indexOf(typeB) < 0) {
            return false
          }
          return true
        }
        return false
      } else if (checkA) {
        if (checkB) {
          if (checkA.some(t => checkB.indexOf(t) >= 0)) {
            return true
          }
        } else if (checkA.indexOf(typeB) < 0) {
          return false
        } else {
          return true
        }
      }
      return !checkA || checkA.indexOf(typeB) >= 0 || checkA.indexOf(typeB + '.' + c8nB.name_) >= 0 || checkA.indexOf('.' + c8nB.name_) >= 0
    } /* if (c8nA.eyo.name_) */
    if (c8nB.eyo.name_) {
      // c8nB is the connection of an input
      if (sourceB.eyo.locked_) {
        return c8nA === c8nB.targetConnection
      }
      // connections are inline
      if (c8nB.eyo.isNextLike) {
        if (c8nA.eyo.isPrevious) {
          if (checkA) {
            // A cannot be a root statement
            return false
          }
          if (checkB && checkB.indexOf(typeA) < 0) {
            return false
          }
          return true
        }
        return false
      } else if (checkB) {
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
      return !checkB || checkB.indexOf(typeA) >= 0 || checkB.indexOf(typeA + '.' + c8nA.name_) >= 0 || checkB.indexOf('.' + c8nA.name_) >= 0
    } /* if (c8nB.eyo.name_) */
    if (checkA && checkA.indexOf(typeB) < 0) {
      return false
    }
    if (checkB && checkB.indexOf(typeA) < 0) {
      return false
    }
    return true
  }
  return eYo.Connection.superClass_.checkType_.call(this, otherConnection)
}

/**
 * Connect two connections together.  This is the connection on the superior
 * block.
 * Add hooks to allow customization.
 * @param {!Blockly.Connection} childC8n Connection on inferior block.
 * @private
 * @suppress {accessControls}
 */
Blockly.RenderedConnection.prototype.connect_ = (() => {
  // this is a closure
  var connect_ = Blockly.RenderedConnection.prototype.connect_
  return function (childC8n) {
    // `this` is actually the parentC8n
    var parentC8n = this
    var parent = parentC8n.sourceBlock_
    var child = childC8n.sourceBlock_
    var oldChildC8n = parentC8n.targetConnection
    var oldParentC8n = childC8n.targetConnection
    child.eyo.changeWrap( // the child will cascade changes to the parent
      () => {
        parentC8n.eyo.willConnect(childC8n)
        eYo.Do.tryFinally(() => {
          childC8n.eyo.willConnect(parentC8n)
          eYo.Do.tryFinally(() => {
            parent.eyo.willConnect(parentC8n, childC8n)
            eYo.Do.tryFinally(() => {
              child.eyo.willConnect(childC8n, parentC8n)
              eYo.Do.tryFinally(() => {
                child.initSvg() // too much
                connect_.call(parentC8n, childC8n)
                if (parentC8n.eyo.plugged_) {
                  child.eyo.plugged_ = parentC8n.eyo.plugged_
                }
                if (parentC8n.eyo.wrapped_) {
                  if (child.eyo.hasSelect()) {
                    child.unselect()
                    var P = parent.eyo.wrapper
                    if (P) {
                      P.block_.select()
                    }
                  }
                  child.eyo.makeBlockWrapped()
                } else {
                  // if this connection was selected, the newly connected block should be selected too
                  if (eYo.Selected.connection === parentC8n) {
                    P = parent.eyo
                    do {
                      if (P === eYo.Selected.eyo) {
                        child.select()
                        break
                      }
                    } while ((P = P.group))
                  }
                }
                if (oldChildC8n && childC8n !== oldChildC8n) {
                  var oldChild = oldChildC8n.sourceBlock_
                  if (oldChild) {
                    if (oldChild.eyo.wrapped_) {
                      if (Blockly.Events.recordUndo) {
                        oldChild.dispose(true)
                      }
                    } else if (!oldChildC8n.targetBlock()) {
                      // another chance to reconnect the orphan
                      // just in case the check_ has changed in between
                      // which might be the case for the else_part blocks
                      if (oldChildC8n.eyo.isOutput) {
                        var do_it = x => {
                          if (!x.isIncog || !x.isIncog()) {
                            var c8n, target
                            if ((c8n = x.connection)) {
                              if (c8n.eyo.hidden_ && !c8n.eyo.wrapped_) {
                                return
                              }
                              if ((target = c8n.targetBlock())) {
                                if (plug(target.eyo)) {
                                  return true
                                }
                              } else if (c8n.checkType_(oldChildC8n)) {
                                c8n.connect(oldChildC8n)
                                return true
                              }
                            }
                          }
                        }
                        var plug = (eyo) => {
                          return eyo instanceof eYo.DelegateSvg.List
                          ? eyo.someInput(do_it)
                          : eyo.someSlot(do_it)
                        }
                        plug(child.eyo)
                      } else {
                        P = child
                        var c8n
                        while ((c8n = P.nextConnection)) {
                          if ((P = c8n.targetBlock())) {
                            continue
                          } else if (c8n.checkType_(oldChildC8n)) {
                            c8n.connect(oldChildC8n)
                          }
                          break
                        }
                      }
                    }
                  }
                }
                if (eYo.Selected.connection === childC8n || eYo.Selected.connection === parentC8n) {
                  eYo.Selected.connection = null
                }
                child.eyo.setIncog(parentC8n.eyo.isIncog())
              }, () => { // finally
                !parentC8n.eyo.wrapped_ && parentC8n.eyo.bindField && parentC8n.eyo.bindField.setVisible(false)
                !childC8n.eyo.wrapped_ && childC8n.eyo.bindField && childC8n.eyo.bindField.setVisible(false) // unreachable ?
                if (parentC8n.eyo.startOfStatement) {
                  child.eyo.incrementChangeCount()
                }
                eYo.Connection.connectedParentC8n = parentC8n
                // next must absolutely run because of possible undo management
                child.eyo.didConnect(childC8n, oldParentC8n, oldChildC8n)
              })
            }, () => { // finally
              // next must absolutely run because of possible undo management
              parent.eyo.didConnect(parentC8n, oldChildC8n, oldParentC8n)
            })
          }, () => { // finally
            // next must absolutely run because of possible undo management
            parentC8n.eyo.didConnect(oldParentC8n, oldChildC8n)
          })
        }, () => { // finally
          childC8n.eyo.didConnect(oldChildC8n, oldParentC8n)
          eYo.Connection.connectedParentC8n = undefined
          if (parent.eyo.isReady) {
            child.eyo.beReady()
          }
        })
      }
    )
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
Blockly.RenderedConnection.prototype.disconnectInternal_ = function () {
  // Closure
  var disconnectInternal_ = Blockly.RenderedConnection.prototype.disconnectInternal_

  return function (parent, child) {
    var block = this.getSourceBlock()
    if (block === parent) {
      var parentC8n = this
      var childC8n = this.targetConnection
    } else {
      parentC8n = this.targetConnection
      childC8n = this
    }
    child.eyo.changeWrap(
      () => { // `this` is catched
        parent.eyo.wrapper.changeWrap( // the parent may be a wrapped block
          () => { // `this` is catched
            eYo.Do.tryFinally(() => {
              parentC8n.eyo.willDisconnect()
              eYo.Do.tryFinally(() => {
                childC8n.eyo.willDisconnect()
                eYo.Do.tryFinally(() => {
                  parent.eyo.willDisconnect(parentC8n)
                  eYo.Do.tryFinally(() => {
                    child.eyo.willDisconnect(childC8n)
                    eYo.Do.tryFinally(() => {
                      // the work starts here
                      if (parentC8n.eyo.wrapped_) {
                        // currently unwrapping a block,
                        // this occurs while removing the parent
                        // if the parent was selected, select the child
                        child.eyo.makeBlockUnwrapped_()
                        if (parent.eyo.hasSelect()) {
                          parent.unselect()
                          child.select()
                        }
                      }
                      disconnectInternal_.call(this, parent, child)
                      if (child.eyo.plugged_) {
                        child.eyo.plugged_ = undefined
                      }
                    }, () => { // finally
                      eYo.Connection.disconnectedParentC8n = parentC8n
                      eYo.Connection.disconnectedChildC8n = childC8n
                      eYo.Connection.disconnectedParentC8n = undefined
                      eYo.Connection.disconnectedChildC8n = undefined
                      parent.eyo.incrementInputChangeCount && parent.eyo.incrementInputChangeCount() // list are special
                      parentC8n.eyo.bindField && parentC8n.eyo.bindField.setVisible(true) // no wrapped test
                      childC8n.eyo.bindField && childC8n.eyo.bindField.setVisible(true) // unreachable ?
                    })
                  }, () => { // finally
                    child.eyo.didDisconnect(childC8n, parentC8n)
                  })
                }, () => { // finally
                  parent.eyo.didDisconnect(parentC8n, childC8n)
                })
              }, () => { // finally
                childC8n.eyo.didDisconnect(parentC8n)
              })
            }, () => { // finally
              parentC8n.eyo.didDisconnect(childC8n)
            })
          }
        )
      }
    )
  }
} ()

/**
 * Does the given block have one and only one connection point that will accept
 * an orphaned block?
 * Returns the first free connection that can accept the orphan
 *
 * @param {!Blockly.Block} block The superior block.
 * @param {!Blockly.Block} orphanBlock The inferior block.
 * @return {Blockly.Connection} The suitable connection point on 'block',
 *     or null.
 * @private
 * @override
 * @suppress {accessControls}
 */
Blockly.Connection.uniqueConnection_ = function (block, orphanBlock) {
  return block.eyo.someInputConnection((c8n) => {
    if (c8n.eyo.isInput &&
      orphanBlock.outputConnection.checkType_(c8n)) {
      if (!c8n.isConnected()) {
        return c8n
      }
    }
  }) || null
}

/**
 * Set whether this connections is hidden (not tracked in a database) or not.
 * The delegate's hidden_ property takes precedence over `hidden`parameter.
 * There is a timeout sent by blockly to show connections.
 * In fact we bypass the real method if the connection is not epected to show.
 * @param {boolean} hidden True if connection is hidden.
 */
Blockly.RenderedConnection.prototype.setHidden = (() => {
  // this is a closure
  var setHidden = Blockly.RenderedConnection.prototype.setHidden
  return function (hidden) {
    // ADDED by JL:
    if (!hidden && this.eyo.incog_) {
      // Incog connections must stay hidden
      return
    }
    if (goog.isDef(this.eyo.hidden_)) {
      hidden = this.eyo.hidden_
    }
    // DONE
    setHidden.call(this, hidden)
  }
}) ()

/**
 * Change the connection's coordinates.
 * @param {goog.math.Coordinate} x New absolute x coordinate, in workspace coordinates.
 * @param {goog.math.Coordinate} y New absolute y coordinate, in workspace coordinates.
 * @suppress {accessControls}
 */
Blockly.RenderedConnection.prototype.moveTo = function (x, y) {
  // ADDED by JL: do nothing when the connection did not move
  if (this.x_ !== x || this.y_ !== y || (!x && !y)) {
    // Remove it from its old location in the database (if already present)
    if (this.inDB_) {
      this.db_.removeConnection_(this)
    }
    this.x_ = x
    this.y_ = y
    // Insert it into its new location in the database.
    if (!this.hidden_) {
      this.db_.addConnection(this)
    }
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
 * @return {!{connection: ?Blockly.Connection, radius: number}} Contains two
 *     properties: 'connection' which is either another connection or null,
 *     and 'radius' which is the distance.
 * @suppress{accessControls}
 */
Blockly.RenderedConnection.prototype.closest = function (maxLimit, dxy, dy) {
  // BEGIN ADDENDUM by JL
  if (this.hidden_) {
    return {}
  }
  // END ADDENDUM by JL
  return this.dbOpposite_.searchForClosest(this, maxLimit, dxy)
}

/**
 * Returns the distance between this connection and another connection in
 * workspace units.
 * The computation takes into account the width of statement blocks.
 * @param {!Blockly.Connection} otherConnection The other connection to measure
 *     the distance to.
 * @return {number} The distance between connections, in workspace units.
 */
Blockly.RenderedConnection.prototype.distanceFrom = function(otherConnection) {
  var c8nA = this
  var c8nB = otherConnection
  var xDiff = c8nA.x_ - c8nB.x_
  var yDiff = c8nA.y_ - c8nB.y_
  if (c8nA.eyo.isInput) {
    yDiff += eYo.Padding.h
  } else if (c8nB.eyo.isInput) {
    yDiff -= eYo.Padding.h
  }
  return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
};

/**
 * Sever all links to this connection (not including from the source object).
 * @suppress{accessControls}
 */
Blockly.Connection.prototype.dispose = function () {
  // this is a closure
  var dispose = Blockly.Connection.prototype.dispose
  return function () {
    if (eYo.Selected.connection === this) {
      eYo.Selected.connection = null
    }
    dispose.call(this)
  }
} ()

/**
 * Function to be called when this connection's compatible types have changed.
 * @private
 */
Blockly.RenderedConnection.prototype.onCheckChanged_ = function() {
  // The new value type may not be compatible with the existing connection.
  if (this.isConnected() && !this.checkType_(this.targetConnection)) {
    var child = this.isSuperior() ? this.targetBlock() : this.sourceBlock_;
    child.unplug();
    // Bump away.
    this.sourceBlock_.bumpNeighbours_();
  }
};

/**
 * Function to be called when this connection's compatible types have changed.
 * @private
 * @suppress{accessControls}
 */
Blockly.RenderedConnection.prototype.onCheckChanged_ = function () {
  // this is a closure
  /** @suppress{accessControls} */
  var onCheckChanged_ = Blockly.RenderedConnection.prototype.onCheckChanged_
  return function () {
    onCheckChanged_.call(this)
    this.sourceBlock_.eyo.incrementChangeCount()
    var target = this.targetBlock()
    if (target) {
      target.eyo.incrementChangeCount() // there was once a `consolidate(false, true)` here.
    }
  }
} ()

/**
 * Does the given block have one and only one connection point that will accept
 * an orphaned block?
 * @param {!Blockly.Block} block The superior block.
 * @param {!Blockly.Block} orphanBlock The inferior block.
 * @return {Blockly.Connection} The suitable connection point on 'block',
 *     or null.
 * @private
 * @suppress{accessControls}
 */
Blockly.Connection.singleConnection_ = function (block, orphanBlock) {
  var connection = null
  for (var i = 0; i < block.inputList.length; i++) {
    var c8n = block.inputList[i].connection
    if (c8n && c8n.eyo.isInput &&
        orphanBlock.outputConnection.checkType_(c8n) && !c8n.eyo.bindField) {
      if (connection) {
        return null // More than one connection.
      }
      connection = c8n
    }
  }
  return connection
}

/**
 * Walks down a row a blocks, at each stage checking if there are any
 * connections that will accept the orphaned block.  If at any point there
 * are zero or multiple eligible connections, returns null.  Otherwise
 * returns the only input on the last block in the chain.
 * Terminates early for shadow blocks.
 * @param {!Blockly.Block} startBlock The block on which to start the search.
 * @param {!Blockly.Block} orphanBlock The block that is looking for a home.
 * @return {Blockly.Connection} The suitable connection point on the chain
 *    of blocks, or null.
 * @suppress{accessControls}
 * @private
 */
Blockly.Connection.lastConnectionInRow_ = function (startBlock, orphanBlock) {
  var newBlock = startBlock
  var connection
  while ((connection = Blockly.Connection.singleConnection_(
    /** @type {!Blockly.Block} */ (newBlock), orphanBlock)) && !connection.eyo.incog_) {
    // '=' is intentional in line above.
    newBlock = connection.targetBlock()
    if (!newBlock || newBlock.isShadow()) {
      return connection
    }
  }
  return null
}

/**
 * May be useful for `didConnect` and `didDisconnect` in models.
 */
eYo.ConnectionDelegate.prototype.consolidateSource = function () {
  var block = this.connection.getSourceBlock()
  block.eyo.consolidate()
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
    block.eyo.setOffset(-dc, -dl);
  }
};
Blockly.RenderedConnection.prototype.tighten_ = function() {
  var dx = this.targetConnection.x_ - this.x_;
  var dy = this.targetConnection.y_ - this.y_;
  if (dx != 0 || dy != 0) {
    var block = this.targetBlock();
    block.eyo.setOffset(-dx, -dy);
  }
};

/**
 * Returns the block that this connection connects to.
 * @return {Blockly.Block} The connected block or null if none is connected.
 */
eYo.Connection.prototype.targetBlock = function() {
  var target = eYo.Connection.superClass_.targetBlock.call(this)
  if (!target && this.eyo.wrapped_) {
    this.eyo.completeWrapped()
    target = eYo.Connection.superClass_.targetBlock.call(this)
  }
  return target
}

/**
 * Change a connection's compatibility.
 * @param {*} check Compatible value type or list of value types.
 *     Null if all types are compatible.
 * @return {!Blockly.Connection} The connection being modified
 *     (to allow chaining).
 */
Blockly.Connection.prototype.setCheck = function(check) {
  if (check) {
    // Ensure that check is in an array.
    if (!goog.isArray(check)) {
      check = [check];
    }
    this.check_ = check;
    this.onCheckChanged_();
  } else {
    this.check_ = null;
  }
  return this;
};
