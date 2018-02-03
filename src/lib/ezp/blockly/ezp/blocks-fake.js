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

for (var i = 0; i < ezP.T3.All.core_expressions.length; ++i) {
  var t = ezP.T3.All.core_expressions[i]
  var tt = ezP.Const.Expr[t]
  if (tt) {
    console.log('fake', tt)
    make_fake('ezp_fake_'+t, t, tt)
  } else {
    console.log('NO ezP.Const.Expr.', t)
  }
}

Blockly.Blocks['ezp_fake_with_wrapped'] = {
  init: function () {
    this.ezp.initBlock(this)
  }
}

Blockly.Blocks['ezp_fake_wrapped'] = {
  init: function () {
    this.ezp.initBlock(this)
  }
}


