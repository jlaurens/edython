/**
 * ezPython
 *
 * Copyright 2017 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview utilities for ezPython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('ezP.FieldTextInput')
goog.provide('ezP.FieldCodeInput')
goog.provide('ezP.FieldCodeComment')
goog.provide('ezP.FieldCodeNumber')
goog.provide('ezP.FieldCodeString')
goog.provide('ezP.FieldCodeLongString')

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
  this.ezpData = {}
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
  this.ezpData.isEditing = true
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
  var fieldText = this
  Blockly.prompt(Blockly.Msg.CHANGE_VALUE_TITLE, this.text_,
    function (newValue) {
      if (fieldText.sourceBlock_) {
        newValue = fieldText.callValidator(newValue)
      }
      fieldText.setValue(newValue)
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
  var thisField = this
  return function () {
    thisField.ezpData.isEditing = false
    var block = thisField.sourceBlock_
    block.ezp.endEditingField && block.ezp.endEditingField(block, this)  
    thisField.callValidator()
    thisField.render_()
    block.render()
    ezP.FieldTextInput.superClass_.widgetDispose_.call(thisField)
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
ezP.FieldCodeInput = function (text, optValidator) {
  ezP.FieldCodeInput.superClass_.constructor.call(this, text,
    optValidator)
}
goog.inherits(ezP.FieldCodeInput, ezP.FieldTextInput)

/**
 * Get the text from this field as displayed on screen.  May differ from getText
 * due to ellipsis, and other formatting.
 * @return {string} Currently displayed text.
 * @private
 */
ezP.FieldCodeInput.prototype.getDisplayText_ = function() {
  if (this.ezpData.placeholder && !this.ezpData.isEditing) {
    return this.placeholderText()
  }
  return ezP.FieldCodeInput.superClass_.getDisplayText_.call(this)
}

ezP.FieldCodeInput.prototype.placeholderText = function() {
  return Blockly.Field.NBSP
}

/**
 * By default there is no difference between the human-readable text and
 * the language-neutral values.  Subclasses (such as dropdown) may define this.
 * @param {string} newValue New value.
 */
ezP.FieldCodeInput.prototype.setValue = function(newValue) {
  if ((this.ezpData.placeholder = !newValue || !newValue.length)) {
    // newValue = this.placeholderText()
    if (this.textElement_) {
      goog.dom.classlist.add(this.textElement_,'ezp-code-placeholder')
    }
  } else if (this.textElement_) {
    goog.dom.classlist.remove(this.textElement_,'ezp-code-placeholder')
  }   
  ezP.FieldCodeInput.superClass_.setValue.call(this, newValue)
}

/**
 * Adds the class.
 * @override
 * @private
 */
ezP.FieldCodeInput.prototype.render_ = function() {
  ezP.FieldCodeInput.superClass_.render_.call(this)
  if (this.ezpData.placeholder) {
    goog.dom.classlist.add(this.textElement_, 'ezp-code-placeholder')
  } else {
    goog.dom.classlist.remove(this.textElement_, 'ezp-code-placeholder')
  }
};

/**
 * Class for an editable comment field.
 * @param {string} text The initial content of the field.
 * @extends {ezP.FieldTextInput}
 * @constructor
 */
ezP.FieldCodeComment = function (text, optValidator) {
  ezP.FieldCodeComment.superClass_.constructor.call(this, text, optValidator)
}
goog.inherits(ezP.FieldCodeComment, ezP.FieldCodeInput)

ezP.FieldCodeComment.prototype.cssClass = 'ezp-code-comment'
ezP.FieldCodeComment.prototype.placeholderText = function() {
  return ezP.Msg.PLACEHOLDER_COMMENT
}

ezP.FieldCodeNumber = function (text) {
  var field = this
  var validator = function(txt) {
    var validator_ = function(txt, re, type) {
      if (re.exec(txt)) {
        field.ezpData.error = false
        if (ezP.FieldTextInput.htmlInput_) {
          goog.dom.classlist.remove(ezP.FieldTextInput.htmlInput_, 'ezp-code-error')
        }
        var block = field.sourceBlock_
        block.type = type
        block.ezp.setupType(block)
        return txt
      }
      return undefined
    }
    if (validator_(txt, ezP.RE.integer, ezP.T3.Expr.integer)
    || validator_(txt, ezP.RE.floatnumber, ezP.T3.Expr.floatnumber)
    || validator_(txt, ezP.RE.imagnumber, ezP.T3.Expr.imagnumber)) {
      return txt
    }
    field.ezpData.error = true
    goog.dom.classlist.add(ezP.FieldTextInput.htmlInput_, 'ezp-code-error')
    return txt
  }
  ezP.FieldCodeNumber.superClass_.constructor.call(this, text, validator)
}
goog.inherits(ezP.FieldCodeNumber, ezP.FieldCodeInput)

ezP.FieldCodeNumber.prototype.placeholderText = function() {
  ezP.Msg.PLACEHOLDER_NUMBER
}

/**
 * Adds a 'ezp-code-error' class in case of error.
 * @private
 * @override
 */
ezP.FieldCodeInput.prototype.render_ = function() {
  ezP.FieldCodeInput.superClass_.render_.call(this)
  if (this.ezpData.error) {
    goog.dom.classlist.add(this.textElement_, 'ezp-code-error')
  } else {
    goog.dom.classlist.remove(this.textElement_, 'ezp-code-error')
  }
  if (this.ezpData.placeholder) {
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
ezP.FieldCodeString = function (text) {
  var validator = null
  ezP.FieldCodeString.superClass_.constructor.call(this, text, validator)
}
goog.inherits(ezP.FieldCodeString, ezP.FieldCodeInput)

ezP.FieldCodeString.prototype.placeholderText = function() {
  return this.sourceBlock_.type === ezP.T3.Expr.shortbytesliteral?
  ezP.Msg.PLACEHOLDER_BYTES: ezP.Msg.PLACEHOLDER_STRING
}

/**
 * Class for an editable long string field.
 * @param {string} text The initial content of the field.
 * @extends {ezP.FieldTextInput}
 * @constructor
 */
ezP.FieldCodeLongString = function (text) {
  var validator = null
  ezP.FieldCodeLongString.superClass_.constructor.call(this, text, validator)
}
goog.inherits(ezP.FieldCodeLongString, ezP.FieldCodeInput)

