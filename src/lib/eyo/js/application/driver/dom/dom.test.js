describe('Dom driver', function() {
  it ('Dom: Basic', function () {
    chai.assert(eYo.dom)
    chai.assert(eYo.dom.Mngr)
    chai.assert(eYo.dom.newDriverC9r)
    chai.assert(eYo.dom.makeMngr)
    chai.assert(eYo.dom.BaseC9r)
  })
  it ("eYo.dom.newDriverC9r('A')", function () {
    chai.assert(eYo.dom.newDriverC9r('A'))
  })
})

