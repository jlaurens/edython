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
eYo.FieldTextInput = function (text, optValidator) {
  this.eyo = new eYo.FieldHelper(this)
  this.eyo.isTextInput = true
  eYo.FieldTextInput.superClass_.constructor.call(this, text,
    optValidator)
}
goog.inherits(eYo.FieldTextInput, Blockly.FieldTextInput)

/**
 * Dispose of the delegate.
 */
eYo.FieldTextInput.prototype.dispose = function () {
  this.eyo.dispose()
  this.eyo = null
  eYo.FieldTextInput.superClass_.dispose.call(this)
}

Object.defineProperties(eYo.FieldTextInput.prototype, {
  size_: {
    get () {
      return this.eyo.size
    },
    set (newValue) {
      this.eyo.size.set(newValue)
    }
  },
  brick: {
    get () {
      return this.sourceBlock_.eyo
    }
  }
})


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
  this.eyo.ui_driver.fieldInit(this)
}

/**
 * The block must be selected before the text field would become editable.
 **/
eYo.FieldTextInput.prototype.onMouseDown_ = function (e) {
  if (this.eyo.brick.selected) {
    eYo.FieldTextInput.superClass_.onMouseDown_.call(this, e)
  }
}

/**
 * Updates the width of the field. This calls getCachedWidth which won't cache
 * the approximated width on IE/Edge when `getComputedTextLength` fails.
 * Once it eventually does succeed, the result will be cached.
 **/
eYo.FieldTextInput.prototype.updateWidth = function () {
  eYo.FieldTextInput.superClass_.updateWidth.call(this)
  var d = this.ui_driver
  d && d.fieldUpdateWidth(this)
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
  var b_eyo = this.eyo.brick
  var block = this.sourceBlock_
  if (this.eyo.doNotEdit || b_eyo.locked_ || !b_eyo.canEdit_ || block.isInFlyout) {
    return
  }
  b_eyo.isEditing = this.eyo.isEditing = true
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
  b_eyo.startEditingField && b_eyo.startEditingField(this)
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
  var d = this.eyo.ui_driver
  d && d.fieldInlineEditorShow(this, quietInput)
}

/**
 * Close the editor, save the results, and dispose of the editable
 * text field's elements.
 * @return {!Function} Closure to call on destruction of the WidgetDiv.
 * @private
 */
eYo.FieldTextInput.prototype.widgetDispose_ = function () {
  return this.eyo.ui_driver.fieldWidgetDisposeCallback(this)
}

/**
 * Override to noop.
 */
eYo.FieldTextInput.prototype.updateEditable = eYo.Do.nothing

/**
 * Check to see if the contents of the editor validates.
 * Style the editor accordingly.
 * @private
 */
eYo.FieldTextInput.prototype.validate_ = function () {
  this.eyo.ui_driver.fieldInlineEditorValidate(this)
}

/**
 * Resize the editor and the underlying block to fit the text. Adds an horizontal space to hold the next character.
 * @private
 * @suppress{accessControls}
 */
eYo.FieldTextInput.prototype.resizeEditor_ = function () {
  this.eyo.ui_driver.fieldInlineEditorUpdate(this)
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
eYo.FieldInput = function (text, optValidator, key) {
  goog.asserts.assert(key, 'missing key for an editable field')
  eYo.FieldInput.superClass_.constructor.call(this, text,
    optValidator)
  this.spellcheck_ = false
  key && (this.eyo.key = key)
}
goog.inherits(eYo.FieldInput, eYo.FieldTextInput)

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
    var ph = model => {
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
 * @extends {eYo.FieldInput}
 * @constructor
 */
eYo.FieldVariable = function (text, optValidator, key) {
  eYo.FieldVariable.superClass_.constructor.call(this, text, optValidator, key)
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
  return !XRegExp.match(candidate, /\s/) && candidate || (!this.eyo.optional_ && '<MISSING NAME>')
}

/**
 * Get the text from this field to be use in python code.
 * @return {string} text.
 * @private
 * @suppress{accessControls}
 */
eYo.FieldTextInput.prototype.getPythonText_ = function () {
  var eyo = this.eyo
  var t = eYo.FieldTextInput.superClass_.getPythonText_.call(this)
  if (!t.length && !this.eyo.optional_) {
    if (!eyo.model.canEmpty && (this.eyo.placeholder || (this.eyo.data && this.eyo.data.placeholder))) {
      var t = `<missing ${this.placeholderText().trim()}>`.toUpperCase()
      // this.eyo.data && this.eyo.data.change(t)
      return t
    }
  }
  return t
}

