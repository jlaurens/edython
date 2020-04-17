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

//g@@g.forwardDeclare('g@@g.dom')

/**
 * Convenient shortcut.
 * @param {eYo.brick.BaseC9r} brick  The newly created brick.
 * @param {Boolean|String} [group]  eventually set a group.
 */
eYo.event.Mngr_p.fireBrickCreate = function (brick, group) {
  if (this.enabled) {
    eYo.isDef(group) && (this.group_ = group)
    this.fire(new eYo.event.BrickCreate(this, brick))
  }
}

/**
 * Convenient shortcut.
 * @param {eYo.brick.BaseC9r} brick  The newly created brick.
 */
eYo.event.Mngr_p.fireBrickChange = function (brick, element, name, before, after) {
  if (this.enabled) {
    eYo.event.fire(new eYo.event.BrickChange(this, brick, element, name, before, after))
  }
}

/**
 * Convenient shortcut.
 * @param {eYo.brick.BaseC9r} brick  The moved brick.
 * @param {Function} move  the move action, signature: (event) -> void
 */
eYo.event.Mngr_p.fireBrickMove = function (brick, move) {
  if (this.enabled) {
    let event = new eYo.event.BrickMove(this, brick)
    try {
      move(event)
    } finally {
      event.recordNew()
      eYo.event.fire(event)
    }
  } else {
    move()
  }
}

/**
 * Abstract class for a brick event.
 * @param {eYo.brick.BaseC9r} brick The brick this event corresponds to.
 * @extends {eYo.event.Abstract}
 * @constructor
 */
eYo.event.Abstract.makeInheritedC9r('BrickBase', {
  init (mngr, brick) {
    /**
     * The brick id for the brick this event pertains to
     * @type {string}
     */
    this.brickId_ = brick.id
  },
  properties: {
    brick: {
      get () {
        var board = this.board
        return board && board.getBrickById(this.brickId)
      }
    }
  }
})

/**
 * Class for a brick change event.
 * @param {eYo.brick.BaseC9r} brick The changed brick.
 * @param {string} element One of 'field', 'collapsed', 'disabled', etc.
 * @param {string} [name] Name of slot or field affected, or null.
 * @param {*} before - Previous value of element.
 * @param {*} after - New value of element.
 * @extends {eYo.event.BrickBase}
 * @constructor
 */
eYo.event.BrickBase.makeInheritedC9r('BrickChange', {
  init (mngr, brick, element, name, before, after) {
    this.element_ = element
    this.name_ = name
    this.before_ = before
    this.after_ = after
  },
  properties: {
    /**
     * Type of this event.
     * @type {Boolean}
     */
    isChange: {
      get () {
        return true
      },
    },
    /**
     * Merge the receiver with the given event.
     * @param {eYo.event.Abstract} event - an eYo event
     * @return {Boolean} Whether the change did occur.
     */
    merge (lastEvent) {
      if (this.element === lastEvent.element &&
        this.name === lastEvent.name) {
        // Merge change events.
        lastEvent.after = this.after
        return true
      }
    },
    /**
     * Does this event record any change of state?
     * @return {boolean} True if something changed.
     */
    isNull: {
      get () {
        return this.before === this.after
      }
    },
  }
})

/**
 * Run a change event.
 * @param {boolean} redo True if run forward, false if run backward (undo).
 */
eYo.event.BrickChange_p.run = function(redo) {
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
 * @param {eYo.brick.BaseC9r} brick The created brick.
 * @extends {eYo.event.BrickBase}
 * @constructor
 */
eYo.event.BrickBase.makeInheritedC9r('BrickCreate', {
  init(mngr, brick) {
    if (brick.board.rendered) {
      this.xml = eYo.xml.brickToDomWithWhere(brick)
    } else {
      this.xml = eYo.xml.brickToDom(brick)
    }
    this.ids = brick.descendantIds
  },
  properties: {
    /**
     * Type of this event.
     * @type {Boolean}
     */
    isCreate: {
      get () {
        return true
      },
    },
  }
})

/**
 * Run a creation event.
 * @param {boolean} forward True if run forward, false if run backward (undo).
 */
eYo.event.BrickCreate_p.run = function(forward) {
  var board = this.board
  if (forward) {
    var xml = eYo.dom.createDom('xml')
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
 * @param {eYo.brick.BaseC9r} brick The deleted brick.
 * @extends {eYo.event.BrickBase}
 * @constructor
 */
eYo.event.BrickBase.makeInheritedC9r('BrickDelete', {
  init (mngr, brick) {
    if (brick.parent) {
      throw 'Connected bricks cannot be deleted.'
    }
    if (brick.board.rendered) {
      this.oldXml = eYo.xml.brickToDomWithWhere(brick)
    } else {
      this.oldXml = eYo.xml.brickToDom(brick)
    }
    this.ids = brick.descendantIds
  },
  properties: {
    /**
     * Type of this event.
     * @type {Boolean}
     */
    isDelete: {
      get () {
        return true
      },
    },
  },
})

/**
 * Run a deletion event.
 * @param {boolean} forward True if run forward, false if run backward (undo).
 */
eYo.event.BrickDelete_p.run = function(forward) {
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
    var xml = eYo.dom.createDom('xml')
    xml.appendChild(this.oldXml)
    eYo.xml.domToBoard(xml, board)
  }
}

/**
 * Class for a brick move event.  Created before the move.
 * @param {eYo.brick.BaseC9r} brick The moved brick.
 * @extends {eYo.event.BrickBase}
 * @constructor
 */
eYo.event.BrickBase.makeInheritedC9r('BrickMove', {
  init (mngr, brick) {
    var location = this.currentLocation
    this.oldParentId = location.parentId
    this.oldName = location.name
    this.oldLeft = location.left
    this.oldCoordinate = location.coordinate
  },
  properties: {
    /**
     * Type of this event.
     * @type {Boolean}
     */
    isMove: {
      get () {
        return true
      },
    },
    /**
     * Merge the receiver with the given event.
     * @param {eYo.event.Abstract} event - an eYo event
     * @return {Boolean} Whether the change did occur.
     */
    merge (lastEvent) {
      lastEvent.newParentId = this.newParentId
      lastEvent.newInputName = this.newInputName
      lastEvent.newCoordinate = this.newCoordinate
      return true
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
    /**
     * Returns the parentId and slot if the brick is connected,
     *   or the where location if disconnected.
     * @return {!Object} Collection of location info.
     * @private
     */
    currentLocation: {
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
  }
})

/**
 * Record the brick's new location.  Called after the move.
 */
eYo.event.BrickMove_p.recordNew = function() {
  var location = this.currentLocation
  this.newParentId = location.parentId
  this.newName = location.name
  this.newLeft = location.left
  this.newCoordinate = location.coordinate
}

/**
 * Run a move event.
 * @param {boolean} forward True if run forward, false if run backward (undo).
 */
eYo.event.BrickMove_p.run = function(forward) {
  var b3k = this.brick
  if (!b3k) {
    console.warn("Can't move non-existent brick: " + this.brickId)
    return
  }
  var parentId = forward ? this.newParentId : this.oldParentId
  if (parentId) {
    var parentB3k = this.board.getBrickById(parentId)
    if (!parentB3k) {
      console.warn("Can't connect to non-existent brick: " + parentId)
      return
    }
  }
  if (b3k.parent) {
    b3k.unplug()
  }
  if (forward ? this.newCoordinate : this.oldCoordinate) {
    b3k.moveTo(coordinate)
  } else {
    var m4t, targetM4t
    var name = forward ? this.newName : this.oldName
    if (name) {
      m4t = b3k.output_m
      targetM4t = parentB3k.getMagnet(name)
    } else if (forward ? this.newLeft : this.oldLeft) {
      m4t = b3k.left_m
      targetM4t = parentB3k.right_m
    } else {
      m4t = b3k.head_m
      targetM4t = parentB3k.foot_m
    }
    if (targetM4t) {
      m4t.connect(targetM4t)
    } else {
      console.warn("Can't connect to non-existent slot: " + name)
    }
  }
}

eYo.data.BaseC9r.eyo.methodsMerge({
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
   */
  setRaw_ (after) {
    var before = this.stored__
    if (before !== after) {
      try {
        this.setRaw_ = eYo.doNothing
        this.changer.wrap(() => { // catch `this`
          eYo.event.groupWrap(() => { // catch `this`
            this.beforeChange(before, after)
            try {
              this.stored__ = after
              this.duringChange(before, after)
            } finally {
              if (!this.noUndo) {
                eYo.event.fireBrickChange(
                  this.brick, eYo.const.EVENT.DATA + this.key, null, before, after)
              }
              this.afterChange(before, after)
            }
          })
        })
      } finally {
        delete this.setRaw_
      }
    }
  },
})
