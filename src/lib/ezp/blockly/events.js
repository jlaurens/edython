/**
 * ezPython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview Block for ezPython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'


/**
 * Events fired as a result of actions in Blockly's editor.
 * @namespace Blockly.Events
 */
goog.provide('ezP.Events');

goog.require('Blockly.Events');
goog.require('ezP.Const');
goog.require('ezP.Do');

ezP.Do.Events_Change_prototype_run =
Blockly.Events.Change.prototype.run
/**
 * Run a change event.
 * @param {boolean} forward True if run forward, false if run backward (undo).
 */
Blockly.Events.Change.prototype.run = function(forward) {
  if (!this.element.startsWith('ezp:')) {
    ezP.Do.Events_Change_prototype_run.call(this, forward)
    return
  }
  var workspace = this.getEventWorkspace_();
  var block = workspace.getBlockById(this.blockId);
  if (!block) {
    console.warn("Can't change non-existant block: " + this.blockId);
    return;
  }
  if (block.mutator) {
    // Close the mutator (if open) since we don't want to update it.
    block.mutator.setVisible(false);
  }
  var value = forward ? this.newValue : this.oldValue;
  switch (this.element) {
    case ezP.Const.Event.locked:
      if (value) {
        block.ezp.lock(block)
      } else {
        block.ezp.unlock(block)
      }
      break;
    case ezP.Const.Event.awaited:
      block.ezp.setAwaited(block, value)
      break;
    default:
      var m = XRegExp.exec(this.element, ezP.XRE.event_data)
      var data
      if (m && (data = block.ezp.data[m.key])) {
        data.set(value)
      } else {
        console.warn('Unknown change type: ' + this.element);
      }
  }
};

/**
 * Event disabler.
 */
ezP.Events.Disabler = function() {
  if (Blockly.Events.isEnabled()) {
    Blockly.Events.disable()
    return {
      stop: function() {
        if(this.fired) {
          return
        }
        this.fired = true
        Blockly.Events.enable()
      }
    }
  } else {
    return {
      stop: function() {}
    }
  }
}

/**
 * Event disabler.
 */
ezP.Events.Disabler.wrap = function(f) {
  var disabler = new ezP.Events.Disabler()
  try {
    f()
  } finally {
    disabler.stop()
  }
}

/**
 * Event disabler.
 */
ezP.Events.Grouper = function() {
  if (Blockly.Events.getGroup()) {
    return {
      stop: function() {}
    }
  } else {
    Blockly.Events.setGroup(true)
    return {
      stop: function() {
        Blockly.Events.setGroup(false)
      }
    }
  }
}

goog.require('ezP.Data')

/**
* set the value of the property,
* without validation but with undo and synchronization
* @param {Object} newValue
*/
ezP.Data.prototype.setTrusted_ = function (newValue) {
  var grouper = new ezP.Events.Grouper()
  var ezp = this.owner_
  var block = ezp.block_
  var old = ezp.skipRendering
  try {
    ezp.skipRendering = true
    var oldValue = this.value_
    this._willChange(oldValue, newValue)
    if (!this.noUndo && Blockly.Events.isEnabled()) {
      Blockly.Events.fire(new Blockly.Events.BlockChange(
      block, ezP.Const.Event.DATA+this.key, null, oldValue, newValue))
    }
    this.value_ = newValue
    this._didChange(oldValue, newValue)
    this.synchronize(newValue)
    ezp.consolidateType(block)
    ezp.skipRendering = old
    !old && block.render() // render now or possibly later ?
  } finally {
    ezp.skipRendering = old
    grouper.stop()
  }
}
