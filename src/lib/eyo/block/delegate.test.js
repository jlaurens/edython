var assert = chai.assert

describe('Create', function() {
  it(`Basic`, function() {
    eYo.Test.setItUp()
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier)
    assert(b, 'MISSED 1')
    assert(b.eyo, 'MISSED 2')
    assert(b.eyo.change.count !== undefined, 'MISSED 3')
    b.dispose()
    eYo.Test.tearItDown()
  })
})
