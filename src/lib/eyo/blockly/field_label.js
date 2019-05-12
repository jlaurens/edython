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

goog.require('eYo.FieldHelper')
goog.require('Blockly.FieldLabel')
goog.require('eYo.Field')
goog.require('eYo.Brick')
goog.require('goog.dom');

/**
 * Class for a non-editable field.
 * The only purpose is to start with a different height.
 * @param {string} text The initial content of the field.
 * @param {string=} optClass Optional CSS class for the field's text.
 * @extends {Blockly.FieldLabel}
 * @constructor
 */
eYo.FieldLabel = function (text, optClass) {
  this.eyo = new eYo.FieldHelper(this)
  this.eyo.isLabel = true
  eYo.FieldLabel.superClass_.constructor.call(this, text, optClass)
}
goog.inherits(eYo.FieldLabel, Blockly.FieldLabel)

/**
 * Dispose of all DOM objects belonging to this field.
 */
eYo.FieldLabel.prototype.dispose = function () {
  this.eyo.dispose()
  this.eyo = null
  eYo.FieldLabel.superClass_.dispose.call(this)
}

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
    var b_eyo = this.eyo.b_eyo
    if (b_eyo && b_eyo.fieldValueDidChange) {
      b_eyo.fieldValueDidChange(this.name, oldValue)
    }
  }
}
