describe('YIELD expression and statement', function() {
  it(`Basic yield statement`, function() {
    var d = eYo.test.new_brick(eYo.t3.stmt.yield_stmt)
    eYo.test.Code(d, 'yield')
    eYo.test.brick(d, 'yield_stmt')
    d.dispose()
  })
  it(`Basic yield expression`, function() {
    var d = eYo.test.new_brick(eYo.t3.expr.yield_expr)
    eYo.test.Code(d, 'yield')
    eYo.test.brick(d, 'yield_expr')
    d.dispose()
  })
  it(`yield expression output`, function() {
    var d = eYo.test.new_brick(eYo.t3.expr.yield_expr)
    console.error(d.out_m.check_)
    d.dispose()
  })
  it(`Variant`, function() {
    var d = eYo.test.new_brick(eYo.t3.stmt.yield_stmt)
    eYo.test.Code(d, 'yield')
    d.Variant_p = eYo.key.EXPRESSION
    eYo.test.Code(d, 'yield <MISSING EXPR>')
    d.Variant_p = eYo.key.FROM
    eYo.test.Code(d, 'yield from <MISSING EXPRESSION>')
    d.Variant_p = eYo.key.NONE
    eYo.test.Code(d, 'yield')
    d.dispose()
  })
  it(`Variant`, function() {
    var d = eYo.test.new_brick(eYo.t3.expr.yield_expr)
    eYo.test.Code(d, 'yield')
    d.Variant_p = eYo.key.EXPRESSION
    eYo.test.Code(d, 'yield <MISSING EXPR>')
    d.Variant_p = eYo.key.FROM
    eYo.test.Code(d, 'yield from <MISSING EXPRESSION>')
    d.Variant_p = eYo.key.NONE
    eYo.test.Code(d, 'yield')
    d.dispose()
  })
  it(`yield abc`, function() {
    var d = eYo.test.new_brick(eYo.t3.stmt.yield_stmt)
    d.Expression_p = 'abc'
    eYo.test.Code(d, 'yield abc')
    d.Expression_p = ''
    eYo.test.Code(d, 'yield')
    d.dispose()
  })
  it(`yield <abc>`, function() {
    var d = eYo.test.new_brick(eYo.t3.stmt.yield_stmt)
    var t9k = d.expression_b
    t9k.connectLast(eYo.test.new_brick(eYo.t3.expr.identifier)).Target_p = 'abc'
    eYo.test.Code(d, 'yield abc')
    eYo.test.Input_length(d.expression_b, 3)
    t9k.connectLast(eYo.test.new_brick(eYo.t3.expr.identifier)).Target_p = 'bcd'
    eYo.test.Input_length(d.expression_b, 5)
    eYo.test.Code(d, 'yield abc, bcd')
    d.expression_s.unwrappedTarget.dispose()
    eYo.test.Input_length(d.expression_b, 3)
    eYo.test.Code(d, 'yield bcd')
    d.expression_s.unwrappedTarget.dispose()
    eYo.test.Code(d, 'yield')
    d.dispose()
  })
  it(`yield abc -> yield <abc> -> yield abc`, function() {
    var d = eYo.brick.newReady(eYo.board, eYo.t3.stmt.yield_stmt)
    d.Expression_p = 'abc'
    eYo.test.Code(d, 'yield abc')
    var t9k = d.expression_b
    t9k.connectLast(eYo.test.new_brick(eYo.t3.expr.identifier)).Target_p = 'bcd'
    eYo.test.Code(d, 'yield bcd')
    d.expression_s.unwrappedTarget.dispose()
    eYo.test.Code(d, 'yield abc')
    d.Expression_p = ''
    eYo.test.Code(d, 'yield')
    d.dispose()
  })
  it(`yield from abc`, function() {
    var d = eYo.test.new_brick(eYo.t3.stmt.yield_stmt)
    d.From_p = 'abc'
    eYo.test.data_value(d, 'from', 'abc')
    eYo.test.variant(d, 'FROM')
    eYo.test.Code(d, 'yield from abc')
    d.From_p = ''
    eYo.test.Code(d, 'yield')
    d.dispose()
  })
  it(`yield from <bcd>`, function() {
    var d = eYo.test.new_brick(eYo.t3.stmt.yield_stmt)
    d.from_s.connect(eYo.test.new_brick(eYo.t3.expr.identifier)).brick.Target_p = 'bcd'
    eYo.test.Code(d, 'yield from bcd')
    d.dispose()
  })
  it(`yield from abc -> yield from <bcd> -> yield from abc -> yield`, function() {
    var d = eYo.test.new_brick(eYo.t3.stmt.yield_stmt)
    d.From_p = 'abc'
    eYo.test.data_value(d, 'from', 'abc')
    eYo.test.variant(d, 'FROM')
    eYo.test.Code(d, 'yield from abc')
    d.from_s.connect(eYo.test.new_brick(eYo.t3.expr.identifier)).brick.Target_p = 'bcd'
    eYo.test.Code(d, 'yield from bcd')
    d.from_b.dispose()
    eYo.test.Code(d, 'yield from abc')
    d.From_p = ''
    eYo.test.Code(d, 'yield')
    d.dispose()
  })
})
