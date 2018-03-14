/**
 * ezPython
 *
 * Copyright 2017 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview Fake blocks for ezPython.
 * Creates fake blocks, either expression or statement blocks.
 * This is essentially for debugging purposes.
 * All the prototype names are keys in ezP.T3.Expr and
 * ezP.T3.Stmt.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('ezP.Blocks.fake')

goog.require('ezP.T3')

var Ks = ezP.T3.Expr
var k
var F = function(k) {
  return function() {
    this.appendDummyInput()
      .appendField(new ezP.FieldLabel(k))
    this.setOutput(true, k)
  }
}
for (k in Ks) {
  k = Ks[k]
  if (typeof k === 'string' || k instanceof String) {
    var prototypeName = k.replace('ezp_', 'ezp_fake_')
    Blockly.Blocks[prototypeName] = {
      init: F(k)
    }
  }
}
var Ks = ezP.T3.Stmt
var F = function(k) {
  return function() {
    this.appendDummyInput()
      .appendField(new ezP.FieldLabel(k))
    this.setOutput(true, k)
  }
}
for (k in Ks) {
  k = Ks[k]
  if (typeof k === 'string' || k instanceof String) {
    var prototypeName = k.replace('ezp_', 'ezp_fake_')
    Blockly.Blocks[prototypeName] = {
      init: F(k)
    }
  }
}
