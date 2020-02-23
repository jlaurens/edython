describe("Group", function () {
  it ("Group: Basic", function () {
    chai.assert(eYo.test)
    chai.assert(eYo.stmt.group)
    chai.assert(eYo.isSubclass(eYo.stmt.group, eYo.stmt.Base))
  })
})

describe('Simple statement and group', function () {
  it(`Comment statement and group`, function () {
    eYo.test.SetItUp()
    var d1 = eYo.test.new_brick('comment_stmt')
    var d2 = eYo.test.new_brick('for_part')
    d2.right_m.connectSmart(d1)
    d2.dispose()
    eYo.test.tearItDown()
  })
})

describe ('with_part', function () {
  it (`Basic`, function () {
    var d = eYo.test.new_brick(eYo.t3.stmt.with_part)
    eYo.test.Brick(d, 'with_part')
    eYo.test.Code(d, 'with <MISSING INPUT>:\n    <MISSING STATEMENT>')
    var dd = eYo.test.new_brick(eYo.t3.expr.identifier)
    dd.Target_p = 'abc'
    eYo.test.list_connect(d, 'with', dd)
    eYo.test.Code(d, 'with abc:\n    <MISSING STATEMENT>')
    dd.Alias_p = 'cba'
    eYo.test.Code(d, 'with abc as cba:\n    <MISSING STATEMENT>')
    d.dispose()
  })
})

describe('for_part', function() {
  it(`Basic`, function () {
    eYo.test.SetItUp()
    var d1 = eYo.test.new_brick('for_part')
    eYo.test.Brick(d1, 'for_part')
    eYo.test.Magnets(d1, {
      left: true,
      right: true,
      head: true,
      foot: true,
      suite: true
    })
    eYo.test.line_counts(d1, {
      black: 1
    })
    eYo.test.Code(d1, 'for <MISSING INPUT> in <MISSING INPUT>:\n    <MISSING STATEMENT>')
    var d2 = eYo.test.new_brick('for_part')
    d1.right_m.connectSmart(d2)
    // d1.dispose()
    eYo.test.tearItDown()
  })
  // it(`for_part + else_part`, function() {
  //   var d = eYo.test.new_brick(eYo.t3.stmt.for_part)
  //   eYo.test.Brick(d, 'for_part')
  //   eYo.test.Code(d, 'for <MISSING INPUT> in <MISSING INPUT>:\n    <MISSING STATEMENT>')
  //   var dd = eYo.test.new_brick(eYo.t3.stmt.else_part)
  //   eYo.test.Brick(dd, 'else_part')
  //   eYo.test.Code(dd, 'else:\n    <MISSING STATEMENT>')
  //   chai.assert(d.footConnect(dd))
  //   eYo.test.Code(d, 'for <MISSING INPUT> in <MISSING INPUT>:\n    <MISSING STATEMENT>\nelse:\n    <MISSING STATEMENT>')
  //   dd.dispose()
  //   eYo.test.Code(d, 'for <MISSING INPUT> in <MISSING INPUT>:\n    <MISSING STATEMENT>')
  //   d.dispose()
  // })
})
