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

Blockly.Blocks['ezp_xpr_fake_comprehension'] = {
  init: function () {
    this.appendDummyInput().appendField(new ezP.FieldLabel('comprehension'))
    this.setOutput(true, [ezP.T3.comprehension])
  }
}

Blockly.Blocks['ezp_xpr_fake_dict_comprehension'] = {
  init: function () {
    this.appendDummyInput().appendField(new ezP.FieldLabel('dict_comprehension'))
    this.setOutput(true, [ezP.T3.dict_comprehension])
  }
}

Blockly.Blocks['ezp_xpr_fake_atom'] = {
  init: function () {
    this.appendDummyInput().appendField(new ezP.FieldLabel('atom'))
    this.setOutput(true, ezP.T3.atom)
  }
}

Blockly.Blocks['ezp_xpr_fake_key_datum'] = {
  init: function () {
    this.appendDummyInput().appendField(new ezP.FieldLabel('key_datum'))
    this.setOutput(true, ezP.T3.key_datum)
  }
}

Blockly.Blocks['ezp_xpr_fake_comp_for'] = {
  init: function () {
    this.appendDummyInput().appendField(new ezP.FieldLabel('comp_for'))
    this.setOutput(true, ezP.T3.comp_for)
  }
}

Blockly.Blocks['ezp_xpr_fake_comp_if'] = {
  init: function () {
    this.appendDummyInput().appendField(new ezP.FieldLabel('comp_if'))
    this.setOutput(true, ezP.T3.comp_if)
  }
}

Blockly.Blocks['ezp_xpr_fake_or_test'] = {
  init: function () {
    this.appendDummyInput().appendField(new ezP.FieldLabel('or_test'))
    this.setOutput(true, ezP.T3.Require.or_test)
  }
}

Blockly.Blocks['ezp_xpr_fake_target_list'] = {
  init: function () {
    this.appendDummyInput().appendField(new ezP.FieldLabel('target_list'))
    this.setOutput(true, ezP.T3.Require.target_list)
  }
}

Blockly.Blocks['ezp_xpr_fake_expression'] = {
  init: function () {
    this.appendDummyInput().appendField(new ezP.FieldLabel('expression'))
    this.setOutput(true, ezP.T3.Require.expression)
  }
}
