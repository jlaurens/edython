describe('Fcls driver', function() {
  it ('Fcls: Basics', function () {
    chai.assert(eYo.Fcls)
    chai.assert(eYo.Fcls.Mngr)
    chai.assert(eYo.Fcls.Mngr.eyo)
    chai.assert(eYo.Fcls.Mngr.eyo.constructor === eYo.Driver.Dlgt)
  })
})

