/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Events overriden.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

/**
 * Events fired as a result of actions in Edython.
 * @namespace eYo.events
 */
goog.require('goog.array')

eYo.makeNS('events')

eYo.provide('events.abstract')

Object.defineProperties(eYo.events, {
  /**
   * Name of event that creates a block.
   * @const
   */
  BRICK_CREATE: { value: 'create' },
  /**
   * Name of event that deletes a block.
   * @const
   */
  BRICK_DELETE: { value: 'delete' },
  /**
   * Name of event that creates a block.
   * @const
   */
  BRICK_CHANGE: { value: 'change' },
  /**
   * Name of event that moves a block.
   * @const
   */
  BRICK_MOVE: { value: 'move' },
  /**
   * Group ID for new events.  Grouped events are indivisible.
   * @type {string}
   * @private
   */
  group_: { value: '', writable: true },
  /**
   * Sets whether the next event should be added to the undo stack.
   * @type {boolean}
   */
  recordingUndo: { value: true, writable: true },
  /**
   * Allow change events to be created and fired.
   * @type {number}
   * @private
   */
  disabled_: { value: 0, writable: true },
  /**
   * Allow change events to be created and fired.
   * @type {number}
   * @private
   */
  enabled: { 
    get () {
      return !this.disabled_
    }
   },
  /**
   * Name of event that records a UI change.
   * @const
   */
  UI: { value: 'ui' },
  /**
   * Current group.
   * @return {string} ID string.
   */
  group: {
    get () {
      return eYo.events.group_
    },
    /**
     * Start or stop a group.
     * @param {boolean|string} state True to start new group, false to end group.
     *   String to set group explicitly.
     */
    set: (() => {
      var level = 0
      return state => {
        if (eYo.isStr(state)) {
          eYo.events.group_ = state
          level = 1
        } else if (state) {
          if (!level++) {
            eYo.events.group_ = eYo.do.genUid()
          }
        } else {
          if (level > 1) {
            --level
          } else if (level) {
            --level
            eYo.events.group_ = ''
          }
        }
      }
    })()
  }
})

/**
 * Event enabler.
 * Use the arrow definition of functions to catch `this`.
 * @param {Function} try_f
 * @param {Function} [finally_f]
 */
eYo.events.enableWrap = eYo.do.makeWrapper(
  eYo.events.enable,
  eYo.events.disable
)

/**
 * Event disabler.
 * Use the arrow definition of functions to catch `this`.
 * @param {Function} try_f
 * @param {Function} [finally_f]
 */
eYo.events.disableWrap = eYo.do.makeWrapper(
  eYo.events.disable,
  eYo.events.enable
)

/**
 * Wrap the given function into a single undo group.
 * @param {Function} try_f
 * @param {Function} [finally_f]
 */
eYo.events.groupWrap = (f, g) => {
  eYo.do.makeWrapper(
    () => {
      eYo.events.group = true
    },
    () => {
      eYo.events.group = false
    },
  g)(f)
}

(()=>{
  var FIRE_QUEUE_ = []
  /**
   * Create a custom event and fire it.
   * @param {eYo.events.Abstract} event Custom data for event.
   */
  eYo.events.fire = function(event) {
    if (!eYo.events.enabled) {
      return
    }
    if (!FIRE_QUEUE_.length) {
      // First event added; schedule a firing of the event queue.
      setTimeout(() => {
        var queue = eYo.events.filter(FIRE_QUEUE_, true)
        FIRE_QUEUE_.length = 0
        queue.forEach(event => {
          var board = eYo.Board.ById(event.boardId)
          if (board) {
            board.eventDidFireChange(event)
          }
        })
      }, 0)
    }
    FIRE_QUEUE_.push(event)
  }

  /**
   * Modify pending undo events so that when they are fired they don't land
   * in the undo stack.  Called by eYo.Backer's clear.
   */
  eYo.events.ClearPendingUndo = function() {
    FIRE_QUEUE_.forEach(event => (event.toUndoStack = false))
  }
})()

/**
 * Filter the queued events and merge duplicates.
 * @param {Array<!eYo.events.Abstract>} queueIn Array of events.
 * @param {boolean} forward True if forward (redo), false if backward (undo).
 * @return {!Array<!eYo.events.Abstract>} Array of filtered events.
 */
eYo.events.filter = function(queueIn, forward) {
  if (!forward) {
    // is it a create/move/delete sequence we are about to undo?
    if (queueIn.length === 3) {
      var first = queueIn[0]
      var last = queueIn[queueIn.length-1]
      if (!first.isNull && !last.isNull
          && first.type === eYo.events.DELETE
          && last.type === eYo.events.CREATE
          && first.boardId === last.boardId
          && first.group === last.group
          && first.brickId === last.brickId) {
        queueIn.length = 0
        return queueIn
      }
    }
  }
  var queue = goog.array.clone(queueIn)
  if (!forward) {
    // Undo is merged in reverse order.
    queue.reverse()
  }
  var mergedQueue = []
  var hash = Object.create(null);
  // Merge duplicates.
  queue.forEach(event => {
    if (!event.isNull) {
      var key = [event.type, event.brickId, event.boardId].join(' ')
      var lastEvent = hash[key]
      if (!lastEvent) {
        hash[key] = event
        mergedQueue.push(event)
      } else if (event.type == eYo.events.BLOCK_MOVE) {
        // Merge move events.
        lastEvent.newParentId = event.newParentId;
        lastEvent.newInputName = event.newInputName;
        lastEvent.newCoordinate = event.newCoordinate;
      } else if (event.type == eYo.events.BLOCK_CHANGE &&
          event.element == lastEvent.element &&
          event.name == lastEvent.name) {
        // Merge change events.
        lastEvent.after = event.after
      } else {
        // Collision: newer events should merge into this event to maintain order
        hash[key] = event
        mergedQueue.push(event)
      }
    }
  })
  // Filter out any events that have become null due to merging.
  queue = mergedQueue.filter((e) => !e.isNull)
  if (!forward) {
    // Restore undo order.
    queue.reverse()
  }
  return queue
}

/**
 * Stop sending events.  Every call to this function MUST also call enable.
 */
eYo.events.disable = function() {
  eYo.events.disabled_++
};

/**
 * Start sending events.  Unless events were already disabled when the
 * corresponding call to disable was made.
 */
eYo.events.enable = function() {
  eYo.events.disabled_--
}

/**
 * Enable/disable a brick depending on whether it is properly connected.
 * Use this on applications where all bricks should be connected to a top brick.
 * Recommend setting the 'disable' option to 'false' in the config so that
 * users don't try to reenable disabled orphan bricks.
 * @param {eYo.events.Abstract} event Custom data for event.
 */
eYo.events.disableOrphans = function(event) {
  if (event.type === eYo.events.BRICK_MOVE ||
      event.type === eYo.events.BRICK_CREATE) {
    var board = eYo.Board.ById(event.boardId)
    var brick = board.getBrickById(event.brickId)
    if (brick) {
      if (brick.parent && !brick.parent.disabled) {
        brick.descendants.forEach(child => child.disabled = false)
      } else if ((brick.output_m || brick.head_m || brick.left_m) &&
                 !board.desk.desktop.isDragging) {
        do {
          brick.disabled = true
          brick = brick.foot
        } while (brick)
      }
    }
  }
}

/**
 * Abstract class for an event.
 * @constructor
 */
eYo.events.Abstract = function(board) {
  /**
   * The board identifier for this event.
   * @type {string|eYo.NA}
   */
  this.boardId = board.id

  /**
   * The event group id for the group this event belongs to. Groups define
   * events that should be treated as an single action from the user's
   * perspective, and should be undone together.
   * @type {string}
   */
  this.group = eYo.events.group

  /**
   * Sets whether the event should be added to the undo stack.
   * @type {boolean}
   */
  this.toUndoStack = eYo.events.recordingUndo
}

Object.defineProperties(eYo.events.Abstract.prototype, {
  /**
   * Does this event record any change of state?
   * @return {boolean} True if null, false if something changed.
   */
  isNull: {
    get () {
      return false
    }
  },
  /**
   * Get board the event belongs to.
   * @return {eYo.Board} The board the event belongs to.
   * @throws {Error} if board is null.
   * @protected
   */
  board: {
    get () {
      var board = eYo.Board.ById(this.boardId)
      if (!board) {
        throw Error('Board is null. Event must have been generated from real' +
          ' Edython events.')
      }
      return board
    }
  }
})

/**
 * Run an event.
 * @param {boolean} forward True if run forward, false if run backward (undo).
 */
eYo.events.Abstract.prototype.run = eYo.do.nothing

