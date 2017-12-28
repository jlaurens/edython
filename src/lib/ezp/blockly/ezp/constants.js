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

ezP.Const.Val = {
  DEFAULT: 'ezp_val',
  ANY: 'ezp_val_any',
  GET: 'ezp_val_get',
  TEXT: 'ezp_val_text',
  TFN: 'ezp_val_tfn',
  OP: 'ezp_val_op',
  UNRY: 'ezp_val_unry',
  BOOL: 'ezp_val_bool',
  TUPLE: 'ezp_val_tuple',
  RANGE: 'ezp_val_range',
  MINUS: 'ezp_val_minus',
  PARENTH: 'ezp_val_parenth', // NYI
  COMP: 'ezp_val_comp', // NYI
  COMPFOR: 'ezp_val_compfor', // NYI
  COMPIF: 'ezp_val_compif', // NYI
  LITERAL: 'ezp_val_literal', // NYI
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
  DO: 'DO'
}
// Connection types
ezP.Check = ezP.Check || {}

ezP.Check.val = {
  require_any: [0],
  provide_any: [0]
}

/*
In the first column the statement before.
X means that the statement is forbidden
for example, there must not be 2 consecutive else clauses.
        any   if    elif  else  loop
any     O     O     X     X     O
if      O     O     O     O     O
elif    O     O     O     O     O
else    O     O     X     X     O
loop    O     O     X     O     O
*/
/* bounded means elif and else groups
 * any means everything else,
 * loop means for or while
 * all means everything. */
ezP.Check.type = {
  any_all: 0,
  if_elif: 1,
  if_elif_bounded: 2,
  if_else: 3,
  loop_else: 4
}
ezP.Check.stt = {
  none: [-1],
  after_any: [ezP.Check.type.any_all],
  before_any: [ezP.Check.type.any_all],
  after_if: [ezP.Check.type.any_all,
    ezP.Check.type.if_elif,
    ezP.Check.type.if_else],
  before_if: [ezP.Check.type.any_all],
  after_elif: [ezP.Check.type.any_all,
    ezP.Check.type.if_elif,
    ezP.Check.type.if_else],
  before_elif: [ezP.Check.type.if_elif],
  after_else: [ezP.Check.type.any_all],
  before_else: [ezP.Check.type.if_else,
    ezP.Check.type.loop_else],
  before_if_else: [ezP.Check.type.if_else],
  before_loop_else: [ezP.Check.type.loop_else],
  after_loop: [ezP.Check.type.any_all,
    ezP.Check.type.loop_else],
  before_loop: [ezP.Check.type.any_all]
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
