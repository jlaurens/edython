describe('XMl', function () {
  var assert = chai.assert

  describe('Primary', function () {
    it ('identifier', function () {
      var model = `<x eyo="identifier" name="k" slot="key"></x>`
      var d = eYo.brick.newReady(eYo.app.Board, model)
      assert(d, `MISSING brick`)
    })
  })

  describe('Compatibility', function() {
    it('dict_comprehension', function() {
      var model = `<x eyo="dict_comprehension" xmlns="urn:edython:0.2" xmlns: eyo="urn:edython:0.2"><x eyo="identifier" name="k" slot="key"></x><x eyo="identifier" name="d" slot="datum"></x></x>`
      var model = `<x eyo="dict_comprehension" xmlns="urn:edython:0.2" xmlns: eyo="urn:edython:0.2"><x eyo="identifier" name="k" slot="key"></x><x eyo="identifier" name="d" slot="datum"></x></x>`
      var d = eYo.Test.new_brick(model)
      console.error(d.type)
      var t = d.expression_s.target
      chai.assert(t, 'MISSING target')
      chai.assert(t.type === eYo.t3.expr.identifier_annotated)
    })
  })
})