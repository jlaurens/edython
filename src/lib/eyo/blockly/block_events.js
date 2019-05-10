/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */

/**
 * @fileoverview Added left and right connections.
 * @author jerom.laurens@u-bourgogne.fr
 */
'use strict';

goog.provide('eYo.Events.BlockBase')

goog.require('Blockly.Events.BlockBase')

/**
 * Class for a block move event.  Created before the move.
 * The high/left management is added.
 * @param {Blockly.Block} block The moved block.  Null for a blank event.
 * @extends {Blockly.Events.BlockBase}
 * @constructor
 */
Blockly.Events.Move = function(block) {
  if (!block) {
    return;  // Blank event to be populated by fromJson.
  }
  Blockly.Events.Move.superClass_.constructor.call(this, block);
  var location = this.currentLocation_();
  this.oldParentId = location.parentId;
  this.oldInputName = location.inputName;
  this.oldHorizontal = location.horizontal;
  this.oldCoordinate = location.coordinate;
};
goog.inherits(Blockly.Events.Move, Blockly.Events.BlockBase);

/**
 * Class for a block move event.  Created before the move.
 * The high/left management is added.
 * @param {Blockly.Block} block The moved block.  Null for a blank event.
 * @extends {Blockly.Events.BlockBase}
 * @constructor
 */
Blockly.Events.BlockMove = Blockly.Events.Move;

/**
 * Type of this event.
 * The high/left management is added.
 * @type {string}
 */
Blockly.Events.Move.prototype.type = Blockly.Events.MOVE;

/**
 * Encode the event as JSON.
 * The high/left management is added.
 * @return {!Object} JSON representation.
 */
Blockly.Events.Move.prototype.toJson = function() {
  var json = Blockly.Events.Move.superClass_.toJson.call(this);
  if (this.newParentId) {
    json['newParentId'] = this.newParentId;
  }
  if (this.newInputName) {
    json['newInputName'] = this.newInputName;
  }
  if (this.newHorizontal) {
    json['newHorizontal'] = this.newHorizontal;
  }
  if (this.newCoordinate) {
    json['newCoordinate'] = Math.round(this.newCoordinate.x) + ',' +
        Math.round(this.newCoordinate.y);
  }
  return json;
};

/**
 * Decode the JSON event.
 * The high/left management is added.
 * @param {!Object} json JSON representation.
 */
Blockly.Events.Move.prototype.fromJson = function(json) {
  Blockly.Events.Move.superClass_.fromJson.call(this, json);
  this.newParentId = json['newParentId'];
  this.newInputName = json['newInputName'];
  this.newHorizontal = json['newHorizontal'];
  if (json['newCoordinate']) {
    var xy = json['newCoordinate'].split(',');
    this.newCoordinate =
        new goog.math.Coordinate(parseFloat(xy[0]), parseFloat(xy[1]));
  }
};

/**
 * Record the block's new location.  Called after the move.
 * The high/left management is added.
 */
Blockly.Events.Move.prototype.recordNew = function() {
  var location = this.currentLocation_()
  this.newParentId = location.parentId
  this.newInputName = location.inputName
  this.newCoordinate = location.coordinate
  this.newHorizontal = location.horizontal
};

/**
 * Returns the parentId and input if the block is connected,
 *   or the XY location if disconnected.
 * The high/left management is added.
 * @return {!Object} Collection of location info.
 * @private
 */
Blockly.Events.Move.prototype.currentLocation_ = function() {
  var workspace = Blockly.Workspace.getById(this.workspaceId);
  var block = workspace.getBlockById(this.blockId);
  var location = {};
  var parent = block.getParent();
  if (parent) {
    location.parentId = parent.id;
    var input = parent.getInputWithBlock(block);
    if (input) {
      location.inputName = input.name;
    }
    var left = block.eyo.magnets.left
    if (left && left.t_eyo === parent.eyo) {
      location.horizontal = true
    }
  } else {
    location.coordinate = block.getRelativeToSurfaceXY();
  }
  return location;
};

/**
 * Does this event record any change of state?
 * @return {boolean} True if something changed.
 */
Blockly.Events.Move.prototype.isNull = function() {
  return this.oldParentId == this.newParentId &&
      this.oldInputName == this.newInputName &&
      this.oldHorizontal == this.newHorizontal &&
      goog.math.Coordinate.equals(this.oldCoordinate, this.newCoordinate);
};


/**
 * Run a move event with left and right statements.
 * @param {boolean} forward True if run forward, false if run backward (undo).
 */
Blockly.Events.Move.prototype.run = function(forward) {
  var workspace = this.getEventWorkspace_();
  var block = workspace.getBlockById(this.blockId);
  if (!block) {
    console.warn("Can't move non-existent block: " + this.blockId);
    return;
  }
  var eyo = block.eyo
  var parentId = forward ? this.newParentId : this.oldParentId;
  var parentBlock = null;
  if (parentId) {
    parentBlock = workspace.getBlockById(parentId);
    if (!parentBlock) {
      console.warn("Can't connect to non-existent block: " + parentId);
      return;
    }
  }
  var parent = parentBlock.eyo
  if (eyo.parent) {
    block.unplug()
  }
  var coordinate = forward ? this.newCoordinate : this.oldCoordinate;
  if (coordinate) {
    var xy = eyo.ui.xyInSurface;
    eyo.moveBy(coordinate.x - xy.x, coordinate.y - xy.y);
  } else {
    var inputName = forward ? this.newInputName : this.oldInputName;
    if (inputName) {
      var input = parentBlock.getInput(inputName)
      if (input) {
        var magnet = eyo.magnets.output
        if (magnet) {
          var p_magnet = input.eyo.magnet
          magnet.connect(p_magnet)
        } else {
          console.warn("Can't connect with no output: " + eyo)
        }
      } else {
        console.warn("Can't connect to non-existent input: " + inputName)
      }
    } else {
      var horizontal = forward ? this.newHorizontal : this.oldHorizontal
      if (horizontal) {
        if ((magnet = eyo.magnets.left)) {
          if ((p_magnet = parent.magnets.right)) {
            magnet.connect(p_magnet)
          } else {
            console.warn("Can't connect to non-existent right connection: " + parent)
          }
        } else {
          console.warn("Can't connect to non-existent left connection: " + eyo)
        }
      } else if ((magnet = eyo.magnets.head)) {
        if ((p_magnet = parent.magnets.foot)) {
          magnet.connect(p_magnet)
        } else {
          console.warn("Can't connect to non-existent low connection: " + parent)
        }
      } else {
        console.warn("Can't connect to non-existent high connection: " + eyo)
      }
    }
  }
}
