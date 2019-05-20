describe('Create', function() {
  it(`Basic`, function() {
    eYo.Test.setItUp()
    var b3k = eYo.Test.new_brick('identifier')
    chai.assert(b3k.change.count !== undefined, 'MISSED 3')
    chai.assert(eYo.App.workspace.getBlockById(b3k.id) === b3k)
    b3k.dispose()
    eYo.Test.tearItDown()
  })
})

describe('One brick (ALIASED)', function () {
  it (`white space before 'as'`, function () {
    var b3k = eYo.Test.new_brick({
      type: eYo.T3.Expr.identifier,
      target_p: 'abc',
      alias_p: 'cde'
    })
    eYo.Test.code(b3k, 'abc as cde')
    b3k.dispose()
  })
})
