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

ezP.Const.Stmt = {
  expression_stmt: 'ezp_stmt_expression_stmt',
  assignment_stmt: 'ezp_stmt_assignment_stmt',
  augmented_assignment_stmt: 'ezp_stmt_augmented_assignment_stmt',
  annotated_assignment_stmt: 'ezp_stmt_annotated_assignment_stmt',
  assert_stmt: 'ezp_stmt_assert_stmt',
  pass_stmt: 'ezp_stmt_pass_stmt',
  continue_stmt: 'ezp_stmt_continue_stmt',
  break_stmt: 'ezp_stmt_break_stmt',
  del_stmt: 'ezp_stmt_del_stmt',
  return_stmt: 'ezp_stmt_return_stmt',
  yield_stmt: 'ezp_stmt_yield_stmt',
  raise_stmt: 'ezp_stmt_raise_stmt',
  // in progress



  DEFAULT: 'ezp_stmt',
  ANY: 'ezp_stmt_any',
  SET: 'ezp_stmt_set',
  PRINT: 'ezp_stmt_print',
  BCP: 'ezp_stmt_bcp',
  GNL: 'ezp_stmt_gnl',
  DEL: 'ezp_stmt_del'

}

ezP.Const.Expr = {
  parenth_form: 'ezp_expr_parenth_form',
  starred_item_list: 'ezp_expr_starred_item_list',
  list_display: 'ezp_expr_list_display',
  set_display: 'ezp_expr_set_display',
  dict_display: 'ezp_expr_dict_display',
  comprehension: 'ezp_expr_comprehension',
  generator_expression: 'ezp_expr_generator_expression',
  target_list: 'ezp_expr_target_list',
  yield_atom: 'ezp_expr_yield_atom',
  yield_from: 'ezp_expr_yield_from',
  yield_expression: 'ezp_expr_yield_expression',
  expression_or_from_list: 'ezp_expr_expression_or_from_list',
  expression_list: 'ezp_expr_expression_list',
  starred_list_comprehensive: 'ezp_expr_starred_list_comprehensive',
  non_void_starred_list_comprehensive: 'ezp_expr_non_void_starred_list_comprehensive',
  or_expr_starred: 'ezp_expr_starred_or_expr',
  key_datum_concrete: 'ezp_expr_key_datum_concrete',
  or_expr_double_starred: 'ezp_expr_double_starred_or_expr',
  key_datum_list_comprehensive: 'ezp_expr_key_datum_list_comprehensive',
  comp_for: 'ezp_expr_comp_for',
  comp_if: 'ezp_expr_comp_if',
  comp_iter_list: 'ezp_expr_comp_iter_list',
  attributeref: 'ezp_expr_attributeref',
  dot_identifier: 'ezp_expr_dot_identifier',
  slicing: 'ezp_expr_slicing',
  display_slice_list: 'ezp_expr_display_slice_list',
  slice_list: 'ezp_expr_slice_list',
  proper_slice: 'ezp_expr_proper_slice',
  call: 'ezp_expr_call',
  argument_list: 'ezp_expr_argument_list',
  parameter_list: 'ezp_expr_parameter_list',
  await_expr: 'ezp_expr_await_expr',
  // u_expr_concrete: 'ezp_expr_u_expr_concrete',
  // m_expr_concrete: 'ezp_expr_m_expr_concrete',
  // a_expr_concrete: 'ezp_expr_a_expr_concrete',
  // shift_expr_concrete: 'ezp_expr_shift_expr_concrete',
  // and_expr_concrete: 'ezp_expr_and_expr_concrete',
  unary_concrete: 'ezp_expr_unary_concrete',
  algebra_concrete: 'ezp_expr_algebra_concrete',
  bitwise_concrete: 'ezp_expr_bitwise_concrete',
  boolean_concrete: 'ezp_expr_boolean_concrete',
  comparison_concrete: 'ezp_expr_comparison_concrete',
  conditional_expression_concrete: 'ezp_expr_conditional_expression_concrete',
  lambda_expr: 'ezp_expr_lambda_expr',
  lambda_expr_nocond: 'ezp_expr_lambda_expr_nocond',
  assignment_expression: 'ezp_expr_assignment_expression',
  augmented_assignment_expression: 'ezp_expr_augmented_assignment_expression',
  // in progress

  star_or_expr: 'ezp_expr_star_or_expr',
  parameter: 'ezp_expr_parameter',
  defparameter: 'ezp_expr_defparameter',
  atom: 'ezp_expr_atom',
  LITERAL: 'ezp_expr_literal', // NYI
  DEFAULT: 'ezp_expr',
  ANY: 'ezp_expr_any',
  GET: 'ezp_expr_get',
  TEXT: 'ezp_expr_text',
  TFN: 'ezp_expr_tfn',
  OP: 'ezp_expr_op',
  UNRY: 'ezp_expr_unry',
  BOOL: 'ezp_expr_bool',
  TUPLE: 'ezp_expr_tuple',
  RANGE: 'ezp_expr_range',
  MINUS: 'ezp_expr_minus',

}

// Alias
ezP.Const.Expr.starred_expression = ezP.Const.Expr.starred_item_list

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
  LABEL: 'LABEL',
  // IN PROGRESS
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
  FOR: 'FOR',
  IN: 'IN',
  IF: 'IF',
  ELSE: 'ELSE',
  FORIN: 'FORIN',
  ITER: 'ITER',
  COMPREHENSION: 'COMP',
  ITEM: 'ITEM', /* used by delimited blocks */
  PRIMARY: 'PRIMARY',
  SECONDARY: 'SECONDARY',
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
  DO: 'DO',
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
}