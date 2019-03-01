var assert = chai.assert

var g = eYo.GMR._PyParser_Grammar

describe('Rendering, IN PROGRESS', function() {
  it('Assignment expression', function() {
    var b1 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.assignment_expr)
    assert(b1, `MISSING assignment expression`)
  })
})
