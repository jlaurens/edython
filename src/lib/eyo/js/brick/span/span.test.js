describe('Span expression', function () {
  this.timeout(10000)
  let flag = {
    v: 0,
    reset (what) {
      this.v = what || 0
    },
    push (...$) {
      $.forEach(what => {
        what && (this.v = parseInt(this.v.toString() + what.toString()))
      })
      return this.v
    },
    expect (what) {
      let ans = eYo.isRA(what) ? chai.expect(what).include(this.v) : chai.expect(what).equal(this.v)
      this.reset()
      return ans
    },
  }
  let ns_span = eYo.span.makeNS()
  ns_span.makeBaseC9r()
  let onr = eYo.c9r.new()
  var b
  before(function() {
    flag.reset()
    b = eYo.o4t.new({
      init () {
        this.span = ns_span.new('s', this)
      }
    }, onr, 'b')
    s = ns_span.new('s', onr)
  })
  after(function() {
  })
  it('(add|reset)C', function() {
    var test = c => chai.expect(blur).eqlSpan({
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
    var test = p => eYo.test.Span(b, {
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
    var test = h => eYo.test.Span(b, {
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
    var test = h => eYo.test.Span(b, {
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
    var test = h => eYo.test.Span(b, {
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
    var test = h => eYo.test.Span(b_g, {
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
})

describe('Current Field', function () {
  var b_1
  before(function() {
    var type = 'test_stmt_span_reserved'
    eYo.t3.stmt[type] = type
    eYo.stmt.makeC9r(type, {
      fields: {
        FIELD: {
          reserved: '1234'
        }
      },
      left: { check: type },
      right: { check: type },
    })  
    b_1 = eYo.test.new_brick(type)
    s_1 = b_1.span
    chai.expect(b_1.isStmt).true
  })
  after(function() {
  })
  it ('FIELD: 1234', function () {
    var test = (b, c, m) => eYo.test.Span(b, {
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
    eYo.t3.stmt[type] = type
    eYo.stmt.makeC9r(type, {
      fields: {
        FIELD: {
          reserved: '1234'
        }
      },
      left: { check: type },
      right: { check: type },
    })  
    b_1 = eYo.test.new_brick(type)
    s_1 = b_1.span
    chai.assert(b_1.isStmt, 'MISSED')
    b_2 = eYo.test.new_brick(type)
    s_2 = b_2.span
    chai.assert(b_2.isStmt, 'MISSED')
    b_3 = eYo.test.new_brick(type)
    s_3 = b_3.span
    chai.assert(b_3.isStmt, 'MISSED')
  })
  it ('left+middle+right', function () {
    var test = (b, h, m, f) => eYo.test.Span(b, {
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
})
