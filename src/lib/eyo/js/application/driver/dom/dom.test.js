describe('Dom driver', function() {
  it ('Dom: Basic', function () {
    chai.assert(eYo.dom)
    chai.assert(eYo.dom.Mngr)
    chai.assert(eYo.dom.makeDriverClass)
    chai.assert(eYo.dom.makeMngr)
    chai.assert(eYo.dom.Dflt)
  })
  it ("eYo.dom.makeDriverClass('A')", function () {
    chai.assert(eYo.dom.makeDriverClass('A'))
  })
})

