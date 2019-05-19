eYo.Test.no_brick_type = true

describe('Span expression', function () {
  var type = 'test_expr_span'
  eYo.Brick.Expr.makeSubclass(type, {
    out: {
      check: null
    }
  })  
  var b = eYo.Test.new_brick(type)
  var s = b.span
  chai.assert(b.isExpr, 'MISSED')
  var type = 'test_stmt_span'
  eYo.Brick.Stmt.makeSubclass(type, {
    out: {
      check: null
    }
  })  
  var b_s = eYo.Test.new_brick(type)
  var s_s = b_s.span
  chai.assert(b_s.isStmt, 'MISSED')
  var type = 'test_group_span'
  eYo.Brick.Group.makeSubclass(type, {
    out: {
      check: null
    }
  })  
  var b_g = eYo.Test.new_brick(type)
  var s_g = b_g.span
  chai.assert(b_g.isGroup, 'MISSED')
  
  it('(add|reset)C', function() {
    var test = c => eYo.Test.span(b, {
      c_min: c,
      c: c,
    })
    s.addC(1)
    test(3)
    s.addC(2)
    test(5)
    s.addC(-1)
    test(4)
    s.addC(-2)
    test(2)
    s.addC(2)
    test(4)
    s.resetC()
    test(2)
  })
  it ('(re)setPadding', function () {
    var test = p => eYo.Test.span(b, {
      c_padding: p,
      c: 2 + p,
    })
    test(0)
    s.setPadding(1)
    test(1)
    s.setPadding(2)
    test(2)
    s.setPadding(0)
    test(0)
    s.setPadding(2)
    test(2)
    s.resetPadding()
    test(0)
  })
  it ('addHeader', function () {
    var test = h => eYo.Test.span(b, {
      header: h,
      l: 1 + h,
    })
    s.resetL()
    test(0)
    s.addHeader(1)
    test(1)
    s.addHeader(2)
    test(3)
    s.addHeader(-1)
    test(2)
    s.addHeader(-2)
    test(0  )
    s.addHeader(2)
    test(2)
    s.resetL()
    test(0)
  })
  it ('addMain', function () {
    var test = h => eYo.Test.span(b, {
      main: 1 + h,
      l: 1 + h,
    })
    s.resetL()
    test(0)
    s.addMain(1)
    test(1)
    s.addMain(2)
    test(3)
    s.addMain(-1)
    test(2)
    s.addMain(-2)
    test(0)
    s.addMain(2)
    test(2)
    s.resetL()
    test(0)
  })
  it ('addFooter', function () {
    var test = h => eYo.Test.span(b, {
      footer: h,
      l: 1 + h,
    })
    s.resetL()
    test(0)
    s.addFooter(1)
    test(1)
    s.addFooter(2)
    test(3)
    s.addFooter(-1)
    test(2)
    s.addFooter(-2)
    test(0  )
    s.addFooter(2)
    test(2)
    s.resetL()
    test(0)
  })
  it ('addSuite', function () {
    var test = h => eYo.Test.span(b_g, {
      suite: h,
      l: Math.max(2, 1 + h),
    })
    s_g.resetL()
    test(0)
    s_g.addSuite(1)
    test(1)
    s_g.addSuite(2)
    test(3)
    s_g.addSuite(-1)
    test(2)
    s_g.addSuite(-2)
    test(0)
    s_g.addSuite(2)
    test(2)
    s_g.resetL()
    test(0)
  })
  after(function() {
    b.dispose()
    b_s.dispose()
    b_g.dispose()
  })
})
