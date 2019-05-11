describe('Comprehension (Basic)', function () {
  ;[
    ['comprehension'],
    ['dict_comprehension', 'comprehension']
  ].forEach(args => {
    it (`${args[0]}/${args[1] || args[0]}`, function () {
      eYo.Test.new_dlgt(args[0], args[1] || args[0]).block_.dispose()
    })
  })
})
describe('Comprehension', function() {
  it('comprehension || dict_comprehension', function() {
    var d = eYo.Test.new_dlgt('comprehension')
    chai.assert(d.magnets.output.check_.length === 2, 'BAD OUTPUT CHECK')
    eYo.Test.expect_out_check(d, [eYo.T3.Expr.comprehension, eYo.T3.Expr.dict_comprehension])
    d.block_.dispose()
  })
  it('comprehension', function() {
    var d = eYo.Test.new_dlgt('comprehension')
    d.expression_p = 'x'
    eYo.Test.expect_out_check(d, eYo.T3.Expr.comprehension)
    eYo.Test.dlgt(d, 'comprehension')
    d.block_.dispose()
  })
  it('comprehension', function() {
    var d = eYo.Test.new_dlgt('comprehension')
    var dd = eYo.Test.newIdentifier('x')
    chai.assert(d.expression_s.connect(dd), 'MISSING connection')
    eYo.Test.expect_out_check(d, eYo.T3.Expr.comprehension)
    eYo.Test.dlgt(d, 'comprehension')
    d.block_.dispose()
  })
  it('dict_comprehension', function() {
    var d = eYo.Test.new_dlgt('comprehension')
    var dd = eYo.Test.new_dlgt('key_datum')
    chai.assert(d.expression_s.connect(dd), 'MISSING connection')
    eYo.Test.expect_out_check(d, eYo.T3.Expr.dict_comprehension)
    eYo.Test.dlgt(d, 'dict_comprehension')
    d.block_.dispose()
  })
  it('export comprehension', function() {
    var d = eYo.Test.new_dlgt('comprehension')
    var d = eYo.Xml.dlgtToDom(d)
    var dd = eYo.Test.new_dlgt(d)
    eYo.Test.same(d, dd)
    d.block_.dispose()
    dd.block_.dispose()
  })
  it('export dict comprehension', function() {
    var d = eYo.Test.new_dlgt('comprehension')
    var dd = eYo.Test.new_dlgt('key_datum')
    chai.assert(d.expression_s.connect(dd), 'MISSING connection')
    eYo.Test.dlgt(d, 'dict_comprehension')
    var d = eYo.Xml.dlgtToDom(d)
    var dd = eYo.Test.new_dlgt(d)
    eYo.Test.same(d, dd)
    d.block_.dispose()
    dd.block_.dispose()
  })
})
