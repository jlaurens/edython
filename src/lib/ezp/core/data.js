/**
 * ezPython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview ezP.Data is a class for a data controller.
 * It merely provides the API.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.require('ezP')
goog.provide('ezP.Data')

/**
 * Base property constructor.
 * For ezPython.
 * @param {!Object} owner The object owning the data.
 * @param {!string} key name of the data.
 * @param {!Object} model contains methods and properties.
 * It is shared by all data controllers belonging to the same kind
 * of owner. Great care should be taken when editing this model.
 */
ezP.Data = function(owner, key, model) {
  goog.asserts.assert(owner, 'Missing owner')
  goog.asserts.assert(key, 'Missing key')
  goog.asserts.assert(model, 'Missing model')
  this.owner_ = owner // circular reference
  this.ui = owner.ui
  this.data = owner.data
  this.value_ = undefined
  this.key = key
  this.model = model
  this.upperKey = key[0].toUpperCase()+key.slice(1)
  this.name = 'ezp:'+(this.model.name || this.key).toLowerCase()
}

/**
 * Get the owner of the data.
 * Actually, this is a block delegate.
 */
ezP.Data.prototype.getOwner = function() {
  return this.owner_
}

/**
 * Get the value of the data
 * @param {Object} newValue
 */
ezP.Data.prototype.get = function() {
  if (goog.isDef(this.value_) || this.lock_get) {
    return this.value_
  }
  if (this.init) {
    try {
      this.lock_get = true
      this.init()
    } finally {
      delete this.lock_get
    }
  }
  return this.value_
}

/**
 * When not undefined, this is the default used to initialize
 * the value. May be an index in the the `all` array.
 * If this is a function it is evaluated with no argument
 * and the result is used as default.
 * May be overriden by the model.
 */
ezP.Data.prototype.default = undefined

/**
 * Set the value with no extra task.
 * The `set` method will use hooks before and after the change.
 * No such thing here.
 * If the given value is an index, use instead the corresponding
 * item in the `getAll()` array.
 */
ezP.Data.prototype.internalSet = function(newValue) {
  if (goog.isNumber(newValue)) {
    var all = this.getAll()
    if (all && goog.isDefAndNotNull(all = all[newValue])) {
      newValue = all
    }
  }
  this.value_ = newValue
}

/**
 * Init the value of the property.
 * May be overriden by the model.
 */
ezP.Data.prototype.init = function() {
  if (goog.isFunction(this.model.init)) {
    this.model.init.call(this)
    return
  }
  if (goog.isFunction(this.model.default)) {
    this.internalSet(this.model.default.call(this))
  } else if (goog.isDefAndNotNull(this.model.default)) {
    this.internalSet(this.model.default)
  }
  // transitional, will be removed soon
  var ezp = this.owner_
  var block = ezp.block_
  var key = 'init' + this.upperKey
  var init = ezp[key]
  init && init.call(ezp, block)
}

/**
 * When not undefined, this is the array of all possible values.
 * May be overriden by the model.
 * Do not use this directly because this can be a function.
 * Always use `getAll` instead.
 */
ezP.Data.prototype.all = undefined

/**
 * Get all the values.
 */
ezP.Data.prototype.getAll = function() {
  var all = this.model.all
  return goog.isArray(all) && all || goog.isFunction(all) && goog.isArray(all = all()) && all 
}

/**
 * Validates the value of the property
 * May be overriden by the model.
 * @param {Object} newValue
 */
ezP.Data.prototype.validate = function(newValue) {
  if (goog.isFunction(this.model.validate)) {
    return this.model.validate.call(this, newValue)
  }
  var ezp = this.owner_
  var block = ezp.block_
  var key = 'validate' + this.upperKey
  var all = this.getAll()
  return ezp[key] && ezp[key].call(ezp, block, newValue) || (!all || all.indexOf(newValue) >= 0) && {validated: newValue} || null
}

/**
 * Will change the value of the property.
 * The signature is `willChange( oldValue, newValue ) → void`
 * May be overriden by the model.
 * @param {Object} oldValue
 * @param {Object} newValue
 * @return undefined
 */
ezP.Data.prototype.willChange = function(oldValue, newValue) {
  if (goog.isFunction(this.model.willChange)) {
    this.model.willChange.call(this, oldValue, newValue)
    return
  }
  var ezp = this.owner_
  var block = ezp.block_
  var key = 'willChange' + this.upperKey
  ezp[key] && ezp[key].call(ezp, block, oldValue, newValue)
}

/**
 * Private wrapper over willChange
 * @param {Object} oldValue
 * @param {Object} newValue
 * @return undefined
 */
ezP.Data.prototype._willChange = function(oldValue, newValue) {
  if (this.lock_willChange) {
    return
  }
  try {
    this.lock_willChange = true
    this.willChange(oldValue, newValue)
  } finally {
    delete this.lock_willChange
  }
}

/**
 * Did change the value of the property.
 * The signature is `didChange( oldValue, newValue ) → void`
 * May be overriden by the model.
 * @param {Object} oldValue
 * @param {Object} newValue
 * @return undefined
 */
ezP.Data.prototype.didChange = function(oldValue, newValue) {
  if (goog.isFunction(this.model.didChange)) {
    this.model.didChange.call(this, oldValue, newValue)
    return
  }
  var ezp = this.owner_
  var block = ezp.block_
  var key = 'didChange' + this.upperKey
  ezp[key] && ezp[key].call(ezp, block, oldValue, newValue)
}

/**
 * Private wrapper over didChange
 * @param {Object} oldValue
 * @param {Object} newValue
 * @return undefined
 */
ezP.Data.prototype._didChange = function(oldValue, newValue) {
  if (this.lock_didChange) {
    return
  }
  try {
    this.lock_didChange = true
    this.didChange(oldValue, newValue)
  } finally {
    delete this.lock_didChange
  }
}

/**
 * Wether a value change fires an undo event.
 * May be overriden by the model.
 */
ezP.Data.prototype.noUndo = undefined

/**
 * Synchronize the value of the property with the UI.
 * May be overriden by the model.
 * @param {Object} newValue
 */
ezP.Data.prototype.synchronize = function(newValue) {
  if (goog.isFunction(this.model.synchronize)) {
    this.model.synchronize.call(this, newValue)
    return
  }
  var ezp = this.owner_
  var block = ezp.block_
  var key = 'synchronize' + this.upperKey
  ezp[key] && ezp[key].call(ezp, block, newValue)
}

/**
 * Consolidate the data.
 * May be overriden by the model.
 * @param {Object} newValue
 */
ezP.Data.prototype.consolidate = function() {
  if (goog.isFunction(this.model.consolidate)) {
    this.model.consolidate.call(this)
    return
  }
  var ezp = this.owner_
  var block = ezp.block_
  var key = 'consolidate' + this.upperKey
  ezp[key] && ezp[key].call(ezp, block)
}

/**
 * set the value of the property without any validation.
 * If the value is a number, change to the corresponding item
 * in the `getAll()` array.
 * @param {Object} newValue
 */
ezP.Data.prototype.setTrusted = function (newValue) {
  if (goog.isNumber(newValue)) {
    var all = this.getAll()
    if (all && goog.isDefAndNotNull(all = all[newValue])) {
      newValue = all
    }
  }
  this.setTrusted_(newValue)
}

/**
 * set the value of the property without any validation.
 * @param {Object} newValue
 */
ezP.Data.prototype.setTrusted_ = function (newValue) {
  var oldValue = this.value_
  this._willChange(oldValue, newValue)
  this.value_ = newValue
  this._didChange(oldValue, newValue)
  this.synchronize(newValue)
}

/**
 * set the value of the property,
 * with validation, undo and synchronization.
 * Always synchronize, even when no value changed.
 * @param {Object} newValue
 */
ezP.Data.prototype.set = function (newValue) {
  if (goog.isNumber(newValue)) {
    var all = this.getAll()
    if (all && goog.isDefAndNotNull(all = all[newValue])) {
      newValue = all
    }
  }
  if ((this.value_ === newValue) || !(newValue = this.validate(newValue)) || !goog.isDef(newValue = newValue.validated)) {
    this.synchronize(this.value_)
    return false
  }
  this.setTrusted_(newValue)
  return true
}

/**
 * set the value of the corresponding field.
 * @param {string} inputName
 * @param {string} fieldKey
 * @param {Object} newValue
 */
ezP.Data.prototype.setFieldValue = function(inputName, fieldKey, newValue) {
  var ui = this.owner_.ui
  for (var i = 0; i < 5; i++) {
    var u = ui['i_'+i]
    if (u && u.input.name === inputName) {
      var f = u.fields[fieldKey]
      if (f) {
        f.setValue(newValue)
        return true
      }
    }
  }
}

/**
 * Set the enable/disable status of the given input.
 * @param {!number} index  of the input older in the ui object 
 * @param {!boolean} newValue.
 * @private
 */
ezP.Data.prototype.setInputDisabled = function (inputIndex, newValue) {
  var i = this.ui['i_' + inputIndex]
  i && this.owner_.setInputDisabled(this.owner_.block_, i.input, newValue)
}

console.warn ('Change the model design for i_(\d): {...} to $1: {...}')
/**
 * Set the value of the field in the input given by its index
 * and the key.
 * @param {!Object} newValue.
 * @param {!number} inputIndex  of the input in the model (i_1, i_2...) 
 * When false, this corresponds to the fields that are not
 * part of an input, like the modifier field.
 * @param {string|null} fieldKey  of the input holder in the ui object 
 * @private
 */
ezP.Data.prototype.setFieldValue = function (newValue, inputIndex, fieldKey, noUndo) {
  var i = inputIndex && this.ui['i_' + inputIndex] || this.ui
  var field = i.fields[fieldKey || this.key]
  if (field) {
    if (!noUndo && !this.noUndo && Blockly.Events.isEnabled()) {
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
 * Set the visible status of the field in the input given by its index
 * and the key.
 * @param {!Object} newValue.
 * @param {!number} inputIndex  of the input in the model (i_1, i_2...) 
 * When false, this corresponds to the fields that are not
 * part of an input, like the modifier field.
 * @param {string|null} fieldKey  of the input holder in the ui object 
 * @private
 */
ezP.Data.prototype.setFieldVisible = function (newValue, inputIndex, fieldKey) {
  var i = inputIndex && this.ui['i_' + inputIndex] || this.ui
  var field = i.fields[fieldKey || this.key]
  if (field) {
    field.setVisible(newValue)
  }
}
