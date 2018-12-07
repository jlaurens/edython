/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview Constants for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

/**
 * @name eYo.Const
 * @namespace
 **/
goog.provide('eYo.Const')
goog.provide('eYo.ID')

goog.require('eYo.Do')
goog.asserts.assert(XRegExp, 'load XRegExp before')

eYo.Const = {
  ABOVE: 'ABOVE', // not for block definition
  BELOW: 'BELOW'
}

eYo.Const.Field = {
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

goog.provide('eYo.Key')

eYo.Key = {}

eYo.Do.readOnlyMixin(eYo.Key, {
  EYO: 'eyo',
  PLACEHOLDER: 'placeholder', // this MUST be in lower case
  TERM: 'term', // this MUST be in lower case
  TARGET: 'target',
  ASSIGNED: 'assigned',
  IDENTIFIER: 'identifier',
  EXPRESSIONS: 'expressions', // = ANY? NO!
  ARGUMENT: 'argument',
  POWER: 'power',
  FOR: 'for',
  IN: 'in',
  COMP_ITER: 'comp_iter',
  KEY: 'key',
  DATUM: 'datum',
  OPERATOR: 'operator',
  MODIFIER: 'modifier', // this MUST be in lower case
  FUTURE: 'future',
  PARAMETERS: 'parameters',
  SLICE: 'slice',
  N_ARY: 'n_ary',
  IDENTIFIERS: 'identifiers',
  
  VALUE: 'value', // this MUST be in lower case
  LIST: 'list',

  ASYNC: 'async',
  AWAIT: 'await',

  SUITE: 'suite', // this MUST be in lower case
  COMP_FOR: 'comp_for',

  IF: 'if',
  ELIF: 'elif',
  ELSE: 'else',
  WHILE: 'while',
  WITH: 'with',
  COMPREHENSION: 'comprehension',
  ITEM: 'item', /* used by delimited blocks */
  ROOT: 'root',
  ATTRIBUTE: 'attribute',
  PARENT_NAME: 'parent_name',
  TYPE: 'type',
  LOWER_BOUND: 'lower_bound',
  UPPER_BOUND: 'upper_bound',
  STRIDE: 'stride',
  ANNOTATED: 'annotated',
  LHS: 'lhs',
  RHS: 'rhs',
  ASSERT: 'assert',
  RAISE: 'raise',
  FROM: 'from',
  MODULE: 'module',
  PARENT: 'parent',
  HOLDER: 'holder',
  AS: 'as',
  SOURCE: 'source',
  DEFINITION: 'definition',
  
  // Primary delegate
  NONE: '----',
  CALL: 'call',
  CALL_EXPR: 'call_expr',
  SLICING: 'slicing',

  ROOT: 'root',
  EXPR: 'expr',
  
  BACKUP: 'backup', // this MUST be in camelcase
  ALT: 'alt', // this MUST be in camelcase

  WRAP: 'wrap',

  SEP: 'sep',
  FILE: 'file',
  FLUSH: 'flush',
  
  PREFIX: 'prefix', // lowercase
  SUFFIX: 'suffix', // lowercase
  START: 'start', // lowercase
  STEP: 'end', // lowercase
  END: 'end', // lowercase
  STOP: 'stop', // lowercase

  LABEL: 'label', // lowercase
  SEPARATOR: 'separator', // lowercase
  BIND: 'bind', // lowercase
  DATA: 'data', // lowercase
  
  CODE: 'code', // lowercase
  COMMENT: 'comment', // lowercase
  COMMENT_MARK: 'comment_mark', // lowercase
  NUMBER: 'number', // lowercase
  STRING: 'string', // lowercase
  LONG_STRING: 'longString', // lowercase

  LEFT: 'left',
  RIGHT: 'right',

  // IN PROGRESS
  ANY: 'ANY',

  OPTIONS: 'OPTIONS',
  COND: 'COND',
  VAR: 'VAR',
  ANN: 'ANN',
  DFT: 'DFT',
  ID: 'ID',
  // model variants keys
  NAME: 'name',
  DOTTED_NAME: 'dotted_name',
  STAR: 'star',
  STAR_NAME: 'star_name',
  STAR_STAR_NAME: 'star_star_name',
  ALIASED: 'as_alias',
  ANNOTATED: 'annotated',
  DEFINED: 'defined',
  ANNOTATED_DEFINED: 'annotated_defined',
  
  EXPRESSION: 'expression',
  
  IMPORT: 'import',
  FROM_MODULE_IMPORT: 'from_module_import',
  FROM_MODULE_IMPORT_STAR: 'from_module_import_star',

  GLOBAL: 'global',
  NONLOCAL: 'nonlocal',
  DEL: 'del',
  RETURN: 'return',
  
  PASS: 'pass',
  CONTINUE: 'continue',
  BREAK: 'break',

  // types of model items. All in lowercase letters!!!
  FUNCTION: 'function',
  METHOD: 'method',
  CLASS: 'class',
  STATICMETHOD: 'staticmethod',
  CLASSMETHOD: 'classmethod',
  PROPERTY: 'property',
  
  GETTER: 'getter',
  SETTER: 'setter',
  DELETER: 'deleter',
  
  UNARY: 'unary',
  BINARY: 'binary',
  
  NAME_EXPRESSIONS: 'name_expressions',
  TARGET_EXPRESSIONS: 'target_expressions',

  DOTTED_NAME: 'dotted_name',
  
  CODE: 'code',
  CODE_COMMENT: 'code_comment',
  
  /*
"LIST", "EXPRESSION", "FOR", "ITER", "IN", "IF", "COMP", "BLOCK", "ATTRIBUTE", "LOWER_BOUND", "UPPER_BOUND", "STRIDE", "KEY", "VALUE", "ARGUMENT", "POWER", "RHS", "LHS", "ELSE", "DATUM", "IMPORT", "SOURCE", "AS", "FROM", "MODULE", "NAME", "DEFINITION", "TYPE", "PARENT", "DO", "COND", "WRAP", "TARGET", "ANNOTATED", "ASSIGNED", "ASSERT", "RAISE"
*/
})
