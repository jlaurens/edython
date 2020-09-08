describe('Fcls driver', function() {
  this.timeout(20000)
  it ('Fcls: Basics', function () {
    chai.assert(eYo.fcls)
    chai.assert(eYo.fcls.Mngr)
    chai.assert(eYo.fcls.Mngr[eYo.$])
    chai.expect(eYo.fcls.Mngr[eYo.$].constructor).equal(eYo.fcls.DlgtMngr)
  })
  it ('new eYo.fcls.Mngr(…)', function () {
    let owner = {}
    let mngr = new eYo.fcls.Mngr(owner)
    chai.assert(mngr)
    chai.assert(mngr.baseDriver)
    chai.assert(mngr.drivers)
    chai.expect(() => {
      mngr.initDrivers()
    }).not.to.xthrow()
  })
})
