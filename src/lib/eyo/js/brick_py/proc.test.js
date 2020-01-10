describe('decorator', function() {
  it(`Copy/Paste with n_ary`, function() {
    var d = eYo.Test.new_brick(eYo.t3.Stmt.decorator_stmt)
    eYo.Test.Brick(d, 'decorator_stmt')
    d.Variant_p = eYo.key.N_ARY
    var d = eYo.xml.BrickToDom(d)
    var dd = eYo.Test.new_brick(d)
    eYo.Test.Same(d, dd)
    dd.dispose()
    d.dispose()
  })
})
