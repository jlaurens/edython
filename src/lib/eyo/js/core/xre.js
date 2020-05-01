/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Constants for edythonExtended regular expressions.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

/**
 * @name eYo.xre
 * @namespace
 **/

eYo.makeNS('xre')

eYo.assert(XRegExp, 'load XRegExp before')

XRegExp.install('astral')// python supports astral

eYo.mixinR(eYo.xre, {
  id_wrapped: XRegExp(`^(?<id>.*?)\\.wrapped:(?<name>[a-zA-Z_][a-zA-Z_0-9]*)$`, 'x'),
  s3d: XRegExp(`^(?:eyo:)?(?<core>.*?)$`),
  event_data: XRegExp(`^eyo:data:(?<key>.*?)$`),
  operator: XRegExp(`^[+\\-/%*@<>&^|=#]$`),
  delimiter: XRegExp(`^[.,;:\\(\\)\\[\\]\\{\\}\\[\\]'"]$`),
  comment: XRegExp(`^(?<value>[^\\r\\n]*)`),
  upper: XRegExp(`^[A-Z_]*$`),
  white_space: XRegExp('\\t|\\f|\\p{Zs}|\\p{Zl}'),
})
  
  
eYo.mixinR(eYo.xre, {
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
    [jJ])$`, 'x')
})

// strings:

eYo.mixinR(eYo.key, {
  _CHARACTER_SINGLE: '.character_single',
  _LONG_CHARACTER_SINGLE: '.long_character_single',
  _CHARACTER_DOUBLE: '.character_double',
  _LONG_CHARACTER_DOUBLE: '.long_character_double'
})

eYo.mixinR(eYo.xre, {
  [eYo.key._CHARACTER_SINGLE]: '[\\x20-\\x26\\x28-\\x5B\\x5D-\\uFFFF]|\\\\[\\x0A\\x0D\\x20-\\uFFFF]',
  [eYo.key._LONG_CHARACTER_SINGLE]: '[\\x0A\\x0D\\x20-\\x26\\x28-\\x5B\\x5D-\\uFFFF]|\\\\[\\x0A\\x0D\\x20-\\uFFFF]',
  [eYo.key._CHARACTER_DOUBLE]: '[\\x20-\\x21\\x23-\\x5B\\x5D-\\uFFFF]|\\\\[\\x0A\\x0D\\x20-\\uFFFF]',
  [eYo.key._LONG_CHARACTER_DOUBLE]: '[\\x0A\\x0D\\x20-\\x21\\x23-\\x5B\\x5D-\\uFFFF]|\\\\[\\x0A\\x0D\\x20-\\uFFFF]'
})

eYo.mixinR(eYo.xre, {
  shortstringliteralSingle: XRegExp(
    `^(?<prefix> r|u|R|U|(?<formatted> f|F|fr|Fr|fR|FR|rf|rF|Rf|RF))?
    (?<delimiter> ')
    (?<content>
      (?:${eYo.xre[eYo.key._CHARACTER_SINGLE]})*
    )
    \\k<delimiter>$`, 'x'),
  shortstringliteralDouble: XRegExp(
    `^(?<prefix> r|u|R|U|(?<formatted> f|F|fr|Fr|fR|FR|rf|rF|Rf|RF))?
    (?<delimiter> ")
    (?<content>
      (?:${eYo.xre[eYo.key._CHARACTER_DOUBLE]})*
    )
    \\k<delimiter>$`, 'x'),
  longstringliteralSingle: XRegExp(
    `^(?<prefix> r|u|R|U|(?<formatted> f|F|fr|Fr|fR|FR|rf|rF|Rf|RF))?
    (?<delimiter> '{3})
    (?<content>
      (?:${eYo.xre[eYo.key._LONG_CHARACTER_SINGLE]})*
    )
    \\k<delimiter>$`, 'x'),
  longstringliteralDouble: XRegExp(
    `^(?<prefix> r|u|R|U|(?<formatted> f|F|fr|Fr|fR|FR|rf|rF|Rf|RF))?
    (?<delimiter> "{3})
    (?<content>
      (?:${eYo.xre[eYo.key._LONG_CHARACTER_DOUBLE]})*
    )
    \\k<delimiter>$`, 'x')
})

// bytes

eYo.mixinR(eYo.key, {
  _BYTE_SINGLE: '.byte_single',
  _BYTE_DOUBLE: '.byte_double'
})

eYo.mixinR(eYo.xre, {
  bytes: XRegExp(`^(?:[\\x20-\\x5B\\x5D-\\xFF]|
    \\\\[\\x0A\\x0D\\x20-\\xFF])*$`, 'x'),
  [eYo.key._BYTE_SINGLE]: '[\\x00-\\x26\\x28-\\x5B\\x5D-\\x7F]|\\\\[\\x00-\\xFF]',
  [eYo.key._BYTE_DOUBLE]: '[\\x00-\\x21\\x23-\\x5B\\x5D-\\x7F]|\\\\[\\x00-\\xFF]'
})

eYo.mixinR(eYo.xre, {
  shortbytesliteralSingle: XRegExp(
    `^(?<prefix> b|B|br|Br|bR|BR|rb|rB|Rb|RB)
    (?<delimiter> ')
    (?<content>
      (?:${eYo.xre[eYo.key._BYTE_SINGLE]})*?
    )
    \\k<delimiter>$`, 'x'),
  shortbytesliteralDouble: XRegExp(
    `^(?<prefix> b|B|br|Br|bR|BR|rb|rB|Rb|RB)
    (?<delimiter> ")
    (?<content>
      (?:${eYo.xre[eYo.key._BYTE_DOUBLE]})*?
    )
    \\k<delimiter>$`, 'x'),
  longbytesliteralSingle: XRegExp(
    `^(?<prefix> b|B|br|Br|bR|BR|rb|rB|Rb|RB)
    (?<delimiter> (?<del> '){3})
    (?<content>
      (?:${eYo.xre[eYo.key._BYTE_SINGLE]}|
        \\k<del>{1,2}(?!\\k<del>)|
        \\k<del>{1,2}(?=\\k<delimiter>$))*?
    )
    \\k<delimiter>$`, 'x'),
  longbytesliteralDouble: XRegExp(
    `^(?<prefix> b|B|br|Br|bR|BR|rb|rB|Rb|RB)
    (?<delimiter> (?<del> "){3})
    (?<content>
      (?:${eYo.xre[eYo.key._BYTE_DOUBLE]}|
        \\k<del>{1,2}(?!\\k<del>)|
        \\k<del>{1,2}(?=\\k<delimiter>$))*?
    )
    \\k<delimiter>$`, 'x'),
  shortbytesliteralSingleNoPrefix: XRegExp(
    `^(?<prefix> b|B|br|Br|bR|BR|rb|rB|Rb|RB)?
    (?<delimiter> ')
    (?<content>
      (?:${eYo.xre[eYo.key._BYTE_SINGLE]})*?
    )
    \\k<delimiter>$`, 'x'),
  shortbytesliteralDoubleNoPrefix: XRegExp(
    `^(?<prefix> b|B|br|Br|bR|BR|rb|rB|Rb|RB)?
    (?<delimiter> ")
    (?<content>
      (?:${eYo.xre[eYo.key._BYTE_DOUBLE]})*?
    )
    \\k<delimiter>$`, 'x'),
  longbytesliteralSingleNoPrefix: XRegExp(
    `^(?<prefix> b|B|br|Br|bR|BR|rb|rB|Rb|RB)?
    (?<delimiter> (?<del> '){3})
    (?<content>
      (?:${eYo.xre[eYo.key._BYTE_SINGLE]}|
        \\k<del>{1,2}(?!\\k<del>)|
        \\k<del>{1,2}(?=\\k<delimiter>$))*?
    )
    \\k<delimiter>$`, 'x'),
  longbytesliteralDoubleNoPrefix: XRegExp(
    `^(?<prefix> b|B|br|Br|bR|BR|rb|rB|Rb|RB)?
    (?<delimiter> (?<del> "){3})
    (?<content>
      (?:${eYo.xre[eYo.key._BYTE_DOUBLE]}|
        \\k<del>{1,2}(?!\\k<del>)|
        \\k<del>{1,2}(?=\\k<delimiter>$))*?
    )
    \\k<delimiter>$`, 'x')
})

// identifier

eYo.mixinR(eYo.key, {
  _IDENTIFER: '.identifier'
})

eYo.mixinR(eYo.xre, {
  [eYo.key._IDENTIFIER]: `(?:
    (?:_|\\p{L}|\\p{Nl}) # at least one character
    (?:_|\\p{L}|\\p{Nl}|\\p{Mn}|\\p{Mc}|\\p{Nd}|\\p{Pc}
    )*
  )`,
  letter: XRegExp(`(?:_|\\p{L})`),
  id_start: XRegExp(`(?:_|\\p{L}|\\p{Nl}|\\u1885|\\u1886|\\u2118|\\u212E|\\u309B|\\u309C)`),
  id_continue: XRegExp(`(?:_|\\p{L}|\\p{Nl}|\\p{Mn}|\\p{Mc}|\\p{Nd}|\\p{Pc}|\\u1885|\\u1886|\\u2118|\\u212E|\\u309B|\\u309C|\\u00B7|\\u0387|\\u1369|\\u136A|\\u136B|\\u136C|\\u136D|\\u136E|\\u136F|\\u1370|\\u1371|\\u19DA)`),
  tail_continue: XRegExp(`.*(?:_|\\p{L}|\\p{Nl}|\\p{Mn}|\\p{Mc}|\\p{Nd}|\\p{Pc}|\\u1885|\\u1886|\\u2118|\\u212E|\\u309B|\\u309C|\\u00B7|\\u0387|\\u1369|\\u136A|\\u136B|\\u136C|\\u136D|\\u136E|\\u136F|\\u1370|\\u1371|\\u19DA)$`)
})

eYo.mixinR(eYo.xre, {
  identifier: XRegExp(`^${eYo.xre[eYo.key._IDENTIFIER]}$`, 'x'),
  dotted_name: XRegExp(`^(?:
    (?<dots>\\.*)
    (?:
      (?<holder>
        ${eYo.xre[eYo.key._IDENTIFIER]}
        (?:
          \\.(?: ${eYo.xre[eYo.key._IDENTIFIER]})?
        )*
      )
      \\.
    )?
  )
  (?<name> ${eYo.xre[eYo.key._IDENTIFIER]})?  # must match 'foo.bar.' for partial validation, hence the '?'
  $`, 'x'),
  identifier_annotated_valued: XRegExp(`^
    (?<name> ${eYo.xre[eYo.key._IDENTIFIER]})
    (?:\\s*[:]\\s*(?<annotated> ${eYo.xre[eYo.key._IDENTIFIER]}))?
    (?:\\s*=\\s*(?<valued> ${eYo.xre[eYo.key._IDENTIFIER]}))?
  $`, 'x')
})

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

eYo.mixinR(eYo.xre, {
  function_builtin_before: XRegExp('^[^(]*\\(\\s*(?<builtin>\\bbuiltin\\b)?(?:\\s*,\\s*)?(?<before>\\bbefore\\b)?'),
  function_builtin: XRegExp('^[^(]*\\(\\s*\\bbuiltin\\b'),
  function_builtin_after: XRegExp('^[^(]*\\(\\s*\\bbuiltin\\b\\s*,\\s*\\bafter\\b'),
  function_stored_after: XRegExp('^[^(]*\\(\\s*\\bstored\\b\\s*,\\s*\\bafter\\b'),
  function_overriden: XRegExp('^[^(]*\\(\\s*\\boverriden\\b'),
  CONST: XRegExp('^[A-Z_][A-Z_0-9]*$'),
})