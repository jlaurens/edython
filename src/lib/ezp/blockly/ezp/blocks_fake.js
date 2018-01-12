/**
 * ezPython
 *
 * Copyright 2017 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview Blocks for ezPython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('ezP.Blocks.fake')

goog.require('Blockly.Block')
goog.require('ezP.Const')
goog.require('ezP.Type')
goog.require('ezP.FieldLabel')

Blockly.Blocks['ezp_xpr_comprehension_fake'] = {
  init: function () {
    this.appendDummyInput().appendField(new ezP.FieldLabel('comprehension'))
    this.setOutput(true, [ezP.T3.comprehension])
  }
}

Blockly.Blocks['ezp_xpr_atom_fake'] = {
  init: function () {
    this.appendDummyInput().appendField(new ezP.FieldLabel('atom'))
    this.setOutput(true, ezP.T3.atom)
  }
}

Blockly.Blocks['ezp_xpr_key_datum_fake'] = {
  init: function () {
    this.appendDummyInput().appendField(new ezP.FieldLabel('key_datum'))
    this.setOutput(true, ezP.T3.key_datum)
  }
}
