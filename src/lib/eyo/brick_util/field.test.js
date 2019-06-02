chai.assert(eYo.Test)
chai.assert(eYo.Brick.Expr.makeSubclass)

eYo.Test.FIELD = 'field'
var RA = [
  ['base', eYo.Test.FIELD, eYo.Field.STATUS_NONE],
  ['builtin', {builtin: eYo.Test.FIELD}, eYo.Field.STATUS_BUILTIN],
  ['reserved', {reserved: eYo.Test.FIELD}, eYo.Field.STATUS_RESERVED],
  ['comment', {comment: eYo.Test.FIELD}, eYo.Field.STATUS_COMMENT]
]
RA.forEach(X => {
  var type = `one_slot_one_field_${X[0]}`
  eYo.T3.Expr[type] = type
  eYo.Brick.Expr.makeSubclass(type, {
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
describe('Headless', function () {
  beforeEach(function() {
    eYo.Test.setItUp()
  })
  afterEach(function() {
    eYo.Test.tearItDown()
  })
  describe('Create', function() {
    RA.forEach(X => {
      var type = `one_slot_one_field_${X[0]}`
      it(`Basic ${X[2]}`, function() {
        var b = eYo.Test.new_brick(type)
        var slot = b.SLOT_s
        var field = slot.FIELD_f
        chai.assert(field.text === eYo.Test.FIELD)
        chai.assert(field.status === X[2])
        b.dispose()
      })
    })
  })
})
describe('Headful', function () {
  describe('Create', function() {
    RA.forEach(X => {
      var type = `one_slot_one_field_${X[0]}`
      it(`Basic ${X[2]}`, function() {
        var b = eYo.Test.new_brick(type)
        var slot = b.SLOT_s
        var field = slot.FIELD_f
        chai.assert(field.text === eYo.Test.FIELD)
        chai.assert(field.status === X[2])
        // b.dispose()
      })
    })
  })
})
