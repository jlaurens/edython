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
 * @name eYo.XRE
 * @namespace
 **/

goog.require('eYo.Do')

goog.provide('eYo.XRE')

goog.asserts.assert(XRegExp, 'load XRegExp before')

XRegExp.install('astral')// python supports astral

eYo.Do.readOnlyMixin(eYo.XRE, {
    id_wrapped: XRegExp(`^(?<id>.*?)\\.wrapped:(?<name>[a-zA-Z_][a-zA-Z_0-9]*)$`, 'x'),
    s3d: XRegExp(`^(?:eyo:)?(?<core>.*?)$`),
    event_data: XRegExp(`^eyo:data:(?<key>.*?)$`),
    operator: XRegExp(`^[+\\-/%*@<>&^|=#]$`),
    delimiter: XRegExp(`^[.,;:\\(\\)\\[\\]\\{\\}\\[\\]'"]$`),
    comment: XRegExp(`^(?<value>[^\\r\\n]*)`),
    upper: XRegExp(`^[A-Z_]*$`),
    white_space: XRegExp('\\t|\\f|\\p{Zs}|\\p{Zl}')
  })

eYo.Do.readOnlyMixin(eYo.XRE, {
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

eYo.Do.readOnlyMixin(eYo.Key, {
  _CHARACTER_SINGLE: '.character_single',
  _LONG_CHARACTER_SINGLE: '.long_character_single',
  _CHARACTER_DOUBLE: '.character_double',
  _LONG_CHARACTER_DOUBLE: '.long_character_double'
})

eYo.Do.readOnlyMixin(eYo.XRE, {
  [eYo.Key._CHARACTER_SINGLE]: '[\\x20-\\x26\\x28-\\x5B\\x5D-\\uFFFF]|\\\\[\\x0A\\x0D\\x20-\\uFFFF]',
  [eYo.Key._LONG_CHARACTER_SINGLE]: '[\\x0A\\x0D\\x20-\\x26\\x28-\\x5B\\x5D-\\uFFFF]|\\\\[\\x0A\\x0D\\x20-\\uFFFF]',
  [eYo.Key._CHARACTER_DOUBLE]: '[\\x20-\\x21\\x23-\\x5B\\x5D-\\uFFFF]|\\\\[\\x0A\\x0D\\x20-\\uFFFF]',
  [eYo.Key._LONG_CHARACTER_DOUBLE]: '[\\x0A\\x0D\\x20-\\x21\\x23-\\x5B\\x5D-\\uFFFF]|\\\\[\\x0A\\x0D\\x20-\\uFFFF]'
})

eYo.Do.readOnlyMixin(eYo.XRE, {
  shortstringliteralSingle: XRegExp(
    `^(?<prefix> r|u|R|U|(?<formatted> f|F|fr|Fr|fR|FR|rf|rF|Rf|RF))?
    (?<delimiter> ')
    (?<content>
      (?:${eYo.XRE[eYo.Key._CHARACTER_SINGLE]})*
    )
    \\k<delimiter>$`, 'x'),
  shortstringliteralDouble: XRegExp(
    `^(?<prefix> r|u|R|U|(?<formatted> f|F|fr|Fr|fR|FR|rf|rF|Rf|RF))?
    (?<delimiter> ")
    (?<content>
      (?:${eYo.XRE[eYo.Key._CHARACTER_DOUBLE]})*
    )
    \\k<delimiter>$`, 'x'),
  longstringliteralSingle: XRegExp(
    `^(?<prefix> r|u|R|U|(?<formatted> f|F|fr|Fr|fR|FR|rf|rF|Rf|RF))?
    (?<delimiter> '{3})
    (?<content>
      (?:${eYo.XRE[eYo.Key._LONG_CHARACTER_SINGLE]})*
    )
    \\k<delimiter>$`, 'x'),
  longstringliteralDouble: XRegExp(
    `^(?<prefix> r|u|R|U|(?<formatted> f|F|fr|Fr|fR|FR|rf|rF|Rf|RF))?
    (?<delimiter> "{3})
    (?<content>
      (?:${eYo.XRE[eYo.Key._LONG_CHARACTER_DOUBLE]})*
    )
    \\k<delimiter>$`, 'x')
})

// bytes

eYo.Do.readOnlyMixin(eYo.Key, {
  _BYTE_SINGLE: '.byte_single',
  _BYTE_DOUBLE: '.byte_double'
})

eYo.Do.readOnlyMixin(eYo.XRE, {
  bytes: XRegExp(`^(?:[\\x20-\\x5B\\x5D-\\xFF]|
    \\\\[\\x0A\\x0D\\x20-\\xFF])*$`, 'x'),
  [eYo.Key._BYTE_SINGLE]: '[\\x00-\\x26\\x28-\\x5B\\x5D-\\x7F]|\\\\[\\x00-\\xFF]',
  [eYo.Key._BYTE_DOUBLE]: '[\\x00-\\x21\\x23-\\x5B\\x5D-\\x7F]|\\\\[\\x00-\\xFF]'
})

eYo.Do.readOnlyMixin(eYo.XRE, {
  shortbytesliteralSingle: XRegExp(
    `^(?<prefix> b|B|br|Br|bR|BR|rb|rB|Rb|RB)
    (?<delimiter> ')
    (?<content>
      (?:${eYo.XRE[eYo.Key._BYTE_SINGLE]})*?
    )
    \\k<delimiter>$`, 'x'),
  shortbytesliteralDouble: XRegExp(
    `^(?<prefix> b|B|br|Br|bR|BR|rb|rB|Rb|RB)
    (?<delimiter> ")
    (?<content>
      (?:${eYo.XRE[eYo.Key._BYTE_DOUBLE]})*?
    )
    \\k<delimiter>$`, 'x'),
  longbytesliteralSingle: XRegExp(
    `^(?<prefix> b|B|br|Br|bR|BR|rb|rB|Rb|RB)
    (?<delimiter> (?<del> '){3})
    (?<content>
      (?:${eYo.XRE[eYo.Key._BYTE_SINGLE]}|
        \\k<del>{1,2}(?!\\k<del>)|
        \\k<del>{1,2}(?=\\k<delimiter>$))*?
    )
    \\k<delimiter>$`, 'x'),
  longbytesliteralDouble: XRegExp(
    `^(?<prefix> b|B|br|Br|bR|BR|rb|rB|Rb|RB)
    (?<delimiter> (?<del> "){3})
    (?<content>
      (?:${eYo.XRE[eYo.Key._BYTE_DOUBLE]}|
        \\k<del>{1,2}(?!\\k<del>)|
        \\k<del>{1,2}(?=\\k<delimiter>$))*?
    )
    \\k<delimiter>$`, 'x'),
  shortbytesliteralSingleNoPrefix: XRegExp(
    `^(?<prefix> b|B|br|Br|bR|BR|rb|rB|Rb|RB)?
    (?<delimiter> ')
    (?<content>
      (?:${eYo.XRE[eYo.Key._BYTE_SINGLE]})*?
    )
    \\k<delimiter>$`, 'x'),
  shortbytesliteralDoubleNoPrefix: XRegExp(
    `^(?<prefix> b|B|br|Br|bR|BR|rb|rB|Rb|RB)?
    (?<delimiter> ")
    (?<content>
      (?:${eYo.XRE[eYo.Key._BYTE_DOUBLE]})*?
    )
    \\k<delimiter>$`, 'x'),
  longbytesliteralSingleNoPrefix: XRegExp(
    `^(?<prefix> b|B|br|Br|bR|BR|rb|rB|Rb|RB)?
    (?<delimiter> (?<del> '){3})
    (?<content>
      (?:${eYo.XRE[eYo.Key._BYTE_SINGLE]}|
        \\k<del>{1,2}(?!\\k<del>)|
        \\k<del>{1,2}(?=\\k<delimiter>$))*?
    )
    \\k<delimiter>$`, 'x'),
  longbytesliteralDoubleNoPrefix: XRegExp(
    `^(?<prefix> b|B|br|Br|bR|BR|rb|rB|Rb|RB)?
    (?<delimiter> (?<del> "){3})
    (?<content>
      (?:${eYo.XRE[eYo.Key._BYTE_DOUBLE]}|
        \\k<del>{1,2}(?!\\k<del>)|
        \\k<del>{1,2}(?=\\k<delimiter>$))*?
    )
    \\k<delimiter>$`, 'x')
})

// identifier

eYo.Do.readOnlyMixin(eYo.Key, {
  _IDENTIFER: '.identifier'
})

eYo.Do.readOnlyMixin(eYo.XRE, {
  [eYo.Key._IDENTIFIER]: `(?:
    (?:_|\\p{L}|\\p{Nl}) # at least one character
    (?:_|\\p{L}|\\p{Nl}|\\p{Mn}|\\p{Mc}|\\p{Nd}|\\p{Pc}
    )*
  )`,
  letter: XRegExp(`(?:_|\\p{L})`),
  id_start: XRegExp(`(?:_|\\p{L}|\\p{Nl}|\\u1885|\\u1886|\\u2118|\\u212E|\\u309B|\\u309C)`),
  id_continue: XRegExp(`(?:_|\\p{L}|\\p{Nl}|\\p{Mn}|\\p{Mc}|\\p{Nd}|\\p{Pc}|\\u1885|\\u1886|\\u2118|\\u212E|\\u309B|\\u309C|\\u00B7|\\u0387|\\u1369|\\u136A|\\u136B|\\u136C|\\u136D|\\u136E|\\u136F|\\u1370|\\u1371|\\u19DA)`),
  tail_continue: XRegExp(`.*(?:_|\\p{L}|\\p{Nl}|\\p{Mn}|\\p{Mc}|\\p{Nd}|\\p{Pc}|\\u1885|\\u1886|\\u2118|\\u212E|\\u309B|\\u309C|\\u00B7|\\u0387|\\u1369|\\u136A|\\u136B|\\u136C|\\u136D|\\u136E|\\u136F|\\u1370|\\u1371|\\u19DA)$`)
})

eYo.Do.readOnlyMixin(eYo.XRE, {
  identifier: XRegExp(`^${eYo.XRE[eYo.Key._IDENTIFIER]}$`, 'x'),
  dotted_name: XRegExp(`^(?:
    (?<dots>\\.*)
    (?:
      (?<holder>
        ${eYo.XRE[eYo.Key._IDENTIFIER]}
        (?:
          \\.(?: ${eYo.XRE[eYo.Key._IDENTIFIER]})?
        )*
      )
      \\.
    )?
  )
  (?<name> ${eYo.XRE[eYo.Key._IDENTIFIER]})?  # must match 'foo.bar.' for partial validation, hence the '?'
  $`, 'x'),
  identifier_annotated_valued: XRegExp(`^
    (?<name> ${eYo.XRE[eYo.Key._IDENTIFIER]})
    (?:\\s*[:]\\s*(?<annotated> ${eYo.XRE[eYo.Key._IDENTIFIER]}))?
    (?:\\s*=\\s*(?<valued> ${eYo.XRE[eYo.Key._IDENTIFIER]}))?
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


eYo.Debug.test() // remove this line when finished
