/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Generic undo manager.
 * @author jerome.laurens@u-bourgogne.fr
 */
'use strict'

eYo.require('c9r.Owned')

eYo.require('changeCount')

eYo.forwardDeclare('events')
eYo.forwardDeclare('app')

/**
 * @param {Object} owner
 * @constructor
 */
eYo.makeC9r('Backer', eYo.c9r.Owned, {
  valued: {
    /**
     * @type {!Array<!eYo.events.Abstract>}
     * @protected
     */
    undoStack: [],
    /**
     * @type {!Array<!eYo.events.Abstract>}
     * @protected
     */
    redoStack: [],
  },
  CONST: {
    /**
     * Maximum number of undo events in stack. `0` turns off undo, `Infinity` sets it to unlimited (provided there is enough memory!).
     * @type {number}
     */
    MAX_UNDO: 1024,
  },
  computed: {
    /**
     * Data to create an undo menu item.
     */
    undoMenuItemData () {
      return {
        text: eYo.msg.UNDO,
        enabled: this.undoStack_.length > 0,
        callback: this.undo.bind(this, false)
      }
    },
    /**
     * Data to create a redo menu item.
     */
    redoMenuItemData () {
      return {
        text: eYo.msg.REDO,
        enabled: this.redoStack_.length > 0,
        callback: this.undo.bind(this, true)
      }
    }
  },
})

eYo.Backer.eyo.changeCountAdd()

/**
 * Clear the undo/redo stacks.
 */
eYo.Backer_p.clear = function() {
  this.undoStack.length = 0
  this.redoStack.length = 0
  // Stop any events already in the firing queue from being undoable.
  eYo.events.ClearPendingUndo()
  this.didClearUndo()
}

/**
 * Clear the undo/redo stacks.
 * Forwards to the owner.
 */
eYo.Backer_p.didClearUndo = function() {
  this.app.didClearUndo && this.app.didClearUndo()
}

/**
 * Undo or redo the previous action.
 * @param {boolean} redo False if undo, true if redo.
 */
eYo.Backer_p.undo = function(redo) {
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
    events = eYo.events.filter(events, redo)
    if (events.length) {
      // Push these popped events on the opposite stack.
      events.forEach((event) => {
        outputStack.push(event)
      })
      eYo.events.recordingUndo = false
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
          this.updateChangeCount(event, redo)
        })
      }, () => { // finally
        eYo.events.recordingUndo = true
        Bs.forEach(B => B.change.end())
        this.didProcessUndo(redo)
      })
      return
    }
  }
}

/**
 * Message sent when an undo has been processed.
 * Forwards to the owner.
 * @param {boolean} redo False if undo, true if redo.
 */
eYo.Backer_p.didProcessUndo = function(redo) {
  this.app.didProcessUndo && this.app.didProcessUndo(redo)
}

/**
 * The given event di fire a change.
 * Called by board's eventDidFireChange.
 * @param {eYo.event} event The event.
 * @param {function} task what is wrapped.
 */
eYo.Backer_p.eventDidFireChange = function(event, task) {
  if (event.toUndoStack) {
    this.undoStack_.push(event)
    this.redoStack_.length = 0
    var complete = this.didPushUndo
    if (this.undoStack_.length > this.MAX_UNDO) {
      this.undoStack_.unshift()
      complete = this.didUnshiftUndo
    }
    task()
    this.updateChangeCount(event, true)
    complete.apply(this)
  } else {
    task()
  }
}

/**
 * Message sent when an undo has been pushed.
 * Forwards to the owner.
 */
eYo.Backer_p.didPushUndo = function() {
  this.app.didUnshiftUndo && this.app.didUnshiftUndo()
}

/**
 * Message sent when an undo has been unshifted.
 * Forwards to the owner.
 */
eYo.Backer_p.didUnshiftUndo = function() {
  this.app.didUnshiftUndo && this.app.didUnshiftUndo()
}
