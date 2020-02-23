/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview eYo.data is a class for a data controller.
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
 * There is a very interesting improvement concerning data.
 * It consists in separating the values from the methods.
 * The owner will just propose a value storage and the data
 * object is just a set of methods that apply to this value storage.
 * That way, we can change the data object at runtime,
 * for example, we can have different data objects before and
 * after initialization time. There would be no didChange nor consolidate
 * before initialization time, only at the end.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.require('do')
eYo.require('xre')

eYo.require('decorate')
goog.require('goog.dom')

/**
 * @name {eYo.data}
 * @namespace
 */
eYo.o3d.makeNS(eYo, 'data')

/**
 * Expands a data model.
 * @param {Object} model
 * @param {String} key
 * @return {Object}
 */
eYo.model.dataHandler = (model, key) => {
  model = model[key]
  let methods = []
  for (let [key, value] of Object.entries({
    willChange: 'beforeChange',
    isChanging: 'duringChanging',
    didChange: 'afterChange',
    synchronize: 'synchronize',
    validate: 'validate',
    validateIncog: 'validateIncog',
  })) { ((k, kk) => {
      var f = model[k]
      if (eYo.isF(f)) {
        var m = XRegExp.exec(f.toString(), eYo.xre.function_builtin_before)
        if (m) {
          var builtin = m.builtin
          var before = m.before
          if (builtin) {
            if (before) {
              var ff = (object) => {
                let builtin = eYo.asF(object[kk])
                object[k] = builtin
                ? function (before, after) {
                  f.call(this, () => {
                    builtin.call(this, before, after)
                  }, before, after)
                } : function (before, after) {
                  f.call(this, eYo.doNothing, before, after)
                }
              }
            } else {
              ff = (object) => {
                let builtin = eYo.asF(object[kk])
                object[k] = builtin
                ? function (before, after) {
                  f.call(this, () => {
                    builtin.call(this, before, after)
                  }, after)
                } : function (before, after) {
                  f.call(this, eYo.doNothing, after)
                }
              }
            }
          } else if (before) {
            ff = (object) => {
              object[k] = f
            }
          } else {
            ff = (object) => {
              object[k] = function (before, after) {
                f.call(this, after)
              }
            }
          }
        } else {
          ff = (object) => {
            object[k] = f
          }
        }
        methods.push(ff)
      }
    }) (key, value)
  }
  model['.methods'] = methods
  if (model.validateIncog && !eYo.isF(model.validateIncog)) {
    delete model.validateIncog
  }
}

/**
 * Base property constructor.
 * The bounds between the data and the arguments are immutable.
 * For edython.
 * @param {eYo.brick.Base} brick The object owning the data.
 * @param {string} key name of the data.
 * @param {Object} model contains methods and properties.
 * It is shared by all data controllers belonging to the same kind
 * of owner. Great care should be taken when editing this model.
 * @constructor
 */
eYo.data.makeBase({
  init (brick, key, model) {
    brick || eYo.throw(`${this.eyo.name}: Missing brick`)
    key || eYo.throw(`${this.eyo.name}: Missing key in makeBase`)
    model || eYo.throw(`${this.eyo.name}: Missing model`)
    this.reentrant_ = {}
    this.key_ = key
    this.model_ = model
    model = this.model
    this.name = 'eyo:' + (model.name || key).toLowerCase()
    this.noUndo = !!model.noUndo
    var xml = model.xml
    if (goog.isDefAndNotNull(xml) || xml !== false) {
      this.attributeName = (xml && xml.attribute) || key
    }
    if (!model.setup_) {
      model.setup_ = true
      if (!eYo.isF(model.didLoad)) {
        delete model.didLoad
      }
      if (goog.isDefAndNotNull(xml)) {
        if (!eYo.isF(xml.toText)) {
          delete xml.toText
        }
        if (!eYo.isF(xml.fromText)) {
          delete xml.fromText
        }
        if (!eYo.isF(xml.toField)) {
          delete xml.toField
        }
        if (!eYo.isF(xml.fromField)) {
          delete xml.fromField
        }
        if (!eYo.isF(xml.save)) {
          delete xml.save
        }
        if (!eYo.isF(xml.load)) {
          delete xml.load
        }
      } else if (key === 'variant' || key === 'option' || key === 'subtype') {
        model.xml = false
      }
    }
  },
  properties: {
    brick: {
      get() {
        return this.owner
      },
    },
    change: {
      get () {
        return this.brick.change
      },
    },
    brickType: {
      get () {
        return this.brick.type
      },
    },
    data: {
      get () {
        return this.brick.data
      },
    },
    ui: {
      get () {
        return this.brick.ui
      },
    },
    ui_driver: {
      get () {
        return this.brick.ui_driver
      },
    },
    key: eYo.NA,
    value: eYo.NA,
    /**
     * Disabled data correspond to disabled input.
     * Changing this value will cause an UI synchronization and a change count.
     */
    incog: {
      value: false,
      set (after) {
        if (!goog.isDef(after)) {
          after = !this.required
        } else {
          after = !!after
        }
        var validator = this.model.validateIncog
        if (validator) {
          after = validator.call(this, after)
        }
        if (this.incog_ !== after) {
          this.change.wrap(() => {
            this.incog_ = after
            this.slot && (this.slot.incog = after)
            this.field && (this.field.visible = !after)
          })
        }
      }
    },
    requiredIncog: {
      set (after) {
        this.incog = !(this.required = after)
      }
    }
  },
})

;(() => {
  /**
   * Initialize the instance.
   * Calls the inherited method, then adds methods defined by the model.
   * The methods are managed by the |dataHandler| method of the |eYo.model|.
   * @param {Object} object - The object to initialize.
   */
  eYo.p6y.Data
  eYo.data.Dlgt_p.initInstance = function (object) {
    this.C9r_S.eyo_p.initInstance.call(this, object)
    object.model['.methods'].forEach(f => {
      f(object)
    })
  }
  let _p = eYo.data.Dflt_p

  /**
   * Get the value of the data
   */
  _p.get = function () {
    if (!goog.isDef(this.value_)) {
      var f = eYo.decorate.reentrant_method(this,
        'get',
        this.init
      )
      f && (eYo.whenVALID(f.apply(this, arguments), (ans) => {
        this.internalSet(ans)
      }))
    }
    return this.value_
  }

  /**
   * Set the value with no extra task except hooks before, during and after the change.
   * @param {Object} after
   * @param {Boolean} notUndoable
   */
  _p.rawSet = function (after, notUndoable) {
    var before = this.value_
    if (before !== after) {
      this.change.begin()
      this.beforeChange(before, after)
      try {
        if (after === eYo.key.Comment) {
          console.error('BACK TO COMMENT')
        }
        this.value_ = after
        this.duringChange(before, after)
      } finally {
        this.afterChange(before, after)
        this.change.end() // may render
      }
    }
  }

  /**
   * Set the value with no extra task.
   * The `set` method will use hooks before and after the change.
   * No such thing here.
   * If the given value is an index, use instead the corresponding
   * item in the `getAll()` array.
   * @param {Object} after
   */
  _p.internalSet = function (after) {
    if (eYo.isStr(after)) {
      var x = this.model[after]
      !x || !eYo.isF(after) || (after = x)
    }
    if (goog.isNumber(after)) {
      x = this.getAll()
      if (x && goog.isDefAndNotNull((x = x[after]))) {
        after = x
      }
    }
    this.rawSet(after)
  }

  /**
   * Init the value of the property.
   * If `after` is defined, it is used as is and nothing more is performed.
   * Otherwise, if the model contains:
   * `init: foo,`
   * then the initial value will be based on `foo`,
   * even if it is not a valid data.
   * If `foo` is a function, it is evaluated.
   * Within the scope of this model function `this` is the receiver
   * and `this.init(foo)` may be used to initialize the data.
   * @param {Object} after
   */
  _p.init = function (after) {
    if (goog.isDef(after)) {
      this.internalSet(after)
      return
    }
    var init = this.model.init
    var f = eYo.decorate.reentrant_method(
      this,
      'model_init',
      this.model.init
    )
    try {
      if (f) {
        eYo.whenVALID(f.apply(this, arguments), (ans) => {
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
    } finally {
      if (!goog.isDef(this.value_)) {
        console.error('THIS SHOULD BE DEFINED', this.key, this.brickType)
      }
    }
  }

  /**
   * Init the value of the property depending on the type.
   * This is usefull for variants and options.
   * The model is asked for a method.
   * @param {Object} type
   */
  _p.setWithType = function (type) {
    var f = eYo.decorate.reentrant_method(
      this,
      'model_fromType',
      this.model.fromType
    )
    f && (eYo.whenVALID(f.apply(this, arguments), (ans) => {
      this.internalSet(ans)
    }))
  }

  /**
   * When not eYo.NA, this is the array of all possible values.
   * May be overriden by the model.
   * Do not use this directly because this can be a function.
   * Always use `getAll` instead.
   */
  _p.all = eYo.NA

  /**
   * Get all the values.
   */
  _p.getAll = function () {
    var all = this.model.all
    return (goog.isArray(all) && all) || (eYo.isF(all) && (goog.isArray(all = all()) && all))
  }

  /**
   * Whether the data value is eYo.key.NONE.
   * @return {Boolean}
   */
  _p.isNone = function () {
    return this.get() === eYo.key.NONE
  }

  /**
   * Validates the value of the property
   * May be overriden by the model.
   * @param {Object} after
   */
  _p.validate = function (after) {
    var f = eYo.decorate.reentrant_method(this, 'model_validate', this.model.validate)
    if (f) {
      return eYo.whenVALID(f.apply(this, arguments))
    }
    var all = this.getAll()
    return this.model.validate === false || !all || all.indexOf(after) >= 0 ? after : eYo.INVALID
  }

  /**
   * Returns the text representation of the data.
   * @param {Object} [after]
   */
  _p.toText = function () {
    var f = eYo.decorate.reentrant_method(this, 'toText', this.model.toText)
    var result = this.get()
    if (f) {
      return eYo.whenVALID(f.call(this, result))
    }
    if (goog.isNumber(result)) {
      result = result.toString()
    }
    return result || ''
  }

  /**
   * Returns the text representation of the data.
   * Called during synchronization.
   * @param {Object} [after]
   */
  _p.toField = function () {
    var f = eYo.decorate.reentrant_method(this, 'toField', this.model.toField || this.model.toText)
    var result = this.get()
    if (f) {
      return eYo.whenVALID(f.call(this))
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
  _p.fromText = function (txt, validate = true) {
    if (!this.model_fromText_lock) {
      var f = eYo.decorate.reentrant_method(this, 'model_fromText', this.model.fromText)
      if (f) {
        eYo.whenVALID(f.apply(this, arguments), ans => {
          this.doChange(ans, validate)
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
      this.doChange(txt, false)
    } else if (this.value_ !== txt) {
      var v7d = this.validate(txt)
      if (!v7d || !eYo.isVALID(v7d)) {
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
  _p.fromField = function (txt, dontValidate) {
    if (!this.model_fromField_lock) {
      var f = eYo.decorate.reentrant_method(this, 'model_fromField', this.model.fromField || this.model.fromText)
      if (f) {
        eYo.whenVALID(f.call(this), ans => {
          this.fromField(ans, dontValidate)
        })
        return
      }
    }
    if (dontValidate) {
      this.set(txt)
    } else if (this.value_ !== txt) {
      var v7d = this.validate(txt)
      if (!v7d || !eYo.isVALID(v7d)) {
        this.error = true
        v7d = txt
      } else {
        this.error = false
      }
      this.setTrusted_(v7d)
    }
  }

  /**
   * Will change the value of the property.
   * The signature is `willChange(before, after) → void`
   * May be overriden by the model.
   * @param {Object} before
   * @param {Object} after
   * @return eYo.NA
   */
  _p.willChange = eYo.doNothing

  /**
   * When unchange the value of the property.
   * The signature is `didUnchange(after, before) → void`
   * May be overriden by the model.
   * Replaces `willChange` when undoing.
   * @param {Object} after
   * @param {Object} before
   * @return eYo.NA
   */
  _p.didUnchange = eYo.doNothing

  /**
   * Did change the value of the property.
   * The signature is `didChange( before, after ) → void`
   * May be overriden by the model.
   * @param {Object} before
   * @param {Object} after
   * @return eYo.NA
   */
  _p.didChange = eYo.doNothing

  /**
   * Will unchange the value of the property.
   * The signature is `willUnchange( before, after ) → void`.
   * Replaces `didChange` while undoing.
   * May be overriden by the model.
   * @param {Object} before
   * @param {Object} after
   * @return eYo.NA
   */
  _p.willUnchange = eYo.doNothing

  /**
   * Before the didChange message is sent.
   * The signature is `isChanging( before, after ) → void`
   * May be overriden by the model.
   * No undo message is yet sent but the data has recorded the new value.
   * Other object may change to conform to this new state,
   * before undo events are posted.
   * @param {Object} before
   * @param {Object} after
   * @return eYo.NA
   */
  _p.isChanging = eYo.doNothing

  /**
   * Before the didUnchange message is sent.
   * The signature is `isUnchanging( before, after ) → void`
   * May be overriden by the model.
   * No undo message is yet sent but the data has recorded the new value.
   * Other object may change to conform to this new state,
   * before undo events are posted.
   * @param {Object} before
   * @param {Object} after
   * @return eYo.NA
   */
  _p.isUnchanging = eYo.doNothing

  /**
   * Before change the value of the property.
   * Branch to `willChange` or `willUnchange`.
   * @param {Object} before
   * @param {Object} after
   * @return eYo.NA
   */
  _p.beforeChange = function(before, after) {
    ;(!eYo.event.recordingUndo ? this.willChange : this.willUnchange).call(this, before, after)
  }

  /**
   * During change the value of the property.
   * The new value has just been recorded,
   * but all the consequences are not yet managed.
   * In particular, no undo management has been recorded.
   * Branch to `isChanging` or `isUnchanging`.
   * @param {Object} before
   * @param {Object} after
   * @return eYo.NA
   */
  _p.duringChange = function(before, after) {
    ;(!eYo.event.recordingUndo ? this.isChanging : this.isUnchanging).apply(this, arguments)
  }

  /**
   * After change the value of the property.
   * Branch to `didChange` or `didUnchange`.
   * `synchronize` in fine.
   * @param {Object} before
   * @param {Object} after
   * @return eYo.NA
   */
  _p.afterChange = function(before, after) {
    ;(eYo.event.recordingUndo ? this.didChange : this.didUnchange).call(before, after)
    this.synchronize(before, after)
  }

  /**
   * Wether a value change fires an undo event.
   * May be overriden by the javascript model.
   */
  _p.noUndo = eYo.NA

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
   * @param {Object} after
   */
  _p.synchronize = function (before, after) {
    var d = this.ui_driver
    if (!d) {
      return
    }
    if (!goog.isDef(after)) {
      after = this.get()
    }
    if (this.model.synchronize === true) {
      eYo.assert(this.field || this.slot || this.model.synchronize, `No field nor slot bound. ${this.key}/${this.brickType}`)
      var field = this.field
      if (field) {
        if (this.incog) {
          if (this.slot && this.slot.data === this) {
            this.slot.incog = true
          } else {
            field.visible = false
          }
        } else {
          eYo.event.disableWrap(() => {
            field.text = this.toField()
            if (this.slot && this.slot.data === this) {
              this.slot.incog = false
              field.visible = !this.slot.unwrappedTarget && (!eYo.app.noBoundField || this.model.allwaysBoundField || this.get().length)
            } else {
              field.visible = true
            }
            var d = field.ui_driver
            d && (d.makeError(field))
          })
        }
      }
    }
  }

  /**
   * set the value of the property without any validation.
   * This is overriden by the events module.
   * @param {Object} after
   * @param {Boolean} noRender
   */
  _p.setTrusted_ = function (after) {
    this.internalSet(after)
  }

  /**
   * set the value of the property without any validation.
   * This is overriden by the events module.
   * @param {Object} after
   * @param {Boolean} noRender
   */
  _p.setTrusted = function (...args) {
    try {
      this.setTrusted = eYo.doNothing
      this.setTrusted_.call(this, ...args)
    } finally {
      delete this.setTrusted
    }
  }

  /**
   * If the value is an uppercase string,
   * change it to a key.
   * If the value is a number, change to the corresponding item
   * in the `getAll()` array.
   * If there is a model function with that name, use it instead.
   * @param {Object} after
   */
  _p.filter = function (after) {
    // tricky argument management
    // Used when after is an uppercase string
    var f = eYo.decorate.reentrant_method(this, 'model_filter',this.model.filter)
    if (f) {
      return eYo.whenVALID(f.apply(this, arguments))
    }
    if (this.model.filter === true) {
      if (eYo.isStr(after)) {
        if (after === after.toUpperCase()) {
          var x = eYo.key[after]
          !x || (after = x)
        }
      } else if (goog.isNumber(after)) {
        x = this.getAll()
        if (x && goog.isDefAndNotNull((x = x[after]))) {
          after = x
        }
      }
    }
    return after
  }

  /**
   * set the value of the property,
   * with validation, undo and synchronization.
   * Undo management and synchronization only occur when
   * the old value and the new value are not the same.
   * @param {Object} after
   * @param {Boolean} noRender
   */
  _p.set = function (after, validate = true) {
    after = this.filter(after)
    if ((this.value_ === after) || (validate && (!eYo.isVALID(after = this.validate (before, after))))) {
      return false
    }
    this.error = false
    this.setTrusted(after)
    return true
  }

  Object.defineProperty(eYo.data, 'incog', {
    get () {
      return this.incog_
    },
    /**
     * Disabled data correspond to disabled input.
     * Changing this value will cause an UI synchronization but no change count.
     * @param {Boolean} after  When not defined, replaced by `!this.required`
     */
    set (after) {
      if (!goog.isDef(after)) {
        after = !this.required
      } else {
        after = !!after
      }
      var validator = this.model.validateIncog
      if (validator) {
        after = validator.call(this, after)
      }
      if (this.incog_ !== after) {
        this.incog_ = after
        if (this.slot) {
          this.slot.incog = after
        } else {
          this.field && (this.field.visible = !after)
        }
      }
    }
  })

  /**
   * Consolidate the value.
   * Should be overriden by the model.
   * Reentrant management here of the model action.
   */
  _p.consolidate = function (...args) {
    if (this.change.level) {
      return
    }
    let f = this.model.consolidate
    if (f) {
      try {
        this.consolidate = eYo.doNothing
        f.call(this, ...args)
      } finally {
        delete this.consolidate
      }
    }
  }

  /**
   * An active data is not explicitely disabled, and does contain text.
   * @private
   */
  _p.isActive = function () {
    return !!this.required || (!this.incog_ && (eYo.isStr(this.value_) && this.value_.length))
  }

  /**
   * Set the value of the main field eventually given by its key.
   * @param {Object} after
   * @param {string|null} fieldKey  of the input holder in the ui object
   * @param {boolean} noUndo  true when no undo tracking should be performed.
   * @private
   */
  _p.setMainFieldValue = function (after, fieldKey, noUndo) {
    var field = this.fields[fieldKey || this.key]
    if (field) {
      eYo.event.disableWrap(() => {
        field.text = after
      })
    }
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
   * @param {Object} [opt]  See eponym parameter in `eYo.xml.brickToDom`.
   */
  _p.save = function (element, opt) {
    var xml = this.model.xml
    if (xml === false) {
      // only few data need not be saved
      return
    }
    // do not save if there is an associate slot with a target brick.
    if (this.slot && this.slot.bindField === this.field && this.slot.unwrappedTarget) {
      return
    }
    if (!this.incog || xml && eYo.do.valueOf(xml.force, this)) {
      // in general, data should be saved
      var required = this.required || (xml && xml.required)
      var isText = xml && xml.text
      var txt = this.toText()
      // if there is no text available, replace with the placeholder
      if (opt && opt.noEmpty && !txt.length) {
        var field = this.field
        if (field) {
          var p9r = field.placeholder
          if (p9r && p9r.length) {
            txt = p9r
            this.doChange(txt)
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
        } else if (this.slot && this.slot.bindField === this.field) {
          // let the slot do it
          this.slot.saveRequired(element, opt)
        } else {
          element.setAttribute(this.attributeName + '_placeholder', txt)
        }
      }
    }
  }

  /**
   * Customize the placeholder.
   * For edython.
   * @param {String} txt the new placeholder.
   */
  _p.customizePlaceholder = function (txt) {
    if (txt === this.model.placeholder) {
      return
    }
    if (goog.isDef(this.model.custom_placeholder)) {
      var placeholder = eYo.do.valueOf(txt, this)
      this.model.custom_placeholder = placeholder && (placeholder.toString().trim())
      return
    }
    var m = {}
    goog.mixin(m, this.model)
    this.model = m
    m.placeholder = m.custom_placeholder = eYo.do.valueOf(txt, this)
  }

  /**
   * Convert the brick's data from a dom element.
   * What is the status with respect to the undo management.
   * This function is important.
   * For edython.
   * @param {Element} xml the persistent element.
   */
  _p.load = function (element) {
    this.loaded_ = false
    var xml = this.model.xml
    if (xml === false) {
      return
    }
    if (element) {
      var required = this.required
      var isText = xml && xml.text
      this.setRequiredFromModel(false)
      var txt
      if (isText) {
        // get the first child which is a text node
        if (!eYo.do.SomeChild(element, (child) => {
          if (child.nodeType === Node.TEXT_NODE) {
            txt = child.nodeValue
            return true
          }
        })) {
          txt = element.getAttribute(eYo.key.PLACEHOLDER)
          if (goog.isDefAndNotNull(txt)) {
            this.customizePlaceholder(txt)
            this.setRequiredFromModel(true)
            this.fromText('', false)
            return this.loaded_ = true
          }
        }
      } else {
        txt = (this.model.xml && (eYo.isF(this.model.xml.getAttribute))
          && (this.model.xml.getAttribute.call(this, element)) ||element.getAttribute(this.attributeName))
        if (!goog.isDefAndNotNull(txt)) {
          txt = element.getAttribute(`${this.attributeName}_${eYo.key.PLACEHOLDER}`)
          if (goog.isDefAndNotNull(txt)) {
            this.customizePlaceholder(txt)
            this.setRequiredFromModel(true)
            this.fromText('', false)
            return this.loaded_ = true
          }
        }
      }
      if (goog.isDefAndNotNull(txt)) {
        if (required && txt === '?') {
          txt = ''
          this.setRequiredFromModel(true)
        } else {
          if ((isText && txt === '?') || (!isText && txt === '')) {
            txt = ''
            this.setRequiredFromModel(true)
          } else if (txt) {
            let v7d = this.validate(txt)
            this.setRequiredFromModel(eYo.isVALID(v7d) ? v7d : '')
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
  _p.willLoad = function () {
    var f =  this.model.willLoad
    if (f) {
      f.apply(this, arguments)
      return
    }
  }

  /**
   * When all the data and slots have been loaded.
   * For edython.
   */
  _p.didLoad = function () {
    var f =  this.model.didLoad
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
  _p.setRequiredFromModel = function (after) {
    this.required_from_model = after
  }

  /**
   * Get the required status.
   * For edython.
   */
  _p.isRequiredFromModel = function () {
    return this.required_from_model
  }

  /**
   * Get the concrete required status.
   * For edython.
   */
  _p.isRequiredFromSaved = function () {
    return this.isRequiredFromModel() || this.get().length || this.required_from_type
  }

  /**
   * Clean the required status, changing the value if necessary.
   * For edython.
   * @param {function()} helper
   */
  _p.whenRequiredFromModel = function (helper) {
    if (this.isRequiredFromModel()) {
      this.setRequiredFromModel(false)
      if (eYo.isF(helper)) {
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
  _p.whenRequiredFromSaved = function (helper) {
    if (this.requiredFromSaved) {
      this.setRequiredFromModel(false)
      if (eYo.isF(helper)) {
        helper.call(this)
      }
      return true
    }
  }

}) ()
