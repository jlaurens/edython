/**
 * ezPython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview General python support.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('ezP.Python')

goog.require('ezP')

/*
 * List of all the python keywords as given by
 * import keyword; print(keyword.kwlist)
 * as of Python 3.5.
 * @const{!Dict} of arrays of keyworks gathered by length
 * @author{Jérôme LAURENS}
 *
 */
ezP.Python.KWs = [[], [],
  ['as', 'if', 'in', 'is', 'or'],
  ['and', 'def', 'del', 'for', 'not', 'try'],
  ['None', 'True', 'elif', 'else', 'from', 'pass', 'with'],
  ['False', 'break', 'class', 'raise', 'while', 'yield'],
  ['assert', 'except', 'global', 'import', 'lambda', 'return'],
  ['finally'],
  ['continue', 'finally', 'nonlocal']]

/**
 * Whereas a string is a python keyword.
 * @param {string} type The type of the connection.
 */
ezP.Python.isKeyword = function (s) {
  var KWs = ezP.Python.KWs[s.length]
  return KWs && KWs.indexOf(s) >= 0
}
