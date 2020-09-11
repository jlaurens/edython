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
 * These are not dom event.
 * @name {eYo.event}
 * @namespace
 */
eYo.o4t.newNS(eYo, 'event', {
  /**
   * Name of event that records a UI change.
   * @const
   */
  UI: 'ui',
})
//<<< mochai: CONST
//... chai.expect(eYo.event).property('UI')
//>>>

/**
 * Maximum number of undo events in stack. `0` turns off undo, `Infinity` sets it to unlimited (provided there is enough memory!).
 * @type {number}
 */
eYo.event.MAX_UNDO = 1024,
//<<< mochai: MAX_UNDO
//... chai.expect(eYo.event).property('MAX_UNDO')
//... eYo.event.MAX_UNDO = Infinity
//... chai.expect(eYo.event.MAX_UNDO).equal(Infinity)
//... eYo.event.MAX_UNDO = 1024
//>>>
//<<< mochai: Basics
//... chai.assert(eYo.event)
//... eYo.objectHasOwnProperty(chai.assert(eYo.event._p, 'C3sBase'))
//... chai.assert(eYo.event.Mngr)
//>>>

// No special Base class
eYo.event.makeC3sBase()

/**
 * An event manager.
 * @name {eYo.event.Mngr}
 * @constructor
 */
eYo.event.newC3s('Mngr', {
  //<<< mochai: eYo.event.Mngr
  init (/*key, owner*/) {
    // Private attributes
    /**
    * The queue.
    * @type {Array<eYo.Event>}
    * @private
    */
    this.fire_queue__ =  []
    /**
    * The stack.
    * @type {Array<String>}
    * @private
    */
    this.stack__ =  []
  },
  dispose () {
    this.fire_queue__.length = this.stack__.length = 0
    this.fire_queue__ = this.stack__ = eYo.NA
  },
  properties: {
    //<<< mochai: properties
    //... let mngr = new eYo.event.Mngr('mngr', onr)
    /**
     * Maximum number of undo events in stack. `0` turns off undo, `Infinity` sets it to unlimited (provided there is enough memory!).
     * @type {number}
     */
    MAX_UNDO: eYo.event.MAX_UNDO,
    //<<< mochai: MAX_UNDO
    //... chai.expect(mngr.MAX_UNDO).equal(eYo.event.MAX_UNDO)
    //... mngr.MAX_UNDO_ += 1
    //... chai.expect(mngr.MAX_UNDO).equal(eYo.event.MAX_UNDO + 1)
    //... mngr.MAX_UNDO_ -= 1
    //... chai.expect(mngr.MAX_UNDO).equal(eYo.event.MAX_UNDO)
    //...
    //>>>
    /**
     * Allow change events to be created and fired.
     * @type {number}
     * @private
     */
    disabled: {
      //<<< mochai: disabled/enabled
      value: 0,
      //... chai.expect(mngr.disabled).equal(0)
      //... chai.expect(mngr.enabled).true
      validate (after) {
        return after > 0 ? after : 0
      }
      //... mngr.disabled_ = 421
      //... chai.expect(mngr.disabled).equal(421)
      //... chai.expect(mngr.enabled).false
      //... mngr.disabled_ = -421
      //... chai.expect(mngr.disabled).equal(0)
      //... chai.expect(mngr.enabled).true
      //... chai.expect(() => {
      //...   mngr.enabled_ = 1
      //... }).throw
      //>>>
    },
    enabled: { 
      get () {
        return !this.disabled_
      },
    },
    /**
     * Sets whether the next event should be added to the undo stack.
     * @type {boolean}
     */
    recordingUndo: {
      //<<< mochai: recordingUndo
      value: true,
      //... chai.expect(mngr.recordingUndo).true
      validate (after) {
        return !!after
      },
      //... mngr.recordingUndo_ = false
      //... chai.expect(mngr.recordingUndo).false
      //... mngr.recordingUndo_ = true
      //... chai.expect(mngr.recordingUndo).true
      //... mngr.recordingUndo_ = 0
      //... chai.expect(mngr.recordingUndo).false
      //... mngr.recordingUndo_ = 1
      //... chai.expect(mngr.recordingUndo).true
      //>>>
    },
    /**
     * Current group.
     * @return {string} ID string.
     */
    group: '',
    /**
     * Allow change events to be created and fired.
     * @type {number}
     * @private
     */
    level: {
      get () {
        return this.stack__.length
      }
    },
    //>>>
  },
  methods: {
    //<<< mochai: methods
    //... let mngr = new eYo.event.Mngr('mngr', onr)
    beginGroup(after) {
      this.stack__.push(eYo.isStr(after) ? after : eYo.genUID())
    },
    endGroup () {
      this.stack__.pop()
    },
    /**
     * Event enabler.
     * @param {Object} [$this] - Optional value for `this`
     * @param {Function} try_f - Function
     * @param {Function} [finally_f] - Optional function
     */
    enableWrap ($this, try_f, finally_f) {
      //<<< mochai: enableWrap
      return eYo.do.makeWrapper(
        () => {
          let old = this.disabled_
          this.disabled_--
          return old
        },
        (old) => this.disabled_ = old,
      ) ($this, try_f, finally_f)
      //>>>
    },
    /**
     * Event disabler.
     * @param {Object} [$this] - Optional value for `this`
     * @param {Function} try_f - Function
     * @param {Function} [finally_f] - Optional function
     */
    disableWrap ($this, try_f, finally_f) {
      return eYo.do.makeWrapper(
        () => this.disabled_++,
        (old) => this.disabled_ = old,
        eYo.doNothing,
      ) ($this, try_f, finally_f)
    },
    /**
     * Wrap the given function into a single undo group.
     * @param {String} [group] - Optional group name
     * @param {Object} [$this] - Optional value for `this`
     * @param {Function} try_f - Function
     * @param {Function} [finally_f] - Optional function
     */
    groupWrap (group, $this, try_f, finally_f) {
      if (!eYo.isStr(group)) {
        eYo.isDef(finally_f) && eYo.throw(`${this.eyo$.name}/groupWrap: unexpected last argument (${finally_f})`)
        ;[group, $this, try_f, finally_f] = [true, group, $this, try_f]
      }
      if (eYo.isF($this)) {
        eYo.isDef(finally_f) && eYo.throw(`${this.eyo$.name}/groupWrap: unexpected last argument (${finally_f}/2)`)
        ;[$this, try_f, finally_f] = [eYo.NA, $this, try_f]
      }
      return group
        ? eYo.do.makeWrapper(
          () => this.beginGroup(group),
          eYo.doNothing,
          () => this.endGroup(),
        ) ($this, try_f, finally_f)
        : eYo.do.makeWrapper() ($this, try_f, finally_f)
    },
    //>>>
  },
  //>>>
})

eYo.event.Mngr[eYo.$].finalizeC3s()

/**
 * Create a custom event and fire it.
 * @param {eYo.event.Abstract} event - Custom data for event.
 */
eYo.event.Mngr_p.fire = function(event) {
  if (!this.enabled) {
    return
  }
  if (!this.fire_queue__.length) {
    // First event added; schedule a firing of the event queue.
    setTimeout(() => {
      let queue = this.filter(this.fire_queue__, true)
      this.fire_queue__.length = 0
      queue.forEach(event => {
        let board = eYo.board.byId(event.boardId)
        if (board) {
          board.eventDidFireChange(event)
        }
      })
    }, 0)
  }
  this.fire_queue__.push(event)
}

/**
 * Modify pending undo events so that when they are fired they don't land
 * in the undo stack.  Called by eYo.event.Mngr's clear.
 */
eYo.event.Mngr_p.clearPendingUndo = function() {
  this.fire_queue__.forEach(event => (event.toUndoStack = false))
}

/**
 * Filter the queued events and merge duplicates.
 * @param {Array<!eYo.event.Abstract>} queueIn Array of events.
 * @param {boolean} forward True if forward (redo), false if backward (undo).
 * @return {!Array<!eYo.event.Abstract>} Array of filtered events.
 */
eYo.event.Mngr_p.filter = function(queueIn, forward) {
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
 * Abstract class for an event.
 * @constructor
 */
eYo.event.newC3s('Abstract', {
  /**
   * 
   * @param {*} owner - The event manager is the owner
   * @param {*} board - Events are initiated by boards
   */
  init (owner, board) {
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
    this.group_ = this.owner.group
    /**
     * Sets whether the event should be added to the undo stack.
     * @type {boolean}
     */
    this.toUndoStack = this.owner.recordingUndo
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
        return [this.eyo$.key, this.brickId, this.boardId].join('.')
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
          throw Error('Board is null. Event must have been generated from real Edython events.')
        }
        return board
      }
    },
  },
  methods: {
    /**
     * Run an event.
     * @param {boolean} forward True if run forward, false if run backward (undo).
     */
    run: eYo.doNothing,
    /**
    * Merge the receiver with the given event.
    * @param {eYo.event.Abstract} event - an eYo event
    * @return {Boolean} Whether the change did occur.
    */
    merge: eYo.doNothing,
  },
})

;((eyo) => {
  eyo[eyo.p6y$.merge]({
    properties: {
      /**
       * @type {!Array<!eYo.event.Abstract>}
       * @protected
       */
      undoStack: {
        value () {
          return []
        },
      },
      /**
       * @type {!Array<!eYo.event.Abstract>}
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
})(eYo.event.Mngr[eYo.$])

eYo.o4t.changeCount.merge(eYo.event.Mngr)

/**
 * Clear the undo/redo stacks.
 */
eYo.event.Mngr_p.clear = function() {
  this.undoStack.length = 0
  this.redoStack.length = 0
  // Stop any events already in the firing queue from being undoable.
  this.eventMngr.clearPendingUndo()
  this.didClearUndo()
}

/**
 * Undo or redo the previous action.
 * @param {boolean} redo False if undo, true if redo.
 */
eYo.event.Mngr_p.undo = function(redo) {
  var inputStack = redo ? this.redoStack_ : this.undoStack_
  var outputStack = redo ? this.undoStack_ : this.redoStack_
  while (true) { // eslint-disable-line
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
              b3k.changer.begin()
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
        Bs.forEach(B => B.changer.end())
        this.didProcessUndo(redo)
      })
      return
    }
  }
}

/**
 * The given event did fire a change.
 * Called by board's eventDidFireChange.
 * @param {eYo.event} event The event.
 * @param {function} task what is wrapped.
 */
eYo.event.Mngr_p.eventDidFireChange = function(event, task) {
  if (event.toUndoStack) {
    this.undoStack_.push(event)
    this.redoStack_.length = 0
    var complete = this.didPushUndo
    if (this.undoStack_.length > this.owner.MAX_UNDO) {
      this.undoStack_.unshift().dispose()
      complete = this.didUnshiftUndo
    }
    try {
      task()
    } finally {
      this.updateChangeCount(true, event)
      complete.call(this)
    }
  } else {
    task()
  }
}

/**
 * Clear the undo/redo stacks.
 * Forwards to the owner.
 */
eYo.event.Mngr_p.didClearUndo = eYo.doNothing

/**
 * Message sent when an undo has been processed.
 * Forwards to the owner.
 * @param {boolean} redo False if undo, true if redo.
 */
eYo.event.Mngr_p.didProcessUndo = eYo.doNothing

/**
 * Message sent when an undo has been pushed.
 * Forwards to the owner.
 */
eYo.event.Mngr_p.didPushUndo = eYo.doNothing

/**
 * Message sent when an undo has been unshifted.
 * Forwards to the owner.
 */
eYo.event.Mngr_p.didUnshiftUndo = eYo.doNothing
