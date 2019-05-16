var assert = chai.assert

eYo.Brick.Expr.makeSubclass('test_field_label', {
  slots: {
    NAME: {
      order: 1,
      hole_value: 'name',
      fields: {
        KEY: 'key'
      }
    }
  }
})

describe('Create', function() {
  it(`Basic`, function() {
    eYo.Test.setItUp()
    var d = eYo.Test.new_brick('test_field_label')
    assert(d.change.count !== undefined, 'MISSED 3')
    d.dispose()
    eYo.Test.tearItDown()
  })
})

describe('One brick (ALIASED)', function () {
  it (`white space before 'as'`, function () {
    var d = eYo.Test.new_brick({
      type: eYo.T3.Expr.identifier,
      target_p: 'abc',
      alias_p: 'cde'
    })
    eYo.Test.code(d, 'abc as cde')
    d.dispose()
  })
})
