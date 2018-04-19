/**
 * ezPython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview utilities for ezPython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('ezP.FieldTextInput')
goog.provide('ezP.FieldInput')
goog.provide('ezP.FieldComment')
goog.provide('ezP.FieldNumber')
goog.provide('ezP.FieldString')
goog.provide('ezP.FieldLongString')

goog.require('Blockly.FieldTextInput')

/**
 * Class for an editable text field.
 * @param {string} text The initial content of the field.
 * @param {Function=} optValidator An optional function that is called
 *     to validate any constraints on what the user entered.  Takes the new
 *     text as an argument and returns either the accepted text, a replacement
 *     text, or null to abort the change.
 * @extends {Blockly.Field}
 * @constructor
 */
ezP.FieldTextInput = function (text, optValidator) {
  this.ezp = {}
  ezP.FieldTextInput.superClass_.constructor.call(this, text,
    optValidator)
}
goog.inherits(ezP.FieldTextInput, Blockly.FieldTextInput)

/**
 * The HTML input element for the user to type, or null if no FieldTextInput
 * editor is currently open.
 * @type {HTMLInputElement}
 * @private
 */
ezP.FieldTextInput.htmlInput_ = null;

/**
 * Install this field on a block.
 */
ezP.FieldTextInput.prototype.init = function () {
  if (this.fieldGroup_) {
    // Field has already been initialized once.
    return
  }
  // Build the DOM.
  this.fieldGroup_ = Blockly.utils.createSvgElement('g', {}, null)
  if (!this.visible_) {
    this.fieldGroup_.style.display = 'none'
  }

  this.borderRect_ = Blockly.utils.createSvgElement('rect',
    { 'rx': 0,
      'ry': 0,
      'x': 0,
      'y': 0,
      'height': ezP.Font.height},
    this.fieldGroup_, this.sourceBlock_.workspace)

  /** @type {!Element} */
  this.textElement_ = Blockly.utils.createSvgElement('text',
    {'class': this.cssClass, 'y': ezP.Font.totalAscent},
    this.fieldGroup_)
  this.updateEditable()
  this.sourceBlock_.getSvgRoot().appendChild(this.fieldGroup_)
  this.mouseDownWrapper_ =
  Blockly.bindEventWithChecks_(this.fieldGroup_, 'mousedown', this,
    this.onMouseDown_)
  // Force a render.
  this.render_()
}

/**
 * Mouse cursor style when over the hotspot that initiates the editor.
 */
ezP.FieldTextInput.prototype.CURSOR = 'text'

/**
 * css class for both the text element and html input.
 */
ezP.FieldTextInput.prototype.cssClass = 'ezp-code'

/**
 * Show the inline free-text editor on top of the text.
 * @param {boolean=} optQuietInput True if editor should be created without
 *     focus.  Defaults to false.
 * @private
 */
ezP.FieldTextInput.prototype.showEditor_ = function (optQuietInput) {
  var block = this.sourceBlock_
  if (block.ezp.locked_) {
    return
  }
  this.ezp.isEditing = true
  this.ezp.grouper_ = new ezP.Events.Grouper()
  block.ezp.startEditingField && block.ezp.startEditingField(block, this)
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
ezP.FieldTextInput.prototype.showPromptEditor_ = function () {
  var field = this
  Blockly.prompt(Blockly.Msg.CHANGE_VALUE_TITLE, this.text_,
    function (newValue) {
      if (field.sourceBlock_) {
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
 */
ezP.FieldTextInput.prototype.showInlineEditor_ = function (quietInput) {
  var dispose = this.widgetDispose_()
  Blockly.WidgetDiv.show(this, this.sourceBlock_.RTL, dispose)
  var div = Blockly.WidgetDiv.DIV
  // Create the input.
  var htmlInput =
      goog.dom.createDom(goog.dom.TagName.INPUT, 'ezp-html-input')
  htmlInput.setAttribute('spellcheck', this.spellcheck_)
  
  goog.dom.classlist.add(div, this.cssClass)
  goog.dom.classlist.add(htmlInput, this.cssClass)

  ezP.FieldTextInput.htmlInput_ = Blockly.FieldTextInput.htmlInput_ = htmlInput
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
 */
ezP.FieldTextInput.prototype.widgetDispose_ = function () {
  var field = this
  return function () {
    field.ezp.isEditing = false
    field.callValidator()
    field.onEndEditing_ && field.onEndEditing_()
    field.ezp.onEndEditing_ && field.ezp.onEndEditing_.call(field)
    var block = field.sourceBlock_
    block.ezp.endEditingField && block.ezp.endEditingField(block, field)  
    field.ezp.grouper_ && field.ezp.grouper_.stop()
    field.render_()
    block.render()
    ezP.FieldTextInput.superClass_.widgetDispose_.call(field)
    Blockly.WidgetDiv.DIV.style.fontFamily = ''
  }
}

/**
 * Override to noop.
 * @inherited
 */
ezP.FieldTextInput.prototype.updateEditable = function() {
};

/**
 * Resize the editor and the underlying block to fit the text. Adds an horizontal space to hold the next character.
 * @private
 */
ezP.FieldTextInput.prototype.resizeEditor_ = function () {
  if (this.fieldGroup_) {
    var div = Blockly.WidgetDiv.DIV
    var bBox = this.fieldGroup_.getBBox()
    div.style.width = (bBox.width+ezP.Font.space) * this.workspace_.scale + 'px'
    div.style.height = bBox.height * this.workspace_.scale + 'px'
    var xy = this.getAbsoluteXY_()
    div.style.left = (xy.x - ezP.EditorOffset.x) + 'px'
    div.style.top = (xy.y - ezP.EditorOffset.y) + 'px'
  }
}

/**
 * Class for an editable code field.
 * @param {string} text The initial content of the field.
 * @param {Function=} optValidator An optional function that is called
 *     to validate any constraints on what the user entered.  Takes the new
 *     text as an argument and returns either the accepted text, a replacement
 *     text, or null to abort the change.
 * @extends {ezP.FieldTextInput}
 * @constructor
 */
ezP.FieldInput = function (text, optValidator) {
  ezP.FieldInput.superClass_.constructor.call(this, text,
    optValidator)
}
goog.inherits(ezP.FieldInput, ezP.FieldTextInput)

/**
 * Get the text from this field as displayed on screen.  May differ from getText
 * due to ellipsis, and other formatting.
 * @return {string} Currently displayed text.
 * @private
 */
ezP.FieldInput.prototype.getDisplayText_ = function() {
  if (this.ezp.placeholder && !this.ezp.isEditing) {
    return this.placeholderText()
  }
  return ezP.FieldInput.superClass_.getDisplayText_.call(this)
}

ezP.FieldInput.prototype.placeholderText = function() {
  return this.placeholderText_ || Blockly.Field.NBSP
}

/**
 * By default there is no difference between the human-readable text and
 * the language-neutral values.  Subclasses (such as dropdown) may define this.
 * @param {string} newValue New value.
 */
ezP.FieldInput.prototype.setValue = function(newValue) {
  this.ezp.placeholder = !newValue || !newValue.length 
  ezP.FieldInput.superClass_.setValue.call(this, newValue)
}

ezP.FieldInput.prototype.placeholderText = function() {
  return this.placeholderText_ || ezP.Msg.PLACEHOLDER_CODE
}

/**
 * Class for an editable comment field.
 * @param {string} text The initial content of the field.
 * @extends {ezP.FieldTextInput}
 * @constructor
 */
ezP.FieldComment = function (text, optValidator) {
  ezP.FieldComment.superClass_.constructor.call(this, text, optValidator)
}
goog.inherits(ezP.FieldComment, ezP.FieldInput)

ezP.FieldComment.prototype.cssClass = 'ezp-code-comment'
ezP.FieldComment.prototype.placeholderText = function() {
  return this.placeholderText_ || ezP.Msg.PLACEHOLDER_COMMENT
}

ezP.FieldNumber = function (text) {
  var field = this
  var validator = function(txt) {
    var validator_ = function(txt, re, type) {
      if (re.exec(txt)) {
        field.ezp.error = false
        if (ezP.FieldTextInput.htmlInput_) {
          goog.dom.classlist.remove(ezP.FieldTextInput.htmlInput_, 'ezp-code-error')
        }
        var block = field.sourceBlock_
        block.ezp.setupType(block, type)
        return txt
      }
      return undefined
    }
    if (validator_(txt, ezP.XRE.integer, ezP.T3.Expr.integer)
    || validator_(txt, ezP.XRE.floatnumber, ezP.T3.Expr.floatnumber)
    || validator_(txt, ezP.XRE.imagnumber, ezP.T3.Expr.imagnumber)) {
      return txt
    }
    field.ezp.error = true
    goog.dom.classlist.add(ezP.FieldTextInput.htmlInput_, 'ezp-code-error')
    return txt
  }
  ezP.FieldNumber.superClass_.constructor.call(this, text, validator)
}
goog.inherits(ezP.FieldNumber, ezP.FieldInput)

ezP.FieldNumber.prototype.placeholderText = function() {
  return this.placeholderText_ || ezP.Msg.PLACEHOLDER_NUMBER
}

/**
 * Adds a 'ezp-code-error' class in case of error.
 * @private
 * @override
 */
ezP.FieldInput.prototype.render_ = function() {
  ezP.FieldInput.superClass_.render_.call(this)
  if (this.ezp.error) {
    goog.dom.classlist.add(this.textElement_, 'ezp-code-error')
  } else {
    goog.dom.classlist.remove(this.textElement_, 'ezp-code-error')
  }
  if (this.ezp.placeholder) {
    goog.dom.classlist.add(this.textElement_, 'ezp-code-placeholder')
  } else {
    goog.dom.classlist.remove(this.textElement_, 'ezp-code-placeholder')
  }
}

/**
 * Class for an editable string field.
 * @param {string} text The initial content of the field.
 * @extends {ezP.FieldTextInput}
 * @constructor
 */
ezP.FieldString = function (text) {
  var validator = null
  ezP.FieldString.superClass_.constructor.call(this, text, validator)
}
goog.inherits(ezP.FieldString, ezP.FieldInput)

ezP.FieldString.prototype.placeholderText = function() {
  return this.placeholderText_ || (this.sourceBlock_.type === ezP.T3.Expr.shortbytesliteral?
  ezP.Msg.PLACEHOLDER_BYTES: ezP.Msg.PLACEHOLDER_STRING)
}

/**
 * Class for an editable long string field.
 * @param {string} text The initial content of the field.
 * @extends {ezP.FieldTextInput}
 * @constructor
 */
ezP.FieldLongString = function (text) {
  var validator = null
  ezP.FieldLongString.superClass_.constructor.call(this, text, validator)
}
goog.inherits(ezP.FieldLongString, ezP.FieldInput)

