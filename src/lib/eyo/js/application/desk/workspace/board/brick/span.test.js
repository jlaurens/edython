// Functional tests

eYo.Test.no_brick_type = true

describe('Span expression', function () {
  var b, s, b_g, s_g, b_s, s_s
  before(function() {
    var type = 'test_expr_span'
    eYo.Expr.Dflt.makeSubclass(type, {
      out: {
        check: null
      }
    })  
    b = eYo.Test.new_brick(type)
    s = b.span
    chai.assert(b.isExpr, 'MISSED')
    var type = 'test_stmt_span'
    eYo.Stmt.makeClass(type, {
      out: {
        check: null
      }
    })  
    b_s = eYo.Test.new_brick(type)
    s_s = b_s.span
    chai.assert(b_s.isStmt, 'MISSED')
    var type = 'test_group_span'
    eYo.Stmt.Group.makeSubclass(type, {
      out: {
        check: null
      }
    })  
    b_g = eYo.Test.new_brick(type)
    s_g = b_g.span
    chai.assert(b_g.isGroup, 'MISSED')
  })
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
    console.error(b_g.span)
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

describe('Current Field', function () {
  var b_1
  before(function() {
    var type = 'test_stmt_span_reserved'
    eYo.T3.Stmt[type] = type
    eYo.Stmt.makeClass(type, {
      fields: {
        FIELD: {
          reserved: '1234'
        }
      },
      left: { check: type },
      right: { check: type },
    })  
    b_1 = eYo.Test.new_brick(type)
    s_1 = b_1.span
    chai.assert(b_1.isStmt, 'MISSED')
  })
  it ('FIELD: 1234', function () {
    var test = (b, c, m) => eYo.Test.span(b, {
      c_min: c,
      main: m,
    })
    test(b_1, 6)
    // b_1.FIELD_f.text = '43xx21'
    // test(b_1, 8)
  })
  after(function() {
    // b_1.dispose()
  })
})

describe('Current Span statements', function () {
  var b_1, s_1, b_2, s_2, b_3, s_3
  before(function() {
    var type = 'test_stmt_span'
    eYo.T3.Stmt[type] = type
    eYo.Stmt.makeClass(type, {
      fields: {
        FIELD: {
          reserved: '1234'
        }
      },
      left: { check: type },
      right: { check: type },
    })  
    b_1 = eYo.Test.new_brick(type)
    s_1 = b_1.span
    chai.assert(b_1.isStmt, 'MISSED')
    b_2 = eYo.Test.new_brick(type)
    s_2 = b_2.span
    chai.assert(b_2.isStmt, 'MISSED')
    b_3 = eYo.Test.new_brick(type)
    s_3 = b_3.span
    chai.assert(b_3.isStmt, 'MISSED')
  })
  it ('left+middle+right', function () {
    var test = (b, h, m, f) => eYo.Test.span(b, {
      header: h,
      main: m,
      footer: f
    })
    b_1.right = b_2
    b_2.right = b_3
    test(b_1, 0, 1, 0)
    test(b_2, 0, 1, 0)
    test(b_3, 0, 1, 0)
  })
  after(function() {
    b_3.dispose()
    b_2.dispose()
    b_1.dispose()
  })
})
