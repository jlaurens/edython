/**
 * ezPython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview Extends connections.
 * Insert a class between Blockly.Connection and Blockly.REnderedConnection
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('ezP.RenderedConnection')

goog.require('Blockly.RenderedConnection')
goog.require('Blockly.Connection')

goog.require('ezP.Const')
goog.require('ezP.T3')

/**
 * Class for a connection delegate.
 * @param {Blockly.Connection} connection the connection owning the delegate
 * @constructor
 */
ezP.ConnectionDelegate = function (connection) {
  this.connection = connection
}

/**
 * Whether the connection is a separator.
 * Used in lists.
 * @constructor
 */
ezP.ConnectionDelegate.prototype.plugged_ = undefined

/**
 * Whether the connection is a separator.
 * Used in lists.
 * @constructor
 */
ezP.ConnectionDelegate.prototype.s7r_ = false

/**
 * Whether the connection is a wrapper.
 * @constructor
 */
ezP.ConnectionDelegate.prototype.wrapped_ = false// must change to wrapper

/**
 * Whether the connection is otionally connected.
 * @constructor
 */
ezP.ConnectionDelegate.prototype.optional_ = false// must change to wrapper

/**
 * name of the connection.
 * See identifier
 * @constructor
 */
ezP.ConnectionDelegate.prototype.name_ = undefined// must change to wrapper

/**
 * Will connect.
 * Forwards to the model.
 * @param {Blockly.Connection} connection the connection owning the delegate
 * @param {Blockly.Connection} targetConnection
 */
ezP.ConnectionDelegate.prototype.willConnect = function(targetConnection) {
  goog.isFunction(this.model.willConnect) && this.model.willConnect.call(this.connection, targetConnection)
}

/**
 * Did connect.
 * Default implementation does nothing.
 * This can be overriden at block creation time.
 * @param {Blockly.Connection} oldTargetConnection  what was previously connected to connection
 * @param {Blockly.Connection} oldConnection  what was previously connected to the actual connection.targetConnection
 */
ezP.ConnectionDelegate.prototype.didConnect = function(oldTargetConnection, targetOldConnection) {
  goog.isFunction(this.model.didConnect) && this.model.didConnect.call(this.connection, oldTargetConnection, targetOldConnection)
}

/**
 * Will connect.
 * Default implementation does nothing.
 * This can be overriden at block creation time.
 */
ezP.ConnectionDelegate.prototype.willDisconnect = function() {
  goog.isFunction(this.model.willDisconnect) && this.model.willDisconnect.call(this.connection)
}

/**
 * Did disconnect.
 * Default implementation does nothing.
 * This can be overriden at block creation time.
 * @param {Blockly.Connection} connection  the connection owning the delegate
 * @param {Blockly.Connection} oldTargetConnection  what was previously connected to connection
 */
ezP.ConnectionDelegate.prototype.didDisconnect = function(oldTargetConnection) {
  goog.isFunction(this.model.didDisconnect) && this.model.didDisconnect.call(this.connection, oldTargetConnection)
}

/**
 * get the check_ array. This is a dynamic method.
 * The default implementation just returns the connection's check_.
 * @return the connection's check_ array.
 */
ezP.ConnectionDelegate.prototype.getCheck = function() {
  return this.connection.check_
}

/**
 * Is it a next connection.
 * @param {!Blockly.Connection} otherConnection Connection to compare against.
 * @return {boolean} True if the connection is the block's next one.
 * @private
 */
ezP.ConnectionDelegate.prototype.isNext = function() {
  return this.connection === this.connection.getSourceBlock().nextConnection
}

/**
 * Is it a next connection.
 * @param {!Blockly.Connection} otherConnection Connection to compare against.
 * @return {boolean} True if the connection is the block's previous one.
 * @private
 */
ezP.ConnectionDelegate.prototype.isPrevious = function() {
  return this.connection === this.connection.getSourceBlock().previousConnection
}

/**
 * Get the connection of the same kind on the block above.
 * If the connection is named, returns the connection,
 * whatever its source block status may be.
 * @return a connection, possibly undefined
 */
ezP.ConnectionDelegate.prototype.getConnectionAbove = function() {
  var previous = this.connection.getSourceBlock().previousConnection
  if (previous && !previous.ezp.name_ && (previous = previous.targetBlock())) {
    switch(this.connection.type) {
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
 * @param F optional function defaults to !argument.ezp.isWhite(argument)
 * @return a connection, possibly undefined
 */
ezP.ConnectionDelegate.prototype.getConnectionBelow = function() {
  var next = this.connection.getSourceBlock().nextConnection
  if (next && (next = next.targetBlock())) {
    switch(this.connection.type) {
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
 * @param F optional function defaults to !argument.ezp.isWhite(argument)
 * @return a connection, possibly undefined
 */
ezP.ConnectionDelegate.prototype.getBlackConnection = function(F) {
  var F = F || function(block) {
    return !block.ezp.isWhite(block)
  }
  var c8n = this.connection
  var block = c8n.getSourceBlock()
  if (F(block)) {
    return c8n
  }
  if (this.isPrevious()) {
    var otherConnection = function(block) {
      return block.nextConnection
    }
  } else if (this.isNext()) {
    var otherConnection = function(block) {
      return block.previousConnection
    }
  } else {
    // this is a 'do' statement input connection
    // whether the surrounding block is disabled or not has no importance
    return c8n
  }
  while ((c8n = otherConnection(block)) && (c8n = c8n.targetConnection) && !(c8n.ezp.name_) && !((block = c8n.getSourceBlock()) && F(block))) {}
  return c8n
}

/**
 * Return the black target connection.
 * Traverses the white blocks
 * @param {!Blockly.Connection} otherConnection Connection to compare against.
 * @return {boolean} True if the connection is the block's next one.
 * @private
 */
ezP.ConnectionDelegate.prototype.getBlackTargetConnection = function() {
  var c8n = this.connection.targetConnection
  if (!c8n) {
    return undefined
  }
  var block = c8n.getSourceBlock()
  if (!block.ezp.isWhite(block)) {
    return c8n
  }
  if (c8n.ezp.isPrevious()) {
    var F = function(block) {
      return block.nextConnection
    }
  } else if (c8n.ezp.isNext()) {
    var F = function(block) {
      return block.previousConnection
    }
  } else {
    return undefined
  }
  do {
    if (!(c8n = F(block))
    || !(c8n = c8n.targetConnection)
    || !(block = c8n.getSourceBlock())) {
      return undefined
    }
    if (!block.ezp.isWhite(block)) {
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
ezP.Connection = function (source, type) {
  ezP.Connection.superClass_.constructor.call(this, source, type)
  this.ezp = new ezP.ConnectionDelegate(this)
}
goog.inherits(ezP.Connection, Blockly.Connection)
ezP.inherits(Blockly.RenderedConnection, ezP.Connection)

ezP.Connection.prototype.highlight = Blockly.RenderedConnection.prototype.highlight

/**
 * Every connection has a delegate.
 */
ezP.Connection.prototype.ezp = undefined

/**
 * Add highlighting around this connection.
 */
Blockly.RenderedConnection.prototype.highlight = function () {
  var block = this.sourceBlock_
  if (block && block.ezp) {
    block.ezp.highlightConnection(block, this)
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
 * @param {number} maxRadius The maximum radius allowed for connections, in
 *     workspace units.
 * @return {boolean} True if the connection is allowed, false otherwise.
 */
ezP.Connection.prototype.isConnectionAllowed = function(candidate,
  maxRadius) {
  if (this.ezp.wrapped_ || candidate.ezp.wrapped_) {
    return false
  }
  var yorn = ezP.Connection.superClass_.isConnectionAllowed.call(this,
  candidate)
  if (yorn) {
    ezP.Connection.superClass_.isConnectionAllowed.call(this,
      candidate)
  }
  return yorn
}

/**
 * The type checking mechanism is fine grained compared to blockly's.
 * The check_ is used more precisely.
 * For example, elif blocks cannot connect to the suite connection, only the next connection.
 * @param {!Blockly.Connection} otherConnection Connection to compare against.
 * @return {boolean} True if the connections share a type.
 * @private
 */
ezP.Connection.prototype.checkType_ = function(otherConnection) {
  if (!Blockly.Events.recordUndo) {
    // we are undoing or redoing
    // we will most certainly reach a state that was valid
    // some time ago
    return true
  }
  var c8nA = this.ezp.getBlackConnection()
  var c8nB = otherConnection.ezp.getBlackConnection()
  if (!c8nA || !c8nB) {
    return true
  }
  // short stop if one of the connection is hidden or disabled
  // except when we try to establish a connection with a wrapped block.
  // in either case, returns true iff the connetion is aready established
  if (c8nA.ezp.wrapped_) {
    if (c8nA.targetConnection) {
      return c8nA === c8nB.targetConnection
    }
  } else if (c8nB.ezp.wrapped_) {
    if (c8nB.targetConnection) {
      return c8nB === c8nA.targetConnection
    }
  } else if (c8nA.ezp.disabled_ || c8nB.ezp.disabled_ || c8nA.ezp.hidden_ || c8nB.ezp.hidden_) {
    return c8nA === c8nB.targetConnection
  }
  var sourceA = c8nA.getSourceBlock()
  var sourceB = c8nB.getSourceBlock()
  var typeA = sourceA.type
  var typeB = sourceB.type
  if (typeA.indexOf('ezp:') === 0 && typeB.indexOf('ezp:') === 0) {
    var checkA = c8nA.check_
    var checkB = c8nB.check_
    if (c8nA.ezp.name_) {
      // c8nA is the connection of an input
      if (sourceA.ezp.locked_) {
        return false
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
          for (var i = 0, t;(t = checkA[i++]);) {
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
      return !checkA || checkA.indexOf(typeB)>=0 || checkA.indexOf(typeB+'.'+c8nB.name_)>=0 || checkA.indexOf('.'+c8nB.name_)>=0
    } /* if (c8nA.ezp.name_) */
    if (c8nB.ezp.name_) {
      // c8nB is the connection of an input
      if (sourceB.ezp.locked_) {
        return false
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
          for (var i = 0, t;(t = checkB[i++]);) {
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
      return !checkB || checkB.indexOf(typeA)>=0 || checkB.indexOf(typeA+'.'+c8nA.name_)>=0 || checkB.indexOf('.'+c8nA.name_)>=0
    } /* if (c8nB.ezp.name_) */
    if (checkA && checkA.indexOf(typeB)<0) {
      return false
    }
    if (checkB && checkB.indexOf(typeA)<0) {
      return false
    }
    return true
  }
  return ezP.Connection.superClass_.checkType_.call(this, otherConnection)
}

/**
 * Connect two connections together.  This is the connection on the superior
 * block.
 * Add hooks to allow customization.
 * @param {!Blockly.Connection} childConnection Connection on inferior block.
 * @private
 */
ezP.Connection.prototype.connect_ = function(childC8n) {
  // `this` is actually the parentC8n
  var parentC8n = this
  var parent = parentC8n.sourceBlock_
  var child = childC8n.sourceBlock_
  var oldChildC8n = parentC8n.targetConnection
  var oldParentC8n = childC8n.targetConnection
  parentC8n.ezp.willConnect(childC8n)
  childC8n.ezp.willConnect(parentC8n)
  parent.ezp.willConnect(parent, parentC8n, childC8n)
  child.ezp.willConnect(child, childC8n, parentC8n)
  ezP.Connection.superClass_.connect_.call(parentC8n, childC8n)
  if (parentC8n.ezp.plugged_) {
    child.ezp.plugged_ = parentC8n.ezp.plugged_
    console.log('plugged_ is', child.ezp.plugged_)
  }
  if (parentC8n.ezp.wrapped_) {
    if (child.ezp.hasSelect(child)) { // Blockly.selected === child
      child.unselect()
      var P = child
      while ((P = P.getSurroundParent())) {
        if (!P.ezp.wrapped_) {
          P.select()
          break
        }
      }
    }
    child.ezp.makeBlockWrapped_(child)
  } else {
    // if this connection was selected, the newly connected block should be selected too
    if (parentC8n === ezP.SelectedConnection.get()) {
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
      if (oldChild.ezp.wrapped_) {
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
  childC8n.ezp.didConnect(oldChildC8n, oldParentC8n)
  parentC8n.ezp.didConnect(oldParentC8n, oldChildC8n)
  parent.ezp.didConnect(parent, parentC8n, oldChildC8n, oldParentC8n)
  child.ezp.didConnect(child, childC8n, oldParentC8n, oldChildC8n)
}

/**
 * Disconnect two blocks that are connected by this connection.
 * Add hooks to allow customization.
 * @param {!Blockly.Block} parentBlock The superior block.
 * @param {!Blockly.Block} childBlock The inferior block.
 * @private
 */
ezP.Connection.prototype.disconnectInternal_ = function(parentBlock,
  childBlock) {
  var block = this.sourceBlock_
  if (block === parentBlock) {
    var parentC8n = this
    var childC8n = this.targetConnection
  } else {
    var parentC8n = this.targetConnection
    var childC8n = this
  }
  parentC8n.ezp.willDisconnect()
  childC8n.ezp.willDisconnect()
  parentBlock.ezp.willDisconnect(parentBlock, parentC8n)
  childBlock.ezp.willDisconnect(childBlock, childC8n)
  if (parentC8n.ezp.wrapped_) {
    // currently unwrapping a block,
    // this occurs while removing the parent
    // if the parent was selected, select the child
    childBlock.ezp.makeBlockUnwrapped_(childBlock)
    if(parentBlock.ezp.hasSelect(parentBlock)) {
      parentBlock.unselect()
      childBlock.select()
    }
  }
  ezP.Connection.superClass_.disconnectInternal_.call(this, parentBlock, childBlock)
  if (childBlock.ezp.plugged_) {
    console.log('plugged_ was', childBlock.ezp.plugged_)
    childBlock.ezp.plugged_ = undefined
  }
  parentBlock.ezp.didDisconnect(parentBlock, parentC8n, childC8n)
  childBlock.ezp.didDisconnect(childBlock, childC8n, parentC8n)
  parentC8n.ezp.didDisconnect(childC8n)
  childC8n.ezp.didDisconnect(parentC8n)
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
 */
Blockly.Connection.uniqueConnection_ = function(block, orphanBlock) {
  var e8r = block.ezp.inputEnumerator(block)
  while (e8r.next()) {
    var c8n = e8r.here.connection;
    if (c8n && c8n.type == Blockly.INPUT_VALUE &&
        orphanBlock.outputConnection.checkType_(c8n)) {
      if (!c8n.isConnected()) {
        return c8n;
      }
    }
  }
  return null;
}

ezP.RenderedConnection.savedSetHidden = Blockly.RenderedConnection.prototype.setHidden

/**
 * Set whether this connections is hidden (not tracked in a database) or not.
 * The delegate's hidden_ property takes precedence over `hidden`parameter.
 * @param {boolean} hidden True if connection is hidden.
 */
Blockly.RenderedConnection.prototype.setHidden = function(hidden) {
  // ADDED by JL: 
  if (goog.isDef(this.ezp.hidden_)) {
    hidden = this.ezp.hidden_
  }
  // DONE
  ezP.RenderedConnection.savedSetHidden.call(this, hidden)
}

/**
 * Change the connection's coordinates.
 * @param {number} x New absolute x coordinate, in workspace coordinates.
 * @param {number} y New absolute y coordinate, in workspace coordinates.
 */
Blockly.RenderedConnection.prototype.moveTo = function(x, y) {
  // ADDED by JL: do nothing when the connection did not move
  if (this.x_ !== x || this.y_ !== y) {
    // Remove it from its old location in the database (if already present)
    if (this.inDB_) {
      this.db_.removeConnection_(this);
    }
    this.x_ = x;
    this.y_ = y;
    // Insert it into its new location in the database.
    if (!this.hidden_) {
      this.db_.addConnection(this);
    }
  }
};

/**
 * Find the closest compatible connection to this connection.
 * All parameters are in workspace units.
 * @param {number} maxLimit The maximum radius to another connection.
 * @param {number} dx Horizontal offset between this connection's location
 *     in the database and the current location (as a result of dragging).
 * @param {number} dy Vertical offset between this connection's location
 *     in the database and the current location (as a result of dragging).
 * @return {!{connection: ?Blockly.Connection, radius: number}} Contains two
 *     properties: 'connection' which is either another connection or null,
 *     and 'radius' which is the distance.
 */
Blockly.RenderedConnection.prototype.closest = function(maxLimit, dx, dy) {
  // BEGIN ADDENDUM by JL
  if(this.hidden_) {
    return {}
  }
  // END ADDENDUM ny JL
  return this.dbOpposite_.searchForClosest(this, maxLimit, dx, dy);
};

ezP.RenderedConnection.savedDispose = Blockly.Connection.prototype.dispose
/**
 * Sever all links to this connection (not including from the source object).
 */
Blockly.Connection.prototype.dispose = function() {
  if (this === ezP.SelectedConnection.get()) {
    ezP.SelectedConnection.set(null)
  }
  ezP.RenderedConnection.savedDispose.call(this)
}

ezP.RenderedConnection.onCheckChanged_ = Blockly.RenderedConnection.prototype.onCheckChanged_
/**
 * Function to be called when this connection's compatible types have changed.
 * @private
 */
Blockly.RenderedConnection.prototype.onCheckChanged_ = function() {
  ezP.RenderedConnection.onCheckChanged_.call(this)
  var block = this.targetBlock()
  if (block) {
    block.ezp.consolidate(block, false, true)
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
 */
Blockly.Connection.singleConnection_ = function(block, orphanBlock) {
  var connection = false;
  for (var i = 0; i < block.inputList.length; i++) {
    var thisConnection = block.inputList[i].connection;
    if (thisConnection && thisConnection.type == Blockly.INPUT_VALUE &&
        orphanBlock.outputConnection.checkType_(thisConnection)) {
      if (connection) {
        return null;  // More than one connection.
      }
      connection = thisConnection;
    }
  }
  return connection;
};

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
 * @private
 */
Blockly.Connection.lastConnectionInRow_ = function(startBlock, orphanBlock) {
  var newBlock = startBlock;
  var connection;
  while ((connection = Blockly.Connection.singleConnection_(
      /** @type {!Blockly.Block} */ (newBlock), orphanBlock)) && !connection.ezp.disabled_) {
    // '=' is intentional in line above.
    newBlock = connection.targetBlock();
    if (!newBlock || newBlock.isShadow()) {
      return connection;
    }
  }
  return null;
}

/**
 * Walks down a row a blocks, at each stage */
ezP.ConnectionDelegate.prototype.consolidateSource = function() {
  var block = this.connection.getSourceBlock()
  block.ezp.consolidate(block)
}