/**
 * edython
 *
 * Copyright 2020 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Input extension for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

/**
 * @name{eYo.slot}
 * @namespace
 */
eYo.fsm.newNS(eYo, 'slot')

eYo.require('do')
eYo.require('decorate')
eYo.require('geom')

eYo.forward('field')
eYo.forward('magnet')

// eYo.forward('xml')
// eYo.forward('key')
// eYo.forward('expr.List')

//g@@g.forwardDeclare('g@@g.dom');

eYo.make$$('modelSetUp')

/**
 * @name {eYo.Slot}
 * The model is one of the entries of the `slots` section
 * of the object used to create a delegate's subclass.
 * Here are some specifications for that model part.
 *
 * Any slot is constructed the same way
 * 1) operator field
 * 2) label field
 * 3) start field
 * 4) either editable field, value input of wrapped brick.
 * 5) end field
 *
 * If the given model contains a `wrap` key, then a wrapped
 * brick is created.
 *
  // we assume that one input model only contains at most one of
  // - editable field
  // - value input, check: key
  // - wrap input
  // - insert input
  // It may contain label fields
 * @param {eYo.brick.C9rBase} brick  The owner is a brick.
 * @param {string} key  One of the keys in `slots` section of the brick model.
 * @param {Object} model  the model for the given key in the above mention section.
 * @constructor
 */
eYo.slot.makeC9rBase(true, {
  //<<< mochai: eYo.Slot
  init (key, brick) {
    key || eYo.throw('Missing slot key')
    brick || eYo.throw('Missing slot owner brick')
    eYo.isNA(this.model.order) && eYo.throw('Missing slot model order')
    
    let setupModel = model => {
      model[eYo.$$.modelSetUp] = true
      if (model.validateIncog && !eYo.isF(model.validateIncog)) {
        delete model.validateIncog
      }
    }
    var model = this.model_
    model.setup_ || setupModel(model)
    if (eYo.isDef(model.check)) {
      this.magnet_ = eYo.magnet.new(model, eYo.magnet.IN, this)
      if (model.wrap) {
        this.magnet_.wrapped = model.wrap   
      } else if (model.promise) {
        this.magnet_.promised = model.promise
        this.incog_ = true
      }
    }
    if (key === 'comment') {
      this.bind_f && (this.bind_f.isComment = true)
    }
  },
  /**
   * Dispose of all attributes.
   * Asks the owner's renderer to do the same.
   * @param {Boolean} [onlyThis]  Dispose of the inferior target iff healStack is a falsy value
   */
  dispose (onlyThis) {
    eYo.field.disposeFields(this)
    this.magnet_ && this.magnet_.dispose(onlyThis)
    this.magnet_ = eYo.NA
  },
  /**
   * UI management.
   * Install this slot and its associate fields on their brick.
   * No data change.
   */
  initUI () {
    this.fieldForEach(f => f.initUI())
  },
  /**
   * UI management.
   * Install this slot and its associate fields on their brick.
   * No data change.
   */
  disposeUI () {
    this.fieldForEach(f => f.disposeUI())
  },
  properties: {
    magnet: eYo.NA,
    /**
     * @property {eYo.data.C9rBase} data  Bound data.
     */
    data: eYo.NA,
    visible: true,
    incog: {
      after: 'brick',
      value () {
        return true
      },
      validate (after) {
        if (this.data) {
          after = this.data.incog
        } else if (eYo.isNA(after)) {
          after = !!after
        } else {
          after = !this.required
        }
        var validator = this.slots && this.model.validateIncog
        if (validator) { // if !this.slots, the receiver is not yet ready
          after = validator.call(this, after)
        }
        return after
      },
      set_ (builtin, after) {
        this.brick_.changer.wrap(() => {
          builtin(after)
          // forward to the connection
          var m4t = this.magnet
          if (m4t) {
            m4t.incog_ = after
          }
        })
      },
    },
    /**
     * Get the concrete required status.
     * For edython.
     * @param {boolean} after
     */
    requiredFromModel: eYo.NA,
    /**
     * @readonly
     * @property {eYo.brick.C9rBase} brick  the immediate brick in which this is contained
     */
    brick: {
      get () {
        return this.owner_
      },
    },
    /**
     * @readonly
     * @property {eYo.brick.C9rBase} brick  the immediate brick in which this is contained
     */
    targetBrick: {
      get () {
        var m4t = this.magnet
        return m4t && m4t.targetBrick
      },
    },
    where: {
      value () {
        return new eYo.geom.Point()
      },
      copy: true,
    },
    /**
     * Position of the receiver in its board
     * @readonly
     * @property {Number}
     */
    whereInBoard: {
      get () {
        return this.where_.forward(this.brick.whereInBoard)
      },
    },
    /**
     * Position of the receiver in its brick.
     * @property {Number}
     */
    whereInBrick: {
      get () {
        return this.where
      },
      set (after) {
        this.where_.set(after)
      }
    },
    recover: {
      get () {
        return this.brick_.recover
      },
    },
    xmlKey: {
      get () {
        return (this.model.xml && this.model.xml.key) || this.key
      },
    },
    requiredIncog: {
      get () {
        return this.incog
      },
      set (after) {
        this.incog = !(this.required = !!after)
      }
    },
    /**
     * @property {boolean} isRequiredToModel - Get the required status.
     */
    isRequiredToModel: {
      get () {
        if (this.incog) {
          return false
        }
        if (!this.magnet) {
          return false
        }
        if (!this.magnet.wrapped_ && this.targetBrick) {
          return true
        }
        if (this.required) {
          return true
        }
        if (this.data && this.data.required_from_model) {
          return false
        }
        if (this.model.xml && this.model.xml.required) {
          return true
        }
        return false
      },
    },
    /**
     * Get the concrete required status.
     * For edython.
     * @param {boolean} after
     */
    required_from_saved: {
      get () {
        var t9k = this.targetBrick
        if (t9k) {
          if (t9k.wrapped_) {
            // return true if one of the inputs is connected
            return t9k.slotSome(slot => !!slot.target)
          }
          return true
        }
        return this.requiredFromModel
      },
    },
  },
  aliases: {
    'magnet.unwrappedTarget': 'unwrappedTarget',
  },
  methods: {
    isSlot () {
      return true
    },
    /**
     * Take action when required from model.
     * For edython.
     * @param {Function} do_it
     */
    whenRequiredFromModel (do_it) {
      if (this.isRequiredFromModel) {
        this.isRequiredFromModel = false
        if (eYo.isF(do_it)) {
          do_it.call(this)
        }
        return true
      }
    },
    /**
     * Consolidate the state.
     * Forwards to the connection delegate.
     * For edython.
     * @param {Boolean} deep whether to consolidate connected bricks.
     * @param {Boolean} force whether to force synchronization.
     */
    consolidate (deep, force) { // eslint-disable-line
      var m4t = this.magnet
      if (m4t) {
        m4t.incog = this.incog
        m4t.wrapped_ && (m4t.hidden = true) // Don't ever connect any brick to this
        var v
        if ((v = this.model.check)) {
          m4t.check = v.call(m4t, m4t.brick.type, m4t.brick.Variant_p)
        }
      }
    },
    /**
     * Set the UI state.
     * Called only by `synchronizeSlots`.
     * For edython.
     */
    synchronize () {
      var d = this.drvr
      if (!d) {
        return
      }
      var after = this.incog
      this.visible = !after
      if (this.visible) {
        this.fieldForEach(field => field.text.length > 0 && (field.visible = true))
      }
      d.displayedUpdate(this)
    },
    /**
     * Convert the slot's connected target into the given xml element.
     * List all the available data and converts them to xml.
     * For edython.
     * @param {Element} element the persistent element.
     * @param {Object} [opt]  See eponym parameter in `eYo.xml.brickToDom`.
     * @return a dom element, void lists may return nothing
     * @this a brick
     */
    save (element, opt) {
      if (this.incog) {
        return
      }
      var xml = this.model.xml
      if (xml === false) {
        return
      }
      var out = (() => {
        let t9k = this.targetBrick
        if (t9k) { // otherwise, there is nothing to remember
          if (t9k.wrapped_) {
            // wrapped bricks are just a convenient computational model.
            // For lists only, we do create a further level
            // Actually, every wrapped brick is a list
            if (t9k instanceof eYo.expr.List) {
              var child = eYo.xml.brickToDom(t9k, opt)
              if (child.firstElementChild) {
                child.setAttribute(eYo.xml.sLOT, this.xmlKey)
                eYo.dom.appendChild(element, child)
                return child
              }
            } else {
              // let the target populate the given element
              return eYo.xml.toDom(t9k, element, opt)
            }
          } else {
            child = eYo.xml.brickToDom(t9k, opt)
            if (child.firstElementChild || child.hasAttributes()) {
              child.setAttribute(eYo.xml.sLOT, this.xmlKey)
              eYo.dom.appendChild(element, child)
              return child
            }
          }
        }
      })()
      if (!out && this.isRequiredToModel) {
        this.saveRequired(element, opt)
      }
    },
    /**
     * Save a placeholder.
     * For edython.
     * @param {Element} element a dom element in which to save the receiver
     * @param {Object} opt
     */
    saveRequired (element) {
      var child = eYo.dom.createDom(eYo.xml.EXPR)
      child.setAttribute(eYo.key.EYO, eYo.key.PLACEHOLDER)
      child.setAttribute(eYo.xml.sLOT, this.xmlKey)
      eYo.dom.appendChild(element, child)
    },
    /**
     * Initialize the receiver from a dom element.
     * Given an element, initialize the slot target
     * brick with data from the given element.
     * The given element was created by the input's source brick
     * in a brickToDom method. If it contains a child element
     * which input attribute is exactly the input's name,
     * then we ask the input target brick to fromDom.
     * Target bricks are managed here too.
     * No consistency test is made however.
     * For edython.
     * @param {Element} element a dom element in which to save the input
     * @return true if this is loaded
     */
    load (element) {
      this.loaded_ = false
      var xml = this.model.xml
      if (xml === false) {
        return
      }
      this.requiredFromModel = false
      var out
      var t9k = this.targetBrick
      if (t9k && t9k.wrapped_ && !(t9k instanceof eYo.expr.List)) {
        this.requiredFromModel = true // this is not sure, it depends on how the target read the dom
        out = eYo.xml.fromDom(t9k, element)
        this.recover.dontResit(element)
      } else {
      // find the xml child with the proper slot attribute
        eYo.do.SomeElementChild(element, child => {
          var attribute = child.getAttribute(eYo.xml.sLOT)
          if (attribute && (attribute === this.xmlKey || attribute === this.key || (this.model.xml && eYo.isF(this.model.xml.accept) && this.model.xml.accept.call(this, attribute)))) {
            this.recover.dontResit(child)
            if (child.getAttribute(eYo.key.EYO) === eYo.key.PLACEHOLDER) {
              this.requiredFromModel = true
              out = true
            } else {
              if (!t9k && this.model.promise) {
                this.completePromise()
                t9k = this.targetBrick
              }
              if (t9k) {
                if (t9k instanceof eYo.expr.List) {
                  // var grandChildren = Array.prototype.slice.call(child.childNodes)
                  eYo.do.forEachElementChild(child, grandChild => {
                    var name = grandChild.getAttribute(eYo.xml.sLOT)
                    var slot = t9k.getSlot(name)
                    if (slot) {
                      if (slot.magnet) {
                        var grand_t_brick = slot.target
                        if ((grand_t_brick)) {
                          eYo.xml.fromDom(grand_t_brick, grandChild)
                          this.recover.dontResit(grandChild)
                        } else if ((grand_t_brick = eYo.xml.domToBrick(grandChild, this.brick_))) {
                          var t_m4t = grand_t_brick.out_m
                          if (t_m4t && t_m4t.checkType_(slot.magnet, true)) {
                            t_m4t.connect(slot.magnet)
                            this.requiredFromModel = true
                          }
                          this.recover.dontResit(grandChild)
                        }
                      } else {
                        console.error('Missing connection')
                      }
                    }
                  })
                  out = true
                } else {
                  out = eYo.xml.fromDom(t9k, child)
                }
                this.recover.dontResit(child)
              } else if ((t9k = eYo.xml.domToBrick(child, this.brick_))) {
                var m5s = t9k.magnets
                // we could create a brick from that child element
                // then connect it
                this.recover.dontResit(child)
                var m4t = this.magnet
                if (m4t && m5s.out && m4t.checkType_(m5s.out, true)) {
                  m4t.connect(m5s.out)
                  this.requiredFromModel = true
                } else if (m5s.head && m4t.checkType_(m5s.head, true)) {
                  m4t.connect(m5s.head)
                }
                out = t9k
              }
            }
            return true // the element was found
          }
        })
      }
      return this.loaded_ = out
    },
    /**
     * When all the slots and data have been loaded.
     * For edython.
     */
    willLoad (...$) {
      let f = this.model.willLoad
      if (eYo.isF(f)) {
        this.willLoad = eYo.doNothing
        try {
          f.call(this, ...$)
        } finally {
          delete this.willLoad
        }
      }
    },
    /**
     * When all the slots and data have been loaded.
     * This is sent once at creation time (when default data has been loaded)
     * and possibly once when the saved representation has been loaded.
     * For edython.
     */
    didLoad (...$) {
      let f = this.model.didLoad
      if (eYo.isF(f)) {
        this.didLoad = eYo.doNothing
        try {
          f.call(this, ...$)
        } finally {
          delete this.didLoad
        }
      }
    },
    /**
     * execute the given function for the receiver and its next siblings.
     * For edython.
     * @param {function} helper
     */
    forEach (helper, ...$) {
      if (eYo.isF(helper)) {
        var slot = this
        do {
          helper.call(slot, ...$)
        } while ((slot = slot[eYo.$next]))
      }
    },
    /**
     * execute the given function for the receiver and its previous siblings.
     * For edython.
     * @param {function} helper
     * @return {boolean} whether there was an slot to act upon or no helper given
     */
    forEachPrevious (helper, ...$) {
      if (eYo.isF(helper)) {
        var slot = this
        do {
          helper.call(slot, ...$)
        } while ((slot = slot[eYo.$previous]))
      }
    },
    /**
     * execute the given function for the receiver and its next siblings.
     * If the return value of the given function is true,
     * then it was the last iteration and the loop breaks.
     * For edython.
     * @param {function} helper
     * @return {?Object} The slot that returned true, eventually.
     */
    some (helper, ...$) {
      if (eYo.isF(helper)) {
        var slot = this
        do {
          if (helper.call(slot, ...$)) {
            return slot
          }
        } while ((slot = slot[eYo.$next]))
      }
    },
    /**
     * execute the given function for the fields.
     * For edython.
     * @param {object} [$this] - optional `this` object
     * @param {function} helper
     */
    fieldForEach ($this, helper) {
      this.eyo$.fieldForEach(this, $this, helper)
    },
    /**
     * Connect the brick or magnet. When not given a magnet, the output magnet is used. It is natural for slots.
     * The slot corresponds to a wrapped list block.
     * @param {eYo.Brick | eYo.Magnet} bm - either a brick or a magnet.
     * @param {String} [key] - an optional input key. When not given the last free input is used.
     * @return {?eYo.Magnet} the eventual magnet target that was connected.
     */
    listConnect (bm, key) {
      var t9k = this.targetBrick
      if (!t9k) {
        this.completePromise()
        if (!(t9k = this.targetBrick)) {
          return eYo.NA
        }
      }
      if (!key) {
        return t9k.connectLast(bm)
      }
      var slot = t9k.getSlot(key)
      if (slot) {
        var m4t = slot.magnet
        if (m4t) {
          var other = (bm.magnets && bm.out_m) || bm
          return m4t.connect(other)
        }
      }
    },
    /**
     * Connect to the target.
     * For edython.
     * @param {eYo.brick | eYo.magnet.C9rBase} bm  The target is either a brick or another magnet.
     * @return {?eYo.magnet.C9rBase} the eventual target magnet
     */
    connect (bm) {
      if (bm) {
        var m4t = this.magnet
        if(m4t) {
          var other = (bm.magnets && bm.out_m) || bm
          if (m4t.checkType_(other)) {
            return m4t.connect(other)
          }
        }
      }
    },
    /**
     * Complete with a promised brick.
     * Forwards to the receiver's magnet.
     * One shot in case of success.
     * @return {Boolean} whether the complete was successfull
     */
    completePromise () {
      var m4t = this.magnet
      if (m4t && m4t.completePromise()) {
        this.completePromise = eYo.doNothing
        return true
      }
    },
  },
  //>>>
})

eYo.mixinFR(eYo.slot.Dlgt_p, {
  /**
   * Initialize the instance.
   * Calls the inherited method, then adds methods defined by the model.
   * The methods are managed by the |dataHandler| method of the |eYo.model|.
   * @param {Object} object - The object to initialize.
   */
  initInstance (object, ...$) {
    //<<< mochai: initInstance
    let $super = this.$super
    if ($super) {
      $super.initInstance(object, ...$)
    }
    let methods = this.model['.methods']
    methods && methods.forEach(f => {
      f(object, ...$)
    })
    //... setup({
    //...   properties: {
    //...     isBrick: true,
    //...   },
    //... })
    //... let slot = eYo.slot.new({}, 'key', onr)
    //>>>
  },
})

eYo.Slot$.manyEnhanced('field', 'fields')
//<<< mochai: fields
//>>>

eYo.Slot[eYo.$].finalizeC9r([
  'order', // INTEGER,
  'promise', // : eYo.t3.expr.value_list,
  'plugged', // : eYo.t3.expr.primary,
], [
  'fields', // {},
], [
  'check', // :  BRICK_TYPE || [BRICK_TYPE] || () => {}, // last is expected
  'validateIncog', //  () => {},
  'accept', //  () => {},
  'willConnect', //  () => {},
  'willDisconnect', //  () => {},
  'didConnect', //  () => {},
  'didDisconnect', //  () => {},
  'consolidate', // () => {},
  'wrap', // : TYPE,
  'xml', // : (() => {} || true) || false ||  first expected,
], {
  xml: {
    foo: [
      'accept', //  () => {},
    ],
  },
})


