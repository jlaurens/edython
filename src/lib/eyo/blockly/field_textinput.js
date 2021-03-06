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

goog.provide('eYo.FieldTextInput')
goog.provide('eYo.FieldInput')
goog.provide('eYo.FieldVariable')

goog.provide('eYo.Field.TextInput')
goog.provide('eYo.Field.Variable')

goog.require('eYo.FieldHelper')
goog.require('eYo.Msg')
goog.require('eYo.Content')
goog.require('eYo.Field')
goog.require('goog.dom');
goog.require('Blockly.FieldTextInput')

/**
 * Class for an editable text field.
 * @param {string} text The initial content of the field.
 * @param {Function=} optValidator An optional function that is called
 *     to validate any constraints on what the user entered.  Takes the new
 *     text as an argument and returns either the accepted text, a replacement
 *     text, or null to abort the change.
 * @extends {Blockly.FieldTextInput}
 * @constructor
 * @suppress{accessControls}
 */
eYo.FieldTextInput = function (owner, text, optValidator) {
  if (owner) {
    this.eyo = owner
    owner.field_ = this
  } else {
    this.eyo = new eYo.FieldHelper(this)
  }
  eYo.FieldTextInput.superClass_.constructor.call(this, text,
    optValidator)
}
goog.inherits(eYo.FieldTextInput, Blockly.FieldTextInput)

Object.defineProperties(
  eYo.FieldTextInput.prototype,
  {
    size_: {
      get () {
        return this.eyo.size
      },
      set (newValue) {
        this.eyo.size.set(newValue)
      }
    },
  }
)

/**
 * The HTML input element for the user to type, or null if no FieldTextInput
 * editor is currently open.
 * @type {HTMLInputElement}
 * @private
 */
eYo.FieldTextInput.htmlInput_ = null

/**
 * Install this field on a block.
 * @suppress{accessControls}
 */
eYo.FieldTextInput.prototype.init = function () {
  if (this.fieldGroup_) {
    // Field has already been initialized once.
    return
  }
  // Build the DOM.
  this.fieldGroup_ = Blockly.utils.createSvgElement('g', {}, null)
  if (this.eyo.slot) {
    this.eyo.slot.getSvgRoot().appendChild(this.fieldGroup_)
  } else {
    this.sourceBlock_.getSvgRoot().appendChild(this.fieldGroup_)
  }
  this.borderRect_ = Blockly.utils.createSvgElement('rect',
    { class: 'eyo-none',
      rx: 0,
      ry: 0,
      x: -eYo.Style.Edit.padding_h,
      y: -eYo.Style.Edit.padding_v,
      height: eYo.Font.height + 2 * eYo.Style.Edit.padding_v},
    this.fieldGroup_, this.sourceBlock_.workspace)

  this.editRect_ = Blockly.utils.createSvgElement('rect',
    { class: 'eyo-edit',
      'rx': eYo.Style.Edit.radius,
      'ry': eYo.Style.Edit.radius,
      'x': -eYo.Style.Edit.padding_h - (this.eyo.left_space ? eYo.Unit.x : 0),
      'y': -eYo.Style.Edit.padding_v,
      'height': eYo.Font.height + 2 * eYo.Style.Edit.padding_v},
    this.fieldGroup_, this.sourceBlock_.workspace)

  /** @type {!Element} */
  this.textElement_ = Blockly.utils.createSvgElement('text',
    {'class': this.cssClass, 'y': eYo.Font.totalAscent},
    this.fieldGroup_)
  this.updateEditable()
  this.fieldGroup_.appendChild(this.textElement_)
  this.mouseDownWrapper_ =
  Blockly.bindEventWithChecks_(this.fieldGroup_, 'mousedown', this, this.onMouseDown_
  )
  if (this.eyo.css_class) {
    goog.dom.classlist.add(this.textElement_, eYo.Do.valueOf(this.eyo.css_class, this.eyo))
  }
}

/**
 * The block must be selected before the text field would become editable.
 **/
eYo.FieldTextInput.prototype.onMouseDown_ = function (e) {
  if (eYo.Selected.block === this.sourceBlock_) {
    eYo.FieldTextInput.superClass_.onMouseDown_.call(this, e)
  }
}

/**
 * Updates the width of the field. This calls getCachedWidth which won't cache
 * the approximated width on IE/Edge when `getComputedTextLength` fails. Once
 * it eventually does succeed, the result will be cached.
 **/
eYo.FieldTextInput.prototype.updateWidth = function () {
  eYo.FieldTextInput.superClass_.updateWidth.call(this)
  if (this.editRect_) {
    var width = this.eyo.size.width
    this.editRect_.setAttribute('width', width + 2 * eYo.Style.Edit.padding_h + (this.eyo.left_space ? eYo.Unit.x : 0))
  }
}

/**
 * Dispose of all DOM objects belonging to this editable field.
 */
eYo.FieldTextInput.prototype.dispose = function () {
  eYo.FieldTextInput.superClass_.dispose.call(this)
  this.editRect_ = null
}

/**
 * Mouse cursor style when over the hotspot that initiates the editor.
 */
eYo.FieldTextInput.prototype.CURSOR = 'text'

/**
 * css class for both the text element and html input.
 */
eYo.FieldTextInput.prototype.cssClass = 'eyo-code'

/**
 * Show the inline free-text editor on top of the text.
 * @param {boolean=} optQuietInput True if editor should be created without
 *     focus.  Defaults to false.
 * @private
 * @suppress{accessControls}
 */
eYo.FieldTextInput.prototype.showEditor_ = function (optQuietInput) {
  var block = this.sourceBlock_
  if (this.eyo.doNotEdit || block.eyo.locked_ || !block.eyo.canEdit_ || block.isInFlyout) {
    return
  }
  block.eyo.isEditing = this.eyo.isEditing = true
  this.editRect_ && goog.dom.classlist.add(this.editRect_, 'eyo-editing')
  eYo.Events.setGroup(true)
  this.eyo.grouper_ = Blockly.Events.getGroup()
  this.onStartEditing_ && this.onStartEditing_()
  this.eyo.onStartEditing_ && this.eyo.onStartEditing_.call(this)
  var model = this.eyo.model
  if (model) {
    if (goog.isFunction(model.startEditing)) {
      model.startEditing.call(this)
    } else if (model.startEditing) {
      this.eyo.constructor.onStartEditing.call(this)
    }
  }
  block.eyo.startEditingField && block.eyo.startEditingField(this)
  this.render_()
  block.render()
  this.workspace_ = block.workspace
  var quietInput = optQuietInput || false
  if (!quietInput && (goog.userAgent.MOBILE || goog.userAgent.ANDROID ||
                      goog.userAgent.IPAD)) {
    this.showPromptEditor_()
  } else {
    this.showInlineEditor_(quietInput)
  }
}

/**
 * Create and show a text input editor that is a prompt (usually a popup).
 * Mobile browsers have issues with in-line textareas (focus and keyboards).
 * @private
 */
eYo.FieldTextInput.prototype.showPromptEditor_ = function () {
  var field = this
  Blockly.prompt(eYo.Msg.CHANGE_VALUE_TITLE, this.text_,
    function (newValue) {
      if (field.getSourceBlock()) {
        newValue = field.callValidator(newValue)
      }
      field.setValue(newValue)
    })
}

/**
 * Create and show a text input editor that sits directly over the text input.
 * @param {boolean} quietInput True if editor should be created without
 *     focus.
 * @private
 * @suppress{accessControls}
 */
eYo.FieldTextInput.prototype.showInlineEditor_ = function (quietInput) {
  var dispose = this.widgetDispose_()
  Blockly.WidgetDiv.show(this, this.sourceBlock_.RTL, dispose)
  var div = Blockly.WidgetDiv.DIV
  // Create the input.
  var htmlInput =
      goog.dom.createDom(goog.dom.TagName.INPUT, 'eyo-html-input')
  htmlInput.setAttribute('spellcheck', this.spellcheck_)

  goog.dom.classlist.add(div, this.cssClass)
  goog.dom.classlist.add(htmlInput, this.cssClass)
  if (this.eyo.isComment) {
    goog.dom.classlist.remove(htmlInput, 'eyo-code')
    goog.dom.classlist.add(htmlInput, 'eyo-code-comment')
  }
  eYo.FieldTextInput.htmlInput_ = Blockly.FieldTextInput.htmlInput_ = htmlInput
  div.appendChild(htmlInput)

  htmlInput.value = htmlInput.defaultValue = this.text_
  htmlInput.oldValue_ = null
  this.validate_()
  this.resizeEditor_()
  if (!quietInput) {
    htmlInput.focus()
    htmlInput.select()
  }
  this.bindEvents_(htmlInput)
}

/**
 * Close the editor, save the results, and dispose of the editable
 * text field's elements.
 * @return {!Function} Closure to call on destruction of the WidgetDiv.
 * @private
 * @suppress{accessControls}
 */
eYo.FieldTextInput.prototype.widgetDispose_ = function () {
  var field = this
  return function () {
    var block = field.sourceBlock_
    block.eyo.isEditing = field.eyo.isEditing = false
    field.editRect_ && goog.dom.classlist.remove(field.editRect_, 'eyo-editing')
    field.callValidator()
    block.eyo.changeWrap(
      function () { // `this` is `block.eyo``
        field.onEndEditing_ && field.onEndEditing_()
        field.eyo.onEndEditing_ && field.eyo.onEndEditing_.call(field)
        var model = field.eyo.model
        if (model) {
          if (goog.isFunction(model.endEditing)) {
            model.endEditing.call(field)
          } else if (model.endEditing) {
            field.eyo.constructor.onEndEditing.call(field)
          }
        }
        this.endEditingField && this.endEditingField(field)
        if (field.eyo.grouper_) {
          eYo.Events.setGroup(false)
          delete field.eyo.grouper_
        }
        field.render_()
      }
    )
    eYo.FieldTextInput.superClass_.widgetDispose_.call(field)
    Blockly.WidgetDiv.DIV.style.fontFamily = ''
  }
}

/**
 * Override to noop.
 */
eYo.FieldTextInput.prototype.updateEditable = function () {
}

/**
 * Check to see if the contents of the editor validates.
 * Style the editor accordingly.
 * @private
 */
eYo.FieldTextInput.prototype.validate_ = function () {
  var valid = true
  goog.asserts.assertObject(eYo.FieldTextInput.htmlInput_)
  var htmlInput = eYo.FieldTextInput.htmlInput_
  if (this.sourceBlock_) {
    valid = this.callValidator(htmlInput.value)
  }
  if (valid === null) {
    goog.dom.classlist.add(eYo.FieldTextInput.htmlInput_, 'eyo-code-error')
  } else {
    goog.dom.classlist.remove(eYo.FieldTextInput.htmlInput_, 'eyo-code-error')
  }
}

/**
 * Resize the editor and the underlying block to fit the text. Adds an horizontal space to hold the next character.
 * @private
 * @suppress{accessControls}
 */
eYo.FieldTextInput.prototype.resizeEditor_ = function () {
  if (this.fieldGroup_) {
    var div = Blockly.WidgetDiv.DIV
    if (div.style.display !== 'none') {
      var bBox = this.fieldGroup_.getBBox()
      div.style.width = (bBox.width + eYo.Unit.x - (this.eyo.left_space ? eYo.Unit.x : 0) - eYo.Style.Edit.padding_h) * this.workspace_.scale + 'px'
      div.style.height = bBox.height * this.workspace_.scale + 'px'
      var xy = this.getAbsoluteXY_()
      div.style.left = (xy.x - eYo.EditorOffset.x + eYo.Style.Edit.padding_h) + 'px'
      div.style.top = (xy.y - eYo.EditorOffset.y) + 'px'
      this.sourceBlock_.eyo.changeWrap() // force rendering 
    }
  }
}

/**
 * Class for an editable code field.
 * @param {string} text The initial content of the field.
 * @param {Function=} optValidator An optional function that is called
 *     to validate any constraints on what the user entered.  Takes the new
 *     text as an argument and returns either the accepted text, a replacement
 *     text, or null to abort the change.
 * @param {string=} key
 * @extends {eYo.FieldTextInput}
 * @constructor
 */
eYo.FieldInput = function (owner, text, optValidator, key) {
  goog.asserts.assert(key, 'missing key for an editable field')
  eYo.FieldInput.superClass_.constructor.call(this, owner, text,
    optValidator)
  this.spellcheck_ = false
  key && (this.eyo.key = key)
}
goog.inherits(eYo.FieldInput, eYo.FieldTextInput)

Object.defineProperties(eYo.FieldInput.prototype, {
  b_eyo: {
    get () {
      return this.sourceBlock_.eyo
    }
  }
})

/**
 * Get the text from this field as displayed on screen.  May differ from getText
 * due to ellipsis, and other formatting.
 * @return {string} Currently displayed text.
 * @private
 * @suppress{accessControls}
 */
eYo.FieldInput.prototype.getDisplayText_ = function () {
  if (!this.eyo.isEditing && !this.text_.length &&(this.eyo.placeholder || (this.eyo.data && (this.eyo.data.placeholder || this.eyo.data.model.placeholder)))) {
    return this.placeholderText()
  }
  return eYo.FieldInput.superClass_.getDisplayText_.call(this)
}

/**
 * The placeholder text.
 * Get the model driven value if any.
 * @param {boolean} clear
 * @return {string} Currently displayed text.
 * @private
 */
eYo.FieldInput.prototype.placeholderText = function (clear) {
  if (clear) {
    this.placeholderText_ = undefined
  } else if (this.placeholderText_) {
    return this.placeholderText_
  }
  if (this.sourceBlock_) {
    var ph = (model) => {
      var placeholder = model && model.placeholder
      if (goog.isNumber(placeholder)) {
        return placeholder.toString()
      }
      placeholder = eYo.Do.valueOf(placeholder, this)
      if (placeholder) {
        placeholder = placeholder.toString()
        if (placeholder.length > 1) {
          placeholder = placeholder.trim() // one space alone is allowed
        }
      }
      return placeholder
    }
    return (() => {
      var eyo = this.eyo
      if (eyo) {
        var data = eyo.data
        return ph(data && data.model) || ph(eyo && eyo.model)
      }
    }) () || eYo.Msg.Placeholder.CODE
  }
}

/**
 * By default there is no difference between the human-readable text and
 * the language-neutral values.  Subclasses (such as dropdown) may define this.
 * @param {string} newValue New value.
 */
eYo.FieldInput.prototype.setValue = function (newValue) {
  this.eyo.placeholder = !newValue || !newValue.length
  eYo.Events.disableWrap(() => {
    eYo.FieldInput.superClass_.setValue.call(this, newValue)
  })
}

/**
 * Class for an editable code field for variables.
 * @param {string} text The initial content of the field.
 * @param {Function=} optValidator An optional function that is called
 *     to validate any constraints on what the user entered.  Takes the new
 *     text as an argument and returns either the accepted text, a replacement
 *     text, or null to abort the change.
 * @param {string=} key
 * @extends {eYo.FieldTextInput}
 * @constructor
 */
eYo.FieldVariable = function (owner, text, optValidator, key) {
  eYo.FieldVariable.superClass_.constructor.call(this, owner, text, optValidator, key)
}
goog.inherits(eYo.FieldVariable, eYo.FieldInput)

/**
 * Get the text from this field as displayed on screen.  May differ from getText
 * due to ellipsis, and other formatting.
 * @return {string} Currently displayed text.
 * @private
 * @suppress{accessControls}
 */
eYo.FieldVariable.prototype.getPythonText_ = function () {
  var candidate = this.text_? this.text_ : ''
  return !XRegExp.match(candidate, /\s/) && candidate || 'MISSING NAME'
}

/**
 * Setup the model.
 * Overrides the original method appending edition related stuff.
 */
eYo.Content.prototype.setupModel = (() => {
  var setupModel = eYo.Content.prototype.setupModel
  // This is a closure
  // default helper functions for an editable field bound to a data object
  // `this` is an instance of  eYo.FieldInput
  var validate = function (txt) {
    // `this` is a field's owner
    return this.validate(txt)
  }
  var startEditing = function () {
  }
  var endEditing = function () {
    var data = this.eyo.data
    goog.asserts.assert(data, 'No data bound to content ' + this.key + '/' + this.eyo.b_eyo.type)
    var result = this.callValidator(this.getValue())
    if (result !== null) {
      data.fromField(result)
      data.synchronize(result) // would this be included in the previous method ?
    } else {
      this.setValue(data.toText())
    }
  }
  return function () {
    // no need to setup the model each time we create a new field master
    setupModel.call(this)
    var model = this.model
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
}) ()

/**
 * Get the text from this field as displayed on screen.  May differ from getText
 * due to ellipsis, and other formatting.
 * @return {string} Currently displayed text.
 * @private
 * @suppress{accessControls}
 */
eYo.FieldTextInput.prototype.getPythonText_ = function () {
  var eyo = this.eyo
  if (!eyo.model.canEmpty && (this.eyo.placeholder || (this.eyo.data && this.eyo.data.placeholder))) {
    var t = this.placeholderText().trim()
    this.eyo.data && this.eyo.data.change(t)
    return t
  }
  return eYo.FieldTextInput.superClass_.getPythonText_.call(this)
}

