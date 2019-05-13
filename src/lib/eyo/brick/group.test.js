describe('Simple statement and group', function () {
  it(`Comment statement and group`, function () {
    eYo.Test.setItUp()
    var d1 = eYo.Test.new_dlgt('comment_stmt')
    var d2 = eYo.Test.new_dlgt('for_part')
    d2.magnets.right.connectSmart(d1)
    d2.dispose()
    eYo.Test.tearItDown()
  })
})

describe ('with_part', function () {
  it (`Basic`, function () {
    var d = eYo.Test.new_dlgt(eYo.T3.Stmt.with_part)
    eYo.Test.dlgt(d, 'with_part')
    eYo.Test.code(d, 'with <MISSING INPUT>:\n    <MISSING STATEMENT>')
    var dd = eYo.Test.new_dlgt(eYo.T3.Expr.identifier)
    dd.target_p = 'abc'
    eYo.Test.list_connect(d, 'with', dd)
    eYo.Test.code(d, 'with abc:\n    <MISSING STATEMENT>')
    dd.alias_p = 'cba'
    eYo.Test.code(d, 'with abc as cba:\n    <MISSING STATEMENT>')
    d.dispose()
  })
})

describe('for_part', function() {
  it(`Basic`, function () {
    eYo.Test.setItUp()
    var d1 = eYo.Test.new_dlgt('for_part')
    eYo.Test.dlgt(d1, 'for_part')
    eYo.Test.magnets(d1, {
      left: true,
      right: true,
      head: true,
      foot: true,
      suite: true
    })
    eYo.Test.line_counts(d1, {
      black: 1
    })
    eYo.Test.code(d1, 'for <MISSING INPUT> in <MISSING INPUT>:\n    <MISSING STATEMENT>')
    var d2 = eYo.Test.new_dlgt('for_part')
    d1.magnets.right.connectSmart(d2)
    // d1.dispose()
    eYo.Test.tearItDown()
  })
  // it(`for_part + else_part`, function() {
  //   var d = eYo.Test.new_dlgt(eYo.T3.Stmt.for_part)
  //   eYo.Test.dlgt(d, 'for_part')
  //   eYo.Test.code(d, 'for <MISSING INPUT> in <MISSING INPUT>:\n    <MISSING STATEMENT>')
  //   var dd = eYo.Test.new_dlgt(eYo.T3.Stmt.else_part)
  //   eYo.Test.dlgt(dd, 'else_part')
  //   eYo.Test.code(dd, 'else:\n    <MISSING STATEMENT>')
  //   chai.assert(d.footConnect(dd))
  //   eYo.Test.code(d, 'for <MISSING INPUT> in <MISSING INPUT>:\n    <MISSING STATEMENT>\nelse:\n    <MISSING STATEMENT>')
  //   dd.dispose()
  //   eYo.Test.code(d, 'for <MISSING INPUT> in <MISSING INPUT>:\n    <MISSING STATEMENT>')
  //   d.dispose()
  // })
})
