/**
 * ezPython
 *
 * Copyright 2018 Jérôme LAURENS.
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

ezP.Const = {
  ABOVE: 'ABOVE',// not for block definition
  BELOW: 'BELOW',
}

ezP.Const.Field = {
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

console.warn('avoid ezP.Key.LIST: not enough discriminating')
ezP.Key = {  
  TARGET: 'target',
  ASSIGNED: 'assigned',
  IDENTIFIER: 'identifier',
  EXPRESSION: 'expression',// = ANY? NO!
  ARGUMENT: 'argument',
  POWER: 'power',
  FOR: 'for',
  IN: 'in',
  COMP_ITER: 'comp_iter',
  KEY: 'key',
  DATUM: 'datum',
  OPERATOR: 'operator',
  MODIFIER: 'modifier',
  BUILTIN: 'builtin',
  FUTURE: 'future',
  PARAMETERS: 'parameters',
  SLICE: 'slice',
  ARGUMENTS: 'arguments',
  IDENTIFIERS: 'identifiers',
  SUBTYPE: 'subtype',
  DEL: 'del',
  RETURN: 'return',

  LIST: 'list',// avoid this one when possibe
  
  ASYNC: 'async',
  AWAIT: 'await',

  FIRST: 'i_1',// this MUST be in lower case
  MIDDLE: 'i_2',// this MUST be in lower case
  LAST: 'i_3',// this MUST be in lower case
  SUITE: 'suite',// this MUST be in lower case
  COMP_FOR: 'comp_for',
  
  NAME: 'name',
  DOTTED_NAME: 'dotted_name',
  IF: 'if',
  ELIF: 'elif',
  ELSE: 'else',
  WHILE: 'while',
  WITH: 'with',
  COMPREHENSION: 'comprehension',
  ITEM: 'item', /* used by delimited blocks */
  PRIMARY: 'primary',
  ATTRIBUTE: 'attribute',
  TYPE: 'type',
  VALUE: 'value',
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
  IMPORT: 'import',
  PARENT: 'parent',
  AS: 'as',
  SOURCE: 'source',
  DEFINITION: 'definition',

  WRAP: 'wrap',
  
  END: 'end',
  SEP: 'sep',
  FILE: 'file',
  FLUSH: 'flush',

  PREFIX: 'prefix',
  SUFFIX: 'suffix',

  LABEL: 'label', // lowercase
  CODE: 'code', // lowercase
  COMMENT: 'comment', // lowercase
  NUMBER: 'number', // lowercase
  STRING: 'string', // lowercase
  LONG_STRING: 'longString', // lowercase
  START: 'start', // lowercase
  
  // IN PROGRESS
  ANY: 'ANY',

  OPTIONS: 'OPTIONS',
  COND: 'COND',
  VAR: 'VAR',
  ANN: 'ANN',
  DFT: 'DFT',
  ID: 'ID',

  /*
"LIST", "EXPRESSION", "FOR", "ITER", "IN", "IF", "COMP", "PRIMARY", "ATTRIBUTE", "LOWER_BOUND", "UPPER_BOUND", "STRIDE", "KEY", "VALUE", "ARGUMENT", "POWER", "RHS", "LHS", "ELSE", "DATUM", "IMPORT", "SOURCE", "AS", "FROM", "MODULE", "NAME", "DEFINITION", "TYPE", "PARENT", "DO", "COND", "WRAP", "TARGET", "ANNOTATED", "ASSIGNED", "ASSERT", "RAISE"
*/
}

XRegExp.install('astral')// python supports astral

ezP.XRE = {
  integer:/^(?:(([1-9][0-9]*)|(0+))|(0(?:o|O)[0-7]+)|(0(?:x|X)[0-9a-fA-F]+)|(0(?:b|B)[01]+))$/,// group 1: decinteger, 2: octinteger, 3: hexinteger, 4: bininteger
  integer: XRegExp(
    `^((?<decinteger>  (?<nonzero>[1-9][0-9]*) | (?<zero>0+) ) |
    (?<octinteger>  0(?:o|O)[0-7]+) |
    (?<hexinteger>  0(?:x|X)[0-9a-fA-F]+) |
    (?<bininteger>  0(?:b|B)[01]+))$`, 'x'),
  floatnumber: XRegExp(
    `^(?:
      (?<pointfloat> (?:[0-9]*\.[0-9]+) | (?:[0-9]+\.) ) |
      (?<exponentfloat>
        (?<mantissa> [0-9]+\.?|[0-9]*\.[0-9]+) # === [0-9]+|[0-9]*\.[0-9]+|[0-9]+\.
        [eE](?<exponent> [+-]?[0-9]+)
      )
    )$`, 'x'),
  imagnumber: XRegExp(
    `^(?:
      (?<number> 
        [0-9]*\.[0-9]+|
        [0-9]+\.?|
        (?:
          (?:
            [0-9]+|
            [0-9]*\.[0-9]+|
            [0-9]+\.
          )[eE]([+-]?[0-9]+)
        )
      )
    [jJ])$`, 'x'),
  shortstringliteral: XRegExp(
    `^(?<prefix> r|u|R|U|f|F|fr|Fr|fR|FR|rf|rF|Rf|RF)?
    (?<delimiter> '(?!'')|"(?!""))
    (?<content>
      (?:[\\x20-\\x5B\\x5D-\\uFFFF]|
        \\\\[\\x0A\\x0D\\x20-\\uFFFF])*?
    )
    \\k<delimiter>`, 'x'),
  longstringliteral: new XRegExp(
    `^(?<prefix> r|u|R|U|f|F|fr|Fr|fR|FR|rf|rF|Rf|RF)?
    (?<delimiter> '''|""")
    (?<content>
      (?:[\\x0A\\x0D\\x20-\\x5B\\x5D-\\uFFFF]|
        \\\\[\\x0A\\x0D\\x20-\\uFFFF])*?
    )
    \\k<delimiter>`, 'x'),
  shortbytesliteral: XRegExp(
    `^(?<prefix> b|B|br|Br|bR|BR|rb|rB|Rb|RB)
    (?<delimiter> '(?!'')|"(?!""))
    (?<content>
      (?:[\\x20-\\x5B\\x5D-\\xFF]|
        \\\\[\\x0A\\x0D\\x20-\\xFF])*?
    )
    \\k<delimiter>`, 'x'),
  longbytesliteral: XRegExp(
    `^(?<prefix> b|B|br|Br|bR|BR|rb|rB|Rb|RB)
    (?<delimiter> '''|""")
    (?<content>
      (?:[\\x20-\\x5B\\x5D-\\xFF]|
        \\\\[\\x0A\\x0D\\x20-\\xFF])*?
    )
    \\k<delimiter>`, 'x'),
  bytes: XRegExp(`^(?:[\\x20-\\x5B\\x5D-\\xFF]|
        \\\\[\\x0A\\x0D\\x20-\\xFF])*$`, 'x'),
  letter: XRegExp(`(?:_|\\p{Lu}|\\p{Ll}|\\p{Lt}|\\p{Lm}|\\p{Lo})`),
  id_start: XRegExp(`(?:_|\\p{Lu}|\\p{Ll}|\\p{Lt}|\\p{Lm}|\\p{Lo}|\\p{Nl})`),
  id_continue: XRegExp(`(?:_|\\p{Lu}|\\p{Ll}|\\p{Lt}|\\p{Lm}|\\p{Lo}|\\p{Nl}|\\p{Mn}|\\p{Mc}|\\p{Nd}|\\p{Pc})`),
  identifier: XRegExp(`^(?:
    (?:_|\\p{Lu}|\\p{Ll}|\\p{Lt}|\\p{Lm}|\\p{Lo}|\\p{Nl})
    (?:_|\\p{Lu}|\\p{Ll}|\\p{Lt}|\\p{Lm}|\\p{Lo}|\\p{Nl}|\\p{Mn}|\\p{Mc}|\\p{Nd}|\\p{Pc})*
  )$`, 'x'),
  id_wrapped: XRegExp(`^(?<id>.*?)\.wrapped:(?<name>[a-zA-Z_][a-zA-Z_0-9]*)$`, 'x'),
  concrete: XRegExp(`^(?<core>.*?)_concrete$`),
  event_property: XRegExp(`^ezp:property:(?<key>.*?)$`),
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

ezP.Const.Event = {
  SUBTYPE: 'ezp:subtype',
  VALUE: 'ezp:value',
  input_disable: 'ezp:input_disable',
  property: 'ezp:property',
  locked: 'ezp:locked',
  asynced: 'ezp:asynced',
}
