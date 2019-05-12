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
goog.require('eYo.XRE')

// debug feature
// Object.defineProperties(
//   Blockly.Events,
//   {
//     disabled_: {
//       get () {
//         return this.disabled__ || 0
//       },
//       set (newValue) {
//         this.disabled__ = newValue
//       }
//     }
//   }
//)

/**
 * Run a change event.
 * @param {boolean} forward True if run forward, false if run backward (undo).
 * @suppress{accessControls}
 */
Blockly.Events.Change.prototype.run = (() => {
  var run = Blockly.Events.Change.prototype.run
  return function (forward) {
    if (!this.element.startsWith('eyo:')) {
      run.call(this, forward)
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
        block.eyo.lock()
      } else {
        block.eyo.unlock()
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
}) ()

Object.defineProperty(eYo.Events, 'recordUndo', {
  get () {
    return Blockly.Events.recordUndo
  }
})
/**
 * Start or stop a group.
 * @param {boolean|string} state True to start new group, false to end group.
 *   String to set group explicitly.
 */
eYo.Events.setGroup = (() => {
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
})()

/**
 * Event enabler.
 * Use the arrow definition of functions to catch `this`.
 * @param {!Function} try_f
 * @param {?Function} finally_f
 */
eYo.Events.enableWrap = eYo.Do.makeWrapper(
  Blockly.Events.enable,
  Blockly.Events.disable
)

/**
 * Event disabler.
 * Use the arrow definition of functions to catch `this`.
 * @param {!Function} try_f
 * @param {?Function} finally_f
 */
eYo.Events.disableWrap = eYo.Do.makeWrapper(
  Blockly.Events.disable,
  Blockly.Events.enable
)

/*
function (try_f, finally_f) {
  Blockly.Events.disable()
  var out
  try {
    out = try_f.call(this)
  } catch (err) {
    console.error(err)
    throw err
  } finally {
    Blockly.Events.enable()
    // enable first to allow finally_f to eventually fire events
    // or eventually modify `out`
    finally_f && finally_f.call(this)
    return out && out.ans
  }
}
*/

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
 *    f - blocks are reconnected and the redo event is pushed to the redo stack
 *    undo/redo stacks : [...]/[disconnect block, data rechange]
 *  3) when redoing
 *    a - blocks are disconnected and the reconnect event is pushed to the undo stack
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
      this.owner.changeWrap(() => { // catch `this`
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
              eYo.Events.fireDlgtChange(
                this.owner, eYo.Const.Event.DATA + this.key, null, oldValue, newValue)
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
 * Wrap the given function into a single undo group.
 * @param {!Function} try_f
 * @param {?Function} finally_f
 */
eYo.Events.groupWrap = (f, g) => {
  eYo.Do.makeWrapper(
  () => {
    eYo.Events.setGroup(true)
  },
  () => {
    eYo.Events.setGroup(false)
  },
  g)(f)
}

/*
function (try_f, finally_f) {
  try {
    eYo.Events.setGroup(true)
    return try_f.call(this)
  } catch (err) {
    console.error(err)
    throw err
  } finally {
    finally_f && finally_f.call(this)
    eYo.Events.setGroup(false)
  }
}
*/

/**
 * Convenient shortcut.
 * @param {!eYo.Brick} dlgt  The newly created block.
 */
eYo.Events.fireDlgtCreate = function (dlgt) {
  if (Blockly.Events.isEnabled()) {
    Blockly.Events.fire(new Blockly.Events.BlockCreate(dlgt.block_))
  }
}

/**
 * Convenient shortcut.
 * @param {!eYo.Brick} dlgt  The newly created block.
 */
eYo.Events.fireDlgtChange = function (block, element, name, oldValue, newValue) {
  if (Blockly.Events.isEnabled()) {
    Blockly.Events.fire(new Blockly.Events.BlockChange(dlgt.block_, element, name, oldValue, newValue))
  }
}
