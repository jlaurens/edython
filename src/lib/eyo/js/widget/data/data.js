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

//g@@g.require('g@@g.dom')

/**
 * @name {eYo.data}
 * @namespace
 */
eYo.o4t.newNS(eYo, 'data')
//<<< mochai: eYo.data
//... chai.expect(eYo.data).eyo_NS
//>>>
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
  //<<< mochai: eYo.Data
  //<<< mochai: Basics
  init (key, brick) {
    //<<< mochai: init
    eYo.isStr(key) || eYo.throw(`${this.eyo.name}: Missing key in makeBaseC9r`)
    //... chai.expect(() => new eYo.Data(1)).throw()
    eYo.isaC9r(brick) || eYo.throw(`${this.eyo.name}: Missing brick`)
    //... chai.expect(() => new eYo.Data('foo', 'bar')).throw()
    //... let d = new eYo.Data('foo', onr)
    //>>>
  },
  //>>>
  properties: {
    //<<< mochai: Properties
    brick: {
      //<<< mochai: brick
      get () {
        return this.owner
      }
      //... var d = new eYo.Data('foo', onr)
      //... chai.expect(d.brick).equal(onr)
      //... chai.expect(() => { d.brick_ = 1 }).throw()
      //>>>
    },
    name: {
      //<<< mochai: name
      lazy () {
        return 'eyo:' + (this.model.name || this.key).toLowerCase()
      },
      //... var d = new eYo.Data('foo', onr)
      //... chai.expect(d.name).equal('eyo:foo')
      //... var d = eYo.data.new({
      //...   name: 'bar',  
      //... }, 'foo', onr)
      //... chai.expect(d.name).equal('eyo:bar')
      //>>>
    },
    attributeName: {
      //<<< mochai: attributeName
      lazy () {
        let model = this.model
        let xml = model.xml
        return (xml && xml.attribute) || this.key
      },
      //... var d = new eYo.Data('foo', onr)
      //... chai.expect(d.attributeName).equal('foo')
      //... let model = {
      //...   xml: {
      //...     attribute: 'bar',
      //...   },
      //... }
      //... var d = eYo.data.new(model, 'foo', onr)
      //... chai.expect(d.attributeName).equal('bar')
      //>>>
    },
    value: '',
    //<<< mochai: value
    //... var d = new eYo.Data('foo', onr)
    //... chai.expect(d.value).equal('')
    //... d.value_ = 'foo'
    //... chai.expect(d.value).equal('foo')
    //>>>
    /**
     * Wether a value change fires an undo event.
     * May be overriden by the javascript model.
     */
    noUndo: {
      //<<< mochai: noUndo
      lazy () {
        return !!this.model.noUndo
      }
      //... var d = new eYo.Data('foo', onr)
      //... chai.expect(d.noUndo).false
      //... let model = {
      //...   noUndo: 1,
      //... }
      //... var d = eYo.data.new (model, 'foo', onr)
      //... chai.expect(d.noUndo).true
      //>>>
    },
    required_from_model: false,
    //<<< mochai: noUndo
    //... var d = new eYo.Data('foo', onr)
    //... chai.expect(d.required_from_model).false
    //... d.required_from_model_ = true
    //... chai.expect(d.required_from_model).true
    //>>>
    /**
     * Disabled data correspond to disabled input.
     * Changing this value will cause an UI synchronization and a change count.
     */
    incog: {
      //<<< mochai: incog
      after: ['required_from_model', 'changer'],
      value: false,
      //... let changer = eYo.changer.new('changer', onr)
      //... setup({
      //...   properties: {
      //...     changer
      //...   }
      //... })
      //... var d = new eYo.Data('foo', onr)
      //... chai.expect(changer).equal(d.changer)
      //... chai.expect(d).property('incog_p')
      //... chai.expect(d.incog).false
      validate (after) {
        return eYo.isDef(after)
          ? !!after
          : !this.required_from_model_
      },
      //... let model = {
      //...   noUndo: 1,
      //... }
      //... var d = eYo.data.new (model, 'foo', onr)
      //... chai.expect(d.incog).false
      //... d.incog_ = true
      //... chai.expect(d.incog).true
      //... d.incog_ = false
      //... chai.expect(d.incog).false
      //... d.incog_ = eYo.NA
      //... chai.expect(d.incog).true
      //... d.required_from_model_ = 421
      //... d.incog_ = eYo.NA
      //... chai.expect(d.incog).false
      /**
       * Disabled data correspond to disabled input.
       * Changing this value will cause an UI synchronization but no change count.
       * @param {Boolean} after - When not defined, replaced by `!this.required_from_model_`
       */
      set (builtin, after) {
        this.changer.wrap(() => {
          builtin(after)
          this.slot && (this.slot.incog_ = after)
          this.field && (this.field.visible_ = !after)
        })
      },
      //... changer.reset()
      //... var d = eYo.data.new (model, 'foo', onr)
      //... chai.expect(changer).equal(d.changer)
      //... chai.expect(changer.count).equal(0)
      //... d.incog_ = true
      //... chai.expect(changer.count).equal(1)
      //... d.incog_ = false
      //... chai.expect(changer.count).equal(2)
      //... var d = eYo.data.new (model, 'foo', onr)
      //... d.slot = {}
      //... d.field = {}
      //... d.incog_ = true
      //... chai.expect(d.slot.incog_).equal(d.incog)
      //... chai.expect(d.field.visible_).equal(!d.incog)
      //... d.incog_ = false
      //... chai.expect(d.slot.incog_).equal(d.incog)
      //... chai.expect(d.field.visible_).equal(!d.incog)
      //>>>
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
    //>>>
  },
  aliases: {
    //<<< mochai: Aliases
    'brick.changer': 'changer',
    'brick.type': 'brickType',
    'brick.data': 'data',
    'brick.ui': 'ui',
    'brick.drvr': 'drvr',
    //... let b3k = eYo.o4t.singleton({
    //...   properties: {
    //...     changer: 1,
    //...     type: 2,
    //...     data: 3,
    //...     ui: 4,
    //...     driver: 5,
    //...   },
    //... }, onr)
    //... chai.expect(b3k[eYo.$].model.properties.changer.value()).equal(1)
    //... chai.expect(b3k.changer).equal(1)
    //... chai.expect(b3k.type).equal(2)
    //... let d = eYo.data.new({}, 'd', b3k)
    //... chai.expect(d).property('changer_p')
    //... chai.expect(d).property('brickType_p')
    //... chai.expect(d).property('data_p')
    //... chai.expect(d).property('ui_p')
    //... chai.expect(d).property('driver_p')
    //... chai.expect(d.brick).equal(b3k)
    //... chai.expect(d.changer).equal(1)
    //... chai.expect(d.brickType).equal(2)
    //... chai.expect(d.data).equal(3)
    //... chai.expect(d.ui).equal(4)
    //... chai.expect(d.drvr).equal(5)
    //>>>
    //<<< mochai: changer
    //... let changer = eYo.o4t.new({
    //...   methods: {
    //...     wrap (f, ...$) {
    //...       flag.push(1, f(...$), 4)
    //...     },
    //...   },
    //... }, 'changer')
    //... setup({
    //...   properties: {
    //...     changer
    //...   }
    //...})
    //... chai.expect(changer).equal(onr.changer)
    //... let d = eYo.data.new({}, 'd', onr)
    //... chai.expect(changer).equal(d.changer)
    //... d.changer.wrap(() => {
    //...   return 23
    //... })
    //... flag.expect(1234)
    //>>>
  },
  // ANCHOR: Methods
  methods: {
    //<<< mochai: methods
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
    validate: eYo.doReturn2nd,
    /**
     * Validates the value of the data
     * May be overriden by the model.
     * @param {Object} before
     * @param {Object} after
     */
    validateIncog: eYo.doReturn2nd,
    /**
     * Returns the text representation of the data.
     * @param {Object} [after]
     */
    toText () {
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
    willUnchange: eYo.doNothing,
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
    didUnchange: eYo.doNothing,
    /**
     * Before the didChange message is sent.
     * The signature is `onChange( before, after ) → void`
     * May be overriden by the model.
     * No undo message is yet sent but the data has recorded the new value.
     * Other object may change to conform to this new state,
     * before undo events are posted.
     * @param {Object} before
     * @param {Object} after
     * @return eYo.NA
     */
    onChange: eYo.doNothing,
    /**
     * Before the didUnchange message is sent.
     * The signature is `onUnchange( before, after ) → void`
     * May be overriden by the model.
     * No undo message is yet sent but the data has recorded the new value.
     * Other object may change to conform to this new state,
     * before undo events are posted.
     * @param {Object} before
     * @param {Object} after
     * @return eYo.NA
     */
    onUnchange: eYo.doNothing,
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
     * Branch to `onChange` or `onUnchange`.
     * @param {Object} before
     * @param {Object} after
     * @return eYo.NA
     */
    duringChange (before, after) { // eslint-disable-line
      (!eYo.event.recordingUndo ? this.onChange : this.onUnchange).apply(this, arguments)
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
    synchronize (before, after) { // eslint-disable-line
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
            field.text_ = this.toField()
            if (this.slot && this.slot.data === this) {
              this.slot.incog = false
              field.visible_ = !this.slot.unwrappedTarget && (!eYo.app.noBoundField || this.model.allwaysBoundField || this.get().length)
            } else {
              field.visible_ = true
            }
            let d = field.drvr
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
    willLoad: eYo.doNothing,
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
  //>>>
  },    
  //>>>
})

eYo.Data[eYo.$].finalizeC9r(
  eYo.model.manyDescriptorRA('all', 'after'),
  eYo.model.manyDescriptorF(
    'consolidate', 'fromType',
    'toField', 'fromField',
    'toText', 'fromText',
    'validate', 'validateIncog',
    'willLoad', 'didLoad',
    'willChange', 'onChange', 'didChange',
    'willUnchange', 'onUnchange', 'didUnchange',
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

eYo.mixinFR(eYo.data.Dlgt_p, {
  //<<< mochai: Delegate
  /**
   * Various methods are translated.
   * @param{Object} model - the model
   */
  methodsMerge (model) {
    let _p = this.C9r_p
    ;[
      ['willChange', 'willUnchange'], 
      ['onChange', 'onUnchange'],
      ['didChange', 'didChange']
    ].forEach(([D, K]) => {
      model[K] || (model[K] = model[D])
      _p[K] || (_p[K] = _p[D])
    })
    this.methodsMergeChange (model)
    this.methodsMergeUnchange (model)
    this.methodsMergeValidate (model)
    this.methodsMergeSynchronize (model)
    this.methodsMergeConsolidate (model)
    this.methodsMergeFilter (model)
    return eYo.data.Dlgt[eYo.$SuperC9r_p].methodsMerge.call(this, model)
  },
  methodsMergeChange (model) {
    //<<< mochai: methodsMergeChange
    //... var ns, d
    //... let new_ns = () => {
    //...   flag.reset()
    //...   ns = eYo.data.newNS()
    //...   ns.makeBaseC9r()
    //... }
    let _p = this.C9r_p
    ;['willChange', 'onChange', 'didChange'].forEach(K => { // closure!
      //... ;['willChange', 'onChange', 'didChange'].forEach(K => {
      //...   new_ns()
      //...   let test = (expect, f) => {
      //...     d = ns.new({
      //...       methods: {
      //...         [K]: f,
      //...       },
      //...     }, 'd', onr)
      //...     chai.expect(d[K](1, 2)).undefined
      //...     flag.expect(expect)
      //...   }
      let f_m = model[K]
      if (eYo.isF(f_m)) {
        let f_p = _p[K] || eYo.doNothing
        if (f_m.length > 2) {
          // builtin/before/after
          var m = {$ (before, after) {
            f_m.call(this, f_p.bind(this), before, after)
          }}
          //...   test(123, function (builtin, before, after) {
          //...     flag.push(before, after)
          //...     builtin(before, after)
          //...     flag.push(after + 1)
          //...   }) 
          //...   eYo.test.extend(ns.BaseC9r_p, K, function(before, after) {
          //...     flag.push(before + 2, after + 2)
          //...   })
          //...   test(1234, function (builtin, before, after) {
          //...     flag.push(before, after)
          //...     builtin(before, after)
          //...   })
        } else if (XRegExp.exec(f_m.toString(), eYo.xre.function_builtin)) {
          m = {$ (before, after) {
            f_m.call(this, $after => {
              f_p.call(this, before, $after)
            }, after)
          }}
          //...   test(1234, function (builtin, after) {
          //...     flag.push(1, after)
          //...     builtin(after)
          //...   }) 
          //...   eYo.test.extend(ns.BaseC9r_p, K, function(before, after) {
          //...     flag.push(before + 4, after + 4)
          //...   })
          //...   test(123456, function (builtin, after) {
          //...     flag.push(1, after)
          //...     builtin(after)
          //...   })
        } else {
          m = f_m.length > 1
            ? {$ (before, after) {
              //...   new_ns()
              //...   test(12, function(before, after) {
              //...     flag.push(before, after)
              //...   })
              //...   eYo.test.extend(ns.BaseC9r_p, K, function(before, after) {
              //...     flag.push(before + 2, after + 2)
              //...   })
              //...   test(123456, function (before, after) {
              //...     flag.push(before, after)
              //...     this[K](before, after)
              //...     flag.push(before + 4, after + 4)
              //...   })
              let owned = eYo.objectHasOwnProperty(this, K) && this[K]
              try {
                this[K] = f_p
                f_m.call(this, before, after)
              } finally {
                if (owned) {
                  this[K] = owned
                } else {
                  delete this[K]
                }
              }
            }} : {$ (before, after) { // eslint-disable-line
              //...   new_ns()
              //...   test(12, function (after) {
              //...     flag.push(1, after)
              //...   })
              //...   new_ns()
              //...   eYo.test.extend(ns.BaseC9r_p, K, function(before, after) {
              //...     flag.push(before + 2, after + 2)
              //...   })
              //...   test(123456, function (after) {
              //...     flag.push(1, after)
              //...     this[K](after)
              //...     flag.push(5, after + 4)
              //...   })
              let owned = eYo.objectHasOwnProperty(this, K) && this[K]
              try {
                this[K] = {$ ($after) {
                  f_p.call(this, before, $after)
                }}.$
                f_m.call(this, after)
              } finally {
                if (owned) {
                  this[K] = owned
                } else {
                  delete this[K]
                }
              }
            }}
        }
        model[K] = m.$
      } else {
        f_m && eYo.throw(`Unexpected model (${this.name}/${K}) value validate -> ${f_m}`)
      }
      //... })
    })
    //>>>
  },
  methodsMergeUnchange (model) {
    //<<< mochai: methodsMergeUnchange
    //... var ns, d
    //... let new_ns = () => {
    //...   flag.reset()
    //...   ns = eYo.data.newNS()
    //...   ns.makeBaseC9r()
    //... }
    let _p = this.C9r_p
    ;[
      ['willChange', 'willUnchange'], 
      ['onChange', 'onUnchange'],
      ['didChange', 'didChange']
    ].forEach(([D, K]) => { // closure!
      //... ;[
      //...   'willUnchange',
      //...   'onUnchange',
      //...   'didUnchange'
      //... ].forEach(K => {
      //...   new_ns()
      //...   let test = (expect, f) => {
      //...     d = ns.new({
      //...       methods: {
      //...         [K]: f,
      //...       },
      //...     }, 'd', onr)
      //...   }
      let f_m = model[K] || (model[K] = model[D])
      if (eYo.isF(f_m)) {
        let f_p = _p[K] ||  (_p[D] = _p[K]) || eYo.doNothing
        if (f_m.length > 2) {
          // builtin/before/after
          var m = {$ (before, after) {
            f_m.call(this, f_p.bind(this), before, after)
          }}
          //...   test(12, function (builtin, before, after) {
          //...     flag.push(before, after)
          //...     builtin(before, after)
          //...   }) 
          //...   eYo.test.extend(ns.BaseC9r_p, K, function(before, after) {
          //...     flag.push(before + 2, after + 2)
          //...   })
          //...   test(1234, function (builtin, before, after) {
          //...     flag.push(before, after)
          //...     builtin(before, after)
          //...   })
        } else if (XRegExp.exec(f_m.toString(), eYo.xre.function_builtin)) {
          m = {$ (before, after) {
            f_m.call(this, $after => {
              f_p.call(this, before, $after)
            }, after)
          }}
          //...   test(1234, function (builtin, after) {
          //...     flag.push(1, after)
          //...     builtin(after)
          //...   }) 
          //...   eYo.test.extend(ns.BaseC9r_p, K, function(before, after) {
          //...     flag.push(before + 4, after + 4)
          //...   })
          //...   test(123456, function (builtin, after) {
          //...     flag.push(1, after)
          //...     builtin(after)
          //...   })
        } else {
          m = f_m.length > 1
            ? {$ (before, after) {
              //...   new_ns()
              //...   test(12, function(before, after) {
              //...     flag.push(before, after)
              //...   })
              //...   eYo.test.extend(ns.BaseC9r_p, K, function(before, after) {
              //...     flag.push(before + 2, after + 2)
              //...   })
              //...   test(123456, function (before, after) {
              //...     flag.push(before, after)
              //...     this[K](before, after)
              //...     flag.push(before + 4, after + 4)
              //...   })
              let owned = eYo.objectHasOwnProperty(this, K) && this[K]
              try {
                this[K] = f_p
                f_m.call(this, before, after)
              } finally {
                if (owned) {
                  this[K] = owned
                } else {
                  delete this[K]
                }
              }
            }} : {$ (before, after) { // eslint-disable-line
              //...   new_ns()
              //...   test(12, function (after) {
              //...     flag.push(1, after)
              //...   })
              //...   new_ns()
              //...   eYo.test.extend(ns.BaseC9r_p, K, function(before, after) {
              //...     flag.push(before + 2, after + 2)
              //...   })
              //...   test(123456, function (after) {
              //...     flag.push(1, after)
              //...     this[K](after)
              //...     flag.push(5, after + 4)
              //...   })
              let owned = eYo.objectHasOwnProperty(this, K) && this[K]
              try {
                this[K] = {$ ($after) {
                  f_p.call(this, before, $after)
                }}.$
                f_m.call(this, after)
              } finally {
                if (owned) {
                  this[K] = owned
                } else {
                  delete this[K]
                }
              }
            }}
        }
        model[K] = m.$
      } else {
        f_m && eYo.throw(`Unexpected model (${this.name}/${K}) value validate -> ${f_m}`)
      }
      //... })
    })
    //>>>
  },
  methodsMergeValidate (model) {
    //<<< mochai: methodsMergeValidate
    //... var ns, d
    //... let new_ns = () => {
    //...   flag.reset()
    //...   ns = eYo.data.newNS()
    //...   ns.makeBaseC9r()
    //... }
    //... var K
    let _p = this.C9r_p
    ;['validate', 'validateIncog'].forEach(K => { // closure!
    //... for (K of ['validate', 'validateIncog']) {
    //...   new_ns()
    //...   let test = (expect, f) => {
    //...     d = ns.new({
    //...       methods: {
    //...         [K]: f,
    //...       },
    //...     }, 'd', onr)
    //...     chai.expect(d[K](1, 2)).equal(3)
    //...     flag.expect(expect)
    //...   }
      let f_m = model[K]
      if (eYo.isF(f_m)) {
        let f_p = _p[K] || eYo.doReturn2nd
        if (f_m.length > 2) {
        // builtin/before/after
          var m = {$ (before, after) {
            return f_m.call(this, f_p.bind(this), before, after)
          }}
        //...   test(123, function (builtin, before, after) {
        //...     flag.push(before, after)
        //...     after = builtin(before, after + 1)
        //...     flag.push(after)
        //...     return after
        //...   }) 
        //...   eYo.test.extend(ns.BaseC9r_p, K, function(before, after) {
        //...     flag.push(before + 2, after + 1)
        //...   })
        //...   test(12345, function (builtin, before, after) {
        //...     flag.push(before, after)
        //...     after = builtin(before, after + 1)
        //...     flag.push(after + 2)
        //...     return after
        //...   })
        //...   test(123456, function (builtin, before, after) {
        //...     flag.push(before, after)
        //...     after = builtin(before, after + 1)
        //...     flag.push(before + 4, after + 3)
        //...     return after
        //...   })
        } else if (XRegExp.exec(f_m.toString(), eYo.xre.function_builtin)) {
          m = {$ (before, after) {
            return f_m.call(this, $after => {
              return f_p.call(this, before, $after)
            }, after)
          }}
        } else {
          m = f_m.length > 1
            ? {$ (before, after) {
            //...   new_ns()
            //...   test(12, function(before, after) {
            //...     flag.push(before, after)
            //...     return after + 1
            //...   })
            //...   eYo.test.extend(ns.BaseC9r_p, K, function(before, after) {
            //...     flag.push(before + 2, after + 1)
            //...   })
            //...   test(123456, function (before, after) {
            //...     flag.push(before, after)
            //...     after = this[K](before, after + 1)
            //...     flag.push(before + 4, after + 3)
            //...     return after
            //...   })
              let owned = eYo.objectHasOwnProperty(this, K) && this[K]
              try {
                this[K] = f_p
                return f_m.call(this, before, after)
              } finally {
                if (owned) {
                  this[K] = owned
                } else {
                  delete this[K]
                }
              }
          }} : {$ (before, after) { // eslint-disable-line
            //...   new_ns()
            //...   test(2, function (after) {
            //...     flag.push(after)
            //...     return after + 1
            //...   })
            //...   new_ns()
            //...   eYo.test.extend(ns.BaseC9r_p, K, function(before, after) {
            //...     flag.push(before + 2, after + 1)
            //...   })
            //...   test(123456, function (after) {
            //...     flag.push(1, after)
            //...     after = this[K](after + 1)
            //...     flag.push(5, after + 3)
            //...     return after
            //...   })
              let owned = eYo.objectHasOwnProperty(this, K) && this[K]
              let used = owned === f_p ? eYo.doReturn2nd : f_p
              try {
                this[K] = {$ ($after) {
                  return used.call(this, before, $after)
                }}.$
                return f_m.call(this, after)
              } finally {
                if (owned) {
                  this[K] = owned
                } else {
                  delete this[K]
                }
              }
            }}
        }
        model[K] = m.$
      } else {
        f_m && eYo.throw(`Unexpected model (${this.name}/${K}) value validate -> ${f_m}`)
      }
    //... }
    })
    //>>>
  },
  methodsMergeSynchronize (model) {
    //<<< mochai: methodsMergeSynchronize
    //... var ns, d
    //... let new_ns = () => {
    //...   flag.reset()
    //...   ns = eYo.data.newNS()
    //...   ns.makeBaseC9r()
    //... }
    //... var K
    let _p = this.C9r_p
    ;['synchronize'].forEach(K => { // closure!
      //... K = 'synchronize'
      //... {
      //...   new_ns()
      //...   let test = (expect, f) => {
      //...     d = ns.new({
      //...       methods: {
      //...         [K]: f,
      //...       },
      //...     }, 'd', onr)
      //...     chai.expect(d[K](1, 2)).undefined
      //...     flag.expect(expect)
      //...   }
      let f_m = model[K]
      if (eYo.isF(f_m)) {
        let f_p = _p[K] || eYo.doNothing
        if (f_m.length > 2) {
          // builtin/before/after
          var m = {$ (before, after) {
            f_m.call(this, f_p.bind(this), before, after)
          }}
          //...   test(123, function (builtin, before, after) {
          //...     flag.push(before, after)
          //...     builtin(before, after)
          //...     flag.push(after + 1)
          //...   }) 
          //...   eYo.test.extend(ns.BaseC9r_p, K, function(before, after) {
          //...     flag.push(before + 2, after + 2)
          //...   })
          //...   test(1234, function (builtin, before, after) {
          //...     flag.push(before, after)
          //...     builtin(before, after)
          //...   })
        } else if (XRegExp.exec(f_m.toString(), eYo.xre.function_builtin)) {
          m = {$ (before, after) {
            f_m.call(this, $after => {
              f_p.call(this, before, $after)
            }, after)
          }}
          //...   test(1234, function (builtin, after) {
          //...     flag.push(1, after)
          //...     builtin(after)
          //...   }) 
          //...   eYo.test.extend(ns.BaseC9r_p, K, function(before, after) {
          //...     flag.push(before + 4, after + 4)
          //...   })
          //...   test(123456, function (builtin, after) {
          //...     flag.push(1, after)
          //...     builtin(after)
          //...   })
        } else {
          m = f_m.length > 1
            ? {$ (before, after) {
              //...   new_ns()
              //...   test(12, function(before, after) {
              //...     flag.push(before, after)
              //...   })
              //...   eYo.test.extend(ns.BaseC9r_p, K, function(before, after) {
              //...     flag.push(before + 2, after + 2)
              //...   })
              //...   test(123456, function (before, after) {
              //...     flag.push(before, after)
              //...     this[K](before, after)
              //...     flag.push(before + 4, after + 4)
              //...   })
              try {
                this[K] = f_p
                f_m.call(this, before, after)
              } finally {
                delete this[K]
              }
            }} : {$ (before, after) { // eslint-disable-line
              //...   new_ns()
              //...   test(12, function (after) {
              //...     flag.push(1, after)
              //...   })
              //...   new_ns()
              //...   eYo.test.extend(ns.BaseC9r_p, K, function(before, after) {
              //...     flag.push(before + 2, after + 2)
              //...   })
              //...   test(123456, function (after) {
              //...     flag.push(1, after)
              //...     this[K](after)
              //...     flag.push(5, after + 4)
              //...   })
              try {
                this[K] = {$ ($after) {
                  f_p.call(this, before, $after)
                }}.$
                f_m.call(this, after)
              } finally {
                delete this[K]
              }
            }}
        }
        model[K] = m.$
      } else {
        f_m && eYo.throw(`Unexpected model (${this.name}/${K}) value validate -> ${f_m}`)
      }
      //... }
    })
    //>>>
  },
  methodsMergeConsolidate (model) {
    //<<< mochai: methodsMergeConsolidate
    //... var ns, d
    //... let new_ns = () => {
    //...   flag.reset()
    //...   ns = eYo.data.newNS()
    //...   ns.makeBaseC9r()
    //... }
    //... var K
    let _p = this.C9r_p
    ;['consolidate'].forEach(K => { // closure!
      //... K = 'consolidate'
      //... {
      //...   new_ns()
      //...   let test = (expect, f) => {
      //...     d = ns.new({
      //...       methods: {
      //...         [K]: f
      //...         ? f.length
      //...           ? {$ (x, ...$) {
      //...             flag.push(1)
      //...             f && f.call(this, x, ...$)
      //...           }}.$
      //...           : {$ () {
      //...             flag.push(1)
      //...             f && f.call(this)
      //...           }}.$
      //...         : {$ () {
      //...           flag.push(1)
      //...         }}.$,
      //...       },
      //...     }, 'd', onr)
      //...     chai.expect(d[K]()).undefined
      //...     flag.expect(expect)
      //...   }
      let f_m = model[K]
      if (eYo.isF(f_m)) {
        let f_p = _p[K] || eYo.doNothing
        let m = f_m.length > 0
          ? {$ () {
            //...   new_ns()
            //...   test(12, function(builtin) {
            //...     flag.push(2)
            //...     builtin()
            //...   })
            //...   eYo.test.extend(ns.BaseC9r_p, K, function() {
            //...     flag.push(3)
            //...   })
            //...   test(123, function (builtin) {
            //...     flag.push(2)
            //...     builtin()
            //...   })
            f_m.call(this, f_p.bind(this))
          }} : {$ () { // eslint-disable-line
            //...   new_ns()
            //...   test(12, function () {
            //...     flag.push(2)
            //...   })
            //...   new_ns()
            //...   eYo.test.extend(ns.BaseC9r_p, K, function() {
            //...     flag.push(3)
            //...   })
            //...   test(123, function () {
            //...     flag.push(2)
            //...     this[K]()
            //...   })
            let owned = eYo.objectHasOwnProperty(this, K) && this[K]
            try {
              this[K] = f_p
              f_m.call(this)
            } finally {
              if (owned) {
                this[K] = owned
              } else {
                delete this[K]
              }
            }
          }}
        model[K] = m.$
      } else {
        f_m && eYo.throw(`Unexpected model (${this.name}/${K}) value validate -> ${f_m}`)
      }
      //... }
    })
    //>>>
  },
  methodsMergeFilter (model) {
    //<<< mochai: methodsMergeFilter
    //... var ns, d
    //... let new_ns = () => {
    //...   flag.reset()
    //...   ns = eYo.data.newNS()
    //...   ns.makeBaseC9r()
    //... }
    //... var K
    let _p = this.C9r_p
    ;['filter'].forEach(K => { // closure!
      //... K = 'filter'
      //... {
      //...   new_ns()
      //...   let test = (expect, f) => {
      //...     d = ns.new({
      //...       methods: {
      //...         [K]: f
      //...         ? f.length > 1
      //...           ? {$ (builtin, after) {
      //...             flag.push(1, after+1)
      //...             return f ? f.call(this, builtin, after) : 9
      //...           }}.$
      //...           : {$ (after) {
      //...             flag.push(1, after+1)
      //...             return f ? f.call(this, after) : 9
      //...           }}.$
      //...         : {$ (after) {
      //...           flag.push(1, after+1)
      //...           return 9
      //...         }}.$,
      //...       },
      //...     }, 'd', onr)
      //...     chai.expect(d[K](1)).equal(1)
      //...     flag.expect(expect)
      //...   }
      let f_m = model[K]
      if (eYo.isF(f_m)) {
        let f_p = _p[K] || eYo.doNothing
        let m = f_m.length > 1
          ? {$ (after) {
            //...   new_ns()
            //...   test(1234, function(builtin, after) {
            //...     flag.push(3, after+3)
            //...     return builtin(after)
            //...   })
            //...   eYo.test.extend(ns.BaseC9r_p, K, function(after) {
            //...     flag.push(5, after+5)
            //...   })
            //...   test(123456, function (builtin, after) {
            //...     flag.push(3, after+3)
            //...     return builtin(after)
            //...   })
            return f_m.call(this, f_p.bind(this), after)
          }} : {$ (after) {
            //...   new_ns()
            //...   test(1234, function (after) {
            //...     flag.push(3, after+3)
            //...     return after
            //...   })
            //...   new_ns()
            //...   eYo.test.extend(ns.BaseC9r_p, K, function(after) {
            //...     flag.push(5, after+5)
            //...     return after
            //...   })
            //...   test(123456, function (after) {
            //...     flag.push(3, after+3)
            //...     this[K](after)
            //...     return after
            //...   })
            let owned = eYo.objectHasOwnProperty(this, K) && this[K]
            try {
              this[K] = f_p
              return f_m.call(this, after)
            } finally {
              if (owned) {
                this[K] = owned
              } else {
                delete this[K]
              }
            }
          }}
        model[K] = m.$
      } else {
        f_m && eYo.throw(`Unexpected model (${this.name}/${K}) value validate -> ${f_m}`)
      }
      //... }
    })
    //>>>
  },
  //>>>
})
