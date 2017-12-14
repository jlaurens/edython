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
 * @fileoverview Generating Python for value blocs.
 * @author jerome.laurensu-bourgogne.fr (Jérôme LAURENS)
 */
'use strict';

goog.provide('ezP.Python.ezp-prc');

goog.require('ezP.Python.ezp-grp');

Blockly.Python[ezP.Const.Prc.DEF] = function (block) {
    var DEF = ezP.Python.valueToCode(block, ezP.Const.Field.DEF,
        Blockly.Python.ORDER_NONE);
    var branch = Blockly.Python.statementToCode(block, 'DO');
    if (!branch.length) {
        branch = Blockly.Python.prefixLines(/** @type {string} */('MISSING_STATEMENT\n'), Blockly.Python.INDENT);
    }
    return 'def ' + (DEF.length ? DEF : 'MISSING_DEF') + ':\n' + branch;
};

Blockly.Python[ezP.Const.Prc.CLASS] = function (block) {
    var CLASS = ezP.Python.valueToCode(block, ezP.Const.Field.CLASS,
        Blockly.Python.ORDER_NONE);
    var NCSTR = ezP.Python.valueToCode(block, ezP.Const.Field.NCSTR,
        Blockly.Python.ORDER_NONE);
    var branch = Blockly.Python.statementToCode(block, 'DO');
    if (!branch.length) {
        branch = Blockly.Python.prefixLines(/** @type {string} */('MISSING_STATEMENT\n'), Blockly.Python.INDENT);
    }
    return 'class ' + (CLASS.length ? CLASS : 'MISSING_CLASS') + '('+(NCSTR.length ? NCSTR : 'MISSING_NCSTR')+'):\n' + branch;
};
