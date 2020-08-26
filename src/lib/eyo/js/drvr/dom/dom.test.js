describe('Dom driver', function() {
  it ('Dom: Basic', function () {
    chai.assert(eYo.dom)
    chai.assert(eYo.dom.Mngr)
    chai.assert(eYo.dom.newDrvrC9r)
    chai.assert(eYo.dom.makeMngr)
    chai.assert(eYo.dom.C9rBase)
  })
  it ("eYo.dom.newDrvrC9r('A')", function () {
    chai.assert(eYo.dom.newDrvrC9r('A'))
  })
})

