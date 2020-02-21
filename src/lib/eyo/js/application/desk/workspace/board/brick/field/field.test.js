describe('field', function () {
  chai.assert(eYo.test)
  chai.assert(eYo.expr.makeC9r)

  eYo.test.FIELD = 'field'
  var RA = [
    ['base', eYo.test.FIELD, eYo.field.STATUS_NONE],
    ['builtin', {builtin: eYo.test.FIELD}, eYo.field.STATUS_BUILTIN],
    ['reserved', {reserved: eYo.test.FIELD}, eYo.field.STATUS_RESERVED],
    ['comment', {comment: eYo.test.FIELD}, eYo.field.STATUS_COMMENT]
  ]
  RA.forEach(X => {
    var type = `one_slot_one_field_${X[0]}`
    eYo.t3.expr[type] = type
    eYo.expr.makeC9r(type, {
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
      eYo.test.SetItUp()
    })
    afterEach(function() {
      eYo.test.tearItDown()
    })
    describe('Create', function() {
      RA.forEach(X => {
        var type = `one_slot_one_field_${X[0]}`
        it(`Basic ${X[2]}`, function() {
          var b = eYo.test.new_brick(type)
          var slot = b.SLOT_s
          var field = slot.FIELD_f
          chai.assert(field.text === eYo.test.FIELD)
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
          var b = eYo.test.new_brick(type)
          var slot = b.SLOT_s
          var field = slot.FIELD_f
          chai.assert(field.text === eYo.test.FIELD)
          chai.assert(field.status === X[2])
          // b.dispose()
        })
      })
    })
  })
})
