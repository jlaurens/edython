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
 * There is a design problem concerning the binding between the model
 * and the ui.
 * The data definitely belongs to the model layer.
 * When the data corresponds to some ui object, they must be synchronized,
 * at least when no change is actually pending (see the change level).
 * The typical synchronization problem concerns the text fields.
 * We say that an object is in a consistant state when all the synchronizations
 * have been performed.
 * A change in the ui must reflect any change to the data and conversely.
 * Care must be taken to be sure that there is indeed a change,
 * to avoid infinite loops.
 * For that purpose, reentrancy is managed with a lock.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Data')

goog.require('eYo')
goog.require('eYo.XRE')
goog.require('eYo.Decorate');
goog.require('goog.dom');

/**
 * Base property constructor.
 * The bounds between the data and the arguments are immutable.
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
  Object.defineProperties(this, {
    reentrant: { value: {} },
    key: { value: key},
    upperKey: { value: key[0].toUpperCase() + key.slice(1) },
    model: {
      value: goog.isObject(model) ? model: (model = {init: model}),
      writable: true
    },
    name: {
      value: 'eyo:' + (model.name || key).toLowerCase()
    },
    noUndo: {value: model.noUndo}
  })
  this.owner = owner // circular reference
  this.value_ = /** Object|null */ undefined
  this.incog_ = false
  var xml = model.xml
  if (goog.isDefAndNotNull(xml) || xml !== false) {
    this.attributeName = (xml && xml.attribute) || key
  }
  if (!model.setup_) {
    model.setup_ = true
    if (!goog.isFunction(model.didLoad)) {
      delete model.didLoad
    }
    if (goog.isDefAndNotNull(xml)) {
      if (!goog.isFunction(xml.toText)) {
        delete xml.toText
      }
      if (!goog.isFunction(xml.fromText)) {
        delete xml.fromText
      }
      if (!goog.isFunction(xml.toField)) {
        delete xml.toField
      }
      if (!goog.isFunction(xml.fromField)) {
        delete xml.fromField
      }
      if (!goog.isFunction(xml.save)) {
        delete xml.save
      }
      if (!goog.isFunction(xml.load)) {
        delete xml.load
      }
    } else if (key === 'variant' || key === 'option' || key === 'subtype') {
      model.xml = false
    }
    if (model.validateIncog && !goog.isFunction(model.validateIncog)) {
      delete model.validateIncog
    }
  }
}

Object.defineProperties(
  eYo.Data.prototype,
  {
    block: {
      get () {
        return this.owner.block_
      }
    },
    blockType: {
      get  () {
        return this.owner.block_.type
      }
    },
    data: {
      get  () {
        return this.owner.data
      }
    },
    incog_p: {
      get () {
        return this.incog_
      },
      set (newValue) {
        this.changeIncog(newValue)
      }
    }
  }
)

/**
 * Get the owner of the data.
 * Actually, it returns a block delegate.
 */
eYo.Data.prototype.getOwner = function () {
  return this.owner
}

/**
 * Get the value of the data
 */
eYo.Data.prototype.get = function () {
  if (!goog.isDef(this.value_)) {
    var f = eYo.Decorate.reentrant_method.call(this, 
      'get',
      this.init
    )
    f && eYo.Decorate.whenAns(f.apply(this, arguments), (ans) => {
      this.internalSet(ans)
    })
  }
  return this.value_
}

/**
 * Set the value with no extra task except hooks before, during and after the change.
 * @param {Object} newValue
 * @param {Boolean} notUndoable
 */
eYo.Data.prototype.rawSet = function (newValue, notUndoable) {
  var oldValue = this.value_
  if (oldValue !== newValue) {
    this.owner.changeBegin()
    this.beforeChange(oldValue, newValue)
    try {
      this.value_ = newValue
      this.duringChange(oldValue, newValue)
    } catch (err) {
      console.error(err)
      throw err
    } finally {
      this.afterChange(oldValue, newValue)
      this.owner.changeEnd() // may render
    }
  }
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
  this.rawSet(newValue)
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
  var f = eYo.Decorate.reentrant_method.call(
    this,
    'model_init',
    this.model.init
  )
  try {
    if (f) {
      eYo.Decorate.whenAns(f.apply(this, arguments), (ans) => {
        this.internalSet(ans)
      })
      return
    } else if (goog.isDef(init)) {
      this.internalSet(init)
      return
    }
    var all = this.getAll()
    if (all && all.length) {
      this.internalSet(all[0])
    }
  } catch (err) {
    console.error(err)
    throw err
  } finally {
    if (!goog.isDef(this.value_)) {
      console.error('THIS SHOULD BE DEFINED', this.key, this.blockType)
    }
  }
}

/**
 * Init the value of the property depending on the type.
 * This is usefull for variants and options.
 * The model is asked for a method.
 * @param {Object} type
 */
eYo.Data.prototype.setWithType = function (type) {
  var f = eYo.Decorate.reentrant_method.call(
    this,
    'model_fromType',
    this.model.fromType
  )
  f && eYo.Decorate.whenAns(f.apply(this, arguments), (ans) => {
    this.internalSet(ans)
  })
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
 * Whether the data value is eYo.Key.NONE.
 * @return {Boolean}
 */
eYo.Data.prototype.isNone = function () {
  return this.get() === eYo.Key.NONE
}

/**
 * Validates the value of the property
 * May be overriden by the model.
 * @param {Object} newValue
 */
eYo.Data.prototype.validate = function (newValue) {
  var f = eYo.Decorate.reentrant_method.call(this, 'model_validate', this.model.validate)
  if (f) {
    return eYo.Decorate.whenAns(f.apply(this, arguments))
  }
  var all = this.getAll()
  return ((this.model.validate === false || !all || all.indexOf(newValue) >= 0)
  && {validated: newValue}) || null
}

/**
 * Returns the text representation of the data.
 * @param {?Object} newValue
 */
eYo.Data.prototype.toText = function () {
  var f = eYo.Decorate.reentrant_method.call(this, 'toText', this.model.toText)
  var result = this.get()
  if (f) {
    return eYo.Decorate.whenAns(f.call(this, result))
  }
  if (goog.isNumber(result)) {
    result = result.toString()
  }
  return result || ''
}

/**
 * Returns the text representation of the data.
 * Called during synchronization.
 * @param {?Object} newValue
 */
eYo.Data.prototype.toField = function () {
  var f = eYo.Decorate.reentrant_method.call(this, 'toField', this.model.toField || this.model.toText)
  var result = this.get()
  if (f) {
    return eYo.Decorate.whenAns(f.call(this))
  }
  if (goog.isNumber(result)) {
    result = result.toString()
  }
  return result || ''
}

/*
 * Below are collected the various setters.
 * The setters come in different flavours depending on
 * 1) undo management
 * 2) UI synchronization
 * 3) validation (related to point 2)
 * Whether these points are orthogonal is not clear.
 * Discussion about states.
 * a) consistent state: all rules are fullfilled.
 * b) transitional state: some rules are broken.
 * The program runs from consistent state to consistent state
 * through transitional states.
 * Some methods break the consistency, some methods repair things.
 * Is it possible to identify the methods that do not break state?
 * And conversely the methods that break state.
 * One important thing is to clearly list the rules that define a
 * consistent state.
 * Consistency rules may concern the data model, the user interface
 * and their relationship.
 * The rendering process consists in setting the view model according
 * to the data model. Then displaying is processed by some engine
 * (in the navigator for example).
 * 
 */

/**
 * Set the value from the given text representation.
 * In general, the given text either was entered by a user in a text field ot read from a persistent text formatted storage.
 * Calls the javascript model, reentrant.
 * Does nothing when the actual value and
 * the actual argument are the same.
 * @param {Object} txt
 * @param {boolean=} dontValidate
 */
eYo.Data.prototype.fromText = function (txt, validate = true) {
  if (!this.model_fromText_lock) {
    var f = eYo.Decorate.reentrant_method.call(this, 'model_fromText', this.model.fromText)
    if (f) {
      eYo.Decorate.whenAns(f.apply(this, arguments), ans => {
        this.change(ans, validate)
      })
      return
    }
  }
  if (txt.length && !this.model.isText) {
    var n = Number(txt)
    if (!isNaN(n)) {
      txt = n
    }
  }
  if (!validate) {
    this.change(txt, false)
  } else if (this.value_ !== txt) {
    var v7d = this.validate(txt)
    if (!v7d || !goog.isDef((v7d = v7d.validated))) {
      this.error = true
      v7d = txt
    } else {
      this.error = false
    }
    this.setTrusted_(v7d)
  }
}


/**
 * Set the value from the given text representation
 * as text field content.
 * In general, the given text either was entered by a user in a text field ot read from a persistent text formatted storage.
 * Calls the javascript model, reentrant.
 * Does nothing when the actual value and
 * the actual argument are the same.
 * @param {Object} txt
 * @param {boolean=} dontValidate
 */
eYo.Data.prototype.fromField = function (txt, dontValidate) {
  if (!this.model_fromField_lock) {
    var f = eYo.Decorate.reentrant_method.call(this, 'model_fromField', this.model.fromField || this.model.fromText)
    if (f) {
      eYo.Decorate.whenAns(f.call(this), ans => {
        this.fromField(ans, dontValidate)
      })
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
    this.setTrusted_(v7d)
  }
}

/**
 * Decorate of change hooks.
 * Returns a function with signature is `foo(before, after) → void`
 * `foo` is overriden by the model.
 * The model `foo` can call the builtin `foo` with `this.foo(...)`.
 * @param {Object} key, 
 * @param {Object} do_it
 * @return undefined
 */
eYo.Data.decorateChange = function (key, do_it) {
  return function(before, after) {
    var lock = key + '_lock'
    if (this[lock]) {
      if (goog.isFunction(do_it)) {
        do_it.apply(this, arguments)
      }
      return
    }
    this[lock] = true
    var model_lock = 'model_' + lock
    if (this[model_lock]) {
      // no built in behaviour yet
      return
    }
    try {
      var model_do_it = this.model[key]
      if (goog.isFunction(model_do_it)) {
        try {
          this[model_lock] = true
          model_do_it.apply(this, arguments)
        } catch (err) {
          console.error(err)
          throw err
        } finally {
          delete this[model_lock]
        }
        return
      }
    } catch (err) {
      console.error(err)
      throw err
    } finally {
      delete this[lock]
    }  
  }
}

/**
 * Will change the value of the property.
 * The signature is `willChange(oldValue, newValue) → void`
 * May be overriden by the model.
 * @param {Object} oldValue
 * @param {Object} newValue
 * @return undefined
 */
eYo.Data.prototype.willChange = eYo.Data.decorateChange('willChange')

/**
 * When unchange the value of the property.
 * The signature is `didUnchange(newValue, oldValue) → void`
 * May be overriden by the model.
 * Replaces `willChange` when undoing.
 * @param {Object} newValue
 * @param {Object} oldValue
 * @return undefined
 */
eYo.Data.prototype.didUnchange = eYo.Data.decorateChange('didUnchange')

/**
 * Did change the value of the property.
 * The signature is `didChange( oldValue, newValue ) → void`
 * May be overriden by the model.
 * @param {Object} oldValue
 * @param {Object} newValue
 * @return undefined
 */
eYo.Data.prototype.didChange = eYo.Data.decorateChange('didChange')

/**
 * Will unchange the value of the property.
 * The signature is `willUnchange( oldValue, newValue ) → void`.
 * Replaces `didChange` while undoing.
 * May be overriden by the model.
 * @param {Object} oldValue
 * @param {Object} newValue
 * @return undefined
 */
eYo.Data.prototype.willUnchange = eYo.Data.decorateChange('willUnchange')

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
eYo.Data.prototype.isChanging = eYo.Data.decorateChange('isChanging')

/**
 * Before the didUnchange message is sent.
 * The signature is `isUnchanging( oldValue, newValue ) → void`
 * May be overriden by the model.
 * No undo message is yet sent but the data has recorded the new value.
 * Other object may change to conform to this new state,
 * before undo events are posted.
 * @param {Object} oldValue
 * @param {Object} newValue
 * @return undefined
 */
eYo.Data.prototype.isUnchanging = eYo.Data.decorateChange('isUnchanging')

/**
 * Before change the value of the property.
 * Branch to `willChange` or `willUnchange`.
 * @param {Object} oldValue
 * @param {Object} newValue
 * @return undefined
 */
eYo.Data.prototype.beforeChange = function(oldValue, newValue) {
  (!Blockly.Events.recordUndo ? this.willChange : this.willUnchange).call(this, oldValue, newValue)
}

/**
 * During change the value of the property.
 * Branch to `isChanging` or `isUnchanging`.
 * @param {Object} oldValue
 * @param {Object} newValue
 * @return undefined
 */
eYo.Data.prototype.duringChange = function(oldValue, newValue) {
  (!Blockly.Events.recordUndo ? this.isChanging : this.isUnchanging).apply(this, arguments)
}

/**
 * After change the value of the property.
 * Branch to `didChange` or `didUnchange`.
 * `synchronize` in fine.
 * @param {Object} oldValue
 * @param {Object} newValue
 * @return undefined
 */
eYo.Data.prototype.afterChange = function(oldValue, newValue) {
  (Blockly.Events.recordUndo ? this.didChange : this.didUnchange).apply(this, arguments)
  this.synchronize(newValue)
}

/**
 * Wether a value change fires an undo event.
 * May be overriden by the javascript model.
 */
eYo.Data.prototype.noUndo = undefined

/**
 * Synchronize the value of the property with the UI.
 * Called once when the model has been made,
 * and called each time the value changes,
 * whether doing, undoing or redoing.
 * May be overriden by the model.
 * When not overriden by the model, updates the field and slot state.
 * We can call `this.synchronize()` from the model.
 * `synchronize: true`, and
 * synchronize: function() { this.synchronize()} are equivalent.
 * Raises when not bound to some field or slot, in the non model variant.
 * @param {Object} newValue
 */
eYo.Data.prototype.synchronize = function (newValue) {
  if (!goog.isDef(newValue)) {
    newValue = this.get()
  }
  if (this.reentrant['model_synchronize'] || this.model.synchronize === true) {
    goog.asserts.assert(this.field || this.slot || this.model.synchronize, 'No field nor slot bound. ' + this.key + '/' + this.blockType)
    var field = this.field
    if (field) {
      eYo.Events.disableWrap(() => {
        field.setValue(this.toField())
        if (this.slot && this.slot.data === this) {
          this.slot.setIncog(this.incog_p)
          field.setVisible(!this.slot.unwrappedTarget && (!this.slot.input || !eYo.App.noBoundField || this.model.allwaysBoundField || this.get().length))
        } else {
          field.setVisible(!this.incog_p)
        }
        var element = field.textElement_
        if (element) {
          if (this.error) {
            goog.dom.classlist.add(element, 'eyo-code-error')
          } else {
            goog.dom.classlist.remove(element, 'eyo-code-error')
          }
        }
      })
    }
  } else if (this.model.synchronize) {
    var f = eYo.Decorate.reentrant_method.call(this, 'model_synchronize', this.model.synchronize)
    f && f.call(this, newValue)
  }
}

/**
 * set the value of the property without any validation.
 * This is overriden by the events module.
 * @param {Object} newValue
 * @param {Boolean} noRender
 */
 eYo.Data.prototype.setTrusted_ = function (newValue) {
  this.internalSet(newValue)
}

/**
 * set the value of the property without any validation.
 * This is overriden by the events module.
 * @param {Object} newValue
 * @param {Boolean} noRender
 */
eYo.Data.prototype.setTrusted = eYo.Decorate.reentrant_method('trusted', eYo.Data.prototype.setTrusted_)

/**
 * If the value is an uppercase string,
 * change it to a key.
 * If the value is a number, change to the corresponding item
 * in the `getAll()` array.
 * If there is a model function with that name, use it instead.
 * @param {Object} newValue
 */
eYo.Data.prototype.filter = function (newValue) {
  // tricky argument management
  // Used when newValue is an uppercase string
  var f = eYo.Decorate.reentrant_method.call(this, 'model_filter',this.model.filter)
  if (f) {
    return eYo.Decorate.whenAns(f.apply(this, arguments))
  }
  if (goog.isString(newValue)) {
    if (newValue === newValue.toUpperCase()) {
      var x = eYo.Key[newValue]
      !x || (newValue = x)
    }
  } else if (goog.isNumber(newValue)) {
    x = this.getAll()
    if (x && goog.isDefAndNotNull((x = x[newValue]))) {
      newValue = x
    }
  }
  return newValue
}

/**
 * set the value of the property,
 * with validation, undo and synchronization.
 * Undo management and synchronization only occur when
 * the old value and the new value are not the same.
 * @param {Object} newValue
 * @param {Boolean} noRender
 */
eYo.Data.prototype.set = function (newValue, validate = true) {
  newValue = this.filter(newValue)
  if ((this.value_ === newValue) || ( validate && (!(newValue = this.validate(newValue)) || !goog.isDef(newValue = newValue.validated)))) {
    return false
  }
  this.error = false
  this.setTrusted(newValue)
  return true
}

/**
 * Disabled data correspond to disabled input.
 * Changing this value will cause an UI synchronization.
 * @param {Object} newValue  When not defined, replaced by `!this.required`
 * @return {boolean} whether changes have been made
 */
eYo.Data.prototype.setIncog = function (newValue) {
  if (!goog.isDef(newValue)) {
    newValue = !this.required
  } else {
    newValue = !!newValue
  }
  var validator = this.model.validateIncog
  if (validator) {
    newValue = validator.call(this, newValue)
  }
  if (this.incog_ !== newValue) {
    // if (this.key === 'comment') {
    //   console.error('comment data incog', newValue)
    // }
    this.incog_ = newValue
    if (this.slot) {
      this.slot.setIncog(newValue)
    } else {
      this.field && this.field.setVisible(!newValue)
    }
    return true
  }
  return false
}
/**
 * Disabled data correspond to disabled input.
 * Changing this value will cause an UI synchronization.
 * @param {Object} newValue  When not defined, replaced by `!this.required`
 * @return {boolean} whether changes have been made
 */
eYo.Data.prototype.changeIncog = function (newValue) {
  if (!goog.isDef(newValue)) {
    newValue = !this.required
  } else {
    newValue = !!newValue
  }
  var validator = this.model.validateIncog
  if (validator) {
    newValue = validator.call(this, newValue)
  }
  if (this.incog_ !== newValue) {
    this.owner.changeWrap(
      () => { // catch `this`
        this.incog_ = newValue
        this.slot && this.slot.setIncog(newValue)
        this.field && this.field.setVisible(!newValue)    
      }
    )
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
 * Reentrant management here of the model action.
 */
eYo.Data.prototype.consolidate = function () {
  if (this.owner.change.level) {
    return
  }
  var f = eYo.Decorate.reentrant_method.call(this, 'model_consolidate', this.model.consolidate)
  f && f.apply(this, arguments)
}

/**
 * An active data is not explicitely disabled, and does contain text.
 * @private
 */
eYo.Data.prototype.isActive = function () {
  return !!this.required || (!this.incog_ && goog.isString(this.value_) && this.value_.length)
}

/**
 * Set the value of the main field eventually given by its key.
 * @param {!Object} newValue
 * @param {string|null} fieldKey  of the input holder in the ui object
 * @param {boolean} noUndo  true when no undo tracking should be performed.
 * @private
 */
eYo.Data.prototype.setMainFieldValue = function (newValue, fieldKey, noUndo) {
  var field = this.fields[fieldKey || this.key]
  if (field) {
    eYo.Events.disableWrap(() => {
      field.setValue(newValue)
    })
  }
}

/**
 * No change is made except that this is a one shot function.
 */
eYo.Data.prototype.beReady = function () {
  this.beReady = eYo.Do.nothing // one shot function
}

/**
 * Does nothing if the data is disabled or if the model
 * has a `false` valued xml property.
 * Saves the data to the given element, except when incog
 * or when the model forces.
 * Also, if there is an associate slot with a target,
 * then the data is not saved either.
 * For edython.
 * @param {Element} element the persistent element.
 * @param {?Object} opt  See eponym parameter in `eYo.Xml.blockToDom`.
 */
eYo.Data.prototype.save = function (element, opt) {
  var xml = this.model.xml
  if (xml === false) {
    // only few data need not be saved
    return
  }
  // do not save if there is an associate slot with a target block.
  if (this.slot && this.slot.bindField === this.field && this.slot.unwrappedTarget) {
    return
  }
  if (!this.isIncog() || xml && eYo.Do.valueOf(xml.force, this)) {
    // in general, data should be saved
    if (xml) {
      var f = eYo.Decorate.reentrant_method.call(this, 'xml_save', xml.save)
      if (f) {
        f.apply(this, arguments)
        return
      }
    }
    var required = this.required || (xml && xml.required)
    var isText = xml && xml.text
    var txt = this.toText()
    // if there is no text available, replace with the placeholder
    if (opt && opt.noEmpty && !txt.length) {
      var field = this.field
      if (field) {
        var displayed = field.getDisplayText_()
        if (displayed && displayed.length) {
          txt = displayed
          this.change(txt)
        }
      }
    }
    if (isText) {
      if (txt.length) {
        goog.dom.appendChild(element, goog.dom.createTextNode(txt))
      } else if (required) {
        goog.dom.appendChild(element, goog.dom.createTextNode('?'))
      }
    } else if (txt.length) {
      element.setAttribute(this.attributeName, txt)
    } else if (this.required) {
      if (this.model.custom_placeholder) {
        element.setAttribute(this.attributeName + '_placeholder', this.model.custom_placeholder.toString())
      } else {
        element.setAttribute(this.attributeName, txt)
      }
    }
  }
}

/**
 * Customize the placeholder.
 * For edython.
 * @param {String} txt the new placeholder.
 */
eYo.Data.prototype.customizePlaceholder = function (txt) {
  if (txt === this.model.placeholder) {
    return
  }
  if (goog.isDef(this.model.custom_placeholder)) {
    var placeholder = eYo.Do.valueOf(txt, this)
    this.model.custom_placeholder = placeholder && placeholder.toString().trim()
    return
  }
  var m = {}
  goog.mixin(m, this.model)
  this.model = m
  m.placeholder = m.custom_placeholder = eYo.Do.valueOf(txt, this)
}

/**
 * Convert the block's data from a dom element.
 * What is the status with respect to the undo management.
 * This function is important.
 * For edython.
 * @param {Element} xml the persistent element.
 */
eYo.Data.prototype.load = function (element) {
  this.loaded_ = false
  var xml = this.model.xml
  if (xml === false) {
    return
  }
  if (element) {
    if (xml) {
      var f = eYo.Decorate.reentrant_method.call(this, 'xml_load', xml.load)
      if (f) {
        f.apply(this, arguments)
        return
      }
    }
    var required = this.required
    var isText = xml && xml.text
    this.setRequiredFromModel(false)
    var txt
    if (isText) {
      // get the first child which is a text node
      if (!eYo.Do.someChild(element, (child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          txt = child.nodeValue
          return true
        }
      })) {
        txt = element.getAttribute(eYo.Key.PLACEHOLDER)
        if (goog.isDefAndNotNull(txt)) {
          this.customizePlaceholder(txt)
          this.setRequiredFromModel(true)
          this.fromText('', false)
          return this.loaded_ = true
        }
      }
    } else {
      txt = element.getAttribute(this.attributeName)
      if (!goog.isDefAndNotNull(txt)) {
        txt = element.getAttribute(`${this.attributeName}_${eYo.Key.PLACEHOLDER}`)
        if (goog.isDefAndNotNull(txt)) {
          this.customizePlaceholder(txt)
          this.setRequiredFromModel(true)
          this.fromText('', false)
          return this.loaded_ = true
        }
      }
    }
    if (goog.isDefAndNotNull(txt)) {
      if (xml) {
        f = eYo.Decorate.reentrant_method.call(this, 'xml_willLoad', xml.willLoad)
        if (f) {
          eYo.Decorate.whenAns(f.call(this, txt), ans => {
            txt = ans
          })
        }
      }
      if (required && txt === '?') {
        txt = ''
        this.setRequiredFromModel(true)
      } else {
        if ((isText && txt === '?') || (!isText && txt === '')) {
          txt = ''
          this.setRequiredFromModel(true)
        } else if (txt) {
          this.setRequiredFromModel(this.validate(txt).validated)
        }
        this.fromText(txt, false) // do not validate, there might be an error while saving, please check
      }
    } else if (required) {
      this.fromText('', false)
    }
    return this.loaded_ = true
  }
}

/**
 * Before all the data and slots will load.
 * For edython.
 */
eYo.Data.prototype.willLoad = function () {
  var f = eYo.Decorate.reentrant_method.call(this, 'model_willLoad',this.model.willLoad)
  if (f) {
    f.apply(this, arguments)
    return
  }
}

/**
 * When all the data and slots have been loaded.
 * For edython.
 */
eYo.Data.prototype.didLoad = function () {
  var f = eYo.Decorate.reentrant_method.call(this, 'model_didLoad',this.model.didLoad)
  if (f) {
    f.apply(this, arguments)
    return
  }
}

/**
 * Set the required status.
 * When some data is required, an `?` might be used instead of nothing
 * For edython.
 */
eYo.Data.prototype.setRequiredFromModel = function (newValue) {
  this.required_from_model = newValue
}

/**
 * Get the required status.
 * For edython.
 */
eYo.Data.prototype.isRequiredFromModel = function () {
  return this.required_from_model
}

/**
 * Get the concrete required status.
 * For edython.
 */
eYo.Data.prototype.isRequiredFromSaved = function () {
  return this.isRequiredFromModel() || this.get().length || this.required_from_type
}

/**
 * Clean the required status, changing the value if necessary.
 * For edython.
 * @param {function()} helper
 */
eYo.Data.prototype.whenRequiredFromModel = function (helper) {
  if (this.isRequiredFromModel()) {
    this.setRequiredFromModel(false)
    if (goog.isFunction(helper)) {
      helper.call(this)
    }
    return true
  }
}

/**
 * Clean the required status, changing the value if necessary.
 * For edython.
 * @param {function()} helper
 */
eYo.Data.prototype.whenRequiredFromSaved = function (helper) {
  if (this.isRequiredFromSaved()) {
    this.setRequiredFromModel(false)
    if (goog.isFunction(helper)) {
      helper.call(this)
    }
    return true
  }
}
