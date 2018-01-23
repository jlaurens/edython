/**
 * ezPython
 *
 * Copyright 2017 Jérôme LAURENS.
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

Blockly.Events.Change.prototype.run_original =
Blockly.Events.Change.prototype.run
/**
 * Run a change event.
 * @param {boolean} forward True if run forward, false if run backward (undo).
 */
Blockly.Events.Change.prototype.run = function(forward) {
  if (!this.element.startsWith('ezp')) {
    Blockly.Events.Change.prototype.run_original.call(this, forward)
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
    case ezP.Const.Event.input_disable:
      block.ezp.setInputDisabled(block, this.name, value)
      break;
    case ezP.Const.Event.change_operator:
      block.ezp.changeOperator(block, value)
      break;
    default:
      console.warn('Unknown change type: ' + this.element);
  }
};
