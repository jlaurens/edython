/**
 * ezPython
 *
 * Copyright 2017 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview Generating Python for value blocs.
 * @author jerome.laurensu-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('ezP.Python.main_stmt')

goog.require('ezP.DelegateSvg.main_stmt')

Blockly.Python[ezP.T3.main_stmt] = function (block) {
  return '# main'
}
