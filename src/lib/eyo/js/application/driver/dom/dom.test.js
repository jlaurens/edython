describe('Dom driver', function() {
  it ('Dom: Basic', function () {
    chai.assert(eYo.dom)
    chai.assert(eYo.dom.Mngr)
    chai.assert(eYo.dom.makeDriverC9r)
    chai.assert(eYo.dom.makeMngr)
    chai.assert(eYo.dom.Base)
  })
  it ("eYo.dom.makeDriverC9r('A')", function () {
    chai.assert(eYo.dom.makeDriverC9r('A'))
  })
})

