/**
 * ezPython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview Base for properties.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.require('ezP')
goog.provide('ezP.')

/**
 * Base property constructor.
 * For ezPython.
 * @param {!Blockly.Block} Ctor The constructor to add the property to.
 * @param {!string} key Whether to unlock statements too.
 * @param {Object} params.
 * @return the number of block locked
 */
ezP.Data = function(block) {
  goog.asserts.assert(block, 'Missing block')
  this.block_ = block // circular reference
  this.value_ = undefined
}

/**
 * set the value of the property
 */
ezP.Data.prototype.getBlock = function() {
  return this.block_
}

/**
 * set the value of the property
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
 * May be overriden by mixin.
 */
ezP.Data.prototype.default = undefined

/**
 * Init the value of the property.
 * May be set in the mixins.
 */
ezP.Data.prototype.init = function() {
  if (goog.isDefAndNotNull(this.default)) {
    this.set(this.default)
  }
  // transition
  var block = this.block_
  var ezp = block.ezp
  var key = 'init' + this.upperKey
  var init = ezp[key]
  init && init.call(ezp, block)
}

/**
 * When not undefined, this is the array of all possible values.
 * May be overriden by mixin.
 */
ezP.Data.prototype.all = undefined

/**
 * Get all the values. Transitional.
 */
ezP.Data.prototype.getAll = function() {
  return goog.isArray(this.all) && this.all || this.block_.ezp.getModel().inputs[this.key+'s']
}

/**
 * Validates the value of the property
 * May be overriden by mixin
 * @param {Object} newValue
 */
ezP.Data.prototype.validate = function(newValue) {
  var block = this.block_
  var ezp = block.ezp
  var key = 'validate' + this.upperKey
  var all = this.getAll()
  return ezp[key] && ezp[key].call(ezp, block, newValue) || (!all || all.indexOf(newValue) >= 0) && {validated: newValue} || null
}

/**
 * Will change the value of the property.
 * The signature is `willChange( oldValue, newValue ) → void`
 * May be overriden by mixin
 * @param {Object} oldValue
 * @param {Object} newValue
 * @return undefined
 */
ezP.Data.prototype.willChange = function(oldValue, newValue) {
  var block = this.block_
  var ezp = block.ezp
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
 * May be overriden by mixin
 * @param {Object} oldValue
 * @param {Object} newValue
 * @return undefined
 */
ezP.Data.prototype.didChange = function(oldValue, newValue) {
  var block = this.block_
  var ezp = block.ezp
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
  var block = this.block_
  var ezp = block.ezp
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

/**
 * Declares and init a named property for the given constructor.
 * First create a subclass of ezP.Data, with custom data from param.
 * Then create various getters and setters in the Ctor prototype.
 * Each constructor holds a map of property constructors.
 * For ezPython.
 * @param {Object} Ctor The constructor to add the property to.
 * @param {!string} key Whether to unlock statements too.
 * @param {Object} params.
 * @return the number of block locked
 */
ezP.Data.add = function (Ctor, key, mixins) {
  // The property belongs to a subclass of ezP.Data
  // We subclass because the willChange and didChange methods
  // will definitely differ from one block to the other.
  // This subclass is stored in Ctor, such that each time
  // a new instance of Ctor is created, its property
  // can be created from the appropriate constructor.
  // First retrieve the `ezp` object:
  // this is where we add things to constructors.
  var ezp = Ctor.ezp || (Ctor.ezp = {})
  // The repository for property constructors is a standard
  // object named `ezp.data`. Its properties are the various
  // keys added, the corresponding value is the corresponding
  // ezP.Data subclass constructor
  var keyCtor = 'ezp:' + key
  if (ezp.data) {
    if (ezp.data[keyCtor]) {
      // this key has already been added
      console.log('This key has already been added', key)
      return
    }
    // get the constructor. Its prototype contains all the keys
    // already created, including the inherited ones.
    for(var kk in ezp.data) {
      console.log('Already known key:', kk)
    }
    var dataCtor = ezp.data.constructor
    for(var kk in dataCtor.prototype) {
      console.log('Already known prototype key:', kk)
    }
  } else {
    dataCtor = function() {}
    // Find the first ancestor of Ctor with an ezp.data object
    var c = Ctor
    while (c.superClass_) {
      c = c.superClass_.constructor
      if (c.ezp && c.ezp.data) {
        goog.inherits(dataCtor, c.ezp.data.constructor)
        break
      }
    }
    for(var kk in dataCtor.prototype) {
      console.log('Freshly known prototype key:', kk)
    }
  }
  var subclass = dataCtor.prototype[keyCtor] = function(block) {
    ezP.Data.call(this, block)
  }
  goog.inherits(subclass, ezP.Data)
  for(var kk in dataCtor.prototype) {
    console.log('Newly known prototype key:', kk)
  }
  // now that we have extended dataCtor, we create another instance
  // which prototype will take into account the change
  ezp.data = new dataCtor()
  for(var kk in ezp.data) {
    console.log('Newly known key:', kk)
  }
  // Now it is time to extend the ezP.Data subclass
  // Even if nothing changes, we subclass.
  var p = subclass.prototype
  for (var x in mixins) {
    if (x !== 'get' && x !== 'set' && !x.startsWith('_') && !x.endsWith('_') && mixins.hasOwnData(x)) {
      p[x] = mixins[x]
      console.log('ADDED:', x)
    } else {
      console.log('REFUSED:', x)
    }
  }
  p.key = key
  // Making the transition
  const K = key.charAt(0).toUpperCase() + key.slice(1)
  p.upperKey = K
  // Now go for the Ctor extension.
  // this is the main entry
  p = Ctor.prototype // Ctor === this.constructor
  if (!p.getDataForKey) {
    p.getDataForKey = function(block, kk) {
      var property = this.property_ || (this.property_ = Object.create(null))
      return property[kk] || (property[kk] = new this.constructor.ezp.data['ezp:' + kk](block))
    }
  }
  // the key is catched in the closure
  p[key+'Data'] = function(block) {
    return this.getDataForKey(block, key)
  }
  p['get'+K] = function(block) {
    return this.getDataForKey(block, key).get()
  }
  p['get'+K+'s'] = function(block) {
    return this.constructor.ezp.data['ezp:' + key].all || block && block.ezp.getModel().inputs[key+'s']
  }
  p['setTrusted'+K] = function (block, newValue) {
    this.getDataForKey(block, key).setTrusted(newValue)
  }
  p['set'+K] = function (block, newValue) {
    this.getDataForKey(block, key).set(newValue)
  }
  if (!p.hasOwnProperty('initData')) {
    var init = p.initData
    p.initData = function(block) {
      init && init.call(this, block)
      var d = Ctor.ezp.data
      for (var k in d) {
        if (k.startsWith('ezp:')) {
          this.getDataForKey(block, k.substring(4)).get() // initialize as side effect
        }
      }
    }
  }
}

if (ezP && ezP.Do) {
  ezP.Do.addInstanceProperty = ezP.Data.add
}
