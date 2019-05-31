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
 * @namespace eYo.Events
 */
goog.provide('eYo.Events')
goog.provide('eYo.Events.Abstract')

goog.require('eYo')

goog.require('goog.array')
goog.require('goog.math.Coordinate')

Object.defineProperties(eYo.Events, {
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
  recordUndo: { value: true, writable: true },
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
   * List of events queued for firing.
   * @private
   */
  FIRE_QUEUE_: { value: [] },
  /**
   * Current group.
   * @return {string} ID string.
   */
  group: {
    get () {
      return eYo.Events.group_
    },
    /**
     * Start or stop a group.
     * @param {boolean|string} state True to start new group, false to end group.
     *   String to set group explicitly.
     */
    set: (() => {
      var level = 0
      return state => {
        if (goog.isString(state)) {
          eYo.Events.group = state
          level = 1
        } else if (state) {
          if (!level++) {
            eYo.Events.group = eYo.Do.genUid()
          }
        } else {
          if (level > 1) {
            --level
          } else if (level) {
            --level
            eYo.Events.group = ''
          }
        }
      }
    })()
  }
})

/**
 * Event enabler.
 * Use the arrow definition of functions to catch `this`.
 * @param {!Function} try_f
 * @param {?Function} finally_f
 */
eYo.Events.enableWrap = eYo.Do.makeWrapper(
  eYo.Events.enable,
  eYo.Events.disable
)

/**
 * Event disabler.
 * Use the arrow definition of functions to catch `this`.
 * @param {!Function} try_f
 * @param {?Function} finally_f
 */
eYo.Events.disableWrap = eYo.Do.makeWrapper(
  eYo.Events.disable,
  eYo.Events.enable
)

/**
 * Wrap the given function into a single undo group.
 * @param {!Function} try_f
 * @param {?Function} finally_f
 */
eYo.Events.groupWrap = (f, g) => {
  eYo.Do.makeWrapper(
    () => {
      eYo.Events.group = true
    },
    () => {
      eYo.Events.group = false
    },
  g)(f)
}


/**
 * Create a custom event and fire it.
 * @param {!eYo.Events.Abstract} event Custom data for event.
 */
eYo.Events.fire = function(event) {
  if (!eYo.Events.enabled) {
    return
  }
  if (!eYo.Events.FIRE_QUEUE_.length) {
    // First event added; schedule a firing of the event queue.
    setTimeout(() => {
      var queue = eYo.Events.filter(eYo.Events.FIRE_QUEUE_, true)
      eYo.Events.FIRE_QUEUE_.length = 0
      queue.forEach(event => {
        var workspace = eYo.Workspace.getById(event.workspaceId)
        if (workspace) {
          workspace.fireChangeListener(event)
        }
      }) 
    }, 0)
  }
  eYo.Events.FIRE_QUEUE_.push(event)
}

/**
 * Filter the queued events and merge duplicates.
 * @param {!Array.<!eYo.Events.Abstract>} queueIn Array of events.
 * @param {boolean} forward True if forward (redo), false if backward (undo).
 * @return {!Array.<!eYo.Events.Abstract>} Array of filtered events.
 */
eYo.Events.filter = function(queueIn, forward) {
  if (!forward) {
    // is it a create/move/delete sequence we are about to undo?
    if (queueIn.length === 3) {
      var first = queueIn[0]
      var last = queueIn[queueIn.length-1]
      if (!first.isNull() && !last.isNull()
          && first.type === eYo.Events.DELETE
          && last.type === eYo.Events.CREATE
          && first.workspaceId === last.workspaceId
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
    if (!event.isNull()) {
      var key = [event.type, event.brickId, event.workspaceId].join(' ')
      var lastEvent = hash[key]
      if (!lastEvent) {
        hash[key] = event
        mergedQueue.push(event)
      } else if (event.type == eYo.Events.BLOCK_MOVE) {
        // Merge move events.
        lastEvent.newParentId = event.newParentId;
        lastEvent.newInputName = event.newInputName;
        lastEvent.newCoordinate = event.newCoordinate;
      } else if (event.type == eYo.Events.BLOCK_CHANGE &&
          event.element == lastEvent.element &&
          event.name == lastEvent.name) {
        // Merge change events.
        lastEvent.newValue = event.newValue
      } else {
        // Collision: newer events should merge into this event to maintain order
        hash[key] = event
        mergedQueue.push(event)
      }
    }
  })
  // Filter out any events that have become null due to merging.
  queue = mergedQueue.filter((e) => !e.isNull())
  if (!forward) {
    // Restore undo order.
    queue.reverse()
  }
  return queue
}

/**
 * Modify pending undo events so that when they are fired they don't land
 * in the undo stack.  Called by eYo.Workspace.clearUndo.
 */
eYo.Events.clearPendingUndo = function() {
  eYo.Events.FIRE_QUEUE_.forEach(event => (event.recordUndo = false))
}

/**
 * Stop sending events.  Every call to this function MUST also call enable.
 */
eYo.Events.disable = function() {
  eYo.Events.disabled_++
};

/**
 * Start sending events.  Unless events were already disabled when the
 * corresponding call to disable was made.
 */
eYo.Events.enable = function() {
  eYo.Events.disabled_--
}

/**
 * Enable/disable a brick depending on whether it is properly connected.
 * Use this on applications where all bricks should be connected to a top brick.
 * Recommend setting the 'disable' option to 'false' in the config so that
 * users don't try to reenable disabled orphan bricks.
 * @param {!eYo.Events.Abstract} event Custom data for event.
 */
eYo.Events.disableOrphans = function(event) {
  if (event.type === eYo.Events.BRICK_MOVE ||
      event.type === eYo.Events.BRICK_CREATE) {
    var workspace = eYo.Workspace.getById(event.workspaceId)
    var brick = workspace.getBrickById(event.brickId)
    if (brick) {
      if (brick.parent && !brick.parent.disabled) {
        brick.descendants.forEach(child => child.disabled = false)
      } else if ((brick.output_m || brick.head_m || brick.left_m) &&
                 !workspace.isDragging()) {
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
eYo.Events.Abstract = function(workspace) {
  /**
   * The workspace identifier for this event.
   * @type {string|undefined}
   */
  this.workspaceId = workspace.id

  /**
   * The event group id for the group this event belongs to. Groups define
   * events that should be treated as an single action from the user's
   * perspective, and should be undone together.
   * @type {string}
   */
  this.group = eYo.Events.group

  /**
   * Sets whether the event should be added to the undo stack.
   * @type {boolean}
   */
  this.recordUndo = eYo.Events.recordUndo
}

Object.defineProperties(eYo.Events.Abstract.prototype, {
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
   * Get workspace the event belongs to.
   * @return {eYo.Workspace} The workspace the event belongs to.
   * @throws {Error} if workspace is null.
   * @protected
   */
  workspace: {
    get () {
      var workspace = eYo.Workspace.getById(this.workspaceId)
      if (!workspace) {
        throw Error('Workspace is null. Event must have been generated from real' +
          ' Edython events.')
      }
      return workspace
    }
  }
})

/**
 * Run an event.
 * @param {boolean} forward True if run forward, false if run backward (undo).
 */
eYo.Events.Abstract.prototype.run = eYo.Do.nothing

