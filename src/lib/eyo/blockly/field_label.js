/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview Non-editable text field for hard coded python code.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.FieldLabel')
goog.provide('eYo.Field.Label')

goog.require('eYo.FieldHelper')
goog.require('Blockly.FieldLabel')
goog.require('eYo.Field')
goog.require('eYo.Block')
goog.require('goog.dom');

/**
 * Class for a non-editable field.
 * The only purpose is to start with a different height.
 * @param {string} text The initial content of the field.
 * @param {string=} optClass Optional CSS class for the field's text.
 * @extends {Blockly.FieldLabel}
 * @constructor
 */
eYo.FieldLabel = function (owner, text, optClass) {
  if (owner) {
    this.eyo = owner
    owner.field_ = this
  } else {
    this.eyo = new eYo.FieldHelper(this)
  }
  eYo.FieldLabel.superClass_.constructor.call(this, text, optClass)
}
goog.inherits(eYo.FieldLabel, Blockly.FieldLabel)

Object.defineProperties(
  eYo.FieldLabel.prototype,
  {
    size_: {
      get () {
        return this.eyo.size
      },
      set (newValue) {
        this.eyo.size = new eYo.Size()
      }
    }
  }
)

/**
 * Install this text on a block.
 * @suppress{accessControls}
 */
eYo.FieldLabel.prototype.init = function () {
  if (this.textElement_) {
    // Text has already been initialized once.
    return
  }
  // Build the DOM.
  this.textElement_ = Blockly.utils.createSvgElement('text',
    {'class': 'eyo-label', 'y': eYo.Font.totalAscent}, null)
  if (this.class_) {
    goog.dom.classlist.add(this.textElement_, this.class_)
  }
  if (this.eyo.css_class) {
    goog.dom.classlist.add(this.textElement_, eYo.Do.valueOf(this.eyo.css_class, this.eyo))
  }
  if (this.eyo.slot) {
    this.eyo.slot.getSvgRoot().appendChild(this.textElement_)
  } else {
    this.sourceBlock_.getSvgRoot().appendChild(this.textElement_)
  }
  // Configure the field to be transparent with respect to tooltips.
  this.textElement_.tooltip = this.sourceBlock_
  Blockly.Tooltip.bindMouseEvents(this.textElement_)
}

/**
 * Updates the width of the field. This calls getCachedWidth which won't cache
 * the approximated width on IE/Edge when `getComputedTextLength` fails. Once
 * it eventually does succeed, the result will be cached.
 * @suppress{accessControls}
 */
Blockly.Field.prototype.updateWidth = function () {
  var width = this.eyo
  ? this.eyo.size.width
  : Blockly.Field.getCachedWidth(this.textElement_)
  if (this.borderRect_) {
    this.borderRect_.setAttribute('width', width + 2 * eYo.Style.Edit.padding_h)
  }
  this.size_.width = width
}

/**
 * Adds an anchor to let the source block's delegate know
 * when the value has changed.
 * @param {string} newValue New value.
 */
eYo.FieldLabel.prototype.setValue = function (newValue) {
  var oldValue = this.getText()
  eYo.FieldLabel.superClass_.setValue.call(this, newValue)
  if (this.name) {
    var block = this.sourceBlock_
    if (block && block.eyo.fieldValueDidChange) {
      block.eyo.fieldValueDidChange(this.name, oldValue)
    }
  }
}
