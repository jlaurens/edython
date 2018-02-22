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

goog.provide('ezP.Blocks.val')

goog.require('Blockly.Blocks')
goog.require('ezP.T3.All')

for (var i = 0; i < ezP.T3.All.core_expressions.length; ++i) {
  var t = ezP.T3.All.core_expressions[i]
  Blockly.Blocks[t] = {}
}

for (var i = 0; i < ezP.T3.All.lists.length; ++i) {
  var t = ezP.T3.All.lists[i]
  Blockly.Blocks[t] = {}
}

for (var i = 0; i < ezP.T3.All.wrappers.length; ++i) {
  var t = ezP.T3.All.wrappers[i]
  Blockly.Blocks[t] = {}
}
