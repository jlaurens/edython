/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Flyout overriden.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Events.BrickBase')
goog.provide('eYo.Events.BrickCreate')
goog.provide('eYo.Events.BrickChange')
goog.provide('eYo.Events.BrickMove')
goog.provide('eYo.Events.BrickDelete')

goog.require('eYo.Events')
goog.require('eYo.Events.Abstract')

goog.forwardDeclare('goog.array')
goog.forwardDeclare('goog.math.Coordinate')

/**
 * Convenient shortcut.
 * @param {!eYo.Brick} brick  The newly created block.
 * @param {?Boolean|String} group  eventually set a group.
 */
eYo.Events.fireBrickCreate = function (brick, group) {
  if (eYo.Events.enabled) {
    goog.isDef(group) && (eYo.Events.group = group)
    eYo.Events.fire(new eYo.Events.BrickCreate(brick))
  }
}

/**
 * Convenient shortcut.
 * @param {!eYo.Brick} brick  The newly created block.
 */
eYo.Events.fireBrickChange = function (brick, element, name, oldValue, newValue) {
  if (eYo.Events.enabled) {
    eYo.Events.fire(new eYo.Events.BlockChange(brick, element, name, oldValue, newValue))
  }
}

/**
 * Convenient shortcut.
 * @param {!eYo.Brick} brick  The moved brick.
 * @param {Function} move  the move action.
 */
eYo.Events.fireBrickMove = (brick, move) => {
  if (eYo.Events.enabled) {
    var event = new eYo.Events.BlockMove(brick)
    try {
      move()
    } finally {
      event.recordNew()
      eYo.Events.fire(event)
    }
  } else {
    move()
  }
}

/**
 * Abstract class for a brick event.
 * @param {eYo.Brick} brick The brick this event corresponds to.
 * @extends {eYo.Events.Abstract}
 * @constructor
 */
eYo.Events.BrickBase = function(brick) {
  eYo.Events.BrickBase.superClass_.constructor.call(this, brick.workspace)
  /**
   * The brick id for the brick this event pertains to
   * @type {string}
   */
  this.brickId = brick.id
}
goog.inherits(eYo.Events.BrickBase, eYo.Events.Abstract);

Object.defineProperties(eYo.Events.BrickBase.prototype, {
  brick: {
    get () {
      var workspace = this.workspace
      return workspace && workspace.getBrickById(this.brickId)
    }
  }
})

/**
 * Class for a brick change event.
 * @param {eYo.Brick} brick The changed brick.
 * @param {string} element One of 'field', 'collapsed', 'disabled', etc.
 * @param {?string} name Name of input or field affected, or null.
 * @param {*} oldValue Previous value of element.
 * @param {*} newValue New value of element.
 * @extends {eYo.Events.BrickBase}
 * @constructor
 */
eYo.Events.BrickChange = function(brick, element, name, oldValue, newValue) {
  eYo.Events.Change.superClass_.constructor.call(this, brick)
  this.element = element
  this.name = name
  this.oldValue = oldValue
  this.newValue = newValue
}
goog.inherits(eYo.Events.BrickChange, eYo.Events.BrickBase)

Object.defineProperties(eYo.Events.BrickChange.prototype, {
  /**
   * Type of this event.
   * @type {string}
   */
  type: { value: eYo.Events.BrickChang },
  /**
   * Does this event record any change of state?
   * @return {boolean} True if something changed.
   */
  isNull: {
    get () {
      return this.oldValue == this.newValue
    }
  },
})

/**
 * Run a change event.
 * @param {boolean} forward True if run forward, false if run backward (undo).
 */
eYo.Events.BrickChange.prototype.run = function(forward) {
  var brick = this.brick
  if (!brick) {
    console.warn("Can't change non-existent brick: " + this.brickId);
    return;
  }
  var value = forward ? this.newValue : this.oldValue;
  switch (this.element) {
    case 'field':
      var field = brick.getField(this.name)
      if (field) {
        // Run the validator for any side-effects it may have.
        // The validator's opinion on validity is ignored.
        field.callValidator(value);
        field.setValue(value);
      } else {
        console.warn("Can't set non-existent field: " + this.name);
      }
      break;
    case 'collapsed':
      brick.collapsed = value
      break
    case 'disabled':
      brick.disabled = value
      break
    default:
      console.warn('Unknown change type: ' + this.element)
  }
}

/**
 * Class for a brick creation event.
 * @param {eYo.Brick} brick The created brick.
 * @extends {eYo.Events.BrickBase}
 * @constructor
 */
eYo.Events.BrickCreate = function(brick) {
  eYo.Events.BrickCreate.superClass_.constructor.call(this, brick)
  if (brick.workspace.rendered) {
    this.xml = eYo.Xml.brickToDomWithXY(brick)
  } else {
    this.xml = eYo.Xml.brickToDom(brick)
  }
  this.ids = brick.descendantIds
}
goog.inherits(eYo.Events.BrickCreate, eYo.Events.BrickBase)

Object.defineProperties(eYo.Events.BrickCreate.prototype, {
  /**
   * Type of this event.
   * @type {string}
   */
  type: { value: eYo.Events.BRICK_CREATE },
})

/**
 * Run a creation event.
 * @param {boolean} forward True if run forward, false if run backward (undo).
 */
eYo.Events.BrickCreate.prototype.run = function(forward) {
  var workspace = this.workspace
  if (forward) {
    var xml = goog.dom.createDom('xml')
    xml.appendChild(this.xml)
    eYo.Xml.domToWorkspace(xml, workspace)
  } else {
    this.ids.forEach(id => {
      var brick = workspace.getBrickById(id)
      if (brick) {
        brick.dispose(false, false)
      } else if (id === this.brickId) {
        // Only complain about root-level brick.
        console.warn("Can't uncreate non-existent brick: " + id)
      }
    })
  }
}

/**
 * Class for a brick deletion event.
 * @param {eYo.Brick} brick The deleted brick.
 * @extends {eYo.Events.BrickBase}
 * @constructor
 */
eYo.Events.BrickDelete = function(brick) {
  if (brick.parent) {
    throw 'Connected bricks cannot be deleted.'
  }
  eYo.Events.BrickDelete.superClass_.constructor.call(this, brick)

  if (brick.workspace.rendered) {
    this.oldXml = Blockly.Xml.brickToDomWithXY(brick)
  } else {
    this.oldXml = Blockly.Xml.brickToDom(brick)
  }
  this.ids = brick.descendantIds
}
goog.inherits(eYo.Events.BrickDelete, eYo.Events.BrickBase)

Object.defineProperties(eYo.Events.BrickDelete.prototype, {
  /**
   * Type of this event.
   * @type {string}
   */
  type: { value: eYo.Events.BRICK_DELETE },
})

/**
 * Run a deletion event.
 * @param {boolean} forward True if run forward, false if run backward (undo).
 */
eYo.Events.BrickDelete.prototype.run = function(forward) {
  var workspace = this.workspace
  if (forward) {
    this.ids.forEach(id => {
      var brick = workspace.getBrickById(id)
      if (brick) {
        brick.dispose()
      } else if (id === this.brickId) {
        // Only complain about root-level brick.
        console.warn("Can't delete non-existent brick: " + id);
      }
    })
  } else {
    var xml = goog.dom.createDom('xml')
    xml.appendChild(this.oldXml)
    eYo.Xml.domToWorkspace(xml, workspace)
  }
}

/**
 * Class for a brick move event.  Created before the move.
 * @param {eYo.Brick} brick The moved brick.
 * @extends {eYo.Events.BrickBase}
 * @constructor
 */
eYo.Events.BrickMove = function(brick) {
  eYo.Events.Move.superClass_.constructor.call(this, brick)
  var location = this.currentLocation_()
  this.oldParentId = location.parentId
  this.oldName = location.name
  this.oldLeft = location.left
  this.oldCoordinate = location.coordinate
};
goog.inherits(eYo.Events.BrickMove, eYo.Events.BrickBase)

Object.defineProperties(eYo.Events.BrickMove.prototype, {
  /**
   * Type of this event.
   * @type {string}
   */
  type: { value: eYo.Events.BRICK_MOVE },
  /**
   * Returns the parentId and input if the brick is connected,
   *   or the XY location if disconnected.
   * @return {!Object} Collection of location info.
   * @private
   */
  currentLocation_: {
    get () {
      var brick = this.brick
      var location = {}
      var parent = brick.parent
      if (parent) {
        location.parentId = parent.id
        var m4t
        if ((m4t = brick.output_m)) {
          location.name = m4t.name
        } else if ((m4t = brick.left_m)) {
          location.left = !!m4t.target
        }
      } else {
        location.coordinate = brick.xy
      }
      return location
    }
  },
  /**
   * Does this event record any change of state?
   * @return {boolean} True if something changed.
   */
  isNull: {
    get() {
      return this.oldParentId === this.newParentId &&
        this.oldName === this.newName &&
        this.oldLeft === this.newLeft &&
          goog.math.Coordinate.equals(this.oldCoordinate, this.newCoordinate)
    }
  },
})

/**
 * Record the brick's new location.  Called after the move.
 */
eYo.Events.BrickMove.prototype.recordNew = function() {
  var location = this.currentLocation_
  this.newParentId = location.parentId
  this.newName = location.name
  this.newLeft = location.left
  this.newCoordinate = location.coordinate
}

/**
 * Run a move event.
 * @param {boolean} forward True if run forward, false if run backward (undo).
 */
eYo.Events.BrickMove.prototype.run = function(forward) {
  var brick = this.brick
  if (!brick) {
    console.warn("Can't move non-existent brick: " + this.brickId)
    return
  }
  var parentId = forward ? this.newParentId : this.oldParentId
  var name = forward ? this.newName : this.oldName
  var left = forward ? this.newLeft : this.oldLeft
  var coordinate = forward ? this.newCoordinate : this.oldCoordinate
  var parentBrick = null
  if (parentId) {
    parentBrick = this.workspace.getBrickById(parentId)
    if (!parentBrick) {
      console.warn("Can't connect to non-existent brick: " + parentId)
      return
    }
  }
  if (brick.parent) {
    brick.unplug()
  }
  if (coordinate) {
    brick.ui.xyMoveTo(coordinate)
  } else {
    var m4t, targetM4t
    if (name) {
      m4t = brick.output_m
      targetM4t = parentBrick.getMagnet(name)
    } else if (left) {
      m4t = brick.left_m
      targetM4t = parentBrick.right_m
    } else {
      m4t = brick.head_m
      targetM4t = parentBrick.foot_m
    }
    if (targetM4t) {
      m4t.connect(targetM4t)
    } else {
      console.warn("Can't connect to non-existent input: " + name)
    }
  }
}

goog.require('eYo.Data')

/**
 * set the value of the property,
 * without validation but with undo and synchronization.
 * `duringChange` message is sent just before consolidating and undo registration.
 * Note on interference with the undo stack.
 * Let's suppose that we have triggered a UI event
 * that modifies some data of a block.
 * As a consequence, this block automatically changes type and
 * may be disconnected.
 * Take a look at what happens regarding the default undo/redo stack
 * management when connected bricks are involved
 * as data change.
 * NB the changeEnd method may disconnect
 *  1) normal flow
 *    a - the user asks for a data change
 *    b - the type change
 *    c - the connection check change triggering a disconnect block event
 *    d - the data change undo event is trigerred
 *    undo/redo stacks : [..., reconnect block, data undo change]/[]
 *  2) when undoing
 *    a - the user asks for an undo
 *    b - the data undo change is performed first
 *    c - the type change
 *    d - the connection check change but no undo event is recorded
 *        because no block has been connected nor disconnected meanwhile
 *    e - the data rechange is pushed to the redo stack
 *    f - bricks are reconnected and the redo event is pushed to the redo stack
 *    undo/redo stacks : [...]/[disconnect block, data rechange]
 *  3) when redoing
 *    a - bricks are disconnected and the reconnect event is pushed to the undo stack
 *    b - the data is rechanged, with type and connection checks.
 *        No block is disconnected, no other move event is recorded.
 *    undo/redo stacks : [..., reconnect block, data undo change]/[]
 * This is the reason why we consolidate the type before the undo change is recorded.
 * @param {Object} newValue
 * @param {Boolean} noRender
 */
eYo.Data.prototype.setTrusted_ = eYo.Decorate.reentrant_method(
  'setTrusted_',
  function (newValue) {
    var oldValue = this.value_
    if (oldValue !== newValue) {
      this.brick.changeWrap(() => { // catch `this`
        eYo.Events.groupWrap(() => { // catch `this`
          this.beforeChange(oldValue, newValue)
          try {
            this.value_ = newValue
            this.duringChange(oldValue, newValue)
          } catch(err) {
            console.error(err)
            throw err
          } finally {
            if (!this.noUndo) {
              eYo.Events.fireBrickChange(
                this.brick, eYo.Const.Event.DATA + this.key, null, oldValue, newValue)
            }
            this.afterChange(oldValue, newValue)
          }
        })
      })
    }
  }
)

/**
 * set the value of the property without any validation.
 * This is overriden by the events module.
 * @param {Object} newValue
 * @param {Boolean} noRender
 */
eYo.Data.prototype.setTrusted = eYo.Decorate.reentrant_method('trusted', eYo.Data.prototype.setTrusted_)

/*
function (try_f, finally_f) {
  try {
    eYo.Events.group = true
    return try_f.call(this)
  } catch (err) {
    console.error(err)
    throw err
  } finally {
    finally_f && (finally_f.call(this))
    eYo.Events.group = false
  }
}
*/
