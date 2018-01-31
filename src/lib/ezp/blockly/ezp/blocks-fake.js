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

var make_fake = function(key, label, type) {
  goog.asserts.assert(type, 'Cannot make a fake block with no type.')
  Blockly.Blocks[key] = {
    init: function () {
      this.appendDummyInput().appendField(new ezP.FieldLabel(label))
      this.setOutput(true, [type])
    }
  }
}

make_fake('ezp_expr_fake_comprehension','comprehension',ezP.T3.comprehension)
make_fake('ezp_expr_fake_dict_comprehension','dict_comprehension',ezP.T3.dict_comprehension)
make_fake('ezp_expr_fake_atom','atom',ezP.T3.atom)
make_fake('ezp_expr_fake_key_datum','key_datum',ezP.T3.key_datum)
make_fake('ezp_expr_fake_key_datum_concrete','key_datum_concrete',ezP.T3.key_datum_concrete)
make_fake('ezp_expr_fake_starred_or_expr','or_expr_starred',ezP.T3.or_expr_starred)
make_fake('ezp_expr_fake_comp_for','comp_for',ezP.T3.comp_for)
make_fake('ezp_expr_fake_comp_if','comp_if',ezP.T3.comp_if)
make_fake('ezp_expr_fake_or_test','or_test',ezP.T3.Require.or_test)
make_fake('ezp_expr_fake_target_list','target_list',ezP.T3.target_list)
make_fake('ezp_expr_fake_target','target',ezP.T3.target)
make_fake('ezp_expr_fake_expression','expression',ezP.T3.Require.expression)
make_fake('ezp_expr_fake_expression','expression',ezP.T3.Require.expression)
make_fake('ezp_expr_fake_identifier','identifier',ezP.T3.identifier)
make_fake('ezp_expr_fake_expression_starred','*expression',ezP.T3.expression_starred)
make_fake('ezp_expr_fake_keyword_item','key = value',ezP.T3.keyword_item)
make_fake('ezp_expr_fake_expression_double_starred','**expression',ezP.T3.expression_double_starred)
make_fake('ezp_expr_fake_parameter_default','parameter=default',ezP.T3.parameter_default)
make_fake('ezp_expr_fake_parameter_starred','*parameter',ezP.T3.parameter_starred)
make_fake('ezp_expr_fake_parameter_double_starred','**parameter',ezP.T3.parameter_double_starred)

Blockly.Blocks['ezp_expr_fake_with_wrapped'] = {
  init: function () {
    this.ezp.initBlock(this)
  }
}

Blockly.Blocks['ezp_expr_fake_wrapped'] = {
  init: function () {
    this.ezp.initBlock(this)
  }
}


