describe('Builtin objects', function () {
  it(`Basic`, function () {
    eYo.Test.setItUp()
    var b1 = eYo.Test.new_block('builtin__object')
    // b1.dispose()
    eYo.Test.tearItDown()
  })
})
