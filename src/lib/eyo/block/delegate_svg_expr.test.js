describe('Builtin objects', function () {
  it(`Basic`, function () {
    eYo.Test.setItUp()
    var d1 = eYo.Test.new_dlgt('builtin__object')
    d1.block_.dispose()
    eYo.Test.tearItDown()
  })
})
