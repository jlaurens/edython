NS = Object.create(null)
describe ('Tests: xre', function () {
  it ('XRE: basic', function () {
    chai.assert(XRegExp)
    chai.assert(eYo.XRE)
  })
  it  ('eYo.XRE.integer', function () {
    var m
    m = XRegExp.exec('1234567890123456789123', eYo.XRE.integer)
    chai.assert(m.decinteger, 'FAILURE')
    m = XRegExp.exec('00000', eYo.XRE.integer)
    chai.assert(m.decinteger, 'FAILURE')
    m = XRegExp.exec('0o0007', eYo.XRE.integer)
    chai.assert(m.octinteger, 'FAILURE')
    m = XRegExp.exec('0x0007', eYo.XRE.integer)
    chai.assert(m.hexinteger, 'FAILURE')
    m = XRegExp.exec('0x0007', eYo.XRE.integer)
    chai.assert(m.hexinteger, 'FAILURE')
    m = XRegExp.exec('0b0001', eYo.XRE.integer)
    chai.assert(m.bininteger, 'FAILURE')
  })
  it ('eYo.XRE.floatnumber', function () {
    m = XRegExp.exec('12345.', eYo.XRE.floatnumber)
    chai.assert(m.pointfloat, 'FAILURE')
    m = XRegExp.exec('012345.', eYo.XRE.floatnumber)
    chai.assert(m.pointfloat, 'FAILURE')
    m = XRegExp.exec('.0', eYo.XRE.floatnumber)
    chai.assert(m.pointfloat, 'FAILURE')
    m = XRegExp.exec('0e0', eYo.XRE.floatnumber)
    chai.assert(m.exponentfloat, 'FAILURE')
    m = XRegExp.exec('0e+0', eYo.XRE.floatnumber)
    chai.assert(m.exponentfloat, 'FAILURE')
    m = XRegExp.exec('0e-0', eYo.XRE.floatnumber)
    chai.assert(m.exponentfloat, 'FAILURE')
  })
  it ('eYo.XRE.function_builtin_before', function () {
    let test = (s, builtin, before) => {
      let m = XRegExp.exec(s, eYo.XRE.function_builtin_before)
      chai.assert(m)
      chai.assert(!m.builtin === !builtin, `${m.builtin}`)
      chai.assert(!m.before === !before, `${m.before}`)
    }
    test('function ( builtin, before ) ...', true, true)
    test('function ( builtin, after ) ...', true, false)
    test('function ( before, after ) ...', false, true)
    test('function ( after ) ...', false, false)
  })
  it ('eYo.XRE.function_builtin', function () {
    let test = (s, yorn) => {
      let m = XRegExp.exec(s, eYo.XRE.function_builtin)
      chai.assert(!!m === yorn)
    }
    test('function ( builtin, before ) ...', true)
    test('function ( builtinX, before ) ...', false)
    test('function ( before, after ) ...', false)
  })
  it ('eYo.XRE.function_builtin_after', function () {
    let test = (s, yorn) => {
      let m = XRegExp.exec(s, eYo.XRE.function_builtin_after)
      chai.assert(!!m === yorn)
    }
    test('function ( builtin, after ) ...', true)
    test('function ( builtinX, after ) ...', false)
    test('function ( before, after ) ...', false)
  })
  it ('eYo.XRE.function_before', function () {
    let test = (s, yorn) => {
      let m = XRegExp.exec(s, eYo.XRE.function_before)
      chai.assert(!!m === yorn)
    }
    test('function ( before,  ) ...', true)
    test('function ( beforeX,  ) ...', false)
    test('function ( after ) ...', false)
  })
})
