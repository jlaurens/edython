/**
 * @license
 * ezPython
 *
 * Copyright 2017 Jérôme LAURENS.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Extends connections.
 * Insert a class between Blockly.Connection and Blockly.REnderedConnection
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict';

goog.provide('ezP.RenderedConnection');

goog.require('Blockly.RenderedConnection');
goog.require('Blockly.Connection');

goog.require('ezP.Const');

/**
 * Class for a connection between blocks that may be rendered on screen.
 * @param {!Blockly.Block} source The block establishing this connection.
 * @param {number} type The type of the connection.
 * @extends {Blockly.Connection}
 * @constructor
 */
ezP.Connection = function(source, type) {
  ezP.Connection.superClass_.constructor.call(this, source, type);
  this.isSeparatorEZP = false;
};
goog.inherits(ezP.Connection, Blockly.Connection);

ezP.inherits(Blockly.RenderedConnection, ezP.Connection);

ezP.Connection.prototype.highlight = Blockly.RenderedConnection.prototype.highlight;

/**
 * Add highlighting around this connection.
 */
Blockly.RenderedConnection.prototype.highlight = function() {
  var ezp = this.sourceBlock_.ezp;
  if (ezp) {
    ezp.highlightConnection(this);
    return;
  }
  Blockly.RenderedConnection.superClass_.highlight.call(this);
};

/**
 * For EZP blocks.
 * @param {!Blockly.Connection} otherConnection Connection to compare against.
 * @override
 */
ezP.Connection.prototype.connect = function(otherConnection) {
  if (this.isSuperior()) {
    var superior = this;
    var inferior = otherConnection;
  } else {
    var superior = otherConnection;
    var inferior = this;
  }
  var next = inferior.sourceBlock_.nextConnection;
  if (inferior.check_ == ezP.Check.stt.before_else) {
    if (superior.check_ == ezP.Check.stt.after_if) {
      inferior.check_ = ezP.Check.stt.before_if_else;
    } else if (superior.check_ == ezP.Check.stt.after_loop) {
      inferior.check_ = ezP.Check.stt.before_loop_else;
    }
  }
  if (inferior.check_ == ezP.Check.stt.before_else) {
    next.check_ = ezP.Check.stt.after_else;
  } else if (inferior.check_ == ezP.Check.stt.before_elif) {
    next.check_ = ezP.Check.stt.after_elif;
  } else if (inferior.check_ == ezP.Check.stt.before_if_else) {
    next.check_ = ezP.Check.stt.after_else;
  } else if (inferior.check_ == ezP.Check.stt.before_loop_else) {
    next.check_ = ezP.Check.stt.after_else;
  }
  ezP.Connection.superClass_.connect.call(this, otherConnection);
};

/**
 * For EZP blocks.
 * @override
 */
ezP.Connection.prototype.disconnect = function() {
  var otherConnection = this.targetConnection;
  if (this.isSuperior()) {
    var superior = this;
    var inferior = otherConnection;
  } else {
    var superior = otherConnection;
    var inferior = this;
  }
  var next = inferior.sourceBlock_.nextConnection;
  setTimeout(function() {
    if (inferior.check_ == ezP.Check.stt.before_else
        || inferior.check_ == ezP.Check.stt.before_if_else
        || inferior.check_ == ezP.Check.stt.before_loop_else
        || inferior.check_ == ezP.Check.stt.before_elif) {
      if (next && !next.isConnected()) {
        next.setCheck(ezP.Check.stt.none);
      }
    }
    if (inferior.check_ == ezP.Check.stt.before_if_else
        || inferior.check_ == ezP.Check.stt.before_loop_else) {
      inferior.setCheck(ezP.Check.stt.before_else);
    }
  }, 3*Blockly.BUMP_DELAY / 2);
  ezP.Connection.superClass_.disconnect.call(this);
};

/**
 * Move the block(s) belonging to the connection to a point where they don't
 * visually interfere with the specified connection.
 * @param {!Blockly.Connection} staticConnection The connection to move away
 *     from.
 * @private
 */
Blockly.RenderedConnection.prototype.bumpAwayFrom_ = function(staticConnection) {
  if (this.sourceBlock_.workspace.isDragging()) {
    // Don't move blocks around while the user is doing the same.
    return;
  }
  // Move the root block.
  var rootBlock = this.sourceBlock_.getRootBlock();
  if (rootBlock.isInFlyout) {
    // Don't move blocks around in a flyout.
    return;
  }
  var reverse = false;
  if (!rootBlock.isMovable()) {
    // Can't bump an uneditable block away.
    // Check to see if the other block is movable.
    rootBlock = staticConnection.getSourceBlock().getRootBlock();
    if (!rootBlock.isMovable()) {
      return;
    }
    // Swap the connections and move the 'static' connection instead.
    staticConnection = this;
    reverse = true;
  }
  // Raise it to the top for extra visibility.
  var selected = Blockly.selected == rootBlock;
  selected || rootBlock.addSelect();
  var dx = (staticConnection.x_ + Blockly.SNAP_RADIUS) - this.x_;
  var dy = (staticConnection.y_ + Blockly.SNAP_RADIUS) - this.y_;
  if (reverse) {
    // When reversing a bump due to an uneditable block, bump up.
    dy = -dy;
  }
  if (staticConnection.isConnected()) {
    dx += staticConnection.targetBlock().width;
  }
  if (rootBlock.RTL) {
    dx = -dx;
  }
  rootBlock.moveBy(dx, dy);
  selected || rootBlock.removeSelect();
};
