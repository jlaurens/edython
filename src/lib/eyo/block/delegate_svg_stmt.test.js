var assert = chai.assert

var g = eYo.GMR._PyParser_Grammar

describe('Rendering', function() {
  it('expression_stmt', function() {
    var b1 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Stmt.expression_stmt)
    assert(b1, `MISSING assignment expression`)
    assert(b1.eyo.comment_variant_p === eYo.Key.COMMENT, `MISSING ${b1.eyo.comment_variant_p} === ${eYo.Key.COMMENT}`)
  })
  it('expression_stmt(expr)', function() {
    var b1 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Stmt.expression_stmt)
    assert(b1, `MISSING assignment expression`)
    var b2 = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier)
    assert(b2, `MISSING identifier`)
    b1.eyo.variant_p = eYo.Key.EXPRESSION
    b1.eyo.comment_variant_p = eYo.Key.NONE
    assert(b1.eyo.variant_p === eYo.Key.EXPRESSION, `MISSING ${eYo.Key.EXPRESSION} === ${b1.eyo.variant_p}`)
    assert(b1.eyo.comment_variant_p === eYo.Key.NONE, `MISSING ${eYo.Key.NONE}`)
    b1.eyo.expression_s.connection.connect(b2.outputConnection)
    assert(b1.eyo.comment_variant_p === eYo.Key.NONE, `MISSING ${eYo.Key.NONE}`)
  })
})
