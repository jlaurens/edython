describe('Fcls driver', function() {
  this.timeout(10000)
  it ('Fcls: Basics', function () {
    chai.assert(eYo.fcls)
    chai.assert(eYo.fcls.Mngr)
    chai.assert(eYo.fcls.Mngr.eyo)
    chai.assert(eYo.fcls.Mngr.eyo.constructor === eYo.fcls.DlgtMngr)
  })
  it ('new eYo.fcls.Mngr(…)', function () {
    let owner = {}
    let mngr = new eYo.fcls.Mngr(owner)
    chai.assert(mngr)
    chai.assert(mngr.allPurposeDriver)
    chai.assert(mngr.drivers)
    chai.expect(() => {
      mngr.initDrivers()
    }).not.to.throw()
  })
})
