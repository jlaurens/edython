/**
 * ezPython
 *
 * Copyright 2017 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview Variable input field for ezPython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('ezP.FieldVariable.Identifier')
goog.provide('ezP.FieldVariable.Annotation')
goog.provide('ezP.FieldVariable.Default')
goog.provide('ezP.FieldVariable.Menu')

goog.require('ezP.FieldCodeInput')
goog.require('ezP.Style')

/**
 * Class for a variable's identifier field.
 * @param {?string} varname The default name for the variable.  If null,
 *     a unique variable name will be generated.
 * @param {Function=} optValidator A function that is executed when a new
 *     option is selected.  Its sole argument is the new option value.
 * @param {Array.<string>} optVariableTypes A list of the types of variables to
 *     include in the dropdown.
 * @extends {ezP.FieldCodeInput}
 * @constructor
 */
ezP.FieldVariable.Identifier = function (identifier, optValidator) {
  ezP.FieldVariable.Identifier.superClass_.constructor.call(this, identifier, optValidator)
}
goog.inherits(ezP.FieldVariable.Identifier, ezP.FieldCodeInput)

/**
 * Attach this field to a block.
 * @param {!Blockly.Block} block The block containing this field.
 */
ezP.FieldVariable.Identifier.prototype.setSourceBlock = function(block) {
  ezP.FieldVariable.Identifier.superClass_.setSourceBlock.call(this, block)
  var workspace = this.sourceBlock_.workspace
  if (workspace && !workspace.getVariable(this.getValue())) {
     workspace.createVariable(this.getValue())
  }
};

ezP.FieldVariable.Identifier.prototype.getSerializedXml = function () {
  var container = goog.dom.createDom('field')
  container.setAttribute('name', this.name)
  container.setAttribute('value', this.getValue())
  var variable = this.sourceBlock_.workspace.getVariable(this.getValue())
  if (variable) {
    container.setAttribute('id', variable.getId())
    container.setAttribute('variableType', variable.type)
  }
  return container
}

ezP.FieldVariable.Identifier.prototype.deserializeXml = function (xml) {
  // TODO (marisaleung): When we change setValue and getValue to
  // interact with id's instead of names, update this so that we get
  // the variable based on id instead of textContent.
  var name = xml.getAttribute('value') || 'i'
  if (this.sourceBlock_.isInFlyout) {
    this.setValue(name)
    return
  }
  var type = xml.getAttribute('variableType') || ''
  var workspace = this.sourceBlock_.workspace
  var id = xml.getAttribute('id')
  var variable = workspace.getVariableById(id)
  if (!variable) {
    variable = workspace.getVariable(name)
    if (!variable) {
      variable = name.length
        ? workspace.createVariable(name, type, id)
        : ezP.Variables.createDummyVariable(workspace, type, id)
      this.setValue(name)
      return
    }
  }
  if (typeof (type) !== 'undefined' && type !== null) {
    if (type !== variable.type) {
      throw Error('Serialized variable type with id \'' +
        variable.getId() + '\' had type ' + variable.type + ', and ' +
        'does not match variable field that references it: ' +
        Blockly.Xml.domToText(xml) + '.')
    }
  }
  this.setValue(variable.name)
}


/**
 * Create and show a text input editor that is a prompt (usually a popup).
 * Mobile browsers have issues with in-line textareas (focus and keyboards).
 * @private
 */
ezP.FieldVariable.Identifier.prototype.showPromptEditor_ = function () {
  var fieldText = this
  var prompt = ezP.Msg.RENAME_VARIABLE_TITLE.replace('%1', this.text_)
  Blockly.prompt(prompt, this.text_,
    function (newValue) {
      if (fieldText.sourceBlock_) {
        newValue = fieldText.callValidator(newValue)
      }
      fieldText.setValue(newValue)
    })
}

/**
 * Close the editor, save the results, and dispose of the editable
 * text field's elements.
 * @return {!Function} Closure to call on destruction of the WidgetDiv.
 * @private
 */
ezP.FieldVariable.Identifier.prototype.widgetDispose_ = Blockly.FieldTextInput.prototype.widgetDispose_

/**
 * Called when focusing away from the text field.
 * @param {string} newName The new variable name.
 * @private
 * @this ezP.FieldVariable
 */
ezP.FieldVariable.Identifier.prototype.onFinishEditing_ = function (newName) {
  var oldName = this.savedValue_
  var workspace = this.sourceBlock_.workspace
  var VM = workspace.getVariable(newName)
  if (!VM) {
    goog.asserts.assert(workspace.getVariable(oldName), 'Missing variable')
    workspace.renameVariable(oldName, newName)
  }
  var allBlocks = workspace.getAllBlocks()
  for (var _ = 0, B; B = allBlocks[_++];) {
    var field = B.ezp.fieldIdentifier
    if (field && field.getValue() === oldName) {
      field.setValue(newName)
    }
  }
}

/**
 * Create and show a text input editor that sits directly over the text input.
 * @param {boolean} quietInput True if editor should be created without
 *     focus.
 * @private
 */
ezP.FieldVariable.Identifier.prototype.showInlineEditor_ = function(optQuietInput) {
  this.savedValue_ = this.getValue()
  ezP.FieldVariable.Identifier.superClass_.showInlineEditor_.call(this, optQuietInput)
}
  

/**
 * Class for a variable's annotation field.
 * @param {?string} varname The default name for the variable.  If null,
 *     a unique variable name will be generated.
 * @param {Function=} optValidator A function that is executed when a new
 *     option is selected.  Its sole argument is the new option value.
 * @param {Array.<string>} optVariableTypes A list of the types of variables to
 *     include in the dropdown.
 * @extends {ezP.FieldCodeInput}
 * @constructor
 */
ezP.FieldVariable.Annotation = function (annotation, optValidator) {
  ezP.FieldVariable.Annotation.superClass_.constructor.call(this, annotation, optValidator)
}
goog.inherits(ezP.FieldVariable.Annotation, ezP.FieldCodeInput)

/**
 * Class for a variable's default field.
 * @param {?string} varname The default name for the variable.  If null,
 *     a unique variable name will be generated.
 * @param {Function=} optValidator A function that is executed when a new
 *     option is selected.  Its sole argument is the new option value.
 * @param {Array.<string>} optVariableTypes A list of the types of variables to
 *     include in the dropdown.
 * @extends {ezP.FieldCodeInput}
 * @constructor
 */
ezP.FieldVariable.Default = function (def, optValidator) {
  ezP.FieldVariable.Default.superClass_.constructor.call(this, def, optValidator)
}
goog.inherits(ezP.FieldVariable.Default, ezP.FieldCodeInput)
