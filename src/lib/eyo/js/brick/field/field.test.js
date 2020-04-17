describe('Field', function () {
  this.timeout(10000)
  let flag = {
    v: 0,
    reset (what) {
      this.v = what || 0
    },
    push (...$) {
      $.forEach(what => {
        what && (this.v = parseInt(this.v.toString() + what.toString()))
      })
    },
    expect (what) {
      let ans = chai.expect(this.v).equal(what)
      this.reset()
      return ans
    },
  }
  it ('Field: Basic', function () {
    chai.assert(eYo.field)
  })
  it ('eYo.field.new(onr, "foo")', function () {
    let onr = {
      isBrick: true,
      changer: {
        wrap (f) {
          flag.push(1)
          f()
        }
      },
    }
    ;['value', 'reserved', 'builtin', 'comment', 'edit'].forEach(k => {
      let f = eYo.field.new(onr, 'foo', {
        [k]: '421',
      })
      chai.expect(!f).true
    })

  })
  it ('Medley', function () {
    eYo.test.FIELD = 'field'
    var RA = [
      ['base', eYo.test.FIELD, eYo.field.STATUS_NONE],
      ['builtin', {builtin: eYo.test.FIELD}, eYo.field.STATUS_BUILTIN],
      ['reserved', {reserved: eYo.test.FIELD}, eYo.field.STATUS_RESERVED],
      ['comment', {comment: eYo.test.FIELD}, eYo.field.STATUS_COMMENT]
    ]
    // RA.forEach(X => {
    //   var type = `one_slot_one_field_${X[0]}`
    //   eYo.t3.expr[type] = type
    //   eYo.expr.makeC9r(type, {
    //     slots: {
    //       SLOT: {
    //         order: 1,
    //         fields: {
    //           FIELD: X[1]
    //         }
    //       }
    //     }
    //   })  
    // })
    // describe('Headless', function () {
    //   beforeEach(function() {
    //     eYo.test.setItUp()
    //   })
    //   afterEach(function() {
    //     eYo.test.tearItDown()
    //   })
    //   describe('Create', function() {
    //     RA.forEach(X => {
    //       var type = `one_slot_one_field_${X[0]}`
    //       it(`Basic ${X[2]}`, function() {
    //         var b = eYo.test.new_brick(type)
    //         var slot = b.SLOT_s
    //         var field = slot.FIELD_f
    //         chai.expect(field.text).equal(eYo.test.FIELD)
    //         chai.expect(field.status).equal(X[2])
    //         b.dispose()
    //       })
    //     })
    //   })
    // })
    // describe('Headful', function () {
    //   describe('Create', function() {
    //     RA.forEach(X => {
    //       var type = `one_slot_one_field_${X[0]}`
    //       it(`Basic ${X[2]}`, function() {
    //         var b = eYo.test.new_brick(type)
    //         var slot = b.SLOT_s
    //         var field = slot.FIELD_f
    //         chai.expect(field.text).equal(eYo.test.FIELD)
    //         chai.expect(field.status).equal(X[2])
    //         // b.dispose()
    //       })
    //     })
    //   })
    // })
  })
})
