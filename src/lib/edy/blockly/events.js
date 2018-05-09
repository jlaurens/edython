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
goog.provide('edY.Events');

goog.require('Blockly.Events');
goog.require('edY.Const');
goog.require('edY.Do');

edY.Do.Events_Change_prototype_run =
Blockly.Events.Change.prototype.run
/**
 * Run a change event.
 * @param {boolean} forward True if run forward, false if run backward (undo).
 */
Blockly.Events.Change.prototype.run = function(forward) {
  if (!this.element.startsWith('edy:')) {
    edY.Do.Events_Change_prototype_run.call(this, forward)
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
    case edY.Const.Event.locked:
      if (value) {
        block.edy.lock(block)
      } else {
        block.edy.unlock(block)
      }
      break;
    case edY.Const.Event.awaited:
      block.edy.setAwaited(block, value)
      break;
    default:
      var m = XRegExp.exec(this.element, edY.XRE.event_data)
      var data
      if (m && (data = block.edy.data[m.key])) {
        data.set(value)
      } else {
        console.warn('Unknown change type: ' + this.element);
      }
  }
};

goog.provide('edY.Events.Disabler')
/**
 * Event disabler.
 */
edY.Events.Disabler.wrap = function(f) {
  Blockly.Events.disable()
  try {
    f()
  } finally {
    Blockly.Events.enable()
  }
}

goog.require('edY.Data')

/**
* set the value of the property,
* without validation but with undo and synchronization
* @param {Object} newValue
*/
edY.Data.prototype.setTrusted_ = function (newValue) {
  Blockly.Events.setGroup(true)
  var edy = this.owner_
  var block = edy.block_
  var old = edy.skipRendering
  try {
    edy.skipRendering = true
    var oldValue = this.value_
    this._willChange(oldValue, newValue)
    if (!this.noUndo && Blockly.Events.isEnabled()) {
      Blockly.Events.fire(new Blockly.Events.BlockChange(
      block, edY.Const.Event.DATA+this.key, null, oldValue, newValue))
    }
    this.value_ = newValue
    this._didChange(oldValue, newValue)
    edy.consolidate(block)
    this.synchronize(newValue)
    edy.skipRendering = old
    !old && block.render() // render now or possibly later ?
  } finally {
    edy.skipRendering = old
    Blockly.Events.setGroup(false)
  }
}
