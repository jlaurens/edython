/**
 * edython
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

goog.provide('eYo.Python.start_stmt')

goog.require('eYo.DelegateSvg.start_stmt')

Blockly.Python[eYo.T3.start_stmt] = function (block) {
  return '# main'
}
