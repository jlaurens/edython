describe('Fcls driver', function() {
  it ('Fcls: Basics', function () {
    chai.assert(eYo.NS_Fcls)
    chai.assert(eYo.NS_Fcls.Mngr)
    chai.assert(eYo.NS_Fcls.Mngr.eyo)
    chai.assert(eYo.NS_Fcls.Mngr.eyo.constructor === eYo.NS_Driver.Dlgt)
  })
})

