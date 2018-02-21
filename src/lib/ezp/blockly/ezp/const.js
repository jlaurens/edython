/**
 * ezPython
 *
 * Copyright 2017 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview Constants for ezPython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

/**
 * @name ezP.Const
 * @namespace
 **/
goog.provide('ezP.Const')
goog.provide('ezP.ID')

goog.require('ezP')

// ezP.Const = ezP.Const || {}

ezP.Const.Field = {
  LABEL: 'LABEL',
  DOTS: 'DOTS',
  VALUE: 'VALUE',
  ID: 'ID',
  IDENTIFIER: 'IDENTIFIER',
  OP: 'OP',
  // IN PROGRESS
  VAR: 'VAR',
  STARS: 'STARS',
  ANN: 'ANN',
  DFT: 'DFT',
  ANY: 'ANY',
  TEXT: 'TEXT',
  TFN: 'TFN',
  STT: 'STT',
  BCP: 'BCP',
  GNL: 'GNL',
  DEF: 'DEF',
  CLASS: 'CLASS',
  NCSTR: 'NCSTR'
}
ezP.Const.Input = {
  NAME: 'NAME',
  FOR: 'FOR',
  IN: 'IN',
  IF: 'IF',
  ELSE: 'ELSE',
  ITER: 'ITER',
  COMPREHENSION: 'COMP',
  ITEM: 'ITEM', /* used by delimited blocks */
  PRIMARY: 'PRIMARY',
  ATTRIBUTE: 'ATTRIBUTE',
  SLICE: 'SLICE',
  ARG: 'ARG',
  FIRST: 'FIRST',
  SECOND: 'SECOND',
  LIST: 'LIST',
  WRAP: 'WRAP',
  KEY: 'KEY',
  DATUM: 'DATUM',
  LOWER_BOUND: 'LOWER_BOUND',
  UPPER_BOUND: 'UPPER_BOUND',
  STRIDE: 'STRIDE',
  EXPR: 'EXPR',// = ANY? NO!
  TARGET: 'TARGET',
  ANNOTATED: 'ANNOTATED',
  ASSIGNED: 'ASSIGNED',
  LHS: 'LHS',
  RHS: 'RHS',
  OPTION: 'OPTION',
  ASSERT: 'ASSERT',
  RAISE: 'RAISE',
  FROM: 'FROM',
  MODULE: 'MODULE',
  IMPORT: 'IMPORT',
  NAME: 'NAME',
  IDENTIFIER: 'IDENTIFIER',
  DO: 'DO',
  AS: 'AS',
  SOURCE: 'SOURCE',
  MODULE: 'MODULE',
  POWER: 'POWER',
  END: 'END',
  COMMENT: 'COMMENT',
  NUMBER: 'NUMBER',
  STRING: 'STRING',
  LONG_STRING: 'LONG_STRING',
  // IN PROGRESS
  ANY: 'ANY',
  SEP: 'SEP',
  END: 'END',
  FILE: 'FILE',
  FLUSH: 'FLUSH',
  OPTIONS: 'OPTIONS',
  COND: 'COND',
  TGT: 'TGT',
  LST: 'LST',// TODO: Change that to 'LIST'
  VAR: 'VAR',
  ANN: 'ANN',
  DFT: 'DFT',
  ID: 'ID',
}

ezP.Op = {
  Unary: {
    displayOp: function (op) {
      if (op === 'not') {
        return op + ' '
      }
      return op
    },
    getOrder: function (op) {
      return {
        '+': Blockly.Python.ORDER_UNARY_SIGN,
        '-': Blockly.Python.ORDER_UNARY_SIGN,
        '~': Blockly.Python.ORDER_BITWISE_NOT,
        'not': Blockly.Python.ORDER_LOGICAL_NOT
      }[op]
    }
  },
  Binary: {
    displayOp: function (op) {
      /* if (true ['and', 'or', 'in', 'not in', 'is', 'is not'].indexOf(op) >=0) {
        return ' ' + op + ' '
      } */
      return ' ' + op + ' '
    },
    getOrder: function (op) {
      return {
        '+': Blockly.Python.ORDER_ADDITIVE,
        '-': Blockly.Python.ORDER_ADDITIVE,
        '*': Blockly.Python.ORDER_MULTIPLICATIVE,
        '**': Blockly.Python.ORDER_EXPONENTIATION,
        '/': Blockly.Python.ORDER_MULTIPLICATIVE,
        '//': Blockly.Python.ORDER_MULTIPLICATIVE,
        '%': Blockly.Python.ORDER_MULTIPLICATIVE,
        '&': Blockly.Python.ORDER_BITWISE_AND,
        '|': Blockly.Python.ORDER_BITWISE_OR,
        '^': Blockly.Python.ORDER_BITWISE_XOR,
        '<<': Blockly.Python.ORDER_BITWISE_SHIFT,
        '>>': Blockly.Python.ORDER_BITWISE_SHIFT,
        'and': Blockly.Python.ORDER_LOGICAL_AND,
        'or': Blockly.Python.ORDER_LOGICAL_OR,
        '<': Blockly.Python.ORDER_RELATIONAL,
        '<=': Blockly.Python.ORDER_RELATIONAL,
        '>': Blockly.Python.ORDER_RELATIONAL,
        '>=': Blockly.Python.ORDER_RELATIONAL,
        '!=': Blockly.Python.ORDER_RELATIONAL,
        '===': Blockly.Python.ORDER_RELATIONAL,
        '<>': Blockly.Python.ORDER_RELATIONAL,
        'in': Blockly.Python.ORDER_RELATIONAL,
        'not in': Blockly.Python.ORDER_RELATIONAL,
        'is': Blockly.Python.ORDER_RELATIONAL,
        'is not': Blockly.Python.ORDER_RELATIONAL
      }[op]
    }
  }
}

ezP.Const.Event = {
  input_disable: 'ezp_input_disable',
  change_operator: 'ezp_change_operator',
  change_import_model: 'ezp_change_import_model',
}