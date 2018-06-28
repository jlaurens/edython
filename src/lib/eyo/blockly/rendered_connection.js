/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview Extends connections.
 * Insert a class between Blockly.Connection and Blockly.REnderedConnection
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.RenderedConnection')
goog.provide('eYo.ConnectionDelegate')

goog.forwardDeclare('eYo.SelectedConnection')

goog.require('Blockly.RenderedConnection')
goog.require('Blockly.Connection')

goog.require('eYo.Const')
goog.require('eYo.Do')
goog.require('eYo.T3')

/**
 * Class for a connection delegate.
 * @param {Blockly.Connection} connection the connection owning the delegate
 * @constructor
 */
eYo.ConnectionDelegate = function (connection) {
  this.connection = connection
}

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
  var target = this.connection.targetBlock()
  if (target) {
    target.eyo.beReady(target)
    target.eyo.parentDidChange(target, this.connection.getSourceBlock())
  }
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
 */
eYo.ConnectionDelegate.prototype.setIncog = function (incog) {
  if (this.incog_ && incog) {
    // things were unlikely to change since
    // the last time the connections have been disabled
    return
  }
  var c8n = this.connection
  if (incog || !this.wrapped_) {
    // We cannot enable wrapped connections
    this.incog_ = incog
    c8n.setHidden(incog)
  }
  var target = c8n.targetBlock()
  if (target) {
    target.eyo.setIncog(target, incog)
  }
}

/**
 * Will connect.
 * Forwards to the model.
 * @param {Blockly.Connection} connection the connection owning the delegate
 * @param {Blockly.Connection} targetConnection
 */
eYo.ConnectionDelegate.prototype.willConnect = function (targetConnection) {
  this.model && goog.isFunction(this.model.willConnect) && this.model.willConnect.call(this.connection, targetConnection)
}

/**
 * Did connect.
 * Default implementation does nothing.
 * This can be overriden at block creation time.
 * @param {Blockly.Connection} oldTargetConnection
 *     what was previously connected to connection
 * @param {Blockly.Connection} targetOldConnection
 *     what was previously connected to the actual connection.targetConnection
 */
eYo.ConnectionDelegate.prototype.didConnect = function (oldTargetConnection, targetOldConnection) {
  this.model && goog.isFunction(this.model.didConnect) && this.model.didConnect.call(this.connection, oldTargetConnection, targetOldConnection)
}

/**
 * Will connect.
 * Default implementation does nothing.
 * This can be overriden at block creation time.
 */
eYo.ConnectionDelegate.prototype.willDisconnect = function () {
  this.model && goog.isFunction(this.model.willDisconnect) && this.model.willDisconnect.call(this.connection)
}

/**
 * Did disconnect.
 * Default implementation does nothing.
 * This can be overriden at block creation time.
 * @param {Blockly.Connection} connection  the connection owning the delegate
 * @param {Blockly.Connection} oldTargetConnection  what was previously connected to connection
 */
eYo.ConnectionDelegate.prototype.didDisconnect = function (oldTargetConnection) {
  this.model && goog.isFunction(this.model.didDisconnect) && this.model.didDisconnect.call(this.connection, oldTargetConnection)
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
 * Is it a next connection.
 * @return {boolean} True if the connection is the block's next one.
 * @private
 */
eYo.ConnectionDelegate.prototype.isNext = function () {
  return this.connection === this.connection.getSourceBlock().nextConnection
}

/**
 * Is it a next connection.
 * @return {boolean} True if the connection is the block's previous one.
 * @private
 */
eYo.ConnectionDelegate.prototype.isPrevious = function () {
  return this.connection === this.connection.getSourceBlock().previousConnection
}

/**
 * Get the connection of the same kind on the block above.
 * If the connection is named, returns the connection,
 * whatever its source block status may be.
 * @return a connection, possibly undefined
 */
eYo.ConnectionDelegate.prototype.getConnectionAbove = function () {
  var previous = this.connection.getSourceBlock().previousConnection
  if (previous && !previous.eyo.name_ && (previous = previous.targetBlock())) {
    switch (this.connection.type) {
    case Blockly.NEXT_STATEMENT: return previous.nextConnection
    case Blockly.PREVIOUS_STATEMENT: return previous.previousConnection
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
 * @param F optional function defaults to !argument.eyo.isWhite(argument)
 * @return a connection, possibly undefined
 */
eYo.ConnectionDelegate.prototype.getBlackConnection = function (F) {
  F = F || function (block) {
    return !block.eyo.isWhite(block)
  }
  var c8n = this.connection
  var block = c8n.getSourceBlock()
  if (F(block)) {
    return c8n
  }
  if (this.isPrevious()) {
    var otherConnection = function (block) {
      return block.nextConnection
    }
  } else if (this.isNext()) {
    otherConnection = function (block) {
      return block.previousConnection
    }
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
  if (!block.eyo.isWhite(block)) {
    return c8n
  }
  if (c8n.eyo.isPrevious()) {
    var F = function (block) {
      return block.nextConnection
    }
  } else if (c8n.eyo.isNext()) {
    F = function (block) {
      return block.previousConnection
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
    if (!block.eyo.isWhite(block)) {
      return c8n
    }
  } while (true)
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

eYo.Connection.prototype.highlight = Blockly.RenderedConnection.prototype.highlight

/**
 * Every connection has a delegate.
 */
eYo.Connection.prototype.eyo = undefined

/**
 * Add highlighting around this connection.
 * @suppress {accessControls}
 */
Blockly.RenderedConnection.prototype.highlight = function () {
  var block = this.getSourceBlock()
  if (block && block.eyo) {
    block.eyo.highlightConnection(block, this)
    return
  }
  Blockly.RenderedConnection.superClass_.highlight.call(this)
}

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
  var selected = Blockly.selected === rootBlock
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
 * The type checking mechanism is fine grained compared to blockly's.
 * The check_ is used more precisely.
 * For example, elif blocks cannot connect to the suite connection, only the next connection.
 * @param {!Blockly.Connection} otherConnection Connection to compare against.
 * @return {boolean} True if the connections share a type.
 * @private
 * @suppress {accessControls}
 */
eYo.Connection.prototype.checkType_ = function (otherConnection) {
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
  } else if (c8nA.eyo.incog_ || c8nB.eyo.incog_ || c8nA.eyo.hidden_ || c8nB.eyo.hidden_) {
    return c8nA === c8nB.targetConnection
  }
  var sourceA = c8nA.getSourceBlock()
  var sourceB = c8nB.getSourceBlock()
  var typeA = sourceA.type
  var typeB = sourceB.type
  if (typeA.indexOf('eyo:') === 0 && typeB.indexOf('eyo:') === 0) {
    var checkA = c8nA.check_
    var checkB = c8nB.check_
    if (c8nA.eyo.name_) {
      // c8nA is the connection of an input
      if (sourceA.eyo.locked_) {
        return c8nA.targetConnection === c8nB
      }
      // connections are inline
      if (c8nA.type === Blockly.NEXT_STATEMENT) {
        if (c8nB.type === Blockly.PREVIOUS_STATEMENT) {
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
          for (var i = 0, t; (t = checkA[i++]);) {
            if (checkB.indexOf(t) >= 0) {
              return true
            }
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
      if (c8nB.type === Blockly.NEXT_STATEMENT) {
        if (c8nA.type === Blockly.PREVIOUS_STATEMENT) {
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
          for (i = 0; (t = checkB[i++]);) {
            if (checkA.indexOf(t) >= 0) {
              return true
            }
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
 * block.  Rerender blocks as needed.
 * @param {!Blockly.Connection} childConnection Connection on inferior block.
 * @private
 */
Blockly.RenderedConnection.prototype.connect_ = function(childConnection) {
  Blockly.RenderedConnection.superClass_.connect_.call(this, childConnection);

  var parentConnection = this;
  var parentBlock = parentConnection.getSourceBlock();
  var childBlock = childConnection.getSourceBlock();

  if (parentBlock.rendered) {
    parentBlock.updateDisabled();
  }
  if (childBlock.rendered) {
    childBlock.updateDisabled();
  }
  if (parentBlock.rendered && childBlock.rendered) {
    if (parentConnection.type == Blockly.NEXT_STATEMENT ||
        parentConnection.type == Blockly.PREVIOUS_STATEMENT) {
      // Child block may need to square off its corners if it is in a stack.
      // Rendering a child will render its parent.
      childBlock.render();
    } else {
      // Child block does not change shape.  Rendering the parent node will
      // move its connected children into position.
      parentBlock.render();
    }
  }
};

/**
 * Connect two connections together.  This is the connection on the superior
 * block.
 * Add hooks to allow customization.
 * @param {!Blockly.Connection} childC8n Connection on inferior block.
 * @private
 * @suppress {accessControls}
 */
eYo.Connection.saved_connect_ = Blockly.RenderedConnection.prototype.connect_
Blockly.RenderedConnection.prototype.connect_ = function (childC8n) {
  // `this` is actually the parentC8n
  var parentC8n = this
  var parent = parentC8n.sourceBlock_
  var child = childC8n.sourceBlock_
  parent.eyo.skipRendering()
  child.eyo.skipRendering()
  try {
    var oldChildC8n = parentC8n.targetConnection
    var oldParentC8n = childC8n.targetConnection
    parentC8n.eyo.willConnect(childC8n)
    childC8n.eyo.willConnect(parentC8n)
    parent.eyo.willConnect(parent, parentC8n, childC8n)
    child.eyo.willConnect(child, childC8n, parentC8n)
    eYo.Connection.saved_connect_.call(parentC8n, childC8n)
    if (parentC8n.eyo.plugged_) {
      child.eyo.plugged_ = parentC8n.eyo.plugged_
    }
    if (parentC8n.eyo.wrapped_) {
      if (child.eyo.hasSelect(child)) { // Blockly.selected === child
        child.unselect()
        var P = child
        while ((P = P.getSurroundParent())) {
          if (!P.eyo.wrapped_) {
            P.select()
            break
          }
        }
      }
      child.eyo.makeBlockWrapped_(child)
    } else {
      // if this connection was selected, the newly connected block should be selected too
      if (parentC8n === eYo.SelectedConnection.get()) {
        P = parent
        do {
          if (P === Blockly.selected) {
            child.select()
            break
          }
        } while ((P = P.getSurroundParent()))
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
          P = child
          var c8n
          while ((c8n = P.nextConnection)) {
            if (!c8n.targetConnection) {
              if (c8n.checkType_(oldChildC8n)) {
                c8n.connect(oldChildC8n)
              }
              break
            }
          }
        }
      }
    }
    childC8n.eyo.didConnect(oldChildC8n, oldParentC8n)
    parentC8n.eyo.didConnect(oldParentC8n, oldChildC8n)
    var c8n = eYo.SelectedConnection.get()
    parentC8n.eyo.didConnect(oldParentC8n, oldChildC8n)
    if (c8n === childC8n || c8n === parentC8n) {
      eYo.SelectedConnection.set(null)
    }
    parent.eyo.didConnect(parent, parentC8n, oldChildC8n, oldParentC8n)
    child.eyo.didConnect(child, childC8n, oldParentC8n, oldChildC8n)
    child.eyo.setIncog(child, parentC8n.eyo.isIncog())
  } catch (err) {
    console.error(err)
    throw err
  } finally {
    parent.eyo.unskipRendering()
    child.eyo.unskipRendering()
    try {
      eYo.Connection.connectedParentC8n = parentC8n
      child.render() // bubble
    } catch (err) {
      console.error(err)
      throw err
    } finally {
      eYo.Connection.connectedParentC8n = undefined
    }
  }
}

/**
 * Disconnect two blocks that are connected by this connection.
 * Add hooks to allow customization.
 * @param {!Blockly.Block} parentBlock The superior block.
 * @param {!Blockly.Block} childBlock The inferior block.
 * @private
 * @suppress {accessControls}
 */
eYo.Connection.saved_disconnectInternal_ = Blockly.RenderedConnection.prototype.disconnectInternal_
Blockly.RenderedConnection.prototype.disconnectInternal_ = function (parentBlock,
  childBlock) {
  var block = this.getSourceBlock()
  if (block === parentBlock) {
    var parentC8n = this
    var childC8n = this.targetConnection
  } else {
    parentC8n = this.targetConnection
    childC8n = this
  }
  try {
    parentBlock.eyo.skipRendering()
    childBlock.eyo.skipRendering()
    parentC8n.eyo.willDisconnect()
    childC8n.eyo.willDisconnect()
    parentBlock.eyo.willDisconnect(parentBlock, parentC8n)
    childBlock.eyo.willDisconnect(childBlock, childC8n)
    if (parentC8n.eyo.wrapped_) {
      // currently unwrapping a block,
      // this occurs while removing the parent
      // if the parent was selected, select the child
      childBlock.eyo.makeBlockUnwrapped_(childBlock)
      if (parentBlock.eyo.hasSelect(parentBlock)) {
        parentBlock.unselect()
        childBlock.select()
      }
    }
    eYo.Connection.saved_disconnectInternal_.call(this, parentBlock, childBlock)
    if (childBlock.eyo.plugged_) {
      childBlock.eyo.plugged_ = undefined
    }
    parentBlock.eyo.didDisconnect(parentBlock, parentC8n, childC8n)
    childBlock.eyo.didDisconnect(childBlock, childC8n, parentC8n)
    parentC8n.eyo.didDisconnect(childC8n)
    childC8n.eyo.didDisconnect(parentC8n)
    parentBlock.eyo.consolidate(parentBlock, true) // update all connections, possibly deleting parentC8n !
  } catch (err) {
    console.error(err)
    throw err
  } finally {
    parentBlock.eyo.unskipRendering()
    childBlock.eyo.unskipRendering()
    eYo.Connection.disconnectedParentC8n = parentC8n
    eYo.Connection.disconnectedChildC8n = childC8n
    try {
      parentBlock.rendered && parentBlock.render()
      if (childBlock.rendered) {
        childBlock.updateDisabled();
        childBlock.render()
      }
    } catch (err) {
      console.error(err)
      throw err
    } finally {
      eYo.Connection.disconnectedParentC8n = undefined
      eYo.Connection.disconnectedChildC8n = undefined
    }
  }
}

Blockly.Connection.uniqueConnection_original = Blockly.Connection.uniqueConnection_

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
  var e8r = block.eyo.inputEnumerator(block)
  while (e8r.next()) {
    var c8n = e8r.here.connection
    if (c8n && c8n.type === Blockly.INPUT_VALUE &&
        orphanBlock.outputConnection.checkType_(c8n)) {
      if (!c8n.isConnected()) {
        return c8n
      }
    }
  }
  return null
}

eYo.RenderedConnection.savedSetHidden = Blockly.RenderedConnection.prototype.setHidden

/**
 * Set whether this connections is hidden (not tracked in a database) or not.
 * The delegate's hidden_ property takes precedence over `hidden`parameter.
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
  if (goog.isDef(this.eyo.hidden_)) {
    hidden = this.eyo.hidden_
  }
  // DONE
  eYo.RenderedConnection.savedSetHidden.call(this, hidden)
}

/**
 * Change the connection's coordinates.
 * @param {goog.math.Coordinate} x New absolute x coordinate, in workspace coordinates.
 * @param {goog.math.Coordinate} y New absolute y coordinate, in workspace coordinates.
 * @suppress {accessControls}
 */
Blockly.RenderedConnection.prototype.moveTo = function (x, y) {
  // ADDED by JL: do nothing when the connection did not move
  if (this.x_ !== x || this.y_ !== y) {
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
  if (c8nA.type === Blockly.INPUT_VALUE) {
    yDiff += eYo.Padding.h()
  } else if (c8nB.type === Blockly.INPUT_VALUE) {
    yDiff -= eYo.Padding.h()
  }
  return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
};

eYo.RenderedConnection.savedDispose = Blockly.Connection.prototype.dispose
/**
 * Sever all links to this connection (not including from the source object).
 * @suppress{accessControls}
 */
Blockly.Connection.prototype.dispose = function () {
  if (this === eYo.SelectedConnection.get()) {
    eYo.SelectedConnection.set(null)
  }
  eYo.RenderedConnection.savedDispose.call(this)
}
/** @suppress{accessControls} */
eYo.RenderedConnection.onCheckChanged_ = Blockly.RenderedConnection.prototype.onCheckChanged_
/**
 * Function to be called when this connection's compatible types have changed.
 * @private
 * @suppress{accessControls}
 */
Blockly.RenderedConnection.prototype.onCheckChanged_ = function () {
  eYo.RenderedConnection.onCheckChanged_.call(this)
  var block = this.targetBlock()
  if (block) {
    block.eyo.consolidate(block, false, true)
  }
}

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
    var thisConnection = block.inputList[i].connection
    if (thisConnection && thisConnection.type === Blockly.INPUT_VALUE &&
        orphanBlock.outputConnection.checkType_(thisConnection)) {
      if (connection) {
        return null // More than one connection.
      }
      connection = thisConnection
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
 * Walks down a row a blocks, at each stage
 */
eYo.ConnectionDelegate.prototype.consolidateSource = function () {
  var block = this.connection.getSourceBlock()
  block.eyo.consolidate(block)
}

/**
 * Move the blocks on either side of this connection right next to each other.
 * Delegates the translate process to the block
 * @private
 */
Blockly.RenderedConnection.prototype.tighten_ = function() {
  var dx = this.targetConnection.x_ - this.x_;
  var dy = this.targetConnection.y_ - this.y_;
  if (dx != 0 || dy != 0) {
    var block = this.targetBlock();
    block.eyo.setOffset(block, -dx, -dy);
  }
};
