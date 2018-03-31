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

ezP.Const = {
  ABOVE: 'ABOVE',// not for block definition
  BELOW: 'BELOW',
}

ezP.Const.Field = {
  LABEL: 'LABEL',
  START: 'START',
  END: 'END',
  DOTS: 'DOTS',
  CODE: 'CODE',
  ID: 'ID',
  IDENTIFIER: 'IDENTIFIER',
  OPERATOR: 'OPERATOR',
  PREFIX: 'PREFIX',
  AWAIT: 'AWAIT',
  ASYNC: 'ASYNC',
  COMMENT: 'COMMENT',
  NUMBER: 'NUMBER',
  STRING: 'STRING',
  LONG_STRING: 'LONG_STRING',
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
ezP.Key = {
  FIRST: 'first',// this MUST be in lower case
  MIDDLE: 'middle',// this MUST be in lower case
  LAST: 'last',// this MUST be in lower case
  DO: 'do',// this MUST be in lower case
  COMP_FOR: 'comp_for',
  COMP_ITER: 'comp_iter',
  
  NAME: 'name',
  FOR: 'for',
  IN: 'in',
  IF: 'if',
  ELSE: 'else',
  COMPREHENSION: 'comprehension',
  ITEM: 'item', /* used by delimited blocks */
  PRIMARY: 'primary',
  ATTRIBUTE: 'attribute',
  ARGUMENT: 'argument',
  LIST: 'list',
  TYPE: 'type',
  KEY: 'key',
  DATUM: 'datum',
  VALUE: 'value',
  LOWER_BOUND: 'lower_bound',
  UPPER_BOUND: 'upper_bound',
  STRIDE: 'stride',
  EXPRESSION: 'expression',// = ANY? NO!
  TARGET: 'target',
  ANNOTATED: 'annotated',
  ASSIGNED: 'assigned',
  LHS: 'lhs',
  RHS: 'rhs',
  OPTION: 'option',
  ASSERT: 'assert',
  RAISE: 'raise',
  FROM: 'from',
  MODULE: 'module',
  IMPORT: 'import',
  PARENT: 'parent',
  IDENTIFIER: 'identifier',
  AS: 'as',
  SOURCE: 'source',
  POWER: 'power',
  DEFINITION: 'definition',

  WRAP: 'wrap',
  
  END: 'end',
  SEP: 'sep',
  FILE: 'file',
  FLUSH: 'flush',

  PREFIX: 'prefix',

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
}

ezP.RE = {
  decinteger: /^(?:([1-9][0-9]*)|(0+))$/,// /^([1-9][0-9_]*)|(0+[_0]*)$/
  octinteger: /^0(?:o|O)[0-7]+$/,
  hexinteger: /^0(?:x|X)[0-9a-fA-F]+$/,
  bininteger: /^0(?:b|B)[01]+$/,
  integer:/^(?:(([1-9][0-9]*)|(0+))|(0(?:o|O)[0-7]+)|(0(?:x|X)[0-9a-fA-F]+)|(0(?:b|B)[01]+))$/,// group 1: decinteger, 2: octinteger, 3: hexinteger, 4: bininteger
  pointfloat: /^(?:([0-9]*\.[0-9]+)|([0-9]+\.))$/, // beware of capturing groups
  exponentfloat: /^(?:(([0-9]+)|(([0-9]*\.[0-9]+)|([0-9]+\.)))[eE]([+-]?[0-9]+))$/, // beware of capturing groups
  floatnumber: /^(?:([0-9]*\.[0-9]+)|([0-9]+\.)|(?:(([0-9]+)|(([0-9]*\.[0-9]+)|([0-9]+\.)))[eE]([+-]?[0-9]+)))$/, // group1: *., 2: .*, 3: mantissa, 4: exponent
  imagnumber: /^(?:(((([0-9]*\.[0-9]+)|([0-9]+\.))|((([0-9]+)|(([0-9]*\.[0-9]+)|([0-9]+\.)))[eE]([+-]?[0-9]+)))|([0-9]+))[jJ])$/, // group 1: floatnumber, 3: *., 4: +., 5: exponentfloat, 6: mantissa, 7: 8: int, 9: *., 10: +., 11: exponent, 12: integer
  shortstringliteral: /^(r|u|R|U|f|F|fr|Fr|fR|FR|rf|rF|Rf|RF)?('|")((?:[\x20-\x5B\x5D-\uFFFF]|\\[\x0A\x0D\x20-\uFFFF])*?)\2/, // group 1: prefix, group 2: delimiter, group 3: string
  longstringliteral: /^(r|u|R|U|f|F|fr|Fr|fR|FR|rf|rF|Rf|RF)?('''|""")((?:[\x0A\x0D\x20-\x5B\x5D-\uFFFF]|\\[\x0A\x0D\x20-\uFFFF])*?)\2/, // group 1: prefix, group 2: delimiter, group 3: string
  shortbytesliteral: /^(b|B|br|Br|bR|BR|rb|rB|Rb|RB)('|")((?:[\x20-\x5B\x5D-\xFF]|\\[\x0A\x0D\x20-\xFF])*?)\2/, // group 1: prefix, group 2: delimiter, group 3: string
  longbytesliteral: /^(b|B|br|Br|bR|BR|rb|rB|Rb|RB)('''|""")((?:[\x0A\x0D\x20-\x5B\x5D-\xFF]|\\[\x0A\x0D\x20-\xFF])*?)\2/, // group 1: prefix, group 2: delimiter, group 3: string
}

ezP.RE.id_start = /[\u0041-\u005A\u0061-\u007A\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02AF\u1D00-\u1D25\u1D62-\u1D65\u1D6B-\u1D77\u1D79-\u1D9A\u1E00-\u1EFF\u2090-\u209C\u2184\u2C60-\u2C7C\u2C7E-\u2C7F\uA722-\uA76F\uA771-\uA787\uA78B-\uA7AE\uA7B0-\uA7B7\uA7F7\uA7FA-\uA7FF\uAB30-\uAB5A\uAB60-\uAB64\uFB00-\uFB06]/
ezP.RE.id_continue = /[_\u0030-\u0039\u0041-\u005A\u005F\u0061-\u007A\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02AF\u0300-\u036F\u0483-\u0487\u0591-\u05BD\u05BF\u05C1-\u05C2\u05C4-\u05C5\u05C7\u0610-\u061A\u064B-\u0669\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7-\u06E8\u06EA-\u06ED\u06F0-\u06F9\u0711\u0730-\u074A\u07A6-\u07B0\u07C0-\u07C9\u07EB-\u07F3\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08D4-\u08E1\u08E3-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962-\u0963\u0966-\u096F\u0981-\u0983\u09BC\u09BE-\u09C4\u09C7-\u09C8\u09CB-\u09CD\u09D7\u09E2-\u09E3\u09E6-\u09EF\u0A01-\u0A03\u0A3C\u0A3E-\u0A42\u0A47-\u0A48\u0A4B-\u0A4D\u0A51\u0A66-\u0A71\u0A75\u0A81-\u0A83\u0ABC\u0ABE-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AE2-\u0AE3\u0AE6-\u0AEF\u0AFA-\u0AFF\u0B01-\u0B03\u0B3C\u0B3E-\u0B44\u0B47-\u0B48\u0B4B-\u0B4D\u0B56-\u0B57\u0B62-\u0B63\u0B66-\u0B6F\u0B82\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD7\u0BE6-\u0BEF\u0C00-\u0C03\u0C3E-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55-\u0C56\u0C62-\u0C63\u0C66-\u0C6F\u0C81-\u0C83\u0CBC\u0CBE-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5-\u0CD6\u0CE2-\u0CE3\u0CE6-\u0CEF\u0D00-\u0D03\u0D3B-\u0D3C\u0D3E-\u0D44\u0D46-\u0D48\u0D4A-\u0D4D\u0D57\u0D62-\u0D63\u0D66-\u0D6F\u0D82-\u0D83\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2-\u0DF3\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0E50-\u0E59\u0EB1\u0EB4-\u0EB9\u0EBB-\u0EBC\u0EC8-\u0ECD\u0ED0-\u0ED9\u0F18-\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F3F\u0F71-\u0F84\u0F86-\u0F87\u0F8D-\u0F97\u0F99-\u0FBC\u0FC6\u102B-\u103E\u1040-\u1049\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F-\u109D\u135D-\u135F\u16EE-\u16F0\u1712-\u1714\u1732-\u1734\u1752-\u1753\u1772-\u1773\u17B4-\u17D3\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1885-\u1886\u18A9\u1920-\u192B\u1930-\u193B\u1946-\u194F\u19D0-\u19D9\u1A17-\u1A1B\u1A55-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AB0-\u1ABD\u1B00-\u1B04\u1B34-\u1B44\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1B82\u1BA1-\u1BAD\u1BB0-\u1BB9\u1BE6-\u1BF3\u1C24-\u1C37\u1C40-\u1C49\u1C50-\u1C59\u1CD0-\u1CD2\u1CD4-\u1CE8\u1CED\u1CF2-\u1CF4\u1CF7-\u1CF9\u1D00-\u1D25\u1D62-\u1D65\u1D6B-\u1D77\u1D79-\u1D9A\u1DC0-\u1DF9\u1DFB-\u1EFF\u203F-\u2040\u2054\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2160-\u2182\u2184-\u2188\u2C60-\u2C7C\u2C7E-\u2C7F\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u3007\u3021-\u302F\u3038-\u303A\u3099-\u309A\uA620-\uA629\uA66F\uA674-\uA67D\uA69E-\uA69F\uA6E6-\uA6F1\uA722-\uA76F\uA771-\uA787\uA78B-\uA7AE\uA7B0-\uA7B7\uA7F7\uA7FA-\uA7FF\uA802\uA806\uA80B\uA823-\uA827\uA880-\uA881\uA8B4-\uA8C5\uA8D0-\uA8D9\uA8E0-\uA8F1\uA900-\uA909\uA926-\uA92D\uA947-\uA953\uA980-\uA983\uA9B3-\uA9C0\uA9D0-\uA9D9\uA9E5\uA9F0-\uA9F9\uAA29-\uAA36\uAA43\uAA4C-\uAA4D\uAA50-\uAA59\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7-\uAAB8\uAABE-\uAABF\uAAC1\uAAEB-\uAAEF\uAAF5-\uAAF6\uAB30-\uAB5A\uAB60-\uAB64\uABE3-\uABEA\uABEC-\uABED\uABF0-\uABF9\uFB00-\uFB06\uFB1E\uFE00-\uFE0F\uFE20-\uFE2F\uFE33-\uFE34\uFE4D-\uFE4F\uFF10-\uFF19\uFF3F]*/
ezP.RE.identifier = /^[\u0041-\u005A\u0061-\u007A\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02AF\u1D00-\u1D25\u1D62-\u1D65\u1D6B-\u1D77\u1D79-\u1D9A\u1E00-\u1EFF\u2090-\u209C\u2184\u2C60-\u2C7C\u2C7E-\u2C7F\uA722-\uA76F\uA771-\uA787\uA78B-\uA7AE\uA7B0-\uA7B7\uA7F7\uA7FA-\uA7FF\uAB30-\uAB5A\uAB60-\uAB64\uFB00-\uFB06][_\u0030-\u0039\u0041-\u005A\u005F\u0061-\u007A\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02AF\u0300-\u036F\u0483-\u0487\u0591-\u05BD\u05BF\u05C1-\u05C2\u05C4-\u05C5\u05C7\u0610-\u061A\u064B-\u0669\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7-\u06E8\u06EA-\u06ED\u06F0-\u06F9\u0711\u0730-\u074A\u07A6-\u07B0\u07C0-\u07C9\u07EB-\u07F3\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08D4-\u08E1\u08E3-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962-\u0963\u0966-\u096F\u0981-\u0983\u09BC\u09BE-\u09C4\u09C7-\u09C8\u09CB-\u09CD\u09D7\u09E2-\u09E3\u09E6-\u09EF\u0A01-\u0A03\u0A3C\u0A3E-\u0A42\u0A47-\u0A48\u0A4B-\u0A4D\u0A51\u0A66-\u0A71\u0A75\u0A81-\u0A83\u0ABC\u0ABE-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AE2-\u0AE3\u0AE6-\u0AEF\u0AFA-\u0AFF\u0B01-\u0B03\u0B3C\u0B3E-\u0B44\u0B47-\u0B48\u0B4B-\u0B4D\u0B56-\u0B57\u0B62-\u0B63\u0B66-\u0B6F\u0B82\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD7\u0BE6-\u0BEF\u0C00-\u0C03\u0C3E-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55-\u0C56\u0C62-\u0C63\u0C66-\u0C6F\u0C81-\u0C83\u0CBC\u0CBE-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5-\u0CD6\u0CE2-\u0CE3\u0CE6-\u0CEF\u0D00-\u0D03\u0D3B-\u0D3C\u0D3E-\u0D44\u0D46-\u0D48\u0D4A-\u0D4D\u0D57\u0D62-\u0D63\u0D66-\u0D6F\u0D82-\u0D83\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2-\u0DF3\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0E50-\u0E59\u0EB1\u0EB4-\u0EB9\u0EBB-\u0EBC\u0EC8-\u0ECD\u0ED0-\u0ED9\u0F18-\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F3F\u0F71-\u0F84\u0F86-\u0F87\u0F8D-\u0F97\u0F99-\u0FBC\u0FC6\u102B-\u103E\u1040-\u1049\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F-\u109D\u135D-\u135F\u16EE-\u16F0\u1712-\u1714\u1732-\u1734\u1752-\u1753\u1772-\u1773\u17B4-\u17D3\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1885-\u1886\u18A9\u1920-\u192B\u1930-\u193B\u1946-\u194F\u19D0-\u19D9\u1A17-\u1A1B\u1A55-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AB0-\u1ABD\u1B00-\u1B04\u1B34-\u1B44\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1B82\u1BA1-\u1BAD\u1BB0-\u1BB9\u1BE6-\u1BF3\u1C24-\u1C37\u1C40-\u1C49\u1C50-\u1C59\u1CD0-\u1CD2\u1CD4-\u1CE8\u1CED\u1CF2-\u1CF4\u1CF7-\u1CF9\u1D00-\u1D25\u1D62-\u1D65\u1D6B-\u1D77\u1D79-\u1D9A\u1DC0-\u1DF9\u1DFB-\u1EFF\u203F-\u2040\u2054\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2160-\u2182\u2184-\u2188\u2C60-\u2C7C\u2C7E-\u2C7F\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u3007\u3021-\u302F\u3038-\u303A\u3099-\u309A\uA620-\uA629\uA66F\uA674-\uA67D\uA69E-\uA69F\uA6E6-\uA6F1\uA722-\uA76F\uA771-\uA787\uA78B-\uA7AE\uA7B0-\uA7B7\uA7F7\uA7FA-\uA7FF\uA802\uA806\uA80B\uA823-\uA827\uA880-\uA881\uA8B4-\uA8C5\uA8D0-\uA8D9\uA8E0-\uA8F1\uA900-\uA909\uA926-\uA92D\uA947-\uA953\uA980-\uA983\uA9B3-\uA9C0\uA9D0-\uA9D9\uA9E5\uA9F0-\uA9F9\uAA29-\uAA36\uAA43\uAA4C-\uAA4D\uAA50-\uAA59\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7-\uAAB8\uAABE-\uAABF\uAAC1\uAAEB-\uAAEF\uAAF5-\uAAF6\uAB30-\uAB5A\uAB60-\uAB64\uABE3-\uABEA\uABEC-\uABED\uABF0-\uABF9\uFB00-\uFB06\uFB1E\uFE00-\uFE0F\uFE20-\uFE2F\uFE33-\uFE34\uFE4D-\uFE4F\uFF10-\uFF19\uFF3F]*$/

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
  input_disable: 'ezp_input_disable',
  locked: 'ezp_locked',
}