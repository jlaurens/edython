/**
 * ezPython
 *
 * Copyright 2017 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview Non-editable text field for hard coded python code.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('ezP.FieldLabel')

goog.require('Blockly.FieldLabel')
goog.require('ezP.Block')

/**
 * Class for a non-editable field.
 * The only purpose is to start with a different height.
 * @param {string} text The initial content of the field.
 * @param {string=} optClass Optional CSS class for the field's text.
 * @extends {Blockly.Field}
 * @constructor
 */
ezP.FieldLabel = function (text, optClass) {
  ezP.FieldLabel.superClass_.constructor.call(this, text, optClass)
  this.size_ = new goog.math.Size(0, ezP.Font.height)
  this.ezpData = {}
}
goog.inherits(ezP.FieldLabel, Blockly.FieldLabel)

/**
 * Install this text on a block.
 */
ezP.FieldLabel.prototype.init = function () {
  if (this.textElement_) {
    // Text has already been initialized once.
    return
  }
  // Build the DOM.
  this.textElement_ = Blockly.utils.createSvgElement('text',
    {'class': 'ezp-label', 'y': ezP.Font.totalAscent}, null)
  if (this.class_) {
    goog.dom.classlist.add(this.textElement_, this.class_)
  }
  if (this.ezpData.css_class) {
    goog.dom.classlist.add(this.textElement_, this.ezpData.css_class)
  }
  if (!this.visible_) {
    this.textElement_.style.display = 'none'
  }
  this.sourceBlock_.getSvgRoot().appendChild(this.textElement_)

  // Configure the field to be transparent with respect to tooltips.
  this.textElement_.tooltip = this.sourceBlock_
  Blockly.Tooltip.bindMouseEvents(this.textElement_)
  // Force a render.
  this.render_()
}

/**
 * Shortcut for appending a dummy input with one label field.
 * @param {string=} opt_name Language-neutral identifier which may used to find
 *     this input again.  Should be unique to this block.
 * @return {!Blockly.Input} The input object created.
 */
ezP.Block.prototype.appendLabeledInput = function (label) {
  return this.appendInput_(Blockly.DUMMY_INPUT, '_').appendField(new ezP.FieldLabel(label))
}

/**
 * Updates the width of the field. This calls getCachedWidth which won't cache
 * the approximated width on IE/Edge when `getComputedTextLength` fails. Once
 * it eventually does succeed, the result will be cached.
 **/
Blockly.Field.prototype.updateWidth = function () {
  var width = Blockly.Field.getCachedWidth(this.textElement_)
  if (this.borderRect_) {
    this.borderRect_.setAttribute('width', width)
  }
  this.size_.width = width
}
