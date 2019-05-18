chai.assert(eYo.Test)
chai.assert(eYo.Brick.Expr.makeSubclass)

eYo.Test.FIELD = 'field'
;[
  ['base', eYo.Test.FIELD],
  ['builtin', {builtin: eYo.Test.FIELD}],
  ['reserved', {reserved: eYo.Test.FIELD}],
  ['comment', {comment: eYo.Test.FIELD}]
].forEach(X => {
  eYo.Brick.Expr.makeSubclass(`one_slot_one_field_${X[0]}`, {
    slots: {
      SLOT: {
        order: 1,
        fields: {
          FIELD: X[1]
        }
      }
    }
  })  
})

describe('Create', function() {
  it(`Basic`, function() {
    eYo.Test.setItUp()
    var b = eYo.Test.new_brick('one_slot_one_field_base')
    var slot = b.SLOT_s
    var field = slot.FIELD_f
    chai.assert(field.text === eYo.Test.FIELD)
    chai.assert(field.status === eYo.Field.STATUS_NONE)
    b.dispose()
    eYo.Test.tearItDown()
  })
})
