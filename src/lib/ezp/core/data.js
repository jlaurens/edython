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
 * @param {Object|null} mixins contains methods and properties.
 */
ezP.Data = function(owner, key, mixins) {
  goog.asserts.assert(owner, 'Missing owner')
  this.owner_ = owner // circular reference
  this.value_ = undefined
  this.key = key
  this.upperKey = key[0].toUpperCase()+key.slice(1)
  var p = this.constructor.prototype
  for (var x in mixins) {
    if (x !== 'get' && x !== 'set' && !x.startsWith('_') && !x.endsWith('_') && ezP.Do.hasOwnProperty(mixins, x)) {
      p[x] = mixins[x]
      console.log('ADDED:', x)
    } else {
      console.log('REFUSED:', x)
    }
  }
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
 * If this is a function it is evaluated with no argument.
 * May be overriden by the mixins.
 */
ezP.Data.prototype.default = undefined

/**
 * Init the value of the property.
 * May be overriden by the mixins.
 */
ezP.Data.prototype.init = function() {
  if (goog.isFunction(this.default)) {
    this.default()
  } else if (goog.isDefAndNotNull(this.default)) {
    this.set(this.default)
  }
  // transition
  var ezp = this.owner_
  var block = ezp.block_
  var key = 'init' + this.upperKey
  var init = ezp[key]
  init && init.call(ezp, block)
}

/**
 * When not undefined, this is the array of all possible values.
 * May be overriden by the mixins.
 * Do not use this directly because this can be a function.
 * Always use `getAll` instead.
 */
ezP.Data.prototype.all = undefined

/**
 * Get all the values.
 */
ezP.Data.prototype.getAll = function() {
  return goog.isFunction(this.all) && this.all() || goog.isArray(this.all) && this.all
}

/**
 * Validates the value of the property
 * May be overriden by the mixins.
 * @param {Object} newValue
 */
ezP.Data.prototype.validate = function(newValue) {
  var ezp = this.owner_
  var block = ezp.block_
  var key = 'validate' + this.upperKey
  var all = this.getAll()
  return ezp[key] && ezp[key].call(ezp, block, newValue) || (!all || all.indexOf(newValue) >= 0) && {validated: newValue} || null
}

/**
 * Will change the value of the property.
 * The signature is `willChange( oldValue, newValue ) → void`
 * May be overriden by the mixins.
 * @param {Object} oldValue
 * @param {Object} newValue
 * @return undefined
 */
ezP.Data.prototype.willChange = function(oldValue, newValue) {
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
 * May be overriden by the mixins.
 * @param {Object} oldValue
 * @param {Object} newValue
 * @return undefined
 */
ezP.Data.prototype.didChange = function(oldValue, newValue) {
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
 * May be overriden by the mixins.
 */
ezP.Data.prototype.noUndo = undefined

/**
 * Synchronize the value of the property with the UI.
 * May be overriden by the mixins.
 * @param {Object} newValue
 */
ezP.Data.prototype.synchronize = function(newValue) {
  var ezp = this.owner_
  var block = ezp.block_
  var key = 'synchronize' + this.upperKey
  ezp[key] && ezp[key].call(ezp, block, newValue)
}

/**
 * set the value of the property without any validation.
 * @param {Object} newValue
 */
ezP.Data.prototype.setTrusted = function (newValue) {
  var oldValue = this.value_
  this._willChange(oldValue, newValue)
  this.value_ = newValue
  this._didChange(oldValue, newValue)
  this.synchronize && this.synchronize(newValue)
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
    if (all) {
      newValue = all[newValue]
    }
  }
  if ((this.value_ === newValue) || !(newValue = this.validate(newValue)) || !goog.isDef(newValue = newValue.validated)) {
    this.synchronize && this.synchronize(newValue)
    return false
  }
  this.setTrusted(newValue)
  return true
}
