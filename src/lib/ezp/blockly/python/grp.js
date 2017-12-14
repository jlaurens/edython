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
 * @fileoverview Generating Python for group blocs.
 * @author jerome.laurensu-bourgogne.fr (Jérôme LAURENS)
 */
'use strict';

goog.provide('ezP.Python.ezp-grp');

goog.require('ezP.Python.ezp-stt');

Blockly.Python[ezP.Const.Grp.ANY] = function (block) {
    var STT = block.getField(ezP.Const.Field.STT).getText();
    var branch = Blockly.Python.statementToCode(block, 'DO');
    if (!branch.length) {
        branch = Blockly.Python.prefixLines(/** @type {string} */('MISSING_STATEMENT\n'), Blockly.Python.INDENT);
    }
    return STT.length ? STT : 'MISSING_STATEMENT' + ':\n' + branch;
};

Blockly.Python[ezP.Const.Grp.IF] = function (block) {
    var COND = ezP.Python.valueToCode(block, ezP.Const.Input.COND,
        Blockly.Python.ORDER_NONE);
    var branch = Blockly.Python.statementToCode(block, 'DO');
    if (!branch.length) {
        branch = Blockly.Python.prefixLines(/** @type {string} */('MISSING_STATEMENT\n'), Blockly.Python.INDENT);
    }
    return 'if ' + (COND.length ? COND : 'MISSING_CONDITION') + ':\n' + branch;
};

Blockly.Python[ezP.Const.Grp.ELIF] = function (block) {
    var COND = ezP.Python.valueToCode(block, ezP.Const.Input.COND,
        Blockly.Python.ORDER_NONE);
    var branch = Blockly.Python.statementToCode(block, 'DO');
    if (!branch.length) {
        branch = Blockly.Python.prefixLines(/** @type {string} */('MISSING_STATEMENT\n'), Blockly.Python.INDENT);
    }
    return 'elif ' + (COND.length ? COND : 'MISSING_CONDITION') + ':\n' + branch;
};

Blockly.Python[ezP.Const.Grp.ELSE] = function (block) {
    var branch = Blockly.Python.statementToCode(block, 'DO');
    if (!branch.length) {
        branch = Blockly.Python.prefixLines(/** @type {string} */('MISSING_STATEMENT\n'), Blockly.Python.INDENT);
    }
    return 'else:\n' + branch
};

Blockly.Python[ezP.Const.Grp.WHILE] = function (block) {
    var COND = ezP.Python.valueToCode(block, ezP.Const.Input.COND,
        Blockly.Python.ORDER_NONE);
    var branch = Blockly.Python.statementToCode(block, 'DO');
    if (!branch.length) {
        branch = Blockly.Python.prefixLines(/** @type {string} */('MISSING_STATEMENT\n'), Blockly.Python.INDENT);
    }
    return 'while' + (COND.length ? COND : 'MISSING_CONDITION') + ':\n' + branch;
};

Blockly.Python[ezP.Const.Grp.FOR] = function (block) {
    var target = ezP.Python.valueToCode(block, ezP.Const.Input.TGT,
        Blockly.Python.ORDER_NONE);
    var list = ezP.Python.valueToCode(block, ezP.Const.Input.LST,
        Blockly.Python.ORDER_NONE);
    var branch = Blockly.Python.statementToCode(block, ezP.Const.Input.DO);
    if (!branch.length) {
        branch = Blockly.Python.prefixLines(/** @type {string} */('MISSING_STATEMENT\n'), Blockly.Python.INDENT);
    }
    return 'for ' + (target.length ? target : 'MISSING_TARGET') + ' in ' + (list.length ? list : 'MISSING_LIST') + ':\n' + branch;
};
