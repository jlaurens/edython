describe('Builtin objects', function () {
  it(`Basic`, function () {
    eYo.test.setItUp()
    var d1 = eYo.test.new_brick('builtin__object')
    d1.dispose()
    eYo.test.tearItDown()
  })
})
