describe('decorator', function() {
  it(`Copy/Paste with n_ary`, function() {
    var d = eYo.Test.new_dlgt(eYo.T3.Stmt.decorator_stmt)
    eYo.Test.dlgt(d, 'decorator_stmt')
    d.variant_p = eYo.Key.N_ARY
    var d = eYo.Xml.blockToDom(d)
    var dd = eYo.Test.new_dlgt(d)
    eYo.Test.same(d, dd)
    dd.block_.dispose()
    d.block_.dispose()
  })
})
