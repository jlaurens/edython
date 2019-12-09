describe('Fcls driver', function() {
  it ('Fcls: Basics', function () {
    chai.assert(eYo.ns.Fcls)
    chai.assert(eYo.ns.Fcls.Mngr)
    chai.assert(eYo.ns.Fcls.Mngr.eyo)
    chai.assert(eYo.ns.Fcls.Mngr.eyo.constructor === eYo.ns.Driver.Dlgt)
  })
})

