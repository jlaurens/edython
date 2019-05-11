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

describe('One block (ALIASED)', function () {
  it (`white space before 'as'`, function () {
    var d = eYo.Test.new_dlgt({
      type: eYo.T3.Expr.identifier,
      target_p: 'abc',
      alias_p: 'cde'
    })
    eYo.Test.code(d, 'abc as cde')
    d.block_.dispose()
  })
})
