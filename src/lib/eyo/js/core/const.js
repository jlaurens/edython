/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Constants for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

/**
 * @name eYo.const
 * @namespace
 **/

eYo.require('do')
eYo.makeNS('id')

eYo.makeNS('const', {
  ABOVE: 'ABOVE', // not for brick definition
  BELOW: 'BELOW',
  field: {
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
  },
})

eYo.assert(XRegExp, 'load XRegExp before') 

/**
 * @name{eYo.key}
 * @namespace
 */
eYo.makeNS('key', {
  EYO: 'eyo',
  PLACEHOLDER: 'placeholder', // this MUST be in lower case
  TERM: 'term', // this MUST be in lower case
  ASSIGNED: 'assigned',
  IDENTIFIER: 'identifier',
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
  LIST: 'List',

  ASYNC: 'async',
  AWAIT: 'await',

  // names of inputs, may conflict with data models, bad design
  SUITE: 'suite', // this MUST be in lower case
  LEFT: 'left',
  RIGHT: 'right',

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
  TARGET: 'target',

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
  BLANK: 'blank', // lowercase
  COMMENT_MARK: 'comment_mark', // lowercase
  NUMBER: 'number', // lowercase
  STRING: 'string', // lowercase
  LONG_STRING: 'longString', // lowercase

  // IN PROGRESS
  ANY: 'ANY',

  OPTIONS: 'OPTIONS',
  COND: 'COND',
  VAR: 'VAR',
  ANN: 'ANN',
  DFT: 'DFT',
  ID: 'id',
  // model variants keys
  NAME: 'name',
  DOTTED_NAME: 'dotted_name',
  STAR: 'star',
  STAR_NAME: 'star_name',
  STAR_STAR_NAME: 'star_star_name',
  ALIASED: 'as_alias',
  ANNOTATED: 'annotated',
  VALUED: 'valued',
  COL_VALUED: 'col_valued', // ':=' assignment expression in 3.8
  TARGET_VALUED: 'target_valued',
  ANNOTATED_VALUED: 'annotated_valued',
  UNSET: 'unset',

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

  DOTTED_NAME: 'dotted_name',

  CODE: 'code',
  CODE_COMMENT: 'code_comment',

  RESTART: 'restart', // attribute name

  TRUE: 'true', // attribute value
  FALSE: 'false', // attribute value

  PAR: '()', // also used in xml eyo attribute
  SQB: '[]', // also used in xml eyo attribute
  BRACE: '{}', // also used in xml eyo attribute
  event: {
    data: 'eyo:data:',
    property: 'eyo:property',
    locked: 'eyo:locked',
    asynced: 'eyo:asynced'
  },
})

