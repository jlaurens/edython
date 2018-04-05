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
 * Default implementation does nothing.
 * This can be overriden at block creation time,
 * for example in the initBlock function, of in the inputModel_.
 * @param {Blockly.Connection} connection the connection owning the delegate
 * @param {Blockly.Connection} targetConnection
 */
ezP.ConnectionDelegate.prototype.willConnect = function(targetConnection) {
  return
}

/**
 * Did connect.
 * Default implementation does nothing.
 * This can be overriden at block creation time,
 * for example in the initBlock function, of in the inputModel_.
 * @param {Blockly.Connection} oldTargetConnection  what was previously connected to connection
 * @param {Blockly.Connection} oldConnection  what was previously connected to the actual connection.targetConnection
 */
ezP.ConnectionDelegate.prototype.didConnect = function(oldTargetConnection, oldConnection) {
  return
}

/**
 * Will connect.
 * Default implementation does nothing.
 * This can be overriden at block creation time,
 * for example in the initBlock function, of in the inputModel_.
 */
ezP.ConnectionDelegate.prototype.willDisconnect = function() {
  return
}

/**
 * Did disconnect.
 * Default implementation does nothing.
 * This can be overriden at block creation time,
 * for example in the initBlock function, of in the inputModel_.
 * @param {Blockly.Connection} connection  the connection owning the delegate
 * @param {Blockly.Connection} oldTargetConnection  what was previously connected to connection
 */
ezP.ConnectionDelegate.prototype.didDisconnect = function(oldTargetConnection) {
  return
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
    block.ezp.highlightConnection(this)
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
 * If a connection 
 * @param {!Blockly.Connection} otherConnection Connection to compare against.
 * @return {boolean} True if the connections share a type.
 * @private
 */
ezP.Connection.prototype.checkType_ = function(otherConnection) {
  var c8nA = this.ezp.getBlackConnection()
  var c8nB = otherConnection.ezp.getBlackConnection()
  if (!c8nA || !c8nB) {
    return true
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
      // connections are vertical (next<->previous)
      if (checkA) {
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
      return !checkB || checkB.indexOf(typeA)>=0 || checkB.indexOf(typeA+'.'+c8nA.name_)>=0 || checkB.indexOf('.'+c8nA.name_)>=0
    } /* if (c8nA.ezp.name_) */
    if (c8nB.ezp.name_) {
      // c8nB is the connection of an input
      // connections are vertical (next<->previous)
      if (checkB) {
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
      return !checkA || checkA.indexOf(typeB)>=0 || checkA.indexOf(typeB+'.'+c8nB.name_)>=0 || checkA.indexOf('.'+c8nB.name_)>=0
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
ezP.Connection.prototype.connect_ = function(childConnection) {
  // this is actual parentConnection
  var parent = this.sourceBlock_
  var oldChildConnection = this.targetConnection
  var oldParentConnection = childConnection.targetConnection
  this.ezp.willConnect(childConnection)
  childConnection.ezp.willConnect(this)
  parent.ezp.willConnect(parent, this, childConnection)
  var child = childConnection.sourceBlock_
  child.ezp.willConnect(child, childConnection, this)
  ezP.Connection.superClass_.connect_.call(this, childConnection)
  if (this.ezp.plugged_) {
    child.ezp.plugged_ = this.ezp.plugged_
    console.log('plugged_ is', child.ezp.plugged_)
  }
  if (this.ezp.wrapped_) {
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
    if (this === ezP.SelectedConnection.get()) {
      P = parent
      do {
        if (P === Blockly.selected) {
          child.select()
          break
        }
      } while ((P = P.getSurroundParent()))
    }
  }
  if (oldChildConnection && childConnection !== oldChildConnection) {
    var oldChild = oldChildConnection.sourceBlock_
    if (oldChild) {
      if (oldChild.ezp.wrapped_) {
        if (Blockly.Events.recordUndo) {
          oldChild.dispose(true)
        }
      } else if (!oldChildConnection.targetBlock()) {
        // another chance to reconnect the orphan
        // just in case the check_ has changed in between
        // which might be the case for the else_part blocks
        P = child
        var c8n
        while ((c8n = P.nextConnection)) {
          if (!c8n.targetConnection) {
            if (c8n.checkType_(oldChildConnection)) {
              c8n.connect(oldChildConnection)
            }
            break
          }
        }
      }
    }
  }
  parent.ezp.didConnect(parent, this, oldChildConnection, oldParentConnection)
  child.ezp.didConnect(child, childConnection, oldParentConnection, oldChildConnection)
  if (oldChildConnection) {
    this.ezp.didConnect(oldChildConnection, oldParentConnection)
  }
  if (oldParentConnection) {
    childConnection.ezp.didConnect(oldParentConnection, oldChildConnection)
  }
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
    var parentConnection = this
    var childConnection = this.targetConnection
  } else {
    var parentConnection = this.targetConnection
    var childConnection = this
  }
  parentConnection.ezp.willDisconnect()
  childConnection.ezp.willDisconnect()
  parentBlock.ezp.willDisconnect(parentBlock, parentConnection)
  childBlock.ezp.willDisconnect(childBlock, childConnection)
  if (parentConnection.ezp.wrapped_) {
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
  parentBlock.ezp.didDisconnect(parentBlock, parentConnection, childConnection)
  childBlock.ezp.didDisconnect(childBlock, childConnection, parentConnection)
  parentConnection.ezp.didDisconnect(childConnection)
  childConnection.ezp.didDisconnect(parentConnection)
}

Blockly.Connection.singleConnection_original = Blockly.Connection.singleConnection_

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
Blockly.Connection.singleConnection_ = function(block, orphanBlock) {
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
