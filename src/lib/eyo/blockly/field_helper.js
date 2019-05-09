/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview utilities for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.FieldHelper')

goog.require('eYo.XRE')
goog.require('eYo.Size')
goog.require('eYo.Field')

/**
 * Returns nothing.
 * @return {!Element} The group element.
 */
Blockly.Field.prototype.getSvgRoot = eYo.Do.nothing

/**
 * Class for an editable text field helper.
 * @param {eYo.TextInputField} owner  The owner of the field.
 * @property {boolean} isLabel
 * @readonly
 * @property {boolean} isTextInput
 * @readonly
 * @property {Object} workspace
 * @readonly
 * @property {Object} renderer
 * @constructor
 */
eYo.FieldHelper = function (field) {
  this.field_ = field
  field.eyo = this
  this.size = new eYo.Size(0, 1)
  this.reentrant_ = {}
  this.model = {}
}

/**
 * Dispose of the resources.
 */
eYo.FieldHelper.prototype.dispose = function () {
  var d = this.ui_driver
  d && d.fieldDispose(this.field)
  this.size.dispose()
  this.field_ = this.size = undefined
}

Object.defineProperties(
  eYo.FieldHelper.prototype,
  {
    field: {
      get () {
        return this.field_
      }
    },
    b_eyo: {
      get () {
        return this.field_.sourceBlock_.eyo
      }
    },
    workspace: {
      get () {
        return this.b_eyo.workspace
      }
    },
    ui: {
      get () {
        return this.b_eyo.ui
      }
    },
    ui_driver: {
      get () {
        var ui = this.ui
        return ui && ui.driver
      }
    },
    visible: {
      get () {
        return this.field.isVisible()
      },
      set (newValue) {
        this.field.setVisible(newValue)
        var d = this.ui_driver
        d && d.fieldDisplayedUpdate(this.field)
      }
    }
  }
)

/**
 * Ensure that the field is ready.
 */
eYo.FieldHelper.prototype.beReady = function () {
  this.beReady = eYo.Do.nothing
  this.field_.init()
  var ui = this.ui
  ui && ui.driver.fieldInit(this.field_)
}

/**
 * Whether the field of the receiver starts with a separator.
 */
eYo.FieldHelper.prototype.startsWithSeparator = function () {
  // if the text is void, it can not change whether
  // the last character was a letter or not
  var text = this.field_.getDisplayText_()
  if (text.length) {
    if (this.field_.name === 'separator'
      || (this.model && this.model.separator)
      || eYo.XRE.operator.test(text[0])
      || eYo.XRE.delimiter.test(text[0])
      || text[0] === '.'
      || text[0] === ':'
      || text[0] === ','
      || text[0] === ';') {
      // add a separation before
      return true
    }
  }
}

/**
 * Late delegate.
 */
eYo.FieldHelper.prototype.getDlgt = function () {
  return this.field_.sourceBlock_.eyo
}

/**
 * Default method to start editing.
 * @this {Object} is a field owning an helper
 */
eYo.FieldHelper.onStartEditing = function () {
}

/**
 * Default method to end editing.
 * @this {Object} is a field owning an helper
 */
eYo.FieldHelper.onEndEditing = function () {
  var newValue = this.getValue()
  this.eyo.data.fromField(newValue)
}

/**
 * Validate the keyed data of the source block.
 * Asks the data object to do so.
 * The bound data must exist.
 * @param {Object} txt
 */
eYo.FieldHelper.prototype.validate = function (txt) {
  var v = this.data.validate(goog.isDef(txt) ? txt : this.field_.getValue())
  return v === null ? v : (goog.isDef(v) && goog.isDef(v.validated) ? v.validated : txt)
}

/**
 * Validate the keyed data of the source block.
 * Asks the data object to do so.
 * The bound data must exist.
 * @param {Object} txt
 */
eYo.FieldHelper.prototype.validateIfData = function (txt) {
  if (this.data) {
    return this.validate(txt)
  }
  return txt
}

/**
 * Will render the field.
 * We can call `this.willRender()` from the model.
 */
eYo.FieldHelper.prototype.willRender = function () {
  var f = this.model && eYo.Decorate.reentrant_method.call(this, 'model_willRender', this.model.willRender)
  if (f) {
    f.call(this)
  } else {
    var d = this.ui_driver
    if (d) {
      d.fieldMakePlaceholder(this.field_, this.placeholder)
      d.fieldMakeComment(this.field_, this.isComment)
    }
  }
}

goog.forwardDeclare('eYo.FieldLabel')
goog.forwardDeclare('eYo.FieldInput')

/**
 * Create all the fields from the given model.
 * For edython.
 * @param {!eYo.Slot|!eYo.Magnet|!eYo.Delegate} owner  
 * @param {!Object} fieldsModel
 */
eYo.FieldHelper.makeFields = (() => {
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
    } else {
      this.setValue(data.toText())
    }
  }
  // Change some `... = true,` entries to real functions
  var setupModel = (model) => {
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
    if (!goog.isFunction(model.didLoad)) {
      delete model.didLoad
    }
    if (!goog.isFunction(model.willRender)) {
      delete model.willRender
    }
    var xml = model.xml
    if (xml) {
      if (!goog.isFunction(xml.save)) {
        delete xml.save
      }
      if (!goog.isFunction(xml.load)) {
        delete xml.load
      }
    }
  }
  var makeField = (fieldName, model) => {
    var field
    if (goog.isString(model)) {
      if (model.startsWith('css')) {
        return
      }
      field = new eYo.FieldLabel(model)
      field.eyo.css_class = model.css_class || eYo.T3.getCssClassForText(model)
    } else if (goog.isObject(model)) {
      setupModel(model)
      if (model.edit || model.validator || model.endEditing || model.startEditing) {
        // this is an editable field
        field = new (model.variable? eYo.FieldVariable: eYo.FieldInput)(model.edit || '', model.validator, fieldName)
      } else if (goog.isDefAndNotNull(model.value) || goog.isDefAndNotNull(model.css)) {
        // this is just a label field
        field = new eYo.FieldLabel(model.value || '')
      } else { // other entries are ignored
        return
      }
      field.eyo.model = model
      if (!(field.eyo.css_class = model.css_class || (model.css && 'eyo-code-' + model.css))) {
        field.eyo.css_class = eYo.T3.getCssClassForText(field.getValue())
      }
      field.eyo.css_style = model.css_style
      field.eyo.order = model.order
      if (model.hidden) {
        field.setVisible(false)
      }
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
        field.setSourceBlock((owner.owner && owner.owner.sourceBlock_) || owner.block_ || owner.sourceBlock_)
        goog.asserts.assert(field.sourceBlock_, 'Missing field sourceBlock_ while making fields')
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
        var name = arguments[i]
        if ((startField = goog.isString(name) ? owner.fields[name] : name)) {
          // remove this field from the list of unordered fields
          if (!startField.eyo) {
            console.error('NO EYO startField', startField)
          }
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
            name = arguments[i]
            if ((nextField = goog.isString(name) ? owner.fields[name] : name)) {
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
    owner.fieldAtStart = chain.apply(this, fromStart)
    owner.fieldAtStart = chain(eYo.Key.MODIFIER, eYo.Key.PREFIX, eYo.Key.START, eYo.Key.LABEL, eYo.Key.SEPARATOR, owner.fieldAtStart)
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
      `Too many unordered fields in ${key}/${JSON.stringify(model)}`)
    unordered[0] && (owner.fieldAtStart = chain(owner.fieldAtStart, unordered[0]))
    owner.fieldAtStart && delete owner.fieldAtStart.eyo.eyoLast_
    owner.toEndField && delete owner.toEndField.eyo.eyoLast_
  }
}) ()

eYo.FieldHelper.disposeFields = owner => {
  var fields = owner.fields
  owner.fieldAtStart = owner.toEndField = owner.bindField = owner.fields = undefined
  Object.keys(fields).forEach(k => fields[k].dispose())
}