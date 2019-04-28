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
goog.require('eYo.ConnectionDelegate')
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
  this.reentrant = {}
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
  eYo.Content.feed(this, model.contents || model.fields)
  var f = () => {
    var c_eyo = this.input.connection.eyo
    c_eyo.source = this
    c_eyo.model = model
  }
  if (model.wrap) {
    this.setInput(owner.appendWrapValueInput(key, model.wrap, model.optional, model.hidden))
    f()
  } else if (model.promise) {
    this.setInput(owner.appendPromiseValueInput(key, model.promise, model.optional, model.hidden))
    f()
    this.setIncog(true)
  } else if (goog.isDefAndNotNull(model.check)) {
    this.setInput(block.appendValueInput(key))
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

Object.defineProperties(eYo.Slot.prototype, {
  block: {
    get () {
      return this.owner.block_
    }
  },
  connection: {
    get () {
      return this.input && this.input.connection
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
  incog_p: {
    get () {
      return this.isIncog()
    },
    set (newValue) {
      this.owner.changeWrap(
        this.setIncog,
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
      var c8n = this.connection
      return c8n && c8n.eyo.t_eyo
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
      this.required = newValue
      this.setIncog()
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
 * Dispose of all attributes.
 * Asks the owner's renderer to do the same.
 */
eYo.Slot.prototype.dispose = function () {
  var ui = this.owner.ui
  ui && ui.driver.slotDispose(this)
  this.sourceBlock_ = null
  this.owner = null
  this.key = null
  this.model = null
  this.input = null
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
 * Set the disable state.
 * Synchronize when the incog state did change.
 * For edython.
 * @param {!boolean} newValue  When not defined, replaced by `!this.required`, then validated if the model asks to.
 * @return {boolean} whether changes have been made
 */
eYo.Slot.prototype.setIncog = function (newValue) {
  if (this.data) {
    newValue = this.data.isIncog()
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
  var change = this.incog !== newValue
  if (change) {
    this.incog = newValue
    // forward to the connection
    var c8n = this.connection
    if (c8n) {
      change = c8n.eyo.setIncog(newValue)
    }
  }
  return change
}

/**
 * Get the disable state.
 * For edython.
 */
eYo.Slot.prototype.isIncog = function () {
  return this.incog
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
  var target = this.targetBlock()
  if (target) {
    if (target.eyo.wrapped_) {
      // return true if one of the inputs is connected
      return target.inputList.some(input => {
        if (input.eyo.target) {
          return true
        }
      })
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
  var c8n = this.connection
  if (c8n) {
    var c_eyo = c8n.eyo
    c_eyo.setIncog(this.isIncog())
    c_eyo.wrapped_ && c8n.setHidden(true) // Don't ever connect any block to this
    var v
    if ((v = this.model.check)) {
      var check = v.call(c_eyo, c8n.sourceBlock_.type, c8n.sourceBlock_.eyo.variant_p)
      c8n.setCheck(check)
      if (check && !this.model.wrap) {
        c_eyo.hole_data = eYo.HoleFiller.getData(check, this.model.hole_value)        
      }
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
 * @param {?Object} opt  See eponym parameter in `eYo.Xml.blockToDom`.
 * @return a dom element, void lists may return nothing
 * @this a block delegate
 */
eYo.Slot.prototype.save = function (element, opt) {
  if (this.isIncog()) {
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
    var target = this.targetBlock()
    if (target) { // otherwise, there is nothing to remember
      if (target.eyo.wrapped_) {
        // wrapped blocks are just a convenient computational model.
        // For lists only, we do create a further level
        // Actually, every wrapped block is a list
        if (target.eyo instanceof eYo.DelegateSvg.List) {
          var child = eYo.Xml.blockToDom(target, opt)
          if (child.firstElementChild) {
            child.setAttribute(eYo.Xml.SLOT, this.xmlKey)
            goog.dom.appendChild(element, child)
            return child
          }
        } else {
          // let the target populate the given element
          return eYo.Xml.toDom(target, element, opt)
        }
      } else {
        child = eYo.Xml.blockToDom(target, opt)
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
 * in a blockToDom method. If it contains a child element
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
  var target = this.targetBlock()
  if (target && target.eyo.wrapped_ && !(target.eyo instanceof eYo.DelegateSvg.List)) {
    this.setRequiredFromModel(true) // this is not sure, it depends on how the target read the dom
    out = eYo.Xml.fromDom(target, element)
    this.recover.dontResit(element)
  } else {
  // find the xml child with the proper slot attribute
    eYo.Do.someElementChild(element, child => {
      if (this.inputType === Blockly.INPUT_VALUE) {
        var attribute = child.getAttribute(eYo.Xml.SLOT)
      } else if (this.inputType === Blockly.NEXT_STATEMENT || this.inputType === eYo.Const.RIGHT_STATEMENT) {
        attribute = child.getAttribute(eYo.Xml.FLOW)
      }
      if (attribute && (attribute === this.xmlKey || attribute === this.key || (this.model.xml && goog.isFunction(this.model.xml.accept) && this.model.xml.accept.call(this, attribute)))) {
        this.recover.dontResit(child)
        if (child.getAttribute(eYo.Key.EYO) === eYo.Key.PLACEHOLDER) {
          this.setRequiredFromModel(true)
          out = true
        } else {
          if (!target && this.model.promise) {
            this.completePromise()
            target = this.targetBlock()
          } 
          if (target) {
            if (target.eyo instanceof eYo.DelegateSvg.List) {
              // var grandChildren = Array.prototype.slice.call(child.childNodes)
              eYo.Do.forEachElementChild(child, grandChild => {
                var name = grandChild.getAttribute(eYo.Xml.SLOT)
                var input = target.getInput(name)
                if (input) {
                  if (input.connection) {
                    var grandTarget = input.eyo.target
                    if ((grandTarget)) {
                      eYo.Xml.fromDom(grandTarget, grandChild)
                      this.recover.dontResit(grandChild)
                    } else if ((grandTarget = eYo.Xml.domToBlock(grandChild, this.block))) {
                      var targetC8n = grandTarget.outputConnection
                      if (targetC8n && targetC8n.checkType_(input.connection, true)) {
                        targetC8n.connect(input.connection)
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
              out = eYo.Xml.fromDom(target, child)
            }
            this.recover.dontResit(child)
          } else if ((target = eYo.Xml.domToBlock(child, this.block))) {
            // we could create a block from that child element
            // then connect it
            this.recover.dontResit(child)
            var c8n = this.connection
            if (c8n && target.outputConnection && c8n.checkType_(target.outputConnection, true)) {
              c8n.eyo.connect(target.outputConnection) // Notice the `.eyo`
              this.setRequiredFromModel(true)
            } else if (target.previousConnection && c8n.checkType_(target.previousConnection, true)) {
              c8n.eyo.connect(target.previousConnection) // Notice the `.eyo`
            }
            out = target
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
 * Connect the expression block/delegate/connection. When not given a connection, the output connection is used. It is natural for slots.
 * @param {!Object} bdc a block/delegate/connection.
 */
eYo.Slot.prototype.connect = function (bdc) {
  this.connection.connect(bdc.outputConnection || bdc.block_.outputConnection | bdc)
}

/**
 * Connect the expression block/delegate/connection. When not given a connection, the output connection is used. It is natural for slots.
 * The slot corresponds to a wrapped list bloc.
 * @param {!Object} bdc a block/delegate/connection.
 * @param {?String} key an input key. When not given the last free input is connected.
 * @return {Boolean} whether the connection has been established.
 */
eYo.Slot.prototype.listConnect = function (bdc, key) {
  var t_eyo = this.connection.eyo.t_eyo
  if (!t_eyo) {
    this.completePromise()
    if (!(t_eyo = this.connection.eyo.t_eyo)) {
      return false
    }
  }
  if (!key) {
    return t_eyo.lastConnect(bdc)
  }
  var input = t_eyo.block_.getInput(key)
  if (input) {
    var c8n = input.connection
    if (c8n) {
      var other = bdc.outputConnection || bdc.block_.outputConnection | bdc
      c8n.connect(other)
      return c8n.targetConnection === other
    }
  }
}

/**
 * Connect to the target.
 * For edython.
 * @param {!Object} target (Block, delegate of connection)
 * @return {Boolean} true when connected
 */
eYo.Slot.prototype.connect = function (bdc) {
  var c8n = this.connection
  if(c8n && bdc) {
    var other = bdc.outputConnection || (bdc.block_ && bdc.block_.outputConnection) || bdc
    if (c8n.checkType_(other)) {
      c8n.eyo.connect(other)
      return other.eyo.b_eyo
    }
  }
}

/**
 * The right connection is at the right...
 * @private
 */
eYo.ConnectionDelegate.prototype.rightConnection = function() {
  var slot = this.slot
  if (slot) {
    if ((slot = slot.next) && (slot = slot.some (slot => {
      return !slot.isIncog() && slot.connection && !slot.input.connection.hidden_
    }))) {
      return slot.input.connection
    }
    var block = this.connection.sourceBlock_
  } else if ((block = this.connection.sourceBlock_)) {
    var e8r = block.eyo.inputEnumerator()
    if (e8r) {
      while (e8r.next()) {
        if (e8r.here.connection && this.connection === e8r.here.connection) {
          // found it
          while (e8r.next()) {
            var c8n
            if ((c8n = e8r.here.connection) && (c8n.eyo.isOutput)) {
              return c8n
            }
          }
        }
      }
    }
  }
  if (block && (c8n = block.outputConnection) && (c8n = c8n.targetConnection)) {
    return c8n.eyo.rightConnection()
  }
}

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

