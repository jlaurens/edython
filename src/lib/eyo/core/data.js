/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview eYo.Data is a class for a data controller.
 * It merely provides the API.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.require('eYo')
goog.provide('eYo.Data')
goog.require('goog.dom');

/**
 * Base property constructor.
 * For edython.
 * @param {!Object} owner The object owning the data.
 * @param {!string} key name of the data.
 * @param {!Object} model contains methods and properties.
 * It is shared by all data controllers belonging to the same kind
 * of owner. Great care should be taken when editing this model.
 * @constructor
 */
eYo.Data = function (owner, key, model) {
  goog.asserts.assert(owner, 'Missing owner')
  goog.asserts.assert(key, 'Missing key')
  goog.asserts.assert(model, 'Missing model')
  this.owner = owner // circular reference
  this.data = owner.data // the owner's other data objects
  this.value_ = /** Object|null */ undefined
  this.key = key
  this.model = goog.isObject(model) ? model: (model = {init: model})
  this.upperKey = key[0].toUpperCase() + key.slice(1)
  this.name = 'eyo:' + (this.model.name || this.key).toLowerCase()
  this.noUndo = model.noUndo
  this.incog_ = false
  this.wait_ = 1 // start with 1 exactly
  var xml = model.xml
  if (goog.isDefAndNotNull(xml) || xml !== false) {
    this.attributeName = (xml && xml.attribute) || key
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
    } else if (key === 'variant' || key === 'option' || key === 'subtype') {
      model.xml = false
    }
  }
  for (var k in model) {
    if (XRegExp.exec(k, eYo.XRE.upper)) {
      this[k] = model[k]
    }
  }
}

/**
 * Get the owner of the data.
 * Actually, it returns a block delegate.
 */
eYo.Data.prototype.getOwner = function () {
  return this.owner
}

/**
 * Get the type of the underlying block.
 */
eYo.Data.prototype.getType = function () {
  return this.owner.block_.type
}

/**
 * Get the value of the data
 * @param {Object} newValue
 */
eYo.Data.prototype.get = function () {
  if (goog.isDef(this.value_) || this.lock_get) {
    return this.value_
  }
  if (this.init) {
    try {
      this.lock_get = true
      this.init()
    } catch (err) {
      console.error(err)
      throw err
    } finally {
      delete this.lock_get
    }
  }
  return this.value_
}

/**
 * Set the value with no extra task.
 * The `set` method will use hooks before and after the change.
 * No such thing here.
 * If the given value is an index, use instead the corresponding
 * item in the `getAll()` array.
 * @param {Object} newValue
 */
eYo.Data.prototype.internalSet = function (newValue) {
  if (goog.isString(newValue)) {
    var x = this.model[newValue]
    !x || (newValue = x)
  }
  if (goog.isNumber(newValue)) {
    x = this.getAll()
    if (x && goog.isDefAndNotNull((x = x[newValue]))) {
      newValue = x
    }
  }
  var oldValue = this.value_
  this.willChange(oldValue, newValue)
  this.value_ = newValue
  this.isChanging(oldValue, newValue)
  this.didChange(oldValue, newValue)
}

/**
 * Init the value of the property.
 * If `newValue` is defined, it is used as is and nothing more is performed.
 * Otherwise, if the model contains:
 * `init: foo,`
 * then the initial value will be based on `foo`,
 * even if it is not a valid data.
 * If `foo` is a function, it is evaluated.
 * Within the scope of this model function `this` is the receiver
 * and `this.init(foo)` may be used to initialize the data.
 * @param {Object} newValue
 */
eYo.Data.prototype.init = function (newValue) {
  if (goog.isDef(newValue)) {
    this.internalSet(newValue)
    return
  }
  var init = this.model.init
  if (goog.isFunction(init)) {
    if (!this.model_init_lock) {
      this.model_init_lock = true
      try {
        init.call(this)
      } catch (err) {
        console.error(err)
        throw err
      } finally {
        delete this.model_init_lock
      }
      return
    }
  } else if (goog.isDef(init)) {
    this.internalSet(init)
    return
  }
  var all = this.getAll()
  if (all && all.length) {
    this.internalSet(all[0])
  }
}

/**
 * When not undefined, this is the array of all possible values.
 * May be overriden by the model.
 * Do not use this directly because this can be a function.
 * Always use `getAll` instead.
 */
eYo.Data.prototype.all = undefined

/**
 * Get all the values.
 */
eYo.Data.prototype.getAll = function () {
  var all = this.model.all
  return (goog.isArray(all) && all) || (goog.isFunction(all) && goog.isArray(all = all()) && all)
}

/**
 * Validates the value of the property
 * May be overriden by the model.
 * @param {Object} newValue
 */
eYo.Data.prototype.validate = function (newValue) {
  if (!this.lock_model_validate && goog.isFunction(this.model.validate)) {
    try {
      this.lock_model_validate = true
      var out = this.model.validate.call(this, newValue)
    } catch (err) {
      console.error(err)
      throw err
    } finally {
      delete this.lock_model_validate
    }
    return out
  }
  var all = this.getAll()
  return ((this.model.validate === false || !all || all.indexOf(newValue) >= 0)
  && {validated: newValue}) || null
}

/**
 * Returns the text representation of the data.
 * @param {?Object} newValue
 */
eYo.Data.prototype.toText = function (newValue = undefined) {
  if (!this.toText_locked && goog.isFunction(this.model.toText)) {
    this.toText_locked = true
    try {
      return this.model.toText.call(this, newValue)
    } catch (err) {
      console.error(err)
      throw err
    } finally {
      delete this.toText_locked
    }
  }
  return this.get() || ''
}

/**
 * Set the value from the given text representation.
 * Calls the model, reentrant.
 * @param {Object} txt
 * @param {boolean=} dontValidate
 */
eYo.Data.prototype.fromText = function (txt, dontValidate) {
  if (!this.model_fromText_lock) {
    if (goog.isFunction(this.model.fromText)) {
      this.model_fromText_lock = true
      try {
        this.model.fromText.call(this, txt, dontValidate)
      } catch (err) {
        console.error(err)
        throw err
      } finally {
        delete this.model_fromText_lock
      }
      return
    }
  }
  if (dontValidate) {
    this.set(txt)
  } else if (this.value_ !== txt) {
    var v7d = this.validate(txt)
    if (!v7d || !goog.isDef((v7d = v7d.validated))) {
      this.error = true
      v7d = txt
    } else {
      this.error = false
    }
    this.internalSet(v7d)
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
eYo.Data.prototype.willChange = function (oldValue, newValue) {
  if (this.lock_willChange) {
    return
  }
  try {
    this.lock_willChange = true
    if (goog.isFunction(this.model.willChange)) {
      if (this.model_willChange_lock) {
        return
      }
      this.model_willChange_lock = true
      try {
        this.model.willChange.call(this, oldValue, newValue)
      } catch (err) {
        console.error(err)
        throw err
      } finally {
        delete this.model_willChange_lock
      }
      return
    }
  } catch (err) {
    console.error(err)
    throw err
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
eYo.Data.prototype.didChange = function (oldValue, newValue) {
  if (this.didChange_lock) {
    return
  }
  this.didChange_lock = true
  try {
    if (goog.isFunction(this.model.didChange)) {
      if (this.model_didChange_lock) {
        // no built in behaviour yet
        return
      }
      this.model_didChange_lock = true
      try {
        this.model.didChange.call(this, oldValue, newValue)
      } catch (err) {
        console.error(err)
        throw err
      } finally {
        delete this.model_didChange_lock
      }
      return
    }
  } catch (err) {
    console.error(err)
    throw err
  } finally {
    delete this.didChange_lock
  }
}

/**
 * Before the didChange message is sent.
 * The signature is `isChanging( oldValue, newValue ) → void`
 * May be overriden by the model.
 * No undo message is yet sent but the data has recorded the new value.
 * Other object may change to conform to this new state,
 * before undo events are posted.
 * @param {Object} oldValue
 * @param {Object} newValue
 * @return undefined
 */
eYo.Data.prototype.isChanging = function (oldValue, newValue) {
  if (this.isChanging_lock) {
    return
  }
  this.isChanging_lock = true
  try {
    if (goog.isFunction(this.model.isChanging)) {
      if (this.model_isChanging_lock) {
        // no built in behaviour yet
        return
      }
      this.model_isChanging_lock = true
      try {
        this.model.isChanging.call(this, oldValue, newValue)
      } catch (err) {
        console.error(err)
        throw err
      } finally {
        delete this.model_isChanging_lock
      }
      return
    }
  } catch (err) {
    console.error(err)
    throw err
  } finally {
    delete this.isChanging_lock
  }
}

/**
 * Wether a value change fires an undo event.
 * May be overriden by the model.
 */
eYo.Data.prototype.noUndo = undefined

/**
 * Synchronize the value of the property with the UI.
 * May be overriden by the model.
 * Do nothing if the receiver should wait.
 * When not overriden by the model, updates the field and slot state.
 * We can call `this.synchronize()` from the model.
 * `synchronize: true`, and
 * synchronize: function() { this.synchronize()} are equivalent.
 * Raises when not bound to some field or slot, in the non model variant.
 * @param {Object} newValue
 */
eYo.Data.prototype.synchronize = function (newValue) {
  if (this.wait_) {
    return
  }
  if (this.model_synchronize_lock || this.model.synchronize === true) {
    goog.asserts.assert(this.field || this.slot || this.model.synchronize, 'No field nor slot bound. ' + this.key + '/' + this.getType())
    var field = this.field
    if (field) {
      Blockly.Events.disable()
      try {
        field.setValue(this.toText())
      } catch (err) {
        console.error(err)
        throw err
      } finally {
        Blockly.Events.enable()
      }
      field.setVisible(!this.isIncog())
      var element = field.textElement_
      if (element) {
        if (this.error) {
          goog.dom.classlist.add(element, 'eyo-code-error')
        } else {
          goog.dom.classlist.remove(element, 'eyo-code-error')
        }
      }
    }
    this.slot && this.slot.setIncog(this.isIncog())
  } else if (goog.isFunction(this.model.synchronize)) {
    this.model_synchronize_lock = true
    try {
      this.model.synchronize.call(this, newValue)
    } catch (err) {
      console.error(err)
      throw err
    } finally {
      delete this.model_synchronize_lock
    }
  }
  this.owner && this.owner.shouldRender && this.owner.shouldRender()
}

/**
 * Synchronize the value of the property with the UI only when bounded.
 * @param {Object} newValue
 */
eYo.Data.prototype.synchronizeIfUI = function (newValue) {
  if (this.field || this.slot || this.model.synchronize) {
    this.synchronize(newValue)
  }
}

/**
 * set the value of the property without any validation.
 * If the value is a number, change to the corresponding item
 * in the `getAll()` array.
 * @param {Object} newValue
 */
eYo.Data.prototype.setTrusted = function (newValue) {
  if (this.key == 'callerFlag') {
    console.log('DATA callerFlag:',newValue)
  }
  if (goog.isString(newValue)) {
    var x = this.model[newValue]
    !x || (newValue = x)
  }
  if (goog.isNumber(newValue)) {
    x = this.getAll()
    if (x && goog.isDefAndNotNull((x = x[newValue]))) {
      newValue = x
    }
  }
  this.setTrusted_(newValue)
}

/**
 * set the value of the property without any validation.
 * This is overriden by the events module.
 * @param {Object} newValue
 */
eYo.Data.prototype.setTrusted_ = function (newValue) {
  if (this.trusted_lock) {
    return
  }
  try {
    this.trusted_lock = true
    this.setTrusted__(newValue)
  } catch (err) {
    console.error(err)
    throw err
  } finally {
    delete this.trusted_lock
  }
}

/**
 * set the value of the property without any validation.
 * This is overriden by the events module.
 * @param {Object} newValue
 */
eYo.Data.prototype.setTrusted__ = function (newValue) {
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
eYo.Data.prototype.set = function (newValue) {
  if (this.key === 'variant') {
    console.log(newValue)
  }
  if (goog.isNumber(newValue)) {
    var all = this.getAll()
    if (all && goog.isDefAndNotNull(all = all[newValue])) {
      newValue = all
    }
  }
  if ((this.value_ === newValue) || !(newValue = this.validate(newValue)) || !goog.isDef(newValue = newValue.validated)) {
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
 * @param {Object} newValue  When not defined, replaced by `!this.required`
 * @return {boolean} whether changes have been made
 */
eYo.Data.prototype.setIncog = function (newValue) {
  if (!goog.isDef(newValue)) {
    newValue = !this.required
  }
  if (!this.incog_ !== !newValue) {
    this.incog_ = !!newValue
    this.didChange(this.value_, this.value_)
    this.synchronizeIfUI(this.value_)
    return true
  }
  return false
}
/**
 * Whether the data is incognito.
 */
eYo.Data.prototype.isIncog = function () {
  return this.incog_
}

/**
 * Consolidate the value.
 * Should be overriden by the model.
 * Reentrant management here.
 * Do nothing if the receiver should wait.
 */
eYo.Data.prototype.consolidate = function () {
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
    } catch (err) {
      console.error(err)
      throw err
    } finally {
      delete this.model_consolidate_lock
    }
  }
}

/**
 * An active data is not explicitely disabled, and does contain text.
 * @private
 */
eYo.Data.prototype.isActive = function () {
  return !!this.required || (!this.incog_ && goog.isString(this.value_) && this.value_.length)
}

/**
 * Set the value of the main field given by its key.
 * @param {!Object} newValue
 * @param {string|null} fieldKey  of the input holder in the ui object
 * @param {boolean} noUndo  true when no undo tracking should be performed.
 * @private
 */
eYo.Data.prototype.setMainFieldValue = function (newValue, fieldKey, noUndo) {
  var field = this.fields[fieldKey || this.key]
  if (field) {
    Blockly.Events.disable()
    try {
      field.setValue(newValue)
    } catch (err) {
      console.error(err)
      throw err
    } finally {
      Blockly.Events.enable()
    }
  }
}

/**
 * The receiver is now ready to eventually synchronize and consolidate.
 */
eYo.Data.prototype.beReady = function () {
  this.wait_ = 0
}

/**
 * Set the wait status of the field.
 * Any call to `waitOn` must be balanced by a call to `waitOff`
 */
eYo.Data.prototype.waitOn = function () {
  return ++this.wait_
}

/**
 * Set the wait status of the field.
 * Any call to `waitOn` must be balanced by a call to `waitOff`
 */
eYo.Data.prototype.waitOff = function () {
  goog.asserts.assert(this.wait_ > 0, eYo.Do.format('Too  many `waitOn` {0}/{1}',
    this.key, this.getType()))
  if (--this.wait_ === 0) {
    this.consolidate()
  }
}

/**
 * Does nothing if the data is disabled or if the model
 * has a `false`valued xml property.
 * Saves the data to the given element.
 * For edython.
 * @param {Element} element the persistent element.
 */
eYo.Data.prototype.save = function (element) {
  if (!this.isIncog()) {
    // in general, data should be saved
    var xml = this.model.xml
    if (xml === false) {
      // only few data need not be saved
      return
    }
    if (!this.xml_save_lock && goog.isDef(xml) && goog.isFunction(xml.save)) {
      this.xml_save_lock = true
      try {
        xml.save.call(this, element)
      } catch (err) {
        console.error(err)
        throw err
      } finally {
        delete this.xml_save_lock
      }
      return
    }
    var required = this.required || (goog.isDefAndNotNull(xml) && xml.required)
    var isText = xml && xml.text
    var txt = this.toText()
    if (txt.length || (required && ((txt = isText ? '?' : ''), true))) {
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
 * For edython.
 * @param {Element} xml the persistent element.
 */
eYo.Data.prototype.load = function (element) {
  var xml = this.model.xml
  if (xml === false) {
    return
  }
  if (element) {
    if (!this.xml_load_lock && xml && goog.isFunction(xml.load)) {
      this.xml_load_lock = true
      try {
        xml.load.call(this, element)
      } catch (err) {
        console.error(err)
        throw err
      } finally {
        delete this.xml_load_lock
      }
      return
    }
    var required = this.required
    var isText = xml && xml.text
    this.setRequiredFromDom(false)
    var txt
    if (isText) {
      eYo.Do.forEachChild(element, function (child) {
        if (child.nodeType === Node.TEXT_NODE) {
          txt = child.nodeValue
          return true
        }
      })
    } else {
      txt = element.getAttribute(this.attributeName)
    }
    if (goog.isDefAndNotNull(txt)) {
      if (required && txt === '?') {
        this.fromText('', true)
      } else {
        if ((isText && txt === '?') || (!isText && txt === '')) {
          this.setRequiredFromDom(true)
        }
        this.fromText(txt, true) // do not validate, there might be an error while saving, please check
      }
    } else if (required) {
      this.fromText('', true)
    }
  }
  if (xml && xml.didLoad) {
    xml.didLoad.call(this)
  }
}

/**
 * Set the required status.
 * When some data is required, an `?` might be used instead of nothing
 * For edython.
 */
eYo.Data.prototype.setRequiredFromDom = function (newValue) {
  this.required_from_dom = newValue
}

/**
 * Get the required status.
 * For edython.
 */
eYo.Data.prototype.isRequiredFromDom = function () {
  return this.required_from_dom
}

/**
 * Clean the required status, changing the value if necessary.
 * For edython.
 */
eYo.Data.prototype.clearRequiredFromDom = function () {
  if (this.isRequiredFromDom()) {
    this.setRequiredFromDom(false)
    this.fromText('', true)// useful if the text was a '?'
    return true
  }
}

/**
 * Clean the required status, changing the value if necessary.
 * For edython.
 * @param {function()} helper
 */
eYo.Data.prototype.whenRequiredFromDom = function (helper) {
  if (this.isRequiredFromDom()) {
    this.setRequiredFromDom(false)
    this.fromText('', true)// useful if the text was a '?'
    if (goog.isFunction(helper)) {
      helper.call(this)
    }
    return true
  }
}
