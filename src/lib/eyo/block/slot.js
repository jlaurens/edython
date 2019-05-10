/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview Input extension for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Slot')

goog.require('eYo.Do')
goog.require('eYo.Where')
goog.require('eYo.Decorate')
goog.require('eYo.Magnet')
goog.require('eYo.T3.Profile')

goog.require('goog.dom');

goog.forwardDeclare('eYo.Xml')
goog.forwardDeclare('eYo.FieldHelper')

/**
 * Convenient method to wrap the Blockly input object for the outside.
 * The model is one of the entries of the `slots` section
 * of the object used to create a delegate's subclass.
 * Here are some specifications for that model part.
 *
 * Any slot is constructed the same way
 * 1) operator field
 * 2) label field
 * 3) start field
 * 4) either editable field, value input of wrapped block.
 * 5) end field
 *
 * If the given model contains a `wrap` key, then a wrapped
 * block is created.
 *
  // we assume that one input model only contains at most one of
  // - editable field
  // - value input, check: key
  // - wrap input
  // - insert input
  // It may contain label fields
 * @param {!Object} owner  The owner is a block delegate.
 * @param {!string} key  One of the keys in `slots` section of the block model.
 * @param {!Object} model  the model for the given key in the above mention section.
 * @constructor
 */
eYo.Slot = function (owner, key, model) {
  goog.asserts.assert(owner, 'Missing slot owner')
  goog.asserts.assert(key, 'Missing slot key')
  goog.asserts.assert(model, 'Missing slot model')
  if (!model.order) {
    console.error('Missing slot model order')
  }
  goog.asserts.assert(model.order, 'Missing slot model order')
  this.owner = owner
  this.key = key
  this.reentrant_ = {}
  var setupModel = model => {
    if (!model.setup_) {
      model.setup_ = true
      if (model.validateIncog && !goog.isFunction(model.validateIncog)) {
        delete model.validateIncog
      }
    }
  }
  setupModel(model)
  this.model = model
  this.input = undefined
  var block = this.sourceBlock_
  goog.asserts.assert(block,
    `block must exist ${key}`)
  eYo.FieldHelper.makeFields(this, model.fields)
  var f = () => {
    var m4t = this.magnet
    m4t.source = this
    m4t.model = model
  }
  if (model.wrap) {
    this.input = owner.appendWrapValueInput(key, model.wrap, model.optional, model.hidden)
    f()
  } else if (model.promise) {
    this.input = owner.appendPromiseValueInput(key, model.promise, model.optional, model.hidden)
    f()
    this.incog = true
  } else if (goog.isDefAndNotNull(model.check)) {
    this.input = block.appendValueInput(key)
    f()
  }
  if (key === 'comment') {
    this.fields.bind && (this.fields.bind.eyo.isComment = true)
  }
  this.where = new eYo.Where() // for rendering only
  this.init()
}

/**
 * Init the slot.
 */
eYo.Slot.prototype.init = function () {
  var f = eYo.Decorate.reentrant_method.call(this, 'init_model', this.model.init)
  f && f.call(this)
}

/**
 * Dispose of all attributes.
 * Asks the owner's renderer to do the same.
 */
eYo.Slot.prototype.dispose = function () {
  var ui = this.owner.ui
  ui && ui.driver.slotDispose(this)
  this.where.dispose && this.where.dispose()
  this.where = undefined
  this.input && this.input.dispose()
  this.input = undefined
  eYo.FieldHelper.disposeFields(this)
  this.model = undefined
  this.reentrant_ = undefined
  this.key = undefined
  this.owner = undefined
}

Object.defineProperties(eYo.Slot.prototype, {
  block: {
    get () {
      return this.owner.block_
    }
  },
  input: {
    get () {
      return this.input_
    },
    set (newValue) {
      if (this.input_ !== newValue) {
        var m4t = this.magnet
        if (m4t) {
          m4t.source = m4t.model = undefined
        }
      }
      if ((this.input_ = newValue)) {
        newValue.eyo.slot = this
        var m4t = this.magnet
        if (m4t) {
          m4t.source = m4t.slot = this
          m4t.model = this.model
          m4t.name_ = this.key
          if (this.model.plugged) {
            m4t.plugged_ = this.model.plugged
          }
          if (this.model.suite && Object.keys(this.model.suite).length) {
            goog.mixin(m4t, this.model.suite)
          }
          if (this.model.optional) { // svg
            m4t.optional_ = true
          }
          if (this.model.hidden) { // svg
            this.incog = m4t.hidden_ = true
          }
        }
      }
    }
  },
  inputType: {
    get () {
      return this.input && this.input.type
    }
  },
  connection: {
    get () {
      return this.input && this.input.connection
    }
  },
  magnet: {
    get () {
      var c8n = this.connection
      return c8n && c8n.eyo
    }
  },
  c_eyo: {
    get () {
      console.error("BREK HERE")
      throw "INCONSISTANCY"
    }
  },
  sourceBlock_: {
    get () {
      return this.owner.block_
    }
  },
  ui: {
    get () {
      return this.owner.ui
    }
  },
  ui_driver: {
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
      if (this.owner.isReady) {
    
      }
      var validator = this.slots && this.model.validateIncog
      if (validator) { // if !this.slots, the receiver is not yet ready
        newValue = validator.call(this, newValue)
      }
      this.owner.changeWrap(
        () => {
          this.incog = newValue
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
      return this.owner.recover
    }
  },
  xmlKey: {
    get () {
      return (this.model.xml && this.model.xml.key) || this.key
    }
  },
  target: {
    get () {
      console.error("BREAK HERE")
      throw "ILLEGAL"
    }
  },
  t_eyo: {
    get () {
      var c8n = this.connection
      return c8n && c8n.eyo.t_eyo
    }
  },
  unwrappedTarget: {
    get () {
      var c8n = this.connection
      var b = c8n && c8n.eyo.unwrappedTargetBlock
      return b && b.eyo
    }
  },
  requiredIncog: {
    set (newValue) {
      this.incog = !(this.required = newValue)
    }
  },
  visible: {
    get () {
      return this.input && this.input.isVisible()
    },
    set (newValue) {
      this.input && this.input.setVisible(newValue)
    }
  }
})

/**
 * Retrieve the target block.
 * Forwards to the connection.
 */
eYo.Slot.prototype.targetBlock = function () {
  var c8n = this.connection
  return c8n && c8n.targetBlock()
}

/**
 * Install this slot and its associate fields on a block.
 * No data change.
 */
eYo.Slot.prototype.beReady = function () {
  this.beReady = eYo.Do.nothing // one shot function
  this.ui_driver.slotInit(this)
  // init all the fields
  var f = field => field.eyo.beReady()// installs in the owner's group, not the block group
  Object.values(this.fields).forEach(f)
  this.bindField && f(this.bindField)
  this.input && this.input.eyo.beReady()
}

/**
 * Set the underlying Blockly input.
 * Some time we will not need these inputs.
 * It must be done only once at initialization time.
 * For edython.
 * @param {!Blockly.Input} input
 */
eYo.Slot.prototype.setInput = function (input) {
  this.input = input
  this.inputType = input.type
  input.eyo.slot = this
  var c8n = input.connection
  if (c8n) {
    var eyo = c8n.eyo
    eyo.slot = this
    eyo.name_ = this.key
    if (this.model.plugged) {
      eyo.plugged_ = this.model.plugged
    }
    if (this.model.suite && Object.keys(this.model.suite).length) {
      goog.mixin(eyo, this.model.suite)
    }
    if (this.model.optional) { // svg
      eyo.optional_ = true
    }
    if (this.model.hidden) { // svg
      this.incog = eyo.hidden_ = true
    }
  }
}

/**
 * Get the block.
 * For edython.
 */
eYo.Slot.prototype.getBlock = function () {
  return this.sourceBlock_
}

/**
 * Whether the input has a connection.
 * For edython.
 * @param {!Blockly.Input} workspace The block's workspace.
 */
eYo.Slot.prototype.getConnection = function () {
  return this.connection
}

/**
 * Get the required status.
 * For edython.
 * @param {boolean} newValue
 */
eYo.Slot.prototype.isRequiredToModel = function () {
  if (this.incog) {
    return false
  }
  if (!this.connection) {
    return false
  }
  if (!this.connection.eyo.wrapped_ && this.targetBlock()) {
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

/**
 * Get the required status as stated by the model.
 * For edython.
 * @param {boolean} newValue
 */
eYo.Slot.prototype.isRequiredFromModel = function () {
  return this.is_required_from_model || (!this.incog && this.model.xml && this.model.xml.required)
}

/**
 * Get the concrete required status.
 * For edython.
 * @param {boolean} newValue
 */
eYo.Slot.prototype.isRequiredFromSaved = function () {
  var t_eyo = this.t_eyo
  if (t_eyo) {
    if (t_eyo.wrapped_) {
      // return true if one of the inputs is connected
      return t_eyo.inputList.some(input => !!input.eyo.target)
    }
    return true
  }
  return this.isRequiredFromModel()
}

/**
 * Set the required status.
 * For edython.
 * @param {boolean} newValue
 */
eYo.Slot.prototype.setRequiredFromModel = function (newValue) {
  this.is_required_from_model = newValue
}

/**
 * Clean the required status, changing the value if necessary.
 * For edython.
 * @param {boolean} newValue
 */
eYo.Slot.prototype.whenRequiredFromModel = function (helper) {
  if (this.isRequiredFromModel()) {
    this.setRequiredFromModel(false)
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
 * @param {Boolean} deep whether to consolidate connected blocks.
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
    m4t.wrapped_ && m4t.setHidden(true) // Don't ever connect any block to this
    var v
    if ((v = this.model.check)) {
      var check = v.call(m4t, m4t.b_eyo.type, m4t.b_eyo.variant_p)
      m4t.setCheck(check)
    }
  }
}

/**
 * Set the UI state.
 * Called only by `synchronizeSlots`.
 * For edython.
 */
eYo.Slot.prototype.synchronize = function () {
  var input = this.input
  if (!input) {
    return
  }
  var d = this.ui_driver
  if (!d) {
    return
  }
  var newValue = this.incog
  this.visible = !newValue
  if (this.visible) {
    input.fieldRow.forEach(field => {
      if (field.getText().length > 0) {
        field.eyo.visible = true // where is it used ?
      }
    })
  }
  d.slotDisplayedUpdate(this)
}

goog.forwardDeclare('eYo.DelegateSvg.List')

/**
 * Convert the slot's connected target into the given xml element.
 * List all the available data and converts them to xml.
 * For edython.
 * @param {Element} element the persistent element.
 * @param {?Object} opt  See eponym parameter in `eYo.Xml.dlgtToDom`.
 * @return a dom element, void lists may return nothing
 * @this a block delegate
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
    var t_eyo = this.t_eyo
    if (t_eyo) { // otherwise, there is nothing to remember
      if (t_eyo.wrapped_) {
        // wrapped blocks are just a convenient computational model.
        // For lists only, we do create a further level
        // Actually, every wrapped block is a list
        if (t_eyo instanceof eYo.DelegateSvg.List) {
          var child = eYo.Xml.dlgtToDom(t_eyo, opt)
          if (child.firstElementChild) {
            child.setAttribute(eYo.Xml.SLOT, this.xmlKey)
            goog.dom.appendChild(element, child)
            return child
          }
        } else {
          // let the target populate the given element
          return eYo.Xml.toDom(t_eyo, element, opt)
        }
      } else {
        child = eYo.Xml.dlgtToDom(t_eyo, opt)
        if (child.firstElementChild || child.hasAttributes()) {
          if (this.inputType === Blockly.INPUT_VALUE) {
            child.setAttribute(eYo.Xml.SLOT, this.xmlKey)
          } else if (this.inputType === Blockly.NEXT_STATEMENT) {
            child.setAttribute(eYo.Xml.FLOW, this.xmlKey)
          } else if (this.inputType === eYo.Const.RIGHT_STATEMENT) {
            child.setAttribute(eYo.Xml.FLOW, eYo.Xml.RIGHT) // only one right statement
          }
          goog.dom.appendChild(element, child)
          return child
        }
      }
    }
  })()
  if (!out && this.isRequiredToModel()) {
    this.saveRequired(element, opt)
  }
}

/**
 * Save a placeholder.
 * For edython.
 * @param {Element} element a dom element in which to save the input
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
 * block with data from the given element.
 * The given element was created by the input's source block
 * in a dlgtToDom method. If it contains a child element
 * which input attribute is exactly the input's name,
 * then we ask the input target block to fromDom.
 * Target blocks are managed here too.
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
  this.setRequiredFromModel(false)
  var out
  var t_eyo = this.t_eyo
  if (t_eyo && t_eyo.wrapped_ && !(t_eyo instanceof eYo.DelegateSvg.List)) {
    this.setRequiredFromModel(true) // this is not sure, it depends on how the target read the dom
    out = eYo.Xml.fromDom(t_eyo, element)
    this.recover.dontResit(element)
  } else {
  // find the xml child with the proper slot attribute
    eYo.Do.someElementChild(element, child => {
      if (this.inputType === eYo.Magnet.INPUT) {
        var attribute = child.getAttribute(eYo.Xml.SLOT)
      } else if (this.inputType === eYo.Magnet.FOOT || this.inputType === eYo.Magnet.RIGHT) {
        attribute = child.getAttribute(eYo.Xml.FLOW)
      }
      if (attribute && (attribute === this.xmlKey || attribute === this.key || (this.model.xml && goog.isFunction(this.model.xml.accept) && this.model.xml.accept.call(this, attribute)))) {
        this.recover.dontResit(child)
        if (child.getAttribute(eYo.Key.EYO) === eYo.Key.PLACEHOLDER) {
          this.setRequiredFromModel(true)
          out = true
        } else {
          if (!t_eyo && this.model.promise) {
            this.completePromise()
            t_eyo = this.t_eyo
          }
          if (t_eyo) {
            if (t_eyo instanceof eYo.DelegateSvg.List) {
              // var grandChildren = Array.prototype.slice.call(child.childNodes)
              eYo.Do.forEachElementChild(child, grandChild => {
                var name = grandChild.getAttribute(eYo.Xml.SLOT)
                var input = t_eyo.getInput(name)
                if (input) {
                  if (input.eyo.magnet) {
                    var grand_t_eyo = input.eyo.target
                    if ((grand_t_eyo)) {
                      eYo.Xml.fromDom(grand_t_eyo, grandChild)
                      this.recover.dontResit(grandChild)
                    } else if ((grand_t_eyo = eYo.Xml.domToDlgt(grandChild, this.owner))) {
                      var t_m4t = grand_t_eyo.magnets.output
                      if (t_m4t && t_m4t.checkType_(input.eyo.magnet, true)) {
                        t_m4t.connect(input.eyo.magnet)
                        this.setRequiredFromModel(true)
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
              out = eYo.Xml.fromDom(t_eyo, child)
            }
            this.recover.dontResit(child)
          } else if ((t_eyo = eYo.Xml.domToDlgt(child, this.owner))) {
            var m4ts = t_eyo.magnets
            // we could create a block from that child element
            // then connect it
            this.recover.dontResit(child)
            var m4t = this.magnet
            if (m4t && m4ts.output && m4t.checkType_(m4ts.output, true)) {
              m4t.connect(m4ts.output) // Notice the `.eyo`
              this.setRequiredFromModel(true)
            } else if (m4ts.head && m4t.checkType_(m4ts.head, true)) {
              m4t.connect(m4ts.head) // Notice the `.eyo`
            }
            out = t_eyo.block_
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
 * If the return value of the given function is true,
 * then it was the last iteration and the loop breaks.
 * For edython.
 * @param {!function} helper
 * @return {?eYo.Slot} The first slot for which `helper` returns a truthy value
 */
eYo.Slot.prototype.some = function (helper) {
  if (goog.isFunction(helper)) {
    var slot = this
    var last
    do {
      last = helper(slot)
    } while (!last && (slot = slot.next))
    return last === true ? slot : last
  }
}

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
 * Connect to delegate or magnet. When not given a magnet, the output magnet is used. It is natural for slots.
 * @param {!eYo.Delegate | eYo.Magnet} dm  a a Dlgt or magnet.
 */
eYo.Slot.prototype.connect = function (dm) {
  return this.magnet.connect((dm.magnets && dm.magnets.output) || dm)
}

/**
 * Connect the expression Dlgt or magnet. When not given a connection, the output connection is used. It is natural for slots.
 * The slot corresponds to a wrapped list dlgt.
 * @param {!eYo.Delegate | eYo.Magnet} dm  either a Dlgt or a magnet.
 * @param {?String} key an input key. When not given the last free input is connected.
 * @return {Boolean} whether the connection has been established.
 */
eYo.Slot.prototype.listConnect = function (dm, key) {
  var t_eyo = this.t_eyo
  if (!t_eyo) {
    this.completePromise()
    if (!(t_eyo = this.t_eyo)) {
      return false
    }
  }
  if (!key) {
    return t_eyo.connectLast(dm)
  }
  var input = t_eyo.getInput(key)
  if (input) {
    var m4t = input.eyo.magnet
    if (m4t) {
      var other = (dm.magnets && dm.magnets.output) || dm
      return m4t.connect(other)
    }
  }
}

/**
 * Connect to the target.
 * For edython.
 * @param {!eYo.Delegate | eYo.Magnet} dm (delegate of magnet)
 * @return {?eYo.Magnet} the eventual target magnet
 */
eYo.Slot.prototype.connect = function (dm) {
  var m4t = this.magnet
  if(m4t && dm) {
    var other = (dm.magnets && dm.magnets.output) || dm
    if (m4t.checkType_(other)) {
      return m4t.connect(other)
    }
  }
}

Object.defineProperty(eYo.Magnet.prototype, 'right', {
  /**
   * The right connection is at the right... Not used.
   * @private
   */
  get () {
    var slot = this.slot
    if (slot) {
      if ((slot = slot.next) && (slot = slot.some (slot => !slot.incog && slot.magnet && !slot.input.connection.hidden_))) {
        return slot.magnet
      }
      var b_eyo = this.b_eyo
    } else if ((b_eyo = this.b_eyo)) {
      var e8r = b_eyo.inputEnumerator()
      if (e8r) {
        while (e8r.next()) {
          if (e8r.here.connection && this.connection === e8r.here.connection) {
            // found it
            while (e8r.next()) {
              var m4t
              if ((m4t = e8r.here.eyo.magnet) && m4t.isOutput) {
                return m4t.connection
              }
            }
          }
        }
      }
    }
    if (b_eyo && (m4t = b_eyo.magnets.output) && (m4t = m4t.target)) {
      return m4t.right
    }
  }
})


/**
 * Complete with a promised block.
 * Forwards to the receiver's connection's delegate.
 * One shot in case of success.
 */
eYo.Slot.prototype.completePromise = function () {
  var c8n = this.connection
  if (c8n && c8n.eyo.completePromise()) {
    this.completePromise = eYo.Do.nothing
    return true
  }
}

