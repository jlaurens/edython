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

goog.forwardDeclare('eYo.Magnet')
goog.forwardDeclare('eYo.Selected')

goog.require('Blockly.RenderedConnection')
goog.require('Blockly.Connection')

goog.require('eYo.Const')
goog.require('eYo.Do')
goog.require('eYo.Where')
goog.require('eYo.T3')

/**
 * Class for a connection between blocks that may be rendered on screen.
 * @param {!Blockly.Block} source The block establishing this connection.
 * @param {number} type The type of the connection.
 * @extends {Blockly.Connection}
 * @constructor
 */
eYo.Connection = function (source, type) {
  eYo.Connection.superClass_.constructor.call(this, source, type)
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
      this.eyo.ui.highlightConnection(this.eyo)
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
  this.eyo.bumpAwayFrom_(staticConnection.eyo)
}

Object.defineProperties(eYo.Connection.prototype, {
  check_: {
    get () {
      return this.eyo.check_
    },
    set (newValue) {
      this.eyo.check_ = newValue
    }
  },
  name_: {
    get () {
      return this.eyo.name_
    },
    set (newValue) {
      this.eyo.name_ = newValue
    }
  },
  x_: {
    get () {
      return this.eyo.x_
    },
    set (newValue) {
      this.eyo.x_ = newValue
    }
  },
  y_: {
    get () {
      return this.eyo.y_
    },
    set (newValue) {
      this.eyo.y_ = newValue
    }
  }
  // inDB_: {
  //   get () {
  //     return this.inDB__
  //   },
  //   set (newValue) {
  //     if (this.type === eYo.Magnet.RIGHT) {
  //       console.error('inDB_ =', newValue)
  //     }
  //     this.inDB__ = newValue
  //   }
  // }
})

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
  if (!eYo.Events.recordUndo) {
    // we are undoing or redoing
    // we will most certainly reach a state that was valid
    // some time ago
    return true
  }
  if (this.check_ && !this.check_.length) {
    return false
  }
  if (otherConnection.check_ && !otherConnection.check_.length) {
    return false
  }
  var m4tA = this.eyo.blackMagnet
  var m4tB = otherConnection.eyo.blackMagnet
  if (!m4tA || !m4tB) {
    return true
  }
  var dlgtA = m4tA.b_eyo
  var dlgtB = m4tB.b_eyo
  // short stop if one of the connection is hidden or disabled
  // except when we try to establish a connection with a wrapped block.
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
  var typeA = dlgtA.type // the block type is not up to date
  var typeB = dlgtB.type // the block type is not up to date
  var checkA = m4tA.check_
  var checkB = m4tB.check_
  if (m4tA.isInput) {
    // c8nA is the connection of an input
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
  } /* if (c8nA.eyo.name_) */
  if (m4tB.isInput) {
    // c8nB is the connection of an input
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
  } /* if (c8nB.eyo.name_) */
  if (checkA && checkA.indexOf(typeB) < 0) {
    return false
  }
  if (checkB && checkB.indexOf(typeA) < 0) {
    return false
  }
  return true
}

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
  var output = orphanBlock && orphanBlock.eyo.magnets.output
  return output && block.eyo.someInputMagnet(m4t => {
    if (m4t.isInput && output.checkType_(m4t)) {
      if (!m4t.target) {
        return m4t.connection
      }
    }
  }) || null
}

/**
 * Set whether this connections is hidden (not tracked in a database) or not.
 * The delegate's hidden_ property takes precedence over `hidden` parameter.
 * There is a timeout sent by blockly to show connections.
 * In fact we bypass the real method if the connection is not epected to show.
 * @param {boolean} hidden True if connection is hidden.
 */
Blockly.RenderedConnection.prototype.setHidden = function (hidden) {
  // ADDED by JL:
  if (!hidden && this.eyo.incog_) {
    // Incog connections must stay hidden
    return
  }
  this.hidden_ = hidden
}

Object.defineProperty(Blockly.RenderedConnection.prototype, 'hidden_', {
  get () {
    return this.eyo.hidden_
  },
  set (newValue) {
    this.eyo.hidden_ = newValue
  }
})
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
Blockly.Connection.prototype.dispose = (() => {
  // this is a closure
  var dispose = Blockly.Connection.prototype.dispose
  return function () {
    this.magnet.unselect()
    dispose.call(this)
  }
}) ()

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
  var foundM4t = null
  for (var i = 0; i < block.inputList.length; i++) {
    var m4t = block.inputList[i].eyo.magnet
    if (m4t && m4t.isInput &&
        orphanBlock.eyo.magnets.output.checkType_(m4t) && !m4t.bindField) {
      if (foundM4t) {
        return null // More than one connection.
      }
      foundM4t = m4t
    }
  }
  return foundM4t.connection
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
 * Returns the block that this connection connects to.
 * Creates the block when should wrapped.
 * @return {Blockly.Block} The connected block or null if none is connected.
 */
eYo.Connection.prototype.targetBlock = function() {
  var target = eYo.Connection.superClass_.targetBlock.call(this)
  if (!target && this.eyo.wrapped_) {
    this.eyo.completeWrap()
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
  this.eyo.check = check;
  return this;
}

/**
 * Does the connection belong to a superior block (higher in the source stack)?
 * @return {boolean} True if connection faces down or right.
 */
eYo.Connection.prototype.isSuperior = function() {
  return this.eyo.isSuperior
}
