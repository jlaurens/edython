describe ('Tests: xre', function () {
  it ('XRE: basic', function () {
    chai.assert(XRegExp)
    chai.assert(eYo.xre)
  })
  it  ('eYo.xre.integer', function () {
    var m
    m = XRegExp.exec('1234567890123456789123', eYo.xre.integer)
    chai.assert(m.decinteger, 'FAILURE')
    m = XRegExp.exec('00000', eYo.xre.integer)
    chai.assert(m.decinteger, 'FAILURE')
    m = XRegExp.exec('0o0007', eYo.xre.integer)
    chai.assert(m.octinteger, 'FAILURE')
    m = XRegExp.exec('0x0007', eYo.xre.integer)
    chai.assert(m.hexinteger, 'FAILURE')
    m = XRegExp.exec('0x0007', eYo.xre.integer)
    chai.assert(m.hexinteger, 'FAILURE')
    m = XRegExp.exec('0b0001', eYo.xre.integer)
    chai.assert(m.bininteger, 'FAILURE')
  })
  it ('eYo.xre.floatnumber', function () {
    m = XRegExp.exec('12345.', eYo.xre.floatnumber)
    chai.assert(m.pointfloat, 'FAILURE')
    m = XRegExp.exec('012345.', eYo.xre.floatnumber)
    chai.assert(m.pointfloat, 'FAILURE')
    m = XRegExp.exec('.0', eYo.xre.floatnumber)
    chai.assert(m.pointfloat, 'FAILURE')
    m = XRegExp.exec('0e0', eYo.xre.floatnumber)
    chai.assert(m.exponentfloat, 'FAILURE')
    m = XRegExp.exec('0e+0', eYo.xre.floatnumber)
    chai.assert(m.exponentfloat, 'FAILURE')
    m = XRegExp.exec('0e-0', eYo.xre.floatnumber)
    chai.assert(m.exponentfloat, 'FAILURE')
  })
  it ('eYo.xre.function_builtin_before', function () {
    let test = (s, builtin, before) => {
      let m = XRegExp.exec(s, eYo.xre.function_builtin_before)
      chai.assert(m)
      chai.assert(!m.builtin === !builtin, `${m.builtin}`)
      chai.assert(!m.before === !before, `${m.before}`)
    }
    test('function ( builtin, before ) ...', true, true)
    test('function ( builtin, after ) ...', true, false)
    test('function ( before, after ) ...', false, true)
    test('function ( after ) ...', false, false)
  })
  it ('eYo.xre.function_builtin', function () {
    let test = (s, yorn) => {
      let m = XRegExp.exec(s, eYo.xre.function_builtin)
      chai.assert(!!m === yorn)
    }
    test('function ( builtin, before ) ...', true)
    test('function ( builtinX, before ) ...', false)
    test('function ( before, after ) ...', false)
  })
  it ('eYo.xre.function_builtin_after', function () {
    let test = (s, yorn) => {
      let m = XRegExp.exec(s, eYo.xre.function_builtin_after)
      chai.assert(!!m === yorn)
    }
    test('function ( builtin, after ) ...', true)
    test('function ( builtinX, after ) ...', false)
    test('function ( before, after ) ...', false)
  })
  it ('eYo.xre.function_before', function () {
    let test = (s, yorn) => {
      let m = XRegExp.exec(s, eYo.xre.function_before)
      chai.assert(!!m === yorn)
    }
    test('function ( before,  ) ...', true)
    test('function ( beforeX,  ) ...', false)
    test('function ( after ) ...', false)
  })
})
