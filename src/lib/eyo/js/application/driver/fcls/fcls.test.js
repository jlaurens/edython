describe('Fcls driver', function() {
  this.timeout(10000)
  it ('Fcls: Basics', function () {
    chai.assert(eYo.Fcls)
    chai.assert(eYo.Fcls.Mngr)
    chai.assert(eYo.Fcls.Mngr.eyo)
    chai.assert(eYo.Fcls.Mngr.eyo.constructor === eYo.Fcls.DlgtMngr)
  })
  it ('new eYo.Fcls.Mngr(…)', function () {
    let owner = {}
    let mngr = new eYo.Fcls.Mngr(owner)
    chai.assert(mngr)
    chai.assert(mngr.allPurposeDriver)
    chai.assert(mngr.drivers)
    chai.expect(() => {
      mngr.initDrivers()
    }).not.to.throw()
  })
})
