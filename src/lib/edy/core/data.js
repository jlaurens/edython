/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview edY.Data is a class for a data controller.
 * It merely provides the API.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.require('edY')
goog.provide('edY.Data')

/**
 * Base property constructor.
 * For edython.
 * @param {!Object} owner The object owning the data.
 * @param {!string} key name of the data.
 * @param {!Object} model contains methods and properties.
 * It is shared by all data controllers belonging to the same kind
 * of owner. Great care should be taken when editing this model.
 */
edY.Data = function(owner, key, model) {
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
  this.name = 'edy:'+(this.model.name || this.key).toLowerCase()
  this.noUndo = model.noUndo
  this.incog_ = false
  this.wait_ = 1 // start with 1 exactly
  var xml = model.xml
  if (goog.isDefAndNotNull(xml) || xml !== false) {
    this.attributeName = 'edy:' +(xml && xml.attribute || key)
  }
  if (!model.setup_) {
    model.setup_ = true
    if (goog.isDefAndNotNull(xml)) {
      if (!goog.isFunction(xml.toText)) {
        delete xml.toText
      }
      if (!goog.isFunction(xml.fromText)) {
        delete xml.fromText
      }
      if (!goog.isFunction(xml.toDom)) {
        delete xml.toDom
      }
      if (!goog.isFunction(xml.fromDom)) {
        delete xml.fromDom
      }
    } else if (key === 'variant' || key === 'subtype') {
      model.xml = false
    }
  }
}

/**
 * Get the owner of the data.
 * Actually, this is a block delegate.
 */
edY.Data.prototype.getOwner = function() {
  return this.owner_
}

/**
 * Get the value of the data
 * @param {Object} newValue
 */
edY.Data.prototype.get = function() {
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
edY.Data.prototype.default = undefined

/**
 * Set the value with no extra task.
 * The `set` method will use hooks before and after the change.
 * No such thing here.
 * If the given value is an index, use instead the corresponding
 * item in the `getAll()` array.
 */
edY.Data.prototype.internalSet = function(newValue) {
  if (goog.isNumber(newValue)) {
    var all = this.getAll()
    if (all && goog.isDefAndNotNull(all = all[newValue])) {
      newValue = all
    }
  }
  var oldValue = this.value_
  this._willChange(oldValue, newValue)
  this.value_ = newValue
  this._didChange(oldValue, newValue)
}

/**
 * Init the value of the property.
 * May be overriden by the model.
 * If the model contains:
 * default: foo,
 * then the initial value will be foo,
 * even if it is not a valid data.
 */
edY.Data.prototype.init = function() {
  if (goog.isFunction(this.model.init)) {
    this.model.init.call(this)
    return
  }
  if (goog.isFunction(this.model.default)) {
    this.internalSet(this.model.default.call(this))
  } else if (goog.isDefAndNotNull(this.model.default)) {
    this.internalSet(this.model.default)
  } else {
    // initialize the data with the first object of the `all` array
    var all = this.getAll()
    if (all && all.length) {
      this.internalSet(all[0])
    }
  }
}

/**
 * When not undefined, this is the array of all possible values.
 * May be overriden by the model.
 * Do not use this directly because this can be a function.
 * Always use `getAll` instead.
 */
edY.Data.prototype.all = undefined

/**
 * Get all the values.
 */
edY.Data.prototype.getAll = function() {
  var all = this.model.all
  return goog.isArray(all) && all || goog.isFunction(all) && goog.isArray(all = all()) && all 
}

/**
 * Validates the value of the property
 * May be overriden by the model.
 * @param {Object} newValue
 */
edY.Data.prototype.validate = function(newValue) {
  if (!this.lock_model_validate && goog.isFunction(this.model.validate)) {
    try {
      this.lock_model_validate = true
      var out = this.model.validate.call(this, newValue)
    } finally {
      delete this.lock_model_validate
    }
    return out
  }
  var all = this.getAll()
  return (!all || all.indexOf(newValue) >= 0) && {validated: newValue} || null
}

/**
 * Returns the text representation of the data.
 * @param {Object} newValue
 */
edY.Data.prototype.toText = function() {
  if (goog.isFunction(this.model.toText)) {
    return this.model.toText.call(this, newValue)
  }
  return this.get() || ''
}

/**
 * Set the value from the given text representation.
 * Calls the model, reentrant.
 * @param {Object} newValue
 */
edY.Data.prototype.fromText = function(txt, dontValidate) {
  if (!this.model_fromText_lock) {
    if (goog.isFunction(this.model.fromText)) {
      this.model_fromText_lock = true
      try {
        this.model.fromText.call(this, newValue, dontValidate)
      } finally {
        delete this.model_fromText_lock
      }
      return
    }
  }
  if (dontValidate) {
    if ((this.value_ === newValue) || !(newValue = this.validate(newValue)) || !goog.isDef(newValue = newValue.validated)) {
      this.error = true
    }
    this.internalSet(txt)
  } else {
    this.set(txt)
  }
}

/**
 * Will change the value of the property.
 * The signature is `willChange( oldValue, newValue ) → void`
 * May be overriden by the model.
 * @param {Object} oldValue
 * @param {Object} newValue
 * @return undefined
 */
edY.Data.prototype.willChange = function(oldValue, newValue) {
  if (goog.isFunction(this.model.willChange)) {
    if (this.model_willChange_lock) {
      return
    }
    this.model_willChange_lock = true
    try {
      this.model.willChange.call(this, oldValue, newValue)
    } finally {
      delete this.model_willChange_lock
    }
    return
  }
}

/**
 * Private wrapper over willChange
 * @param {Object} oldValue
 * @param {Object} newValue
 * @return undefined
 */
edY.Data.prototype._willChange = function(oldValue, newValue) {
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
edY.Data.prototype.didChange = function(oldValue, newValue) {
  if (goog.isFunction(this.model.didChange)) {
    if (this.model_didChange_lock) {
      return
    }
    this.model_didChange_lock = true
    try {
      this.model.didChange.call(this, oldValue, newValue)
    } finally {
      delete this.model_didChange_lock
    }
    return
  }
}

/**
 * Private wrapper over didChange
 * @param {Object} oldValue
 * @param {Object} newValue
 * @return undefined
 */
edY.Data.prototype._didChange = function(oldValue, newValue) {
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
edY.Data.prototype.noUndo = undefined

/**
 * Synchronize the value of the property with the UI.
 * May be overriden by the model.
 * Do nothing if the receiver should wait.
 * When not overriden by the model, updates the field and tile state.
 * We can call `this.synchronize()` from the model.
 * `synchronize: true`, and
 * synchronize: function() { this.synchronize()} are equivalent.
 * Raises when not bound to some field or tile, in the non model variant.
 * @param {Object} newValue
 */
edY.Data.prototype.synchronize = function(newValue) {
  if (this.wait_) {
    return
  }
  if (this.model_synchronize_lock || this.model.synchronize === true) {
    goog.asserts.assert(this.field || this.tile, 'No field nor tile bound. '+this.key+'/'+this.owner_.block_.type)
    var field = this.field
    if (field) {
      Blockly.Events.disable()
      try {
        field.setValue(this.toText())
      } finally {
        Blockly.Events.enable()
      }
      field.setVisible(!this.isIncog())
      var element = field.textElement_
      if (element) {
        if (this.error) {
          goog.dom.classlist.add(element, 'edy-code-error')
        } else {
          goog.dom.classlist.remove(element, 'edy-code-error')
        }
      }
    }
    this.tile && this.tile.setIncog(this.isIncog())
  } else if (goog.isFunction(this.model.synchronize)) {
    this.model_synchronize_lock = true
    try {
      this.model.synchronize.call(this, newValue)
    } finally {
      delete this.model_synchronize_lock
    }
  }
}

/**
 * Synchronize the value of the property with the UI only when bounded.
 * @param {Object} newValue
 */
edY.Data.prototype.synchronizeIfUI = function(newValue) {
  if (this.field || this.tile || this.model.synchronize) {
    this.synchronize(newValue)
  }
}

/**
 * set the value of the property without any validation.
 * If the value is a number, change to the corresponding item
 * in the `getAll()` array.
 * @param {Object} newValue
 */
edY.Data.prototype.setTrusted = function (newValue) {
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
edY.Data.prototype.setTrusted_ = function (newValue) {
  this.error = false
  this.internalSet(newValue)
  this.synchronizeIfUI(newValue)
}

/**
 * set the value of the property,
 * with validation, undo and synchronization.
 * Always synchronize, even when no value changed.
 * @param {Object} newValue
 */
edY.Data.prototype.set = function (newValue) {
  if (goog.isNumber(newValue)) {
    var all = this.getAll()
    if (all && goog.isDefAndNotNull(all = all[newValue])) {
      newValue = all
    }
  }
  if ((this.value_ === newValue) || !(newValue = this.validate(newValue)) || !goog.isDef(newValue = newValue.validated)) {
    this.synchronizeIfUI(this.value_)
    return false
  }
  this.setTrusted_(newValue)
  return true
}

/**
 * Disabled data correspond to diabled input.
 * Changing this value will cause an UI synchronization.
 * Always synchronize, even when no value changed.
 * @param {Object} newValue
 */
edY.Data.prototype.setIncog = function(newValue) {
  this.incog_ = newValue
  this.synchronizeIfUI(this.value_)
}
/**
 * Whether the data is incognito.
 * @param {Object} newValue
 */
edY.Data.prototype.isIncog = function() {
  return this.incog_
}

/**
 * Consolidate the value.
 * Should be overriden by the model.
 * Reentrant management here.
 * Do nothing if the receiver should wait.
 * @param {Object} newValue
 */
edY.Data.prototype.consolidate = function() {
  if (this.wait_) {
    return
  }
  if (goog.isFunction(this.model.consolidate)) {
    if (this.model_consolidate_lock) {
      return
    }
    this.model_consolidate_lock = true
    try {
      this.model.consolidate.call(this)
    } finally {
      delete this.model_consolidate_lock
    }
  }
}

/**
 * An active data is not explicitely disabled, and does contain text.
 * @param {!number} index  of the input older in the ui object 
 * @param {!boolean} newValue.
 * @private
 */
edY.Data.prototype.isActive = function () {
  return !!this.required || !this.incog_ && goog.isString(this.value_) && this.value_.length
}

/**
 * Set the value of the main field given by its key.
 * @param {!Object} newValue.
 * @param {!number} inputIndex  of the input in the model (i_1, i_2...) 
 * When false, this corresponds to the fields that are not
 * part of an input, like the modifier field.
 * @param {string|null} fieldKey  of the input holder in the ui object 
 * @param {boolean} noUndo  true when no undo tracking should be performed. 
 * @private
 */
edY.Data.prototype.setMainFieldValue = function (newValue, fieldKey, noUndo) {
  var field = this.ui.fields[fieldKey || this.key]
  if (field) {
    Blockly.Events.disable()
    try {
      field.setValue(newValue)
    } finally {
      Blockly.Events.enable()
    }
  }
}

/**
 * The receiver is now ready to eventually synchronize and consolidate.
 */
edY.Data.prototype.beReady = function () {
  this.wait_ = 0
}

/**
 * Set the wait status of the field.
 * Any call to `waitOn` must be balanced by a call to `waitOff`
 */
edY.Data.prototype.waitOn = function () {
  return ++ this.wait_
}

/**
 * Set the wait status of the field.
 * Any call to `waitOn` must be balanced by a call to `waitOff`
 */
edY.Data.prototype.waitOff = function () {
  goog.asserts.assert(this.wait_>0, edY.Do.format('Too  many `waitOn` {0}/{1}', this.key, this.owner.block_.type))
  if (--this.wait_ == 0) {
    this.consolidate()
  }
}

/**
 * This is the method used to save data to an xml tree.
 * If the receiver is not disabled, send its model a `toDom` message
 * if relevant, send this message to the receiver. 
 * For edython.
 * @param {Element} xml the persistent element.
 */
edY.Data.prototype.saveToDom = function(element) {
  if (!this.isIncog()) {
    // in general, data should be saved
    var xml = this.model.xml
    if (xml === false) {
      // only few data need not be saved
      return
    }
    (xml && xml.toDom)?
      xml.toDom.call(this, element):
      this.toDom(element)
  }
}

/**
 * Does nothing if the data is disabled or if the model
 * has a `false`valued xml property.
 * This is the raw converter in the sense that 
 * For edython.
 * @param {Element} xml the persistent element.
 */
edY.Data.prototype.toDom = function(element) {
  if (!this.isIncog()) {
    // in general, data should be saved
    var xml = this.model.xml
    if (xml === false) {
      // only few data need not be saved
      return
    }
    var required = this.required || goog.isDefAndNotNull(xml) && xml.required
    var isText = xml && xml.text
    var txt = this.toText()
    if (txt.length || required && ((txt = isText? '?': ''), true)) {
      if (xml && xml.text) {
        var child = goog.dom.createTextNode(txt)
        goog.dom.appendChild(element, child)
      } else {
        element.setAttribute(this.attributeName, txt)
      }
    }
  }
}

/**
 * Convert the block's data from a dom element.
 * Aske the model first for a `fromDom` method, then the receiver.
 * For edython.
 * @param {Element} xml the persistent element.
 * @return a dom element, void lists may return nothing
 * @this a block delegate
 */
edY.Data.prototype.loadFromDom = function(element) {
  var xml = this.model.xml
  if (xml === false) {
    return
  }
  (xml && xml.fromDom)?
    xml.fromDom.call(this, element):
    this.fromDom(element)
}

/**
 * Convert the block's data from a dom element.
 * For edython.
 * @param {!Blockly.Block} block The block to be converted.
 * @param {Element} xml the persistent element.
 * @return a dom element, void lists may return nothing
 * @this a block delegate
 */
edY.Data.prototype.fromDom = function(element) {
  var xml = this.model.xml
  if (xml === false) {
    return
  }
  var required = this.required
  var isText = xml && xml.text
  this.setRequiredFromDom(false)
  if (isText) {
    for (var i = 0, child; (child = element.childNodes[i]); i++) {
      if (child.nodeType === 3) {
        var txt = child.nodeValue
      }
    }
  } else {
    var txt = element.getAttribute(this.attributeName)
  }
  if (goog.isDefAndNotNull(txt)) {
    if (required && txt === '?') {
      this.fromText('', true)
    } else {
      if (isText && txt === '?'|| !isText && txt === '') {
        this.setRequiredFromDom(true)
      }
      this.fromText(txt, true) // do not validate, there might be an error while saving, please check
    }
  } else if (required) {
    this.fromText('', true)   
  }
}

/**
 * Set the required status.
 * When some data is required, an `?` might be used instead of nothing
 * For edython.
 */
edY.Data.prototype.setRequiredFromDom = function (newValue) {
  this.required_from_dom = newValue
}

/**
 * Get the required status.
 * For edython.
 * @param {boolean} newValue.
 */
edY.Data.prototype.isRequiredFromDom = function () {
  return this.required_from_dom
}

/**
 * Clean the required status, changing the value if necessary.
 * For edython.
 * @param {boolean} newValue.
 */
edY.Data.prototype.clearRequiredFromDom = function () {
  if (this.isRequiredFromDom()) {
    this.setRequiredFromDom(false)
    this.fromText('', true)// useful if the text was a '?'
    return true
  }
}

