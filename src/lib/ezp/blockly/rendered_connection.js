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
goog.require('ezP.Type')

/**
 * Class for a connection between blocks that may be rendered on screen.
 * @param {!Blockly.Block} source The block establishing this connection.
 * @param {number} type The type of the connection.
 * @extends {Blockly.Connection}
 * @constructor
 */
ezP.Connection = function (source, type) {
  ezP.Connection.superClass_.constructor.call(this, source, type)
  this.ezpData = {}
}
goog.inherits(ezP.Connection, Blockly.Connection)

ezP.inherits(Blockly.RenderedConnection, ezP.Connection)

ezP.Connection.prototype.highlight = Blockly.RenderedConnection.prototype.highlight

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
  if (this.ezpData.wrapped_ || candidate.ezpData.wrapped_) {
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
ezP.Connection.prototype.isNextOrPrevious = function() {
  return this === this.getSourceBlock().nextConnection || this === this.getSourceBlock().previousConnection
}

/**
 * Is this connection compatible with another connection with respect to the
 * value type system.  E.g. square_root("Hello") is not compatible.
 * @param {!Blockly.Connection} otherConnection Connection to compare against.
 * @return {boolean} True if the connections share a type.
 * @private
 */
ezP.Connection.prototype.checkType_ = function(otherConnection) {
  if (this.type === Blockly.NEXT_STATEMENT || this.type === Blockly.PREVIOUS_STATEMENT) {
    var T = this.getSourceBlock().type
    if (T.indexOf('ezp_') == 0) {
      var otherT = otherConnection.getSourceBlock().type
      if (!this.isNextOrPrevious()) {
        if (this.check_ && this.check_.indexOf(otherT)<0) {
          return false
        }
        return !otherConnection.check_ || !otherConnection.check_.length
      }
      if (!otherConnection.isNextOrPrevious()) {
        if (otherConnection.check_ && otherConnection.check_.indexOf(T)<0) {
          return false
        }
        return !this.check_ || !this.check_.length
      }
      if (this.check_ && this.check_.indexOf(otherT)<0) {
        return false
      }
      if (otherConnection.check_ && otherConnection.check_.indexOf(T)<0) {
        return false
      }
      return true
    }
  }
  return ezP.Connection.superClass_.checkType_.call(this, otherConnection)
}

/**
 * Connect this connection to another connection.
 * This is a hook to force wrapping.
 * The wrapped block is automatically created,
 * and disposed off if necessary.
 * Useful when undeo/redo
 * @param {!Blockly.Connection} otherConnection Connection to connect to.
 */
ezP.Connection.prototype.connect = function(otherConnection) {
  var orphan = this.isSuperior()?
  this.targetBlock() : otherConnection.targetBlock()
  ezP.Connection.superClass_.connect.call(this, otherConnection)
  var block
  if (this.ezpData.wrapped_) {
    block = this.targetBlock()
    block.ezp.makeBlockWrapped_(block)
  } else if (otherConnection.ezpData.wrapped_) {
    block = otherConnection.targetBlock()
    block.ezp.makeBlockWrapped_(block)
  }
  if (orphan) {
    orphan.dispose(true)
  }
};

