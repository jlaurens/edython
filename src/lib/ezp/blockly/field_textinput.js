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
  ezP.FieldTextInput.superClass_.constructor.call(this, text,
    optValidator)
}
goog.inherits(ezP.FieldTextInput, Blockly.FieldTextInput)

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
    {'class': 'blocklyText', 'y': ezP.Font.totalAscent},
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
 * Show the inline free-text editor on top of the text.
 * @param {boolean=} optQuietInput True if editor should be created without
 *     focus.  Defaults to false.
 * @private
 */
ezP.FieldTextInput.prototype.showEditor_ = function (optQuietInput) {
  this.workspace_ = this.sourceBlock_.workspace
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
  Blockly.WidgetDiv.show(this, this.sourceBlock_.RTL, this.widgetDispose_())
  var div = Blockly.WidgetDiv.DIV
  // Create the input.
  var htmlInput =
      goog.dom.createDom(goog.dom.TagName.INPUT, 'blocklyHtmlInput')
  htmlInput.setAttribute('spellcheck', this.spellcheck_)
  var fontSize = (ezP.Font.size * this.workspace_.scale) + 'pt'

  div.style.fontSize = fontSize
  htmlInput.style.fontSize = fontSize

  div.style.fontFamily = 'DejaVuSansMono'
  htmlInput.style.fontFamily = 'DejaVuSansMono'

  Blockly.FieldTextInput.htmlInput_ = htmlInput
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
    ezP.FieldTextInput.superClass_.widgetDispose_.call(thisField)
    Blockly.WidgetDiv.DIV.style.fontFamily = ''
  }
}

/**
 * Resize the editor and the underlying block to fit the text.
 * @private
 */
ezP.FieldTextInput.prototype.resizeEditor_ = function () {
  if (this.fieldGroup_) {
    var div = Blockly.WidgetDiv.DIV
    var bBox = this.fieldGroup_.getBBox()
    div.style.width = bBox.width * this.workspace_.scale + 'px'
    div.style.height = bBox.height * this.workspace_.scale + 'px'
    var xy = this.getAbsoluteXY_()
    div.style.left = (xy.x - ezP.EditorOffset.x) + 'px'
    div.style.top = (xy.y - ezP.EditorOffset.y) + 'px'
  }
}

ezP.FieldCodeInput = function (text, optValidator) {
  ezP.FieldCodeInput.superClass_.constructor.call(this, text,
    optValidator)
}
goog.inherits(ezP.FieldCodeInput, ezP.FieldTextInput)

ezP.FieldTextInput.prototype.getSerializedXml = function () {
  var container = ezP.FieldTextInput.superClass_.getSerializedXml.call(this)
  container.setAttribute('value', this.getValue())
  return container
}

ezP.FieldTextInput.prototype.deserializeXml = function (xml) {
  this.setValue(xml.getAttribute('value') || '')
}
