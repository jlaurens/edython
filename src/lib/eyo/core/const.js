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

goog.require('eYo')
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

eYo.Key = {
  TERM: 'term', // this MUST be in lower case
  TARGET: 'target',
  ASSIGNED: 'assigned',
  IDENTIFIER: 'identifier',
  EXPRESSION: 'expression', // = ANY? NO!
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
  ARGUMENTS: 'arguments',
  IDENTIFIERS: 'identifiers',
  DEL: 'del',
  RETURN: 'return',

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
  PRIMARY: 'primary',
  ATTRIBUTE: 'attribute',
  EXPRESSION_ATTRIBUTE: 'expression_attribute',
  TYPE: 'type',
  LOWER_BOUND: 'lower_bound',
  UPPER_BOUND: 'upper_bound',
  STRIDE: 'stride',
  ANNOTATED: 'annotated',
  LHS: 'lhs',
  RHS: 'rhs',
  OPTION: 'option',
  ASSERT: 'assert',
  RAISE: 'raise',
  FROM: 'from',
  MODULE: 'module',
  PARENT: 'parent',
  AS: 'as',
  SOURCE: 'source',
  DEFINITION: 'definition',

  BACKUP: 'backup', // this MUST be in camelcase
  ALT: 'alt', // this MUST be in camelcase

  WRAP: 'wrap',

  SEP: 'sep',
  FILE: 'file',
  FLUSH: 'flush',

  PREFIX: 'prefix', // lowercase
  SUFFIX: 'suffix', // lowercase
  START: 'start', // lowercase
  END: 'end', // lowercase

  LABEL: 'label', // lowercase
  SEPARATOR: 'separator', // lowercase
  CODE: 'code', // lowercase
  COMMENT: 'comment', // lowercase
  COMMENT_MARK: 'comment_mark', // lowercase
  COMMENT_SHOW: 'comment_show', // lowercase
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
  ID: 'ID',
  // model variants keys
  NAME: 'NAME',
  DOTTED_NAME: 'dotted_name',
  NAME_DEFINITION: 'name_definition',
  NAME_ALIAS: 'name_alias',
  STAR: 'star',
  STAR_NAME: 'star_name',
  STAR_STAR_NAME: 'star_star_name',
  NAME_ANNOTATION: 'name_annotation',
  STAR_NAME_ANNOTATION: 'star_name_annotation',
  NAME_ANNOTATION_DEFINITION: 'name_annotation_definition',
  
  BUILTIN: 'builtin',
  EXPRESSION: 'expression',

  IMPORT: 'import',
  FROM_MODULE_IMPORT: 'from_module_import',
  FROM_MODULE_IMPORT_STAR: 'from_module_import_star',

  EXCEPT: 'except',
  EXCEPT_EXPRESSION: 'except_expression',
  EXCEPT_AS: 'except_as',

  RAISE: 'raise',
  RAISE_EXPRESSION: 'raise_expression',
  RAISE_FROM: 'raise_from',

  GLOBAL: 'global',
  NONLOCAL: 'nonlocal',

  UNARY: 'unary',
  BINARY: 'binary',
  
  NAME_VALUE: 'name_value',
  NAME_ANNOTATION_VALUE: 'name_annotation_value',
  TARGET_VALUE: 'target_value',

  NAME_EXPRESSIONS: 'name_expressions',
  TARGET_EXPRESSIONS: 'target_expressions',

  DOTTED_NAME: 'dotted_name',
  BUILTIN: 'builtin',
  PROPERTY: 'property',
  ARGUMENTS: 'arguments',

  CODE: 'code',
  CODE_COMMENT: 'code_comment',
  EXPRESSION: 'expression',
  EXPRESSION_COMMENT: 'expression_comment',
  COMMENT: 'comment',

  YIELD: 'yield',
  YIELD_EXPRESSION: 'yield_expression',
  YIELD_FROM: 'yield_from',

  /*
"LIST", "EXPRESSION", "FOR", "ITER", "IN", "IF", "COMP", "PRIMARY", "ATTRIBUTE", "LOWER_BOUND", "UPPER_BOUND", "STRIDE", "KEY", "VALUE", "ARGUMENT", "POWER", "RHS", "LHS", "ELSE", "DATUM", "IMPORT", "SOURCE", "AS", "FROM", "MODULE", "NAME", "DEFINITION", "TYPE", "PARENT", "DO", "COND", "WRAP", "TARGET", "ANNOTATED", "ASSIGNED", "ASSERT", "RAISE"
*/
}

XRegExp.install('astral')// python supports astral

eYo.XRE = {
  integer: XRegExp(
    `^(?<sign>-)?(?:
    ((?<decinteger>  (?<nonzero>[1-9][0-9]*) | (?<zero>0+) ) |
    (?<octinteger>  0(?:o|O)[0-7]+) |
    (?<hexinteger>  0(?:x|X)[0-9a-fA-F]+) |
    (?<bininteger>  0(?:b|B)[01]+)))$`, 'x'),
  floatnumber: XRegExp(
    `^(?<sign>-)?(?:
      (?<pointfloat> (?:[0-9]*\\.[0-9]+) | (?:[0-9]+\\.) ) |
      (?<exponentfloat>
        (?<mantissa> [0-9]+\\.?|[0-9]*\\.[0-9]+) # === [0-9]+|[0-9]*\\.[0-9]+|[0-9]+\\.
        [eE](?<exponent> [+-]?[0-9]+)
      )
    )$`, 'x'),
  imagnumber: XRegExp(
    `^(?<sign>-)?(?:
      (?<number>
        [0-9]*\\.[0-9]+|
        [0-9]+\\.?|
        (?:
          (?:
            [0-9]+|
            [0-9]*\\.[0-9]+|
            [0-9]+\\.
          )[eE]([+-]?[0-9]+)
        )
      )
    [jJ])$`, 'x'),
  shortstringliteralSingle: XRegExp(
    `^(?<prefix> r|u|R|U|f|F|fr|Fr|fR|FR|rf|rF|Rf|RF)?
    (?<delimiter> ')
    (?<content>
      (?:[\\x20-\\x26\\x28-\\x5B\\x5D-\\uFFFF]|
        \\\\[\\x0A\\x0D\\x20-\\uFFFF])*
    )
    \\k<delimiter>$`, 'x'),
  shortstringliteralDouble: XRegExp(
    `^(?<prefix> r|u|R|U|f|F|fr|Fr|fR|FR|rf|rF|Rf|RF)?
    (?<delimiter> ")
    (?<content>
      (?:[\\x20\\x21\\x23-\\x5B\\x5D-\\uFFFF]|
        \\\\[\\x0A\\x0D\\x20-\\uFFFF])*
    )
    \\k<delimiter>$`, 'x'),
  longstringliteralSingle: XRegExp(
    `^(?<prefix> r|u|R|U|f|F|fr|Fr|fR|FR|rf|rF|Rf|RF)?
    (?<delimiter> '{3})
    (?<content>
      (?:[\\x0A\\x0D\\x20-\\x26\\x28-\\x5B\\x5D-\\uFFFF]|
        \\\\[\\x0A\\x0D\\x20-\\uFFFF])*
    )
    \\k<delimiter>$`, 'x'),
  longstringliteralDouble: XRegExp(
    `^(?<prefix> r|u|R|U|f|F|fr|Fr|fR|FR|rf|rF|Rf|RF)?
    (?<delimiter> "{3})
    (?<content>
      (?:[\\x0A\\x0D\\x20\\x21\\x23-\\x5B\\x5D-\\uFFFF]|
        \\\\[\\x0A\\x0D\\x20-\\uFFFF])*
    )
    \\k<delimiter>$`, 'x'),
  shortbytesliteralSingle: XRegExp(
    `^(?<prefix> b|B|br|Br|bR|BR|rb|rB|Rb|RB)
    (?<delimiter> ')
    (?<content>
      (?:[\\x00-\\x26\\x28-\\x5B\\x5D-\\x7F]|
        \\\\[\\x00-\\xFF])*?
    )
    \\k<delimiter>$`, 'x'),
  shortbytesliteralDouble: XRegExp(
    `^(?<prefix> b|B|br|Br|bR|BR|rb|rB|Rb|RB)
    (?<delimiter> ")
    (?<content>
      (?:[\\x00-\\x21\\x23-\\x5B\\x5D-\\x7F]|
        \\\\[\\x00-\\xFF])*?
    )
    \\k<delimiter>$`, 'x'),
  longbytesliteralSingle: XRegExp(
    `^(?<prefix> b|B|br|Br|bR|BR|rb|rB|Rb|RB)
    (?<delimiter> (?<del> '){3})
    (?<content>
      (?:[\\x00-\\x26\\x28-\\x5B\\x5D-\\x7F]|
        \\\\[\\x00-\\xFF]|
        \\k<del>{1,2}(?!\\k<del>)|
        \\k<del>{1,2}(?=\\k<delimiter>$))*?
    )
    \\k<delimiter>$`, 'x'),
  longbytesliteralDouble: XRegExp(
    `^(?<prefix> b|B|br|Br|bR|BR|rb|rB|Rb|RB)
    (?<delimiter> (?<del> "){3})
    (?<content>
      (?:[\\x00-\\x21\\x23-\\x5B\\x5D-\\x7F]|
        \\\\[\\x00-\\xFF]|
        \\k<del>{1,2}(?!\\k<del>)|
        \\k<del>{1,2}(?=\\k<delimiter>$))*?
    )
    \\k<delimiter>$`, 'x'),
  bytes: XRegExp(`^(?:[\\x20-\\x5B\\x5D-\\xFF]|
        \\\\[\\x0A\\x0D\\x20-\\xFF])*$`, 'x'),
  letter: XRegExp(`(?:_|\\p{Lu}|\\p{Ll}|\\p{Lt}|\\p{Lm}|\\p{Lo})`),
  id_start: XRegExp(`(?:_|\\p{Lu}|\\p{Ll}|\\p{Lt}|\\p{Lm}|\\p{Lo}|\\p{Nl})`),
  id_continue: XRegExp(`(?:_|\\p{Lu}|\\p{Ll}|\\p{Lt}|\\p{Lm}|\\p{Lo}|\\p{Nl}|\\p{Mn}|\\p{Mc}|\\p{Nd}|\\p{Pc})`),
  identifier: XRegExp(`^(?:
    (?:_|\\p{Lu}|\\p{Ll}|\\p{Lt}|\\p{Lm}|\\p{Lo}|\\p{Nl})
    (?:_|\\p{Lu}|\\p{Ll}|\\p{Lt}|\\p{Lm}|\\p{Lo}|\\p{Nl}|\\p{Mn}|\\p{Mc}|\\p{Nd}|\\p{Pc})*
  )$`, 'x'),
  id_wrapped: XRegExp(`^(?<id>.*?)\\.wrapped:(?<name>[a-zA-Z_][a-zA-Z_0-9]*)$`, 'x'),
  s3d: XRegExp(`^(?:eyo:)?(?<core>.*?)$`),
  event_data: XRegExp(`^eyo:data:(?<key>.*?)$`),
  operator: XRegExp(`^[+\\-/%*@<>&^|=#]$`),
  comment: XRegExp(`^(?<value>[^\\r\\n]*)`),
  upper: XRegExp(`^[A-Z_]*$`)
}

/*
identifier   ::=  xid_start xid_continue*
id_start     ::=  <all characters in general categories Lu, Ll, Lt, Lm, Lo, Nl, the underscore, and characters with the Other_ID_Start property>
id_continue  ::=  <all characters in id_start, plus characters in the categories Mn, Mc, Nd, Pc and others with the Other_ID_Continue property>
xid_start    ::=  <all characters in id_start whose NFKC normalization is in "id_start xid_continue*">
xid_continue ::=  <all characters in id_continue whose NFKC normalization is in "id_continue*">

*/

/*
stringliteral   ::=  [stringprefix](shortstring | longstring)
stringprefix    ::=  "r" | "u" | "R" | "U" | "f" | "F"
                     | "fr" | "Fr" | "fR" | "FR" | "rf" | "rF" | "Rf" | "RF"
shortstring     ::=  "'" shortstringitem* "'" | '"' shortstringitem* '"'
longstring      ::=  "'''" longstringitem* "'''" | '"""' longstringitem* '"""'
shortstringitem ::=  shortstringchar | stringescapeseq
longstringitem  ::=  longstringchar | stringescapeseq
shortstringchar ::=  <any source character except "\" or newline or the quote>
longstringchar  ::=  <any source character except "\">
stringescapeseq ::=  "\" <any source character>

<any source character> ::=[\u000A\u000D\u0020-\uFFFF]
<any source character except "\"> ::=[\u000A\u000D\u0020-\u005B\u005D-\uFFFF]
<any source character except "\" or newline> ::=[\u0020-\u005B\u005D-\uFFFF]
<any source character except "\" or newline or '"'> ::=[\u0020\u0021\u0023-\u005B\u005D-\uFFFF]
<any source character except "\" or newline or "'"> ::=[\u0020-\u0026\u0028-\u005B\u005D-\uFFFF]

stringescapeseq ::= \\[\u000A\u000D\u0020-\uFFFF]
longstringchar ::= [\u000A\u000D\u0020-\u005B\u005D-\uFFFF]
shortstringchar-no-" ::= [\u0020\u0021\u0023-\u005B\u005D-\uFFFF]
shortstringchar-no-" ::= [\u0020-\u0026\u0028-\u005B\u005D-\uFFFF]
longstringitem ::= [\u000A\u000D\u0020-\u005B\u005D-\uFFFF]|\\[\u000A\u000D\u0020-\uFFFF]
shortstringitem-no-" ::= [\u0020\u0021\u0023-\u005B\u005D-\uFFFF]|\\[\u000A\u000D\u0020-\uFFFF]
shortstringitem-no-' ::= [\u0020-\u0026\u0028-\u005B\u005D-\uFFFF]|\\[\u000A\u000D\u0020-\uFFFF]
longstring      ::=  /(''')(longstringitem*)\1|(""")(longstringitem*)\3/
shortstring     ::=  /(')([\u0020-\u0026\u0028-\u005B\u005D-\uFFFF]|\\[\u000A\u000D\u0020-\uFFFF]*)\1|(")([\u0020\u0021\u0023-\u005B\u005D-\uFFFF]|\\[\u000A\u000D\u0020-\uFFFF]*)\3/
stringliteral   ::=  /^(?:(r|u|R|U|f|F|fr|Fr|fR|FR|rf|rF|Rf|RF)?((')((?:[\u0020-\u0026\u0028-\u005B\u005D-\uFFFF]|\\[\u000A\u000D\u0020-\uFFFF])*)\3|(")((?:[\u0020\u0021\u0023-\u005B\u005D-\uFFFF]|\\[\u000A\u000D\u0020-\uFFFF])*)\5|((''')|("""))((?:[\u000A\u000D\u0020-\u005B\u005D-\uFFFF]|\\[\u000A\u000D\u0020-\uFFFF])*)\7))$/

bytesliteral   ::=  bytesprefix(shortbytes | longbytes)
bytesprefix    ::=  "b" | "B" | "br" | "Br" | "bR" | "BR" | "rb" | "rB" | "Rb" | "RB"
shortbytes     ::=  "'" shortbytesitem* "'" | '"' shortbytesitem* '"'
longbytes      ::=  "'''" longbytesitem* "'''" | '"""' longbytesitem* '"""'
shortbytesitem ::=  shortbyteschar | bytesescapeseq
longbytesitem  ::=  longbyteschar | bytesescapeseq
shortbyteschar ::=  <any ASCII character except "\" or newline or the quote>
longbyteschar  ::=  <any ASCII character except "\">
bytesescapeseq ::=  "\" <any ASCII character>

*/

/*
goog.asserts.assert('1234567890123456789123'.match(RE.decinteger), 'FAILURE')
goog.asserts.assert(!'01234567890123456789123'.match(RE.decinteger), 'FAILURE')
goog.asserts.assert('00000'.match(RE.decinteger), 'FAILURE')
goog.asserts.assert('0o0007'.match(RE.octinteger), 'FAILURE')
goog.asserts.assert('0x0007'.match(RE.hexinteger), 'FAILURE')
goog.asserts.assert('0b0001'.match(RE.bininteger), 'FAILURE')
goog.asserts.assert('12345.'.match(RE.pointfloat), 'FAILURE')
goog.asserts.assert('012345.'.match(RE.pointfloat), 'FAILURE')
goog.asserts.assert('.0'.match(RE.pointfloat), 'FAILURE')
goog.asserts.assert('0e0'.match(RE.exponentfloat), 'FAILURE')
goog.asserts.assert('0e+0'.match(RE.exponentfloat), 'FAILURE')
goog.asserts.assert('0e-0'.match(RE.exponentfloat), 'FAILURE')
*/

eYo.Const.Event = {
  DATA: 'eyo:data:',
  property: 'eyo:property',
  locked: 'eyo:locked',
  asynced: 'eyo:asynced'
}

eYo.XmlKey = {
  EXPR: 'x', // tag name
  SLOT: 'slot', // attribute name
  LIST: 'list', // attribute name
  FLOW: 'flow', // attribute name
  SUITE: 'suite',
  NEXT: 'next'
}
