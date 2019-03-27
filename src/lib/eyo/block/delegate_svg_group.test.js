describe ('with_part', function () {
  it (`Basic`, function () {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Stmt.with_part)
    eYo.Test.block(b, 'with_part')
    eYo.Test.code(b, 'with <MISSING INPUT>:<MISSING STATEMENT>')
    var bb = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Expr.identifier)
    bb.eyo.target_p = 'abc'
    eYo.Test.list_connect(b, 'with', bb)
    eYo.Test.code(b, 'with abc:<MISSING STATEMENT>')
    bb.eyo.alias_p = 'cba'
    eYo.Test.code(b, 'with abc as cba:<MISSING STATEMENT>')
    b.dispose()
  })
})
describe('for_part', function() {
  it(`for_part + else_part`, function() {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Stmt.for_part)
    eYo.Test.block(b, 'for_part')
    eYo.Test.code(b, 'for<MISSING INPUT>in<MISSING INPUT>:<MISSING STATEMENT>')
    var bb = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Stmt.else_part)
    eYo.Test.block(bb, 'else_part')
    eYo.Test.code(bb, 'else:<MISSING STATEMENT>')
    chai.assert(b.eyo.nextConnect(bb))
    eYo.Test.code(b, 'for<MISSING INPUT>in<MISSING INPUT>:<MISSING STATEMENT>else:<MISSING STATEMENT>')
    bb.dispose()
    eYo.Test.code(b, 'for<MISSING INPUT>in<MISSING INPUT>:<MISSING STATEMENT>')
    b.dispose()
  })
})
