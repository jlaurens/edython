/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */

/**
 * @fileoverview Added left and right connections.
 * @author jerom.laurens@u-bourgogne.fr
 */
'use strict';

goog.provide('eYo.Events.BlockBase')

goog.require('eYo.Events')

goog.require('eYo.Events.BlockBase')

/**
 * Class for a block move event.  Created before the move.
 * The high/left management is added.
 * @param {Blockly.Block} block The moved block.  Null for a blank event.
 * @extends {eYo.Events.BlockBase}
 * @constructor
 */
eYo.Events.Move = function(block) {
  if (!block) {
    return;  // Blank event to be populated by fromJson.
  }
  eYo.Events.Move.superClass_.constructor.call(this, block);
  var location = this.currentLocation_();
  this.oldParentId = location.parentId;
  this.oldInputName = location.inputName;
  this.oldHorizontal = location.horizontal;
  this.oldCoordinate = location.coordinate;
};
goog.inherits(eYo.Events.Move, eYo.Events.BlockBase);

/**
 * Class for a block move event.  Created before the move.
 * The high/left management is added.
 * @param {Blockly.Block} block The moved block.  Null for a blank event.
 * @extends {eYo.Events.BlockBase}
 * @constructor
 */
eYo.Events.BlockMove = eYo.Events.Move;

/**
 * Type of this event.
 * The high/left management is added.
 * @type {string}
 */
eYo.Events.Move.prototype.type = eYo.Events.MOVE;

/**
 * Encode the event as JSON.
 * The high/left management is added.
 * @return {!Object} JSON representation.
 */
eYo.Events.Move.prototype.toJson = function() {
  var json = eYo.Events.Move.superClass_.toJson.call(this);
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
eYo.Events.Move.prototype.fromJson = function(json) {
  eYo.Events.Move.superClass_.fromJson.call(this, json);
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
 * The head/left management is added.
 * Just in case there is an ambiguity.
 */
eYo.Events.Move.prototype.recordNew = function() {
  var location = this.currentLocation_()
  this.newParentId = location.parentId
  this.newInputName = location.inputName
  this.newCoordinate = location.coordinate
  this.newHorizontal = location.horizontal
};

/**
 * Returns the parentId and input if the block is connected,
 *   or the XY location if disconnected.
 * The head/left management is added.
 * @return {!Object} Collection of location info.
 * @private
 */
eYo.Events.Move.prototype.currentLocation_ = function() {
  var location = {};
  var workspace = Blockly.Workspace.getById(this.workspaceId)
  var brick = workspace.getBrickById(this.brickId)
  var parent = brick.parent
  if (parent) {
    location.parentId = parent.id;
    var m4t = brick.out_m
    if (m4t) {
      location.inputName = m4t.target.name
    } else if (brick.left === parent) {
      location.horizontal = true
    }
  } else {
    location.coordinate = brick.xy
  }
  return location
}

/**
 * Does this event record any change of state?
 * @return {boolean} True if something changed.
 */
eYo.Events.Move.prototype.isNull = function() {
  return this.oldParentId == this.newParentId &&
      this.oldInputName == this.newInputName &&
      this.oldHorizontal == this.newHorizontal &&
      goog.math.Coordinate.equals(this.oldCoordinate, this.newCoordinate);
};


/**
 * Run a move event with left and right statements.
 * @param {boolean} forward True if run forward, false if run backward (undo).
 */
eYo.Events.Move.prototype.run = function(forward) {
  var workspace = this.workspace
  var brick = workspace.getBrickById(this.brickId);
  if (!brick) {
    console.warn("Can't move non-existent brick: " + this.brickId);
    return;
  }
  var parentId = forward ? this.newParentId : this.oldParentId;
  var parent = null;
  if (parentId) {
    parent = workspace.getBrickById(parentId);
    if (!parent) {
      console.warn("Can't connect to non-existent brick: " + parentId);
      return;
    }
  }
  if (brick.parent) {
    brick.unplug()
  }
  var coordinate = forward ? this.newCoordinate : this.oldCoordinate;
  if (coordinate) {
    var xy = brick.xy;
    brick.xyMoveBy(coordinate.x - xy.x, coordinate.y - xy.y);
  } else {
    var inputName = forward ? this.newInputName : this.oldInputName;
    if (inputName) {
      var input = parent.getInput(inputName)
      if (input) {
        var magnet = brick.out_m
        if (magnet) {
          var p_magnet = input.magnet
          magnet.connect(p_magnet)
        } else {
          console.warn("Can't connect with no out: " + brick)
        }
      } else {
        console.warn("Can't connect to non-existent input: " + inputName)
      }
    } else {
      var horizontal = forward ? this.newHorizontal : this.oldHorizontal
      if (horizontal) {
        if ((magnet = brick.left_m)) {
          if ((p_magnet = parent.right_m)) {
            magnet.connect(p_magnet)
          } else {
            console.warn("Can't connect to non-existent right connection: " + parent)
          }
        } else {
          console.warn("Can't connect to non-existent left connection: " + brick)
        }
      } else if ((magnet = brick.head_m)) {
        if ((p_magnet = parent.foot_m)) {
          magnet.connect(p_magnet)
        } else {
          console.warn("Can't connect to non-existent foot connection: " + parent)
        }
      } else {
        console.warn("Can't connect to non-existent head connection: " + brick)
      }
    }
  }
}
