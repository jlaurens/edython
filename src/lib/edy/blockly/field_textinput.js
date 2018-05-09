/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview utilities for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('edY.FieldTextInput')
goog.provide('edY.FieldInput')

goog.require('Blockly.FieldTextInput')

goog.provide('edY.FieldHelper')


/**
 * Class for an editable text field helper.
 * @param {edY.TextInputField} owner  The owner of the field.
 * @constructor
 */
edY.FieldHelper = function (owner) {
  this.owner_ = owner
  owner.edy = this
}

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
edY.FieldTextInput = function (text, optValidator) {
  new edY.FieldHelper(this)
  edY.FieldTextInput.superClass_.constructor.call(this, text,
    optValidator)
}
goog.inherits(edY.FieldTextInput, Blockly.FieldTextInput)

/**
 * The HTML input element for the user to type, or null if no FieldTextInput
 * editor is currently open.
 * @type {HTMLInputElement}
 * @private
 */
edY.FieldTextInput.htmlInput_ = null;

/**
 * Install this field on a block.
 */
edY.FieldTextInput.prototype.init = function () {
  if (this.fieldGroup_) {
    // Field has already been initialized once.
    return
  }
  // Build the DOM.
  this.fieldGroup_ = Blockly.utils.createSvgElement('g', {}, null)
  if (this.edy.tile) {
    this.edy.tile.getSvgRoot().appendChild(this.fieldGroup_)
  } else {
    this.sourceBlock_.getSvgRoot().appendChild(this.fieldGroup_)
  }
  this.borderRect_ = Blockly.utils.createSvgElement('rect',
    { class: 'edy-none',
      rx: 0,
      ry: 0,
      x: -edY.Style.Edit.padding_h,
      y: -edY.Style.Edit.padding_v,
      height: edY.Font.height + 2*edY.Style.Edit.padding_v},
    this.fieldGroup_, this.sourceBlock_.workspace)

  this.editRect_ = Blockly.utils.createSvgElement('rect',
    { class: 'edy-edit',
      'rx': edY.Style.Edit.radius,
      'ry': edY.Style.Edit.radius,
      'x': -edY.Style.Edit.padding_h - (this.edy.left_space? edY.Font.space:0),
      'y': -edY.Style.Edit.padding_v,
      'height': edY.Font.height + 2*edY.Style.Edit.padding_v},
    this.fieldGroup_, this.sourceBlock_.workspace)

  /** @type {!Element} */
  this.textElement_ = Blockly.utils.createSvgElement('text',
    {'class': this.cssClass, 'y': edY.Font.totalAscent},
    this.fieldGroup_)
  this.updateEditable()
  this.fieldGroup_.appendChild(this.textElement_)
  this.mouseDownWrapper_ =
  Blockly.bindEventWithChecks_(this.fieldGroup_, 'mousedown', this, this.onMouseDown_
  )
  // Force a render.
  this.render_()
}

/**
 * Updates the width of the field. This calls getCachedWidth which won't cache
 * the approximated width on IE/Edge when `getComputedTextLength` fails. Once
 * it eventually does succeed, the result will be cached.
 **/
edY.FieldTextInput.prototype.updateWidth = function () {
  edY.FieldTextInput.superClass_.updateWidth.call(this)
  var width = Blockly.Field.getCachedWidth(this.textElement_)
  if (this.editRect_) {
    this.editRect_.setAttribute('width', width+2*edY.Style.Edit.padding_h+(this.edy.left_space? edY.Font.space: 0))
  }
}

/**
 * Dispose of all DOM objects belonging to this editable field.
 */
edY.FieldTextInput.prototype.dispose = function() {
  edY.FieldTextInput.superClass_.dispose.call(this)
  this.editRect_ = null;
};

/**
 * Mouse cursor style when over the hotspot that initiates the editor.
 */
edY.FieldTextInput.prototype.CURSOR = 'text'

/**
 * css class for both the text element and html input.
 */
edY.FieldTextInput.prototype.cssClass = 'edy-code'

/**
 * Show the inline free-text editor on top of the text.
 * @param {boolean=} optQuietInput True if editor should be created without
 *     focus.  Defaults to false.
 * @private
 */
edY.FieldTextInput.prototype.showEditor_ = function (optQuietInput) {
  var block = this.sourceBlock_
  if (block.edy.locked_ || !block.edy.canEdit_) {
    return
  }
  this.edy.isEditing = true
  this.editRect_ && goog.dom.classlist.add(this.editRect_, 'edy-editing')
  Blockly.Events.setGroup(true)
  this.edy.grouper_ = Blockly.Events.getGroup()
  this.onStartEditing_ && this.onStartEditing_()
  this.edy.onStartEditing_ && this.edy.onStartEditing_.call(this)
  var model = this.edy.model
  if (model) {
    if (goog.isFunction(model.startEditing)) {
      model.startEditing.call(this)
    } else if (model.startEditing) {
      this.edy.constructor.onStartEditing.call(this)
    }
  }
  block.edy.startEditingField && block.edy.startEditingField(block, this)
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
edY.FieldTextInput.prototype.showPromptEditor_ = function () {
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
edY.FieldTextInput.prototype.showInlineEditor_ = function (quietInput) {
  var dispose = this.widgetDispose_()
  Blockly.WidgetDiv.show(this, this.sourceBlock_.RTL, dispose)
  var div = Blockly.WidgetDiv.DIV
  // Create the input.
  var htmlInput =
      goog.dom.createDom(goog.dom.TagName.INPUT, 'edy-html-input')
  htmlInput.setAttribute('spellcheck', this.spellcheck_)
  
  goog.dom.classlist.add(div, this.cssClass)
  goog.dom.classlist.add(htmlInput, this.cssClass)
  if (this.edy.comment) {
    goog.dom.classlist.remove(htmlInput, 'edy-code')
    goog.dom.classlist.add(htmlInput, 'edy-code-comment')
  }
  edY.FieldTextInput.htmlInput_ = Blockly.FieldTextInput.htmlInput_ = htmlInput
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
edY.FieldTextInput.prototype.widgetDispose_ = function () {
  var field = this
  return function () {
    field.edy.isEditing = false
    field.editRect_ && goog.dom.classlist.remove(field.editRect_, 'edy-editing')
    field.callValidator()
    field.onEndEditing_ && field.onEndEditing_()
    field.edy.onEndEditing_ && field.edy.onEndEditing_.call(field)
    var model = field.edy.model
    if (model) {
      if (goog.isFunction(model.endEditing)) {
        model.endEditing.call(field)
      } else if (model.endEditing) {
        field.edy.constructor.onEndEditing.call(field)
      }
    }
    var block = field.sourceBlock_
    block.edy.endEditingField && block.edy.endEditingField(block, field)  
    if (field.edy.grouper_) {
      Blockly.Events.setGroup(false)
      delete field.edy.grouper_
    }
    field.render_()
    block.render()
    edY.FieldTextInput.superClass_.widgetDispose_.call(field)
    Blockly.WidgetDiv.DIV.style.fontFamily = ''
  }
}

/**
 * Override to noop.
 * @inherited
 */
edY.FieldTextInput.prototype.updateEditable = function() {
};

/**
 * Check to see if the contents of the editor validates.
 * Style the editor accordingly.
 * @private
 */
edY.FieldTextInput.prototype.validate_ = function() {
  var valid = true;
  goog.asserts.assertObject(edY.FieldTextInput.htmlInput_);
  var htmlInput = edY.FieldTextInput.htmlInput_;
  if (this.sourceBlock_) {
    valid = this.callValidator(htmlInput.value);
  }
  if (valid === null) {
    goog.dom.classlist.add(edY.FieldTextInput.htmlInput_, 'edy-code-error')
  } else {
    goog.dom.classlist.remove(edY.FieldTextInput.htmlInput_, 'edy-code-error')
  }
};

/**
 * Resize the editor and the underlying block to fit the text. Adds an horizontal space to hold the next character.
 * @private
 */
edY.FieldTextInput.prototype.resizeEditor_ = function () {
  if (this.fieldGroup_) {
    var div = Blockly.WidgetDiv.DIV
    var bBox = this.fieldGroup_.getBBox()
    div.style.width = (bBox.width+edY.Font.space-(this.edy.left_space? edY.Font.space: 0)-edY.Style.Edit.padding_h) * this.workspace_.scale + 'px'
    div.style.height = bBox.height * this.workspace_.scale + 'px'
    var xy = this.getAbsoluteXY_()
    div.style.left = (xy.x - edY.EditorOffset.x+edY.Style.Edit.padding_h) + 'px'
    div.style.top = (xy.y - edY.EditorOffset.y) + 'px'
  }
}

/**
 * Class for an editable code field.
 * @param {string} text The initial content of the field.
 * @param {Function=} optValidator An optional function that is called
 *     to validate any constraints on what the user entered.  Takes the new
 *     text as an argument and returns either the accepted text, a replacement
 *     text, or null to abort the change.
 * @extends {edY.FieldTextInput}
 * @constructor
 */
edY.FieldInput = function (text, optValidator, key) {
  goog.asserts.assert(key, 'missing key for an editable field')
  edY.FieldInput.superClass_.constructor.call(this, text,
    optValidator)
  this.spellcheck_ = false
  this.edy.key = key
}
goog.inherits(edY.FieldInput, edY.FieldTextInput)

/**
 * Get the text from this field as displayed on screen.  May differ from getText
 * due to ellipsis, and other formatting.
 * @return {string} Currently displayed text.
 * @private
 */
edY.FieldInput.prototype.getDisplayText_ = function() {
  if (this.edy.placeholder && !this.edy.isEditing) {
    return this.placeholderText()
  }
  return edY.FieldInput.superClass_.getDisplayText_.call(this)
}

/**
 * The placeholder text.
 * Get the model driven value if any.
 * @return {string} Currently displayed text.
 * @private
 */
edY.FieldInput.prototype.placeholderText = function() {
  if (this.placeholderText_) {
    return this.placeholderText_
  }
  return function() {
    var model = this.edy && this.edy.model
    if (model) {
      var placeholder = model.placeholder
      return goog.isString(placeholder) &&  placeholder || goog.isFunction(placeholder) &&  placeholder.call(this)
    }
  }.call(this) || edY.Msg.Placeholder.CODE
}

/**
 * By default there is no difference between the human-readable text and
 * the language-neutral values.  Subclasses (such as dropdown) may define this.
 * @param {string} newValue New value.
 */
edY.FieldInput.prototype.setValue = function(newValue) {
  this.edy.placeholder = !newValue || !newValue.length 
  edY.FieldInput.superClass_.setValue.call(this, newValue)
}

/**
 * Adds a 'edy-code-error' class in case of error.
 * @private
 * @override
 */
edY.FieldInput.prototype.render_ = function() {
  if (!this.textElement_) {
    // not yet available
    return
  }
  edY.FieldInput.superClass_.render_.call(this)
if (this.edy.placeholder) {
    goog.dom.classlist.add(this.textElement_, 'edy-code-placeholder')
  } else {
    goog.dom.classlist.remove(this.textElement_, 'edy-code-placeholder')
  }
  if (this.edy.comment) {
    goog.dom.classlist.add(this.textElement_, 'edy-code-comment')
  } else {
    goog.dom.classlist.remove(this.textElement_, 'edy-code-comment')
  }
}

/**
 * Default method to start editing.
 * @this is a field owning an helper
 */
edY.FieldHelper.onStartEditing = function () {
}

/**
 * Default method to end editing.
 * @this is a field owning an helper
 */
edY.FieldHelper.onEndEditing = function () {
  this.edy.data.fromText(this.getValue())
}

/**
 * Set the keyed data of the source block to the given value.
 * Eventual problem: there might be some kind of formatting such that
 * the data stored and the data shown in the ui are not the same.
 * There is no step for such a translation but the need did not occur yet.
 * @param {Object} newValue
 * @param {string|null} key  The data key, when null or undefined, ths receiver's key.
 * @constructor
 */
edY.FieldHelper.prototype.getData_ = function (key) {
  var data = this.data
  if (!data) {
    var block = this.owner_.sourceBlock_
    data = block && block.edy.data[key || this.key]
    goog.asserts.assert(data,
    edY.Do.format('No data bound to field {0}/{1}', key || this.key, block && block.type))
  }
  return data
}

/**
 * Validate the keyed data of the source block.
 * Asks the data object to do so.
 * The bound data must exist.
 * @param {Object} newValue
 * @param {string|null} key  The data key, when null or undefined, ths receiver's key.
 */
edY.FieldHelper.prototype.validate = function (txt) {
  console.log('FieldHelper validate:', txt)
  var v = this.getData_().validate(goog.isDef(txt)? txt: this.owner_.getValue())
  return v === null? v: (goog.isDef(v) && goog.isDef(v.validated)? v.validated: txt)
}

/**
 * Validate the keyed data of the source block.
 * Asks the data object to do so.
 * The bound data must exist.
 * @param {Object} newValue
 * @param {string|null} key  The data key, when null or undefined, ths receiver's key.
 */
edY.FieldHelper.prototype.validateIfData = function (txt) {
  if (this.data) {
    return this.validate(txt)
  }
  return txt
}
