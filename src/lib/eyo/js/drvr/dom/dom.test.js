describe('Dom driver', function() {
  it ('Dom: Basic', function () {
    chai.assert(eYo.dom)
    chai.assert(eYo.dom.Mngr)
    chai.assert(eYo.dom.newDrvrC3s)
    chai.assert(eYo.dom.makeMngr)
    chai.assert(eYo.dom.C3sBase)
  })
  it ("eYo.dom.newDrvrC3s('A')", function () {
    chai.assert(eYo.dom.newDrvrC3s('A'))
  })
})

