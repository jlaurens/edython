/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Input extension for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Slot')

goog.require('eYo.Protocol')

goog.require('eYo.Do')
goog.require('eYo.Where')
goog.require('eYo.Decorate')
goog.require('eYo.Field')
goog.require('eYo.Magnet')
goog.require('eYo.T3.Profile')

goog.require('goog.dom');

goog.forwardDeclare('eYo.Xml')

/**
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
 * @param {!eYo.Brick} brick  The owner is a brick.
 * @param {!string} key  One of the keys in `slots` section of the brick model.
 * @param {!Object} model  the model for the given key in the above mention section.
 * @constructor
 */
eYo.Slot = function (brick, key, model) {
  eYo.Slot.superClass_.constructor.call(this, brick)
  goog.asserts.assert(brick, 'Missing slot owner brick')
  goog.asserts.assert(key, 'Missing slot key')
  goog.asserts.assert(model, 'Missing slot model')
  if (!model.order) {
    console.error('Missing slot model order')
  }
  goog.asserts.assert(model.order, 'Missing slot model order')
  this.where_ = new eYo.Where()
  this.reentrant_ = {}
  this.brick_ = brick
  this.key_ = key
  this.model_ = model
  var setupModel = model => {
    model.setup_ = true
    if (model.validateIncog && !goog.isFunction(model.validateIncog)) {
      delete model.validateIncog
    }
  }
  model.setup_ || setupModel(model)
  if (goog.isDefAndNotNull(model.check)) {
    this.magnet_ = new eYo.Magnet(this, eYo.Magnet.IN, model)
    if (model.wrap) {
      this.magnet_.wrapped = model.wrap   
    } else if (model.promise) {
      this.magnet_.promised = model.promise
      this.incog = true
    }
  }
  eYo.Field.makeFields(this, model.fields)
  if (key === 'comment') {
    this.bind_f && (this.bind_f.isComment = true)
  }
  var f = eYo.Decorate.reentrant_method.call(this, 'init_model', this.model.init)
  f && (f.call(this))
}
goog.inherits(eYo.Slot, eYo.Owned.UI2)

// Private properties with default values
Object.defineProperties(eYo.Slot.prototype, {
  incog_: {value: true, writable: true},
})

/**
 * Make the UI.
*/
eYo.Slot.prototype.makeUI = eYo.Decorate.makeUI(eYo.Slot, function () {
  this.ui_driver_mgr.slotInit(this)
})

/**
 * Dispose of the UI.
*/
eYo.Slot.prototype.disposeUI = eYo.Decorate.disposeUI(eYo.Slot, function () {
  this.ui_driver_mgr.slotDispose(this)
})

/**
 * Dispose of all attributes.
 * Asks the owner's renderer to do the same.
* @param {?Boolean} onlyThis  Dispose of the inferior target iff healStack is a falsy value
*/
eYo.Slot.prototype.dispose = eYo.Decorate.dispose(eYo.Slot, function (onlyThis) {
  eYo.Field.disposeFields(this)
  this.model_ = eYo.VOID
  this.magnet_ && this.magnet_.dispose(onlyThis)
  this.magnet_ = eYo.VOID
  this.key_ = eYo.VOID
  this.brick_ = eYo.VOID
  eYo.Property.dispose(this, 'where')
})

Object.defineProperties(eYo.Slot.prototype, {
  /**
   * @readonly
   * @property {eYo.Brick} brick  the immediate brick in which this is contained
   */
  brick: {
    get () {
      return this.brick_
    }
  },
  key: {
    get () {
      return this.key_
    }
  },
  magnet: {
    get () {
      return this.magnet_
    }
  },
  targetBrick: {
    get () {
      var m4t = this.magnet
      return m4t && m4t.targetBrick
    }
  },
  whereInBoard: {
    get () {
      return this.where.forward(this.brick.ui.whereInBoard)
    }
  },
  whereInBrick: {
    get () {
      return this.where
    },
    set (newValue) {
      this.where_.set(newValue)
    }
  },
  where: {
    get () {
      return this.where_.clone
    }
  },
  model: {
    get () {
      return this.model_
    }
  },
  /**
   * @property {eYo.Data} data  Bound data.
   */
  data: {
    writable: true
  },
  ui: {
    get () {
      return this.brick.ui
    }
  },
  ui_driver_mgr: {
    get () {
      var ui = this.ui
      return ui && ui.driver
    }
  },
  incog: {
    get () {
      return this.incog_
    },
    set (newValue) {
      if (this.data) {
        newValue = this.data.incog
      } else if (!goog.isDef(newValue)) {
        newValue = !this.required
      } else {
        newValue = !!newValue
      }
      var validator = this.slots && this.model.validateIncog
      if (validator) { // if !this.slots, the receiver is not yet ready
        newValue = validator.call(this, newValue)
      }
      this.brick_.change.wrap(
        () => {
          this.incog_ = newValue
          // forward to the connection
          var m4t = this.magnet
          if (m4t) {
            m4t.incog = newValue
          }
        },
        this,
        newValue
      )
    }
  },
  recover: {
    get () {
      return this.brick_.recover
    }
  },
  xmlKey: {
    get () {
      return (this.model.xml && this.model.xml.key) || this.key
    }
  },
})
// obsolete and deprecated API
Object.defineProperties(eYo.Slot.prototype, {
  c_eyo: {
    get () {
      console.error("BREAK HERE")
      throw "INCONSISTANCY"
    }
  },
  target: {
    get () {
      console.error("BREAK HERE")
      throw "ILLEGAL"
    }
  },
  unwrappedTarget: {
    get () {
      var m4t = this.magnet
      return m4t && m4t.unwrappedTarget
    }
  },
  requiredIncog: {
    set (newValue) {
      this.incog = !(this.required = newValue)
    }
  },
  visible: { value: true, writable: true },
  connection: {
    get () {
      throw "INCONSISTANCY, BREAK HERE"
    }
  }
})

/**
 * UI management.
 * Install this slot and its associate fields on their brick.
 * No data change.
 */
eYo.Slot.prototype.makeUI = function () {
  this.makeUI = eYo.Do.nothing // one shot function
  this.ui_driver_mgr.slotInit(this)
  this.forEachField(f => f.makeUI())
  this.magnet && (this.magnet.makeUI())
}

Object.defineProperties(eYo.Slot.prototype, {
/**
 * @property {boolean} isRequiredToModel  Get the required status.
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
      if (this.data && this.data.required) {
        return false
      }
      if (this.model.xml && this.model.xml.required) {
        return true
      }
      return false
    }
  },
  /**
   * Get the concrete required status.
   * For edython.
   * @param {boolean} newValue
   */
  requiredFromSaved: {
    get () {
      var t9k = this.targetBrick
      if (t9k) {
        if (t9k.wrapped_) {
          // return true if one of the inputs is connected
          return t9k.someSlot(slot => !!slot.target)
        }
        return true
      }
      return this.requiredFromModel
    }
  },
  /**
   * Get the concrete required status.
   * For edython.
   * @param {boolean} newValue
   */
  requiredFromModel: { writable: true }
})


/**
 * Clean the required status, changing the value if necessary.
 * For edython.
 * @param {boolean} newValue
 */
eYo.Slot.prototype.whenRequiredFromModel = function (helper) {
  if (this.isRequiredFromModel) {
    this.isRequiredFromModel = false
    if (goog.isFunction(helper)) {
      helper.call(this)
    }
    return true
  }
}

/**
 * Consolidate the state.
 * Forwards to the connection delegate.
 * For edython.
 * @param {Boolean} deep whether to consolidate connected bricks.
 * @param {Boolean} force whether to force synchronization.
 */
eYo.Slot.prototype.consolidate = function (deep, force) {
  var f = eYo.Decorate.reentrant_method.call(this, 'consolidate', this.model.consolidate)
  if (f) {
    f.apply(this, arguments)
    return
  }
  var m4t = this.magnet
  if (m4t) {
    m4t.incog = this.incog
    m4t.wrapped_ && (m4t.hidden = true) // Don't ever connect any brick to this
    var v
    if ((v = this.model.check)) {
      m4t.check = v.call(m4t, m4t.brick.type, m4t.brick.variant_p)
    }
  }
}

/**
 * Set the UI state.
 * Called only by `synchronizeSlots`.
 * For edython.
 */
eYo.Slot.prototype.synchronize = function () {
  var d = this.ui_driver_mgr
  if (!d) {
    return
  }
  var newValue = this.incog
  this.visible = !newValue
  if (this.visible) {
    this.forEachField(field => field.text.length > 0 && (field.visible = true))
  }
  d.slotDisplayedUpdate(this)
}

goog.forwardDeclare('eYo.Brick.List')

/**
 * Convert the slot's connected target into the given xml element.
 * List all the available data and converts them to xml.
 * For edython.
 * @param {Element} element the persistent element.
 * @param {?Object} opt  See eponym parameter in `eYo.Xml.brickToDom`.
 * @return a dom element, void lists may return nothing
 * @this a brick
 */
eYo.Slot.prototype.save = function (element, opt) {
  if (this.incog) {
    return
  }
  var xml = this.model.xml
  if (xml === false) {
    return
  }
  if (goog.isDef(xml)) {
    var f = eYo.Decorate.reentrant_method.call(this, 'xml_save', xml.save)
    if (f) {
      f.apply(this, arguments)
      return
    }
  }
  var out = (() => {
    var t9k = this.targetBrick
    if (t9k) { // otherwise, there is nothing to remember
      if (t9k.wrapped_) {
        // wrapped bricks are just a convenient computational model.
        // For lists only, we do create a further level
        // Actually, every wrapped brick is a list
        if (t9k instanceof eYo.Brick.List) {
          var child = eYo.Xml.brickToDom(t9k, opt)
          if (child.firstElementChild) {
            child.setAttribute(eYo.Xml.SLOT, this.xmlKey)
            goog.dom.appendChild(element, child)
            return child
          }
        } else {
          // let the target populate the given element
          return eYo.Xml.toDom(t9k, element, opt)
        }
      } else {
        child = eYo.Xml.brickToDom(t9k, opt)
        if (child.firstElementChild || child.hasAttributes()) {
          child.setAttribute(eYo.Xml.SLOT, this.xmlKey)
          goog.dom.appendChild(element, child)
          return child
        }
      }
    }
  })()
  if (!out && this.isRequiredToModel) {
    this.saveRequired(element, opt)
  }
}

/**
 * Save a placeholder.
 * For edython.
 * @param {Element} element a dom element in which to save the receiver
 * @param {!Object} opt
 */
eYo.Slot.prototype.saveRequired = function (element) {
  var child = goog.dom.createDom(eYo.Xml.EXPR)
  child.setAttribute(eYo.Key.EYO, eYo.Key.PLACEHOLDER)
  child.setAttribute(eYo.Xml.SLOT, this.xmlKey)
  goog.dom.appendChild(element, child)
}

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
eYo.Slot.prototype.load = function (element) {
  this.loaded_ = false
  var xml = this.model.xml
  if (xml === false) {
    return
  }
  if (goog.isDef(xml)) {
    var f = eYo.Decorate.reentrant_method.call(this, 'xml_load', xml.load)
    if (f) {
      f.apply(this, arguments)
      return
    }
  }
  this.requiredFromModel = false
  var out
  var t9k = this.targetBrick
  if (t9k && t9k.wrapped_ && !(t9k instanceof eYo.Brick.List)) {
    this.requiredFromModel = true // this is not sure, it depends on how the target read the dom
    out = eYo.Xml.fromDom(t9k, element)
    this.recover.dontResit(element)
  } else {
  // find the xml child with the proper slot attribute
    eYo.Do.someElementChild(element, child => {
      var attribute = child.getAttribute(eYo.Xml.SLOT)
      if (attribute && (attribute === this.xmlKey || attribute === this.key || (this.model.xml && goog.isFunction(this.model.xml.accept) && this.model.xml.accept.call(this, attribute)))) {
        this.recover.dontResit(child)
        if (child.getAttribute(eYo.Key.EYO) === eYo.Key.PLACEHOLDER) {
          this.requiredFromModel = true
          out = true
        } else {
          if (!t9k && this.model.promise) {
            this.completePromise()
            t9k = this.targetBrick
          }
          if (t9k) {
            if (t9k instanceof eYo.Brick.List) {
              // var grandChildren = Array.prototype.slice.call(child.childNodes)
              eYo.Do.forEachElementChild(child, grandChild => {
                var name = grandChild.getAttribute(eYo.Xml.SLOT)
                var slot = t9k.getSlot(name)
                if (slot) {
                  if (slot.magnet) {
                    var grand_t_brick = slot.target
                    if ((grand_t_brick)) {
                      eYo.Xml.fromDom(grand_t_brick, grandChild)
                      this.recover.dontResit(grandChild)
                    } else if ((grand_t_brick = eYo.Xml.domToBrick(grandChild, this.brick_))) {
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
              out = eYo.Xml.fromDom(t9k, child)
            }
            this.recover.dontResit(child)
          } else if ((t9k = eYo.Xml.domToBrick(child, this.brick_))) {
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
}

/**
 * When all the slots and data have been loaded.
 * For edython.
 */
eYo.Slot.prototype.willLoad = eYo.Decorate.reentrant_method('willLoad', function () {
  if (this.model.willLoad) {
    this.model.willLoad.call(this)
  }
})

/**
 * When all the slots and data have been loaded.
 * This is sent once at creation time (when default data has been loaded)
 * and possibly once when the saved representation has been loaded.
 * For edython.
 */
eYo.Slot.prototype.didLoad = eYo.Decorate.reentrant_method('didLoad', function () {
  if (this.model.didLoad) {
    this.model.didLoad.call(this)
  }
})

/**
 * execute the given function for the receiver and its next siblings.
 * For edython.
 * @param {!function} helper
 * @return {boolean} whether there was an slot to act upon or no helper given
 */
eYo.Slot.prototype.forEach = function (helper) {
  var slot = this
  if (goog.isFunction(helper)) {
    do {
      helper(slot)
    } while ((slot = slot.next))
  }
}

/**
 * execute the given function for the receiver and its previous siblings.
 * For edython.
 * @param {!function} helper
 * @return {boolean} whether there was an slot to act upon or no helper given
 */
eYo.Slot.prototype.forEachPrevious = function (helper) {
  var slot = this
  if (goog.isFunction(helper)) {
    do {
      helper(slot)
    } while ((slot = slot.previous))
  }
}

/**
 * execute the given function for the receiver and its next siblings.
 * If the return value of the given function is true,
 * then it was the last iteration and the loop breaks.
 * For edython.
 * @param {!function} helper
 * @return {?Object} The slot that returned true, eventually.
 */
eYo.Slot.prototype.some = function (helper) {
  var slot = this
  if (goog.isFunction(helper)) {
    do {
      if (helper(slot)) {
        return slot
      }
    } while ((slot = slot.next))
  }
}

/**
 * execute the given function for the fields.
 * For edython.
 * @param {!function} helper
 */
eYo.Slot.prototype.forEachField = function (helper) {
  this.fields && (Object.values(this.fields).forEach(f => helper(f)))
}

/**
 * Connect the brick or magnet. When not given a magnet, the output magnet is used. It is natural for slots.
 * The slot corresponds to a wrapped list block.
 * @param {!eYo.Brick | eYo.Magnet} bm  either a brick or a magnet.
 * @param {?String} key an input key. When not given the last free input is used.
 * @return {?eYo.Magnet} the eventual magnet target that was connected.
 */
eYo.Slot.prototype.listConnect = function (bm, key) {
  var t9k = this.targetBrick
  if (!t9k) {
    this.completePromise()
    if (!(t9k = this.targetBrick)) {
      return false
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
}

/**
 * Connect to the target.
 * For edython.
 * @param {!eYo.Brick | eYo.Magnet} bm  The target is either a brick or another magnet.
 * @return {?eYo.Magnet} the eventual target magnet
 */
eYo.Slot.prototype.connect = function (bm) {
  var m4t = this.magnet
  if(m4t && bm) {
    var other = (bm.magnets && bm.out_m) || bm
    if (m4t.checkType_(other)) {
      return m4t.connect(other)
    }
  }
}

/**
 * Complete with a promised brick.
 * Forwards to the receiver's magnet.
 * One shot in case of success.
 * @return {Boolean} whether the complete was successfull
 */
eYo.Slot.prototype.completePromise = function () {
  var m4t = this.magnet
  if (m4t && m4t.completePromise()) {
    this.completePromise = eYo.Do.nothing
    return true
  }
}
