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
 * @namespace eYo.event
 */
goog.require('goog.array')

eYo.o4t.makeNS(eYo, 'event', {
  /**
   * Maximum number of undo events in stack. `0` turns off undo, `Infinity` sets it to unlimited (provided there is enough memory!).
   * @type {number}
   */
  MAX_UNDO: 1024,
  /**
   * Name of event that records a UI change.
   * @const
   */
  UI: 'ui',
  /**
   * Group ID for new events.  Grouped events are indivisible.
   * @type {string}
   * @private
   */
  group__: '',
  /**
   * Sets whether the next event should be added to the undo stack.
   * @type {boolean}
   */
  recordingUndo: true,
  /**
   * Allow change events to be created and fired.
   * @type {number}
   * @private
   */
  disabled__: 0,
  /**
   * Allow change events to be created and fired.
   * @type {number}
   * @private
   */
  level__: 0,
  /**
   * The queue.
   * @type {number}
   * @private
   */
  FIRE_QUEUE__: []
})

Object.defineProperties(eYo.event._p, {
  enabled: { 
    get () {
      return !this.disabled__
    }
   },
  /**
   * Current group.
   * @return {string} ID string.
   */
  group: {
    get () {
      return this.group__
    },
    /**
     * Start or stop a group.
     * @param {boolean|string} state True to start new group, false to end group.
     *   String to set group explicitly.
     */
    set (state) {
      if (eYo.isStr(state)) {
        this.group__ = state
        this.level__ = 1
      } else if (state) {
        if (!this.level++) {
          this.group__ = eYo.do.genUid()
        }
      } else if (this.level > 1) {
        --this.level
      } else if (this.level) {
        --this.level
        this.group__ = ''
      }
    },
  }
})

/**
 * Event enabler.
 * Use the arrow definition of functions to catch `this`.
 * @param {Function} try_f
 * @param {Function} [finally_f]
 */
eYo.event.enableWrap = eYo.do.makeWrapper(
  eYo.event.enable,
  eYo.event.disable
)

/**
 * Event disabler.
 * Use the arrow definition of functions to catch `this`.
 * @param {Function} try_f
 * @param {Function} [finally_f]
 */
eYo.event.disableWrap = eYo.do.makeWrapper(
  eYo.event.disable,
  eYo.event.enable
)

/**
 * Wrap the given function into a single undo group.
 * @param {Function} try_f
 * @param {Function} [finally_f]
 */
eYo.event.groupWrap = (f, g) => {
  eYo.do.makeWrapper(
    () => {
      eYo.event.group = true
    },
    () => {
      eYo.event.group = false
    },
  g)(f)
}

/**
 * Create a custom event and fire it.
 * @param {eYo.event.Dflt} event Custom data for event.
 */
eYo.event._p.fire = function(event) {
  if (!eYo.event.enabled) {
    return
  }
  if (!this.FIRE_QUEUE__.length) {
    // First event added; schedule a firing of the event queue.
    setTimeout(() => {
      var queue = eYo.event.filter(this.FIRE_QUEUE__, true)
      this.FIRE_QUEUE__.length = 0
      queue.forEach(event => {
        var board = eYo.board.byId(event.boardId)
        if (board) {
          board.eventDidFireChange(event)
        }
      })
    }, 0)
  }
  this.FIRE_QUEUE__.push(event)
}

/**
 * Modify pending undo events so that when they are fired they don't land
 * in the undo stack.  Called by eYo.event.Backer's clear.
 */
eYo.event._p.ClearPendingUndo = function() {
  this.FIRE_QUEUE__.forEach(event => (event.toUndoStack = false))
}

/**
 * Filter the queued events and merge duplicates.
 * @param {Array<!eYo.event.Dflt>} queueIn Array of events.
 * @param {boolean} forward True if forward (redo), false if backward (undo).
 * @return {!Array<!eYo.event.Dflt>} Array of filtered events.
 */
eYo.event._p.filter = function(queueIn, forward) {
  if (!forward) {
    // is it a create/move/delete sequence we are about to undo?
    if (queueIn.length === 3) {
      var first = queueIn[0]
      var last = queueIn[queueIn.length-1]
      if (!first.isNull && !last.isNull
          && first.isDelete
          && last.isCreate
          && first.boardId === last.boardId
          && first.group === last.group
          && first.brickId === last.brickId) {
        queueIn.length = 0
        return queueIn
      }
    }
  }
  var queue = eYo.copyRA(queueIn)
  if (!forward) {
    // Undo is merged in reverse order.
    queue.reverse()
  }
  var mergedQueue = []
  var eventsByKey = Object.create(null)
  // Merge duplicates.
  queue.forEach(event => {
    if (!event.isNull) {
      var key = event.key
      var lastEvent = eventsByKey[key]
      if (!lastEvent || !event.merge(lastEvent)) {
        eventsByKey[key] = event
        mergedQueue.push(event)
      }
    }
  })
  // Filter out any events that have become null due to merging.
  queue = mergedQueue.filter(e => !e.isNull)
  if (!forward) {
    // Restore undo order.
    queue.reverse()
  }
  return queue
}

/**
 * Stop sending events.  Every call to this function MUST also call enable.
 */
eYo.event.disable = function() {
  eYo.event.disabled__++
}

/**
 * Start sending events.  Unless events were already disabled when the
 * corresponding call to disable was made.
 */
eYo.event.enable = function() {
  eYo.event.disabled__--
}

/**
 * Enable/disable a brick depending on whether it is properly connected.
 * Use this on applications where all bricks should be connected to a top brick.
 * Recommend setting the 'disable' option to 'false' in the config so that
 * users don't try to reenable disabled orphan bricks.
 * @param {eYo.event.Dflt} event Custom data for event.
 */
eYo.event.disableOrphans = function(event) {
  if (event.isMove || event.isCreate) {
    var board = eYo.board.byId(event.boardId)
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
eYo.event.makeDflt({
  init (board) {
    /**
     * The board identifier for this event.
     * @type {string|eYo.NA}
     */
    this.boardId_ = board.id

    /**
     * The event group id for the group this event belongs to. Groups define
     * events that should be treated as an single action from the user's
     * perspective, and should be undone together.
     * @type {string}
     */
    this.group = eYo.event.group

    /**
     * Sets whether the event should be added to the undo stack.
     * @type {boolean}
     */
    this.toUndoStack = eYo.event.recordingUndo
  },
  properties: {
    /**
     * Is this a move event ?
     */
    isMove: {
      get () {
        false
      }
    },
    /**
     * Is this a create event ?
     */
    isCreate: {
      get () {
        return false
      }
    },
    /**
     * Is this a delete event ?
     */
    isDelete: {
      get () {
        return false
      }
    },
    /**
     * Is this a change event ?
     */
    isChange: {
      get () {
        return false
      }
    },
    /**
     * Does this event record any change of state?
     * @return {boolean} True if null, false if something changed.
     */
    isNull: {
      get () {
        return false
      }
    },
    key: {
      get () {
        return [this.eyo.key, this.brickId, this.boardId].join('.')
      }
    },
    boardID: eYo.NA,
    /**
     * Get board the event belongs to.
     * @return {eYo.board} The board the event belongs to.
     * @throws {Error} if board is null.
     * @protected
     */
    board: {
      get () {
        var board = eYo.board.byId(this.boardId)
        if (!board) {
          throw Error('Board is null. Event must have been generated from real' +
            ' Edython events.')
        }
        return board
      }
    },
  },
})

/**
 * Run an event.
 * @param {boolean} forward True if run forward, false if run backward (undo).
 */
eYo.event.Dflt_p.run = eYo.doNothing

/**
 * Merge the receiver with the given event.
 * @param {eYo.event.Dflt} event - an eYo event
 * @return {Boolean} Whether the change did occur.
 */
eYo.event.Dflt_p.merge = eYo.doNothing

/**
 * @name {eYo.event.Backer}
 * @param {Object} owner
 * @constructor
 */
eYo.o3d.makeC9r(eYo.event, 'Backer', {
  properties: {
    /**
     * @type {!Array<!eYo.event.Dflt>}
     * @protected
     */
    undoStack: {
      value () {
        return []
      },
    },
    /**
     * @type {!Array<!eYo.event.Dflt>}
     * @protected
     */
    redoStack: {
      value () {
        return []
      },
    },
    /**
     * Data to create an undo menu item.
     */
    undoMenuItemData: {
      value () {
        return {
          text: eYo.msg.UNDO,
          enabled: this.undoStack.length > 0,
          callback: this.undo.bind(this, false)
        }
      },
    },
    /**
     * Data to create a redo menu item.
     */
    redoMenuItemData: {
      get () {
        return {
          text: eYo.msg.REDO,
          enabled: this.redoStack_.length > 0,
          callback: this.undo.bind(this, true)
        }
      },
    },
  },
})

eYo.o4t.changeCount.merge(eYo.event.Backer)

/**
 * Clear the undo/redo stacks.
 */
eYo.event.Backer_p.clear = function() {
  this.undoStack.length = 0
  this.redoStack.length = 0
  // Stop any events already in the firing queue from being undoable.
  eYo.event.ClearPendingUndo()
  this.didClearUndo()
}

/**
 * Undo or redo the previous action.
 * @param {boolean} redo False if undo, true if redo.
 */
eYo.event.Backer_p.undo = function(redo) {
  var inputStack = redo ? this.redoStack_ : this.undoStack_
  var outputStack = redo ? this.undoStack_ : this.redoStack_
  while (true) {
    var inputEvent = inputStack.pop()
    if (!inputEvent) {
      return
    }
    var events = [inputEvent]
    // Do another undo/redo if the next one is of the same group.
    if (inputEvent.group) {
      while (inputStack.length &&
        inputEvent.group == inputStack[inputStack.length - 1].group) {
        events.push(inputStack.pop())
      }
    }
    events = eYo.event.filter(events, redo)
    if (events.length) {
      // Push these popped events on the opposite stack.
      events.forEach((event) => {
        outputStack.push(event)
      })
      eYo.event.recordingUndo = false
      var Bs = []
      eYo.do.tryFinally(() => { // try
        if (this.rendered) {
          events.forEach(event => {
            var b3k = this.getBrickById(event.brickId)
            if (b3k) {
              b3k.change.begin()
              Bs.push(b3k)
            }
          })
        }
        events.forEach(event => {
          event.run(redo)
          this.updateChangeCount(redo, event)
        })
      }, () => { // finally
        eYo.event.recordingUndo = true
        Bs.forEach(B => B.change.end())
        this.didProcessUndo(redo)
      })
      return
    }
  }
}

/**
 * The given event di fire a change.
 * Called by board's eventDidFireChange.
 * @param {eYo.event} event The event.
 * @param {function} task what is wrapped.
 */
eYo.event.Backer_p.eventDidFireChange = function(event, task) {
  if (event.toUndoStack) {
    this.undoStack_.push(event)
    this.redoStack_.length = 0
    var complete = this.didPushUndo
    if (this.undoStack_.length > this.ns.MAX_UNDO) {
      this.undoStack_.unshift()
      complete = this.didUnshiftUndo
    }
    task()
    this.updateChangeCount(true, event)
    complete.apply(this)
  } else {
    task()
  }
}

/**
 * Clear the undo/redo stacks.
 * Forwards to the owner.
 */
eYo.event.Backer_p.didClearUndo = eYo.doNothing

/**
 * Message sent when an undo has been processed.
 * Forwards to the owner.
 * @param {boolean} redo False if undo, true if redo.
 */
eYo.event.Backer_p.didProcessUndo = eYo.doNothing

/**
 * Message sent when an undo has been pushed.
 * Forwards to the owner.
 */
eYo.event.Backer_p.didPushUndo = eYo.doNothing

/**
 * Message sent when an undo has been unshifted.
 * Forwards to the owner.
 */
eYo.event.Backer_p.didUnshiftUndo = eYo.doNothing
