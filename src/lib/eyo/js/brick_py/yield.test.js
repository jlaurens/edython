describe('YIELD expression and statement', function() {
  it(`Basic yield statement`, function() {
    var d = eYo.Test.new_brick(eYo.t3.stmt.yield_stmt)
    eYo.Test.Code(d, 'yield')
    eYo.Test.Brick(d, 'yield_stmt')
    d.dispose()
  })
  it(`Basic yield expression`, function() {
    var d = eYo.Test.new_brick(eYo.t3.expr.yield_expr)
    eYo.Test.Code(d, 'yield')
    eYo.Test.Brick(d, 'yield_expr')
    d.dispose()
  })
  it(`yield expression output`, function() {
    var d = eYo.Test.new_brick(eYo.t3.expr.yield_expr)
    console.error(d.out_m.check_)
    d.dispose()
  })
  it(`Variant`, function() {
    var d = eYo.Test.new_brick(eYo.t3.stmt.yield_stmt)
    eYo.Test.Code(d, 'yield')
    d.Variant_p = eYo.key.EXPRESSION
    eYo.Test.Code(d, 'yield <MISSING EXPR>')
    d.Variant_p = eYo.key.FROM
    eYo.Test.Code(d, 'yield from <MISSING EXPRESSION>')
    d.Variant_p = eYo.key.NONE
    eYo.Test.Code(d, 'yield')
    d.dispose()
  })
  it(`Variant`, function() {
    var d = eYo.Test.new_brick(eYo.t3.expr.yield_expr)
    eYo.Test.Code(d, 'yield')
    d.Variant_p = eYo.key.EXPRESSION
    eYo.Test.Code(d, 'yield <MISSING EXPR>')
    d.Variant_p = eYo.key.FROM
    eYo.Test.Code(d, 'yield from <MISSING EXPRESSION>')
    d.Variant_p = eYo.key.NONE
    eYo.Test.Code(d, 'yield')
    d.dispose()
  })
  it(`yield abc`, function() {
    var d = eYo.Test.new_brick(eYo.t3.stmt.yield_stmt)
    d.Expression_p = 'abc'
    eYo.Test.Code(d, 'yield abc')
    d.Expression_p = ''
    eYo.Test.Code(d, 'yield')
    d.dispose()
  })
  it(`yield <abc>`, function() {
    var d = eYo.Test.new_brick(eYo.t3.stmt.yield_stmt)
    var t9k = d.expression_b
    t9k.connectLast(eYo.Test.new_brick(eYo.t3.expr.identifier)).Target_p = 'abc'
    eYo.Test.Code(d, 'yield abc')
    eYo.Test.Input_length(d.expression_b, 3)
    t9k.connectLast(eYo.Test.new_brick(eYo.t3.expr.identifier)).Target_p = 'bcd'
    eYo.Test.Input_length(d.expression_b, 5)
    eYo.Test.Code(d, 'yield abc, bcd')
    d.expression_s.unwrappedTarget.dispose()
    eYo.Test.Input_length(d.expression_b, 3)
    eYo.Test.Code(d, 'yield bcd')
    d.expression_s.unwrappedTarget.dispose()
    eYo.Test.Code(d, 'yield')
    d.dispose()
  })
  it(`yield abc -> yield <abc> -> yield abc`, function() {
    var d = eYo.brick.newReady(eYo.app.Board, eYo.t3.stmt.yield_stmt)
    d.Expression_p = 'abc'
    eYo.Test.Code(d, 'yield abc')
    var t9k = d.expression_b
    t9k.connectLast(eYo.Test.new_brick(eYo.t3.expr.identifier)).Target_p = 'bcd'
    eYo.Test.Code(d, 'yield bcd')
    d.expression_s.unwrappedTarget.dispose()
    eYo.Test.Code(d, 'yield abc')
    d.Expression_p = ''
    eYo.Test.Code(d, 'yield')
    d.dispose()
  })
  it(`yield from abc`, function() {
    var d = eYo.Test.new_brick(eYo.t3.stmt.yield_stmt)
    d.From_p = 'abc'
    eYo.Test.data_value(d, 'from', 'abc')
    eYo.Test.variant(d, 'FROM')
    eYo.Test.Code(d, 'yield from abc')
    d.From_p = ''
    eYo.Test.Code(d, 'yield')
    d.dispose()
  })
  it(`yield from <bcd>`, function() {
    var d = eYo.Test.new_brick(eYo.t3.stmt.yield_stmt)
    d.from_s.connect(eYo.Test.new_brick(eYo.t3.expr.identifier)).brick.Target_p = 'bcd'
    eYo.Test.Code(d, 'yield from bcd')
    d.dispose()
  })
  it(`yield from abc -> yield from <bcd> -> yield from abc -> yield`, function() {
    var d = eYo.Test.new_brick(eYo.t3.stmt.yield_stmt)
    d.From_p = 'abc'
    eYo.Test.data_value(d, 'from', 'abc')
    eYo.Test.variant(d, 'FROM')
    eYo.Test.Code(d, 'yield from abc')
    d.from_s.connect(eYo.Test.new_brick(eYo.t3.expr.identifier)).brick.Target_p = 'bcd'
    eYo.Test.Code(d, 'yield from bcd')
    d.from_b.dispose()
    eYo.Test.Code(d, 'yield from abc')
    d.From_p = ''
    eYo.Test.Code(d, 'yield')
    d.dispose()
  })
})
