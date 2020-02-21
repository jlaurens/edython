describe('decorator', function() {
  it(`Copy/Paste with n_ary`, function() {
    var d = eYo.test.new_brick(eYo.t3.stmt.decorator_stmt)
    eYo.test.Brick(d, 'decorator_stmt')
    d.Variant_p = eYo.key.N_ARY
    var d = eYo.xml.brickToDom(d)
    var dd = eYo.test.new_brick(d)
    eYo.test.Same(d, dd)
    dd.dispose()
    d.dispose()
  })
})
