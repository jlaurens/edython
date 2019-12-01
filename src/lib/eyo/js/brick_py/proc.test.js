describe('decorator', function() {
  it(`Copy/Paste with n_ary`, function() {
    var d = eYo.Test.new_brick(eYo.T3.Stmt.decorator_stmt)
    eYo.Test.brick(d, 'decorator_stmt')
    d.variant_p = eYo.Key.N_ARY
    var d = eYo.Xml.brickToDom(d)
    var dd = eYo.Test.new_brick(d)
    eYo.Test.same(d, dd)
    dd.dispose()
    d.dispose()
  })
})

eYo.Debug.test() // remove this line when finished
