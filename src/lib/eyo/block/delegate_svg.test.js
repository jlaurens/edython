var assert = chai.assert

describe('Create', function() {
  it(`Basic`, function() {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier)
    assert(b, 'MISSED 1')
    assert(b.eyo, 'MISSED 2')
    assert(b.eyo.change.count !== undefined, 'MISSED 3')
  })
})

describe('One block (ALIASED)', function () {
  it (`white space before 'as'`, function () {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, {
      type: eYo.T3.Expr.identifier,
      target_d: 'abc',
      alias_d: 'cde'
    })
    console.error(b.eyo.toString)
  })
})
