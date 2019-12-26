describe('Dom driver', function() {
  it ('Dom: Basic', function () {
    chai.assert(eYo.Dom)
    chai.assert(eYo.Dom.Mngr)
    chai.assert(eYo.Dom.makeDriverClass)
    chai.assert(eYo.Dom.makeMngr)
    chai.assert(eYo.Dom.Dflt)
  })
  it ("eYo.Dom.makeDriverClass('A')", function () {
    chai.assert(eYo.Dom.makeDriverClass('A'))
  })
})

