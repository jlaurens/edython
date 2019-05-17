describe('Comprehension (Basic)', function () {
  ;[
    ['comprehension'],
    ['dict_comprehension', 'comprehension']
  ].forEach(args => {
    it (`${args[0]}/${args[1] || args[0]}`, function () {
      eYo.Test.new_brick(args[0], args[1] || args[0]).dispose()
    })
  })
})
describe('Comprehension', function() {
  it('comprehension || dict_comprehension', function() {
    var d = eYo.Test.new_brick('comprehension')
    chai.assert(d.out_m.check_.length === 2, 'BAD OUTPUT CHECK')
    eYo.Test.expect_out_check(d, [eYo.T3.Expr.comprehension, eYo.T3.Expr.dict_comprehension])
    d.dispose()
  })
  it('comprehension', function() {
    var d = eYo.Test.new_brick('comprehension')
    d.expression_p = 'x'
    eYo.Test.expect_out_check(d, eYo.T3.Expr.comprehension)
    eYo.Test.brick(d, 'comprehension')
    d.dispose()
  })
  it('comprehension', function() {
    var d = eYo.Test.new_brick('comprehension')
    var dd = eYo.Test.newIdentifier('x')
    chai.assert(d.expression_s.connect(dd), 'MISSING connection')
    eYo.Test.expect_out_check(d, eYo.T3.Expr.comprehension)
    eYo.Test.brick(d, 'comprehension')
    d.dispose()
  })
  it('dict_comprehension', function() {
    var d = eYo.Test.new_brick('comprehension')
    var dd = eYo.Test.new_brick('key_datum')
    chai.assert(d.expression_s.connect(dd), 'MISSING connection')
    eYo.Test.expect_out_check(d, eYo.T3.Expr.dict_comprehension)
    eYo.Test.brick(d, 'dict_comprehension')
    d.dispose()
  })
  it('export comprehension', function() {
    var d = eYo.Test.new_brick('comprehension')
    var d = eYo.Xml.brickToDom(d)
    var dd = eYo.Test.new_brick(d)
    eYo.Test.same(d, dd)
    d.dispose()
    dd.dispose()
  })
  it('export dict comprehension', function() {
    var d = eYo.Test.new_brick('comprehension')
    var dd = eYo.Test.new_brick('key_datum')
    chai.assert(d.expression_s.connect(dd), 'MISSING connection')
    eYo.Test.brick(d, 'dict_comprehension')
    var d = eYo.Xml.brickToDom(d)
    var dd = eYo.Test.new_brick(d)
    eYo.Test.same(d, dd)
    d.dispose()
    dd.dispose()
  })
})
