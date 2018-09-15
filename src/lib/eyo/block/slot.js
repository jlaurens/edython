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
goog.require('eYo.Decorate')
goog.require('eYo.ConnectionDelegate')
goog.require('goog.dom');
goog.forwardDeclare('eYo.Xml')

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
  goog.asserts.assert(model.order, 'Missing slot model order')
  this.owner = owner
  this.key = key
  this.model = model
  this.input = undefined
  this.wait = 1
  var block = this.block = owner.block_
  goog.asserts.assert(block,
    eYo.Do.format('block must exist {0}/{1}', key))
  eYo.Slot.makeFields(this, model.fields)
  eYo.Content.feed(this, model.contents || model.fields)
  if (model.wrap) {
    this.setInput(block.appendWrapValueInput(key, model.wrap, model.optional, model.hidden))
    this.input.connection.eyo.model = model
    this.input.connection.eyo.source = this
  } else if (goog.isDefAndNotNull(model.check)) {
    this.setInput(block.appendValueInput(key))
    this.input.connection.eyo.model = model
    this.input.connection.eyo.source = this
  }
}

/**
 * Init the slot.
 */
eYo.Slot.prototype.init = function () {
  var f = eYo.Decorate.reentrant_method.call(this, 'init_model', this.model.init)
  f && f.call(this)
}

/**
 * Install this slot on a block.
 */
eYo.Slot.prototype.targetBlock = function () {
  return this.input && this.input.connection && this.input.connection.targetBlock()
}

/**
 * Install this slot on a block.
 */
eYo.Slot.prototype.beReady = function () {
  this.wait = 0
  if (this.svgGroup_) {
    // Slot has already been initialized once.
    return
  }
  // Build the DOM.
  this.svgGroup_ = Blockly.utils.createSvgElement('g', {
    class: 'eyo-slot'
  }, null)
  if (this.previous) {
    goog.dom.insertSiblingAfter(this.svgGroup_, this.previous.svgGroup_)
  } else {
    this.owner.svgInsertHeadSlot()
  }
  //  this.getBlock().getSvgRoot().appendChild(this.svgGroup_)
  this.init()
  // init all the fields
  var f = function(field) {
    if (!field.sourceBlock_) {
      field.setSourceBlock(this.block)
      field.eyo.slot = this
      field.init()// installs in the owner's group, not the block group
    }
  }
  for (var k in this.fields) {
    f.call(this, this.fields[k])
  }
  this.bindField && f.call(this, this.bindField)
  this.input && this.input.eyo.beReady()
}
/**
 * The DOM SVG group representing this slot.
 */
eYo.Slot.prototype.getSvgRoot = function () {
  return this.svgGroup_
}

/**
 * Transitional: when a block is connected, its svg root is installed
 * in another block's one. Here we move it to an slot svg root, if relevant.
 * @param {!Blockly.Block} block to be initialized.
 */
eYo.Slot.prototype.takeSvgOwnership = function (block) {
  var root = block.getSvgRoot()
  if (root) {
    console.log('MOVE IT TO THE TAIL ?')
  }
}

/**
 * Dispose of all DOM objects belonging to this slot.
 */
eYo.Slot.prototype.dispose = function () {
  goog.dom.removeNode(this.svgGroup_)
  this.svgGroup_ = null
  this.owner = null
  this.key = null
  this.model = null
  this.input = null
  this.block = null
}

goog.require('eYo.FieldLabel')
goog.require('eYo.FieldInput')

/**
 * Create all the fields from the given model.
 * For edython.
 * @param {!Object} owner
 * @param {!Object} fieldsModel
 */
eYo.Slot.makeFields = function () {
  // This is a closure
  // default helper functions for an editable field bound to a data object
  // `this` is an instance of  eYo.FieldInput
  var validate = function (txt) {
    // `this` is a field
    return this.eyo.validate(txt)
  }
  var startEditing = function () {
  }
  var endEditing = function () {
    var data = this.eyo.data
    goog.asserts.assert(data, 'No data bound to field ' + this.key + '/' + this.sourceBlock_.type)
    var result = this.callValidator(this.getValue())
    if (result !== null) {
      data.fromField(result)
      data.synchronize(result) // would this be included in the previous method ?
    } else {
      this.setValue(data.toText())
    }
  }
  // Change some `... = true,` entries to real functions
  var setupModel = function (model) {
    // no need to setup the model each time we create a new block
    if (model.setup_) {
      return
    }
    model.setup_ = true
    if (model.validate === true) {
      model.validate = validate
    } else if (model.validate && !goog.isFunction(model.validate)) {
      delete model.validate
    }
    if (model.startEditing === true) {
      model.startEditing = startEditing
    } else if (model.startEditing && !goog.isFunction(model.startEditing)) {
      delete model.startEditing
    }
    if (model.endEditing === true) {
      model.endEditing = endEditing
    } else if (model.endEditing && !goog.isFunction(model.endEditing)) {
      delete model.endEditing
    }
  }
  var makeField = function (fieldName, model) {
    var field
    if (goog.isString(model)) {
      if (model.startsWith('css')) {
        return
      }
      field = new eYo.FieldLabel(null, model)
      field.eyo.css_class = eYo.Do.cssClassForText(model)
    } else if (goog.isObject(model)) {
      setupModel(model)
      if (model.edit || model.validator || model.endEditing || model.startEditing) {
        // this is an editable field
        field = new (model.variable? eYo.FieldVariable: eYo.FieldInput)(null, model.edit || '', model.validator, fieldName)
      } else if (goog.isDefAndNotNull(model.value) || goog.isDefAndNotNull(model.css)) {
        // this is just a label field
        field = new eYo.FieldLabel(null, model.value || '')
      } else { // other entries are ignored
        return
      }
      field.eyo.model = model
      if (!(field.eyo.css_class = model.css_class || (model.css && 'eyo-code-' + model.css))) {
        field.eyo.css_class = eYo.Do.cssClassForText(field.getValue())
      }
      field.eyo.css_style = model.css_style
      field.eyo.order = model.order
    } else {
      return
    }
    field.name = field.eyo.key = fieldName // main fields have identical name and key
    field.eyo.nextField = undefined // debug step
    return field
  }
  return function (owner, fieldsModel) {
    owner.fields = owner.fields || Object.create(null)
    // field maker
    // Serious things here
    var block = owner.getBlock()
    goog.asserts.assert(block, 'Missing block while making fields')
    for (var key in fieldsModel) {
      var model = fieldsModel[key]
      var field = makeField(key, model)
      if (field) {
        if (key === eYo.Key.BIND) {
          owner.bindField = field
        }
        owner.fields[key] = field
      }
    }
    // now order
    // fields must not have the same order
    // some default fields have predefined relative order
    var byOrder = Object.create(null)
    var unordered = []
    var fromStart = [] // fields ordered from the beginning
    var toEnd = [] // // fields ordered to the end
    for (key in owner.fields) {
      field = owner.fields[key]
      var order = field.eyo.order
      if (order) {
        goog.asserts.assert(!goog.isDefAndNotNull(byOrder[order]),
        'Fields with the same order  %s = %s / %s',
        byOrder[order] && byOrder[order].name || 'NOTHING', field.name, owner.getBlock().type)
        byOrder[order] = field
        if (order > 0) {
          // insert this field from the start
          for (var i = 0; i < fromStart.length; i++) {
            // find the first index which corresponding order is > order
            if (fromStart[i].eyo.order > order) {
              break
            }
          }
          // insert the field at that position (possibly at the end)
          fromStart.splice(i, 0, field)
        } else /* if (order < 0) */ {
          // insert this field to the end
          for (i = 0; i < toEnd.length; i++) {
            // find the first index which corresponding order is < order
            if (toEnd[i].eyo.order < order) {
              break
            }
          }
          toEnd.splice(i, 0, field)
        }
      } else {
        // this is an unordered field
        unordered.push(field)
      }
    }
    // now order the fields in linked lists
    // Next returns the first field in a chain field.eyo.nextField -> ...
    // The chain is built from the list of arguments
    // arguments are either field names or fields
    // When field names are given, we just insert the corresponding
    // field into the chain
    // When fields are given, we insert the chain starting at that point
    // The result is a chain of fields.
    // field.eyo.nextField points to the next field of the chain
    // field.eyo.nextField.eyo.previousField is a fixed point.
    // A field is the head of a chain in one of two cases
    // 1) field.eyo.eyoLast_ is the eyo of a field (possibly the first of the chain)
    // 2) It has no previous nor next field, meaning that
    // ...eyo.nextField and ...eyo.previousField are false.
    // fields with a ...eyo.previousField cannot have a ...eyo.eyoLast_ bacuse they are not the head of the chain.
    var chain = function (/* variable argument list */) {
      // We first loop to find the first field that can be the
      // start of a chain. Every field before is ignored.
      var startField, nextField
      for (var i = 0; i < arguments.length; i++) {
        var fieldName = arguments[i]
        if ((startField = goog.isString(fieldName) ? owner.fields[fieldName] : fieldName)) {
          // remove this field from the list of unordered fields
          if (startField.eyo.previousField) {
            // this field already belongs to a chain
            // but it is not the first one
            // It does not fit in
            continue
          }
          // This field is acceptable as the first chain element
          var eyo = startField.eyo.eyoLast_ || startField.eyo
          // Now scan the next argument fields, if any
          while (++i < arguments.length) {
            fieldName = arguments[i]
            if ((nextField = goog.isString(fieldName) ? owner.fields[fieldName] : fieldName)) {
              if (nextField.eyo.previousField) {
                // this was not a starting point
                continue
              }
              if (nextField === startField) {
                // avoid infinite loop
                continue
              }
              eyo.nextField = nextField
              nextField.eyo.previousField = eyo.field_
              eyo = nextField.eyo
              var eyoLast = eyo.eyoLast_
              if (eyoLast) {
                delete eyo.eyoLast_
                eyo = eyoLast               
              //   if (eyo.nextField) {
              //     console.log('UNEXPECTED 1:', eyo)
              //   }
              // } else {
              //   if (eyo.nextField) {
              //     console.log('UNEXPECTED 2:', eyo)
              //   }
              }
            }
          }
          if (eyo) {
            startField.eyo.eyoLast_ = eyo
            // console.log('TEST CHAIN:', eyo, eyo.nextField)
            // var k = 100
            // var fields = [startField]
            // var field = startField
            // while (k-- && (field = field.eyo.nextField)) {
            //   if (fields.indexOf(field) >= 0) {
            //     console.error('LOOP')
            //     for (i = 0; i < arguments.length; i++) {
            //       console.log(arguments[i])
            //     }
            //   }
            //   fields.push(field)
            // }
          } else {
            // this chain consists in a unique element
            startField.eyo.eyoLast_ = startField.eyo
          }
          break
        }
      }
      return startField
    }
    owner.fromStartField = chain.apply(this, fromStart)
    owner.fromStartField = chain(eYo.Key.MODIFIER, eYo.Key.PREFIX, eYo.Key.START, eYo.Key.LABEL, eYo.Key.SEPARATOR, owner.fromStartField)
    owner.toEndField = chain.apply(this, toEnd)
    owner.toEndField = chain(owner.toEndField, eYo.Key.END, eYo.Key.SUFFIX, eYo.Key.COMMENT_MARK, eYo.Key.COMMENT)
    // we have exhausted all the fields that are already ordered
    // either explicitely or not
    // Remove from unordered what has been ordered so far
    var j = unordered.length
    while (j--) {
      if (unordered[j].eyo.previousField || unordered[j].eyo.eyoLast_) {
        unordered.splice(j, 1)
      }
    }
    goog.asserts.assert(unordered.length < 2,
      eYo.Do.format('Too many unordered fields in {0}/{1}', key, JSON.stringify(model)))
    unordered[0] && (owner.fromStartField = chain(owner.fromStartField, unordered[0]))
    owner.fromStartField && delete owner.fromStartField.eyo.eyoLast_
    owner.toEndField && delete owner.toEndField.eyo.eyoLast_
    owner.fields.comment && (owner.fields.comment.eyo.isComment = true)
  }
} ()

/**
 * Set the underlying Blockly input.
 * Some time we will not need these inputs.
 * For edython.
 * @param {!Blockly.Input} input
 */
eYo.Slot.prototype.setInput = function (input) {
  this.input = input
  this.inputType = this.input.type
  this.connection = input.connection
  input.eyo.slot = this
  var c8n = this.connection
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
  }
}

/**
 * Get the block.
 * For edython.
 * @param {boolean} newValue
 */
eYo.Slot.prototype.getBlock = function () {
  return this.block
}

/**
 * Whether the input has a connection.
 * For edython.
 * @param {!Blockly.Input} workspace The block's workspace.
 */
eYo.Slot.prototype.getConnection = function () {
  return this.input && this.input.connection
}

/**
 * Geth the workspace.
 * For edython.
 * @param {!Blockly.Input} workspace The block's workspace.
 */
eYo.Slot.prototype.getWorkspace = function () {
  return this.connection && this.connection.sourceBlock_.workspace
}

/**
 * The target.
 * For edython.
 * @param {!Blockly.Input} workspace The block's workspace.
 */
eYo.Slot.prototype.targetBlock = function () {
  return this.connection && this.connection.targetBlock()
}

/**
 * Set the disable state.
 * For edython.
 * @param {!boolean} newValue  When not defined, replaced by `!this.required`
 * @return {boolean} whether changes have been made
 */
eYo.Slot.prototype.setIncog = function (newValue) {
  if (!goog.isDef(newValue)) {
    newValue = !this.required
  } else {
    newValue = !!newValue
  }
  var change = this.incog !== newValue
  this.incog = newValue
  if (this.wait) {
    return
  }
  var c8n = this.input && this.input.connection
  if (c8n && c8n.eyo.isIncog() !== newValue) {
    change = true 
    c8n.eyo.setIncog(newValue)
  }
  change && this.synchronize()
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
eYo.Slot.prototype.isRequiredToDom = function () {
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
 * Get the required status.
 * For edython.
 * @param {boolean} newValue
 */
eYo.Slot.prototype.isRequiredFromModel = function () {
  return this.is_required_from_dom || (!this.incog && this.model.xml && this.model.xml.required)
}

/**
 * Set the required status.
 * For edython.
 * @param {boolean} newValue
 */
eYo.Slot.prototype.setRequiredFromDom = function (newValue) {
  this.is_required_from_dom = newValue
}

/**
 * Clean the required status, changing the value if necessary.
 * For edython.
 * @param {boolean} newValue
 */
eYo.Slot.prototype.whenRequiredFromDom = function (helper) {
  if (this.isRequiredFromModel()) {
    this.setRequiredFromDom(false)
    if (goog.isFunction(helper)) {
      helper.call(this)
    }
    return true
  }
}

/**
 * Consolidate the incog state.
 * For edython.
 * @param {!Blockly.Input} workspace The block's workspace.
 */
eYo.Slot.prototype.consolidate = function (deep, force) {
  if (this.wait || this.owner.changeLevel) {
    return
  }
  var f = eYo.Decorate.reentrant_method.call(this, 'consolidate', this.model.consolidate)
  if (f) {
    f.apply(this, arguments)
    return
  }
  var c8n = this.connection
  if (c8n) {
    c8n.eyo.setIncog(this.isIncog())
    c8n.eyo.wrapped_ && c8n.setHidden(true) // Don't ever connect any block to this
    var v
    if ((v = this.model.check)) {
      var check = v.call(c8n.eyo, c8n.sourceBlock_.type)
      c8n.setCheck(check)
      if (!this.model.wrap) {
        c8n.eyo.hole_data = eYo.HoleFiller.getData(check, this.model.hole_value)        
      }
    }
    if (deep) {
      var target = c8n.targetBlock()
      target && target.eyo.consolidate.apply(target.eyo, arguments)
    }
  }
}

/**
 * Set the wait status of the field.
 * Any call to `waitOn` must be balanced by a call to `waitOff`
 */
eYo.Slot.prototype.waitOn = function () {
  return ++this.wait
}

/**
 * Set the wait status of the field.
 * Any call to `waitOn` must be balanced by a call to `waitOff`
 */
eYo.Slot.prototype.waitOff = function () {
  goog.asserts.assert(this.wait > 0, eYo.Do.format('Too  many `waitOn` {0}/{1}', this.key, this.owner.block_.type))
  if (--this.wait === 0) {
    this.consolidate()
  }
}

/**
 * Set the disable state.
 * For edython.
 * @param {!Blockly.Input} workspace The block's workspace.
 */
eYo.Slot.prototype.synchronize = function () {
  var input = this.input
  if (!input) {
    return
  }
  var newValue = this.incog
  input.setVisible(!newValue)
  // this.owner.skipRendering()
  // try {
  // } catch (err) {
  //   console.error(err)
  //   throw err
  // } finally {
  //   this.owner.unskipRendering()
  // }
  if (input.isVisible()) {
    for (var __ = 0, field; (field = input.fieldRow[__]); ++__) {
      if (field.getText().length > 0) {
        var root = field.getSvgRoot()
        if (root) {
          root.removeAttribute('display')
        } else {
          console.log('Field with no root: did you ...initSvg()?')
        }
      }
    }
    var target = this.targetBlock()
    if (target) {
      root = target.getSvgRoot()
      if (root) {
        root.removeAttribute('display')
      } else {
        console.log('Block with no root: did you ...initSvg()?')
      }
    }
  }
  this.owner.delayedRender(this.block)
}

goog.forwardDeclare('eYo.DelegateSvg.List')

/**
 * Convert the slot's connected target into the given xml element.
 * List all the available data and converts them to xml.
 * For edython.
 * @param {Element} xml the persistent element.
 * @param {boolean} optNoId
 * @return a dom element, void lists may return nothing
 * @this a block delegate
 */
eYo.Slot.prototype.save = function (element, optNoId) {
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
  var out = (function () {
    var target = this.targetBlock()
    if (target) { // otherwise, there is nothing to remember
      if (target.eyo.wrapped_) {
        // wrapped blocks are just a convenient computational model.
        // For lists only, we do create a further level
        // Actually, every wrapped block is a list
        if (target.eyo instanceof eYo.DelegateSvg.List) {
          var child = eYo.Xml.blockToDom(target, optNoId)
          if (child.firstElementChild) {
            if (!xml || !xml.noInputName) {
              child.setAttribute(eYo.Xml.SLOT, this.getTag())
            }
            goog.dom.appendChild(element, child)
            return child
          }
        } else {
          // let the target populate the given element
          return eYo.Xml.toDom(target, element, optNoId)
        }
      } else {
        child = eYo.Xml.blockToDom(target, optNoId)
        if (child.firstElementChild || child.hasAttributes()) {
          if (!xml || !xml.noInputName) {
            if (this.inputType === Blockly.INPUT_VALUE) {
              child.setAttribute(eYo.XmlKey.SLOT, this.key)
            } else if (this.inputType === Blockly.NEXT_STATEMENT) {
              child.setAttribute(eYo.XmlKey.FLOW, this.key)
            }
          }
          goog.dom.appendChild(element, child)
          return child
        }
      }
    }
  }.call(this))
  if (!out && this.isRequiredToDom()) {
    var child = goog.dom.createDom(eYo.XmlKey.EXPR)
    child.setAttribute('eyo', 'placeholder')
    child.setAttribute(eYo.XmlKey.SLOT, this.key)
    goog.dom.appendChild(element, child)
  }
}

/**
 * Get the xml tag for xml persistent storage.
 * For edython.
 * @param {Element} element a dom element in which to save the input
 * @return the added child, if any
 */
eYo.Slot.prototype.getTag = function () {
  var xml = this.model.xml
  var tag = xml && xml.tag
  return goog.isFunction(tag) ? tag() : tag || this.key
}

/**
 * Initialize the receiver from a dom element.
 * Given an input and an element, initialize the input target
 * block with data from the given element.
 * The given element was created by the input's source block
 * in a blockToDom method. If it contains a child element
 * which input attribute is exactly the input's name,
 * then we ask the input target block to fromDom.
 * Target blocks are managed here too.
 * No consistency test is made however.
 * For edython.
 * @param {Element} element a dom element in which to save the input
 * @return the added child, if any
 */
eYo.Slot.prototype.load = function (element) {
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
  this.setRequiredFromDom(false)
  var out
  var target = this.targetBlock()
  if (target && target.eyo.wrapped_ && !(target.eyo instanceof eYo.DelegateSvg.List)) {
    this.setRequiredFromDom(true) // this is not sure, it depends on how the target read the dom
    out = eYo.Xml.fromDom(target, element)
  } else {
  // find the xml child with the proper slot attribute
    var children = Array.prototype.slice.call(element.childNodes)
    var i = 0
    var tag = this.getTag()
    while (i < children.length) {
      var child = children[i++]
      if (child.nodeType === Node.ELEMENT_NODE) {
        if (this.inputType === Blockly.INPUT_VALUE) {
          var attribute = child.getAttribute(eYo.Xml.SLOT)
        } else if (this.inputType === Blockly.NEXT_STATEMENT) {
          attribute = child.getAttribute(eYo.Xml.FLOW)
        }
        if (attribute === tag) {
          if (child.getAttribute('eyo') === 'placeholder') {
            this.setRequiredFromDom(true)
            out = true
          } else if (target) {
            if (target.eyo instanceof eYo.DelegateSvg.List) {
              var grandChildren = Array.prototype.slice.call(child.childNodes)
              var ii = 0
              while (ii < grandChildren.length) {
                var grandChild = grandChildren[ii++]
                if (grandChild.nodeType === Node.ELEMENT_NODE) {
                  var name = grandChild.getAttribute(eYo.XmlKey.SLOT)
                  var input = target.getInput(name)
                  if (input) {
                    if (input.connection) {
                      var grandTarget = input.connection.targetBlock()
                      if ((grandTarget)) {
                        eYo.Xml.fromDom(grandTarget, grandChild)
                      } else if ((grandTarget = eYo.Xml.domToBlock(grandChild, this.owner.block_.workspace))) {
                        var targetC8n = grandTarget.outputConnection
                        if (targetC8n && targetC8n.checkType_(input.connection)) {
                          targetC8n.connect(input.connection)
                          this.setRequiredFromDom(true)
                        }
                      }
                    } else {
                      console.error('Missing connection')
                    }
                  }
                }
              }
              out = true
            } else {
              out = eYo.Xml.fromDom(target, child)
            }
          } else if ((target = eYo.Xml.domToBlock(child, this.getWorkspace()))) {
            // we could create a block from that child element
            // then connect it
            var c8n = this.input && this.input.connection
            if (c8n && target.outputConnection && c8n.checkType_(target.outputConnection)) {
              c8n.connect(target.outputConnection)
              this.setRequiredFromDom(true)
            } else if (target.previousConnection && c8n.checkType_(target.previousConnection)) {
              c8n.connect(target.previousConnection)
            }
            out = target
          }
          break // the element was found
        }
      }
    }
  }
  if (out && xml && xml.didLoad) {
    xml.didLoad.call(this)
  }
  return out
}

/**
 * execute the given function for the receiver and its next siblings.
 * If the return value of the given function is true,
 * then it was the last iteration and the loop breaks.
 * For edython.
 * @param {!function} helper
 * @return {boolean} whether there was an slot to act upon or no helper given
 */
eYo.Slot.prototype.some = function (helper) {
  var slot = this
  if (goog.isFunction(helper)) {
    var last
    do {
      last = helper.call(slot)
    } while (!last && (slot = slot.next))
    return slot
  }
  return true
}

/**
 * execute the given function for the receiver and its next siblings.
 * If the return value of the given function is true,
 * then it was the last iteration and the loop breaks.
 * For edython.
 * @param {!function} helper
 * @return {boolean} whether there was an slot to act upon or no helper given
 */
eYo.Slot.prototype.each = function (helper) {
  var slot = this
  if (goog.isFunction(helper)) {
    do {
      helper.call(slot)
    } while ((slot = slot.next))
  }
}

/**
 * The right connection is at the right...
 * @private
 */
eYo.ConnectionDelegate.prototype.rightConnection = function() {
  var slot = this.slot
  if (slot) {
    if ((slot = slot.next) && (slot = slot.some (function () {
      return !this.isIncog() && this.input && this.input.connection && !this.input.connection.hidden_
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
            if ((c8n = e8r.here.connection) && (c8n.type !== Blockly.NEXT_STATEMENT)) {
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
