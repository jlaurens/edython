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

goog.provide('ezP.Tile')

goog.require('ezP.Do')

goog.require('Blockly.Input')

/**
 * Convenient method to wrap the Blockly input object for the outside.
 * The model is one of the entries of the `tiles` section
 * of the object used to create a delegate's subclass.
 * Here are some specifications for that model part.
 *
 * Any tile is constructed the same way
 * 1) operator field
 * 2) label field
 * 3) start field
 * 4) either editable field, value input of wrapped block.
 * 5) end field
 * 
  // we assume that one input model only contains at most one of
  // - editable field
  // - value input, check: key
  // - wrap input
  // - insert input
  // It may contain label fields
 * @param {!Object} owner  The owner is a block delegate.
 * @param {!string} key  One of the keys in `tiles` section of the model.
 * @param {!Object} tileModel  the model for the given key i the above mention section.
 */
ezP.Tiles = function(owner, key, tileModel) {
  goog.asserts.assert(owner, 'Missing owner')
  goog.asserts.assert(key, 'Missing key')
  goog.asserts.assert(tileModel, 'Missing model')
  this.owner = owner
  this.key = key
  this.model = tileModel
  this.input = undefined
  this.fields = Object.create(null)
  this.orderedFields = Object.create(null)
  // First create the Blockly's input, if necessary
  if ((model = tileModel.wrap)) {
    goog.asserts.assert(model, 'wrap must exist '+block.type+'.'+i)
    this.setInput(block.appendWrapValueInput(key, model, tileModel.optional, tileModel.hidden))
  } else if (tileModel.check) {
    this.setInput(block.appendValueInput(key))
  }
  // Start with labels
  var setupField = function(field, model) {
    field.ezp.model = model
    if (!(field.ezp.css_class = model.css_class || model.css && 'ezp-code-'+model.css)) {
      switch(ezP.Do.typeOfString(field.getValue())) {
        case ezP.T3.Expr.reserved_identifier:
        case ezP.T3.Expr.reserved_keyword:
        field.ezp.css_class = 'ezp-code-reserved'
        break
        case ezP.T3.Expr.builtin_name:
        field.ezp.css_class = 'ezp-code-builtin'
        break
        default:
        field.ezp.css_class = 'ezp-code'
      }
    }
    field.ezp.css_style = model.css_style
  }
  var doLabel = function(fieldKey, order) {
    var value = tileModel[fieldKey]
    if (goog.isString(value)) {
      field = new ezP.FieldLabel(value)
      setupField(field, tileModel)
    } else if (goog.isDefAndNotNull(value)) {
      field = new ezP.FieldLabel(value)
      setupField(field, value)
    } else {
      return
    }
    this.registerField(field, order)
  }
  doLabel.call(this, ezP.Key.OPERATOR, 0)
  doLabel.call(this, ezP.Key.LABEL, 1)
  doLabel.call(this, ezP.Key.START, 2)
  doLabel.call(this, ezP.Key.END, -1) // the last field
  // manage the unique editable field, if any
  var model, name = 'edit'
  if (goog.isDefAndNotNull(model = tileModel[name])) {
    var field = new ezP.FieldInput(model.value || '', model.validator, key)
    setupField(field, model)
    this.registerField(field)
  }
}

/**
 * Setup the field according to the model.
 * For ezPython.
 * @param {!ezP.FieldLabel} field
 * @param {Object} model
 */
ezP.Do.setupField = function (field, model) {
  if (!(field.ezp.css_class = model.css_class || model.css && 'ezp-code-'+model.css)) {
    switch(ezP.Do.typeOfString(field.getValue())) {
      case ezP.T3.Expr.reserved_identifier:
      case ezP.T3.Expr.reserved_keyword:
      field.ezp.css_class = 'ezp-code-reserved'
      break
      case ezP.T3.Expr.builtin_name:
      field.ezp.css_class = 'ezp-code-builtin'
      break
      default:
      field.ezp.css_class = 'ezp-code'
    }
  }
  field.ezp.css_style = model.css_style
  if (goog.isFunction(model.placeholder)) {
    field.placeholderText = model.placeholder
  } else if (model.placeholder) {
    field.placeholderText = function() {
      var p = model.placeholder
      return function() {
        return this.placeholderText_ || p
      }
    } ()
  }
}

/**
 * Set the underlying Blockly input.
 * Some time we will not need these inputs.
 * For ezPython.
 * @param {!Blockly.Input} input
 */
ezP.Tile.prototype.setInput = function (input) {
  this.input = input
  this.connection = input.connection
  input.ezp.model = this.model
  var c8n = this.connection
  if (c8n) {
    var ezp = c8n.ezp
    ezp.name_ = this.key
    if (this.model.plugged) {
      ezp.plugged_ = D.plugged
    }
    if (goog.isFunction(this.model.willConnect)) {
      ezp.willConnect = this.model.willConnect
    }
    if (goog.isFunction(this.model.didConnect)) {
      ezp.didConnect = this.model.didConnect
    }
    if (goog.isFunction(this.model.willDisconnect)) {
      ezp.willDisconnect = this.model.willDisconnect
    }
    if (goog.isFunction(this.model.didDisconnect)) {
      ezp.didDisconnect = this.model.didDisconnect
    }
    if (this.model.suite && Object.keys(this.model.suite).length) {
      goog.mixin(ezp, this.model.suite)
    }
    if (this.model.optional) {//svg
      ezp.optional_ = true
    }
    ezp.disabled_ = this.model.disabled && !this.model.enabled
    var v
    if ((v = this.model.check)) {
      c8n.setCheck(v)
      ezp.hole_data = ezP.HoleFiller.getData(v, this.model.hole_value)
    } else if ((v = this.model.check = this.model.wrap)) {
      c8n.setCheck(v)
    }
  }
}

/**
 * Record the Blockly field.
 * If the receiver is expected to have an input, register the fields
 * after the input is created.
 * For ezPython.
 * @param {!Blockly.Field} field
 */
ezP.Tile.prototype.registerField = function (field, order) {
  goog.asserts.assert(field.name, 'Any field must have a name, inluding label fields')
  // setup the graph of objects
  this.fields[field.name] = field
  this.input && (this.input.ezp.fields[field.name] = field)
  field.ezp.tile = this
  if (goog.isNumber(order)) {
    this.orderedFields[order] = field
  }
  // initialize
  field.setSourceBlock(this.owner.block_)
  field.init()
}

/**
 * Whether the input has a connection.
 * For ezPython.
 * @param {!Blockly.Input} workspace The block's workspace.
 */
ezP.Tile.prototype.getConnection = function () {
  return this.input && this.input.connection
}

/**
 * Geth the workspace.
 * For ezPython.
 * @param {!Blockly.Input} workspace The block's workspace.
 */
ezP.Tile.prototype.getWorkspace = function () {
  return this.connection && this.connection.sourceBlock_.workspace
}

/**
 * The target.
 * For ezPython.
 * @param {!Blockly.Input} workspace The block's workspace.
 */
ezP.Tile.prototype.getTarget = function () {
  return this.connection && this.connection.targetBlock()
}

/**
 * Set the disable state.
 * For ezPython.
 * @param {!Blockly.Input} workspace The block's workspace.
 */
ezP.Tile.prototype.setDisabled = function (newValue) {
  this.disabled = newValue
  this.synchronize()
}

/**
 * Get the required status.
 * For ezPython.
 * @param {boolean} newValue.
 */
ezP.Tile.prototype.isRequiredToDom = function () {
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
ezP.Tile.prototype.setRequiredFromDom = function (newValue) {
  this.required_from = newValue
}

/**
 * Get the required status.
 * For ezPython.
 * @param {boolean} newValue.
 */
ezP.Tile.prototype.isRequiredFromDom = function () {
  return this.required_from
}

/**
 * Set the disable state.
 * For ezPython.
 * @param {!Blockly.Input} workspace The block's workspace.
 */
ezP.Tile.prototype.synchronize = function () {
  this.owner.setInputDisabled(this.owner.block_, this.input, this.disabled)
}

/**
 * Set the value of the field in the input given by its index
 * and the key.
 * @param {!Object} newValue.
 * @param {string} fieldKey  of the input holder in the ui object 
 * @private
 */
ezP.Tile.prototype.setFieldValue = function (newValue, fieldKey) {
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
