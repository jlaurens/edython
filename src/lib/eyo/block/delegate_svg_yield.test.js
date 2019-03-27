describe('YIELD expression and statement', function() {
  it(`Basic yield statement`, function() {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Stmt.yield_stmt)
    eYo.Test.code(b, 'yield')
    eYo.Test.block(b, 'yield_stmt')
    b.dispose()
  })
  it(`Basic yield expression`, function() {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.yield_expr)
    eYo.Test.code(b, 'yield')
    eYo.Test.block(b, 'yield_expr')
    b.dispose()
  })
  it(`yield expression output`, function() {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.yield_expr)
    console.error(b.outputConnection.check_)
    b.dispose()
  })
  it(`Variant`, function() {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Stmt.yield_stmt)
    eYo.Test.code(b, 'yield')
    b.eyo.variant_p = eYo.Key.EXPRESSION
    eYo.Test.code(b, 'yield <MISSING EXPR>')
    b.eyo.variant_p = eYo.Key.FROM
    eYo.Test.code(b, 'yield from <MISSING EXPRESSION>')
    b.eyo.variant_p = eYo.Key.NONE
    eYo.Test.code(b, 'yield')
    b.dispose()
  })
  it(`Variant`, function() {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.yield_expr)
    eYo.Test.code(b, 'yield')
    b.eyo.variant_p = eYo.Key.EXPRESSION
    eYo.Test.code(b, 'yield <MISSING EXPR>')
    b.eyo.variant_p = eYo.Key.FROM
    eYo.Test.code(b, 'yield from <MISSING EXPRESSION>')
    b.eyo.variant_p = eYo.Key.NONE
    eYo.Test.code(b, 'yield')
    b.dispose()
  })
  it(`yield abc`, function() {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Stmt.yield_stmt)
    b.eyo.expression_p = 'abc'
    eYo.Test.code(b, 'yield abc')
    b.eyo.expression_p = ''
    eYo.Test.code(b, 'yield')
    b.dispose()
  })
  it(`yield <abc>`, function() {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Stmt.yield_stmt)
    var t_eyo = b.eyo.expression_b.eyo
    t_eyo.lastConnect(eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier)).target_p = 'abc'
    eYo.Test.code(b, 'yield abc')
    eYo.Test.input_length(b.eyo.expression_b, 3)
    t_eyo.lastConnect(eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier)).target_p = 'bcd'
    eYo.Test.input_length(b.eyo.expression_b, 5)
    eYo.Test.code(b, 'yield abc, bcd')
    b.eyo.expression_s.unwrappedTarget.block_.dispose()
    eYo.Test.input_length(b.eyo.expression_b, 3)
    eYo.Test.code(b, 'yield bcd')
    b.eyo.expression_s.unwrappedTarget.block_.dispose()
    eYo.Test.code(b, 'yield')
    b.dispose()
  })
  it(`yield abc -> yield <abc> -> yield abc`, function() {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Stmt.yield_stmt)
    b.eyo.expression_p = 'abc'
    eYo.Test.code(b, 'yield abc')
    var t_eyo = b.eyo.expression_b.eyo
    t_eyo.lastConnect(eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier)).target_p = 'bcd'
    eYo.Test.code(b, 'yield bcd')
    b.eyo.expression_s.unwrappedTarget.block_.dispose()
    eYo.Test.code(b, 'yield abc')
    b.eyo.expression_p = ''
    eYo.Test.code(b, 'yield')
    b.dispose()
  })
  it(`yield from abc`, function() {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Stmt.yield_stmt)
    b.eyo.from_p = 'abc'
    eYo.Test.data_value(b, 'from', 'abc')
    eYo.Test.variant(b, 'FROM')
    eYo.Test.code(b, 'yield from abc')
    b.eyo.from_p = ''
    eYo.Test.code(b, 'yield')
    b.dispose()
  })
  it(`yield from <bcd>`, function() {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Stmt.yield_stmt)
    b.eyo.from_s.connect(eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier)).target_p = 'bcd'
    eYo.Test.code(b, 'yield from bcd')
    b.dispose()
  })
  it(`yield from abc -> yield from <bcd> -> yield from abc -> yield`, function() {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Stmt.yield_stmt)
    b.eyo.from_p = 'abc'
    eYo.Test.data_value(b, 'from', 'abc')
    eYo.Test.variant(b, 'FROM')
    eYo.Test.code(b, 'yield from abc')
    b.eyo.from_s.connect(eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier)).target_p = 'bcd'
    eYo.Test.code(b, 'yield from bcd')
    b.eyo.from_b.dispose()
    eYo.Test.code(b, 'yield from abc')
    b.eyo.from_p = ''
    eYo.Test.code(b, 'yield')
    b.dispose()
  })
})
