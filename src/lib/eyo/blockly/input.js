/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview Input extension for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Input')

goog.require('eYo')
goog.require('Blockly.Input')

/**
 * Add an eyo object to an input to store extra information.
 * All this extra information is gathered under a dedicated namespace
 * to avoid name collisions.
 * This is not a delegate because there are few informations or actions needed.
 * Subclassing would not fit here.
 * For edython.
 * @param {!Blockly.Input} workspace The block's workspace.
 */
eYo.Input.setupEyO = (function () {
  var beReady = function () {
    var c8n = this.owner.connection
    c8n && c8n.eyo.beReady()
  }
  return function (input) {
    if (!input.eyo) {
      input.eyo = {
        owner: input,
        beReady: beReady
      }
      var c8n = input.connection
      if (c8n) {
        c8n.eyo.name_ = input.name // the connection remembers the name of the input such that checking is fine grained.
      }
    }
  }
}())

Blockly.Input.prototype.eyo = undefined

/**
 * Sets whether this input is visible or not.
 * Used to collapse/uncollapse a block.
 * Overriden to remve the `style.display` use.
 * Only the display attribute.
 * @param {boolean} visible True if visible.
 * @return {!Array.<!Blockly.Block>} List of blocks to render.
 * @suppress {accessControls}
 */
Blockly.Input.prototype.setVisible = function (visible) {
  var renderList = []
  if (this.visible_ == visible) {
    return renderList
  }
  this.visible_ = visible

  for (var y = 0, field; field = this.fieldRow[y]; y++) {
    field.setVisible(visible)
  }
  if (this.connection) {
    // Has a connection.
    if (visible) {
      renderList = this.connection.unhideAll()
    } else {
      this.connection.hideAll()
    }
    var child = this.connection.targetBlock()
    if (child) {
      if (visible) {
        child.getSvgRoot().removeAttribute('display')
        if (child.eyo.svgContourGroup_) {
          child.eyo.svgContourGroup_.removeAttribute('display')
          child.eyo.svgShapeGroup_.removeAttribute('display')
        }
      } else {
        child.getSvgRoot().setAttribute('display', 'none')
        if (child.eyo.svgContourGroup_) {
          child.eyo.svgContourGroup_.setAttribute('display', 'none')
          child.eyo.svgShapeGroup_.setAttribute('display', 'none')
        }
        child.rendered = false
      }
      // JL: Almost original code.
      // var display = visible ? 'block' : 'none';
      // child.getSvgRoot().style.display = display;
      // if (!visible) {
      //   child.rendered = false;
      // }
    }
  }
  return renderList
}
