describe('Builtin objects', function () {
  it(`Basic`, function () {
    eYo.Test.setItUp()
    var d1 = eYo.Test.new_brick('builtin__object')
    d1.dispose()
    eYo.Test.tearItDown()
  })
})
