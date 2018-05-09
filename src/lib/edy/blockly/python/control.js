/**
 * ezPython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview Generating Python for value blocs.
 * @author jerome.laurensu-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('edY.Python.start_stmt')

goog.require('edY.DelegateSvg.start_stmt')

Blockly.Python[edY.T3.start_stmt] = function (block) {
  return '# main'
}
