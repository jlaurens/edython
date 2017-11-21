/**
 * @license
 * ezPython
 *
 * Copyright 2017 Jérôme LAURENS.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview General python support.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict';

goog.provide('EZP.Python');

goog.require('EZP');

/*
 * List of all the python keywords as given by
 * import keyword; print(keyword.kwlist)
 * as of Python 3.5.
 * @const{!Dict} of arrays of keyworks gathered by length
 * @author{Jérôme LAURENS}
 *
 */
 EZP.Python.KWs = [[],[],
  ['as', 'if', 'in', 'is', 'or'],
  ['and', 'def', 'del', 'for', 'not', 'try'],
  ['None', 'True', 'elif', 'else', 'from', 'pass', 'with'],
  ['False', 'break', 'class', 'raise', 'while', 'yield'],
  ['assert', 'except', 'global', 'import', 'lambda', 'return'],
  ['finally'],
  ['continue', 'finally', 'nonlocal']];

/**
 * Whereas a string is a python keyword.
 * @param {string} type The type of the connection.
 */
EZP.Python.isKeyword = function(s) {
  var KWs = EZP.Python.KWs[s.length];
  return KWs && KWs.indexOf(s)>=0;
};
