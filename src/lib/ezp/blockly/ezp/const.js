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

goog.require('ezP')

ezP.Const = ezP.Const || {}

ezP.Const.Xpr = {
  DEFAULT: 'ezp_xpr',
  ANY: 'ezp_xpr_any',
  GET: 'ezp_xpr_get',
  TEXT: 'ezp_xpr_text',
  TFN: 'ezp_xpr_tfn',
  OP: 'ezp_xpr_op',
  UNRY: 'ezp_xpr_unry',
  BOOL: 'ezp_xpr_bool',
  TUPLE: 'ezp_xpr_tuple',
  RANGE: 'ezp_xpr_range',
  MINUS: 'ezp_xpr_minus',
  parenth_form: 'ezp_xpr_parenth',
  star_or_expr: 'ezp_xpr_star_or_expr',
  comprehension: 'ezp_xpr_comprehension',
  comp_for: 'ezp_xpr_comp_for',
  comp_if: 'ezp_xpr_comp_if',
  parameter: 'ezp_xpr_parameter',
  defparameter: 'ezp_xpr_defparameter',
  parameter_list: 'ezp_xpr_parameter_list',
  LITERAL: 'ezp_xpr_literal', // NYI
}

ezP.Const.Stt = {
  DEFAULT: 'ezp_stt',
  ANY: 'ezp_stt_any',
  SET: 'ezp_stt_set',
  PRINT: 'ezp_stt_print',
  BCP: 'ezp_stt_bcp',
  GNL: 'ezp_stt_gnl',
  DEL: 'ezp_stt_del'
}

ezP.Const.Grp = {
  DEFAULT: 'ezp_grp',
  ANY: 'ezp_grp_any',
  IF: 'ezp_grp_if',
  ELIF: 'ezp_grp_elif',
  ELSE: 'ezp_grp_else',
  FOR: 'ezp_grp_for',
  WHILE: 'ezp_grp_while',
  WITH: 'ezp_grp_with'
}

ezP.Const.Prc = {
  DEFAULT: 'ezp_prc',
  ANY: 'ezp_prc_any',
  DEF: 'ezp_prc_def',
  CLASS: 'ezp_prc_class'
}

ezP.Const.Ctl = {
  DEFAULT: 'ezp_ctl',
  MAIN: 'ezp_ctl_main'
}

ezP.Const.Field = {
  VAR: 'VAR',
  STARS: 'STARS',
  ID: 'ID',
  ANN: 'ANN',
  DFT: 'DFT',
  ANY: 'ANY',
  TEXT: 'TEXT',
  TFN: 'TFN',
  OP: 'OP',
  STT: 'STT',
  BCP: 'BCP',
  GNL: 'GNL',
  DEF: 'DEF',
  CLASS: 'CLASS',
  NCSTR: 'NCSTR'
}
ezP.Const.Input = {
  ANY: 'ANY',
  LHS: 'LHS',
  RHS: 'RHS',
  SEP: 'SEP',
  END: 'END',
  FILE: 'FILE',
  FLUSH: 'FLUSH',
  OPTIONS: 'OPTIONS',
  COND: 'COND',
  TGT: 'TGT',
  LST: 'LST',
  XPR: 'XPR',// = ANY?
  VAR: 'VAR',
  ANN: 'ANN',
  DO: 'DO',
  DFT: 'DFT',
  ID: 'ID'
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
