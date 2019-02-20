var assert = chai.assert;

console.log('RUNNING TOKENIZER TESTS')

/*
eYo.Do.readOnlyMixin(eYo.Scan, {
  ENDMARKER: 'ENDMARKER',
  NAME: 'NAME',
  NUMBER: 'NUMBER',
  STRING: 'STRING',
  NEWLINE: 'NEWLINE',
  INDENT: 'INDENT',
  DEDENT: 'DEDENT',
  LPAR: '(',
  RPAR: ')',
  LSQB: '[',
  RSQB: ']',
  COLON: ':',
  COMMA: ',',
  SEMI: ';',
  PLUS: '+',
  MINUS: '-',
  STAR: '*',
  SLASH: '/',
  VBAR: '|',
  AMPER: '&',
  LESS: '<',
  GREATER: '>',
  EQUAL: '=',
  DOT: '.',
  PERCENT: '%',
  LBRACE: '{',
  RBRACE: '}',
  EQEQUAL: '==',
  NOTEQUAL: '!=',
  LESSEQUAL: '<=',
  GREATEREQUAL: '>=',
  TILDE: '~',
  CIRCUMFLEX: '^',
  LEFTSHIFT: '<<',
  RIGHTSHIFT: '>>',
  DOUBLESTAR: '**',
  PLUSEQUAL: '+=',
  MINEQUAL: '-=',
  STAREQUAL: '*=',
  SLASHEQUAL: '/=',
  PERCENTEQUAL: '%=',
  AMPEREQUAL: '&=',
  VBAREQUAL: '|=',
  CIRCUMFLEXEQUAL: '^=',
  LEFTSHIFTEQUAL: '<<=',
  RIGHTSHIFTEQUAL: '>>=',
  DOUBLESTAREQUAL: '**=',
  DOUBLESLASH: '//',
  DOUBLESLASHEQUAL: '//=',
  AT: '@',
  ATEQUAL: '@=',
  RARROW: '->',
  ELLIPSIS: '...',
  COLONEQUAL: ':=',
  TYPE_IGNORE: 'TYPE_IGNORE',
  TYPE_COMMENT: 'TYPE_COMMENT',
  _EOL: '<EOL>',
  _COMMENT: '<COMMENT>',
  _WHITE_SPACE: '<WHITE_SPACE>',
  _ERROR: '<ERROR>',
  _CONTINUED: '<CONTINUED>',
  _E: {},
  _XRE: {}
})

*/

describe('Scan', function() {
  it('goog should be available', function() {
    assert(goog);
  });
  it('eYo.Scan should be available', function() {
    assert(eYo.Scan);
  });
});

describe('Scan(XRegExp)', function() {
  var key = 'XRegExp'
  it(key, function() {
    var str = 'a'
    var m = XRegExp.exec(str, eYo.Scan._XRE.id_start, 0, true)
    assert(m && (m[0] === str), `id_start ${str}`)
    str = 'ᢅ'
    m = XRegExp.exec(str, eYo.Scan._XRE.id_start, 0, true)
    assert(m && (m[0] === str), `id_start ${str}`)
    str = '·'
    m = XRegExp.exec(str, eYo.Scan._XRE.id_continue, 0, true)
    assert(m && (m[0] === str), `id_continue ${str}`)
    str = 'ᢅ·'
    m = XRegExp.exec(str, eYo.Scan._XRE.id_continue, 0, true)
    assert(m && (m[0] === str), `id_continue ${str}`)
  });
});

var Tester = function (...args) {
  this.done = 0
  this.keys = []
  this.strs = []
  strs = []
  var key, str
  while (args.length > 1) {
    key = args.shift()
    this.keys.push(key)
    str = args.shift()
    this.strs.push(str)
    strs.push(str)
  }
  if (args.length) {
    key = args.shift()
    this.keys.push(key)
    str = ''
    this.strs.push(str)
    strs.push(str)
  }
  this.string = strs.join('')
}
Tester.prototype.test = function (verbose = false, do_it = null) {
  var scan = new eYo.Scan()
  scan.init(this.string, true)
  var key
  while ((key = this.nextKey)) {
    scan.nextToken()
    assert(!scan.error, `<${scan.error}>`)
    assert(scan.tokens.length === this.done, `${scan.tokens.length} === ${this.done}`)
    assert(scan.last.type === eYo.Scan[key], `${scan.last.type} === ${eYo.Scan[key]}`)
    assert(scan.last.string === this.nextStr, `<${scan.last.string}> === <${this.nextStr}>`)
    do_it && do_it.call(this, scan)
  }
  assert(scan.string === scan.str, `<${scan.string}> === <${scan.str}>`)
  assert(!scan.nextToken(), `Unexpected last token <${scan.last}>`)
}
Object.defineProperties(Tester.prototype, {
  nextKey: {
    get () {
      ++this.done
      this._str = this.strs.shift()
      return this.keys.shift()
    }
  },
  nextStr: {
    get () {
      return this._str
    }
  }
})

describe('Scan(ENDMARKER)', function() {
  var tester = new Tester('ENDMARKER')
  it('ENDMARKER', function() {
    tester.test(true)
  });
});

describe('Scan(NAME)', function() {
  it('abc', function() {
    var tester = new Tester('NAME', 'abc', 'ENDMARKER')
    tester.test(true)
  });
  it('a1\u09B2\uff4d', function() {
    var tester = new Tester('NAME', 'a1\u09B2\uff4d', 'ENDMARKER')
    tester.test(true)
  });
  it('__a1', function() {
    var tester = new Tester('NAME', '__a1', 'ENDMARKER')
    tester.test(true)
  });
});

describe('Scan(NUMBER)', function() {
  it('7', function() {
    var tester = new Tester('NUMBER', '7', 'ENDMARKER')
    tester.test(true)
  });
  it('2147483647', function() {
    var tester = new Tester('NUMBER', '2147483647', 'ENDMARKER')
    tester.test(true)
  });
  it('0o177', function() {
    var tester = new Tester('NUMBER', '0o177', 'ENDMARKER')
    tester.test(true)
  });
  it('0b100110111', function() {
    var tester = new Tester('NUMBER', '0b100110111', 'ENDMARKER')
    tester.test(true)
  });
  it('79228162514264337593543950336', function() {
    var tester = new Tester('NUMBER', '79228162514264337593543950336', 'ENDMARKER')
    tester.test(true)
  });
  it('0o377', function() {
    var tester = new Tester('NUMBER', '0o377', 'ENDMARKER')
    tester.test(true)
  });
  it('0xdeadbeef', function() {
    var tester = new Tester('NUMBER', '0xdeadbeef', 'ENDMARKER')
    tester.test(true)
  });
  it('100_000_000_000', function() {
    var tester = new Tester('NUMBER', '100_000_000_000', 'ENDMARKER')
    tester.test(true)
  });
  it('0b_1110_0101', function() {
    var tester = new Tester('NUMBER', '0b_1110_0101', 'ENDMARKER')
    tester.test(true)
  });
  it('3.14', function() {
    var tester = new Tester('NUMBER', '3.14', 'ENDMARKER')
    tester.test(true)
  });
  it('10.', function() {
    var tester = new Tester('NUMBER', '10.', 'ENDMARKER')
    tester.test(true)
  });
  it('.001', function() {
    var tester = new Tester('NUMBER', '.001', 'ENDMARKER')
    tester.test(true)
  });
  it('1e100', function() {
    var tester = new Tester('NUMBER', '1e100', 'ENDMARKER')
    tester.test(true)
  });
  it('3.14e-10', function() {
    var tester = new Tester('NUMBER', '3.14e-10', 'ENDMARKER')
    tester.test(true)
  });
  it('0e0', function() {
    var tester = new Tester('NUMBER', '0e0', 'ENDMARKER')
    tester.test(true)
  });
  it('3.14_15_93', function() {
    var tester = new Tester('NUMBER', '3.14_15_93', 'ENDMARKER')
    tester.test(true)
  });
});

describe('Scan(STRING)', function() {
  it(`''`, function() {
    var tester = new Tester('STRING', `''`, 'ENDMARKER')
    tester.test(true)
  });
  it(`''''''`, function() {
    var tester = new Tester('STRING', `''''''`, 'ENDMARKER')
    tester.test(true)
  });
  it('""', function() {
    var tester = new Tester('STRING', '""', 'ENDMARKER')
    tester.test(true)
  });
  it('""""""', function() {
    var tester = new Tester('STRING', '""""""', 'ENDMARKER')
    tester.test(true)
  });
  it(`'abc'`, function() {
    var tester = new Tester('STRING', `'abc'`, 'ENDMARKER')
    tester.test(true)
  });
  it(`"""
  dfg
  klm
  """`, function() {
    var tester = new Tester('STRING', `"""
    dfg
    klm
    """`, 'ENDMARKER')
    tester.test(true)
  });
  it(`"""
  dfg
  klm
  """`, function() {
    var tester = new Tester('STRING', `f"""
    dfg
    klm
    """`, 'ENDMARKER')
    tester.test(true)
  });
});

describe('Scan(NEWLINE)', function() {
  it(`NEWLINE`, function() {
    var tester = new Tester('STRING', `f"""
    dfg
    klm
    """`, 'NEWLINE', `
`, 'ENDMARKER')
    tester.test(true)
  });
  it(`NEWLINE`, function() {
    var tester = new Tester('STRING', `'abc'`, 'NEWLINE', '\n', 'ENDMARKER')
    tester.test(true)
  });
  it(`NEWLINE`, function() {
    var tester = new Tester('STRING', `'abc'`, 'NEWLINE', '\r', 'ENDMARKER')
    tester.test(true)
  });
  it(`NEWLINE`, function() {
    var tester = new Tester('STRING', `'abc'`, 'NEWLINE', '\r\n', 'ENDMARKER')
    tester.test(true)
  });
});

describe('Scan(INDENT)', function() {
  it('INDENT', function() {
    var tester = new Tester(
      'INDENT', ' ',
      'NAME', 'x',
      'DEDENT', '',
      'ENDMARKER')
    tester.test(true)
  });
  it('INDENT_…^$', function() {
    var tester = new Tester(
      'INDENT', ' ',
      'NAME', 'x',
      'NEWLINE', '\n',
      'DEDENT', '',
      'ENDMARKER')
    tester.test(true)
  });
  it('INDENT_…=…^$', function() {
    var tester = new Tester(
      'INDENT', ' ',
      'NAME', 'x',
      'NEWLINE', '\n',
      '_WHITE_SPACE', ' ',
      'NAME', 'y',
      'DEDENT', '',
      'ENDMARKER')
    tester.test(true)
  });
  it('INDENT=…_…_…^^$', function() {
    var tester = new Tester(
      'NAME', 'a',
      'NEWLINE', '\n',
      'INDENT', ' ',
      'NAME', 'x',
      'NEWLINE', '\n',
      'INDENT', '  ',
      'NAME', 'y',
      'DEDENT', '',
      'DEDENT', '',
      'ENDMARKER')
    tester.test(true)
  });
  it('INDENT=…_…^…$', function() {
    var tester = new Tester(
      'NAME', 'a',
      'NEWLINE', '\n',
      'INDENT', ' ',
      'NAME', 'x',
      'NEWLINE', '\n',
      'DEDENT', '',
      'NAME', 'y',
      'ENDMARKER')
    tester.test(true)
  });
  it('INDENT=…_…_…^…^$', function() {
    var tester = new Tester(
      'NAME', 'a',
      'NEWLINE', '\n',
      'INDENT', ' ',
      'NAME', 'x',
      'NEWLINE', '\n',
      'INDENT', '  ',
      'NAME', 'u',
      'NEWLINE', '\n',
      'DEDENT', ' ',
      'NAME', 'y',
      'DEDENT', '',
      'ENDMARKER')
    tester.test(true)
  });
  it('INDENT=…_…_…^…^…$', function() {
    var tester = new Tester(
      'NAME', 'a',
      'NEWLINE', '\n',
      'INDENT', ' ',
      'NAME', 'x',
      'NEWLINE', '\n',
      'INDENT', '  ',
      'NAME', 'u',
      'NEWLINE', '\n',
      'DEDENT', ' ',
      'NAME', 'y',
      'NEWLINE', '\n',
      'DEDENT', '',
      'NAME', 't',
      'ENDMARKER')
    tester.test(true)
  });
  it('INDENT=…_…^…_…^$', function() {
    var tester = new Tester(
      'NAME', 'a',
      'NEWLINE', '\n',
      'INDENT', ' ',
      'NAME', 'x',
      'NEWLINE', '\n',
      'DEDENT', '',
      'NAME', 'u',
      'NEWLINE', '\n',
      'INDENT', ' ',
      'NAME', 'y',
      'NEWLINE', '\n',
      'DEDENT', '',
      'NAME', 't',
      'ENDMARKER')
    tester.test(true)
  });
  it('INDENT=…_…_…^^…$', function() {
    var tester = new Tester(
      'NAME', 'a',
      'NEWLINE', '\n',
      'INDENT', ' ',
      'NAME', 'x',
      'NEWLINE', '\n',
      'INDENT', '  ',
      'NAME', 'u',
      'NEWLINE', '\n',
      'DEDENT', '',
      'DEDENT', '',
      'NAME', 't',
      'ENDMARKER')
    tester.test(true)
  });
  it('INDENT=…_…^$', function() {
    var tester = new Tester(
      'NAME', 'a',
      'NEWLINE', '\n',
      'INDENT', ' ',
      'NAME', 'x',
      'NEWLINE', '\n',
      '_WHITE_SPACE', '  ',
      '_EOL', '\n',
      'DEDENT', '',
      'ENDMARKER')
    tester.test(true)
  });
  it('INDENT=…_…^…$', function() {
    var tester = new Tester(
      'NAME', 'a',
      'NEWLINE', '\n',
      'INDENT', ' ',
      'NAME', 'x',
      'NEWLINE', '\n',
      '_WHITE_SPACE', '  ',
      '_EOL', '\n',
      'DEDENT', '',
      'NAME', 'z',
      'ENDMARKER')
    tester.test(true)
  });
  it('INDENT=…_…=…^…$', function() {
    var tester = new Tester(
      'NAME', 'a',
      'NEWLINE', '\n',
      'INDENT', ' ',
      'NAME', 'x',
      'NEWLINE', '\n',
      '_WHITE_SPACE', '  ',
      '_EOL', '\n',
      '_WHITE_SPACE', ' ',
      'NAME', 'y',
      'NEWLINE', '\n',
      'DEDENT', '',
      'NAME', 'z',
      'ENDMARKER')
    tester.test(true)
  });
  it('INDENT=…_…#^$', function() {
    var tester = new Tester(
      'NAME', 'a',
      'NEWLINE', '\n',
      'INDENT', ' ',
      'NAME', 'x',
      'NEWLINE', '\n',
      '_WHITE_SPACE', '  ',
      '_COMMENT', '#',
      'DEDENT', '',
      'ENDMARKER')
    tester.test(true)
  });
  it('INDENT=…_…#^$', function() {
    var tester = new Tester(
      'NAME', 'a',
      'NEWLINE', '\n',
      'INDENT', ' ',
      'NAME', 'x',
      'NEWLINE', '\n',
      '_WHITE_SPACE', '  ',
      '_COMMENT', '#',
      '_EOL', '\n',
      'DEDENT', '',
      'ENDMARKER')
    tester.test(true)
  });
  it('INDENT=…_…#^…$', function() {
    var tester = new Tester(
      'NAME', 'a',
      'NEWLINE', '\n',
      'INDENT', ' ',
      'NAME', 'x',
      'NEWLINE', '\n',
      '_WHITE_SPACE', '  ',
      '_COMMENT', '#',
      '_EOL', '\n',
      'DEDENT', '',
      'NAME', 'z',
      'ENDMARKER')
    tester.test(true)
  });
  it('INDENT=…_…#=…^…$', function() {
    var tester = new Tester(
      'NAME', 'a',
      'NEWLINE', '\n',
      'INDENT', ' ',
      'NAME', 'x',
      'NEWLINE', '\n',
      '_WHITE_SPACE', '  ',
      '_COMMENT', '#',
      '_EOL', '\n',
      '_WHITE_SPACE', ' ',
      'NAME', 'y',
      'NEWLINE', '\n',
      'DEDENT', '',
      'NAME', 'z',
      'ENDMARKER')
    tester.test(true)
  });
});

describe('Scan(OP)', function() {
  it('ALL OPS 1/2', function() {
    var tester = new Tester(
      'LPAR', eYo.Scan.LPAR, // : '(',
      'RPAR', eYo.Scan.RPAR, // : ')',
      'LSQB', eYo.Scan.LSQB, // : '[',
      'RSQB', eYo.Scan.RSQB, // : ']',
      'COLON', eYo.Scan.COLON, // : ':',
      'COMMA', eYo.Scan.COMMA, // : ',',
      'SEMI', eYo.Scan.SEMI, // : ';',
      'PLUS', eYo.Scan.PLUS, // : '+',
      'MINUS', eYo.Scan.MINUS, // : '-',
      'STAR', eYo.Scan.STAR, // : '*',
      'SLASH', eYo.Scan.SLASH, // : '/',
      'VBAR', eYo.Scan.VBAR, // : '|',
      'AMPER', eYo.Scan.AMPER, // : '&',
      // 'LESS', eYo.Scan.LESS, // : '<', SPECIAL
      'GREATER', eYo.Scan.GREATER, // : '>',
      'ENDMARKER'
    )
    tester.test(true)
  });
  it('ALL OPS 2/2', function() {
    var tester = new Tester(
      'EQUAL', eYo.Scan.EQUAL, // : '=',
      'DOT', eYo.Scan.DOT, // : '.',
      'PERCENT', eYo.Scan.PERCENT, // : '%',
      'LBRACE', eYo.Scan.LBRACE, // : '{',
      'RBRACE', eYo.Scan.RBRACE, // : '}',
      'EQEQUAL', eYo.Scan.EQEQUAL, // : '==',
      'NOTEQUAL', eYo.Scan.NOTEQUAL, // : '!=',
      'LESSEQUAL', eYo.Scan.LESSEQUAL, // : '<=',
      'GREATEREQUAL', eYo.Scan.GREATEREQUAL, // : '>=',
      'TILDE', eYo.Scan.TILDE, // : '~',
      'CIRCUMFLEX', eYo.Scan.CIRCUMFLEX, // : '^',
      'LEFTSHIFT', eYo.Scan.LEFTSHIFT, // : '<<',
      'RIGHTSHIFT', eYo.Scan.RIGHTSHIFT, // : '>>',
      'DOUBLESTAR', eYo.Scan.DOUBLESTAR, // : '**',
      'PLUSEQUAL', eYo.Scan.PLUSEQUAL, // : '+=',
      'MINEQUAL', eYo.Scan.MINEQUAL, // : '-=',
      'STAREQUAL', eYo.Scan.STAREQUAL, // : '*=',
      'SLASHEQUAL', eYo.Scan.SLASHEQUAL, // : '/=',
      'PERCENTEQUAL', eYo.Scan.PERCENTEQUAL, // : '%=',
      'AMPEREQUAL', eYo.Scan.AMPEREQUAL, // : '&=',
      'VBAREQUAL', eYo.Scan.VBAREQUAL, // : '|=',
      'CIRCUMFLEXEQUAL', eYo.Scan.CIRCUMFLEXEQUAL, // : '^=',
      'LEFTSHIFTEQUAL', eYo.Scan.LEFTSHIFTEQUAL, // : '<<=',
      'RIGHTSHIFTEQUAL', eYo.Scan.RIGHTSHIFTEQUAL, // : '>>=',
      'DOUBLESTAREQUAL', eYo.Scan.DOUBLESTAREQUAL, // : '**=',
      'DOUBLESLASH', eYo.Scan.DOUBLESLASH, // : '//',
      'DOUBLESLASHEQUAL', eYo.Scan.DOUBLESLASHEQUAL, // : '//=',
      'AT', eYo.Scan.AT, // : '@',
      'ATEQUAL', eYo.Scan.ATEQUAL, // : '@=',
      'RARROW', eYo.Scan.RARROW, // : '->',
      'ELLIPSIS', eYo.Scan.ELLIPSIS, // : '...',
      'COLONEQUAL', eYo.Scan.COLONEQUAL, // : ':='
      'ENDMARKER'
    )
    tester.test(true)
  });
  it('LESS', function() {
    var tester = new Tester('NOTEQUAL', '<>', 'ENDMARKER')
    tester.test(true)
  });
});

describe('Scan(_KEYWORD)', function() {
  var kws = [
    'False',
    'None',
    'True',
    'await',
    'and',
    'as',
    'assert',
    'async',
    'break',
    'class',
    'continue',
    'def',
    'del',
    'elif',
    'else',
    'except',
    'finally',
    'for',
    'from',
    'global',
    'if',
    'import',
    'in',
    'is',
    'lambda',
    'nonlocal',
    'not',
    'or',
    'pass',
    'raise',
    'return',
    'try',
    'while',
    'with',
    'yield'
  ]
  var i = 0
  for (i = 0 ; i < kws.length ; ++i) {
    var f = kw => {
      return function() {
        var tester = new Tester('_KEYWORD', kw, 'ENDMARKER')
        tester.test(true, function (scan) {
          assert(scan.first.subtype === kw, `${scan.first.subtype} !== ${kw}`)
        })
      }
    }
    it(kws[i], f(kws[i])) 
  }
});

console.log('DONE')
