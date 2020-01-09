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

eYo.require('events')
eYo.require('events.abstract')

eYo.require('data')

eYo.provide('events.brickMove')
eYo.provide('events.brickDelete')
eYo.provide('events.brickBase')
eYo.provide('events.brickCreate')
eYo.provide('events.brickChange')


goog.forwardDeclare('goog.array')
goog.forwardDeclare('goog.dom')

/**
 * Convenient shortcut.
 * @param {eYo.Brick.Dflt} brick  The newly created brick.
 * @param {Boolean|String} [group]  eventually set a group.
 */
eYo.events.fireBrickCreate = function (brick, group) {
  if (eYo.events.enabled) {
    goog.isDef(group) && (eYo.events.group = group)
    eYo.events.fire(new eYo.events.BrickCreate(brick))
  }
}

/**
 * Convenient shortcut.
 * @param {eYo.Brick.Dflt} brick  The newly created brick.
 */
eYo.events.fireBrickChange = function (brick, element, name, before, after) {
  if (eYo.events.enabled) {
    eYo.events.fire(new eYo.events.BrickChange(brick, element, name, before, after))
  }
}

/**
 * Convenient shortcut.
 * @param {eYo.Brick.Dflt} brick  The moved brick.
 * @param {Function} move  the move action, signature: (event) -> void
 */
eYo.events.fireBrickMove = (brick, move) => {
  if (eYo.events.enabled) {
    var event = new eYo.events.BrickMove(brick)
    try {
      move(event)
    } finally {
      event.recordNew()
      eYo.events.fire(event)
    }
  } else {
    move()
  }
}

/**
 * Abstract class for a brick event.
 * @param {eYo.Brick.Dflt} brick The brick this event corresponds to.
 * @extends {eYo.events.Abstract}
 * @constructor
 */
eYo.events.BrickBase = function(brick) {
  eYo.events.BrickBase.SuperProto_.constructor.Call(this, brick.board)
  /**
   * The brick id for the brick this event pertains to
   * @type {string}
   */
  this.brickId = brick.id
}
goog.inherits(eYo.events.BrickBase, eYo.events.Abstract);

Object.defineProperties(eYo.events.BrickBase.prototype, {
  brick: {
    get () {
      var board = this.board
      return board && board.getBrickById(this.brickId)
    }
  }
})

/**
 * Class for a brick change event.
 * @param {eYo.Brick.Dflt} brick The changed brick.
 * @param {string} element One of 'field', 'collapsed', 'disabled', etc.
 * @param {string} [name] Name of slot or field affected, or null.
 * @param {*} before - Previous value of element.
 * @param {*} after - New value of element.
 * @extends {eYo.events.BrickBase}
 * @constructor
 */
eYo.events.BrickChange = function(brick, element, name, before, after) {
  eYo.events.BrickChange.SuperProto_.constructor.Call(this, brick)
  this.element = element
  this.name = name
  this.before = before
  this.after = after
}
goog.inherits(eYo.events.BrickChange, eYo.events.BrickBase)

Object.defineProperties(eYo.events.BrickChange.prototype, {
  /**
   * Type of this event.
   * @type {string}
   */
  type: { value: eYo.events.BRICK_CHANGE },
  /**
   * Does this event record any change of state?
   * @return {boolean} True if something changed.
   */
  isNull: {
    get () {
      return this.before == this.after
    }
  },
})

/**
 * Run a change event.
 * @param {boolean} redo True if run forward, false if run backward (undo).
 */
eYo.events.BrickChange.prototype.run = function(redo) {
  var brick = this.brick
  if (!brick) {
    console.warn("Can't change non-existent brick: " + this.brickId);
    return;
  }
  var value = redo ? this.after : this.before;
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
 * @param {eYo.Brick.Dflt} brick The created brick.
 * @extends {eYo.events.BrickBase}
 * @constructor
 */
eYo.events.BrickCreate = function(brick) {
  eYo.events.BrickCreate.SuperProto_.constructor.Call(this, brick)
  if (brick.board.rendered) {
    this.xml = eYo.xml.BrickToDomWithWhere(brick)
  } else {
    this.xml = eYo.xml.BrickToDom(brick)
  }
  this.ids = brick.descendantIds
}
goog.inherits(eYo.events.BrickCreate, eYo.events.BrickBase)

Object.defineProperties(eYo.events.BrickCreate.prototype, {
  /**
   * Type of this event.
   * @type {string}
   */
  type: { value: eYo.events.BRICK_CREATE },
})

/**
 * Run a creation event.
 * @param {boolean} forward True if run forward, false if run backward (undo).
 */
eYo.events.BrickCreate.prototype.run = function(forward) {
  var board = this.board
  if (forward) {
    var xml = goog.dom.createDom('xml')
    xml.appendChild(this.xml)
    eYo.xml.domToBoard(xml, board)
  } else {
    this.ids.forEach(id => {
      var brick = board.getBrickById(id)
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
 * @param {eYo.Brick.Dflt} brick The deleted brick.
 * @extends {eYo.events.BrickBase}
 * @constructor
 */
eYo.events.BrickDelete = function(brick) {
  if (brick.parent) {
    throw 'Connected bricks cannot be deleted.'
  }
  eYo.events.BrickDelete.SuperProto_.constructor.Call(this, brick)

  if (brick.board.rendered) {
    this.oldXml = eYo.xml.BrickToDomWithWhere(brick)
  } else {
    this.oldXml = eYo.xml.BrickToDom(brick)
  }
  this.ids = brick.descendantIds
}
goog.inherits(eYo.events.BrickDelete, eYo.events.BrickBase)

Object.defineProperties(eYo.events.BrickDelete.prototype, {
  /**
   * Type of this event.
   * @type {string}
   */
  type: { value: eYo.events.BRICK_DELETE },
})

/**
 * Run a deletion event.
 * @param {boolean} forward True if run forward, false if run backward (undo).
 */
eYo.events.BrickDelete.prototype.run = function(forward) {
  var board = this.board
  if (forward) {
    this.ids.forEach(id => {
      var brick = board.getBrickById(id)
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
    eYo.xml.domToBoard(xml, board)
  }
}

/**
 * Class for a brick move event.  Created before the move.
 * @param {eYo.Brick.Dflt} brick The moved brick.
 * @extends {eYo.events.BrickBase}
 * @constructor
 */
eYo.events.BrickMove = function(brick) {
  eYo.events.BrickMove.SuperProto_.constructor.Call(this, brick)
  var location = this.currentLocation_
  this.oldParentId = location.parentId
  this.oldName = location.name
  this.oldLeft = location.left
  this.oldCoordinate = location.coordinate
};
goog.inherits(eYo.events.BrickMove, eYo.events.BrickBase)

Object.defineProperties(eYo.events.BrickMove.prototype, {
  /**
   * Type of this event.
   * @type {string}
   */
  type: { value: eYo.events.BRICK_MOVE },
  /**
   * Returns the parentId and slot if the brick is connected,
   *   or the where location if disconnected.
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
        this.oldCoordinate.equals(this.newCoordinate)
    }
  },
})

/**
 * Record the brick's new location.  Called after the move.
 */
eYo.events.BrickMove.prototype.recordNew = function() {
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
eYo.events.BrickMove.prototype.run = function(forward) {
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
    parentBrick = this.board.getBrickById(parentId)
    if (!parentBrick) {
      console.warn("Can't connect to non-existent brick: " + parentId)
      return
    }
  }
  if (brick.parent) {
    brick.unplug()
  }
  if (coordinate) {
    brick.moveTo(coordinate)
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
      console.warn("Can't connect to non-existent slot: " + name)
    }
  }
}

/**
 * set the value of the property,
 * without validation but with undo and synchronization.
 * `duringChange` message is sent just before consolidating and undo registration.
 * Note on interference with the undo stack.
 * Let's suppose that we have triggered a UI event
 * that modifies some data of a brick.
 * As a consequence, this brick automatically changes type and
 * may be disconnected.
 * Take a look at what happens regarding the default undo/redo stack
 * management when connected bricks are involved
 * as data change.
 * NB the changeEnd method may disconnect
 *  1) normal flow
 *    a - the user asks for a data change
 *    b - the type change
 *    c - the connection check change triggering a disconnect brick event
 *    d - the data change undo event is trigerred
 *    undo/redo stacks : [..., reconnect brick, data undo change]/[]
 *  2) when undoing
 *    a - the user asks for an undo
 *    b - the data undo change is performed first
 *    c - the type change
 *    d - the connection check change but no undo event is recorded
 *        because no brick has been connected nor disconnected meanwhile
 *    e - the data rechange is pushed to the redo stack
 *    f - bricks are reconnected and the redo event is pushed to the redo stack
 *    undo/redo stacks : [...]/[disconnect brick, data rechange]
 *  3) when redoing
 *    a - bricks are disconnected and the reconnect event is pushed to the undo stack
 *    b - the data is rechanged, with type and connection checks.
 *        No brick is disconnected, no other move event is recorded.
 *    undo/redo stacks : [..., reconnect brick, data undo change]/[]
 * This is the reason why we consolidate the type before the undo change is recorded.
 * @param {Object} after
 * @param {Boolean} noRender
 */
eYo.data.Dflt_p.SetTrusted_ = eYo.decorate.reentrant_method(
  'setTrusted_',
  function (after) {
    var before = this.value_
    if (before !== after) {
      this.brick.change.wrap(() => { // catch `this`
        eYo.events.groupWrap(() => { // catch `this`
          this.beforeChange(before, after)
          try {
            this.value_ = after
            this.duringChange(before, after)
          } catch(err) {
            console.error(err)
            throw err
          } finally {
            if (!this.noUndo) {
              eYo.events.fireBrickChange(
                this.brick, eYo.Const.Event.DATA + this.key, null, before, after)
            }
            this.afterChange(before, after)
          }
        })
      })
    }
  }
)

/**
 * set the value of the property without any validation.
 * This is overriden by the events module.
 * @param {Object} after
 * @param {Boolean} noRender
 */
eYo.data.Dflt_p.SetTrusted = eYo.decorate.reentrant_method('trusted', eYo.data.Dflt_p.setTrusted_)

/*
function (try_f, finally_f) {
  try {
    eYo.events.group = true
    return try_f.call(this)
  } catch (err) {
    console.error(err)
    throw err
  } finally {
    finally_f && (finally_f.call(this))
    eYo.events.group = false
  }
}
*/
