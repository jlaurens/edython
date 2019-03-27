describe('Comprehension (Basic)', function () {
  ;[
    ['comprehension'],
    ['dict_comprehension', 'comprehension']
  ].forEach(args => {
    it (`${args[0]}/${args[1] || args[0]}`, function () {
      eYo.Test.new_block(args[0], args[1] || args[0]).dispose()
    })
  })
})
describe('Comprehension', function() {
  it('comprehension || dict_comprehension', function() {
    var b = eYo.Test.new_block('comprehension')
    chai.assert(b.outputConnection.check_.length === 2, 'BAD OUTPUT CHECK')
    eYo.Test.expect_out_check(b, [eYo.T3.Expr.comprehension, eYo.T3.Expr.dict_comprehension])
    b.dispose()
  })
  it('comprehension', function() {
    var b = eYo.Test.new_block('comprehension')
    b.eyo.expression_p = 'x'
    eYo.Test.expect_out_check(b, eYo.T3.Expr.comprehension)
    eYo.Test.block(b, 'comprehension')
    b.dispose()
  })
  it('comprehension', function() {
    var b = eYo.Test.new_block('comprehension')
    var bb = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, 'x')
    eYo.Test.block(bb, `identifier`)
    chai.assert(b.eyo.expression_s.connect(bb), 'MISSING connection')
    eYo.Test.expect_out_check(b, eYo.T3.Expr.comprehension)
    eYo.Test.block(b, 'comprehension')
  })
  it('dict_comprehension', function() {
    var b = eYo.Test.new_block('comprehension')
    var bb = eYo.Test.new_block('key_datum')
    chai.assert(b.eyo.expression_s.connect(bb), 'MISSING connection')
    eYo.Test.expect_out_check(b, eYo.T3.Expr.dict_comprehension)
    eYo.Test.block(b, 'dict_comprehension')
  })
  it('export comprehension', function() {
    var b = eYo.Test.new_block('comprehension')
    var d = eYo.Xml.blockToDom(b)
    var bb = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, d)
    eYo.Test.same(b, bb)
    b.dispose()
    bb.dispose()
  })
  it('export dict comprehension', function() {
    var b = eYo.Test.new_block('comprehension')
    var bb = eYo.Test.new_block('key_datum')
    chai.assert(b.eyo.expression_s.connect(bb), 'MISSING connection')
    eYo.Test.block(b, 'dict_comprehension')
    var d = eYo.Xml.blockToDom(b)
    var bb = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, d)
    eYo.Test.same(b, bb)
  })
})
