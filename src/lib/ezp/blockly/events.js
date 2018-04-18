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
    case ezP.Const.Event.input_disable:
      block.ezp.setNamedInputDisabled(block, this.name, value)
      break;
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
      var m = XRegExp.exec(this.element, ezP.XRE.event_property)
      if (m) {
        switch(m.key) {
          case 'subtype': block.ezp.setSubtype(block, value); break
          case 'value': block.ezp.setValue(block, value); break
          case 'modifier': block.ezp.setModifier(block, value); break
          case 'variant': block.ezp.setVariant(block, value); break
          default:
          var k = 'set'+m.key.charAt(0).toUpperCase() + m.key.slice(1)
          var setter = block.ezp[k]
          setter && setter.call(block.ezp, block, value) || block.ezp.setProperty(block, m.key, value)
        }
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
