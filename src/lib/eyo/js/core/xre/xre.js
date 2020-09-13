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

eYo.newNS('xre')

eYo.assert(XRegExp, 'load XRegExp before')

//<<< mochai: Basics
//... chai.assert(XRegExp)
//... chai.assert(eYo.xre)
//>>>

//... var xre, m // for match

XRegExp.install('astral')// python supports astral

eYo.mixinRO(eYo.xre, {
  id_wrapped: XRegExp(`^(?<id>.*?)\\.wrapped:(?<name>[a-zA-Z_][a-zA-Z_0-9]*)$`, 'x'),
  //<<< mochai: id_wrapped
  //... xre = eYo.xre.id_wrapped
  //... chai.assert(m = XRegExp.exec('foo.wrapped:bar', xre))
  //... chai.expect(m.id).equal('foo')
  //... chai.expect(m.name).equal('bar')
  //>>>
  s3d: XRegExp(`^(?:eyo:)?(?<core>.*?)$`),
  //<<< mochai: s3d
  //... xre = eYo.xre.s3d
  //... chai.assert(m = XRegExp.exec('eyo:foo', xre))
  //... chai.expect(m.core).equal('foo')
  //... chai.assert(m = XRegExp.exec('eyoX:foo', xre))
  //... chai.expect(m.core).equal('eyoX:foo')
  //>>>
  event_data: XRegExp(`^eyo:data:(?<key>.*?)$`),
  //<<< mochai: event_data
  //... xre = eYo.xre.event_data 
  //... chai.assert(m = XRegExp.exec('eyo:data:foo', xre))
  //... chai.expect(m.key).equal('foo')
  //... chai.assert(!XRegExp.exec('eyo:dataX:foo', xre))
  //>>>
  operator: XRegExp(`^[+\\-/%*@<>&^|=#]$`),
  //<<< mochai: operator
  //... xre = eYo.xre.operator
  //... for (let k of ['+', '-', '/', '%', '*', '@', '<', '>', '&', '^', '|', '=', '#']) {
  //...   chai.assert(XRegExp.exec(k, xre))
  //... }
  //>>>
  delimiter: XRegExp(`^[.,;:\\(\\)\\[\\]\\{\\}'"]$`),
  //<<< mochai: delimiter
  //... xre = eYo.xre.delimiter
  //... for (let k of ['.', ',', ';', ':', '(', ')', '[', ']', '{', '}', "'", '"']) {
  //...   chai.assert(XRegExp.exec(k, xre))
  //... }
  //>>>
  comment: XRegExp(`^(?<value>[^\\r\\n]*)`),
  //? TODO: Make this regex unicode aware, using `$`
  //<<< mochai: comment
  //... xre = eYo.xre.comment
  //... chai.assert(m = XRegExp.exec('foo', xre))
  //... chai.expect(m.value).equal('foo')
  //... chai.assert(m = XRegExp.exec('foo\rbar', xre))
  //... chai.expect(m.value).equal('foo')
  //... chai.assert(m = XRegExp.exec('foo\nbar', xre))
  //... chai.expect(m.value).equal('foo')
  //>>>
  upper: XRegExp(`^[A-Z_]*$`),
  //<<< mochai: upper
  //... xre = eYo.xre.upper
  //... chai.assert(XRegExp.exec('FOO', xre))
  //... chai.assert(!XRegExp.exec('FoO', xre))
  //>>>
  white_space: XRegExp(' |\\t|\\f|\\p{Z}'),
  //<<< mochai: white_space
  //... xre = eYo.xre.white_space
  //... for (let k of [' ', '\t', '\f',]) {
  //...   chai.assert(XRegExp.exec(k, xre))
  //... }
  //>>>
})
  
  
eYo.mixinRO(eYo.xre, {
  integer: XRegExp(
    `^(?<sign>-)?(?:
    ((?<decinteger>  (?<nonzero>[1-9][0-9]*) | (?<zero>0+) ) |
    (?<octinteger>  0(?:o|O)[0-7]+) |
    (?<hexinteger>  0(?:x|X)[0-9a-fA-F]+) |
    (?<bininteger>  0(?:b|B)[01]+)))$`, 'x'),
  //<<< mochai: integer
  //... m = XRegExp.exec('1234567890123456789123', eYo.xre.integer)
  //... chai.assert(m.decinteger, 'FAILURE')
  //... m = XRegExp.exec('00000', eYo.xre.integer)
  //... chai.assert(m.decinteger, 'FAILURE')
  //... m = XRegExp.exec('0o0007', eYo.xre.integer)
  //... chai.assert(m.octinteger, 'FAILURE')
  //... m = XRegExp.exec('0x0007', eYo.xre.integer)
  //... chai.assert(m.hexinteger, 'FAILURE')
  //... m = XRegExp.exec('0x0007', eYo.xre.integer)
  //... chai.assert(m.hexinteger, 'FAILURE')
  //... m = XRegExp.exec('0b0001', eYo.xre.integer)
  //... chai.assert(m.bininteger, 'FAILURE')
  //>>>
  floatnumber: XRegExp(
    `^(?<sign>-)?(?:
      (?<pointfloat> (?:[0-9]*\\.[0-9]+) | (?:[0-9]+\\.) ) |
      (?<exponentfloat>
        (?<mantissa> [0-9]+\\.?|[0-9]*\\.[0-9]+) # === [0-9]+|[0-9]*\\.[0-9]+|[0-9]+\\.
        [eE](?<exponent> [+-]?[0-9]+)
      )
    )$`, 'x'),
  //<<< mochai: floatnumber
  //... m = XRegExp.exec('12345.', eYo.xre.floatnumber)
  //... chai.assert(m.pointfloat, 'FAILURE')
  //... m = XRegExp.exec('012345.', eYo.xre.floatnumber)
  //... chai.assert(m.pointfloat, 'FAILURE')
  //... m = XRegExp.exec('.0', eYo.xre.floatnumber)
  //... chai.assert(m.pointfloat, 'FAILURE')
  //... m = XRegExp.exec('0e0', eYo.xre.floatnumber)
  //... chai.assert(m.exponentfloat, 'FAILURE')
  //... m = XRegExp.exec('0e+0', eYo.xre.floatnumber)
  //... chai.assert(m.exponentfloat, 'FAILURE')
  //... m = XRegExp.exec('0e-0', eYo.xre.floatnumber)
  //... chai.assert(m.exponentfloat, 'FAILURE')
  //>>>
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

eYo.mixinRO(eYo.xre, {
  $NO_SINGLE_QUOTE: Symbol('NO_SINGLE_QUOTE'),
  $LONG_NO_SINGLE_QUOTE: Symbol('LONG_NO_SINGLE_QUOTE'),
  $NO_DOUBLE_QUOTE: Symbol('NO_DOUBLE_QUOTE'),
  $LONG_NO_DOUBLE_QUOTE: Symbol('LONG_NO_DOUBLE_QUOTE'),
})

eYo.mixinRO(eYo.xre, {
  [eYo.xre.$NO_SINGLE_QUOTE]: '(?:[\\x20-\\x26\\x28-\\x5B\\x5D-\\uFFFF]|\\\\[\\x0A\\x0D\\x20-\\uFFFF])',
  [eYo.xre.$LONG_NO_SINGLE_QUOTE]: '(?:[\\x0A\\x0D\\x20-\\x26\\x28-\\x5B\\x5D-\\uFFFF]|\\\\[\\x0A\\x0D\\x20-\\uFFFF])',
  [eYo.xre.$NO_DOUBLE_QUOTE]: '(?:[\\x20-\\x21\\x23-\\x5B\\x5D-\\uFFFF]|\\\\[\\x0A\\x0D\\x20-\\uFFFF])',
  [eYo.xre.$LONG_NO_DOUBLE_QUOTE]: '(?:[\\x0A\\x0D\\x20-\\x21\\x23-\\x5B\\x5D-\\uFFFF]|\\\\[\\x0A\\x0D\\x20-\\uFFFF])'
  //<<< mochai: $...CHARACTER...
  //... var xre = XRegExp(
  //...   `^(?:[\\x20-\\x26\\x28-\\x5B\\x5D-\\uFFFF])$`
  //... )
  //... chai.assert(!XRegExp.exec('\'', xre), '\'')
  //... chai.assert(m = XRegExp.exec('f', xre), 'f')
  //... chai.assert(m = XRegExp.exec('"', xre), '"')
  //... var xre = XRegExp(
  //...   `^(?:[\\x20-\\x26\\x28-\\x5B\\x5D-\\uFFFF]|\\\\[\\x0A\\x0D\\x20-\\uFFFF])$`
  //... )
  //... chai.assert(!XRegExp.exec('\'', xre), '\'')
  //... chai.assert(m = XRegExp.exec('f', xre), 'f')
  //... chai.assert(m = XRegExp.exec('"', xre), '"')
  //... var xre = XRegExp(
  //...   `^${eYo.xre[eYo.xre.$NO_SINGLE_QUOTE]}$`
  //... )
  //... chai.assert(!XRegExp.exec('\'', xre), '\'')
  //... chai.assert(m = XRegExp.exec('f', xre), 'f')
  //... chai.assert(m = XRegExp.exec('"', xre), '"')
  //... var xre = XRegExp(
  //...   `^(?<content>
  //...   ${eYo.xre[eYo.xre.$NO_SINGLE_QUOTE]}*
  //...   )$`, 'x'
  //... )
  //... chai.assert(m = XRegExp.exec('f"o', xre), 'f"o')
  //... var xre = XRegExp(
  //...   `(?<content>
  //...   ${eYo.xre[eYo.xre.$NO_DOUBLE_QUOTE]}*
  //...   )$`, 'x'
  //... )
  //... chai.assert(m = XRegExp.exec("f'o", xre), "f'o")
  //... var xre = XRegExp(
  //...   `(?<content>
  //...   ${eYo.xre[eYo.xre.$LONG_NO_SINGLE_QUOTE]}*
  //...   )$`, 'x'
  //... )
  //... chai.assert(m = XRegExp.exec('f"o', xre), 'f"o')
  //... var xre = XRegExp(
  //...   `(?<content>
  //...   ${eYo.xre[eYo.xre.$LONG_NO_DOUBLE_QUOTE]}*
  //...   )$`, 'x'
  //... )
  //... chai.assert(m = XRegExp.exec("f'o", xre), "f'o")
  //... var xre = XRegExp(
  //...   `^(?<prefix> r|u|R|U|(?<formatted> f|F|fr|Fr|fR|FR|rf|rF|Rf|RF))?
  //...   (?<delimiter> ')
  //...   (?<content>${eYo.xre[eYo.xre.$NO_SINGLE_QUOTE]}*)
  //...   \\k<delimiter>$`, 'x'
  //... )
  //... chai.assert(m = XRegExp.exec("'f\"o'", xre), "'f\"o'")
  //>>>
})

eYo.mixinRO(eYo.xre, {
  shortstringliteralSingle: XRegExp(
    `^(?<prefix> r|u|R|U|(?<formatted> f|F|fr|Fr|fR|FR|rf|rF|Rf|RF))?
    (?<delimiter> ')
    (?<content>${eYo.xre[eYo.xre.$NO_SINGLE_QUOTE]}*)
    \\k<delimiter>$`, 'x'),
  shortstringliteralDouble: XRegExp(
    `^(?<prefix> r|u|R|U|(?<formatted> f|F|fr|Fr|fR|FR|rf|rF|Rf|RF))?
    (?<delimiter> ")
    (?<content>${eYo.xre[eYo.xre.$NO_DOUBLE_QUOTE]}*)
    \\k<delimiter>$`, 'x'),
  longstringliteralSingle: XRegExp(
    `^(?<prefix> r|u|R|U|(?<formatted> f|F|fr|Fr|fR|FR|rf|rF|Rf|RF))?
    (?<delimiter> (?<del> '){3})
    (?<content>
      ${eYo.xre[eYo.xre.$LONG_NO_SINGLE_QUOTE]}*
      (?:\\k<del>{1,2}${eYo.xre[eYo.xre.$LONG_NO_SINGLE_QUOTE]}+)*
    )
    \\k<delimiter>$`, 'x'),
  longstringliteralDouble: XRegExp(
    `^(?<prefix> r|u|R|U|(?<formatted> f|F|fr|Fr|fR|FR|rf|rF|Rf|RF))?
    (?<delimiter> (?<del> "){3})
    (?<content>
      ${eYo.xre[eYo.xre.$LONG_NO_DOUBLE_QUOTE]}*
      (?:\\k<del>{1,2}${eYo.xre[eYo.xre.$LONG_NO_DOUBLE_QUOTE]}+)*
    )
    \\k<delimiter>$`, 'x')
  //<<< mochai: (short|long)stringliteral(Single|Double)
  //... var xre, dlmtr, content
  //... let test = (s, prefix, formatted, content) => {
  //...   chai.assert(m = XRegExp.exec(s, xre), `${s}/${prefix}/${formatted}/${content}`)
  //...   chai.expect(!m.prefix).equal(!prefix)
  //...   chai.expect(!m.formatted).equal(!formatted)
  //...   chai.expect(m.delimiter).equal(dlmtr)
  //...   chai.expect(m.content).equal(content)
  //... }
  //... ;[
  //...   [eYo.xre.shortstringliteralSingle, `'`, `foo`],
  //...   [eYo.xre.shortstringliteralDouble, `"`, `foo`],
  //...   [eYo.xre.shortstringliteralSingle, `'`, `f"o`],
  //...   [eYo.xre.shortstringliteralDouble, `"`, `f'o`],
  //...   [eYo.xre.longstringliteralSingle, `'''`, `fop`],
  //...   [eYo.xre.longstringliteralDouble, `"""`, `fop`],
  //...   [eYo.xre.longstringliteralSingle, `'''`, `f'p`],
  //...   [eYo.xre.longstringliteralDouble, `"""`, `f"p`],
  //...   [eYo.xre.longstringliteralSingle, `'''`, `''o`],
  //...   [eYo.xre.longstringliteralDouble, `"""`, `""o`],
  //...   [eYo.xre.longstringliteralSingle, `'''`, `f"""o`],
  //...   [eYo.xre.longstringliteralDouble, `"""`, `f'''o`],
  //... ].forEach($ => {
  //...   xre = $[0]
  //...   dlmtr = $[1]
  //...   content = $[2]
  //...   test(`${dlmtr}${content}${dlmtr}`, false, false, content)
  //...   ;['r', 'u', 'R', 'U'].forEach($$ => {
  //...     test(`${$$}${dlmtr}${content}${dlmtr}`, true, false, content)
  //...   })
  //...   ;['f', 'F', 'fr', 'Fr', 'fR', 'FR', 'rf', 'rF', 'Rf', 'RF'].forEach($$ => {
  //...     test(`${$$}${dlmtr}${content}${dlmtr}`, true, true, content)
  //...   })
  //... })
  //>>>
})

// bytes

eYo.mixinRO(eYo.xre, {
  $BYTE_NO_SINGLE_QUOTE: Symbol('BYTE_NO_SINGLE_QUOTE'),
  $BYTE_NO_DOUBLE_QUOTE: Symbol('BYTE_NO_DOUBLE_QUOTE'),
})

eYo.mixinRO(eYo.xre, {
  bytes: XRegExp(`^(?:[\\x20-\\x5B\\x5D-\\xFF]|
    \\\\[\\x0A\\x0D\\x20-\\xFF])*$`, 'x'),
  [eYo.xre.$BYTE_NO_SINGLE_QUOTE]: '(?:[\\x00-\\x26\\x28-\\x5B\\x5D-\\x7F]|\\\\[\\x00-\\xFF])',
  [eYo.xre.$BYTE_NO_DOUBLE_QUOTE]: '(?:[\\x00-\\x21\\x23-\\x5B\\x5D-\\x7F]|\\\\[\\x00-\\xFF])'
})

eYo.mixinRO(eYo.xre, {
  //<<< mochai: (short|long)bytesliteral(Single|Double)
  shortbytesliteralSingle: XRegExp(
    `^(?<prefix> b|B|br|Br|bR|BR|rb|rB|Rb|RB)
    (?<delimiter> (?<del> '))
    (?<content>
      ${eYo.xre[eYo.xre.$BYTE_NO_SINGLE_QUOTE]}*?
    )
    \\k<delimiter>$`, 'x'),
  shortbytesliteralDouble: XRegExp(
    `^(?<prefix> b|B|br|Br|bR|BR|rb|rB|Rb|RB)
    (?<delimiter> (?<del> "))
    (?<content>
      ${eYo.xre[eYo.xre.$BYTE_NO_DOUBLE_QUOTE]}*?
    )
    \\k<delimiter>$`, 'x'),
  longbytesliteralSingle: XRegExp(
    `^(?<prefix> b|B|br|Br|bR|BR|rb|rB|Rb|RB)
    (?<delimiter> (?<del> '){3})
    (?<content>
      (?:${eYo.xre[eYo.xre.$BYTE_NO_SINGLE_QUOTE]}|
        \\k<del>{1,2}(?!\\k<del>)|
        \\k<del>{1,2}(?=\\k<delimiter>$))*?
    )
    \\k<delimiter>$`, 'x'),
  longbytesliteralDouble: XRegExp(
    `^(?<prefix> b|B|br|Br|bR|BR|rb|rB|Rb|RB)
    (?<delimiter> (?<del> "){3})
    (?<content>
      (?:${eYo.xre[eYo.xre.$BYTE_NO_DOUBLE_QUOTE]}|
        \\k<del>{1,2}(?!\\k<del>)|
        \\k<del>{1,2}(?=\\k<delimiter>$))*?
    )
    \\k<delimiter>$`, 'x'),
  //... var xre, dlmtr, content
  //... let test = (s, prefix, content) => {
  //...   chai.assert(m = XRegExp.exec(s, xre), `${s}/${prefix}/${content}`)
  //...   chai.expect(!m.prefix).equal(!prefix)
  //...   chai.expect(m.delimiter).equal(dlmtr)
  //...   chai.expect(m.content).equal(content)
  //... }
  //... ;[
  //...   [eYo.xre.shortbytesliteralSingle, `'`, ``],
  //...   [eYo.xre.shortbytesliteralDouble, `"`, ``],
  //...   [eYo.xre.shortbytesliteralSingle, `'`, `foo`],
  //...   [eYo.xre.shortbytesliteralDouble, `"`, `foo`],
  //...   [eYo.xre.shortbytesliteralSingle, `'`, `""`],
  //...   [eYo.xre.shortbytesliteralDouble, `"`, `'`],
  //...   [eYo.xre.shortbytesliteralSingle, `'`, `f"o`],
  //...   [eYo.xre.shortbytesliteralDouble, `"`, `f'o`],
  //...   [eYo.xre.longbytesliteralSingle, `'''`, `foo`],
  //...   [eYo.xre.longbytesliteralDouble, `"""`, `foo`],
  //...   [eYo.xre.longbytesliteralSingle, `'''`, `f'o`],
  //...   [eYo.xre.longbytesliteralDouble, `"""`, `f"o`],
  //...   [eYo.xre.longbytesliteralSingle, `'''`, `''o`],
  //...   [eYo.xre.longbytesliteralDouble, `"""`, `""o`],
  //...   [eYo.xre.longbytesliteralSingle, `'''`, `f"""o`],
  //...   [eYo.xre.longbytesliteralDouble, `"""`, `f'''o`],
  //... ].forEach($ => {
  //...   xre = $[0]
  //...   dlmtr = $[1]
  //...   content = $[2]
  //...   ;['b', 'B', 'br', 'Br', 'bR', 'BR', 'rb', 'rB', 'Rb', 'RB'].forEach($$ => {
  //...     test(`${$$}${dlmtr}${content}${dlmtr}`, true, content)
  //...   })
  //... })
  //>>>
  shortbytesliteralSingleNoPrefix: XRegExp(
    `^(?<prefix> b|B|br|Br|bR|BR|rb|rB|Rb|RB)?
    (?<delimiter> ')
    (?<content>
      (?:${eYo.xre[eYo.xre.$BYTE_NO_SINGLE_QUOTE]})*?
    )
    \\k<delimiter>$`, 'x'),
  shortbytesliteralDoubleNoPrefix: XRegExp(
    `^(?<prefix> b|B|br|Br|bR|BR|rb|rB|Rb|RB)?
    (?<delimiter> ")
    (?<content>
      (?:${eYo.xre[eYo.xre.$BYTE_NO_DOUBLE_QUOTE]})*?
    )
    \\k<delimiter>$`, 'x'),
  longbytesliteralSingleNoPrefix: XRegExp(
    `^(?<prefix> b|B|br|Br|bR|BR|rb|rB|Rb|RB)?
    (?<delimiter> (?<del> '){3})
    (?<content>
      (?:${eYo.xre[eYo.xre.$BYTE_NO_SINGLE_QUOTE]}|
        \\k<del>{1,2}(?!\\k<del>)|
        \\k<del>{1,2}(?=\\k<delimiter>$))*?
    )
    \\k<delimiter>$`, 'x'),
  longbytesliteralDoubleNoPrefix: XRegExp(
    `^(?<prefix> b|B|br|Br|bR|BR|rb|rB|Rb|RB)?
    (?<delimiter> (?<del> "){3})
    (?<content>
      (?:${eYo.xre[eYo.xre.$BYTE_NO_DOUBLE_QUOTE]}|
        \\k<del>{1,2}(?!\\k<del>)|
        \\k<del>{1,2}(?=\\k<delimiter>$))*?
    )
    \\k<delimiter>$`, 'x')
  //<<< mochai: (short|long)bytesliteral(Single|Double)NoPrefix
  //... var xre, dlmtr, content
  //... let test = (s, prefix, content) => {
  //...   chai.assert(m = XRegExp.exec(s, xre))
  //...   chai.expect(!m.prefix).equal(!prefix)
  //...   chai.expect(m.delimiter).equal(dlmtr)
  //...   chai.expect(m.content).equal(content)
  //... }
  //... ;[
  //...   [eYo.xre.shortbytesliteralSingleNoPrefix, `'`, `foo`],
  //...   [eYo.xre.shortbytesliteralDoubleNoPrefix, `"`, `foo`],
  //...   [eYo.xre.shortbytesliteralSingleNoPrefix, `'`, `f"o`],
  //...   [eYo.xre.shortbytesliteralDoubleNoPrefix, `"`, `f'o`],
  //...   [eYo.xre.longbytesliteralSingleNoPrefix, `'''`, `foo`],
  //...   [eYo.xre.longbytesliteralDoubleNoPrefix, `"""`, `foo`],
  //...   [eYo.xre.longbytesliteralSingleNoPrefix, `'''`, `f'o`],
  //...   [eYo.xre.longbytesliteralDoubleNoPrefix, `"""`, `f"o`],
  //...   [eYo.xre.longbytesliteralSingleNoPrefix, `'''`, `''o`],
  //...   [eYo.xre.longbytesliteralDoubleNoPrefix, `"""`, `""o`],
  //...   [eYo.xre.longbytesliteralSingleNoPrefix, `'''`, `f"""o`],
  //...   [eYo.xre.longbytesliteralDoubleNoPrefix, `"""`, `f'''o`],
  //... ].forEach($ => {
  //...   xre = $[0]
  //...   dlmtr = $[1]
  //...   content = $[2]
  //...   test(`${dlmtr}${content}${dlmtr}`, false, content)
  //...   ;['b', 'B', 'br', 'Br', 'bR', 'BR', 'rb', 'rB', 'Rb', 'RB'].forEach($$ => {
  //...     test(`${$$}${dlmtr}${content}${dlmtr}`, true, content)
  //...   })
  //... })
  //>>>
})

// identifier

eYo.mixinRO(eYo.xre, {
  $IDENTIFIER: Symbol('IDENTIFIER'),
})

eYo.mixinRO(eYo.xre, {
  [eYo.xre.$IDENTIFIER]: `(?:
    (?:_|\\p{L}|\\p{Nl}) # at least one character
    (?:_|\\p{L}|\\p{Nl}|\\p{Mn}|\\p{Mc}|\\p{Nd}|\\p{Pc}
    )*
  )`,
  letter: XRegExp(`(?:_|\\p{L})`),
  //<<< mochai: letter
  //... xre = eYo.xre.letter
  //... chai.assert(m = XRegExp.exec('f', xre))
  //... chai.assert(m = XRegExp.exec('_', xre))
  //>>>
  id_start: XRegExp(`(?:_|\\p{L}|\\p{Nl}|\\u1885|\\u1886|\\u2118|\\u212E|\\u309B|\\u309C)`),
  //<<< mochai: id_start
  //... xre = eYo.xre.id_start
  //... chai.assert(XRegExp.exec('f', xre))
  //... chai.assert(XRegExp.exec('_', xre))
  //... chai.assert(!XRegExp.exec('0', xre))
  //>>>
  id_continue: XRegExp(`(?:_|\\p{L}|\\p{Nl}|\\p{Mn}|\\p{Mc}|\\p{Nd}|\\p{Pc}|\\u1885|\\u1886|\\u2118|\\u212E|\\u309B|\\u309C|\\u00B7|\\u0387|\\u1369|\\u136A|\\u136B|\\u136C|\\u136D|\\u136E|\\u136F|\\u1370|\\u1371|\\u19DA)`),
  //<<< mochai: id_continue
  //... xre = eYo.xre.id_continue
  //... chai.assert(XRegExp.exec('f', xre))
  //... chai.assert(XRegExp.exec('_', xre))
  //... chai.assert(XRegExp.exec('0', xre))
  //>>>
  tail_continue: XRegExp(`.*(?:_|\\p{L}|\\p{Nl}|\\p{Mn}|\\p{Mc}|\\p{Nd}|\\p{Pc}|\\u1885|\\u1886|\\u2118|\\u212E|\\u309B|\\u309C|\\u00B7|\\u0387|\\u1369|\\u136A|\\u136B|\\u136C|\\u136D|\\u136E|\\u136F|\\u1370|\\u1371|\\u19DA)$`)
  //<<< mochai: tail_continue
  //... xre = eYo.xre.tail_continue
  //... chai.assert(XRegExp.exec('foof', xre))
  //... chai.assert(XRegExp.exec('foo_', xre))
  //... chai.assert(XRegExp.exec('foo0', xre))
  //>>>
})

eYo.mixinRO(eYo.xre, {
  identifier: XRegExp(`^${eYo.xre[eYo.xre.$IDENTIFIER]}$`, 'x'),
  //<<< mochai: identifier
  //... xre = eYo.xre.identifier
  //... chai.assert(XRegExp.exec('foof', xre))
  //... chai.assert(XRegExp.exec('foo_', xre))
  //... chai.assert(XRegExp.exec('foo0', xre))
  //>>>
  dotted_name: XRegExp(`^(?:
    (?<dots>\\.*)
    (?:
      (?<holder>
        ${eYo.xre[eYo.xre.$IDENTIFIER]}
        (?:
          \\.(?: ${eYo.xre[eYo.xre.$IDENTIFIER]})?
        )*
      )
      \\.
    )?
  )
  (?<name> ${eYo.xre[eYo.xre.$IDENTIFIER]})?  # must match 'foo.bar.' for partial validation, hence the '?'
  $`, 'x'),
  //<<< mochai: dotted_name
  //... xre = eYo.xre.dotted_name
  //... ;['', '.', '..', '...'].forEach(dots => {
  //...   ;[eYo.NA, 'foo.', 'foo.chi.', 'foo.chi.mi'].forEach(holder => {
  //...     ;[eYo.NA, 'bar'].forEach(name => {
  //...       var s = `${dots}${holder ? holder + '.' : ''}${name||''}`
  //...       chai.assert(m = XRegExp.exec(s, xre))
  //...       chai.expect(m.dots).equal(dots)
  //...       chai.expect(m.holder).equal(holder)
  //...       chai.expect(m.name).equal(name)
  //...     })
  //...   })
  //... })
  //>>>
  identifier_annotated_valued: XRegExp(`^
    (?<name> ${eYo.xre[eYo.xre.$IDENTIFIER]})
    (?:\\s*[:]\\s*(?<annotated> ${eYo.xre[eYo.xre.$IDENTIFIER]}))?
    (?:\\s*=\\s*(?<valued> ${eYo.xre[eYo.xre.$IDENTIFIER]}))?
  $`, 'x')
  //<<< mochai: identifier_annotated_valued
  //... var xre = eYo.xre.identifier_annotated_valued
  //... ;[
  //...   {},
  //...   {annotated: true},
  //...   {valued: true},
  //...   {annotated: true, valued: true}
  //... ].forEach($ => {
  //...   var candidate = 'x'
  //...   if ($.annotated) {
  //...     var annotated = 'foo'
  //...     candidate += `: ${annotated}`
  //...   }
  //...   if ($.valued) {
  //...     var valued = 'bar'
  //...     candidate += ` = ${valued}`
  //...   }
  //...   m = XRegExp.exec(candidate, xre)
  //...   chai.assert(m, `FAIL exec: ${candidate}`)
  //...   chai.expect(m.name).equal('x')
  //...   chai.expect(m.annotated).equal(annotated)
  //...   chai.expect(m.valued).equal(valued)
  //... })
  //>>>
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

eYo.mixinRO(eYo.xre, {
  //<<< mochai: test builin
  //... var model = {
  //...   foo (builtin) {
  //...     builtin()
  //...   },
  //...   bar (builtinX) {
  //...     builtiniX()
  //...   }
  //... }
  //... var str = model.foo.toString()
  //... console.error(str)
  //... chai.assert(XRegExp.match(str, /^[^(]*\([^,]*builtin\b/))
  //... var str = model.bar.toString()
  //... chai.assert(!XRegExp.match(str, /^[^(]*\([^,]*builtin\b/))
  //>>>
  function_builtin_before: XRegExp('^[^(]*\\(\\s*(?<builtin>\\bbuiltin\\b)?(?:\\s*,\\s*)?(?<before>\\bbefore\\b)?'),
  //<<< mochai: function_builtin_before
  //... xre = eYo.xre.function_builtin_before
  //... let test = (s, builtin, before) => {
  //...   m = XRegExp.exec(s, xre)
  //...   chai.assert(m)
  //...   chai.expect(!m.builtin === !builtin, `${m.builtin}`)
  //...   chai.assert(!m.before === !before, `${m.before}`)
  //... }
  //... test('function ( builtin, before ) ...', true, true)
  //... test('function ( builtin, after ) ...', true, false)
  //... test('function ( before, after ) ...', false, true)
  //... test('function ( after ) ...', false, false)
  //>>>
  function_builtin: XRegExp('^[^(]*\\(\\s*\\bbuiltin\\b'),
  //<<< mochai: function_builtin
  //... xre = eYo.xre.function_builtin
  //... let test = (s, yorn) => {
  //...   m = XRegExp.exec(s, xre)
  //...   chai.expect(!!m).equal(yorn)
  //... }
  //... test('function ( builtin, before ) ...', true)
  //... test('function ( builtinX, before ) ...', false)
  //... test('function ( before, after ) ...', false)
  //>>>
  function_builtin_after: XRegExp('^[^(]*\\(\\s*\\bbuiltin\\b\\s*,\\s*\\bafter\\b'),
  //<<< mochai: function_builtin_after
  //... xre = eYo.xre.function_builtin_after
  //... let test = (s, yorn) => {
  //...   m = XRegExp.exec(s, xre)
  //...   chai.expect(!!m).equal(yorn)
  //... }
  //... test('function ( builtin, after ) ...', true)
  //... test('function ( builtinX, after ) ...', false)
  //... test('function ( builtin, afterX ) ...', false)
  //... test('function ( before, after ) ...', false)
  //>>>
  function_stored_after: XRegExp('^[^(]*\\(\\s*\\bstored\\b\\s*,\\s*\\bafter\\b'),
  //<<< mochai: function_stored_after
  //... xre = eYo.xre.function_stored_after
  //... let test = (s, yorn) => {
  //...   m = XRegExp.exec(s, xre)
  //...   chai.expect(!!m).equal(yorn)
  //... }
  //... test('function ( stored, after ) ...', true)
  //... test('function ( builtinX, after ) ...', false)
  //... test('function ( stored, afterX ) ...', false)
  //... test('function ( before, after ) ...', false)
  //>>>
  function_overriden: XRegExp('^[^(]*\\(\\s*\\boverriden\\b'),
  //<<< mochai: function_overriden
  //... xre = eYo.xre.function_overriden
  //... let test = (s, yorn) => {
  //...   m = XRegExp.exec(s, xre)
  //...   chai.expect(!!m).equal(yorn)
  //... }
  //... test('function ( overriden, after ) ...', true)
  //... test('function ( overridenX, after ) ...', false)
  //>>>
  CONST: XRegExp('^[A-Z_][A-Z_0-9]*$'),
  //<<< mochai: CONST
  //... xre = eYo.xre.CONST
  //... chai.assert(XRegExp.exec('FOO', xre))
  //>>>
})