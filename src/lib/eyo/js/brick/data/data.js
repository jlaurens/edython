/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview eYo.data.BaseC9r is a class for a data controller.
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

eYo.forward('do')
eYo.forward('xre')
eYo.forward('decorate')
eYo.forward('changer')

//g@@g.require('g@@g.dom')

/**
 * @name {eYo.data}
 * @namespace
 */
eYo.o4t.newNS(eYo, 'data')

/**
 * @name {eYo.data.BaseC9r}
 * @constructor
 * Base property constructor.
 * The bounds between the data and the arguments are immutable.
 * For edython.
 * @param {eYo.brick.BaseC9r} brick The object owning the data.
 * @param {string} key name of the data.
 * @param {Object} model contains methods and properties.
 * It is shared by all data controllers belonging to the same kind
 * of owner. Great care should be taken when editing this model.
 */
eYo.data.makeBaseC9r(true, {
  init (key, brick) {
    eYo.isStr(key) || eYo.throw(`${this.eyo.name}: Missing key in makeBaseC9r`)
    brick || eYo.throw(`${this.eyo.name}: Missing brick`)
    let model = this.model
    this.noUndo_ = !!model.noUndo
    let xml = model.xml
    if (eYo.isDef(xml) || xml !== false) {
      this.attributeName = (xml && xml.attribute) || key
    }
  },
  aliases: {
    'owner': 'brick',
    'brick.changer': 'changer',
    'brick.type': 'brickType',
    'brick.data': 'data',
    'brick.ui': 'ui',
    'brick.ui_driver': 'ui_driver',
  },
  properties: {
    name: {
      lazy () {
        return 'eyo:' + (this.model.name || this.key).toLowerCase()
      },
    },
    value: '',
    /**
     * Wether a value change fires an undo event.
     * May be overriden by the javascript model.
     */
    noUndo: false,
    required_from_model: false,
    /**
     * Disabled data correspond to disabled input.
     * Changing this value will cause an UI synchronization and a change count.
     */
    incog: {
      after: ['required_from_model', 'changer'],
      /**
       * Disabled data correspond to disabled input.
       * Changing this value will cause an UI synchronization but no change count.
       * @param {Boolean} after  When not defined, replaced by `!this.required_from_model_`
       */
      set (after) {
        if (!eYo.isDef(after)) {
          after = !this.required_from_model_
        } else {
          after = !!after
        }
        var validator = this.model.validateIncog
        if (validator) {
          after = validator.call(this, after)
        }
        eYo.whenVALID(this.validateIncog(after), after => {
          if (this.incog_ !== after) {
            this.changer.wrap(() => {
              this.incog_ = after
              this.slot && (this.slot.incog = after)
              this.field && (this.field.visible = !after)
            })
          }
        })
      }
    },
    requiredIncog: {
      after: ['required_from_model'],
      get () {
        return
      },
      set (after) {
        this.incog_ = !(this.required_from_model_ = after)
      }
    },
    required_from_type: false,
    /**
     * Get the concrete required status.
     * For edython.
     */
    required_from_saved: {
      after: ['required_from_model', 'required_from_type'],
      get () {
        return this.required_from_model || this.value_ && this.value_.length || this.required_from_type
      },
    },
  },
  // ANCHOR: Methods
  methods: {
    /**
     * Get the value of the data
     */
    get () {
      return this.stored__
    },    
    /**
     * Set the value with no extra task except hooks before, during and after the change.
     * @param {Object} after
     */
    setRaw_ (after) {
      var before = this.stored__
      if (before !== after) {
        this.changer.begin()
        try {
          this.beforeChange(before, after)
          if (after === eYo.key.Comment) {
            console.error('BACK TO COMMENT')
          }
          this.stored__ = after
          this.duringChange(before, after)
        } finally {
          this.afterChange(before, after)
          this.changer.end() // may render
        }
      }
    },    
    /**
     * Set the value with no extra task.
     * The `set` method will use hooks before and after the change.
     * No such thing here.
     * If the given value is an index, use instead the corresponding
     * item in the `getAll()` array.
     * @param {Object} after
     */
    setFiltered_ (after) {
      if (eYo.isStr(after)) {
        var x = this.model[after]
        !x || !eYo.isF(after) || (after = x)
      }
      if (eYo.isNum(after)) {
        x = this.getAll()
        if (x && eYo.isDef((x = x[after]))) {
          after = x
        }
      }
      this.setRaw_(after)
    },    
    /**
     * Init the value of the property depending on the type.
     * This is usefull for variants and options.
     * The model is asked for a method.
     * @param {Object} type
     */
    fromType: eYo.doNothing,    
  
    /**
     * Get all the values.
     */
    getAll () {
      var all = this.model.all
      return (eYo.isRA(all) && all) || (eYo.isF(all) && (eYo.isRA(all = all()) && all))
    },
    /**
     * Whether the data value is eYo.key.NONE.
     * @return {Boolean}
     */
    isNone () {
      return this.get() === eYo.key.NONE
    },
    /**
     * Validates the value of the data
     * May be overriden by the model.
     * @param {Object} before
     * @param {Object} after
     */
    validate (before, after) {
      return after
    },
    /**
     * Validates the value of the data
     * May be overriden by the model.
     * @param {Object} before
     * @param {Object} after
     */
    validateIncog (before, after) {
      return after
    },
    /**
     * Returns the text representation of the data.
     * @param {Object} [after]
     */
    toText () {
      var ans = this.get()
      eYo.isNum(ans) && (ans = ans.toString())
      return ans || ''
    },
    /**
     * Returns the text representation of the data.
     * Called during synchronization.
     */
    toField () {
      var ans = this.get()
      eYo.isNum(ans) && (ans = ans.toString())
      return ans || ''
    },
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
    fromText (txt, dontValidate) {
      if (txt.length && !this.model.isText) {
        var n = Number(txt)
        if (!isNaN(n)) {
          txt = n
        }
      }
      this.setUntrusted_(txt, dontValidate)
    },
    /**
     * Set the value from the given text representation
     * as text field content.
     * In general, the given text either was entered by a user in a text field ot read from a persistent text formatted storage.
     * Does nothing when the actual value and
     * the actual argument are the same.
     * @param {Object} txt
     * @param {boolean=} dontValidate
     */
    fromField (txt, dontValidate) {
      this.setUntrusted_(txt, dontValidate)
    },
    /**
     * Will change the value of the property.
     * The signature is `willChange(before, after) → void`
     * May be overriden by the model.
     * @param {Object} before
     * @param {Object} after
     * @return eYo.NA
     */
    willChange: eYo.doNothing,    
    /**
     * When unchange the value of the property.
     * The signature is `didUnchange(after, before) → void`
     * May be overriden by the model.
     * Replaces `willChange` when undoing.
     * @param {Object} after
     * @param {Object} before
     * @return eYo.NA
     */
    didUnchange (before, after) {
      this.didChange(before, after)
    },
    /**
     * Did change the value of the property.
     * The signature is `didChange( before, after ) → void`
     * May be overriden by the model.
     * @param {Object} before
     * @param {Object} after
     * @return eYo.NA
     */
    didChange: eYo.doNothing,
    /**
     * Will unchange the value of the property.
     * The signature is `willUnchange( before, after ) → void`.
     * Replaces `didChange` while undoing.
     * May be overriden by the model.
     * @param {Object} before
     * @param {Object} after
     * @return eYo.NA
     */
    willUnchange (before, after) {
      this.willChange(before, after)
    },
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
    isChanging: eYo.doNothing,
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
    isUnchanging (before, after) {
      this.isChanging(before, after)
    },
    /**
     * Before change the value of the property.
     * Branch to `willChange` or `willUnchange`.
     * @param {Object} before
     * @param {Object} after
     * @return eYo.NA
     */
    beforeChange (before, after) {
      (!eYo.event.recordingUndo ? this.willChange : this.willUnchange).call(this, before, after)
    },
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
    duringChange (before, after) { // eslint-disable-line
      (!eYo.event.recordingUndo ? this.isChanging : this.isUnchanging).apply(this, arguments)
    },
    /**
     * After change the value of the property.
     * Branch to `didChange` or `didUnchange`.
     * `synchronize` in fine.
     * @param {Object} before
     * @param {Object} after
     * @return eYo.NA
     */
    afterChange (before, after) {
      (eYo.event.recordingUndo ? this.didChange : this.didUnchange).call(before, after)
      this.synchronize(before, after)
    },
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
     * @param {Object} before
     * @param {Object} after
     */
    doSynchronize () {
      let field = this.field
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
            let d = field.ui_driver
            d && (d.makeError(field))
          })
        }
      }
    },
    /**
     * set the value of the property without any validation.
     * This is overriden by the events module.
     * @param {Object} after
     * @param {Boolean} noRender
     */
    setUntrusted_ (after, dontValidate) {
      if (dontValidate) {
        this.doChange(after, false)
      } else if (this.stored__ !== after) {
        var v7d = this.validate(after)
        if (!v7d || !eYo.isVALID(v7d)) {
          this.error = true
          v7d = after
        } else {
          this.error = false
        }
        this.setTrusted_(v7d)
      }
    },
    /**
     * set the value of the property without any validation.
     * This is overriden by the events module.
     * @param {Object} after
     * @param {Boolean} noRender
     */
    setTrusted_ (after) {
      this.setFiltered_(after)
    },
    /**
     * set the value of the property without any validation.
     * This is overriden by the events module.
     * @param {Object} after
     * @param {Boolean} noRender
     */
    setTrusted (after) {
      try {
        this.setTrusted = eYo.doNothing
        this.setTrusted_(after)
      } finally {
        delete this.setTrusted
      }
    },
    /**
     * If the value is an uppercase string,
     * change it to a key.
     * If the value is a number, change to the corresponding item
     * in the `getAll()` array.
     * If there is a model function with that name, use it instead.
     * @param {Object} after
     */
    filter (after) {
      if (eYo.isStr(after)) {
        if (after === after.toUpperCase()) {
          var x = eYo.key[after]
          !x || (after = x)
        }
      } else if (eYo.isNum(after)) {
        x = this.getAll()
        if (x && eYo.isDef((x = x[after]))) {
          after = x
        }
      }
      return after
    },
    /**
     * set the value of the property,
     * with validation, undo and synchronization.
     * Undo management and synchronization only occur when
     * the old value and the new value are not the same.
     * @param {Object} after
     * @param {Boolean} noRender
     */
    set (after, validate = true) {
      after = this.filter(after)
      if ((this.stored__ === after) || (validate && (!eYo.isVALID(after = this.validate (before, after))))) { // eslint-disable-line
        return false
      }
      this.error = false
      this.setTrusted(after)
      return true
    },
    /**
     * Consolidate the value.
     * Should be overriden by the model.
     * Reentrant management here of the model action.
     */
    consolidate: eYo.doNothing,
    /**
     * An active data is not explicitely disabled, and does contain text.
     * @private
     */
    isActive () {
      return !!this.required_from_model || (!this.incog_ && (eYo.isStr(this.stored__) && this.stored__.length))
    },
    /**
     * Set the value of the main field eventually given by its key.
     * @param {Object} after
     * @param {string|null} fieldKey  of the input holder in the ui object
     * @param {boolean} noUndo  true when no undo tracking should be performed.
     * @private
     */
    setMainFieldValue (after, fieldKey, noUndo) { // eslint-disable-line
      let field = this.fields[fieldKey || this.key]
      if (field) {
        eYo.event.disableWrap(() => {
          field.text = after
        })
      }
    },
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
    save (element, opt) {
      var xml = this.model.xml
      if (xml === false) {
        // only few data need not be saved
        return
      }
      // do not save if there is an associate slot with a target brick.
      if (this.slot && this.slot.boundField === this.field && this.slot.unwrappedTarget) {
        return
      }
      if (!this.incog || xml && eYo.do.valueOf(xml.force, this)) {
        // in general, data should be saved
        var required = this.required_from_model || (xml && xml.required)
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
            eYo.dom.appendChild(element, eYo.dom.createTextNode(txt))
          } else if (required) {
            eYo.dom.appendChild(element, eYo.dom.createTextNode('?'))
          }
        } else if (txt.length) {
          element.setAttribute(this.attributeName, txt)
        } else if (this.required_from_model) {
          if (this.model.custom_placeholder) {
            element.setAttribute(this.attributeName + '_placeholder', this.model.custom_placeholder.toString())
          } else if (this.slot && this.slot.boundField === this.field) {
            // let the slot do it
            this.slot.saveRequired(element, opt)
          } else {
            element.setAttribute(this.attributeName + '_placeholder', txt)
          }
        }
      }
    },
    /**
     * Customize the placeholder.
     * For edython.
     * @param {String} txt the new placeholder.
     */
    customizePlaceholder (txt) {
      if (txt === this.model.placeholder) {
        return
      }
      if (eYo.isDef(this.model.custom_placeholder)) {
        var placeholder = eYo.do.valueOf(txt, this)
        this.model.custom_placeholder = placeholder && (placeholder.toString().trim())
        return
      }
      var m = {}
      eYo.do.mixin(m, this.model)
      this.model = m
      m.placeholder = m.custom_placeholder = eYo.do.valueOf(txt, this)
    },
    /**
     * Convert the brick's data from a dom element.
     * What is the status with respect to the undo management.
     * This function is important.
     * For edython.
     * @param {Element} xml the persistent element.
     */
    load (element) {
      this.loaded_ = false
      var xml = this.model.xml
      if (xml === false) {
        return
      }
      if (element) {
        var required = this.required_from_model
        var isText = xml && xml.text
        this.required_from_model_ = false
        var txt
        if (isText) {
          // get the first child which is a text node
          if (!eYo.do.someChild(element, (child) => {
            if (child.nodeType === Node.TEXT_NODE) {
              txt = child.nodeValue
              return true
            }
          })) {
            txt = element.getAttribute(eYo.key.PLACEHOLDER)
            if (eYo.isDef(txt)) {
              this.customizePlaceholder(txt)
              this.required_from_model_ = true
              this.fromText('', false)
              return this.loaded_ = true
            }
          }
        } else {
          txt = (this.model.xml && (eYo.isF(this.model.xml.getAttribute))
            && (this.model.xml.getAttribute.call(this, element)) ||element.getAttribute(this.attributeName))
          if (!eYo.isDef(txt)) {
            txt = element.getAttribute(`${this.attributeName}_${eYo.key.PLACEHOLDER}`)
            if (eYo.isDef(txt)) {
              this.customizePlaceholder(txt)
              this.required_from_model_ = true
              this.fromText('', false)
              return this.loaded_ = true
            }
          }
        }
        if (eYo.isDef(txt)) {
          if (required && txt === '?') {
            txt = ''
            this.required_from_model_ = true
          } else {
            if ((isText && txt === '?') || (!isText && txt === '')) {
              txt = ''
              this.required_from_model_ = true
            } else if (txt) {
              let v7d = this.validate(txt)
              this.required_from_model_ = eYo.whenVALID(v7d, '')
            }
            this.fromText(txt, false) // do not validate, there might be an error while saving, please check
          }
        } else if (required) {
          this.fromText('', false)
        }
        return this.loaded_ = true
      }
    },
    /**
     * Before all the data and slots will load.
     * For edython.
     */
    willLoad:eYo.doNothing,
    /**
     * When all the data and slots have been loaded.
     * For edython.
     */
    didLoad: eYo.doNothing, 
    /**
     * Clean the required status, changing the value if necessary.
     * For edython.
     * @param {Object} $this - Optional `this`.
     * @param {Function} do_it
     * @param  {...any} $ 
     */
    whenRequiredFromModel ($this, do_it, ...$) {
      if (this.required_from_model) {
        this.required_from_model_ = false
        if (eYo.isF($this)) {
          $this.call(this, do_it, ...$)
        } else if (eYo.isF(do_it)) {
          do_it.call($this || this, ...$)
        }
        return true
      }
    },
    /**
     * Clean the required status, changing the value if necessary.
     * For edython.
     * @param {function()} do_it
     */
    whenRequiredFromSaved ($this, do_it, ...$) {
      if (this.required_from_saved) {
        this.required_from_model_ = false
        if (eYo.isF($this)) {
          $this.call(this, do_it, ...$)
        } else if (eYo.isF(do_it)) {
          do_it.call($this || this, ...$)
        }
        return true
      }
    },
    /**
     * Set the value wrapping in a `changeBegin`/`changeEnd`
     * group call of the owner.
     * @param {Object} after
     * @param {Boolean} notUndoable
     */
    doChange (after, validate) {
      if (after !== this.stored__) {
        this.owner.changer.wrap(() => {
          this.set(after, validate)
        })
      }
    },
  },    
})

eYo.data.BaseC9r[eYo.$].finalizeC9r(
  eYo.model.manyDescriptorRA('all', 'after'),
  eYo.model.manyDescriptorF(
    'consolidate', 'fromType',
    'toField', 'fromField',
    'toText', 'fromText',
    'validate', 'validateIncog',
    'willLoad', 'didLoad',
    'willChange', 'isChanging', 'didChange',
    'willUnchange', 'isUnchanging', 'didUnchange',
  ),
  {
    xml: (() => {
      let ans = eYo.model.manyDescriptorF('save', 'load')
      ans[eYo.model.VALIDATE] = {$ (before) {
        if (before && ['variant', 'option', 'subtype'].includes(this.parent.key)) {
          return eYo.INVALID
        }
      }}.$
      return ans
    })(),
  },
  [
    'main', // BOOLEAN
    'placeholder', // String
    'noUndo', // BOOLEAN
  ],
)
/**
 * When not eYo.NA, this is the array of all possible values.
 * May be overriden by the model.
 * Do not use this directly because this can be a function.
 * Always use `getAll` instead.
 */
eYo.Data_p.all = eYo.NA

// ANCHOR: Handling the model
eYo.mixinFR(eYo.data.Dlgt_p, {
  /**
   * For subclassers.
   * @param {String} key
   * @param {Object} model
   */
  modelHandle (key, model) {
    model || (model = this.model)
    /**
      * Get the value of the data.
      * One shot.
      */
    let getLazyValue = eYo.decorate.reentrant('get', function () {
      if (!eYo.isDef(this.stored__)) {
        this.setFiltered_(this.model.init.call(this.owner))
      }
      return this.stored__
    })
    model[eYo.$$.starters].push(ans => (ans.get = getLazyValue))
    ;[
      'fromField', 'fromText',
      'toField', 'toText',
      'willLoad', 'didLoad'
    ].forEach(K => {
      this.handle_f(K, key, model)
    })
    this.handle_consolidate(key, model)
    this.handle_filter(key, model)
    ;[
      'validate', 'validateIncog'
    ].forEach(K => {
      this.handle_validate(K, key, model)
    })
    this.handle_synchronize(key, model)
    ;[
      'willChange', 'isChanging', 'didChange',
      'willUnchange', 'isUnchanging', 'didUnchange'
    ].forEach(K => {
      this.handle_change(K, key, model)
    })
  },
  /**
   * make the prototype's filter method based on the model's object for key filter.
   * The prototype does inherit a filter method.
   * @param {Object} prototype
   * @param {String} key
   * @param {Object} model
   */
  handle_filter (key, model) {
    let K = 'filter'
    let _p = this.C9r_p
    let f_m = model[K]
    if (eYo.isDoIt(f_m)) {
      let f_p = _p[K]
      if (f_m.length > 1) { // arguments are builtin, after
        _p[K] = eYo.decorate.reentrant(K, function (after) {
          return f_m.call(this, ($after = after) => {
            return f_p.call(this, $after)
          }, after)
        }, eYo.doReturn)
      } else { // arguments are after
        _p[K] = function (after) {
          try {
            this[K] = f_p
            return f_m.call(this, after)
          } finally {
            delete this[K]
          }
        }  
      }
    }
  },
  /**
   * make the prototype's fromField method based on the model's object for key fromField.
   * The prototype may inherit a fromField method.
   * @param {String} K - function name in the model and the prototype
   * @param {String} key
   * @param {Object} model
   */
  handle_f (K, key, model) {
    let _p = this.C9r_p
    let f_m = model[K]
    if (eYo.isDoIt(f_m)) {
      let f_p = _p[K]
      if (XRegExp.exec(f_m.toString(), eYo.xre.function_builtin)) {
        _p[K] = eYo.decorate.reentrant(K, function (...$) {
          f_m.call(this, (...$) => {
            return f_p.call(this, ...$) // return is not used in from... but it saves some space
          }, ...$)
        })
      } else {
        _p[K] = function (...$) {
          try {
            this[K] = f_p
            return f_m.call(this, ...$)
          } finally {
            delete this[K]
          }
        }
      }
    } else {
      f_m && eYo.throw(`Unexpected model (${this.name}/${key}/${K}): ${f_m}`)
    }
  },
  /**
   * make the prototype's validate method based on the model's object for key validate.
   * The prototype may inherit a validate method.
   * The only difference with the property's eponym method is that in the model, `this` is the data object, not its owner.
   * @param {String} key
   * @param {Object} model
   */
  handle_consolidate (key, model) {
    let K = 'consolidate'
    let f_m = model[K]
    if (eYo.isDoIt(f_m)) {
      let _p = this.C9r_p
      let f_p = _p[K]
      if (XRegExp.exec(f_m.toString(), eYo.xre.function_builtin)) {
        _p[K] = eYo.decorate.reentrant(K, function (...$) {
          if (this.changer.level) {
            return
          }
          f_m.call(this, (...$) => {
            f_p.call(this, ...$)
          }, ...$)
        })
      } else {
        _p[K] = function (...$) {
          if (this.changer.level) {
            return
          }
          try {
            this[K] = f_p
            f_m.call(this, ...$)
          } finally {
            delete this[K]
          }
        }
      }
    } else {
      f_m && eYo.throw(`Unexpected model (${this.name}/${key}/${K}): ${f_m}`)
    }
  },
  /**
   * make the prototype's validate method based on the model's object for key validate.
   * The prototype may inherit a validate method.
   * The only difference with the property's eponym method is that in the model, `this` is the data object, not its owner.
   * @param {String} key
   * @param {Object} model
   */
  handle_validate (K, key, model) {
    let _p = this.C9r_p
    let f_m = model[K]
    let f_p = this.C9r_p[K]
    eYo.isDoIt(f_p) || eYo.throw(`handle_validate: missing ${K}`)
    if (eYo.isDoIt(f_m)) {
      if (f_m.length > 2) {
        _p[K] = eYo.decorate.reentrant(K, function (before, after) {
          return f_m.call(this, ($after = after) => {
            return f_p.call(this, before, $after)
          }, before, after)
        })
      } else if (f_m.length > 1) {
        _p[K] = function (before, after) {
          try {
            this[K] = ($after = after) => {
              return f_p.call(this, before, $after)
            }
            return f_m.call(this, before, after)
          } finally {
            delete this[K]
          }
        }
      } else {
        _p[K] = function (before, after) {
          try {
            this[K] = ($after = after) => {
              return f_p.call(this, before, $after)
            }
            return f_m.call(this, after)
          } finally {
            delete this[K]
          }
        }
      }
    } else {
      f_m && eYo.throw(`Unexpected model (${this.name}/${key}/${K}) ${f_m}`)
    }
  },
  /**
   * make the prototype's synchronize method based on the model's object for key synchronize.
   * The prototype may inherit a synchronize method.
   * Changing the ancestor prototype afterwards is not a good idea.
   * @param {String} key
   * @param {Object} model
   */
  handle_synchronize (key, model) {
    let K = 'synchronize'
    let _p = this.C9r_p
    let f_m = model.synchronize
    let f_p = _p.doSynchronize
    eYo.isDoIt(f_p) || eYo.throw(`handle_validate: missing ${K}`)
    if (eYo.isDoIt(f_m)) {
      if (f_m.length > 2) {
        _p[K] = eYo.decorate.reentrant(K, function (before, after) {
          return f_m.call(this, ($after = after) => {
            return f_p.call(this, before, $after)
          }, before, after)
        })
      } else if (f_m.length > 1) {
        _p[K] = function (before, after) {
          try {
            this[K] = ($after = after) => {
              return f_p.call(this, before, $after)
            }
            return f_m.call(this, before, after)
          } finally {
            delete this[K]
          }
        }
      } else {
        _p[K] = function (before, after) {
          try {
            this[K] = ($after = after) => {
              return f_p.call(this, before, $after)
            }
            return f_m.call(this, after)
          } finally {
            delete this[K]
          }
        }
      }
    } else if (f_m === true) {
      _p[K] = f_p
    } else {
      f_m && f_m !== eYo.doNothing && eYo.throw(`Unexpected model (${this.name}/${key}/synchronize) -> ${f_m}`)
      _p[K] = eYo.doNothing
    }
  },
  /**
   * Expands a data model.
   * @param {String} K - type of change
   * @param {Object} model - a data model object
   * @param {String} key - the data key
   * @return {Object}
   */
  handle_change (K, key, model) {
    let _p = this.C9r_p
    let f_m = model[K]
    if (eYo.isDoIt(f_m)) {
      let f_p = _p[K]
      if (f_m.length > 2) { // f_m arguments are builtin, before, after
        _p[K] = eYo.decorate.reentrant(K, eYo.isDoIt(f_p)
          ? function (before, after) {
            f_m.call(this, () => {
              f_p.call(this, before, after)
            }, before, after)
          } : function (before, after) {
            f_m.call(this, eYo.doNothing, before, after)
          })
        return
      } else if (f_m.length > 1) {
        let m = XRegExp.exec(f_m.toString(), eYo.xre.function_builtin)
        if (m) { // f_m arguments are builtin, after
          _p[K] = eYo.decorate.reentrant(K, eYo.isDoIt(f_p)
            ? function (before, after) {
              f_m.call(this, () => {
                f_p.call(this, before, after)
              }, after)
            } : function (before, after) {
              f_m.call(this, eYo.doNothing, after)
            })
          return
        }
        // f_m arguments are before, after
        _p[K] = function (before, after) {
          try {
            this[K] = () => {
              f_p.call(this, before, after)
            }
            f_m.call(this, before, after)
          } finally {
            delete this[K]
          }
        }
        return
      }
      // f_m arguments are after
      _p[K] = function (before, after) {
        try {
          this[K] = () => {
            f_p.call(this, before, after)
          }
          f_m.call(this, after)
        } finally {
          delete this[K]
        }
      }
      return
    }
    f_m && eYo.throw(`Unexpected model (${this.name}/${key}/${K}) -> ${f_m}`)
  }
})

