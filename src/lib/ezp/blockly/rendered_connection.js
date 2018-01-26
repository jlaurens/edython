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
 * For EZP blocks.
 * @param {!Blockly.Connection} otherConnection Connection to compare against.
 * @override
 */
ezP.Connection.prototype.connect = function (otherConnection) {
  if (this.isSuperior()) {
    var superior = this
    var inferior = otherConnection
  } else {
    superior = otherConnection
    inferior = this
  }
  var next = inferior.sourceBlock_.nextConnection
  if (inferior.check_ === ezP.Type.Stmt.Check.before_else) {
    if (superior.check_ === ezP.Type.Stmt.Check.after_if) {
      inferior.check_ = ezP.Type.Stmt.Check.before_if_else
    } else if (superior.check_ === ezP.Type.Stmt.Check.after_loop) {
      inferior.check_ = ezP.Type.Stmt.Check.before_loop_else
    }
  }
  if (inferior.check_ === ezP.Type.Stmt.Check.before_else) {
    next.check_ = ezP.Type.Stmt.Check.after_else
  } else if (inferior.check_ === ezP.Type.Stmt.Check.before_elif) {
    next.check_ = ezP.Type.Stmt.Check.after_elif
  } else if (inferior.check_ === ezP.Type.Stmt.Check.before_if_else) {
    next.check_ = ezP.Type.Stmt.Check.after_else
  } else if (inferior.check_ === ezP.Type.Stmt.Check.before_loop_else) {
    next.check_ = ezP.Type.Stmt.Check.after_else
  }
  ezP.Connection.superClass_.connect.call(this, otherConnection)
  if (superior.ezpData.sealed_) {
    // this connection should be sealed
    inferior.sourceBlock_.ezp.makeBlockSealed(inferior)
  }
}

/**
 * For EZP blocks.
 * @override
 */
ezP.Connection.prototype.disconnect = function () {
  var otherConnection = this.targetConnection
  if (this.isSuperior()) {
    var inferior = otherConnection
  } else {
    inferior = this
  }
  var next = inferior.sourceBlock_.nextConnection
  setTimeout(function () {
    if (inferior.check_ === ezP.Type.Stmt.Check.before_else ||
        inferior.check_ === ezP.Type.Stmt.Check.before_if_else ||
        inferior.check_ === ezP.Type.Stmt.Check.before_loop_else ||
        inferior.check_ === ezP.Type.Stmt.Check.before_elif) {
      if (next && !next.isConnected()) {
        next.setCheck(ezP.Type.Stmt.Check.none)
      }
    }
    if (inferior.check_ === ezP.Type.Stmt.Check.before_if_else ||
        inferior.check_ === ezP.Type.Stmt.Check.before_loop_else) {
      inferior.setCheck(ezP.Type.Stmt.Check.before_else)
    }
  }, 3 * Blockly.BUMP_DELAY / 2)
  ezP.Connection.superClass_.disconnect.call(this)
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
if (this.ezpData.sealed_ || candidate.ezpData.sealed_) {
  return false
}
return ezP.Connection.superClass_.isConnectionAllowed.call(this,
  candidate)
}
