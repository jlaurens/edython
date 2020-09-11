describe('Span expression', function () {
  this.timeout(20000)
  let flag = new eYo.test.Flag()
  let ns_span = eYo.span.newNS()
  ns_span.makeC9rBase()
  let onr = eYo.c3s.new()
  var b
  var b_g
  before(function() {
    flag.reset()
    b = eYo.o4t.new({
      init () {
        this.span = ns_span.new('s', this)
      }
    }, 'b', onr)
    b_g = eYo.o4t.new({
      init () {
        this.isGroup = true
        this.span = ns_span.new('s', this)
      }
    }, 'b_g', onr)
  })
  after(function() {
  })
  it('Span: Basic', function() {
    chai.assert(eYo.span)
    chai.expect(eYo.span.INDENT > 0).true
    chai.expect(eYo.span.TAB_WIDTH > 0).true
  })
  it('Span: Init', function() {
    chai.expect(b.span.brick).equal(b)
    chai.expect(b.span).eqlSpan({})
  })
  it('(add|reset)C', function() {
    let test = c => chai.expect(b.span).eqlSpan({
      c_min: c,
      c: c,
    })
    b.span.addC(1)
    test(3)
    b.span.addC(2)
    test(5)
    b.span.addC(-1)
    test(4)
    b.span.addC(-2)
    test(2)
    b.span.addC(2)
    test(4)
    b.span.resetC()
    test(2)
  })
  it ('(re)setPadding', function () {
    var test = p => chai.expect(b.span).eqlSpan({
      c_padding: p,
      c: 2 + p,
    })
    test(0)
    b.span.c_padding_ = 1
    test(1)
    b.span.c_padding_ = 2
    test(2)
    b.span.c_padding_ = 0
    test(0)
    b.span.c_padding_ = 2
    test(2)
    b.span.resetPadding()
    test(0)
  })
  it ('addHeader', function () {
    var test = h => chai.expect(b.span).eqlSpan({
      header: h,
      l: 1 + h,
    })
    b.span.resetL()
    test(0)
    b.span.addHeader(1)
    test(1)
    b.span.addHeader(2)
    test(3)
    b.span.addHeader(-1)
    test(2)
    b.span.addHeader(-2)
    test(0  )
    b.span.addHeader(2)
    test(2)
    b.span.resetL()
    test(0)
  })
  it ('addMain', function () {
    var test = h => chai.expect(b.span).eqlSpan({
      main: 1 + h,
      l: 1 + h,
    })
    b.span.resetL()
    test(0)
    b.span.addMain(1)
    test(1)
    b.span.addMain(2)
    test(3)
    b.span.addMain(-1)
    test(2)
    b.span.addMain(-2)
    test(0)
    b.span.addMain(2)
    test(2)
    b.span.resetL()
    test(0)
  })
  it ('addFooter', function () {
    var test = h => chai.expect(b.span).eqlSpan({
      footer: h,
      l: 1 + h,
    })
    b.span.resetL()
    test(0)
    b.span.addFooter(1)
    test(1)
    b.span.addFooter(2)
    test(3)
    b.span.addFooter(-1)
    test(2)
    b.span.addFooter(-2)
    test(0  )
    b.span.addFooter(2)
    test(2)
    b.span.resetL()
    test(0)
  })
  it ('addSuite', function () {
    var test = h => chai.expect(b_g.span).eqlSpan({
      suite: h,
      l: Math.max(2, 1 + h),
    })
    b_g.span.resetL()
    test(0)
    b_g.span.addSuite(1)
    test(1)
    b_g.span.addSuite(2)
    test(3)
    b_g.span.addSuite(-1)
    test(2)
    b_g.span.addSuite(-2)
    test(0)
    b_g.span.addSuite(2)
    test(2)
    b_g.span.resetL()
    test(0)
  })
})

// describe('Current Field', function () {
//   var b_1
//   before(function() {
//     var type = 'test_stmt_span_reserved'
//     eYo.t3.stmt[type] = type
//     eYo.stmt.newC9r(type, {
//       fields: {
//         FIELD: {
//           reserved: '1234'
//         }
//       },
//       left: { check: type },
//       right: { check: type },
//     })  
//     b_1 = eYo.test.new_brick(type)
//     s_1 = b_1.span
//     chai.expect(b_1.isStmt).true
//   })
//   it ('FIELD: 1234', function () {
//     var test = (b, c, m) => eYo.test.Span(b, {
//       c_min: c,
//       main: m,
//     })
//     test(b_1, 6)
//     // b_1.FIELD_f.text = '43xx21'
//     // test(b_1, 8)
//   })
//   after(function() {
//     // b_1.dispose()
//   })
// })

// describe('Current Span statements', function () {
//   var b_1, s_1, b_2, s_2, b_3, s_3
//   before(function() {
//     var type = 'test_stmt_span'
//     eYo.t3.stmt[type] = type
//     eYo.stmt.newC9r(type, {
//       fields: {
//         FIELD: {
//           reserved: '1234'
//         }
//       },
//       left: { check: type },
//       right: { check: type },
//     })  
//     b_1 = eYo.test.new_brick(type)
//     s_1 = b_1.span
//     chai.assert(b_1.isStmt, 'MISSED')
//     b_2 = eYo.test.new_brick(type)
//     s_2 = b_2.span
//     chai.assert(b_2.isStmt, 'MISSED')
//     b_3 = eYo.test.new_brick(type)
//     s_3 = b_3.span
//     chai.assert(b_3.isStmt, 'MISSED')
//   })
//   it ('left+middle+right', function () {
//     var test = (b, h, m, f) => eYo.test.Span(b, {
//       header: h,
//       main: m,
//       footer: f
//     })
//     b_1.right = b_2
//     b_2.right = b_3
//     test(b_1, 0, 1, 0)
//     test(b_2, 0, 1, 0)
//     test(b_3, 0, 1, 0)
//   })
// })
