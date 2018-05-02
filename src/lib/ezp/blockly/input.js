/**
 * ezPython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview Input extension for ezPython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('ezP.Input')

goog.require('ezP')
goog.require('Blockly.Input')

/**
 * Convenient method to wrap the Blockly input object for the outside.
 * For ezPython.
 * @param {!Blockly.Input} workspace The block's workspace.
 */
ezP.Input = function (owner, key, model) {
  this.owner = owner
  this.key = key
  this.model = model
  this.input = undefined
  this.fields = Object.create(null)
}

/**
 * Set the underlying Blockly input.
 * Some time we will not need these inputs.
 * For ezPython.
 * @param {!Blockly.Input} input
 */
ezP.Input.prototype.setInput = function (input) {
  this.input = input
  this.connection = input.connection
  input.ezp.model = this.model
  var c8n = this.connection
  if (c8n) {
    var ezp = c8n.ezp
    ezp.name_ = this.key
    if (D.plugged) {
      ezp.plugged_ = D.plugged
      //console.log(k, ezp.plugged_)
    }
    if (goog.isFunction(D.willConnect)) {
      ezp.willConnect = D.willConnect
    }
    if (goog.isFunction(D.didConnect)) {
      ezp.didConnect = D.didConnect
    }
    if (goog.isFunction(D.willDisconnect)) {
      ezp.willDisconnect = D.willDisconnect
    }
    if (goog.isFunction(D.didDisconnect)) {
      ezp.didDisconnect = D.didDisconnect
    }
    if (D.suite && Object.keys(D.suite).length) {
      goog.mixin(ezp, D.suite)
    }
    if (D.optional) {//svg
      ezp.optional_ = true
    }
    ezp.disabled_ = D.disabled && !D.enabled
    if ((v = D.check)) {
      c8n.setCheck(v)
      ezp.hole_data = ezP.HoleFiller.getData(v, D.hole_value)
    } else if ((v = D.check = D.wrap)) {
      c8n.setCheck(v)
    }
  }

}

/**
 * Record the Blockly field.
 * For ezPython.
 * @param {!Blockly.Input} input
 */
ezP.Input.prototype.registerField = function (field) {
  goog.asserts.assert(field.name, 'Any field must have a name, inluding label fields')
  this.fields[field.name] = this.input.ezp.fields[field.name] = field
}

/**
 * Whether the input has a connection.
 * For ezPython.
 * @param {!Blockly.Input} workspace The block's workspace.
 */
ezP.Input.prototype.getConnection = function () {
  return this.input && this.input.connection
}

/**
 * Geth the workspace.
 * For ezPython.
 * @param {!Blockly.Input} workspace The block's workspace.
 */
ezP.Input.prototype.getWorkspace = function () {
  return this.connection && this.connection.sourceBlock_.workspace
}

/**
 * The target.
 * For ezPython.
 * @param {!Blockly.Input} workspace The block's workspace.
 */
ezP.Input.prototype.getTarget = function () {
  return this.connection && this.connection.targetBlock()
}

/**
 * Set the disable state.
 * For ezPython.
 * @param {!Blockly.Input} workspace The block's workspace.
 */
ezP.Input.prototype.setDisabled = function (newValue) {
  this.disabled = newValue
  this.synchronize()
}

/**
 * Get the required status.
 * For ezPython.
 * @param {boolean} newValue.
 */
ezP.Input.prototype.isRequiredToDom = function () {
  if (this.disabled) {
    return false
  }
  if (!this.connection) {
    return false
  }
  if (this.connection.targetBlock()) {
    return true
  }
  return !this.connection.ezp.optional_
}

/**
 * Set the required status.
 * For ezPython.
 */
ezP.Input.prototype.setRequiredFromDom = function (newValue) {
  this.required_from = newValue
}

/**
 * Get the required status.
 * For ezPython.
 * @param {boolean} newValue.
 */
ezP.Input.prototype.isRequiredFromDom = function () {
  return this.required_from
}

/**
 * Set the disable state.
 * For ezPython.
 * @param {!Blockly.Input} workspace The block's workspace.
 */
ezP.Input.prototype.synchronize = function () {
  this.owner.setInputDisabled(this.owner.block_, this.input, this.disabled)
}


/**
 * Set the value of the field in the input given by its index
 * and the key.
 * @param {!Object} newValue.
 * @param {string} fieldKey  of the input holder in the ui object 
 * @private
 */
ezP.Input.prototype.setFieldValue = function (newValue, fieldKey) {
  var field = this.fields[fieldKey]
  if (field) {
    if (Blockly.Events.isEnabled()) {
      Blockly.Events.disable()
      var enable = true
    }
    try {
      field.setValue(newValue)
    } finally {
      enable && Blockly.Events.enable()
    }
  }
}

/**
 * Add an ezp object to an input to store extra information.
 * All this extra information is gathered under a dedicated namespace
 * to avoid name collisions.
 * This is not a delegate because there are few informations or actions needed.
 * Subclassing would not fit here.
 * For ezPython.
 * @param {!Blockly.Input} workspace The block's workspace.
 */
ezP.Input.setupEzpData = function (input, data) {
  if (!input.ezp) {
    input.ezp = {
      fields: {},
      // sealed_: false, // blocks are not sealed
      // s7r_: false,// consolidator, whether the input is a separator
    }
    if (data) {
      goog.mixin(input.ezp, data)
    }
    var connection = input.connection
    if (connection) {
      connection.ezp.name_ = input.name // the connection remembers the name of the input such that checking is fine grained.
    }  
  }
}

Blockly.Input.prototype.ezp = undefined
