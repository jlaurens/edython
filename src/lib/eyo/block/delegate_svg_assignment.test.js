var assert = chai.assert

var g = eYo.GMR._PyParser_Grammar

console.log('RUNNING NODE/BLOCK TESTS')

describe('Assignment', function() {
  it('Test', function() {
    var b1 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Stmt.assignment_stmt)
    assert(b1, `MISSING assignment statement`)
    var b2 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.assignment_chain)
    assert(b2, `MISSING assignment expression`)
    var input = b1.eyo.value_s.target.lastInput
    input.connection.connect(b2.outputConnection)
    assert(input.connection.targetBlock() === b2, 'MISSED CONNECTION')
  })
})
