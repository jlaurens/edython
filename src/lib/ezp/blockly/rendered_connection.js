/**
 * ezPython
 *
 * Copyright 2017 Jérôme LAURENS.
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
 * for example in the initBlock function, of in the inputModel.
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
 * for example in the initBlock function, of in the inputModel.
 * @param {Blockly.Connection} connection  the connection owning the delegate
 * @param {Blockly.Connection} oldTargetConnection  what was previously connected to connection
 * @param {Blockly.Connection} oldConnection  what was previously connected to connection.targetConnection
 */
ezP.ConnectionDelegate.prototype.didConnect = function(oldTargetConnection, oldConnection) {
  return
}

/**
 * Will connect.
 * Default implementation does nothing.
 * This can be overriden at block creation time,
 * for example in the initBlock function, of in the inputModel.
 * @param {Blockly.Connection} connection the connection owning the delegate
 */
ezP.ConnectionDelegate.prototype.willDisconnect = function(connection) {
  return
}

/**
 * Did disconnect.
 * Default implementation does nothing.
 * This can be overriden at block creation time,
 * for example in the initBlock function, of in the inputModel.
 * @param {Blockly.Connection} connection  the connection owning the delegate
 * @param {Blockly.Connection} oldTargetConnection  what was previously connected to connection
 */
ezP.ConnectionDelegate.prototype.didDisconnect = function(connection, oldTargetConnection) {
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
 * get the name of the input corresponding to this connection, if any.
 * This is a dynamic method.
 * The default implementation just returns the receiver's name_.
 * @return the receiver's name_.
 */
ezP.ConnectionDelegate.prototype.getName = function() {
  return this.name_
}

/**
 * Is it a next connection.
 * @param {!Blockly.Connection} otherConnection Connection to compare against.
 * @return {boolean} True if the connections share a type.
 * @private
 */
ezP.ConnectionDelegate.prototype.isNext = function() {
  return this.connection === this.connection.getSourceBlock().nextConnection
}

/**
 * Is it a next connection.
 * @param {!Blockly.Connection} otherConnection Connection to compare against.
 * @return {boolean} True if the connections share a type.
 * @private
 */
ezP.ConnectionDelegate.prototype.isPrevious = function() {
  return this.connection === this.connection.getSourceBlock().previousConnection
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
  var ezp = this.sourceBlock_.ezp
  if (ezp) {
    ezp.highlightConnection(this)
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
 * Is this connection compatible with another connection with respect to the
 * value type system.  E.g. square_root("Hello") is not compatible.
 * @param {!Blockly.Connection} otherConnection Connection to compare against.
 * @return {boolean} True if the connections share a type.
 * @private
 */
ezP.Connection.prototype.checkType_ = function(otherConnection) {
  var T = this.getSourceBlock().type
  if (T.indexOf('ezp_') == 0) {
    var otherT = otherConnection.getSourceBlock().type
    if (otherT.indexOf('ezp_') == 0) {
      var name = this.ezp.getName()
      var check = this.ezp.getCheck()
      var otherName = otherConnection.ezp.getName()
      var otherCheck = otherConnection.ezp.getCheck()
      if (name) {
        // `this.connection` corresponds to a 'do' statement input
        // possibly through comment statements
        if (check) {
          if (check.indexOf(otherT) < 0) {
            return false
          }
          if (otherCheck) {
            for (var i = 0, t;(t = check[i++]);) {
              if (otherCheck.indexOf(t) >= 0) {
                return true
              }
            }
          } else {
            return true
          }
        }
        return !otherCheck
      }
      if (otherName) {
        // symetrical situation
        if (otherCheck) {
          if (otherCheck.indexOf(T) < 0) {
            return false
          }
          if (check) {
            for (var i = 0, t;(t = otherCheck[i++]);) {
              if (check.indexOf(t) >= 0) {
                return true
              }
            }
          } else {
            return true
          }
        }
        return !check
      }
      if (check && check.indexOf(otherT)<0) {
        return false
      }
      if (otherCheck && otherCheck.indexOf(T)<0) {
        return false
      }
      return true
    }
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
  this.ezp.willConnect(this, childConnection)
  childConnection.ezp.willConnect(childConnection, this)
  parent.ezp.willConnect(parent, this, childConnection)
  var child = childConnection.sourceBlock_
  child.ezp.willConnect(child, childConnection, this)
  ezP.Connection.superClass_.connect_.call(this, childConnection)
  if (this.ezp.plugged_) {
    child.ezp.plugged_ = this.ezp.plugged_
    console.log('plugged_ is', child.ezp.plugged_)
  }
  if (this.ezp.wrapped_) {
    if (child.ezp.hasSelect(child)) { // Blockly.selected == child
      child.unselect()
      var P = child
      while ((P = P.getParent())) {
        if (!P.ezp.wrapped_) {
          P.select()
          break
        }
      }
    }
    child.ezp.makeBlockWrapped_(child)
  }
  if (oldChildConnection && childConnection !== oldChildConnection) {
    var oldChild = oldChildConnection.sourceBlock_
    if (oldChild && oldChild.ezp.wrapped_) {
      if (Blockly.Events.recordUndo) {
        oldChild.dispose(true)
      }
    }
  }
  parent.ezp.didConnect(parent, this, oldChildConnection, oldParentConnection)
  child.ezp.didConnect(child, childConnection, oldParentConnection, oldChildConnection)
  this.ezp.didConnect(this, oldChildConnection, oldParentConnection)
  childConnection.ezp.didConnect(childConnection, oldParentConnection, oldChildConnection)
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
  parentConnection.ezp.willDisconnect(parentConnection)
  childConnection.ezp.willDisconnect(childConnection)
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
  parentConnection.ezp.didDisconnect(parentConnection, childConnection)
  childConnection.ezp.didDisconnect(childConnection, parentConnection)
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
  for (var i = 0; i < block.inputList.length; i++) {
    var thisConnection = block.inputList[i].connection;
    if (thisConnection && thisConnection.type == Blockly.INPUT_VALUE &&
        orphanBlock.outputConnection.checkType_(thisConnection)) {
      if (!thisConnection.isConnected()) {
        return thisConnection;
      }
    }
  }
  return null;
};
