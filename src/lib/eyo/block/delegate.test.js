var assert = chai.assert

describe('Create', function() {
  it(`Basic`, function() {
    eYo.Test.setItUp()
    var d = eYo.Test.new_dlgt('identifier')
    assert(d.change.count !== undefined, 'MISSED 3')
    d.block_.dispose()
    eYo.Test.tearItDown()
  })
})
