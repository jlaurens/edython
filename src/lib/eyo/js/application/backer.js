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

eYo.require('eYo.Factory.Owned')

eYo.require('eYo.Protocol.ChangeCount')
eYo.provide('eYo.Backer')

eYo.forwardDeclare('eYo.Events')
eYo.forwardDeclare('eYo.Application')

/**
 * @param {Object} owner
 * @constructor
 */
eYo.Backer = function (owner) {
  eYo.Backer.superClass_.constructor.call(this, owner)
  /**
   * @type {!Array.<!eYo.Events.Abstract>}
   * @protected
   */
  this.undoStack_ = []
  /**
   * @type {!Array.<!eYo.Events.Abstract>}
   * @protected
   */
  this.redoStack_ = []
}
goog.inherits(eYo.Backer, eYo.Factory.Owned)

eYo.Protocol.add(eYo.Backer.prototype, 'ChangeCount')

Object.defineProperties(eYo.Backer.prototype, {
  /**
   * Maximum number of undo events in stack. `0` turns off undo, `Infinity` sets it to unlimited (provided there is enough memory!).
   * @type {number}
   */
  MAX_UNDO: {value: 1024, writable: true},
  /**
   * Data to create an undo menu item.
   */
  undoMenuItemData: {
    get () {
      return {
        text: eYo.Msg.UNDO,
        enabled: this.undoStack_.length > 0,
        callback: this.undo.bind(this, false)
      }
    }
  },
  /**
   * Data to create a redo menu item.
   */
  redoMenuItemData: {
    get () {
      return {
        text: eYo.Msg.REDO,
        enabled: this.redoStack_.length > 0,
        callback: this.undo.bind(this, true)
      }
    }
  }
})

/**
 * Dispose of this desk's backer.
 */
eYo.Backer.prototype.dispose = function() {
  this.undoStack_ = this.redoStack_ = null
  eYo.Backer.superClass_.dispose.call(this)
}

/**
 * Clear the undo/redo stacks.
 */
eYo.Backer.prototype.clear = function() {
  this.undoStack_.length = 0
  this.redoStack_.length = 0
  // Stop any events already in the firing queue from being undoable.
  eYo.Events.clearPendingUndo()
  eYo.app.didClearUndo && eYo.app.didClearUndo()
};

/**
 * Clear the undo/redo stacks.
 * Forwards to the owner.
 */
eYo.Backer.prototype.didClearUndo = function() {
  this.owner_ && this.owner_.didClearUndo && (this.owner_.didClearUndo())
};

/**
 * Undo or redo the previous action.
 * @param {boolean} redo False if undo, true if redo.
 */
eYo.Backer.prototype.undo = function(redo) {
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
    events = eYo.Events.filter(events, redo)
    if (events.length) {
      // Push these popped events on the opposite stack.
      events.forEach((event) => {
        outputStack.push(event)
      })
      eYo.Events.recordingUndo = false
      var Bs = []
      eYo.Do.tryFinally(() => { // try
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
        eYo.Events.recordingUndo = true
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
eYo.Backer.prototype.didProcessUndo = function(redo) {
  this.owner_ && this.owner_.didProcessUndo && (this.owner_.didProcessUndo(redo))
};

/**
 * The given event di fire a change.
 * Called by board's eventDidFireChange.
 * @param {eYo.Event} event The event.
 * @param {function} task what is wrapped.
 */
eYo.Backer.prototype.eventDidFireChange = function(event, task) {
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
};

/**
 * Message sent when an undo has been pushed.
 * Forwards to the owner.
 */
eYo.Backer.prototype.didPushUndo = function() {
  this.owner_ && this.owner_.didUnshiftUndo && (this.owner_.didUnshiftUndo())
};

/**
 * Message sent when an undo has been unshifted.
 * Forwards to the owner.
 */
eYo.Backer.prototype.didUnshiftUndo = function() {
  this.owner_ && this.owner_.didUnshiftUndo && (this.owner_.didUnshiftUndo())
};

