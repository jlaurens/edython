describe('decorator', function() {
  it(`Copy/Paste with n_ary`, function() {
    var b = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, eYo.T3.Stmt.decorator_stmt)
    eYo.Test.block(b, 'decorator_stmt')
    b.eyo.variant_p = eYo.Key.N_ARY
    var d = eYo.Xml.blockToDom(b)
    var bb = eYo.DelegateSvg.newBlockReady(Blockly.mainWorkspace, d)
    eYo.Test.same(b, bb)
    bb.dispose()
    b.dispose()
  })
})
