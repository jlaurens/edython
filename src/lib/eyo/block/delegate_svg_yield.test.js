describe('YIELD expression and statement', function() {
  it(`Basic yield statement`, function() {
    var d = eYo.Test.new_dlgt(eYo.T3.Stmt.yield_stmt)
    eYo.Test.code(d, 'yield')
    eYo.Test.dlgt(d, 'yield_stmt')
    d.block_.dispose()
  })
  it(`Basic yield expression`, function() {
    var d = eYo.Test.new_dlgt(eYo.T3.Expr.yield_expr)
    eYo.Test.code(d, 'yield')
    eYo.Test.dlgt(d, 'yield_expr')
    d.block_.dispose()
  })
  it(`yield expression output`, function() {
    var d = eYo.Test.new_dlgt(eYo.T3.Expr.yield_expr)
    console.error(d.magnets.output.check_)
    d.block_.dispose()
  })
  it(`Variant`, function() {
    var d = eYo.Test.new_dlgt(eYo.T3.Stmt.yield_stmt)
    eYo.Test.code(d, 'yield')
    d.variant_p = eYo.Key.EXPRESSION
    eYo.Test.code(d, 'yield <MISSING EXPR>')
    d.variant_p = eYo.Key.FROM
    eYo.Test.code(d, 'yield from <MISSING EXPRESSION>')
    d.variant_p = eYo.Key.NONE
    eYo.Test.code(d, 'yield')
    d.block_.dispose()
  })
  it(`Variant`, function() {
    var d = eYo.Test.new_dlgt(eYo.T3.Expr.yield_expr)
    eYo.Test.code(d, 'yield')
    d.variant_p = eYo.Key.EXPRESSION
    eYo.Test.code(d, 'yield <MISSING EXPR>')
    d.variant_p = eYo.Key.FROM
    eYo.Test.code(d, 'yield from <MISSING EXPRESSION>')
    d.variant_p = eYo.Key.NONE
    eYo.Test.code(d, 'yield')
    d.block_.dispose()
  })
  it(`yield abc`, function() {
    var d = eYo.Test.new_dlgt(eYo.T3.Stmt.yield_stmt)
    d.expression_p = 'abc'
    eYo.Test.code(d, 'yield abc')
    d.expression_p = ''
    eYo.Test.code(d, 'yield')
    d.block_.dispose()
  })
  it(`yield <abc>`, function() {
    var d = eYo.Test.new_dlgt(eYo.T3.Stmt.yield_stmt)
    var t_eyo = d.expression_t
    t_eyo.connectLast(eYo.Test.new_dlgt(eYo.T3.Expr.identifier)).target_p = 'abc'
    eYo.Test.code(d, 'yield abc')
    eYo.Test.input_length(d.expression_b, 3)
    t_eyo.connectLast(eYo.Test.new_dlgt(eYo.T3.Expr.identifier)).target_p = 'bcd'
    eYo.Test.input_length(d.expression_b, 5)
    eYo.Test.code(d, 'yield abc, bcd')
    d.expression_s.unwrappedTarget.block_.dispose()
    eYo.Test.input_length(d.expression_b, 3)
    eYo.Test.code(d, 'yield bcd')
    d.expression_s.unwrappedTarget.block_.dispose()
    eYo.Test.code(d, 'yield')
    d.block_.dispose()
  })
  it(`yield abc -> yield <abc> -> yield abc`, function() {
    var d = eYo.DelegateSvg.newReady(Blockly.mainWorkspace, eYo.T3.Stmt.yield_stmt)
    d.eyo.expression_p = 'abc'
    eYo.Test.code(d, 'yield abc')
    var t_eyo = d.eyo.expression_t
    t_eyo.connectLast(eYo.Test.new_dlgt(eYo.T3.Expr.identifier)).target_p = 'bcd'
    eYo.Test.code(d, 'yield bcd')
    d.eyo.expression_s.unwrappedTarget.block_.dispose()
    eYo.Test.code(d, 'yield abc')
    d.eyo.expression_p = ''
    eYo.Test.code(d, 'yield')
    d.block_.dispose()
  })
  it(`yield from abc`, function() {
    var d = eYo.Test.new_dlgt(eYo.T3.Stmt.yield_stmt)
    d.from_p = 'abc'
    eYo.Test.data_value(d, 'from', 'abc')
    eYo.Test.variant(d, 'FROM')
    eYo.Test.code(d, 'yield from abc')
    d.from_p = ''
    eYo.Test.code(d, 'yield')
    d.block_.dispose()
  })
  it(`yield from <bcd>`, function() {
    var d = eYo.Test.new_dlgt(eYo.T3.Stmt.yield_stmt)
    d.from_s.connect(eYo.Test.new_dlgt(eYo.T3.Expr.identifier)).b_eyo.target_p = 'bcd'
    eYo.Test.code(d, 'yield from bcd')
    d.block_.dispose()
  })
  it(`yield from abc -> yield from <bcd> -> yield from abc -> yield`, function() {
    var d = eYo.Test.new_dlgt(eYo.T3.Stmt.yield_stmt)
    d.from_p = 'abc'
    eYo.Test.data_value(d, 'from', 'abc')
    eYo.Test.variant(d, 'FROM')
    eYo.Test.code(d, 'yield from abc')
    d.from_s.connect(eYo.Test.new_dlgt(eYo.T3.Expr.identifier)).b_eyo.target_p = 'bcd'
    eYo.Test.code(d, 'yield from bcd')
    d.from_b.dispose()
    eYo.Test.code(d, 'yield from abc')
    d.from_p = ''
    eYo.Test.code(d, 'yield')
    d.block_.dispose()
  })
})
