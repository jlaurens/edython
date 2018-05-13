/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License CeCILL-B
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
      data.set(value)
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
      if (level > 0) {
        --level
      }
      if (!level) {
        Blockly.Events.setGroup(false)
      }
    }
  }
}())

goog.provide('eYo.Events.Disabler')
/**
 * Event disabler.
 */
eYo.Events.Disabler.wrap = function (f) {
  Blockly.Events.disable()
  try {
    f()
  } finally {
    Blockly.Events.enable()
  }
}

goog.require('eYo.Data')

/**
* set the value of the property,
* without validation but with undo and synchronization
* @param {Object} newValue
*/
eYo.Data.prototype.setTrusted_ = function (newValue) {
  eYo.Events.setGroup(true)
  var eyo = this.owner_
  var block = eyo.block_
  var old = eyo.skipRendering
  try {
    eyo.skipRendering = true
    var oldValue = this.value_
    this.willChange(oldValue, newValue)
    if (!this.noUndo && Blockly.Events.isEnabled()) {
      Blockly.Events.fire(new Blockly.Events.BlockChange(
        block, eYo.Const.Event.DATA + this.key, null, oldValue, newValue))
    }
    this.value_ = newValue
    this.didChange(oldValue, newValue)
    eyo.consolidate(block)
    this.synchronize(newValue)
    eyo.skipRendering = old
    !old && block.render() // render now or possibly later ?
  } finally {
    eyo.skipRendering = old
    eYo.Events.setGroup(false)
  }
}
