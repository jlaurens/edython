describe('Builtin objects', function () {
  it(`Basic`, function () {
    eYo.test.SetItUp()
    var d1 = eYo.test.new_brick('builtin__object')
    d1.dispose()
    eYo.test.tearItDown()
  })
})
