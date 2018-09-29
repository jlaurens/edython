/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview Block for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

/**
 * Events fired as a result of actions in Blockly's editor.
 * @namespace Blockly.Events
 */
goog.provide('eYo.Events')

goog.require('Blockly.Events')
goog.require('eYo.Const')
goog.require('eYo.Do')

eYo.Do.Events_Change_prototype_run =
Blockly.Events.Change.prototype.run
/**
 * Run a change event.
 * @param {boolean} forward True if run forward, false if run backward (undo).
 * @suppress{accessControls}
 */
Blockly.Events.Change.prototype.run = function (forward) {
  if (!this.element.startsWith('eyo:')) {
    eYo.Do.Events_Change_prototype_run.call(this, forward)
    return
  }
  var workspace = this.getEventWorkspace_()
  var block = workspace.getBlockById(this.blockId)
  if (!block) {
    console.warn("Can't change non-existant block: " + this.blockId)
    return
  }
  if (block.mutator) {
    // Close the mutator (if open) since we don't want to update it.
    block.mutator.setVisible(false)
  }
  var value = forward ? this.newValue : this.oldValue
  switch (this.element) {
  case eYo.Const.Event.locked:
    if (value) {
      block.eyo.lock(block)
    } else {
      block.eyo.unlock(block)
    }
    break
  default:
    var m = XRegExp.exec(this.element, eYo.XRE.event_data)
    var data
    if (m && (data = block.eyo.data[m.key])) {
      data.set(value, false) // do not validate, it may change value
    } else {
      console.warn('Unknown change type: ' + this.element)
    }
  }
}

/**
 * Start or stop a group.
 * @param {boolean|string} state True to start new group, false to end group.
 *   String to set group explicitly.
 */
eYo.Events.setGroup = (function () {
  var level = 0
  return function (state) {
    if (goog.isString(state)) {
      Blockly.Events.setGroup(state)
      level = 1
    } else if (state) {
      if (!level++) {
        Blockly.Events.setGroup(true)
      }
    } else {
      if (level > 1) {
        --level
      } else if (level) {
        --level
        Blockly.Events.setGroup(false)
      }
    }
  }
}())

/**
 * Event disabler.
 * @param {?Object} self, for `this`.
 * @param {!Function} try_f
 * @param {?Function} finally_f
 */
eYo.Events.disableWrap = function (self, try_f, finally_f) {
  Blockly.Events.disable()
  var out
  try {
    out = try_f.call(self)
  } catch (err) {
    console.error(err)
    throw err
  } finally {
    Blockly.Events.enable()
    // enable first to allow finally_f to eventually fire events
    // or eventually modify `out`
    finally_f && finally_f.call(self)
    return out && out.return
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
 * management when connected blocks are involved
 * as data change.
 * NB the changeEnd method may disconnect
 *  1) normal flow
 *    a - the user asks for a data change
 *    b - the type and subtype change
 *    c - the connection check change triggering a disconnect block event
 *    d - the data change undo event is trigerred
 *    undo/redo stacks : [..., reconnect block, data undo change]/[]
 *  2) when undoing
 *    a - the user asks for an undo
 *    b - the data undo change is performed first
 *    c - the type and subtype change
 *    d - the connection check change but no undo event is recorded
 *        because no block has been connected nor disconnected meanwhile
 *    e - the data rechange is pushed to the redo stack
 *    f - blocks are reconnected and the redo event is pushed to the redo stack
 *    undo/redo stacks : [...]/[disconnect block, data rechange]
 *  3 ) when redoing
 *    a - blocks are disconnected and the reconnect event is pushed to the undo stack
 *    b - the data is rechanged, with type, subtype and connection checks.
 *        No block is disconnected, no other move event is recorded.
 *    undo/redo stacks : [..., reconnect block, data undo change]/[]
 * This is the reason why we consolidate the type before the undo change is recorded.
 * @param {Object} newValue
 * @param {Boolean} noRender
 */
eYo.Data.prototype.setTrusted_ = eYo.Decorate.reentrant_method(
  'setTrusted_',
  function (newValue) {
    var data = this
    this.error = false
    var eyo = this.owner
    var block = eyo.block_
    var oldValue = this.value_
    eyo.changeWrap(
      function () {
        eYo.Events.groupWrap(data,
          function () {
            this.beforeChange(oldValue, newValue)
            try {
              this.value_ = newValue
              this.duringChange(oldValue, newValue)
            } catch(err) {
              console.error(err)
              throw err
            } finally {
              if (!this.noUndo && Blockly.Events.isEnabled()) {
                Blockly.Events.fire(new Blockly.Events.BlockChange(
                  block, eYo.Const.Event.DATA + this.key, null, oldValue, newValue))
              }
              this.afterChange(oldValue, newValue)
            }
          }
        )    
      }
    )
  }
)

/**
 * set the value of the property without any validation.
 * This is overriden by the events module.
 * @param {Object} newValue
 * @param {Boolean} noRender
 */
eYo.Data.prototype.setTrusted = eYo.Decorate.reentrant_method('trusted', eYo.Data.prototype.setTrusted_)

eYo.Events.filter = Blockly.Events.filter 

/**
 * Filter the queued events and merge duplicates.
 * @param {!Array.<!Blockly.Events.Abstract>} queueIn Array of events.
 * @param {boolean} forward True if forward (redo), false if backward (undo).
 * @return {!Array.<!Blockly.Events.Abstract>} Array of filtered events.
 */
Blockly.Events.filter = function(queueIn, forward) {
  if (!forward) {
    // is it a create/move/delete sequence we are about to undo?
    if (queueIn.length === 3) {
      var first = queueIn[0]
      var last = queueIn[queueIn.length-1]
      if (!first.isNull() && !last.isNull()
          && first.type === Blockly.Events.DELETE
          && last.type === Blockly.Events.CREATE
          && first.workspaceId === last.workspaceId
          && first.group === last.group
          && first.blockId === last.blockId) {
        queueIn.length = 0
        return queueIn
      }
    }
  }
  return eYo.Events.filter(queueIn, forward)
}


/**
 * Filter the queued events and merge duplicates.
 * @param {!Function} do_it
 * @param {self} This
 */
eYo.Events.groupWrap = function (self, try_f, finally_f) {
  try {
    eYo.Events.setGroup(true)
    return try_f.call(self)
  } catch (err) {
    console.error(err)
    throw err
  } finally {
    finally_f && finally_f.call(self)
    eYo.Events.setGroup(false)
  }
}
