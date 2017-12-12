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

goog.provide('ezP.Python.ezp-val');

goog.require('Blockly.Python');
goog.require('ezP.Const');

Blockly.Python.INDENT = '    ';

ezP.Python.valueToCode = function(block, name, outerOrder) {
    var code = Blockly.Python.valueToCode(block, name, outerOrder);
    if (code.slice(0, 1)=='(' && code.slice(-1)==')') {
       var sub = code.slice(1,code.length-1);
       if (!sub.match(/[+\-*\\\/%@<>&|^~=!()[]{},:;@ ]/g)) {
           return sub;
       }
    }
    return code;
}

Blockly.Python[ezP.Const.Val.GET] = function (block) {
    var code = block.getField(ezP.Const.Field.VAR).getText();
    return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python[ezP.Const.Val.ANY] = function (block) {
    var code = block.getFieldValue(ezP.Const.Field.ANY);
    return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python[ezP.Const.Val.TEXT] = function (block) {
    var code = Blockly.Python.quote_(block.getFieldValue(ezP.Const.Field.TEXT));
    return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python[ezP.Const.Val.TFN] = function (block) {
    var code = block.getFieldValue(ezP.Const.Field.TFN);
    return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python[ezP.Const.Val.OP] = function (block) {
    var op = block.getFieldValue(ezP.Const.Field.OP);
    var order = ezP.Op.Binary.getOrder(op);
    var lhs = ezP.Python.valueToCode(block, ezP.Const.Input.LHS,
        order || Blockly.Python.ORDER_ATOMIC) || 'MISSING_LHS';
    var rhs = ezP.Python.valueToCode(block, ezP.Const.Input.RHS,
        order || Blockly.Python.ORDER_ATOMIC) || 'MISSING_RHS';
    return [lhs + ezP.Op.Binary.displayOp(op) + rhs, order || Blockly.Python.ORDER_NONE];
};

Blockly.Python[ezP.Const.Val.UNRY] = function (block) {
    var op = block.getFieldValue(ezP.Const.Field.OP);
    var order = ezP.Op.Unary.getOrder(op);
    var any = ezP.Python.valueToCode(block, ezP.Const.Input.ANY,
        order || Blockly.Python.ORDER_NONE) || 'MISSING_ANY';
    return [ezP.Op.Unary.displayOp(op) + any, order];
};

Blockly.Python[ezP.Const.Val.BOOL] = Blockly.Python[ezP.Const.Val.OP];

Blockly.Python[ezP.Const.Val.TUPLE] = function (block) {
    var ezp = block.ezp;
    var max = ezp.getInputTupleMax(block,0);
    var l = [];
    var i = 0;
    var x;
    while (!max || i<max) {
        var name = 'TUPLE_0_' + i;
        var input = Blockly.Block.prototype.getInput.call(block,name);
        if (input) {
            var x = ezP.Python.valueToCode(block, name, Blockly.Python.ORDER_COLLECTION);
            l.push(x.length? x: ('MISSING_' + name));
            ++i;
            continue;
        }
        break;
    }
    return [l.join(', '), Blockly.Python.ORDER_COLLECTION];
};

Blockly.Python[ezP.Const.Val.RANGE] = function(block) {
    var code = Blockly.Python[ezP.Const.Val.TUPLE](block);
    return ['range('+ code[0] + ')', Blockly.Python.ORDER_FUNCTION_CALL];
}
