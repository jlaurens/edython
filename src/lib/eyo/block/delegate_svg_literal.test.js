var assert = chai.assert
var expect = chai.expect

describe('Literals(String)', function() {
  it(`"abc"`, function() {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, `"abc"`)
    assert(b, `MISSING literal`)
    expect(b.outputConnection.check_).to.deep.equal([eYo.T3.Expr.shortstringliteral])
    assert(b.type === eYo.T3.Expr.shortstringliteral, `BAD TYPE: ${b.type}`)
  })
})
