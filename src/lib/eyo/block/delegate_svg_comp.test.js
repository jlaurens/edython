var assert = chai.assert
var expect = chai.expect

describe('Comprehension', function() {
  it('comprehension || dict_comprehension', function() {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.comprehension)
    assert(b, `MISSING comprehension`)
    assert(b.outputConnection.check_.length === 2, 'BAD OUTPUT CHECK')
    expect(b.outputConnection.check_.sort()).to.deep.equal([eYo.T3.Expr.comprehension, eYo.T3.Expr.dict_comprehension].sort())
    assert(b.type === eYo.T3.Expr.comprehension, `BAD TYPE: ${b.type}`)
  })
  it('comprehension', function() {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.comprehension)
    assert(b, `MISSING comprehension`)
    b.eyo.expression_p = 'x'
    expect(b.outputConnection.check_).to.deep.equal([eYo.T3.Expr.comprehension])
    assert(b.type === eYo.T3.Expr.comprehension, `BAD TYPE: ${b.type}`)
  })
  it('comprehension', function() {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.comprehension)
    assert(b, `MISSING comprehension`)
    var bb = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, 'x')
    assert(bb, `MISSING bb`)
    assert(b.eyo.expression_s.connect(bb), 'MISSING connection')
    expect(b.outputConnection.check_).to.deep.equal([eYo.T3.Expr.comprehension])
    assert(b.type === eYo.T3.Expr.comprehension, `BAD TYPE: ${b.type}`)
  })
  it('dict_comprehension', function() {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.comprehension)
    assert(b, `MISSING comprehension`)
    var bb = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.key_datum)
    assert(bb, `MISSING bb`)
    assert(b.eyo.expression_s.connect(bb), 'MISSING connection')
    expect(b.outputConnection.check_).to.deep.equal([eYo.T3.Expr.dict_comprehension])
    assert(b.type === eYo.T3.Expr.dict_comprehension, `BAD TYPE: ${b.type}`)
  })
})
