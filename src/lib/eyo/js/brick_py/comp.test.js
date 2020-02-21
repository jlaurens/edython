describe('Comprehension (Basic)', function () {
  ;[
    ['comprehension'],
    ['dict_comprehension', 'comprehension']
  ].forEach(args => {
    it (`${args[0]}/${args[1] || args[0]}`, function () {
      eYo.test.new_brick(args[0], args[1] || args[0]).dispose()
    })
  })
})
describe('Comprehension', function() {
  it('comprehension || dict_comprehension', function() {
    var d = eYo.test.new_brick('comprehension')
    chai.assert(d.out_m.check_.length === 2, 'BAD OUT CHECK')
    eYo.test.expect_out_check(d, [eYo.t3.expr.comprehension, eYo.t3.expr.dict_comprehension])
    d.dispose()
  })
  it('comprehension', function() {
    var d = eYo.test.new_brick('comprehension')
    d.Expression_p = 'x'
    eYo.test.expect_out_check(d, eYo.t3.expr.comprehension)
    eYo.test.Brick(d, 'comprehension')
    d.dispose()
  })
  it('comprehension', function() {
    var d = eYo.test.new_brick('comprehension')
    var dd = eYo.test.newIdentifier('x')
    chai.assert(d.expression_s.connect(dd), 'MISSING connection')
    eYo.test.expect_out_check(d, eYo.t3.expr.comprehension)
    eYo.test.Brick(d, 'comprehension')
    d.dispose()
  })
  it('dict_comprehension', function() {
    var d = eYo.test.new_brick('comprehension')
    var dd = eYo.test.new_brick('key_datum')
    chai.assert(d.expression_s.connect(dd), 'MISSING connection')
    eYo.test.expect_out_check(d, eYo.t3.expr.dict_comprehension)
    eYo.test.Brick(d, 'dict_comprehension')
    d.dispose()
  })
  it('export comprehension', function() {
    var d = eYo.test.new_brick('comprehension')
    var d = eYo.xml.brickToDom(d)
    var dd = eYo.test.new_brick(d)
    eYo.test.Same(d, dd)
    d.dispose()
    dd.dispose()
  })
  it('export dict comprehension', function() {
    var d = eYo.test.new_brick('comprehension')
    var dd = eYo.test.new_brick('key_datum')
    chai.assert(d.expression_s.connect(dd), 'MISSING connection')
    eYo.test.Brick(d, 'dict_comprehension')
    var d = eYo.xml.brickToDom(d)
    var dd = eYo.test.new_brick(d)
    eYo.test.Same(d, dd)
    d.dispose()
    dd.dispose()
  })
})
