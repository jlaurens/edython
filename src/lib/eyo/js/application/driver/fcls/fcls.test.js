describe('Fcls driver', function() {
  it ('Fcls: Basics', function () {
    chai.assert(eYo.Fcls)
    chai.assert(eYo.Fcls.Mgr)
    chai.assert(eYo.Fcls.Mgr.eyo)
    chai.assert(eYo.Fcls.Mgr.eyo.constructor === eYo.Driver.Dlgt)
  })
})


eYo.Debug.test() // remove this line when finished
