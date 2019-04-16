describe('Simple statement and group', function () {
  it(`Comment statement and group`, function () {
    eYo.Test.setItUp()
    var b1 = eYo.Test.new_block('comment_stmt')
    var b2 = eYo.Test.new_block('for_part')
    // b2.eyo.rightStmtConnection.connect(b1.eyo.leftStmtConnection)
    // b2.dispose()
    // b1.dispose()
    eYo.Test.tearItDown()
  })
})

describe ('with_part', function () {
  it (`Basic`, function () {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Stmt.with_part)
    eYo.Test.block(b, 'with_part')
    eYo.Test.code(b, 'with <MISSING INPUT>:\n    <MISSING STATEMENT>')
    var bb = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier)
    bb.eyo.target_p = 'abc'
    eYo.Test.list_connect(b, 'with', bb)
    eYo.Test.code(b, 'with abc:\n    <MISSING STATEMENT>')
    bb.eyo.alias_p = 'cba'
    eYo.Test.code(b, 'with abc as cba:\n    <MISSING STATEMENT>')
    b.dispose()
  })
})

describe('for_part', function() {
  it(`Basic`, function () {
    eYo.Test.setItUp()
    var b1 = eYo.Test.new_block('for_part')
    eYo.Test.block(b1, 'for_part')
    eYo.Test.connections(b1, {
      left: true,
      right: true,
      previous: true,
      next: true,
      suite: true
    })
    eYo.Test.line_counts(b1, {
      black: 1
    })
    eYo.Test.code(b1, 'for <MISSING INPUT> in <MISSING INPUT>:\n    <MISSING STATEMENT>')
    var b2 = eYo.Test.new_block('for_part')
    b1.eyo.rightStmtConnection.connect(b2.eyo.leftStmtConnection)
    // b1.dispose()
    eYo.Test.tearItDown()
  })
  // it(`for_part + else_part`, function() {
  //   var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Stmt.for_part)
  //   eYo.Test.block(b, 'for_part')
  //   eYo.Test.code(b, 'for <MISSING INPUT> in <MISSING INPUT>:\n    <MISSING STATEMENT>')
  //   var bb = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Stmt.else_part)
  //   eYo.Test.block(bb, 'else_part')
  //   eYo.Test.code(bb, 'else:\n    <MISSING STATEMENT>')
  //   chai.assert(b.eyo.nextConnect(bb))
  //   eYo.Test.code(b, 'for <MISSING INPUT> in <MISSING INPUT>:\n    <MISSING STATEMENT>\nelse:\n    <MISSING STATEMENT>')
  //   bb.dispose()
  //   eYo.Test.code(b, 'for <MISSING INPUT> in <MISSING INPUT>:\n    <MISSING STATEMENT>')
  //   b.dispose()
  // })
})
